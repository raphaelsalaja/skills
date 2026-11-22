// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Lengthens every visible text run the way translation does, then returns { mode, stretched }.
// It finds nothing itself: run overflow.js again after each mode for the findings.
// Runs under 11 characters double, under 31 grow 60% and longer runs grow 40%.
// window.__stretch.run(mode) puts the original text back, then applies another case:
// "long" is the default, "unbreakable" swaps in values with no spaces, "short" the shortest values,
// "scripts" Vietnamese, Thai and Arabic, and "spacing" widens line, paragraph, letter and word spacing.
// Call window.__stretch.restore() afterwards to put the original text and spacing back.
(() => {
  window.__stretch?.restore();

  const originals = new Map();
  let style = null;
  const growth = (length) => (length < 11 ? 1 : length < 31 ? 0.6 : 0.4);
  const samples = {
    unbreakable: [
      "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      "IMG_20250914_183022_HDR_portrait_edited_edited.HEIC",
      "Benachrichtigungseinstellungen",
      "3f2b8c1e-9a4d-4e7f-b6c2-8d1a5e0f9b37",
      "https://example.com/search?q=quarterly+report&status=open&sort=updated_desc&utm_source=newsletter&utm_campaign=q3",
    ],
    short: ["J", "Jo", "a@b.test"],
    scripts: ["Đặng Thị Ngọc Hân", "สมศักดิ์ ใจดี", "نور الهدى عبد الرحمن"],
  };
  // Line height 1.5, paragraph spacing 2, letter spacing 0.12 and word spacing 0.16, each times the font size.
  const spacing = `
    * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
    p { margin-block-end: 2em !important; }
  `;

  const lengthen = (body) => {
    const extra = Math.ceil(body.length * growth(body.length));
    // Repeat the run's own letters so the added width matches its glyphs.
    const pad = body.repeat(Math.ceil(extra / body.length) + 1).slice(0, extra);
    return `${body} ${pad}`;
  };

  const textNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.textContent.trim() && !node.parentElement.closest("script, style, code, pre, textarea, [contenteditable]")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };

  const restore = () => {
    for (const [node, text] of originals) node.textContent = text;
    originals.clear();
    style?.remove();
    style = null;
  };

  const run = (mode = "long") => {
    if (mode !== "long" && mode !== "spacing" && !Object.hasOwn(samples, mode)) throw new Error(`Unknown mode: ${mode}`);
    restore();

    if (mode === "spacing") {
      style = document.createElement("style");
      style.textContent = spacing;
      document.head.append(style);
      return { mode, stretched: 0 };
    }

    textNodes().forEach((node, index) => {
      const text = node.textContent;
      const body = text.trim();
      const next = mode === "long" ? lengthen(body) : samples[mode][index % samples[mode].length];
      originals.set(node, text);
      node.textContent = text.replace(body, () => next);
    });

    return { mode, stretched: originals.size };
  };

  window.__stretch = { run, restore };

  return run();
})();
