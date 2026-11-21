// Run in the page 5s after a cold load (DevTools console, Runtime.evaluate with awaitPromise, or page.evaluate).
// Reads the load's buffered entries and resolves to { devServer, navigation, lcp, cls, longTasks, interactions,
// blockingScripts, media, fonts }.
// Touch nothing before running it: shifts within 500ms of an input do not count, so a click hides them.
// Run it again after Back: navigation reads "back_forward" only when the back/forward cache missed,
// and notRestoredReasons says why.
(async () => {
  const round = (value) => Math.round(value * 10) / 10;

  const describe = (el) => {
    if (!(el instanceof Element)) return null;
    const parts = [];
    let node = el;
    while (node && node !== document.body && parts.length < 3) {
      let part = node.tagName.toLowerCase();
      const name = [...node.classList]
        .map((value) => value.split("__").pop())
        .find((value) => value.length > 1);
      if (node.id) part += `#${node.id}`;
      else if (name) part += `.${name}`;
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join(" > ");
  };

  const supported = {};
  const read = (type, extra = {}) =>
    new Promise((resolve) => {
      supported[type] = Boolean(PerformanceObserver.supportedEntryTypes?.includes(type));
      if (!supported[type]) return resolve([]);
      const entries = [];
      const observer = new PerformanceObserver((list) => entries.push(...list.getEntries()));
      observer.observe({ type, buffered: true, ...extra });
      setTimeout(() => {
        entries.push(...observer.takeRecords());
        observer.disconnect();
        resolve(entries);
      }, 100);
    });

  const [paints, shifts, frames, tasks, events] = await Promise.all([
    read("largest-contentful-paint"),
    read("layout-shift"),
    read("long-animation-frame"),
    read("longtask"),
    read("event", { durationThreshold: 16 }),
  ]);

  const navigation = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const ttfb = navigation?.responseStart ?? 0;
  const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;

  // The last candidate is the largest paint. Its time splits into four parts that add up to it.
  let lcp = null;
  const largest = paints.at(-1);
  if (largest) {
    const el = largest.element;
    const resource = largest.url ? resources.find((entry) => entry.name === largest.url) : null;
    const loadStart = resource ? Math.max(ttfb, resource.requestStart || resource.startTime) : ttfb;
    const loadEnd = resource ? Math.max(loadStart, resource.responseEnd) : ttfb;
    const media = el instanceof HTMLImageElement || el instanceof HTMLVideoElement;
    lcp = {
      at: round(largest.startTime),
      element: describe(el),
      url: largest.url || null,
      size: largest.size,
      background: Boolean(largest.url) && !media,
      loading: el?.getAttribute?.("loading") ?? null,
      fetchpriority: el?.getAttribute?.("fetchpriority") ?? null,
      breakdown: {
        ttfb: round(ttfb),
        loadDelay: round(loadStart - ttfb),
        loadDuration: round(loadEnd - loadStart),
        renderDelay: round(Math.max(0, largest.startTime - loadEnd)),
      },
    };
  }

  // Shifts group into windows that end after a 1s gap or 5s in total. The largest window is the score.
  let cls = 0;
  let worst = [];
  let current = [];
  let windowValue = 0;
  let windowStart = 0;
  let previous = 0;
  for (const entry of shifts.filter((shift) => !shift.hadRecentInput)) {
    if (windowValue && (entry.startTime - previous > 1000 || entry.startTime - windowStart > 5000)) {
      windowValue = 0;
      current = [];
    }
    if (!windowValue) windowStart = entry.startTime;
    windowValue += entry.value;
    current.push(entry);
    previous = entry.startTime;
    if (windowValue > cls) {
      cls = windowValue;
      worst = [...current];
    }
  }
  const shifted = worst
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({
      at: round(entry.startTime),
      value: Math.round(entry.value * 1000) / 1000,
      sources: (entry.sources ?? []).map((source) => ({
        node: describe(source.node),
        moved: round(source.currentRect.y - source.previousRect.y),
        resized: round(source.currentRect.height - source.previousRect.height),
      })),
    }));

  // Long animation frames name their scripts. Plain long tasks are the fallback.
  const long = (frames.length ? frames : tasks)
    .filter((entry) => entry.duration > 50)
    .sort((a, b) => b.duration - a.duration)
    .map((entry) => ({
      at: round(entry.startTime),
      duration: round(entry.duration),
      beforeLcp: Boolean(largest) && entry.startTime < largest.startTime,
      scripts: (entry.scripts ?? []).map((script) => ({
        source: script.sourceURL,
        function: script.sourceFunctionName,
        invoker: script.invoker,
        duration: round(script.duration),
      })),
    }));

  const interactions = new Map();
  for (const entry of events) {
    if (!entry.interactionId) continue;
    const seen = interactions.get(entry.interactionId);
    if (!seen || entry.duration > seen.duration) interactions.set(entry.interactionId, entry);
  }

  const fold = innerHeight;
  const above = (el) => {
    const box = el.getBoundingClientRect();
    return box.bottom > 0 && box.top < fold && box.width > 0;
  };
  const images = [...document.querySelectorAll("img")];
  const videos = [...document.querySelectorAll("video")];
  const unsized = [...images, ...videos].filter(
    (el) => !(el.getAttribute("width") && el.getAttribute("height")) && getComputedStyle(el).aspectRatio === "auto",
  );
  const skipped = [...document.body.querySelectorAll("*")].filter(
    (el) => getComputedStyle(el).contentVisibility === "auto" && above(el),
  );

  // Files more than 1.5 times wider than they draw at this pixel ratio. SVG scales freely.
  const oversized = images
    .filter((el) => el.complete && el.naturalWidth && !/\.svg(\?|#|$)/i.test(el.currentSrc))
    .map((el) => ({ el, drawn: el.getBoundingClientRect().width }))
    .filter(({ el, drawn }) => drawn > 0 && el.naturalWidth > drawn * devicePixelRatio * 1.5)
    .map(({ el, drawn }) => ({
      element: describe(el),
      file: el.naturalWidth,
      needed: Math.round(drawn * devicePixelRatio),
    }));

  // Classic scripts in the head that stop the parser until they download and run.
  const blockingScripts = [...document.head.querySelectorAll("script[src]")]
    .filter((el) => !el.async && !el.defer && el.type !== "module")
    .map((el) => el.src);

  // Signs of a development server: hot reload clients and framework development overlays.
  const devServer = Boolean(
    document.querySelector(
      'script[src*="/@vite/client"], script[src*="react-refresh"], script[src*="webpack-hmr"], script[src*="turbopack"], nextjs-portal',
    ) || window.__NEXT_DATA__?.buildId === "development",
  );

  const fonts = resources
    .filter((entry) => entry.initiatorType === "css" && /\.(woff2?|ttf|otf)(\?|$)/.test(entry.name))
    .map((entry) => ({
      url: entry.name,
      loaded: round(entry.responseEnd),
      afterFirstPaint: fcp !== null && entry.responseEnd > fcp,
    }));

  return {
    url: location.href,
    devServer,
    navigation: navigation?.type ?? null,
    notRestoredReasons: navigation?.notRestoredReasons?.reasons?.map((entry) => entry.reason) ?? null,
    viewport: `${innerWidth}×${innerHeight}`,
    ttfb: round(ttfb),
    fcp: fcp === null ? null : round(fcp),
    lcp,
    cls: { value: Math.round(cls * 1000) / 1000, shifts: shifted },
    longTasks: {
      count: long.length,
      longest: long[0]?.duration ?? 0,
      over200: long.filter((task) => task.duration > 200).length,
      blocking: round(long.reduce((sum, task) => sum + task.duration - 50, 0)),
      tasks: long.slice(0, 10),
    },
    interactions: [...interactions.values()]
      .sort((a, b) => b.duration - a.duration)
      .map((entry) => ({ name: entry.name, target: describe(entry.target), duration: round(entry.duration) })),
    blockingScripts,
    media: {
      oversized,
      highPriority: images.filter((el) => el.getAttribute("fetchpriority") === "high").map(describe),
      lazyAboveFold: images.filter((el) => el.loading === "lazy" && above(el)).map(describe),
      unsized: unsized.map(describe),
      contentVisibilityAboveFold: skipped.map(describe),
    },
    fonts,
    supported,
  };
})();
