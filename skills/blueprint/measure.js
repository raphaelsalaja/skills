// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Pass the subject with window.__blueprintOptions = { root: "#card" } or as the argument.
//
// Returns { title, url, clip, frame, subject, ink, outlines, callouts }.
// `clip` is the screenshot rectangle in viewport CSS pixels. Capture it at device scale factor 2.
// Coordinates on `subject`, `outlines` and `callouts` are CSS pixels relative to `clip`.
// Copy the result into sheet.js, set `screenshot` and `scale`, then delete callouts that crowd the subject.
// A gap under 8px is left out of the proposal, because a dimension line will not fit.
((options = {}) => {
  const settings = { ...(window.__blueprintOptions ?? {}), ...options };
  const root =
    typeof settings.root === "string"
      ? document.querySelector(settings.root)
      : (settings.root ?? document.body);

  if (!root) return { error: `No subject matches ${settings.root}` };

  const margin = {
    left: 176,
    right: 210,
    top: 72,
    bottom: 56,
    ...(typeof settings.margin === "number"
      ? { left: settings.margin, right: settings.margin, top: settings.margin, bottom: settings.margin }
      : settings.margin),
  };

  const round = (value) => Math.round(value * 10) / 10;
  const px = (value) => {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };

  const rel = (rect) => ({
    x: round(rect.x - clip.x),
    y: round(rect.y - clip.y),
    width: round(rect.width),
    height: round(rect.height),
  });

  const rootRect = root.getBoundingClientRect();
  const viewW = document.documentElement.clientWidth;
  const viewH = document.documentElement.clientHeight;
  const room = {
    left: Math.min(margin.left, Math.max(0, rootRect.left)),
    top: Math.min(margin.top, Math.max(0, rootRect.top)),
    right: Math.min(margin.right, Math.max(0, viewW - rootRect.right)),
    bottom: Math.min(margin.bottom, Math.max(0, viewH - rootRect.bottom)),
  };
  const clip = {
    x: round(rootRect.left - room.left),
    y: round(rootRect.top - room.top),
    width: round(rootRect.width + room.left + room.right),
    height: round(rootRect.height + room.top + room.bottom),
  };

  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (rect.width < 2 || rect.height < 2) return false;
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (Number(style.opacity) === 0) return false;
    return true;
  };

  const included = (el) => {
    if (el.namespaceURI === "http://www.w3.org/2000/svg" && el.tagName.toLowerCase() !== "svg") return false;
    if (["SCRIPT", "STYLE", "BR", "WBR"].includes(el.tagName)) return false;
    return visible(el);
  };

  const ownText = (el) =>
    [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .join(" ");

  const interactive = (el) => {
    const tag = el.tagName;
    if (["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"].includes(tag)) return true;
    const role = el.getAttribute("role");
    if (["button", "link", "checkbox", "switch", "radio", "tab", "menuitem"].includes(role)) return true;
    if (tag === "LABEL" && el.querySelector("input, select, textarea, button")) return true;
    return el.hasAttribute("tabindex") && el.tabIndex >= 0;
  };

  const hasSurface = (el) => {
    const style = getComputedStyle(el);
    const fill = style.backgroundColor;
    const bordered = ["Top", "Right", "Bottom", "Left"].some((side) => px(style[`border${side}Width`]) >= 1);
    return (fill && fill !== "rgba(0, 0, 0, 0)" && fill !== "transparent") || bordered;
  };

  const slop = (el) => {
    const before = getComputedStyle(el, "::before");
    if (before.content === "none" || before.content === "normal") return { t: 0, r: 0, b: 0, l: 0 };
    if (before.position !== "absolute" && before.position !== "fixed") return { t: 0, r: 0, b: 0, l: 0 };
    const grow = (value) => Math.max(0, -px(value));
    return { t: grow(before.top), r: grow(before.right), b: grow(before.bottom), l: grow(before.left) };
  };

  const rules = [];
  const walk = (list) => {
    for (const rule of list) {
      if (rule.cssRules) walk(rule.cssRules);
      if (rule.style && rule.selectorText) rules.push(rule);
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A cross-origin sheet does not expose its rules.
    }
  }

  const declared = (el, prop) => {
    const inline = el.style.getPropertyValue(prop);
    if (inline) return inline.trim();
    let value = "";
    for (const rule of rules) {
      let match = false;
      try {
        match = el.matches(rule.selectorText);
      } catch {
        continue;
      }
      if (!match) continue;
      const next = rule.style.getPropertyValue(prop);
      if (next) value = next.trim();
    }
    return value;
  };

  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;left:-9999px;pointer-events:none";
  document.body.append(probe);
  const resolveColor = (value) => {
    if (!value) return "";
    probe.style.color = "";
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };

  const tokens = [];
  const seenToken = new Set();
  const styles = getComputedStyle(document.documentElement);
  for (const rule of rules) {
    for (let i = 0; i < rule.style.length; i += 1) {
      const name = rule.style.item(i);
      if (!name?.startsWith("--") || seenToken.has(name)) continue;
      const raw = styles.getPropertyValue(name).trim();
      if (!raw) continue;
      const color = resolveColor(raw);
      if (!color || color === "rgba(0, 0, 0, 0)") continue;
      seenToken.add(name);
      tokens.push({ name, color });
    }
  }

  const rank = (name) => {
    if (/^--(text|background|border|fill|accent|danger|success)/.test(name)) return 2;
    if (/^--(gray|blue|red|green|yellow|orange|purple)/.test(name)) return 0;
    return 1;
  };

  const tokenLabel = (name) =>
    name
      .replace(/^--/, "")
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const matchToken = (el, prop, computed) => {
    const props = prop === "background-color" ? ["background-color", "background"] : [prop];
    for (const name of props) {
      const fromVar = /var\(\s*(--[\w-]+)/.exec(declared(el, name));
      if (!fromVar) continue;
      const named = tokens.find((token) => token.name === fromVar[1]);
      if (named) return named;
      return { name: fromVar[1], color: computed };
    }
    const hits = tokens.filter((token) => token.color === computed);
    hits.sort((a, b) => rank(b.name) - rank(a.name) || b.name.length - a.name.length);
    return hits[0] ?? null;
  };

  const familyName = (family) => family.split(",")[0].trim().replace(/^["']|["']$/g, "").replace(/ Variable$/, "");

  const weightName = (value) => {
    const named = { normal: 400, bold: 700 };
    const n = named[value] ?? Math.round(px(value) / 100) * 100;
    return (
      {
        100: "Thin",
        200: "Extra Light",
        300: "Light",
        400: "Regular",
        500: "Medium",
        600: "Semibold",
        700: "Bold",
        800: "Extra Bold",
        900: "Black",
      }[n] ?? String(n || value)
    );
  };

  const show = (value) => {
    const n = round(value);
    return Number.isInteger(n) ? String(n) : String(n);
  };

  const elements = [root, ...root.querySelectorAll("*")].filter(included);
  const callouts = [];
  const outlines = [{ rect: rel(rootRect), role: "subject" }];

  const push = (callout) => {
    callouts.push(callout);
  };

  const paddingOf = (style) => ({
    top: round(px(style.paddingTop)),
    right: round(px(style.paddingRight)),
    bottom: round(px(style.paddingBottom)),
    left: round(px(style.paddingLeft)),
  });

  const seenPad = new Set();
  const rootPad = paddingOf(getComputedStyle(root));
  if (Math.max(rootPad.top, rootPad.right, rootPad.bottom, rootPad.left) >= 1) {
    seenPad.add(`${rootPad.top},${rootPad.right},${rootPad.bottom},${rootPad.left}`);
    const equal = [rootPad.top, rootPad.right, rootPad.bottom, rootPad.left].every((side) => side === rootPad.top);
    push({
      kind: "padding",
      label: equal ? `Padding ${show(rootPad.top)}` : `Padding ${show(rootPad.top)} ${show(rootPad.right)} ${show(rootPad.bottom)} ${show(rootPad.left)}`,
      rect: rel(rootRect),
      padding: rootPad,
    });
  }

  let nestedPads = 0;
  for (const el of elements) {
    if (el === root || nestedPads >= 2) continue;
    const pad = paddingOf(getComputedStyle(el));
    const max = Math.max(pad.top, pad.right, pad.bottom, pad.left);
    const min = Math.min(pad.top, pad.right, pad.bottom, pad.left);
    if (max < 8 || min < 8) continue;
    if (pad.top === rootPad.top && pad.right === rootPad.right && pad.bottom === rootPad.bottom && pad.left === rootPad.left) continue;
    if (!hasSurface(el) && !interactive(el)) continue;
    const key = `${pad.top},${pad.right},${pad.bottom},${pad.left}`;
    if (seenPad.has(key)) continue;
    seenPad.add(key);
    const equal = [pad.top, pad.right, pad.bottom, pad.left].every((side) => side === pad.top);
    push({
      kind: "padding",
      label: equal ? `Padding ${show(pad.top)}` : `Padding ${show(pad.top)} ${show(pad.right)} ${show(pad.bottom)} ${show(pad.left)}`,
      rect: rel(el.getBoundingClientRect()),
      padding: pad,
    });
    nestedPads += 1;
  }

  const radiusOf = (style) =>
    ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((corner) => round(px(style[`border${corner}Radius`])));

  const seenRadius = new Set();
  let radiusCount = 0;
  for (const el of elements) {
    if (radiusCount >= 4) break;
    const style = getComputedStyle(el);
    const corners = radiusOf(style);
    const max = Math.max(...corners);
    if (max < 1) continue;
    if (el !== root && !hasSurface(el) && !interactive(el)) continue;
    const key = corners.join(",");
    if (seenRadius.has(key)) continue;
    seenRadius.add(key);
    const equal = corners.every((corner) => corner === corners[0]);
    push({
      kind: "radius",
      label: equal ? `Radius ${show(corners[0])}` : `Radius ${corners.map(show).join(" ")}`,
      rect: rel(el.getBoundingClientRect()),
      corner: "top-left",
      radius: corners[0],
    });
    radiusCount += 1;
  }

  for (const el of elements) {
    const style = getComputedStyle(el);
    const axis = style.display.includes("flex")
      ? style.flexDirection.startsWith("row")
        ? "x"
        : "y"
      : style.display.includes("grid")
        ? style.gridTemplateColumns.split(" ").filter(Boolean).length > 1
          ? "x"
          : "y"
        : null;
    if (!axis) continue;
    const used = px(axis === "x" ? style.columnGap : style.rowGap);
    if (used < 8) continue;
    const kids = [...el.children].filter(included);
    for (let i = 0; i < kids.length - 1; i += 1) {
      const a = kids[i].getBoundingClientRect();
      const b = kids[i + 1].getBoundingClientRect();
      const size = axis === "y" ? b.top - a.bottom : b.left - a.right;
      if (Math.abs(size - used) > 1.5) continue;
      push({
        kind: "gap",
        label: `Gap ${show(size)}`,
        axis,
        size: round(size),
        a: rel(a),
        b: rel(b),
      });
      break;
    }
  }

  const seenType = new Set();
  for (const el of elements) {
    if (seenType.size >= 5) break;
    if (!ownText(el)) continue;
    const style = getComputedStyle(el);
    const family = familyName(style.fontFamily);
    const size = round(px(style.fontSize));
    const line = round(px(style.lineHeight));
    const weight = weightName(style.fontWeight);
    const key = `${family}|${size}|${line}|${weight}`;
    if (seenType.has(key)) continue;
    seenType.add(key);
    const rect = rel(el.getBoundingClientRect());
    push({
      kind: "type",
      label: `${family} ${show(size)}/${show(line)} ${weight}`,
      anchor: { x: rect.x, y: round(rect.y + rect.height / 2) },
      rect,
    });
  }

  const seenColour = new Set();
  const addColour = (el, prop, computed) => {
    if (seenColour.size >= 6) return;
    if (!computed || computed === "rgba(0, 0, 0, 0)" || computed === "transparent") return;
    const token = matchToken(el, prop, computed);
    const key = token?.name ?? computed;
    if (seenColour.has(key)) return;
    seenColour.add(key);
    const rect = rel(el.getBoundingClientRect());
    push({
      kind: "colour",
      label: token ? tokenLabel(token.name) : computed,
      token: token?.name ?? "",
      swatch: computed,
      anchor: { x: rect.x, y: round(rect.y + Math.min(16, rect.height / 2)) },
      rect,
    });
  };

  addColour(root, "background-color", getComputedStyle(root).backgroundColor);
  for (const el of elements) {
    if (!ownText(el)) continue;
    addColour(el, "color", getComputedStyle(el).color);
  }
  for (const el of elements) {
    if (!interactive(el)) continue;
    addColour(el, "background-color", getComputedStyle(el).backgroundColor);
  }

  let hits = 0;
  for (const el of elements) {
    if (hits >= 6 || !interactive(el)) continue;
    const rect = el.getBoundingClientRect();
    const extra = slop(el);
    const box = {
      x: rect.x - extra.l,
      y: rect.y - extra.t,
      width: rect.width + extra.l + extra.r,
      height: rect.height + extra.t + extra.b,
    };
    const relBox = rel(box);
    const w = Math.round(relBox.width);
    const h = Math.round(relBox.height);
    push({
      kind: "hit",
      label: w === h ? `Hit ${w}` : `Hit ${w} by ${h}`,
      rect: relBox,
    });
    hits += 1;
  }

  for (const el of elements) {
    if (el === root || outlines.length >= 16) continue;
    const rect = el.getBoundingClientRect();
    if (interactive(el) || (hasSurface(el) && rect.width >= 24 && rect.height >= 24)) {
      outlines.push({ rect: rel(rect), role: "part" });
    }
  }

  probe.remove();

  const fill = getComputedStyle(root).backgroundColor;
  const rgb = fill.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(rgb[0] ?? 255) + 0.7152 * channel(rgb[1] ?? 255) + 0.0722 * channel(rgb[2] ?? 255);

  const heading = root.querySelector("h1, h2, h3");
  const title =
    settings.title ||
    root.getAttribute("aria-label") ||
    heading?.textContent.trim() ||
    "Screen";

  return {
    title,
    url: location.href,
    clip,
    frame: { width: clip.width, height: clip.height, margin: room },
    subject: rel(rootRect),
    ink: luminance < 0.4 ? "light" : "dark",
    outlines,
    callouts,
  };
})()
