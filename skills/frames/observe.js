// Run in the page before the interaction (DevTools console, Runtime.evaluate or page.evaluate).
// Call window.__frames.start(), perform the interaction, then window.__frames.stop().
// stop() returns frame gaps, long animation frames, interaction latency and layout shift for that window.
// It also returns scrollWrites, the elements whose inline style a scroll handler wrote while recording, and
// listeners, { blocking, scroll }: every wheel or touch listener without passive and every scroll listener.
// listeners is null unless this script ran through Runtime.evaluate with includeCommandLineAPI: true.
// inputs counts pointerdown, keydown and click as { trusted, untrusted }. Only trusted input reaches interactions.
// Keep the tab visible while recording, or the browser throttles requestAnimationFrame.
// throttled reads true when over half the recording passed in frame gaps over 50ms that no blocking script
// explains, and then the frame and presentation numbers describe the browser holding the tab, not the page.
(() => {
  window.__frames?.stop();

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

  // The console's getEventListeners exists only when Runtime.evaluate runs with includeCommandLineAPI: true.
  // Captured here, it keeps working in later calls.
  const listenersOf = typeof getEventListeners === "function" ? getEventListeners : null;
  const blockingTypes = ["wheel", "mousewheel", "touchstart", "touchmove"];
  const readListeners = () => {
    if (!listenersOf) return null;
    const blocking = [];
    const scroll = [];
    const name = (target) =>
      target === window ? "window" : target === document ? "document" : target === document.body ? "body" : describe(target);
    for (const target of [window, document, ...document.querySelectorAll("*")]) {
      const all = listenersOf(target);
      for (const type of blockingTypes) {
        for (const entry of all[type] ?? []) {
          if (!entry.passive) blocking.push({ target: name(target), type, source: String(entry.listener).slice(0, 80) });
        }
      }
      for (const entry of all.scroll ?? []) scroll.push({ target: name(target), source: String(entry.listener).slice(0, 80) });
    }
    return { blocking, scroll };
  };

  let running = false;
  let startedAt = 0;
  let last = 0;
  let gaps = [];
  let longFrames = [];
  let events = [];
  let shift = 0;
  let observers = [];
  let scrollWrites = new Map();
  let styleObserver = null;
  // Event timing ignores untrusted input, so a click the tool dispatches from script never reaches interactions.
  let inputs = { trusted: 0, untrusted: 0 };
  const onInput = (event) => {
    inputs[event.isTrusted ? "trusted" : "untrusted"] += 1;
  };
  const inputTypes = ["pointerdown", "keydown", "click"];

  const tick = (now) => {
    if (!running) return;
    if (last) gaps.push(now - last);
    last = now;
    requestAnimationFrame(tick);
  };

  const observe = (type, handle, extra = {}) => {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return false;
    const observer = new PerformanceObserver((list) => list.getEntries().forEach(handle));
    observer.observe({ type, ...extra });
    observers.push({ observer, handle });
    return true;
  };

  window.__frames = {
    start() {
      running = true;
      startedAt = performance.now();
      last = 0;
      gaps = [];
      longFrames = [];
      events = [];
      shift = 0;
      observers = [];
      scrollWrites = new Map();
      inputs = { trusted: 0, untrusted: 0 };
      for (const type of inputTypes) addEventListener(type, onInput, { capture: true, passive: true });
      // Mutation callbacks run while the listener's event is still current, so window.event names a scroll handler.
      styleObserver = new MutationObserver((list) => {
        if (window.event?.type !== "scroll") return;
        for (const record of list) {
          const key = describe(record.target);
          scrollWrites.set(key, (scrollWrites.get(key) ?? 0) + 1);
        }
      });
      styleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style"], subtree: true });
      const supported = {
        longAnimationFrame: observe("long-animation-frame", (entry) => {
          const end = entry.startTime + entry.duration;
          longFrames.push({
            at: round(entry.startTime - startedAt),
            duration: round(entry.duration),
            blocking: round(entry.blockingDuration),
            // Time from the start of rendering, and of style and layout, to the end of the frame. Zero when the frame did not render.
            render: entry.renderStart ? round(end - entry.renderStart) : 0,
            styleAndLayout: entry.styleAndLayoutStart ? round(end - entry.styleAndLayoutStart) : 0,
            forcedLayout: round(
              entry.scripts.reduce((sum, script) => sum + script.forcedStyleAndLayoutDuration, 0),
            ),
            scripts: entry.scripts.map((script) => ({
              source: script.sourceURL,
              function: script.sourceFunctionName,
              invoker: script.invoker,
              invokerType: script.invokerType,
              duration: round(script.duration),
              forcedLayout: round(script.forcedStyleAndLayoutDuration),
            })),
          });
        }),
        event: observe("event", (entry) => {
          if (!entry.interactionId) return;
          events.push({
            id: entry.interactionId,
            name: entry.name,
            target: describe(entry.target),
            duration: entry.duration,
            inputDelay: entry.processingStart - entry.startTime,
            processing: entry.processingEnd - entry.processingStart,
            presentation: entry.startTime + entry.duration - entry.processingEnd,
          });
        }, { durationThreshold: 16 }),
        layoutShift: observe("layout-shift", (entry) => {
          if (!entry.hadRecentInput) shift += entry.value;
        }),
        listeners: Boolean(listenersOf),
      };
      requestAnimationFrame(tick);
      return supported;
    },

    stop() {
      if (!running) return null;
      running = false;
      for (const { observer, handle } of observers) {
        observer.takeRecords().forEach(handle);
        observer.disconnect();
      }
      styleObserver.disconnect();
      for (const type of inputTypes) removeEventListener(type, onInput, { capture: true });

      const sorted = [...gaps].sort((a, b) => a - b);
      const frame = sorted[Math.floor(sorted.length / 2)] ?? 1000 / 60;
      const dropped = gaps.reduce((count, gap) => count + Math.max(0, Math.round(gap / frame) - 1), 0);

      const interactions = new Map();
      for (const event of events) {
        const current = interactions.get(event.id);
        if (!current || event.duration > current.duration) interactions.set(event.id, event);
      }
      const slowest = [...interactions.values()]
        .sort((a, b) => b.duration - a.duration)
        .map(({ id, ...event }) => ({
          ...event,
          duration: round(event.duration),
          inputDelay: round(event.inputDelay),
          processing: round(event.processing),
          presentation: round(event.presentation),
        }));

      // A hidden or occluded tab can still report visibilityState "visible" while frames slow to a few a second.
      // Frames that slow with no blocking script to explain it mean the browser held them, not the page.
      const recorded = performance.now() - startedAt;
      const blockingTime = longFrames.reduce((sum, entry) => sum + entry.blocking, 0);
      const slowTime = gaps.filter((gap) => gap > 50).reduce((sum, gap) => sum + gap, 0);
      const throttled = slowTime - blockingTime > recorded / 2;

      return {
        recorded: round(recorded),
        throttled,
        refresh: Math.round(1000 / frame),
        budget: round(frame),
        frames: gaps.length,
        dropped,
        worstGap: round(sorted.at(-1) ?? 0),
        longAnimationFrames: longFrames.sort((a, b) => b.duration - a.duration),
        interactions: slowest,
        inputs,
        layoutShift: Math.round(shift * 1000) / 1000,
        scrollWrites: [...scrollWrites].map(([element, writes]) => ({ element, writes })).sort((a, b) => b.writes - a.writes),
        listeners: readListeners(),
      };
    },
  };

  return `Recorder ready, listener checks ${listenersOf ? "on" : "off: evaluate with includeCommandLineAPI: true to turn them on"}. Call window.__frames.start(), perform the interaction, then window.__frames.stop().`;
})();
