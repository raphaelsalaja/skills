// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Returns { findings, unverified } with the contrast of each visible text run and field edge.
// Text results also carry lc, the APCA lightness contrast, as a second read beside the ratio.
// Colours are composited over the backgrounds behind them before the ratio is read.
// Options: set window.__colorOptions = { root } before running.
// Call window.__color.highlight() afterwards to draw numbered overlays.
((options = {}) => {
  const root = options.root ?? document.body;
  const findings = [];
  const unverified = [];

  const pixel = document.createElement("canvas");
  pixel.width = 1;
  pixel.height = 1;
  const context = pixel.getContext("2d", { willReadFrequently: true });

  // Any CSS colour syntax, resolved to sRGB by drawing it.
  const parse = (value) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  };

  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });

  const channel = (value) => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ({ r, g, b }) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const ratio = (a, b) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (high + 0.05) / (low + 0.05);
  };

  // APCA lightness contrast (Lc), signed: negative for light text on a dark ground.
  const lightness = ({ r, g, b }) => {
    const y = 0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (b / 255) ** 2.4;
    return y < 0.022 ? y + (0.022 - y) ** 1.414 : y;
  };
  const lc = (text, ground) => {
    const [ink, back] = [lightness(text), lightness(ground)];
    if (Math.abs(back - ink) < 0.0005) return 0;
    if (back > ink) {
      const s = (back ** 0.56 - ink ** 0.57) * 1.14;
      return s < 0.1 ? 0 : (s - 0.027) * 100;
    }
    const s = (back ** 0.65 - ink ** 0.62) * 1.14;
    return s > -0.1 ? 0 : (s + 0.027) * 100;
  };

  const round = (value) => Math.round(value * 100) / 100;
  const hex = ({ r, g, b }) =>
    `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

  // sRGB to OKLCH and back, so a suggestion can move lightness while holding hue.
  const toOklch = ({ r, g, b }) => {
    const [lr, lg, lb] = [r, g, b].map(channel);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, c: Math.hypot(a, bb), h: Math.atan2(bb, a) };
  };
  const toLinearRgb = ({ l, c, h }) => {
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const lc = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mc = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const sc = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
      4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
      -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
      -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
    ];
  };
  const encode = (v) => {
    const x = Math.min(Math.max(v, 0), 1);
    return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055) * 255);
  };

  // Walks lightness away from the background, shedding chroma only to stay in gamut.
  const nearestPassing = (ink, ground, required) => {
    const start = toOklch(ink);
    const away = luminance(ground) > 0.18 ? -0.005 : 0.005;
    for (const step of [away, -away]) {
      for (let l = start.l; l >= 0 && l <= 1; l += step) {
        let c = start.c;
        let linear = toLinearRgb({ l, c, h: start.h });
        while (c > 0 && linear.some((v) => v < -1e-4 || v > 1 + 1e-4)) {
          c = Math.max(c - 0.005, 0);
          linear = toLinearRgb({ l, c, h: start.h });
        }
        const [r, g, b] = linear.map(encode);
        if (ratio({ r, g, b }, ground) >= required) return hex({ r, g, b });
      }
    }
    return null;
  };

  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;width:0;height:0;background-color:Canvas";
  document.documentElement.append(probe);
  const canvasColour = parse(getComputedStyle(probe).backgroundColor);
  probe.remove();

  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (!rect.width || !rect.height || style.visibility === "hidden") return false;
    return !el.closest("[inert], svg");
  };

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
    const text = (el.value || el.placeholder || el.textContent).trim().replace(/\s+/g, " ").slice(0, 40);
    return text ? `${parts.join(" > ")} "${text}"` : parts.join(" > ");
  };

  // The colour drawn behind an element, plus the opacity its own subtree is drawn at.
  const backdrop = (el, from = el) => {
    const layers = [];
    let opacity = 1;
    let image = false;
    for (let node = from; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== "none") image = true;
      const colour = parse(style.backgroundColor);
      if (colour.a > 0) layers.push(colour);
      if (colour.a >= 1) break;
      opacity *= Number(style.opacity);
    }
    let colour = canvasColour;
    for (const layer of layers.reverse()) colour = over(layer, colour);
    return { colour, opacity, image };
  };

  const add = (list, rule, el, detail, measured) => {
    const rect = el.getBoundingClientRect();
    list.push({
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

  const isLarge = (style) => {
    const size = Number.parseFloat(style.fontSize);
    return size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
  };

  const checkText = (el, colourValue, style, label) => {
    if (el.closest(":disabled, [aria-disabled='true']")) return;
    const ground = backdrop(el);
    const ink = parse(colourValue);
    const drawn = over({ ...ink, a: ink.a * ground.opacity }, ground.colour);
    const measured = ratio(drawn, ground.colour);
    const required = isLarge(style) ? 3 : 4.5;
    const values = {
      ratio: round(measured),
      lc: Math.round(lc(drawn, ground.colour) * 10) / 10,
      required,
      text: hex(drawn),
      background: hex(ground.colour),
      fontSize: style.fontSize,
    };
    if (ground.image) {
      add(unverified, "color-scrim-under-text", el,
        `${label} sits over an image or gradient. Crop it and read the ratio at the lightest point`, values);
      return;
    }
    if (measured < required) {
      values.suggestion = nearestPassing(drawn, ground.colour, required);
      add(findings, "color-text-contrast", el,
        `${label} at ${round(measured)}:1, needs ${required}:1 (${hex(drawn)} on ${hex(ground.colour)}). Nearest passing at this hue: ${values.suggestion}`, values);
    }
  };

  const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el) || !walker.currentNode.textContent.trim()) continue;
    if (["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"].includes(el.tagName)) continue;
    seen.add(el);
    if (!isVisible(el)) continue;
    const style = getComputedStyle(el);
    checkText(el, style.color, style, "Text");
  }

  const fields = root.querySelectorAll(
    "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select",
  );
  for (const field of fields) {
    if (!isVisible(field)) continue;
    const style = getComputedStyle(field);
    if (field.placeholder && !field.value) {
      checkText(field, getComputedStyle(field, "::placeholder").color, style, "Placeholder");
    }
    if (field.disabled || !field.parentElement) continue;
    const outside = backdrop(field, field.parentElement).colour;
    const fill = over(parse(style.backgroundColor), outside);
    const width = Number.parseFloat(style.borderBottomWidth) || 0;
    const edge = width ? over(parse(style.borderBottomColor), fill) : fill;
    const best = Math.max(ratio(fill, outside), ratio(edge, outside));
    if (best < 3) {
      const suggestion = nearestPassing(edge, outside, 3);
      add(findings, "color-ui-contrast", field,
        `Field edge at ${round(best)}:1 against its surround, needs 3:1. Nearest passing edge at this hue: ${suggestion}. Confirm in a crop, a box-shadow ring is not measured`,
        { ratio: round(best), required: 3, fill: hex(fill), edge: hex(edge), surround: hex(outside), suggestion });
    }
  }

  window.__color = {
    findings,
    highlight() {
      document.querySelectorAll("[data-color-overlay]").forEach((node) => node.remove());
      findings.forEach((finding, index) => {
        const mark = document.createElement("div");
        mark.dataset.colorOverlay = "";
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
      document.querySelectorAll("[data-color-overlay]").forEach((node) => node.remove());
    },
  };

  const strip = (list) =>
    list.map(({ element, ...finding }, index) => ({ id: index + 1, ...finding }));
  return { findings: strip(findings), unverified: strip(unverified) };
})(window.__colorOptions);
