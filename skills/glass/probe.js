// Run in the page (init script, DevTools console or page.evaluate). It measures the contrast of text on glass
// from a real screenshot, because a blurred, refracted backdrop cannot be read from any style.
//
//   const surfaces = window.__glass.surfaces(".glass");   // surfaces and their text runs, in CSS pixels
//   window.__glass.hideText();                              // text goes transparent, the glass stays
//   const png = await screenshot();                         // viewport screenshot at device scale 1
//   window.__glass.showText();
//   const readings = await window.__glass.read(pngDataUrl, surfaces);
//
// Each reading is { surface, text, colour, ratio, min, left, top }. `ratio` is the contrast of the text colour against the
// 5th-percentile pixel under the text, which is what the worst letter on screen sees. `min` is the single worst
// pixel. Scroll to each position of the sweep and repeat, then keep the three lowest `ratio` values as the
// worst-case backdrops.
(() => {
  const STYLE_ID = "__glass-hide-text";

  const parse = (value) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "rgba(0, 0, 0, 0)";
    g.fillStyle = value;
    g.fillRect(0, 0, 1, 1);
    const [r, gr, b, a] = g.getImageData(0, 0, 1, 1).data;
    return { r, g: gr, b, a: a / 255 };
  };
  const channel = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const lum = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const hex = ({ r, g, b }) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  const round = (v) => Math.round(v * 100) / 100;

  const label = (el) => {
    let part = el.tagName.toLowerCase();
    if (el.id) part += `#${el.id}`;
    else if (el.classList.length) part += `.${el.classList[0]}`;
    return part;
  };

  window.__glass = {
    surfaces(selector = "[data-glass], .glass") {
      return [...document.querySelectorAll(selector)].map((el) => {
        const runs = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent.trim();
          const host = node.parentElement;
          if (!text || getComputedStyle(host).visibility === "hidden") continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const style = getComputedStyle(host);
          for (const r of range.getClientRects()) {
            if (r.width < 2 || r.height < 2) continue;
            runs.push({ text: text.slice(0, 32), colour: style.color, left: r.left, top: r.top, width: r.width, height: r.height });
          }
        }
        return { surface: label(el), runs };
      });
    },
    hideText() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = "[data-glass] *, .glass * { color: transparent !important; text-shadow: none !important; }";
      document.head.append(style);
    },
    showText() { document.getElementById(STYLE_ID)?.remove(); },
    async read(dataUrl, surfaces) {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const scale = img.naturalWidth / innerWidth;
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const out = [];
      for (const surface of surfaces) {
        for (const run of surface.runs) {
          const x = Math.max(0, Math.floor(run.left * scale));
          const y = Math.max(0, Math.floor(run.top * scale));
          const w = Math.min(c.width - x, Math.ceil(run.width * scale));
          const h = Math.min(c.height - y, Math.ceil(run.height * scale));
          if (w < 1 || h < 1) continue; // scrolled out of the screenshot
          const text = parse(run.colour);
          const data = g.getImageData(x, y, w, h).data;
          const ratios = [];
          for (let i = 0; i < data.length; i += 4) {
            const pixel = { r: data[i], g: data[i + 1], b: data[i + 2], a: 1 };
            ratios.push(ratio(over(text, pixel), pixel));
          }
          ratios.sort((a, b) => a - b);
          out.push({ surface: surface.surface, text: run.text, colour: hex(text), ratio: round(ratios[Math.floor(ratios.length * 0.05)]), min: round(ratios[0]), left: Math.round(run.left), top: Math.round(run.top) });
        }
      }
      return out;
    },
  };
})();
