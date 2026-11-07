// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Installs window.__wireframe and draws nothing until enter().
// enter() covers a local page with a structural view. exit() puts the page back.
// destroy() removes the runtime as well. Escape calls exit().
// Ground #F2F2F2, surface #FFFFFF, control #E4E4E7, mark #C7C6C9.
// The wipe is a 240ms linear clip-path inset, left to right both ways.
// Text bars are 0.62em tall and centred on the line rectangle.
// Hover guides extend 24px. Badge blue is #1483F4 at 0.16 fill.
(() => {
  const previous = window.__wireframe;
  previous?.destroy?.();

  const GROUND = "#F2F2F2";
  const SURFACE = "#FFFFFF";
  const CONTROL = "#E4E4E7";
  const MARK = "#C7C6C9";
  const BLUE = "#1483F4";
  const BLUE_FILL = "rgba(20, 131, 244, 0.16)";
  const WIPE_MS = 240;
  const GUIDE = 24;
  const LANE = 16;
  const LINE_EM = 0.62;
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "HEAD", "BR", "WBR"]);
  const REPLACED = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "OBJECT"]);

  const CSS = `
    .shapes, .hover { position: absolute; inset: 0; }
    .hover { z-index: 1; }
    .shape, .fill, .guide, .tick, .rule, .badge { position: absolute; pointer-events: none; box-sizing: border-box; }
    .fill { background: ${BLUE_FILL}; box-shadow: inset 0 0 0 1px ${BLUE}; }
    .guide, .tick, .rule { background: ${BLUE}; }
    .badge {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: ${BLUE};
      color: #ffffff;
      font: 600 11px/18px ui-sans-serif, system-ui, sans-serif;
    }
  `;

  let session = null;
  let ids = new WeakMap();
  let nextId = 1;
  let statusToken = 0;
  const measure = document.createElement("canvas").getContext("2d");
  const tagOf = (el) => el.tagName.toUpperCase();

  const idOf = (node) => {
    let id = ids.get(node);
    if (!id) {
      id = nextId;
      nextId += 1;
      ids.set(node, id);
    }
    return id;
  };

  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isLocal = () => {
    if (location.protocol === "file:") return true;
    const name = location.hostname;
    return name === "localhost" || name === "127.0.0.1" || name === "::1" || name === "[::1]" || name.endsWith(".localhost");
  };

  const parseColor = (value) => {
    if (!value || value === "transparent") return null;
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).map(Number);
    if ([r, g, b].some((part) => Number.isNaN(part)) || a < 0.4) return null;
    return { r, g, b, a };
  };

  const lightness = (color) => (color.r + color.g + color.b) / 3 / 255;

  const px = (value) => Number.parseFloat(value) || 0;

  const frameOffset = (el) => {
    let x = 0;
    let y = 0;
    let view = el.ownerDocument?.defaultView;
    while (view && view !== window) {
      const frame = view.frameElement;
      if (!frame) break;
      const rect = frame.getBoundingClientRect();
      x += rect.left;
      y += rect.top;
      view = frame.ownerDocument.defaultView;
    }
    return { x, y };
  };

  const boxOf = (el) => {
    const rect = el.getBoundingClientRect();
    const offset = frameOffset(el);
    const left = rect.left + offset.x;
    const top = rect.top + offset.y;
    return { left, top, width: rect.width, height: rect.height, right: left + rect.width, bottom: top + rect.height };
  };

  const shown = (el) => {
    if (!(el instanceof Element)) return false;
    if (el.closest("[data-wireframe-host], [data-wireframe-status]")) return false;
    let node = el;
    while (node) {
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 0.05) return false;
      const root = node.getRootNode();
      if (root instanceof ShadowRoot && node === root.host) break;
      if (!node.parentElement && root instanceof ShadowRoot) {
        node = root.host;
        continue;
      }
      node = node.parentElement;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0.5 && rect.height > 0.5;
  };

  const sameOriginDoc = (frame) => {
    try {
      return frame.contentDocument;
    } catch {
      return null;
    }
  };

  const bordered = (style) => ["Top", "Right", "Bottom", "Left"].some((side) => {
    return px(style[`border${side}Width`]) >= 1 && parseColor(style[`border${side}Color`]);
  });

  const plateKind = (el, style) => {
    if (el === document.documentElement || el === document.body) return null;
    if (tagOf(el) === "IFRAME" && !sameOriginDoc(el)) return "mark";
    if (REPLACED.has(tagOf(el))) return "mark";
    if (style.backgroundImage && style.backgroundImage !== "none") return "mark";
    const fill = parseColor(style.backgroundColor);
    const edge = bordered(style);
    const shadow = style.boxShadow !== "none";
    const rect = el.getBoundingClientRect();
    if ((rect.height <= 2 || rect.width <= 2) && (fill || edge)) return "mark";
    if (fill) {
      const tone = lightness(fill);
      if (tone >= 0.97) return "surface";
      if (tone >= 0.93 && !edge && !shadow) return null;
      return "control";
    }
    if (edge || shadow) return "surface";
    return null;
  };

  const colorFor = (kind) => (kind === "surface" ? SURFACE : kind === "control" ? CONTROL : MARK);

  const hasDirectText = (el) => [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());

  const isContainer = (el) => {
    if (hasDirectText(el)) return false;
    return [...el.children].some((child) => child instanceof Element && child.tagName !== "BR" && shown(child));
  };

  const intersects = (a, b) => a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;

  const readSpacing = (el) => {
    const box = boxOf(el);
    const style = getComputedStyle(el);
    const segments = [];
    if (isContainer(el)) {
      const left = px(style.paddingLeft);
      const right = px(style.paddingRight);
      const top = px(style.paddingTop);
      const bottom = px(style.paddingBottom);
      const bl = px(style.borderLeftWidth);
      const br = px(style.borderRightWidth);
      const bt = px(style.borderTopWidth);
      const bb = px(style.borderBottomWidth);
      if (left >= 0.5) segments.push({ kind: "padding", side: "left", axis: "x", lane: "top", x: box.left + bl, y: box.top, length: left, value: left });
      if (right >= 0.5) segments.push({ kind: "padding", side: "right", axis: "x", lane: "top", x: box.right - br - right, y: box.top, length: right, value: right });
      if (top >= 0.5) segments.push({ kind: "padding", side: "top", axis: "y", lane: "left", x: box.left, y: box.top + bt, length: top, value: top });
      if (bottom >= 0.5) segments.push({ kind: "padding", side: "bottom", axis: "y", lane: "left", x: box.left, y: box.bottom - bb - bottom, length: bottom, value: bottom });
      segments.push(...childGaps(el).slice(0, 8));
    } else {
      segments.push(...outerGaps(el, box));
    }
    segments.push({ kind: "size", side: "width", axis: "x", lane: "bottom", x: box.left, y: box.bottom, length: box.width, value: box.width });
    segments.push({ kind: "size", side: "height", axis: "y", lane: "right", x: box.right, y: box.top, length: box.height, value: box.height });
    return { box, width: box.width, height: box.height, radius: style.borderRadius, segments: segments.filter((segment) => Math.round(segment.value) >= 1) };
  };

  const childGaps = (el) => {
    const kids = [...el.children].filter((child) => child instanceof Element && child.tagName !== "BR" && shown(child));
    const boxes = kids.map(boxOf);
    const found = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const gap = gapBetween(boxes[i], boxes[j]);
        if (!gap) continue;
        const rect = gap.axis === "x"
          ? { left: gap.x, right: gap.x + gap.length, top: Math.min(boxes[i].top, boxes[j].top), bottom: Math.max(boxes[i].bottom, boxes[j].bottom) }
          : { left: Math.min(boxes[i].left, boxes[j].left), right: Math.max(boxes[i].right, boxes[j].right), top: gap.y, bottom: gap.y + gap.length };
        if (boxes.some((other, index) => index !== i && index !== j && intersects(other, rect))) continue;
        found.push(gap);
      }
    }
    found.sort((a, b) => a.y - b.y || a.x - b.x);
    return found;
  };

  const gapBetween = (a, b) => {
    const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (overlapY > 2) {
      const left = a.right <= b.left ? [a, b] : b.right <= a.left ? [b, a] : null;
      if (left) {
        const value = left[1].left - left[0].right;
        if (value >= 0.5) {
          return { kind: "gap", axis: "x", lane: "top", x: left[0].right, y: Math.max(a.top, b.top), length: value, value };
        }
      }
    }
    if (overlapX > 2) {
      const above = a.bottom <= b.top ? [a, b] : b.bottom <= a.top ? [b, a] : null;
      if (above) {
        const value = above[1].top - above[0].bottom;
        if (value >= 0.5) {
          return { kind: "gap", axis: "y", lane: "left", x: Math.max(a.left, b.left), y: above[0].bottom, length: value, value };
        }
      }
    }
    return null;
  };

  const outerGaps = (el, box) => {
    const parent = el.parentElement;
    if (!parent) return [];
    const sides = { left: null, right: null, top: null, bottom: null };
    for (const sibling of parent.children) {
      if (sibling === el || !(sibling instanceof Element) || !shown(sibling)) continue;
      const other = boxOf(sibling);
      const overlapX = Math.min(box.right, other.right) - Math.max(box.left, other.left);
      const overlapY = Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top);
      if (overlapY > 2 && other.right <= box.left + 0.5) nearer(sides, "left", box.left - other.right);
      if (overlapY > 2 && other.left >= box.right - 0.5) nearer(sides, "right", other.left - box.right);
      if (overlapX > 2 && other.bottom <= box.top + 0.5) nearer(sides, "top", box.top - other.bottom);
      if (overlapX > 2 && other.top >= box.bottom - 0.5) nearer(sides, "bottom", other.top - box.bottom);
    }
    const parentBox = boxOf(parent);
    if (sides.left == null) sides.left = box.left - parentBox.left;
    if (sides.right == null) sides.right = parentBox.right - box.right;
    if (sides.top == null) sides.top = box.top - parentBox.top;
    if (sides.bottom == null) sides.bottom = parentBox.bottom - box.bottom;
    const segments = [];
    if (sides.left >= 0.5) segments.push({ kind: "outer", side: "left", axis: "x", lane: "top", x: box.left - sides.left, y: box.top, length: sides.left, value: sides.left });
    if (sides.right >= 0.5) segments.push({ kind: "outer", side: "right", axis: "x", lane: "top", x: box.right, y: box.top, length: sides.right, value: sides.right });
    if (sides.top >= 0.5) segments.push({ kind: "outer", side: "top", axis: "y", lane: "left", x: box.left, y: box.top - sides.top, length: sides.top, value: sides.top });
    if (sides.bottom >= 0.5) segments.push({ kind: "outer", side: "bottom", axis: "y", lane: "left", x: box.left, y: box.bottom, length: sides.bottom, value: sides.bottom });
    return segments;
  };

  const nearer = (sides, side, value) => {
    if (value < 0.5) return;
    if (sides[side] == null || value < sides[side]) sides[side] = value;
  };

  const spacing = (el) => {
    if (!(el instanceof Element)) return null;
    const read = readSpacing(el);
    const padding = { top: 0, right: 0, bottom: 0, left: 0 };
    const outer = { top: 0, right: 0, bottom: 0, left: 0 };
    const gaps = [];
    for (const segment of read.segments) {
      const value = Math.round(segment.value);
      if (segment.kind === "padding") padding[segment.side] = value;
      if (segment.kind === "outer") outer[segment.side] = value;
      if (segment.kind === "gap") gaps.push(value);
    }
    return { width: Math.round(read.width), height: Math.round(read.height), padding, gaps, outer };
  };

  const groupOf = (node) => {
    let el = node.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      const fill = parseColor(style.backgroundColor);
      if ((fill && lightness(fill) < 0.97) || (style.backgroundImage && style.backgroundImage !== "none")) return el;
      if (style.display !== "inline" && style.display !== "contents") return el;
      el = el.parentElement;
    }
    return node.parentElement;
  };

  const fieldLabel = (el) => {
    if (el instanceof HTMLInputElement) {
      if (["checkbox", "radio", "range", "color", "file", "image", "hidden"].includes(el.type)) return "";
      if (el.type === "password") return el.value ? "\u2022".repeat(8) : el.placeholder || "";
      if (["submit", "button", "reset"].includes(el.type)) return el.value || "";
      return el.value || el.placeholder || "";
    }
    if (el instanceof HTMLTextAreaElement) return el.value || el.placeholder || "";
    if (el instanceof HTMLSelectElement) return el.options[el.selectedIndex]?.text || "";
    return "";
  };

  const wrapLines = (text, maxWidth) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (!lines.length && text) lines.push(text);
    return lines;
  };

  const fieldBars = (el) => {
    const text = fieldLabel(el);
    if (!text) return [];
    const style = getComputedStyle(el);
    const box = boxOf(el);
    const fontSize = px(style.fontSize) || 16;
    const lineHeight = px(style.lineHeight) || fontSize * 1.2;
    const height = Math.min(lineHeight, Math.max(4, fontSize * LINE_EM));
    const padL = px(style.paddingLeft);
    const padR = px(style.paddingRight);
    const padT = px(style.paddingTop);
    const contentWidth = Math.max(8, box.width - padL - padR);
    measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const fixed = el instanceof HTMLInputElement && el.type === "password" && el.value;
    const lines = fixed ? [text] : el instanceof HTMLTextAreaElement ? wrapLines(text, contentWidth) : [text];
    return lines.map((line, index) => {
      const width = fixed ? contentWidth * 0.4 : Math.min(contentWidth, Math.max(4, measure.measureText(line).width));
      return {
        left: box.left + padL,
        top: box.top + padT + index * lineHeight + (lineHeight - height) / 2,
        width,
        height,
      };
    });
  };

  const collect = (root) => {
    const plates = [];
    const lines = [];
    const raw = [];

    const addPlate = (el, kind, style) => {
      const box = boxOf(el);
      if (box.width < 0.5 || box.height < 0.5) return;
      plates.push({
        key: `${kind}:${idOf(el)}`,
        kind,
        box,
        radius: style.borderRadius || "0px",
        color: colorFor(kind),
      });
    };

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || !node.textContent.trim() || parent.closest("select, option")) return;
        const style = getComputedStyle(parent);
        if (px(style.fontSize) < 1) return;
        const ink = parseColor(style.color);
        if (ink && ink.a < 0.05) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        const offset = frameOffset(parent);
        for (const rect of range.getClientRects()) {
          if (rect.width < 0.5 || rect.height < 0.5) continue;
          raw.push({
            group: groupOf(node),
            parent,
            top: rect.top + offset.y,
            left: rect.left + offset.x,
            right: rect.right + offset.x,
            height: rect.height,
          });
        }
        range.detach?.();
        return;
      }
      if (!(node instanceof Element) && (node instanceof Document || node instanceof ShadowRoot || node instanceof DocumentFragment)) {
        for (const child of node.childNodes) walk(child);
        return;
      }
      if (!(node instanceof Element)) return;
      if (SKIP.has(tagOf(node))) return;
      if (node.hasAttribute("data-wireframe-host") || node.hasAttribute("data-wireframe-status")) return;
      if (session.ignore && node.matches(session.ignore)) return;
      if (getComputedStyle(node).display === "contents") {
        const style = getComputedStyle(node);
        if (Number(style.opacity) < 0.05 || style.visibility === "hidden") return;
        for (const child of node.childNodes) walk(child);
        return;
      }
      const structural = node === document.body || node === document.documentElement;
      if (!structural && !shown(node)) return;
      const style = getComputedStyle(node);
      const kind = plateKind(node, style);
      if (kind) addPlate(node, kind, style);
      if (!REPLACED.has(tagOf(node))) {
        for (const bar of fieldBars(node)) {
          lines.push({
            key: `field:${idOf(node)}:${lines.length}`,
            kind: "line",
            box: { left: bar.left, top: bar.top, width: bar.width, height: bar.height },
            radius: `${bar.height / 2}px`,
            color: MARK,
          });
        }
      }
      if (node.shadowRoot) walk(node.shadowRoot);
      if (tagOf(node) === "IFRAME") {
        const doc = sameOriginDoc(node);
        if (doc?.body) walk(doc.body);
        return;
      }
      if (tagOf(node) === "SVG") return;
      for (const child of node.childNodes) walk(child);
    };

    walk(root);
    const groups = new Map();
    for (const rect of raw) {
      const key = idOf(rect.group || rect.parent);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(rect);
    }
    for (const [key, rects] of groups) {
      const merged = [];
      const sorted = rects.slice().sort((a, b) => a.top - b.top || a.left - b.left);
      for (const rect of sorted) {
        const line = merged.find((item) => Math.abs(item.top - rect.top) < 2 && Math.abs(item.height - rect.height) < 2);
        if (!line) merged.push({ top: rect.top, height: rect.height, parts: [rect], parent: rect.parent });
        else line.parts.push(rect);
      }
      let index = 0;
      for (const line of merged) {
        const parts = line.parts.sort((a, b) => a.left - b.left);
        let current = { ...parts[0] };
        const flush = () => {
          const fontSize = px(getComputedStyle(line.parent).fontSize) || current.height;
          const height = Math.min(current.height, Math.max(4, fontSize * LINE_EM));
          const top = current.top + (current.height - height) / 2;
          const width = Math.max(0, current.right - current.left);
          if (width < 0.5 || height < 0.5) {
            index += 1;
            return;
          }
          lines.push({
            key: `line:${key}:${index}`,
            kind: "line",
            box: { left: current.left, top, width, height },
            radius: `${height / 2}px`,
            color: MARK,
          });
          index += 1;
        };
        for (const part of parts.slice(1)) {
          if (part.left - current.right < 4) {
            current.right = Math.max(current.right, part.right);
            current.left = Math.min(current.left, part.left);
            current.top = Math.min(current.top, part.top);
            current.height = Math.max(current.height, part.height);
          } else {
            flush();
            current = { ...part };
          }
        }
        flush();
      }
    }
    return [...plates, ...lines];
  };

  const place = (node, shape) => {
    node.style.left = `${shape.box.left}px`;
    node.style.top = `${shape.box.top}px`;
    node.style.width = `${shape.box.width}px`;
    node.style.height = `${shape.box.height}px`;
    node.style.borderRadius = shape.radius;
    node.style.background = shape.color;
  };

  const sync = (items) => {
    const previousShapes = new Map(session.shapes.map((shape) => [shape.key, shape]));
    const next = [];
    for (const item of items) {
      let shape = previousShapes.get(item.key);
      if (!shape) {
        const node = document.createElement("div");
        node.className = "shape";
        node.dataset.kind = item.kind;
        session.layer.append(node);
        shape = { key: item.key, node };
      }
      shape.kind = item.kind;
      shape.box = item.box;
      shape.radius = item.radius;
      place(shape.node, item);
      previousShapes.delete(item.key);
      next.push(shape);
    }
    for (const shape of previousShapes.values()) shape.node.remove();
    session.shapes = next;
  };

  const rebuild = () => {
    if (!session || session.leaving) return;
    fitHost();
    sync(collect(session.root));
    if (session.hover?.isConnected) paintHover(session.hover);
    else {
      session.hover = null;
      session.hoverLayer.replaceChildren();
    }
  };

  const schedule = () => {
    if (!session || session.queued || session.leaving) return;
    session.queued = true;
    requestAnimationFrame(() => {
      if (!session) return;
      session.queued = false;
      rebuild();
    });
  };

  const fitHost = () => {
    if (!session) return;
    const right = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const bottom = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
    if (session.host.style.right !== `${right}px`) session.host.style.right = `${right}px`;
    if (session.host.style.bottom !== `${bottom}px`) session.host.style.bottom = `${bottom}px`;
  };

  const elementAt = (x, y) => {
    session.host.style.pointerEvents = "none";
    let el = document.elementFromPoint(x, y);
    if (el?.tagName === "IFRAME") {
      const doc = sameOriginDoc(el);
      if (doc) {
        const rect = el.getBoundingClientRect();
        el = doc.elementFromPoint(x - rect.left, y - rect.top) || el;
      }
    }
    session.host.style.pointerEvents = "auto";
    return el;
  };

  const resolveTarget = (el) => {
    if (!(el instanceof Element)) return null;
    if (el === document.documentElement || el === document.body) return null;
    if (el.closest("[data-wireframe-host], [data-wireframe-status]")) return null;
    if (session.ignore && el.closest(session.ignore)) return null;
    const svg = el.closest("svg");
    if (svg) return svg;
    return el;
  };

  const targetAt = (x, y) => {
    const next = resolveTarget(elementAt(x, y));
    if (session.hover?.isConnected) {
      const box = boxOf(session.hover);
      const inside = x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      const near = x >= box.left - 40 && x <= box.right + 40 && y >= box.top - 40 && y <= box.bottom + 40;
      if (!inside && near && next !== session.hover) return session.hover;
    }
    return next;
  };

  const paintHover = (el) => {
    session.hoverLayer.replaceChildren();
    if (!el?.isConnected) return;
    const read = readSpacing(el);
    const { box } = read;
    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.left = `${box.left}px`;
    fill.style.top = `${box.top}px`;
    fill.style.width = `${box.width}px`;
    fill.style.height = `${box.height}px`;
    fill.style.borderRadius = read.radius;
    session.hoverLayer.append(
      fill,
      rule(box.left - GUIDE, box.top, box.width + GUIDE * 2, 1),
      rule(box.left - GUIDE, box.bottom - 1, box.width + GUIDE * 2, 1),
      rule(box.left, box.top - GUIDE, 1, box.height + GUIDE * 2),
      rule(box.right - 1, box.top - GUIDE, 1, box.height + GUIDE * 2),
    );
    const placed = [];
    for (const segment of read.segments) paintSegment(segment, box, placed);
  };

  const rule = (x, y, width, height) => {
    const node = document.createElement("div");
    node.className = "guide";
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.width = `${Math.max(1, width)}px`;
    node.style.height = `${Math.max(1, height)}px`;
    return node;
  };

  const paintSegment = (segment, box, placed) => {
    const label = String(Math.round(segment.value));
    let x = segment.x;
    let y = segment.y;
    let width = segment.axis === "x" ? segment.length : 1;
    let height = segment.axis === "y" ? segment.length : 1;
    if (segment.lane === "top") y = box.top - LANE;
    if (segment.lane === "bottom") y = box.bottom + LANE;
    if (segment.lane === "left") x = box.left - LANE;
    if (segment.lane === "right") x = box.right + LANE;
    session.hoverLayer.append(rule(x, y, width, height));
    const tick = 8;
    if (segment.axis === "x") {
      session.hoverLayer.append(rule(x, y - tick / 2, 1, tick), rule(x + width, y - tick / 2, 1, tick));
    } else {
      session.hoverLayer.append(rule(x - tick / 2, y, tick, 1), rule(x - tick / 2, y + height, tick, 1));
    }
    const badgeWidth = Math.max(18, label.length * 8 + 10);
    let left = segment.axis === "x" ? x + width / 2 - badgeWidth / 2 : x - badgeWidth / 2;
    let top = segment.axis === "y" ? y + height / 2 - 9 : y - 9;
    if (segment.lane === "top") top = y - 22;
    if (segment.lane === "bottom") top = y + 6;
    if (segment.lane === "left") left = x - badgeWidth - 6;
    if (segment.lane === "right") left = x + 6;
    for (const other of placed) {
      const hit = Math.abs(other.left - left) < (other.width + badgeWidth) / 2 && Math.abs(other.top - top) < 18;
      if (!hit) continue;
      if (segment.lane === "bottom") top += 20;
      else top -= 20;
    }
    placed.push({ left, top, width: badgeWidth });
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = label;
    badge.style.left = `${left}px`;
    badge.style.top = `${top}px`;
    session.hoverLayer.append(badge);
  };

  const findScroller = (el, dy, dx) => {
    let node = el;
    while (node) {
      if (node instanceof Element) {
        const style = getComputedStyle(node);
        const y = ["auto", "scroll"].includes(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
        const x = ["auto", "scroll"].includes(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
        if ((dy && y) || (dx && x)) return node;
      }
      const root = node instanceof Element ? node.getRootNode() : null;
      if (node.parentElement) node = node.parentElement;
      else if (root instanceof ShadowRoot) node = root.host;
      else if (node.ownerDocument && node.ownerDocument !== document) node = node.ownerDocument.defaultView?.frameElement || null;
      else node = null;
    }
    return document.scrollingElement;
  };

  const onWheel = (event) => {
    if (!session || session.leaving) return;
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const dy = event.deltaY * scale;
    const dx = event.deltaX * scale;
    const scroller = findScroller(elementAt(event.clientX, event.clientY), dy, dx) || document.scrollingElement;
    scroller.scrollBy({ top: dy, left: dx, behavior: "auto" });
  };

  let lastTouch = null;
  const onTouchStart = (event) => {
    lastTouch = event.touches[0] || null;
  };
  const onTouchMove = (event) => {
    if (!session || !lastTouch) return;
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    const dx = lastTouch.clientX - touch.clientX;
    const dy = lastTouch.clientY - touch.clientY;
    lastTouch = touch;
    const scroller = findScroller(elementAt(touch.clientX, touch.clientY), dy, dx) || document.scrollingElement;
    scroller.scrollBy({ top: dy, left: dx, behavior: "auto" });
  };

  const onKey = (event) => {
    if (!session) return;
    if (event.key === "Escape") {
      event.preventDefault();
      exit();
      return;
    }
    const target = event.target;
    if (target instanceof Element && session.ignore && target.closest(session.ignore)) return;
    if (event.key === "Tab" || event.key === "Enter" || event.key === " ") event.preventDefault();
  };

  const onPointer = (event) => {
    if (!session || session.leaving) return;
    const next = targetAt(event.clientX, event.clientY);
    if (next === session.hover) return;
    session.hover = next;
    paintHover(next);
  };

  const onMutation = (records) => {
    if (!session) return;
    const relevant = records.some((record) => record.target !== session.host && !session.host.contains(record.target));
    if (relevant) schedule();
  };

  const announce = (text) => {
    let node = document.querySelector("[data-wireframe-status]");
    if (!node) {
      node = document.createElement("div");
      node.setAttribute("data-wireframe-status", "");
      node.setAttribute("role", "status");
      node.style.cssText = "position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
      document.documentElement.append(node);
    }
    statusToken += 1;
    node.dataset.token = String(statusToken);
    node.textContent = text;
    return node;
  };

  const liftIgnored = (selector) => {
    const records = [];
    for (const el of document.querySelectorAll(selector)) {
      if (el.hasAttribute("data-wireframe-status")) continue;
      records.push({ el, zIndex: el.style.zIndex, position: el.style.position });
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.zIndex = "2147483647";
    }
    return records;
  };

  const restoreLift = (records) => {
    for (const record of records) {
      record.el.style.zIndex = record.zIndex;
      record.el.style.position = record.position;
    }
  };

  const wipe = (host, from, to, duration) => {
    if (duration === 0) {
      host.style.clipPath = to;
      return Promise.resolve();
    }
    host.style.clipPath = from;
    const anim = host.animate(
      [{ clipPath: from }, { clipPath: to }],
      { duration, easing: "linear", fill: "forwards" },
    );
    return Object.assign(anim.finished.catch(() => {}), { cancel: () => anim.cancel() });
  };

  const removeCover = () => {
    if (!session) return;
    const { host, status, lift, restore, abort, observer } = session;
    session.leaving = null;
    session = null;
    abort.abort();
    observer.disconnect();
    host.getAnimations().forEach((anim) => anim.cancel());
    host.remove();
    restoreLift(lift);
    const token = status?.dataset.token;
    if (status) status.textContent = "Wireframe off";
    if (restore?.isConnected) restore.focus();
    window.setTimeout(() => {
      if (status?.dataset.token === token) status.remove();
    }, 600);
  };

  const enter = (options = {}) => {
    if (session?.leaving) return { ok: false, reason: "busy" };
    if (session) return { ok: true, done: session.entered, already: true };
    if (!isLocal() && options.allowRemote !== true) return { ok: false, reason: "local-only" };
    const root = options.root instanceof Element ? options.root : document.body;
    const ignore = options.ignore || "[data-wireframe-ignore]";
    const host = document.createElement("div");
    host.setAttribute("data-wireframe-host", "");
    host.setAttribute("aria-hidden", "true");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${CSS}</style><div class="shapes"></div><div class="hover"></div>`;
    Object.assign(host.style, {
      position: "fixed",
      zIndex: "2147483646",
      left: "0",
      top: "0",
      right: "0",
      bottom: "0",
      background: GROUND,
      overflow: "hidden",
      pointerEvents: "auto",
      cursor: "default",
      userSelect: "none",
      touchAction: "none",
      clipPath: "inset(0px 100% 0px 0px)",
    });
    const abort = new AbortController();
    const { signal } = abort;
    const observer = new MutationObserver(onMutation);
    const active = document.activeElement;
    const restore = active instanceof HTMLElement && active !== document.body && !active.closest(ignore) ? active : null;
    session = {
      host,
      layer: shadow.querySelector(".shapes"),
      hoverLayer: shadow.querySelector(".hover"),
      root,
      ignore,
      shapes: [],
      hover: null,
      lift: [],
      restore,
      abort,
      observer,
      queued: false,
      leaving: null,
      entered: null,
      enterAnim: null,
      status: null,
    };
    session.lift = liftIgnored(ignore);
    if (restore) restore.blur();
    session.status = announce("Wireframe on");
    rebuild();
    document.documentElement.append(host);
    fitHost();
    const duration = prefersReduced() ? 0 : WIPE_MS;
    let resolveEntered = () => {};
    session.entered = new Promise((resolve) => {
      resolveEntered = resolve;
    });
    const motion = wipe(host, "inset(0px 100% 0px 0px)", "inset(0px 0px 0px 0px)", duration);
    session.enterAnim = motion;
    motion.then(() => resolveEntered());
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "open"],
      characterData: true,
    });
    document.addEventListener("scroll", schedule, { capture: true, passive: true, signal });
    window.addEventListener("resize", schedule, { signal });
    window.visualViewport?.addEventListener("resize", schedule, { signal });
    window.visualViewport?.addEventListener("scroll", schedule, { signal });
    window.addEventListener("keydown", onKey, { signal });
    host.addEventListener("wheel", onWheel, { passive: false, signal });
    host.addEventListener("touchstart", onTouchStart, { passive: true, signal });
    host.addEventListener("touchmove", onTouchMove, { passive: false, signal });
    host.addEventListener("pointermove", onPointer, { signal });
    host.addEventListener("pointerleave", () => {
      if (!session) return;
      session.hover = null;
      session.hoverLayer.replaceChildren();
    }, { signal });
    document.addEventListener("load", schedule, { capture: true, signal });
    document.fonts?.ready.then(() => {
      if (session && !session.leaving) schedule();
    });
    return { ok: true, done: session.entered };
  };

  const exit = () => {
    if (!session) return Promise.resolve();
    if (session.leaving) return session.leaving;
    const current = session;
    current.leaving = (async () => {
      current.enterAnim?.cancel?.();
      await current.entered;
      if (!session || session !== current) return;
      const duration = prefersReduced() ? 0 : WIPE_MS;
      await wipe(current.host, "inset(0px 0px 0px 0px)", "inset(0px 0px 0px 100%)", duration);
      if (session === current) removeCover();
    })();
    return current.leaving;
  };

  const toggle = (options) => (session ? exit() : enter(options));

  const shapes = () => (session ? session.shapes.map((shape) => ({
    kind: shape.kind,
    x: shape.box.left,
    y: shape.box.top,
    width: shape.box.width,
    height: shape.box.height,
  })) : []);

  const destroy = () => {
    const done = exit();
    return Promise.resolve(done).then(() => {
      if (window.__wireframe === api) delete window.__wireframe;
    });
  };

  const api = {
    enter,
    exit,
    toggle,
    destroy,
    shapes,
    spacing,
    get active() {
      return Boolean(session);
    },
  };

  window.__wireframe = api;
})();
