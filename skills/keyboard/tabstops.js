// Run in the page before walking it with the keyboard (DevTools console, Runtime.evaluate or page.evaluate).
// Returns { unreachable, scrollers, positiveTabindex } at once, then records every focus stop while keys are pressed.
// Each stop carries its outline thickness and whether other content covers it, measured a frame after focus scrolls it in.
// Read window.__keyboard.stops after the walk. Call window.__keyboard.highlight() to number the stops on the page.
(() => {
  window.__keyboard?.dispose();

  const focusable =
    "a[href], area[href], button, input:not([type=hidden]), select, textarea, summary, iframe, [tabindex], [contenteditable]:not([contenteditable=false])";

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
    return parts.join(" > ");
  };

  // A rough accessible name. Confirm it in the accessibility tree before reporting.
  const nameOf = (el) => {
    const text = (value) => (value ?? "").trim().replace(/\s+/g, " ");
    if (el.getAttribute("aria-label")) return text(el.getAttribute("aria-label"));
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      return text(labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent).join(" "));
    }
    if (el.labels?.length) return text([...el.labels].map((label) => label.textContent).join(" "));
    const alt = el.querySelector("img[alt]")?.getAttribute("alt");
    return text(el.textContent) || text(alt) || text(el.getAttribute("title")) || text(el.placeholder);
  };

  const roleOf = (el) => el.getAttribute("role") ?? el.tagName.toLowerCase();

  const ringWidth = (el) => {
    const style = getComputedStyle(el);
    return style.outlineStyle === "none" ? 0 : Number.parseFloat(style.outlineWidth) || 0;
  };

  const hasRing = (el) => ringWidth(el) > 0 || getComputedStyle(el).boxShadow !== "none";

  // Samples the centre and four inset corners inside the viewport. "fully" when other content covers every one.
  // A stop entirely off screen returns null here and false for onScreen.
  const obscured = (el) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const points = [[0.5, 0.5], [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]]
      .map(([fx, fy]) => [rect.left + rect.width * fx, rect.top + rect.height * fy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
    if (!points.length) return null;
    const covered = points.filter(([x, y]) => {
      const top = document.elementFromPoint(x, y);
      return Boolean(top) && top !== el && !el.contains(top) && !top.contains(el);
    }).length;
    return covered === points.length ? "fully" : covered ? "partly" : null;
  };

  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && Number(style.opacity) > 0.05;
  };

  const onScreen = (rect) =>
    rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;

  const stops = [];

  const measure = (stop) => {
    const rect = stop.element.getBoundingClientRect();
    stop.onScreen = onScreen(rect);
    stop.obscured = obscured(stop.element);
    stop.rect = {
      x: Math.round(rect.x + scrollX),
      y: Math.round(rect.y + scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  };

  const onFocusIn = (event) => {
    const el = event.target;
    if (!(el instanceof Element)) return;
    const stop = {
      stop: stops.length + 1,
      where: describe(el),
      role: roleOf(el),
      name: nameOf(el),
      tabIndex: el.tabIndex,
      ring: hasRing(el),
      ringWidth: ringWidth(el),
      visible: isVisible(el),
      element: el,
    };
    measure(stop);
    stops.push(stop);
    // Focus scrolls the element in; measure again once that has painted.
    requestAnimationFrame(() => requestAnimationFrame(() => measure(stop)));
  };

  const onFocusOut = (event) => {
    if (event.relatedTarget) return;
    const from = describe(event.target);
    setTimeout(() => {
      if (document.hasFocus() && document.activeElement === document.body) {
        stops.push({ stop: stops.length + 1, lost: true, from });
      }
    });
  };

  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);

  // Topmost pointer targets with no way in from the keyboard.
  const unreachable = [...document.body.querySelectorAll("*")]
    .filter((el) => {
      if (el.closest("svg") || el.matches("label, :disabled") || !isVisible(el)) return false;
      if (getComputedStyle(el).cursor !== "pointer") return false;
      if (el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer") return false;
      if (el.matches(focusable) || el.closest(focusable) || el.querySelector(focusable)) return false;
      return true;
    })
    .map((el) => ({ where: describe(el), name: nameOf(el) }));

  // Scroll containers with nothing inside that Tab reaches. Safari never focuses the container itself.
  const scrolls = (style, axis, el) =>
    /auto|scroll/.test(style[`overflow${axis}`]) &&
    (axis === "Y" ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth + 1);
  const scrollers = [...document.body.querySelectorAll("*")]
    .filter((el) => {
      if (!isVisible(el)) return false;
      const style = getComputedStyle(el);
      if (!scrolls(style, "X", el) && !scrolls(style, "Y", el)) return false;
      if (el.hasAttribute("tabindex") && el.tabIndex >= 0) return false;
      return ![...el.querySelectorAll(focusable)].some((child) => child.tabIndex >= 0 && isVisible(child));
    })
    .map((el) => ({ where: describe(el), role: el.getAttribute("role"), name: nameOf(el).slice(0, 40) }));

  const positiveTabindex = [...document.querySelectorAll("[tabindex]")]
    .filter((el) => el.tabIndex > 0)
    .map((el) => ({ where: describe(el), tabIndex: el.tabIndex }));

  window.__keyboard = {
    get stops() {
      return stops.map(({ element, ...stop }) => stop);
    },
    highlight() {
      document.querySelectorAll("[data-keyboard-overlay]").forEach((node) => node.remove());
      for (const stop of stops) {
        if (stop.lost) continue;
        const color = stop.ring && !stop.obscured ? "#0a84ff" : "#ff2d55";
        const mark = document.createElement("div");
        mark.dataset.keyboardOverlay = "";
        Object.assign(mark.style, {
          position: "absolute",
          left: `${stop.rect.x}px`,
          top: `${stop.rect.y}px`,
          width: `${stop.rect.width}px`,
          height: `${stop.rect.height}px`,
          outline: `1px solid ${color}`,
          zIndex: 2147483647,
          pointerEvents: "none",
          font: "600 11px/16px system-ui",
          color: "#fff",
        });
        const label = document.createElement("span");
        label.textContent = String(stop.stop);
        Object.assign(label.style, {
          position: "absolute",
          top: "-16px",
          left: "-1px",
          padding: "0 4px",
          background: color,
        });
        mark.append(label);
        document.body.append(mark);
      }
    },
    clear() {
      document.querySelectorAll("[data-keyboard-overlay]").forEach((node) => node.remove());
    },
    dispose() {
      this.clear();
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
    },
  };

  return { unreachable, scrollers, positiveTabindex };
})();
