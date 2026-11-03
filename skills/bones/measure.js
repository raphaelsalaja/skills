// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Returns one entry per root: text lines, avatars, images, buttons and cards.
// Options: set window.__bonesOptions = { root } before running.
// root is a selector or an element. It defaults to [data-bones-root], then body.
//
// Fallback when the project has no skeleton primitive. One pulsing block.
// Tokens only, and no pulse under reduced motion.
// .bone {
//   background: var(--bone, color-mix(in srgb, currentColor 12%, transparent));
//   border-radius: inherit;
// }
// @media (prefers-reduced-motion: no-preference) {
//   .bone { animation: bone-pulse 1.4s ease-in-out infinite; }
// }
// @keyframes bone-pulse {
//   50% { opacity: 0.55; }
// }
((options = window.__bonesOptions ?? {}) => {
  const round = (value) => Math.round(value * 10) / 10;

  const listed = (value) => {
    if (value instanceof Element) return [value];
    const selector = typeof value === "string" && value ? value : "[data-bones-root]";
    const found = [...document.querySelectorAll(selector)];
    return found.length ? found : [document.body];
  };

  const shown = (el) => {
    if (!(el instanceof Element)) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (Number(style.opacity) === 0) return false;
    return true;
  };

  const describe = (el, root) => {
    const parts = [];
    let node = el;
    while (node && node !== root.parentElement && parts.length < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) part += `#${node.id}`;
      else {
        const name = [...node.classList].find((item) => item.length > 1);
        if (name) part += `.${name}`;
      }
      parts.unshift(part);
      if (node === root) break;
      node = node.parentElement;
    }
    return parts.join(" ");
  };

  const boxOf = (el, root) => {
    const rect = el.getBoundingClientRect();
    const base = root.getBoundingClientRect();
    return {
      x: round(rect.x - base.x),
      y: round(rect.y - base.y),
      width: round(rect.width),
      height: round(rect.height),
    };
  };

  const radiusOf = (style) => ({
    topLeft: style.borderTopLeftRadius,
    topRight: style.borderTopRightRadius,
    bottomRight: style.borderBottomRightRadius,
    bottomLeft: style.borderBottomLeftRadius,
  });

  const ownText = (el) => {
    let text = "";
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    }
    return text.replace(/\s+/g, " ").trim();
  };

  const lineBoxes = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 1 && rect.height > 1);
    if (!rects.length) return null;
    const lines = [];
    for (const rect of rects) {
      const last = lines.at(-1);
      if (last && Math.abs(rect.top - last.top) < 2) {
        const right = Math.max(last.x + last.width, rect.right);
        last.x = Math.min(last.x, rect.left);
        last.width = right - last.x;
        last.height = Math.max(last.height, rect.height);
      } else {
        lines.push({ x: rect.left, top: rect.top, width: rect.width, height: rect.height });
      }
    }
    const style = getComputedStyle(el);
    const parsed = Number.parseFloat(style.lineHeight);
    const last = lines.at(-1);
    return {
      text: ownText(el).slice(0, 80),
      lineCount: lines.length,
      lineHeight: round(Number.isFinite(parsed) ? parsed : last.height),
      lastLineWidth: round(last.width),
      lines: lines.map((line) => ({ width: round(line.width), height: round(line.height) })),
    };
  };

  const isAvatar = (el, style, rect) => {
    if (rect.width < 24 || rect.width > 96) return false;
    if (Math.abs(rect.width - rect.height) > 2) return false;
    const radius = Number.parseFloat(style.borderTopLeftRadius);
    return radius >= rect.width / 2 - 1;
  };

  const measureRoot = (root) => {
    const blocks = [];

    const visit = (el) => {
      if (!shown(el)) return;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const tag = el.tagName;

      if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS") {
        const definite = (value) => /\d(px|rem|em)$/.test(value);
        const reservesRatio =
          (el.hasAttribute("width") && el.hasAttribute("height")) ||
          (style.aspectRatio && style.aspectRatio !== "auto") ||
          (definite(style.width) && definite(style.height));
        blocks.push({
          kind: isAvatar(el, style, rect) ? "avatar" : "image",
          selector: describe(el, root),
          box: boxOf(el, root),
          radius: radiusOf(style),
          aspect: round(rect.width / rect.height),
          reservesRatio,
        });
        return;
      }

      if (tag === "BUTTON" || el.getAttribute("role") === "button") {
        blocks.push({
          kind: "button",
          selector: describe(el, root),
          box: boxOf(el, root),
          radius: radiusOf(style),
          label: (el.innerText || "").trim().slice(0, 40),
        });
        return;
      }

      if (isAvatar(el, style, rect) && ownText(el).length <= 3) {
        blocks.push({
          kind: "avatar",
          selector: describe(el, root),
          box: boxOf(el, root),
          radius: radiusOf(style),
          aspect: round(rect.width / rect.height),
        });
        return;
      }

      const text = ownText(el);
      const children = [...el.children].filter(shown);
      if (text && children.length === 0) {
        const lines = lineBoxes(el);
        if (lines) {
          blocks.push({
            kind: "text",
            selector: describe(el, root),
            box: boxOf(el, root),
            radius: radiusOf(style),
            ...lines,
          });
        }
        return;
      }

      const pad =
        Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingLeft);
      const fill = style.backgroundColor;
      const hasFill = fill !== "rgba(0, 0, 0, 0)" && fill !== "transparent";
      const hasRadius = Number.parseFloat(style.borderTopLeftRadius) > 0;
      if (el !== root && hasFill && hasRadius && pad > 0 && children.length > 0) {
        blocks.push({
          kind: "card",
          selector: describe(el, root),
          box: boxOf(el, root),
          radius: radiusOf(style),
          padding: style.padding,
          gap: style.gap,
        });
      }

      for (const child of el.children) visit(child);
    };

    visit(root);

    return {
      selector: describe(root, root),
      box: boxOf(root, root),
      blocks,
    };
  };

  return { views: listed(options.root).map(measureRoot) };
})(window.__bonesOptions);
