// Run in the page once per viewport: pass this file's contents to Runtime.evaluate or page.evaluate,
// or load it with Playwright's page.addScriptTag({ path }).
// Returns { viewport, pageOverflow, scrollbar, breakpoints, findings } for sideways overflow, clipped text,
// small targets and fixed or sticky bars that crowd a short screen.
// A sideways-scroll culprit under aria-hidden, inert or visibility: hidden carries measured.hidden: true.
// Marks clipped by a tight line-height leave scrollHeight unchanged, so tall scripts are judged on a screenshot.
// breakpoints is { widths, edges, gaps, unreadSheets }: every width query in the loaded stylesheets, each
// breakpoint with the width 1px below it, and each max-width and min-width pair that leaves widths unmatched.
// unreadSheets counts cross-origin stylesheets whose rules the page cannot read.
// Options: set window.__viewportsOptions = { root, minTarget, scrollbar } before running.
// scrollbar: true draws a classic 15px scrollbar in Chromium, which macOS and touch emulation hide.
// The page ignores it when its root sets scrollbar-width or scrollbar-color, and the result's scrollbar reads 0.
// Call window.__viewports.highlight() afterwards to draw numbered overlays, and clear() to remove them.
((options = {}) => {
  const root = options.root ?? document.body;
  const minTarget = options.minTarget ?? 24;
  const findings = [];

  document.querySelectorAll("style[data-viewports-scrollbar]").forEach((node) => node.remove());
  if (options.scrollbar) {
    const style = document.createElement("style");
    style.dataset.viewportsScrollbar = "";
    style.textContent =
      "::-webkit-scrollbar { width: 15px; height: 15px; } ::-webkit-scrollbar-thumb { background: #888; }";
    document.head.append(style);
  }

  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  // A probe tells classic scrollbars from overlay ones. Under touch emulation innerWidth grows to fit
  // overflowing content, so innerWidth minus clientWidth only measures a scrollbar when the probe has one.
  const probe = document.createElement("div");
  probe.style.cssText = "position: absolute; top: -9999px; width: 100px; height: 100px; overflow: scroll";
  document.body.append(probe);
  const classic = probe.offsetWidth - probe.clientWidth > 0;
  probe.remove();
  const scrollbar = classic ? Math.max(0, innerWidth - width) : 0;
  const round = (value) => Math.round(value * 10) / 10;
  const px = (value) => Number.parseFloat(value) || 0;

  const hasBox = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  // Hidden boxes still take layout, so they can scroll the page sideways while showing nothing.
  const isHidden = (el) => getComputedStyle(el).visibility === "hidden" || Boolean(el.closest("[inert], [aria-hidden=true]"));

  const describe = (el) => {
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
    const text = el.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
    return text ? `${parts.join(" > ")} "${text}"` : parts.join(" > ");
  };

  const add = (rule, el, detail, measured) => {
    const rect = el.getBoundingClientRect();
    findings.push({
      rule,
      where: describe(el),
      detail,
      measured,
      rect: {
        x: Math.round(rect.x + scrollX),
        y: Math.round(rect.y + scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      element: el,
    });
  };

  const clipsX = (style) => ["hidden", "clip", "auto", "scroll"].includes(style.overflowX);

  const laidOut = [...root.querySelectorAll("*")].filter(
    (el) => !el.closest("svg") && !["SCRIPT", "STYLE", "TEMPLATE"].includes(el.tagName) && hasBox(el),
  );
  const elements = laidOut.filter((el) => !isHidden(el));

  // 1. Sideways scroll: the outermost elements past the end edge that no ancestor clips, hidden ones included.
  // A right-to-left page scrolls toward the left, so there the end edge is x = 0.
  const rtl = getComputedStyle(document.documentElement).direction === "rtl";
  const past = (rect) => (rtl ? -rect.left : rect.right - width);
  const pageOverflow = document.documentElement.scrollWidth - width;
  if (pageOverflow > 0) {
    const culprits = laidOut.filter((el) => {
      if (past(el.getBoundingClientRect()) <= 1) return false;
      if (getComputedStyle(el).position === "fixed") return false;
      for (let node = el.parentElement; node && node !== document.documentElement; node = node.parentElement) {
        if (clipsX(getComputedStyle(node))) return false;
      }
      return true;
    });
    for (const el of culprits) {
      if (culprits.some((other) => other !== el && other.contains(el))) continue;
      const rect = el.getBoundingClientRect();
      // A box as wide as the window, scrollbar included, is a 100vw box.
      const viewportWide = scrollbar > 0 && (Math.abs(rect.width - innerWidth) < 1 || Math.abs(rect.right - innerWidth) < 1);
      const hidden = isHidden(el);
      add(viewportWide ? "viewports-classic-scrollbar" : "viewports-no-sideways-scroll", el,
        `${hidden ? "Hidden, yet ends" : "Ends"} ${round(past(rect))}px past the ${rtl ? "left" : "right"} edge of the ${width}px viewport${viewportWide ? `, as wide as the window and its ${scrollbar}px scrollbar` : ""}`,
        { left: round(rect.left), right: round(rect.right), viewport: width, scrollbar, rtl, hidden });
    }
  }

  // 2. Clipped text: a clipping box whose own text, direct or nested, runs past its edge with no ellipsis
  // or line clamp. Text inside a nearer box that clips or scrolls on that axis belongs to that box.
  const clips = (value) => value === "hidden" || value === "clip";
  const textPast = (el, axis) => {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const left = box.left + px(style.borderLeftWidth);
    const top = box.top + px(style.borderTopWidth);
    const property = axis === "x" ? "overflowX" : "overflowY";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      let owned = true;
      for (let parent = node.parentElement; parent && parent !== el; parent = parent.parentElement) {
        if (getComputedStyle(parent)[property] !== "visible") {
          owned = false;
          break;
        }
      }
      if (!owned) continue;
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        if (axis === "x" ? rect.right > left + el.clientWidth + 1 || rect.left < left - 1 : rect.bottom > top + el.clientHeight + 1) return true;
      }
    }
    return false;
  };
  for (const el of elements) {
    const style = getComputedStyle(el);
    const cutX = clips(style.overflowX) && el.scrollWidth > el.clientWidth + 1 &&
      style.textOverflow !== "ellipsis" && textPast(el, "x");
    const cutY = clips(style.overflowY) && el.scrollHeight > el.clientHeight + 1 &&
      (style.webkitLineClamp ?? "none") === "none" && textPast(el, "y");
    if (cutX || cutY) {
      add("viewports-no-clipped-text", el,
        `Text cut ${cutX ? "sideways" : "at the bottom"}: ${cutX ? el.scrollWidth : el.scrollHeight}px of content in ${cutX ? el.clientWidth : el.clientHeight}px`,
        { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight });
    }
  }

  // 3. Small targets: the box plus any absolutely placed pseudo-element that extends it.
  const targets = elements.filter((el) =>
    el.matches("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=checkbox], [role=switch], [role=menuitem]"),
  );
  for (const el of targets) {
    const style = getComputedStyle(el);
    if (el.matches("a") && style.display === "inline") continue;
    const rect = el.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;
    for (const pseudo of ["::before", "::after"]) {
      const p = getComputedStyle(el, pseudo);
      if (p.content === "none" || p.position !== "absolute") continue;
      w = Math.max(w, rect.width - Math.min(px(p.left), 0) - Math.min(px(p.right), 0));
      h = Math.max(h, rect.height - Math.min(px(p.top), 0) - Math.min(px(p.bottom), 0));
    }
    if (Math.min(w, h) < minTarget) {
      add("defaults-hit-area", el,
        `Target ${round(w)} by ${round(h)}px, under ${minTarget}px`,
        { width: round(w), height: round(h) });
    }
  }

  // 4. Short screens: fixed and sticky bars pinned to the top or bottom edge cover at most a quarter
  // of a height of 480px or less.
  const bars = elements
    .filter((el) => {
      const position = getComputedStyle(el).position;
      if (position !== "fixed" && position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      if (rect.width < width / 2 || rect.height >= height) return false;
      return rect.top <= 1 || rect.bottom >= height - 1;
    })
    .filter((el, _, all) => !all.some((other) => other !== el && other.contains(el)));
  const covered = bars.reduce((sum, el) => {
    const rect = el.getBoundingClientRect();
    return sum + Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, 0));
  }, 0);
  if (height <= 480 && covered > height / 4) {
    for (const el of bars) {
      add("viewports-unstick-when-short", el,
        `Fixed and sticky bars cover ${round(covered)}px of a ${height}px screen, over the ${round(height / 4)}px quarter`,
        { covered: round(covered), height });
    }
  }

  // 5. Breakpoints: every viewport width query in the loaded stylesheets, and the widths none of them match.
  // A breakpoint is the first whole width on the wider side of a query. Media query em and rem are 16px.
  const bounds = [];
  let unread = 0;
  const toPx = (value, unit) => Number(value) * (unit === "px" ? 1 : 16);
  const readMedia = (text) => {
    const add = (kind, value, unit, inclusive) => bounds.push({ kind, value: toPx(value, unit), inclusive, query: text });
    const num = "([\\d.]+)(px|em|rem)";
    for (const m of text.matchAll(new RegExp(`\\((min|max)-width:\\s*${num}\\)`, "g"))) {
      add(m[1] === "min" ? "lower" : "upper", m[2], m[3], true);
    }
    for (const m of text.matchAll(new RegExp(`width\\s*(<=|>=|<|>)\\s*${num}`, "g"))) {
      add(m[1].startsWith(">") ? "lower" : "upper", m[2], m[3], m[1].endsWith("="));
    }
    for (const m of text.matchAll(new RegExp(`${num}\\s*(<=|>=|<|>)\\s*width`, "g"))) {
      add(m[3].startsWith("<") ? "lower" : "upper", m[1], m[2], m[3].endsWith("="));
    }
  };
  const readRules = (rules) => {
    for (const rule of rules) {
      if (rule instanceof CSSImportRule) {
        if (rule.media?.mediaText) readMedia(rule.media.mediaText);
        if (rule.styleSheet) readSheet(rule.styleSheet);
        continue;
      }
      if (rule instanceof CSSMediaRule) readMedia(rule.media.mediaText);
      if (rule.cssRules) readRules(rule.cssRules);
    }
  };
  const readSheet = (sheet) => {
    if (sheet.media?.mediaText) readMedia(sheet.media.mediaText);
    try {
      readRules(sheet.cssRules);
    } catch {
      unread += 1;
    }
  };
  [...document.styleSheets].forEach(readSheet);
  const breakpointOf = ({ kind, value, inclusive }) =>
    kind === "lower" ? (inclusive ? Math.ceil(value) : Math.floor(value) + 1) : (inclusive ? Math.floor(value) + 1 : Math.ceil(value));
  const breakpoints = [...new Set(bounds.map(breakpointOf))].sort((a, b) => a - b);
  const gaps = [];
  const seenGaps = new Set();
  for (const upper of bounds.filter((bound) => bound.kind === "upper")) {
    for (const lower of bounds.filter((bound) => bound.kind === "lower")) {
      const span = lower.value - upper.value;
      const open = span > 0 && span <= 1;
      const touching = span === 0 && !upper.inclusive && !lower.inclusive;
      const key = `${upper.query} ${lower.query}`;
      if ((open || touching) && !seenGaps.has(key)) {
        seenGaps.add(key);
        gaps.push({
          between: [upper.query, lower.query],
          unmatched: span ? `between ${upper.value}px and ${lower.value}px` : `${lower.value}px`,
        });
      }
    }
  }

  window.__viewports = {
    findings,
    highlight() {
      document.querySelectorAll("[data-viewports-overlay]").forEach((node) => node.remove());
      findings.forEach((finding, index) => {
        const mark = document.createElement("div");
        mark.dataset.viewportsOverlay = "";
        Object.assign(mark.style, {
          position: "absolute",
          left: `${finding.rect.x}px`,
          top: `${finding.rect.y}px`,
          width: `${finding.rect.width}px`,
          height: `${finding.rect.height}px`,
          outline: "1px solid #ff2d55",
          zIndex: 2147483647,
          pointerEvents: "none",
          font: "600 11px/16px system-ui",
          color: "#fff",
        });
        const label = document.createElement("span");
        label.textContent = String(index + 1);
        Object.assign(label.style, {
          position: "absolute",
          top: "-16px",
          left: "-1px",
          padding: "0 4px",
          background: "#ff2d55",
        });
        mark.append(label);
        document.body.append(mark);
      });
    },
    clear() {
      document.querySelectorAll("[data-viewports-overlay], style[data-viewports-scrollbar]").forEach((node) => node.remove());
    },
  };

  return {
    viewport: { width, height },
    pageOverflow: Math.max(pageOverflow, 0),
    scrollbar,
    breakpoints: { widths: breakpoints, edges: breakpoints.flatMap((value) => [value - 1, value]), gaps, unreadSheets: unread },
    findings: findings.map(({ element, ...finding }, index) => ({ id: index + 1, ...finding })),
  };
})(window.__viewportsOptions);
