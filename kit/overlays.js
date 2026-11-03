const toast = h("output", { class: "toast", popover: "manual" });
const tip = h("div", { class: "tip", popover: "manual", "aria-hidden": "true" });
document.body.append(toast, tip);

function hideToast() {
  clearTimeout(toast.hide);
  delete toast.dataset.open;
  toast.hide = setTimeout(() => toast.hidePopover(), 200);
}

function showToast(anchor, message, action) {
  clearTimeout(toast.hide);
  hideTip();
  delete toast.dataset.open;
  if (!toast.matches(":popover-open")) toast.showPopover();
  toast.replaceChildren(message, ...(action ? [action] : []));
  anchorTo(toast, anchor);
  toast.dataset.open = "";
  toast.hide = setTimeout(hideToast, action ? 5000 : 1600);
}

async function copy(text, anchor) {
  const tokens = Math.ceil(text.length / 4).toLocaleString();
  const message = await navigator.clipboard.writeText(text).then(
    () => `Copied · ~${tokens} tokens`,
    () => "Copy Failed",
  );
  showToast(anchor, message);
}

let tipTimer;
let tipClosedAt = 0;

function showTip(button) {
  clearTimeout(tipTimer);
  const warm = tip.matches(":popover-open") || performance.now() - tipClosedAt < 300;
  const open = () => {
    const key = button.dataset.key;
    tip.replaceChildren(button.dataset.tip || button.getAttribute("aria-label"), ...(key ? [h("kbd", {}, key)] : []));
    tip.toggleAttribute("data-instant", warm);
    if (!tip.matches(":popover-open")) tip.showPopover();
    anchorTo(tip, button);
  };
  if (warm) open();
  else tipTimer = setTimeout(open, 500);
}

function hideTip() {
  clearTimeout(tipTimer);
  if (!tip.matches(":popover-open")) return;
  tipClosedAt = performance.now();
  tip.hidePopover();
}

const tipped = (event) => event.target.closest?.("[data-tip]");
document.addEventListener("pointerover", (event) => {
  const button = tipped(event);
  if (button && event.pointerType === "mouse" && !button.contains(event.relatedTarget)) showTip(button);
});
document.addEventListener("pointerout", (event) => {
  const button = tipped(event);
  if (button && !button.contains(event.relatedTarget)) hideTip();
});
document.addEventListener("focusin", (event) => {
  const button = tipped(event);
  if (button?.matches(":focus-visible")) showTip(button);
});
document.addEventListener("focusout", (event) => tipped(event) && hideTip());
document.addEventListener("pointerdown", hideTip);
