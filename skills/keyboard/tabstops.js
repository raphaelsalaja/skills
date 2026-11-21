// Run in the page before walking it with the keyboard (DevTools console, Runtime.evaluate or page.evaluate).
// Returns { unreachable, scrollers, positiveTabindex, reordered, skipLink } at once, then records every focus stop
// while keys are pressed. reordered lists containers that CSS reorders around two or more stops. skipLink is null
// unless the first stop is an in-page link, and then names its target and whether that target sits in main.
// Each stop carries inMain, ring, ringStyle, ringWidth and whether other content covers it, measured a frame after
// focus scrolls it in. ring turns false once focus leaves a stop that looked the same focused and unfocused.
// ringStyle "auto" is the browser's own ring, whose ringWidth reads 1px though it draws wider.
// Read window.__keyboard.stops after the walk. window.__keyboard.keys counts Tab presses as { trusted, untrusted }.
// Call window.__keyboard.highlight() to number the stops on the page.
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

  // The outline and shadow an element draws, compared focused and unfocused once focus leaves it.
  const ringOf = (el) => {
    const style = getComputedStyle(el);
    const outline = style.outlineStyle === "none" ? "none" : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
    return `${outline} | ${style.boxShadow} | ${style.borderColor} | ${style.backgroundColor}`;
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
      inMain: Boolean(el.closest("main, [role=main]")),
      ring: hasRing(el),
      ringStyle: getComputedStyle(el).outlineStyle,
      ringWidth: ringWidth(el),
      visible: isVisible(el),
      element: el,
      focusedRing: ringOf(el),
    };
    measure(stop);
    stops.push(stop);
    // Focus scrolls the element in; measure again once that has painted.
    requestAnimationFrame(() => requestAnimationFrame(() => measure(stop)));
  };

  const onFocusOut = (event) => {
    // Focus has already left, so the computed style is the unfocused one. No change means no indicator.
    const left = stops.findLast((stop) => stop.element === event.target && stop.focusedRing);
    if (left) {
      left.ring = left.focusedRing !== ringOf(left.element);
      delete left.focusedRing;
    }
    if (event.relatedTarget) return;
    const from = describe(event.target);
    setTimeout(() => {
      if (document.hasFocus() && document.activeElement === document.body) {
        stops.push({ stop: stops.length + 1, lost: true, from });
      }
    });
  };

  // A key the browser tool dispatches as a DOM event arrives untrusted and never moves focus.
  const keys = { trusted: 0, untrusted: 0 };
  const onKeyDown = (event) => {
    if (event.key === "Tab") keys[event.isTrusted ? "trusted" : "untrusted"] += 1;
  };

  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);
  document.addEventListener("keydown", onKeyDown, true);

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

  // Containers whose boxes CSS reorders while their stops keep source order, holding two or more stops.
  const reordered = [...document.body.querySelectorAll("*")]
    .map((el) => {
      const style = getComputedStyle(el);
      const flex = /flex/.test(style.display);
      const how = [
        flex && style.flexDirection.endsWith("reverse") && `flex-direction: ${style.flexDirection}`,
        flex && style.flexWrap === "wrap-reverse" && "flex-wrap: wrap-reverse",
        /grid/.test(style.display) && style.gridAutoFlow.includes("dense") && `grid-auto-flow: ${style.gridAutoFlow}`,
        /flex|grid/.test(style.display) && [...el.children].some((kid) => getComputedStyle(kid).order !== "0") && "order",
      ].filter(Boolean);
      const holding = [...el.children].filter((kid) => kid.matches(focusable) || kid.querySelector(focusable)).length;
      return how.length && holding >= 2 && isVisible(el) ? { where: describe(el), how: how.join(", "), stops: holding } : null;
    })
    .filter(Boolean);

  // The first stop in the page, when it is an in-page link: where it points and whether that lands in main.
  const main = document.querySelector("main, [role=main]");
  const first = [...document.querySelectorAll(focusable)].find(
    (el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden",
  );
  let skipLink = null;
  if (first?.matches('a[href^="#"]')) {
    const id = decodeURIComponent(first.getAttribute("href").slice(1));
    const target = id ? document.getElementById(id) ?? document.getElementsByName(id)[0] ?? null : null;
    skipLink = {
      where: describe(first),
      name: nameOf(first),
      href: first.getAttribute("href"),
      target: target && describe(target),
      targetInMain: Boolean(target && main?.contains(target)),
    };
  }

  window.__keyboard = {
    get stops() {
      return stops.map(({ element, focusedRing, ...stop }) => stop);
    },
    keys,
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
      document.removeEventListener("keydown", onKeyDown, true);
    },
  };

  return { unreachable, scrollers, positiveTabindex, reordered, skipLink };
})();
