/*
  Clip studio. A toolbar injected into the running app that frames a shot and records a live take in the user's own tab.
  Load cursor.js and then this file once, in development only. Remove both and their import when the clip is done.

  Plain HTML, Svelte and Astro: load them with <script src="cursor.js"></script><script src="studio.js"></script>.

  React: import both once from a "use client" file rendered in the root layout. In Next.js that is any client component.

    "use client";
    import { useEffect } from "react";

    export function ClipStudio() {
      useEffect(() => {
        if (process.env.NODE_ENV === "development") import("./cursor.js").then(() => import("./studio.js"));
      }, []);
      return null;
    }

  It mounts itself once the page has loaded and gone idle, after a framework has hydrated. It never mounts under automation,
  which sets navigator.webdriver, so scripted takes stay clean.

    Page      Frames the whole viewport, cut to the ratio.
    Element   Click an element to frame it with padding. ↑ and ↓ walk to the parent and back. Escape cancels.
              Dragging instead of clicking draws an area.
    Area      A box with eight handles. Drag a handle to resize it, drag its tag to move it or type its size and position.
    Ratio     The frame's shape. Free keeps the element's or the area's own.
    Cursor    Draws the smoothed cursor into the take, or leaves it out.
    Guides    Thirds and centre lines over the frame. They hide while recording.
    Copy      Copies the frame and style as one line, `Clip frame: {...}`, for the scripted recorder.
    Record    Records the frame in this tab as a live take. Chrome and Edge only. The tab is captured without a cursor and every
              pointer move is logged, so the recorder draws a smoothed cursor afterwards and eases it home to close the loop.
              ⌥⇧R starts and stops it, so the pointer never leaves the frame to reach a button.
    Settings  When recording starts, padding around an element, the white margin, corner radius, shadow, cursor size,
              click zoom and page zoom.
    Start     Now records the page as it is. On Reload loads the page fresh in a frame over this one once recording starts,
              so the take opens on the first paint and its entrance. A reload of the tab itself would end the capture.

  A finished take posts to the receiver that `node clips/.work/record.mjs receive` runs on port 4917, set another with
  window.__clipReceiver. With no receiver running, the take and its JSON download instead. Settings persist per path.
*/

if (typeof window !== "undefined" && !navigator.webdriver && !window.frameElement?.hasAttribute("data-clip-reload") && !customElements.get("clip-studio")) {
  const RATIOS = [
    ["16:9", "16x9", 16 / 9],
    ["1:1", "1x1", 1],
    ["4:5", "4x5", 4 / 5],
    ["9:16", "9x16", 9 / 16],
    ["4:3", "4x3", 4 / 3],
    ["Free", "free", 0],
  ];
  const OPTIONS = {
    start: [["Now", "now"], ["On Reload", "reload"]],
    padding: [0, 16, 32, 64, 96].map((value) => [String(value), value]),
    margin: [0, 32, 64, 96, 128].map((value) => [String(value), value]),
    radius: [0, 8, 12, 16, 24].map((value) => [String(value), value]),
    shadow: [["None", "none"], ["Soft", "soft"], ["Deep", "deep"]],
    cursorScale: [["1×", 1], ["1.5×", 1.5], ["2×", 2]],
    clickZoom: [["Off", 1], ["1.1×", 1.1], ["1.15×", 1.15], ["1.25×", 1.25]],
    pageZoom: [["100%", 1], ["110%", 1.1], ["125%", 1.25], ["150%", 1.5]],
  };
  const GROUPS = [
    ["Start", "start"],
    ["Padding", "padding"],
    ["Margin", "margin"],
    ["Radius", "radius"],
    ["Shadow", "shadow"],
    ["Cursor Size", "cursorScale"],
    ["Click Zoom", "clickZoom"],
    ["Page Zoom", "pageZoom"],
  ];
  const DEFAULTS = {
    target: null,
    rect: null,
    ratio: "16x9",
    start: "now",
    padding: 32,
    margin: 0,
    radius: 16,
    shadow: "soft",
    cursor: true,
    cursorScale: 1,
    clickZoom: 1.15,
    pageZoom: 1,
    guides: false,
  };
  const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  const MIN = 40;
  const KEY = `clip-studio:${location.pathname}`;
  const epoch = () => window.__clip?.now() ?? performance.timeOrigin + performance.now();
  const frameTwice = () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

  const css = `
    :host { all: initial; position: fixed; inset: 0; z-index: 2147483646; pointer-events: none; color-scheme: inherit; }
    .ui {
      --surface: #1a1a1a;
      --text: rgb(255 255 255 / 0.9);
      --text-icon: rgb(255 255 255 / 0.85);
      --text-tile: rgb(170 170 170);
      --text-off: rgb(161 161 161);
      --text-label: rgb(255 255 255 / 0.6);
      --text-muted: rgb(255 255 255 / 0.5);
      --fill-hover: rgb(255 255 255 / 0.12);
      --fill-chip: rgb(255 255 255 / 0.06);
      --hairline: rgb(255 255 255 / 0.08);
      --divider: rgb(255 255 255 / 0.1);
      --accent: #5c5aed;
      --record: #e5484d;
      --highlight: inset 0 -0.5px 0 0.3px rgb(0 0 0 / 0.15);
      --shadow-bar: 0 2px 8px rgb(0 0 0 / 0.2), 0 4px 16px rgb(0 0 0 / 0.1);
      --shadow-panel: 0 4px 20px rgb(0 0 0 / 0.3), 0 0 0 1px var(--hairline);
      --shadow-tip: 0 2px 8px rgb(0 0 0 / 0.3);
      --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
      --ease-panel: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      font: 500 13px/20px Inter, system-ui, -apple-system, sans-serif;
      letter-spacing: -0.12px;
      -webkit-font-smoothing: antialiased;
      color: var(--text);
    }
    .ui *, .ui *::before, .ui *::after { box-sizing: border-box; margin: 0; padding: 0; border: 0; font: inherit; color: inherit; }
    button, select { cursor: pointer; user-select: none; background: none; }
    button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    [hidden] { display: none !important; }

    .frame {
      position: fixed;
      top: 0;
      left: 0;
      box-shadow: 0 0 0 100vmax rgb(23 19 19 / 0.5);
      outline: 1px solid rgb(255 255 255 / 0.9);
      outline-offset: -1px;
    }
    .size {
      position: absolute;
      top: -28px;
      left: 0;
      display: flex;
      gap: 6px;
      height: 22px;
      padding: 0 8px;
      align-items: center;
      border-radius: 6px;
      background: var(--surface);
      box-shadow: var(--shadow-tip);
      color: var(--text);
      font: 500 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .size .dim { color: var(--text-muted); }
    .ui[data-mode="area"] .frame .size { pointer-events: auto; cursor: grab; touch-action: none; }
    .ui[data-mode="area"] .frame .size:active { cursor: grabbing; }
    .guides { position: absolute; inset: 0; overflow: hidden; }
    .guides i { position: absolute; --dash: rgb(255 255 255 / 0.9) 0 4px, rgb(0 0 0 / 0.4) 4px 8px; }
    .guides .centre { --dash: var(--accent) 0 4px, transparent 4px 8px; }
    .guides .v { top: 0; bottom: 0; width: 1px; background: repeating-linear-gradient(to bottom, var(--dash)); }
    .guides .h { left: 0; right: 0; height: 1px; background: repeating-linear-gradient(to right, var(--dash)); }
    .handle {
      position: absolute;
      width: 10px;
      height: 10px;
      margin: -5px 0 0 -5px;
      pointer-events: auto;
      touch-action: none;
      background: #111;
      border: 1px solid #fff;
      border-radius: 50%;
    }
    .handle::after { position: absolute; inset: -8px; content: ""; }
    .handle[data-handle="nw"], .handle[data-handle="se"] { cursor: nwse-resize; }
    .handle[data-handle="ne"], .handle[data-handle="sw"] { cursor: nesw-resize; }
    .handle[data-handle="n"], .handle[data-handle="s"] { cursor: ns-resize; }
    .handle[data-handle="e"], .handle[data-handle="w"] { cursor: ew-resize; }
    .handle[data-handle*="n"] { top: 0; }
    .handle[data-handle*="s"] { top: 100%; }
    .handle[data-handle="e"], .handle[data-handle="w"] { top: 50%; }
    .handle[data-handle*="w"] { left: 0; }
    .handle[data-handle*="e"] { left: 100%; }
    .handle[data-handle="n"], .handle[data-handle="s"] { left: 50%; }
    .picker { position: fixed; inset: 0; pointer-events: auto; cursor: crosshair; }
    .hover {
      position: fixed;
      top: 0;
      left: 0;
      background: rgb(92 90 237 / 0.08);
      outline: 1.5px solid var(--accent);
      border-radius: 2px;
    }

    .area {
      position: fixed;
      top: 0;
      left: 0;
      display: grid;
      grid-template-columns: auto 64px 10px 64px auto;
      gap: 8px 6px;
      align-items: center;
      padding: 12px 14px 12px 16px;
      pointer-events: auto;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: var(--shadow-panel);
    }
    .area .label { margin: 0 6px 0 0; }
    .area .unit { color: var(--text-muted); font-weight: 400; text-align: center; }
    .area input {
      width: 64px;
      height: 28px;
      padding: 0 8px;
      text-align: center;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
      color: #fff;
      background: var(--fill-chip);
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px var(--hairline);
      appearance: textfield;
      transition: box-shadow 150ms;
    }
    .area input::-webkit-inner-spin-button, .area input::-webkit-outer-spin-button { appearance: none; }
    .area input:focus { outline: none; box-shadow: inset 0 0 0 1px var(--accent); }

    .bar {
      position: fixed;
      inset: auto 0 calc(16px + env(safe-area-inset-bottom));
      display: flex;
      gap: 4px;
      align-items: center;
      width: max-content;
      height: 56px;
      padding: 5px;
      margin: 0 auto;
      pointer-events: auto;
      background: var(--surface);
      border-radius: 16px;
      box-shadow: var(--shadow-bar);
    }
    .bar > * { flex: none; }
    .divider { width: 1px; height: 36px; margin: 0 4px; background: var(--divider); }
    .button, .tile, .toggle, .ratio, .settings {
      position: relative;
      color: var(--text-icon);
      transition: background-color 150ms, color 150ms, transform 100ms var(--ease-out);
    }
    .button:active, .tile:active, .toggle:active, .settings:active { transform: scale(0.94); }
    @media (hover: hover) {
      .button:hover, .tile:hover, .toggle:hover, .ratio:hover, .settings:hover { color: #fff; background-color: var(--fill-hover); }
    }
    .button { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; }
    .button[aria-pressed="true"], .settings[aria-expanded="true"] { color: #fff; background-color: var(--fill-hover); }
    .close .disc { display: grid; place-items: center; width: 20px; height: 20px; color: var(--surface); background: #fff; border-radius: 50%; }
    .record .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--record); box-shadow: var(--highlight); }
    .tile {
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 46px;
      color: var(--text-tile);
      border-radius: 10px;
    }
    .tile svg { color: var(--text-icon); }
    .tile span { font-size: 10px; line-height: 12px; letter-spacing: 0; }
    .tile[aria-pressed="true"] { color: #fff; background-color: var(--fill-hover); }
    .tile[aria-pressed="true"] svg { color: #fff; }
    .toggle, .ratio, .settings { display: flex; gap: 6px; align-items: center; height: 34px; border-radius: 17px; }
    .toggle { min-width: 112px; padding: 0 12px 0 9px; }
    .toggle[aria-pressed="false"] { color: var(--text-off); }
    .ratio {
      padding: 0 28px 0 12px;
      color-scheme: dark;
      font-variant-numeric: tabular-nums;
      appearance: none;
      background: no-repeat right 10px center / 12px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23999' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
    }
    .settings { gap: 2px; padding: 0 8px 0 9px; }
    .settings .chevron { color: var(--text-muted); }

    .tip {
      position: absolute;
      bottom: calc(100% + 16px);
      left: 50%;
      display: flex;
      gap: 6px;
      padding: 6px 10px;
      translate: -50% 0;
      white-space: nowrap;
      pointer-events: none;
      color: var(--text);
      font-size: 12px;
      line-height: 18px;
      background: var(--surface);
      border-radius: 8px;
      box-shadow: var(--shadow-tip);
      opacity: 0;
      transform: translateY(2px);
      transition: opacity 135ms var(--ease-out), transform 135ms var(--ease-out);
    }
    .tip::after {
      position: absolute;
      top: 100%;
      left: 50%;
      width: 10px;
      height: 5px;
      translate: -50% 0;
      background: var(--surface);
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      content: "";
    }
    .tip kbd { color: var(--text-muted); }
    @media (hover: hover) {
      :is(.button, .settings):hover .tip { opacity: 1; transform: none; transition-delay: 850ms; }
      .bar[data-warm] :is(.button, .settings):hover .tip { transition-delay: 0ms; }
    }
    :is(.button, .settings):focus-visible .tip { opacity: 1; transform: none; }
    .ui[data-open] .tip { display: none; }

    .panel {
      position: fixed;
      bottom: calc(84px + env(safe-area-inset-bottom));
      left: 50%;
      width: 300px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 108px);
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: none;
      padding: 12px 16px;
      pointer-events: auto;
      translate: -50% 0;
      background: var(--surface);
      border-radius: 16px;
      box-shadow: var(--shadow-panel);
      animation: rise 160ms var(--ease-panel);
    }
    @keyframes rise { from { opacity: 0; transform: translateY(4px) scale(0.98); filter: blur(2px); } }
    .header { display: flex; justify-content: space-between; padding-bottom: 10px; color: rgb(187 187 187); }
    .header .dim { color: var(--text-muted); font-variant-numeric: tabular-nums; letter-spacing: 0; }
    .group { padding: 10px 0; border-top: 1px solid var(--hairline); }
    .group:last-child { padding-bottom: 2px; }
    .label { margin-bottom: 6px; color: var(--text-label); font-weight: 400; letter-spacing: -0.15px; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .chip {
      min-width: 38px;
      height: 26px;
      padding: 0 9px;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
      color: var(--text-label);
      background: var(--fill-chip);
      border-radius: 13px;
      transition: background-color 150ms, color 150ms, transform 100ms var(--ease-out);
    }
    .chip:active { transform: scale(0.95); }
    @media (hover: hover) { .chip:hover { color: #fff; background: var(--fill-hover); } }
    .chip[aria-pressed="true"] { color: #fff; background: var(--accent); box-shadow: var(--highlight); }

    .pill {
      position: fixed;
      display: flex;
      gap: 8px;
      align-items: center;
      height: 36px;
      padding: 0 14px 0 12px;
      pointer-events: auto;
      color: var(--text);
      background: var(--surface);
      border-radius: 18px;
      font-variant-numeric: tabular-nums;
      box-shadow: var(--shadow-bar);
      transition: transform 100ms var(--ease-out);
    }
    .pill:active { transform: scale(0.96); }
    .pill .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--record); animation: pulse 1.6s ease-in-out infinite; }
    .pill .elapsed { color: var(--text-muted); }
    @keyframes pulse { 50% { opacity: 0.4; } }
    @media (prefers-reduced-motion: reduce) { .pill .dot, .panel { animation: none; } }
    .toast {
      position: fixed;
      bottom: calc(84px + env(safe-area-inset-bottom));
      left: 50%;
      padding: 6px 10px;
      translate: -50% 0;
      font-size: 12px;
      line-height: 18px;
      background: var(--surface);
      border-radius: 8px;
      box-shadow: var(--shadow-tip);
      opacity: 0;
      transition: opacity 150ms var(--ease-out);
    }
    .toast[data-show] { opacity: 1; transition-duration: 200ms; }
    .ui[data-recording] :is(.frame, .bar, .panel, .area, .toast) { display: none; }
  `;

  const icon = (paths, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${size > 14 ? 1.33 : 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const tip = (label, shortcut = "") => `<span class="tip" aria-hidden="true">${label}${shortcut ? `<kbd>${shortcut}</kbd>` : ""}</span>`;
  const button = (action, label, content, state = "", shortcut = "") =>
    `<button class="button ${action}" data-action="${action}" aria-label="${label}"${state}>${content}${tip(label, shortcut)}</button>`;
  const tile = (action, label, content) =>
    `<button class="tile" data-action="${action}" aria-pressed="false">${content}<span>${label}</span></button>`;
  const ICONS = {
    page: icon('<rect x="1.5" y="2.5" width="13" height="11" rx="1.5" /><path d="M1.5 5.5h13M3.75 4h.01M5.25 4h.01" />', 20),
    element: icon('<path d="M13.5 6.5v-3a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" /><path d="M8.5 8.5l2.4 6 .9-2.7 2.7-.9z" />', 20),
    area: icon('<path d="M2.5 5V3.5a1 1 0 0 1 1-1H5M7 2.5h2M11 2.5h1.5a1 1 0 0 1 1 1V5M13.5 7v2M13.5 11v1.5a1 1 0 0 1-1 1H11M9 13.5H7M5 13.5H3.5a1 1 0 0 1-1-1V11M2.5 9V7" />', 20),
    cursor: icon('<path d="M3.5 2.5l3.6 10 1.5-4.3 4.3-1.5z" />'),
    noCursor: icon('<path d="M3.5 2.5l3.6 10 1.5-4.3 4.3-1.5zM2 14L14 2" />'),
    guides: icon('<rect x="2.5" y="2.5" width="11" height="11" rx="1.5" /><path d="M6.2 2.5v11M9.8 2.5v11M2.5 6.2h11M2.5 9.8h11" />'),
    copy: icon('<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />'),
    close: icon('<path d="M5 5l6 6M11 5l-6 6" />', 12),
    gear: icon('<circle cx="8" cy="8" r="2" /><path d="M6.9 1.5h2.2l.4 1.8 1.3.7 1.7-.6 1.1 1.9-1.3 1.3v1.6l1.3 1.3-1.1 1.9-1.7-.6-1.3.7-.4 1.8H6.9l-.4-1.8-1.3-.7-1.7.6-1.1-1.9 1.3-1.3V7.2L2.4 5.9l1.1-1.9 1.7.6 1.3-.7z" />'),
    chevron: icon('<path d="M4 6l4 4 4-4" />', 12),
  };

  const shortName = (element) => {
    if (!element) return "";
    if (element.id) return `${element.localName}#${element.id}`;
    const name = [...element.classList].find((value) => /^[a-z][\w-]{0,24}$/i.test(value));
    return name ? `${element.localName}.${name}` : element.localName;
  };
  const setTag = (node, name, size) => {
    const text = `${name}|${size}`;
    if (node.dataset.text === text) return;
    node.dataset.text = text;
    node.replaceChildren(...[name, size].filter(Boolean).map((value, index) => {
      const span = document.createElement("span");
      span.textContent = value;
      if (index) span.className = "dim";
      return span;
    }));
  };
  const place = (node, rect) =>
    Object.assign(node.style, { transform: `translate(${rect.x}px, ${rect.y}px)`, width: `${rect.width}px`, height: `${rect.height}px` });

  const selectorFor = (element) => {
    const unique = (selector) => {
      try {
        return document.querySelectorAll(selector).length === 1;
      } catch {
        return false;
      }
    };
    if (element.id && unique(`#${CSS.escape(element.id)}`)) return `#${CSS.escape(element.id)}`;
    for (const name of ["data-testid", "data-test", "data-slot", "aria-label", "name"]) {
      const value = element.getAttribute(name);
      const selector = value && `${element.localName}[${name}="${value.replace(/"/g, '\\"')}"]`;
      if (selector && unique(selector)) return selector;
    }
    const parts = [];
    let node = element;
    while (node && node !== document.documentElement) {
      let part = node.localName;
      const parent = node.parentElement;
      const same = parent ? [...parent.children].filter((child) => child.localName === node.localName) : [];
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
      parts.unshift(part);
      if (unique(parts.join(" > "))) break;
      node = parent;
    }
    return parts.join(" > ");
  };

  class ClipStudio extends HTMLElement {
    #root = this.attachShadow({ mode: "open" });
    #state = { ...DEFAULTS };
    #ui;
    #frame;
    #panel;
    #area;
    #picker;
    #hover;
    #pill;
    #toast;
    #target = document.createElement("clip-frame-target");
    #rect = null;
    #open = false;
    #picking = null;
    #take = null;
    #zoom = "";
    #raf = 0;

    connectedCallback() {
      try {
        Object.assign(this.#state, JSON.parse(localStorage.getItem(KEY) ?? "{}"));
      } catch {}
      this.#root.innerHTML = `
        <style>${css}</style>
        <div class="ui">
          <div class="frame" hidden>
            <span class="size"></span>
            <div class="guides" hidden>
              <i class="v" style="left: 33.333%"></i><i class="v" style="left: 66.666%"></i><i class="v centre" style="left: 50%"></i>
              <i class="h" style="top: 33.333%"></i><i class="h" style="top: 66.666%"></i><i class="h centre" style="top: 50%"></i>
            </div>
            <div class="handles" hidden>${HANDLES.map((name) => `<span class="handle" data-handle="${name}"></span>`).join("")}</div>
          </div>
          <div class="picker" hidden></div>
          <div class="hover" hidden><span class="size"></span></div>
          <div class="panel" role="dialog" aria-label="Settings" hidden></div>
          <form class="area" aria-label="Frame Size" hidden>
            <span class="label">Size</span>
            <input type="number" name="width" aria-label="Width" min="${MIN}">
            <span class="unit">×</span>
            <input type="number" name="height" aria-label="Height" min="${MIN}">
            <span class="unit">px</span>
            <span class="label">Position</span>
            <input type="number" name="x" aria-label="X" min="0">
            <span></span>
            <input type="number" name="y" aria-label="Y" min="0">
            <span class="unit">px</span>
          </form>
          <nav class="bar" aria-label="Clip Studio">
            ${button("close", "Close", `<span class="disc">${ICONS.close}</span>`)}
            <span class="divider" aria-hidden="true"></span>
            ${tile("page", "Page", ICONS.page)}
            ${tile("element", "Element", ICONS.element)}
            ${tile("area", "Area", ICONS.area)}
            <span class="divider" aria-hidden="true"></span>
            <select class="ratio" aria-label="Ratio">${RATIOS.map(([label, value]) => `<option value="${value}">${label}</option>`).join("")}</select>
            <button class="toggle" data-action="cursor" aria-pressed="true"></button>
            <span class="divider" aria-hidden="true"></span>
            ${button("guides", "Guides", ICONS.guides, ' aria-pressed="false"')}
            ${button("copy", "Copy Frame", ICONS.copy)}
            ${button("record", "Record", '<span class="dot" aria-hidden="true"></span>', "", "⌥⇧R")}
            <span class="divider" aria-hidden="true"></span>
            <button class="settings" data-action="settings" aria-label="Settings" aria-expanded="false">${ICONS.gear}<span class="chevron">${ICONS.chevron}</span>${tip("Settings")}</button>
          </nav>
          <button class="pill" data-action="record" aria-label="Stop Recording" hidden><span class="dot" aria-hidden="true"></span>Stop<span class="elapsed">0:00</span></button>
          <output class="toast" aria-live="polite"></output>
        </div>`;
      this.#ui = this.#root.querySelector(".ui");
      this.#frame = this.#root.querySelector(".frame");
      this.#panel = this.#root.querySelector(".panel");
      this.#area = this.#root.querySelector(".area");
      this.#picker = this.#root.querySelector(".picker");
      this.#hover = this.#root.querySelector(".hover");
      this.#pill = this.#root.querySelector(".pill");
      this.#toast = this.#root.querySelector(".toast");
      Object.assign(this.#target.style, { position: "fixed", pointerEvents: "none", zIndex: "-1", top: "0", left: "0" });
      document.documentElement.append(this.#target);

      this.#root.addEventListener("click", (event) => this.#onClick(event));
      this.#root.addEventListener("pointerdown", (event) => this.#onDrag(event));
      this.#root.querySelector(".ratio").addEventListener("change", (event) => this.#setRatio(event.target.value));
      this.#area.addEventListener("input", (event) => this.#onField(event.target));
      this.#area.addEventListener("submit", (event) => event.preventDefault());
      const bar = this.#root.querySelector(".bar");
      let warming = 0;
      bar.addEventListener("pointerover", (event) => {
        if (!event.target.closest(".button, .settings") || bar.hasAttribute("data-warm")) return;
        clearTimeout(warming);
        warming = setTimeout(() => bar.toggleAttribute("data-warm", true), 850);
      });
      bar.addEventListener("pointerleave", () => {
        clearTimeout(warming);
        bar.removeAttribute("data-warm");
      });
      this.#picker.addEventListener("pointermove", (event) => this.#onPickMove(event));
      this.#picker.addEventListener("pointerdown", (event) => this.#onPickDown(event));
      this.#picker.addEventListener("pointerup", (event) => this.#onPickUp(event));
      window.addEventListener("keydown", this.#onKey, true);
      document.addEventListener("pointerdown", this.#onOutside, true);

      this.#zoom = document.body.style.zoom;
      this.#applyZoom();
      this.#sync();
      const tick = () => {
        if (!this.#take) this.#place();
        this.#raf = requestAnimationFrame(tick);
      };
      tick();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.#raf);
      window.removeEventListener("keydown", this.#onKey, true);
      document.removeEventListener("pointerdown", this.#onOutside, true);
      document.body.style.zoom = this.#zoom;
      this.#target.remove();
    }

    get #mode() {
      return this.#state.target ? "element" : this.#state.rect ? "area" : "page";
    }

    #ratio() {
      return RATIOS.find(([, value]) => value === this.#state.ratio)?.[2] ?? 0;
    }

    #save() {
      localStorage.setItem(KEY, JSON.stringify(this.#state));
    }

    #applyZoom() {
      document.body.style.zoom = this.#state.pageZoom === 1 ? this.#zoom : String(this.#state.pageZoom);
    }

    #box() {
      const { target, rect } = this.#state;
      if (target) {
        const element = document.querySelector(target);
        if (element) return element.getBoundingClientRect();
      }
      if (rect) return rect;
      return { x: 0, y: 0, width: innerWidth, height: innerHeight };
    }

    #compute() {
      const box = this.#box();
      const pad = this.#state.target ? this.#state.padding : 0;
      let width = box.width + pad * 2;
      let height = box.height + pad * 2;
      const ratio = this.#ratio();
      if (ratio) {
        if (width / height > ratio) height = width / ratio;
        else width = height * ratio;
        const fit = Math.min(1, innerWidth / width, innerHeight / height);
        width *= fit;
        height *= fit;
      } else {
        width = Math.min(width, innerWidth);
        height = Math.min(height, innerHeight);
      }
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      const x = Math.min(Math.max(0, cx - width / 2), innerWidth - width);
      const y = Math.min(Math.max(0, cy - height / 2), innerHeight - height);
      return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    }

    #lock() {
      if (this.#state.rect) this.#state.rect = this.#compute();
    }

    #place() {
      const rect = this.#compute();
      this.#rect = rect;
      const mode = this.#mode;
      const whole = rect.width >= innerWidth - 1 && rect.height >= innerHeight - 1;
      this.#frame.hidden = mode === "page" && whole && !this.#state.guides;
      place(this.#frame, rect);
      place(this.#target, rect);
      const label = `${rect.width}×${rect.height}`;
      const name = mode === "element" ? shortName(document.querySelector(this.#state.target)) : mode === "area" ? "Area" : RATIOS.find(([, value]) => value === this.#state.ratio)[0];
      const tag = this.#frame.querySelector(".size");
      setTag(tag, name, label);
      tag.style.top = rect.y < 32 ? "8px" : "-28px";
      tag.style.left = rect.y < 32 ? "8px" : "0";
      const dim = this.#panel.querySelector(".header .dim");
      if (dim && dim.textContent !== label) dim.textContent = label;

      this.#area.hidden = mode === "page" || Boolean(this.#picking) || this.#open;
      if (this.#area.hidden) return;
      for (const input of this.#area.elements) {
        if (this.#root.activeElement !== input && input.value !== String(rect[input.name])) input.value = rect[input.name];
      }
      const gap = 12;
      const width = this.#area.offsetWidth;
      const height = this.#area.offsetHeight;
      const floor = this.#root.querySelector(".bar").getBoundingClientRect().top - gap;
      let top = rect.y + rect.height + gap;
      if (top + height > floor) top = rect.y - gap - height;
      if (top < gap) top = Math.min(rect.y + rect.height, floor) - gap - height;
      const left = Math.min(Math.max(gap, rect.x + rect.width / 2 - width / 2), innerWidth - width - gap);
      this.#area.style.transform = `translate(${Math.round(left)}px, ${Math.round(Math.max(gap, top))}px)`;
    }

    #sync() {
      const mode = this.#mode;
      this.#ui.dataset.mode = mode;
      for (const name of ["page", "element", "area"]) {
        const pressed = this.#picking ? name === "element" : name === mode;
        this.#root.querySelector(`.tile[data-action="${name}"]`).setAttribute("aria-pressed", String(pressed));
      }
      this.#root.querySelector(".handles").hidden = mode !== "area" || Boolean(this.#picking);
      this.#root.querySelector(".ratio").value = this.#state.ratio;
      const cursor = this.#root.querySelector(".toggle");
      cursor.setAttribute("aria-pressed", String(this.#state.cursor));
      cursor.innerHTML = this.#state.cursor ? `${ICONS.cursor}Cursor` : `${ICONS.noCursor}No Cursor`;
      this.#root.querySelector('[data-action="guides"]').setAttribute("aria-pressed", String(this.#state.guides));
      this.#root.querySelector(".guides").hidden = !this.#state.guides;
      this.#root.querySelector(".settings").setAttribute("aria-expanded", String(this.#open));
      this.#panel.hidden = !this.#open;
      this.#ui.toggleAttribute("data-open", this.#open);
      if (this.#open) {
        this.#panel.innerHTML = `<div class="header"><span>Settings</span><span class="dim">${this.#rect ? `${this.#rect.width}×${this.#rect.height}` : ""}</span></div>` + GROUPS
          .map(([label, key]) => `
            <div class="group">
              <p class="label">${label}</p>
              <div class="chips">${OPTIONS[key]
                .map(([text, value], index) => `<button class="chip" data-key="${key}" data-index="${index}" aria-pressed="${this.#state[key] === value}">${text}</button>`)
                .join("")}</div>
            </div>`)
          .join("");
      }
    }

    #show(message) {
      this.#toast.textContent = message;
      this.#toast.toggleAttribute("data-show", true);
      clearTimeout(this.#toast.timer);
      this.#toast.timer = setTimeout(() => this.#toast.removeAttribute("data-show"), 1800);
    }

    #onOutside = (event) => {
      if (this.#open && !event.composedPath().includes(this)) {
        this.#open = false;
        this.#sync();
      }
    };

    #onKey = (event) => {
      if (event.altKey && event.shiftKey && event.code === "KeyR") {
        event.preventDefault();
        event.stopPropagation();
        this.#toggleRecord();
        return;
      }
      if (!this.#picking) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this.#endPick();
      }
      if (event.key === "ArrowUp" && this.#picking.element?.parentElement && this.#picking.element.parentElement !== document.documentElement) {
        event.preventDefault();
        this.#picking.stack.push(this.#picking.element);
        this.#highlight(this.#picking.element.parentElement);
      }
      if (event.key === "ArrowDown" && this.#picking.stack.length) {
        event.preventDefault();
        this.#highlight(this.#picking.stack.pop());
      }
      if (event.key === "Enter" && this.#picking.element) {
        event.preventDefault();
        this.#choose({ target: selectorFor(this.#picking.element), rect: null });
      }
    };

    #onClick(event) {
      const chip = event.target.closest(".chip");
      if (chip) {
        const key = chip.dataset.key;
        this.#state[key] = OPTIONS[key][Number(chip.dataset.index)][1];
        if (key === "pageZoom") this.#applyZoom();
        this.#save();
        this.#sync();
        return;
      }
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "page") {
        if (this.#picking) this.#endPick();
        Object.assign(this.#state, { target: null, rect: null });
        this.#save();
        this.#sync();
      }
      if (action === "element") this.#picking ? this.#endPick() : this.#startPick();
      if (action === "area") this.#startArea();
      if (action === "cursor" || action === "guides") {
        this.#state[action] = !this.#state[action];
        this.#save();
        this.#sync();
      }
      if (action === "settings") {
        this.#open = !this.#open;
        this.#sync();
      }
      if (action === "copy") this.#copy();
      if (action === "record") this.#toggleRecord();
      if (action === "close") this.remove();
    }

    #setRatio(value) {
      this.#state.ratio = value;
      this.#lock();
      this.#save();
      this.#sync();
    }

    #startArea() {
      if (this.#picking) this.#endPick();
      if (this.#mode !== "area") {
        const width = Math.round(innerWidth * 0.6);
        const height = Math.round(innerHeight * 0.6);
        const fresh = { x: Math.round((innerWidth - width) / 2), y: Math.round((innerHeight - height) / 2), width, height };
        this.#state.rect = this.#mode === "element" ? this.#compute() : fresh;
        this.#state.target = null;
        this.#lock();
        this.#save();
      }
      this.#sync();
    }

    #onField(input) {
      if (input.value === "" || !Number.isFinite(Number(input.value))) return;
      const rect = { ...this.#compute() };
      const key = input.name;
      rect[key] = Math.max(key === "width" || key === "height" ? MIN : 0, Math.round(Number(input.value)));
      const ratio = this.#ratio();
      if (ratio && key === "width") rect.height = Math.round(rect.width / ratio);
      if (ratio && key === "height") rect.width = Math.round(rect.height * ratio);
      Object.assign(this.#state, { target: null, rect });
      this.#save();
      this.#sync();
    }

    #onDrag(event) {
      const node = event.target.closest("[data-handle]") ?? (this.#mode === "area" ? event.target.closest(".frame .size") : null);
      if (!node) return;
      event.preventDefault();
      node.setPointerCapture(event.pointerId);
      const handle = node.dataset.handle ?? "move";
      const start = this.#compute();
      const from = { x: event.clientX, y: event.clientY };
      const ratio = this.#ratio();
      const move = (moved) => {
        const dx = moved.clientX - from.x;
        const dy = moved.clientY - from.y;
        let { x, y, width, height } = start;
        if (handle === "move") {
          x += dx;
          y += dy;
        } else {
          let left = x;
          let top = y;
          let right = x + width;
          let bottom = y + height;
          if (handle.includes("w")) left = Math.min(left + dx, right - MIN);
          if (handle.includes("e")) right = Math.max(right + dx, left + MIN);
          if (handle.includes("n")) top = Math.min(top + dy, bottom - MIN);
          if (handle.includes("s")) bottom = Math.max(bottom + dy, top + MIN);
          x = left;
          y = top;
          width = right - left;
          height = bottom - top;
          if (ratio && (handle === "n" || handle === "s")) {
            width = height * ratio;
            x = start.x + (start.width - width) / 2;
          } else if (ratio) {
            height = width / ratio;
            if (handle.includes("n")) y = bottom - height;
            else if (!handle.includes("s")) y = start.y + (start.height - height) / 2;
          }
        }
        width = Math.min(width, innerWidth);
        height = Math.min(height, innerHeight);
        x = Math.min(Math.max(0, x), innerWidth - width);
        y = Math.min(Math.max(0, y), innerHeight - height);
        this.#state.rect = { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
      };
      const end = () => {
        node.removeEventListener("pointermove", move);
        this.#lock();
        this.#save();
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("lostpointercapture", end, { once: true });
    }

    #startPick() {
      this.#open = false;
      this.#picking = { element: null, stack: [], from: null };
      this.#picker.hidden = false;
      this.#sync();
    }

    #endPick() {
      this.#picking = null;
      this.#picker.hidden = true;
      this.#hover.hidden = true;
      this.#sync();
    }

    #elementAt(x, y) {
      return document
        .elementsFromPoint(x, y)
        .find((node) => node !== this && node !== this.#target && node.localName !== "clip-overlay" && node !== document.documentElement && node !== document.body);
    }

    #highlight(element, rect) {
      const box = rect ?? element?.getBoundingClientRect();
      if (this.#picking) {
        this.#picking.element = element ?? null;
        this.#picking.stack = element ? this.#picking.stack : [];
      }
      this.#hover.hidden = !box;
      if (!box) return;
      place(this.#hover, box);
      setTag(this.#hover.querySelector(".size"), element ? shortName(element) : "", `${Math.round(box.width)}×${Math.round(box.height)}`);
      this.#hover.querySelector(".size").style.top = box.y < 32 ? "4px" : "-28px";
    }

    #onPickMove(event) {
      const { from } = this.#picking;
      if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > 6) {
        from.dragging = true;
        this.#highlight(null, {
          x: Math.min(from.x, event.clientX),
          y: Math.min(from.y, event.clientY),
          width: Math.abs(event.clientX - from.x),
          height: Math.abs(event.clientY - from.y),
        });
        return;
      }
      if (!from) {
        const element = this.#elementAt(event.clientX, event.clientY);
        if (element !== this.#picking.element) {
          this.#picking.stack = [];
          this.#highlight(element);
        }
      }
    }

    #onPickDown(event) {
      event.preventDefault();
      this.#picking.from = { x: event.clientX, y: event.clientY, dragging: false };
      this.#picker.setPointerCapture(event.pointerId);
    }

    #onPickUp(event) {
      const { from, element } = this.#picking;
      if (from?.dragging) {
        const rect = {
          x: Math.round(Math.min(from.x, event.clientX)),
          y: Math.round(Math.min(from.y, event.clientY)),
          width: Math.round(Math.max(MIN, Math.abs(event.clientX - from.x))),
          height: Math.round(Math.max(MIN, Math.abs(event.clientY - from.y))),
        };
        this.#choose({ target: null, rect });
        return;
      }
      if (element) this.#choose({ target: selectorFor(element), rect: null });
    }

    #choose(selection) {
      Object.assign(this.#state, selection);
      this.#lock();
      this.#save();
      this.#endPick();
      this.#show(selection.target ? "Framed Element" : "Framed Area");
    }

    #settings() {
      const { ratio, padding, margin, radius, shadow, cursor, cursorScale, clickZoom, pageZoom, target, rect } = this.#state;
      const frame = target ? { target, padding } : rect ? { rect, padding: 0, viewport: [innerWidth, innerHeight] } : null;
      return { url: location.href, ratio, frame, style: { margin, radius, shadow, cursor, cursorScale, clickZoom, pageZoom } };
    }

    async #copy() {
      try {
        await navigator.clipboard.writeText(`Clip frame: ${JSON.stringify(this.#settings())}`);
        this.#show("Copied Frame");
      } catch {
        this.#show("Copy Failed");
      }
    }

    async #toggleRecord() {
      if (this.#take) return this.#stop();
      if (!navigator.mediaDevices?.getDisplayMedia || !("CropTarget" in window)) return this.#show("Record Needs Chrome or Edge");
      if (this.#picking) this.#endPick();
      this.#open = false;
      this.#sync();

      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 60, resizeMode: "none", cursor: "never" },
          audio: false,
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          surfaceSwitching: "exclude",
        });
      } catch {
        return this.#show("Recording Cancelled");
      }
      const [track] = stream.getVideoTracks();
      if (track.getSettings().displaySurface && track.getSettings().displaySurface !== "browser") {
        track.stop();
        return this.#show("Share This Tab");
      }

      const reload = this.#state.start === "reload";
      window.__clip?.start({ cursor: false, track: !reload });
      this.#ui.toggleAttribute("data-recording", true);
      await frameTwice();
      const rect = this.#compute();
      this.#rect = rect;
      place(this.#target, rect);
      const frame = reload ? this.#reloadFrame() : null;
      await frameTwice();
      await track.cropTo(await CropTarget.fromElement(this.#target));

      const type = ["video/mp4;codecs=avc3.640033", "video/mp4;codecs=avc1.640033", "video/mp4", "video/webm;codecs=vp9", "video/webm"].find((value) => MediaRecorder.isTypeSupported(value));
      const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 40_000_000 });
      const take = { recorder, stream, track, chunks: [], rect, type, frame, startedAt: 0, firstMove: 0 };
      this.#take = take;
      recorder.ondataavailable = (event) => event.data.size && take.chunks.push(event.data);
      recorder.onstart = () => {
        take.startedAt = epoch();
        if (!frame) return;
        frame.src = location.href;
        take.firstMove = epoch();
        this.#watch(take, { x: scrollX, y: scrollY });
      };
      if (!frame) {
        const onMove = () => {
          take.firstMove = epoch();
          window.removeEventListener("pointermove", onMove, true);
        };
        window.addEventListener("pointermove", onMove, true);
      }
      track.addEventListener("ended", () => this.#take === take && this.#stop());
      recorder.start(250);
      this.#placePill(rect);
    }

    #reloadFrame() {
      const frame = document.createElement("iframe");
      frame.setAttribute("data-clip-reload", "");
      frame.title = document.title;
      const background = [document.body, document.documentElement]
        .map((node) => getComputedStyle(node).backgroundColor)
        .find((value) => value !== "rgba(0, 0, 0, 0)" && value !== "transparent") ?? "#fff";
      Object.assign(frame.style, { position: "fixed", inset: "0", width: "100%", height: "100%", border: "0", zIndex: "2147483645", background });
      document.documentElement.append(frame);
      return frame;
    }

    #watch(take, scroll) {
      let veiled = false;
      let ready = false;
      const poll = () => {
        if (this.#take !== take) return;
        const view = take.frame.contentWindow;
        const doc = take.frame.contentDocument;
        if (!veiled && doc?.head && doc.URL !== "about:blank") {
          veiled = true;
          const veil = doc.createElement("style");
          veil.textContent = window.__clip?.pageStyle ?? "";
          doc.head.append(veil);
        }
        if (veiled && !ready && doc.readyState !== "loading") {
          ready = true;
          view.scrollTo(scroll.x, scroll.y);
          view.addEventListener("keydown", this.#onKey, true);
        }
        if (ready && doc.readyState === "complete" && view.__clip) {
          return (view.requestIdleCallback ?? view.setTimeout)(() => this.#take === take && view.__clip.start({ cursor: false, track: true }));
        }
        requestAnimationFrame(poll);
      };
      poll();
    }

    #placePill(rect) {
      const size = { width: 120, height: 32 };
      const spots = [
        { x: 16, y: 16 },
        { x: innerWidth - size.width - 16, y: 16 },
        { x: 16, y: innerHeight - size.height - 16 },
        { x: innerWidth - size.width - 16, y: innerHeight - size.height - 16 },
      ];
      const clear = spots.find((spot) =>
        spot.x + size.width < rect.x || spot.x > rect.x + rect.width || spot.y + size.height < rect.y || spot.y > rect.y + rect.height);
      this.#pill.hidden = !clear;
      if (clear) Object.assign(this.#pill.style, { left: `${clear.x}px`, top: `${clear.y}px` });
      const elapsed = this.#pill.querySelector(".elapsed");
      const started = performance.now();
      const tick = () => {
        if (!this.#take) return;
        const seconds = Math.floor((performance.now() - started) / 1000);
        elapsed.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
        setTimeout(tick, 250);
      };
      tick();
    }

    async #stop() {
      const take = this.#take;
      const stoppedAt = epoch();
      await new Promise((done) => {
        take.recorder.onstop = done;
        take.recorder.stop();
      });
      const helper = take.frame ? take.frame.contentWindow?.__clip : window.__clip;
      const events = helper?.events() ?? [];
      helper?.stop();
      window.__clip?.stop();
      take.frame?.remove();
      this.#take = null;
      this.#pill.hidden = true;
      this.#ui.removeAttribute("data-recording");

      const extension = take.type.startsWith("video/mp4") ? "mp4" : "webm";
      const blob = new Blob(take.chunks, { type: take.type });
      const id = `take-${new Date().toISOString().replace(/[:.]/g, "-")}`;
      const meta = {
        id,
        extension,
        devicePixelRatio,
        reload: Boolean(take.frame),
        capture: take.rect,
        startedAt: take.startedAt,
        firstMove: take.firstMove || take.startedAt,
        stoppedAt,
        events,
        ...this.#settings(),
      };

      const receiver = window.__clipReceiver ?? "http://127.0.0.1:4917";
      try {
        const sent = await fetch(`${receiver}/take/${id}/meta`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(meta) });
        if (!sent.ok) throw new Error();
        const video = await fetch(`${receiver}/take/${id}/video`, { method: "POST", headers: { "content-type": "application/octet-stream" }, body: blob });
        if (!video.ok) throw new Error();
        this.#show("Sent to Clip");
      } catch {
        const save = (data, name) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(data);
          link.download = name;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        };
        save(blob, `${id}.${extension}`);
        save(new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }), `${id}.json`);
        this.#show("Downloaded Take");
      }
      take.track.stop();
    }
  }

  customElements.define("clip-studio", ClipStudio);
  const mount = () => document.querySelector("clip-studio") || document.documentElement.append(document.createElement("clip-studio"));
  const settle = () => (window.requestIdleCallback ?? setTimeout)(mount);
  if (document.readyState === "complete") settle();
  else window.addEventListener("load", settle, { once: true });
}
