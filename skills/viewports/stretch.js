// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Lengthens every visible text run the way translation does, then returns { stretched }.
// Runs under 11 characters double, under 31 grow 60% and longer runs grow 40%.
// Call window.__stretch.restore() afterwards to put the original text back.
(() => {
  const originals = new Map();
  const growth = (length) => (length < 11 ? 1 : length < 31 ? 0.6 : 0.4);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent.trim() && !node.parentElement.closest("script, style, code, pre, textarea, [contenteditable]")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const text = node.textContent;
    const body = text.trim();
    const extra = Math.ceil(body.length * growth(body.length));
    // Repeat the run's own letters so the added width matches its glyphs.
    const pad = body.repeat(Math.ceil(extra / body.length) + 1).slice(0, extra);
    originals.set(node, text);
    node.textContent = text.replace(body, `${body} ${pad}`);
  }

  window.__stretch = {
    restore() {
      for (const [node, text] of originals) node.textContent = text;
      originals.clear();
    },
  };

  return { stretched: originals.size };
})();
