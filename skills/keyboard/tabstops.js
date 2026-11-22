// Run in the page before walking it with the keyboard: pass this file's contents to Runtime.evaluate or page.evaluate.
// Returns { unreachable, scrollers, positiveTabindex, reordered, skipLink } at once, then records every focus stop
// while keys are pressed. reordered lists containers whose visual order differs from source order around two or more
// stops. skipLink is null unless the first stop is an in-page link, and then names its target and whether it sits in main.
// Each stop carries inMain, ring, ringSource, shadowOnly, ringStyle, ringWidth and whether other content covers it.
// Paint is read with transitions switched off, at focus and again two frames later, so a fading ring reads its end value.
// ring compares focused and unfocused paint on the element, its ::before and ::after, and up to three ancestors that
// change once focus leaves them (a :focus-within ring). A box-shadow counts only beside an outline, a transparent one
// included, because forced colours drop shadows. shadowOnly marks a stop whose only change was a box-shadow.
// ringStyle "auto" is the browser's own ring, whose ringWidth reads 1px though it draws wider.
// A stop with lost: true means focus fell to body or its element left the page. Call window.__keyboard.check() after
// each action to test that at once; a removal is also caught two frames after the DOM changes.
// Read window.__keyboard.stops after the walk. window.__keyboard.keys counts Tab presses as { trusted, untrusted }.
// Call window.__keyboard.highlight() to number the stops on the page.
(() => {
  window.__keyboard?.dispose();

  const native =
    "a[href], area[href], button, input:not([type=hidden]), select, textarea, summary, iframe, [contenteditable]:not([contenteditable=false])";
  // What Tab reaches. tabindex="-1" takes focus from script, such as a route change's h1 or main, but is never a stop.
  const reach = `${native}, [tabindex]:not([tabindex^="-"])`;
  // Real controls: native ones, widget items with any tabindex (roving items hold -1) and focusable composites.
  const itemRoles = ["button", "link", "checkbox", "switch", "radio", "tab", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "combobox", "textbox", "searchbox", "slider", "spinbutton", "treeitem", "gridcell", "row"];
  const compositeRoles = ["listbox", "menu", "menubar", "tablist", "radiogroup", "grid", "tree", "treegrid", "toolbar"];
  const control = [
    native,
    ...itemRoles.map((role) => `[role=${role}][tabindex]`),
    ...compositeRoles.map((role) => `[role=${role}][tabindex]:not([tabindex^="-"])`),
  ].join(", ");

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

  // Paint is read with transitions off, so a ring mid-transition reports the value it lands on.
  const still = document.createElement("style");
  still.textContent =
    "[data-keyboard-still], [data-keyboard-still]::before, [data-keyboard-still]::after { transition: none !important; }";
  document.head.append(still);

  const paintOf = (el, pseudo) => {
    const style = getComputedStyle(el, pseudo);
    if (pseudo && (style.content === "none" || style.content === "normal")) return null;
    const width = style.outlineStyle === "none" ? 0 : Number.parseFloat(style.outlineWidth) || 0;
    const border = Number.parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none";
    const fill = style.backgroundColor !== "rgba(0, 0, 0, 0)" || style.backgroundImage !== "none";
    return {
      outline: width ? `${style.outlineStyle} ${width}px ${style.outlineColor} ${style.outlineOffset}` : "none",
      outlineStyle: style.outlineStyle,
      outlineWidth: width,
      shadow: style.boxShadow,
      border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor} ${style.borderBottomColor}`,
      background: `${style.backgroundColor} ${style.backgroundImage}`,
      draws: border || fill,
      opacity: pseudo ? style.opacity : "1",
    };
  };

  const parts = ["self", "::before", "::after"];
  const paint = (el) => {
    el.setAttribute("data-keyboard-still", "");
    try {
      return Object.fromEntries(parts.map((part) => [part, paintOf(el, part === "self" ? null : part)]));
    } finally {
      el.removeAttribute("data-keyboard-still");
    }
  };

  // The first part whose focused paint differs from its unfocused paint by an outline, a border or a fill.
  // A box-shadow change counts only when that part also draws an outline.
  const blank = { outline: "none", shadow: "none", border: "", background: "", draws: false, opacity: "0" };
  const indicator = (focused, rest) => {
    let shadowOnly = false;
    for (const part of parts) {
      const a = focused[part];
      if (!a || Number(a.opacity) === 0) continue;
      const b = rest[part] ?? blank;
      const faded = a.opacity !== b.opacity;
      const hasOutline = a.outline !== "none";
      const outline = hasOutline && (a.outline !== b.outline || faded);
      const fill = a.draws !== b.draws || (a.draws && (a.border !== b.border || a.background !== b.background || faded));
      const shadow = a.shadow !== b.shadow || (faded && a.shadow !== "none");
      if (outline || fill || (shadow && hasOutline)) {
        return { ring: true, source: part, shadowOnly: false, style: a.outlineStyle, width: a.outlineWidth };
      }
      if (shadow) shadowOnly = true;
    }
    return { ring: false, source: null, shadowOnly };
  };

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

  const tabbable = () =>
    [...document.querySelectorAll(reach)].filter(
      (el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden",
    );

  const stops = [];
  // Ancestors whose :focus-within paint is compared once focus leaves them.
  const pending = [];

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

  // The focused paint, read at focus and again two frames later for rings a script adds after focus.
  // ring holds whether an outline shows until focus leaves and the unfocused paint is compared.
  const capture = (stop) => {
    stop.focused = paint(stop.element);
    const source = parts.find((part) => stop.focused[part] && stop.focused[part].outline !== "none");
    const own = source && stop.focused[source];
    stop.ring = Boolean(own);
    stop.ringSource = source ?? null;
    stop.ringStyle = own?.outlineStyle ?? "none";
    stop.ringWidth = own?.outlineWidth ?? 0;
    let node = stop.element.parentElement;
    for (let depth = 0; node && node !== document.body && depth < 3; depth += 1, node = node.parentElement) {
      const entry = pending.find((item) => item.stop === stop && item.node === node);
      if (entry) entry.focused = paint(node);
      else pending.push({ stop, node, focused: paint(node) });
    }
  };

  const settle = () => {
    for (let i = pending.length - 1; i >= 0; i -= 1) {
      const { stop, node, focused } = pending[i];
      if (node.isConnected && node.contains(document.activeElement)) continue;
      pending.splice(i, 1);
      if (!node.isConnected || stop.ring) continue;
      const found = indicator(focused, paint(node));
      if (found.ring) {
        Object.assign(stop, {
          ring: true,
          ringSource: `:focus-within on ${describe(node)}`,
          shadowOnly: false,
          ringStyle: found.style,
          ringWidth: found.width,
        });
      }
    }
  };

  // Focus on body, or a focused element removed from the page, after the last recorded stop. Leaving the first or
  // last stop off the page's edge is the walk ending, not a loss.
  const check = () => {
    settle();
    const last = stops.at(-1);
    if (!last || last.lost || !document.hasFocus()) return null;
    const removed = !last.element.isConnected;
    const active = document.activeElement;
    if (!removed && active !== document.body && active !== null) return null;
    const edges = tabbable();
    if (!removed && (last.element === edges[0] || last.element === edges.at(-1))) return null;
    const lost = { stop: stops.length + 1, lost: true, from: last.where, removed };
    stops.push(lost);
    return lost;
  };
  const later = () => requestAnimationFrame(() => requestAnimationFrame(check));

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
      ringSource: null,
      shadowOnly: false,
      visible: isVisible(el),
      element: el,
    };
    capture(stop);
    measure(stop);
    stops.push(stop);
    settle();
    // Focus scrolls the element in and a script may add its ring; read both again once that has painted.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!el.isConnected) return;
        measure(stop);
        if (document.activeElement === el && !stop.settled) capture(stop);
      }),
    );
  };

  const onFocusOut = (event) => {
    // Focus has already left, so the computed style is the unfocused one.
    const left = stops.findLast((stop) => stop.element === event.target);
    if (left && !left.settled) {
      left.settled = true;
      const found = indicator(left.focused, paint(left.element));
      Object.assign(left, { ring: found.ring, ringSource: found.source, shadowOnly: found.shadowOnly });
      if (found.ring) Object.assign(left, { ringStyle: found.style, ringWidth: found.width });
    }
    if (!event.relatedTarget) later();
  };

  // A focused node removed from the page fires no reliable focusout, so watch the DOM for it.
  const observer = new MutationObserver(() => {
    const last = stops.at(-1);
    if (last && !last.lost && !last.element.isConnected) later();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // A key the browser tool dispatches as a DOM event arrives untrusted and never moves focus.
  const keys = { trusted: 0, untrusted: 0 };
  const onKeyDown = (event) => {
    if (event.key === "Tab") keys[event.isTrusted ? "trusted" : "untrusted"] += 1;
  };

  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);
  document.addEventListener("keydown", onKeyDown, true);

  // Topmost pointer targets with no way in from the keyboard. An ancestor excuses one only when it is a real control.
  const unreachable = [...document.body.querySelectorAll("*")]
    .filter((el) => {
      if (el.closest("svg, [inert]") || el.matches("label, :disabled") || !isVisible(el)) return false;
      if (getComputedStyle(el).cursor !== "pointer") return false;
      if (el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer") return false;
      if (el.matches(reach) || el.closest(control) || el.querySelector(reach)) return false;
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
      if (el.matches(reach)) return false;
      return ![...el.querySelectorAll(reach)].some((child) => child.tabIndex >= 0 && isVisible(child));
    })
    .map((el) => ({ where: describe(el), role: el.getAttribute("role"), name: nameOf(el).slice(0, 40) }));

  const positiveTabindex = [...document.querySelectorAll("[tabindex]")]
    .filter((el) => el.tabIndex > 0)
    .map((el) => ({ where: describe(el), tabIndex: el.tabIndex }));

  // Containers that CSS reorders around two or more stops, kept only when the boxes really land out of source order.
  const outOfOrder = (kids, rtl) => {
    const rects = kids.map((kid, index) => ({ rect: kid.getBoundingClientRect(), index }));
    const sorted = [...rects].sort((a, b) =>
      Math.abs(a.rect.top - b.rect.top) > 1 ? a.rect.top - b.rect.top : rtl ? b.rect.right - a.rect.right : a.rect.left - b.rect.left,
    );
    return sorted.some((entry, index) => entry.index !== index);
  };
  const reordered = [...document.body.querySelectorAll("*")]
    .map((el) => {
      const style = getComputedStyle(el);
      const flex = /flex/.test(style.display);
      const grid = /grid/.test(style.display);
      if ((!flex && !grid) || !isVisible(el)) return null;
      const holding = [...el.children].filter((kid) => kid.matches(reach) || kid.querySelector(reach));
      if (holding.length < 2) return null;
      const kids = [...el.children].map((kid) => getComputedStyle(kid));
      const how = [
        flex && style.flexDirection.endsWith("reverse") && `flex-direction: ${style.flexDirection}`,
        flex && style.flexWrap === "wrap-reverse" && "flex-wrap: wrap-reverse",
        grid && style.gridAutoFlow.includes("dense") && `grid-auto-flow: ${style.gridAutoFlow}`,
        grid && kids.some((kid) => kid.gridRowStart !== "auto" || kid.gridColumnStart !== "auto") && "grid-row, grid-column or grid-area",
        kids.some((kid) => kid.order !== "0") && "order",
      ].filter(Boolean);
      if (!how.length || !outOfOrder(holding, style.direction === "rtl")) return null;
      return { where: describe(el), how: how.join(", "), stops: holding.length };
    })
    .filter(Boolean);

  // The first stop in the page, when it is an in-page link: where it points and whether that lands in main.
  const main = document.querySelector("main, [role=main]");
  const first = tabbable()[0];
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
      return stops.map(({ element, focused, settled, ...stop }) => stop);
    },
    keys,
    check,
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
      observer.disconnect();
      still.remove();
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("keydown", onKeyDown, true);
    },
  };

  return { unreachable, scrollers, positiveTabindex, reordered, skipLink };
})();
