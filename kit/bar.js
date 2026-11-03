function stick(bar) {
  const mark = () => bar.toggleAttribute("data-stuck", scrollY > 0 && bar.getBoundingClientRect().top <= 0);
  addEventListener("scroll", mark, { passive: true });
  mark();
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--bar-height", `${bar.offsetHeight + 8}px`);
  }).observe(bar);
}
