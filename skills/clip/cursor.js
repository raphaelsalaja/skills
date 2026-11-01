/*
  Clip helper. Load it as an init script so it runs before the app's own code, in every page the driver opens.

    await context.addInitScript({ path: "<skills>/clip/cursor.js" });

  It does nothing until the driver calls start(). Every method lives on window.__clip.

    start(options)      Hides scrollbars, dev badges and the prototype switcher bar, then draws the cursor.
                        Returns { errors }, the error overlays on screen. Any error means the app is broken: stop and report it.
                        options: { cursor: true, scale: 1, track: false }. `scale` sizes the drawn cursor.
                        `track` also logs every pointer move, for a live take whose cursor the recorder draws afterwards.
    events()            Every press and focus since start(), and every move when tracking, as { type, t, x, y }.
                        `t` is epoch milliseconds, the clock the screencast stamps its frames with. `x` and `y` are CSS pixels.
    now()               The same epoch clock, unaffected by rate().
    mark(x, y)          Logs a focus point the zoom should visit, such as a toast that appears where nothing was pressed.
    rate(value)         Plays the page at `value` speed: requestAnimationFrame, performance.now, Date.now, timers and every CSS and Web Animation.
                        Call rate(0.25) before the slow pass and rate(1) after it. Multiply every driver duration by 1 / value to match.
    note(target, lines) Pins one note per line beside an element and follows it, for the timing values in --slow. Returns a remove function.
    badge(text)         Shows one short badge in the top-right corner, such as "0.25×". badge("") removes it.
    stop()              Removes the cursor, the notes and the badge, and restores the scrollbars.
    arrow               The cursor's SVG markup, which the recorder draws over live takes. Its tip sits at 5.5, 3.2.
    pageStyle           The CSS start() adds to the page, hiding scrollbars and dev badges. Studio puts it in a reload
                        frame's head before the frame's own app has hydrated.

  The cursor follows the real pointer, so every hover and press on screen is the app's own. Move the real mouse along an eased path
  in small steps. A cursor that jumps means the driver teleported the mouse.

  Clock rate covers code that reads time through the patched globals. A library that captured its own reference to
  performance.now before this script ran keeps real time, which is why it loads as an init script.
*/

(() => {
  if (window.__clip) return;

  const real = {
    now: performance.now.bind(performance),
    date: Date.now,
    raf: window.requestAnimationFrame.bind(window),
    setTimeout: window.setTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
  };
  const dateOrigin = real.date() - real.now();

  let rate = 1;
  let realBase = 0;
  let virtualBase = 0;
  const virtual = (value) => virtualBase + (value - realBase) * rate;

  performance.now = () => virtual(real.now());
  Date.now = () => Math.round(dateOrigin + virtual(real.now()));
  window.requestAnimationFrame = (callback) => real.raf((timestamp) => callback(virtual(timestamp)));
  window.setTimeout = (handler, delay = 0, ...rest) => real.setTimeout(handler, delay / rate, ...rest);
  window.setInterval = (handler, delay = 0, ...rest) => real.setInterval(handler, delay / rate, ...rest);

  const authored = new WeakMap();
  const scaleAnimations = () => {
    for (const animation of document.getAnimations()) {
      if (!authored.has(animation)) authored.set(animation, animation.playbackRate);
      const target = authored.get(animation) * rate;
      if (animation.playbackRate !== target) animation.playbackRate = target;
    }
  };
  let scaling = false;
  const scaleLoop = () => {
    scaleAnimations();
    if (rate !== 1) real.raf(scaleLoop);
    else scaling = false;
  };

  const epoch = () => performance.timeOrigin + real.now();

  const overlays = [
    "nextjs-portal",
    "#__next-build-watcher",
    "[data-next-badge-root]",
    "astro-dev-toolbar",
    "vercel-live-feedback",
    "#vercel-live-feedback",
    "#nuxt-devtools-container",
    ".nuxt-devtools-frame",
    ".tsqd-parent-container",
    ".TanStackRouterDevtools",
    "#svelte-inspector-host",
  ];

  const findErrors = () => {
    const errors = [];
    if (document.querySelector("vite-error-overlay")) errors.push("Vite error overlay");
    for (const portal of document.querySelectorAll("nextjs-portal")) {
      if (portal.shadowRoot?.querySelector("[data-nextjs-dialog], [data-nextjs-dialog-overlay]")) {
        errors.push("Next.js error overlay");
      }
    }
    if (document.querySelector("#webpack-dev-server-client-overlay")) errors.push("webpack error overlay");
    return errors;
  };

  const pageStyle = `
    html, body, * { scrollbar-width: none !important; }
    *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    ${overlays.join(", ")} { display: none !important; }
  `;

  const hostStyle = `
    :host { all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; color-scheme: inherit; }
    .cursor {
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      transform: translate3d(var(--x, -100px), var(--y, -100px), 0);
      will-change: transform;
    }
    .cursor svg {
      display: block;
      transform-origin: 5.5px 3.2px;
      transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
      filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.3));
    }
    .cursor[data-pressed] svg { transform: scale(0.95); }
    .cursor[hidden] { display: none; }
    .note, .badge {
      position: absolute;
      font: 500 14px/20px system-ui, -apple-system, sans-serif;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      padding: 4px 10px;
      border-radius: 8px;
      background: Canvas;
      color: CanvasText;
      box-shadow: 0 0 0 1px color-mix(in srgb, CanvasText 12%, transparent), 0 4px 12px rgb(0 0 0 / 0.08);
    }
    .note { top: 0; left: 0; }
    .badge { top: 16px; right: 16px; }
  `;

  const arrow = `
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 3.2v15.6l4.1-3.9 2.6 6.1 2.8-1.2-2.6-6h5.8z" fill="#000" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
  `;

  let host = null;
  let root = null;
  let cursor = null;
  let style = null;
  let badgeNode = null;
  let log = [];
  let tracking = false;
  const notes = new Set();
  const switcherStyles = [];

  const onMove = (event) => {
    if (tracking) log.push({ type: "move", t: epoch(), x: event.clientX, y: event.clientY });
    cursor.hidden = false;
    cursor.style.setProperty("--x", `${event.clientX - 5.5}px`);
    cursor.style.setProperty("--y", `${event.clientY - 3.2}px`);
  };
  const onDown = (event) => {
    cursor.toggleAttribute("data-pressed", true);
    log.push({ type: "down", t: epoch(), x: event.clientX, y: event.clientY });
  };
  const onUp = (event) => {
    cursor.removeAttribute("data-pressed");
    log.push({ type: "up", t: epoch(), x: event.clientX, y: event.clientY });
  };
  const onFocus = (event) => {
    if (!(event.target instanceof Element) || event.target === document.body) return;
    const rect = event.target.getBoundingClientRect();
    log.push({ type: "focus", t: epoch(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const hideSwitcherBars = () => {
    for (const switcher of document.querySelectorAll("prototype-switcher")) {
      const shadow = switcher.shadowRoot;
      if (!shadow || shadow.querySelector("style[data-clip]")) continue;
      const node = document.createElement("style");
      node.dataset.clip = "";
      node.textContent = ".bar { display: none !important; }";
      shadow.append(node);
      switcherStyles.push(node);
    }
  };

  const place = (node, target, index) => {
    const element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.right + 12;
    const y = rect.top + index * 32;
    const fits = x + node.offsetWidth < window.innerWidth - 8;
    node.style.transform = `translate3d(${fits ? x : rect.left - 12 - node.offsetWidth}px, ${y}px, 0)`;
  };

  const follow = () => {
    if (!notes.size) return;
    for (const entry of notes) entry.nodes.forEach((node, index) => place(node, entry.target, index));
    real.raf(follow);
  };

  window.__clip = {
    arrow,
    pageStyle,

    start({ cursor: drawn = true, scale = 1, track = false } = {}) {
      if (host) this.stop();
      tracking = track;
      style = document.createElement("style");
      style.textContent = pageStyle;
      document.head.append(style);
      hideSwitcherBars();

      host = document.createElement("clip-overlay");
      root = host.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${hostStyle}</style><div class="cursor" hidden>${arrow}</div>`;
      cursor = root.querySelector(".cursor");
      cursor.querySelector("svg").style.scale = String(scale);
      if (!drawn) cursor.style.display = "none";
      document.documentElement.append(host);

      log = [];
      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("focusin", onFocus, true);
      return { errors: findErrors() };
    },

    events() {
      return log.slice();
    },

    now() {
      return epoch();
    },

    mark(x, y) {
      log.push({ type: "mark", t: epoch(), x, y });
    },

    rate(value) {
      const now = real.now();
      virtualBase = virtual(now);
      realBase = now;
      rate = value;
      scaleAnimations();
      if (rate !== 1 && !scaling) {
        scaling = true;
        real.raf(scaleLoop);
      }
    },

    note(target, lines) {
      const entry = { target, nodes: [] };
      for (const line of [].concat(lines)) {
        const node = document.createElement("div");
        node.className = "note";
        node.textContent = line;
        root.append(node);
        entry.nodes.push(node);
      }
      const first = notes.size === 0;
      notes.add(entry);
      entry.nodes.forEach((node, index) => place(node, target, index));
      if (first) real.raf(follow);
      return () => {
        entry.nodes.forEach((node) => node.remove());
        notes.delete(entry);
      };
    },

    badge(text) {
      badgeNode?.remove();
      badgeNode = null;
      if (!text) return;
      badgeNode = document.createElement("div");
      badgeNode.className = "badge";
      badgeNode.textContent = text;
      root.append(badgeNode);
    },

    stop() {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("focusin", onFocus, true);
      for (const entry of notes) entry.nodes.forEach((node) => node.remove());
      notes.clear();
      switcherStyles.splice(0).forEach((node) => node.remove());
      style?.remove();
      host?.remove();
      host = root = cursor = style = badgeNode = null;
    },
  };
})();
