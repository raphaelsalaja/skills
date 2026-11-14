// Babel probe. Run it through the browser's evaluate call after the page loads in each locale.
//   window.__babel.scan()        returns the findings for the current locale
//   window.__babel.highlight()   outlines each finding on the page
//   window.__babel.pseudo(text)  returns the pseudo-locale form of a string, 40% longer and bracketed
// Options: set window.__babelOptions = { root, icons, directional } before running.
(() => {
  if (window.__babel) return;
  const opts = Object.assign({ root: document.body, icons: "svg, [data-icon], img", directional: /(arrow|chevron|caret|back|forward|next|prev|previous|undo|redo|reply|external|login|logout|indent|outdent)/i }, window.__babelOptions);
  const root = opts.root;
  const round = (n) => Math.round(n * 10) / 10;
  const at = (f, el) => Object.defineProperty(f, "node", { value: el });
  const sel = (n) => {
    if (!n || n.nodeType !== 1) return n && n.parentElement ? sel(n.parentElement) : "";
    const id = n.id ? "#" + n.id : "";
    const cls = typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/)[0] : "";
    return n.tagName.toLowerCase() + id + cls;
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
  const textRect = (nodes) => {
    const r = document.createRange(); let box = null;
    for (const n of nodes) { r.selectNodeContents(n); for (const c of r.getClientRects()) box = box ? { left: Math.min(box.left, c.left), right: Math.max(box.right, c.right), top: Math.min(box.top, c.top), bottom: Math.max(box.bottom, c.bottom) } : { left: c.left, right: c.right, top: c.top, bottom: c.bottom }; }
    return box;
  };

  // 1. Text the box cannot hold: clipped, truncated or spilling out of its own box, and sideways page scroll.
  const overflow = () => {
    const out = [], de = document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) out.push({ kind: "page", el: "html", by: de.scrollWidth - de.clientWidth, text: "" });
    for (const el of root.querySelectorAll("*")) {
      if (/^(script|style|svg|path)$/i.test(el.tagName) || !visible(el)) continue;
      const nodes = ownText(el); if (!nodes.length && !el.textContent.trim()) continue;
      const cs = getComputedStyle(el), text = nodes.map((n) => n.textContent.trim()).join(" ").slice(0, 40);
      const hidesX = cs.overflowX !== "visible", hidesY = cs.overflowY !== "visible";
      const dx = el.scrollWidth - el.clientWidth, dy = el.scrollHeight - el.clientHeight;
      if (hidesX && dx > 1) { out.push(at({ kind: cs.textOverflow === "ellipsis" ? "truncated" : "clipped", el: sel(el), by: dx, text }, el)); continue; }
      if (hidesY && dy > 1) { out.push(at({ kind: "clipped", el: sel(el), by: dy, text }, el)); continue; }
      const t = nodes.length ? textRect(nodes) : null; if (!t) continue;
      const b = el.getBoundingClientRect(), px = (v) => parseFloat(v) || 0;
      const lo = b.left + px(cs.borderLeftWidth) + px(cs.paddingLeft), hi = b.right - px(cs.borderRightWidth) - px(cs.paddingRight);
      const side = Math.max(t.right - hi, lo - t.left);
      if (side > 1 && cs.display !== "inline") out.push(at({ kind: "spill", el: sel(el), by: round(side), text }, el));
    }
    return out;
  };

  // 2. Physical properties in the project's own rules.
  const SIDES = /^(margin|padding)-(left|right)$|^border-(left|right)(-(width|color|style))?$|^border-(top|bottom)-(left|right)-radius$|^(left|right)$/;
  const quad = (v) => v.trim().split(/\s+/);
  const physical = () => {
    const out = [], seen = new Set();
    const add = (rule, prop, value) => { const k = rule.selectorText + prop; if (!seen.has(k)) { seen.add(k); out.push({ selector: rule.selectorText, prop, value }); } };
    const walk = (rules) => {
      for (const r of rules) {
        if (r.cssRules && !(r instanceof CSSStyleRule)) { if (r instanceof CSSKeyframesRule) { for (const k of r.cssRules) if (/translate(X|3d)?\(/.test(k.style.transform || "")) add({ selectorText: "@keyframes " + r.name }, "transform", k.style.transform); } else walk(r.cssRules); continue; }
        if (!(r instanceof CSSStyleRule)) continue;
        try { if (!document.querySelector(r.selectorText.replace(/::?[a-z-]+(\([^)]*\))?/gi, ""))) continue; } catch (e) { continue; }
        const decls = r.cssText.slice(r.cssText.indexOf("{") + 1, r.cssText.lastIndexOf("}")).replace(/\/\*.*?\*\//g, "").split(";").map((d) => d.split(/:(.*)/s)).filter((d) => d[1]).map(([p, v]) => [p.trim(), v.trim()]);
        for (const [p, v] of decls) {
          if (SIDES.test(p) && !/^(0|0px|none|initial|unset|inherit)$/.test(v)) add(r, p, v);
          else if ((p === "text-align" || p === "float" || p === "clear") && /^(left|right)$/.test(v)) add(r, p, v);
          else if ((p === "margin" || p === "padding") && quad(v).length === 4 && quad(v)[1] !== quad(v)[3]) add(r, p, v);
          else if (p === "transform" && /translate(X|3d)?\(/.test(v)) add(r, p, v);
        }
      }
    };
    for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch (e) {} }
    return out;
  };

  // 3. Icons: which way they face against which way they should.
  const flipOf = (el) => { let s = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const t = getComputedStyle(n).transform; if (t && t !== "none") { const m = new DOMMatrix(t); if (m.a < 0) s *= -1; } } return s < 0; };
  const icons = () => {
    const dir = getComputedStyle(document.documentElement).direction, out = [];
    for (const el of root.querySelectorAll(opts.icons)) {
      if (!visible(el)) continue;
      const name = el.getAttribute("data-icon") || el.getAttribute("aria-label") || el.getAttribute("title") || (typeof el.className === "string" ? el.className : "") || el.getAttribute("src") || "";
      const directional = opts.directional.test(name), mirrored = flipOf(el);
      const want = dir === "rtl" && directional;
      out.push(at({ el: sel(el), name: name.trim().split(/\s+/)[0], directional, mirrored, ok: mirrored === want }, el));
    }
    return out;
  };

  // 4. Line breaks: lines that open on closing punctuation or a small kana, and Latin words cut in half.
  const NO_START = /[、。，．・：；？！）〕］｝〉》」』】ー゛゜ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ々〜]/;
  const WORD = /[A-Za-z0-9]/;
  const lines = () => {
    const out = [], r = document.createRange();
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const t = n.textContent; if (t.trim().length < 12 || !n.parentElement || !visible(n.parentElement)) continue;
      const cjk = /[\u3040-\u30ff\u3400-\u9fff]/.test(t);
      let top = null;
      for (let i = 0; i < Math.min(t.length, 600); i++) {
        r.setStart(n, i); r.setEnd(n, i + 1);
        const c = r.getClientRects()[0]; if (!c || /\s/.test(t[i])) continue;
        if (top !== null && c.top > top + c.height / 2) {
          if (cjk && NO_START.test(t[i])) out.push(at({ kind: "line-start", el: sel(n.parentElement), char: t[i], text: t.slice(Math.max(0, i - 6), i + 6) }, n.parentElement));
          if (i > 0 && WORD.test(t[i]) && WORD.test(t[i - 1])) { let a = i, b = i; while (a > 0 && WORD.test(t[a - 1])) a--; while (b < t.length && WORD.test(t[b])) b++; out.push(at({ kind: "split-word", el: sel(n.parentElement), word: t.slice(a, b), text: t.slice(Math.max(0, i - 6), i + 6) }, n.parentElement)); }
        }
        top = c.top;
      }
    }
    return out;
  };

  // 5. In the pseudo-locale, text without brackets is hard-coded.
  const untranslated = () => {
    const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const t = n.textContent.trim(); if (!t || !/\p{L}/u.test(t) || !n.parentElement || /^(script|style)$/i.test(n.parentElement.tagName) || !visible(n.parentElement)) continue;
      if (!t.startsWith("[")) out.push({ el: sel(n.parentElement), text: t.slice(0, 40) });
    }
    for (const el of root.querySelectorAll("input[placeholder]")) if (!el.placeholder.startsWith("[")) out.push({ el: sel(el), text: el.placeholder.slice(0, 40) });
    return out;
  };

  const MAP = { a: "á", b: "ƀ", c: "ç", d: "ð", e: "é", f: "ƒ", g: "ĝ", h: "ĥ", i: "í", j: "ĵ", k: "ķ", l: "ļ", m: "ɱ", n: "ñ", o: "ö", p: "þ", q: "ǫ", r: "ŕ", s: "š", t: "ţ", u: "ü", v: "ṽ", w: "ŵ", x: "ẋ", y: "ý", z: "ž" };
  const pseudo = (s) => "[" + s.replace(/\{[^}]+\}|[a-z]/gi, (c) => (c[0] === "{" ? c : c === c.toLowerCase() ? MAP[c] : MAP[c.toLowerCase()].toUpperCase())) + "~".repeat(Math.ceil(s.replace(/\{[^}]+\}/g, "").length * 0.4)) + "]";

  let last = null;
  window.__babel = {
    pseudo,
    scan() {
      const lang = document.documentElement.lang, dir = getComputedStyle(document.documentElement).direction;
      const o = overflow(), p = physical(), ic = icons(), l = lines(), u = /^en-XA/i.test(lang) ? untranslated() : [];
      last = { o, ic, l, u };
      const wrong = ic.filter((i) => !i.ok);
      return { lang, dir, dirAttr: document.documentElement.getAttribute("dir"), counts: { overflow: o.length, physical: p.length, icons: wrong.length, lines: l.length, hardCoded: u.length }, overflow: o, physical: p, icons: ic, wrongIcons: wrong, lines: l, hardCoded: u };
    },
    highlight() {
      if (!last) this.scan();
      const mark = (el, color) => { el.style.outline = "2px dashed " + color; el.style.outlineOffset = "1px"; };
      for (const f of last.o) if (f.node) mark(f.node, "#ff3b30");
      for (const f of last.ic) if (!f.ok) mark(f.node, "#ff9500");
      for (const f of last.l) mark(f.node, "#af52de");
      return last.o.length + last.ic.filter((i) => !i.ok).length + last.l.length;
    },
    clear() { document.querySelectorAll("[style*=outline]").forEach((e) => { e.style.outline = ""; e.style.outlineOffset = ""; }); },
  };
})();
