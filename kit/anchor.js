function anchorTo(popover, anchor) {
  const rect = anchor.getBoundingClientRect();
  const frame = (anchor.closest("[data-frame]") ?? anchor).getBoundingClientRect();
  const half = popover.offsetWidth / 2;
  const edge = document.documentElement.clientWidth - 8;
  const below = frame.top < popover.offsetHeight + 16;
  popover.style.left = `${Math.min(edge - half, Math.max(8 + half, rect.left + rect.width / 2))}px`;
  popover.style.top = `${below ? frame.bottom + 8 : frame.top - 8 - popover.offsetHeight}px`;
  popover.dataset.side = below ? "below" : "above";
}
