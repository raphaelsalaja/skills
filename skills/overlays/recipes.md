# Recipes

Code for the overlays in `SKILL.md`. Swap the literal values for the project's tokens where they exist.

## Top layer

```html
<button command="show-modal" commandfor="shortcuts">Shortcuts</button>

<dialog id="shortcuts" closedby="any" aria-labelledby="shortcuts-title">
  <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
  <dl>…</dl>
  <button command="close" commandfor="shortcuts">Close</button>
</dialog>

<button popovertarget="sort-menu">Sort</button>

<ul id="sort-menu" popover>
  <li><button>Newest</button></li>
  <li><button>Oldest</button></li>
</ul>
```

`dialog.showModal()` from script does what `command="show-modal"` does. The dialog holds nothing to lose, so `closedby="any"` lets an outside click close it. A form dialog takes `closedby="closerequest"` instead, as in [Dismissal](#dismissal). A `popover` with no value is `auto`, so opening another one closes it, and an outside click or Escape dismisses it. Toasts take `popover="manual"`, so opening a menu leaves them alone.

## Scroll lock

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}

html {
  scrollbar-gutter: stable;
}

html:has(dialog:modal) {
  overflow: hidden;
}
```

The backdrop stops wheel and touch scrolling from chaining to the page in Chrome 144 and Firefox 150 onward. Safari only honours `overscroll-behavior` on a box that can scroll, so the `:has()` rule locks the root there. The stable gutter, which `defaults` owns, keeps the width when the root's scrollbar goes. Test on an iPhone by scrolling over the backdrop and inside a short dialog.

## Dismissal

```html
<dialog id="edit" closedby="closerequest">
  <form method="dialog">
    <textarea name="note"></textarea>
    <button type="button" commandfor="edit" command="request-close" data-cancel>Cancel</button>
    <button value="save">Save</button>
  </form>
</dialog>
```

```js
const dialog = document.querySelector("#edit");
let dirty = false;

dialog.addEventListener("input", () => {
  dirty = true;
});

dialog.addEventListener("cancel", (event) => {
  if (!dirty) return;
  event.preventDefault();
  showDiscardBar();
});

if (!("commandForElement" in HTMLButtonElement.prototype)) {
  dialog.querySelector("[data-cancel]").addEventListener("click", () => {
    if (dialog.requestClose) return dialog.requestClose();
    const cancel = new Event("cancel", { cancelable: true });
    if (dialog.dispatchEvent(cancel)) dialog.close();
  });
}
```

`command="request-close"` fires `cancel` before closing, so the Cancel button needs no script where commands exist. Chrome honours `preventDefault()` on `cancel` only once per user activation, so a second Escape closes the dialog. Keep the draft on `close` too, so that Escape loses nothing. `showDiscardBar` shows Discard and Keep Editing inside the dialog, never a second dialog. Escape and the Cancel button both pass through `cancel`, so the guard holds where `closedby` is missing.

## Anchor positioning

```css
.sort-button {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  max-block-size: calc(100dvh - 16px);
  overflow-y: auto;
}

@supports (position-area: block-end) {
  .sort-menu {
    inset: auto;
    margin: 8px 0;
  }
}
```

Each fallback flips the menu to a side where it fits. When none fits, `position-area` shifts it along the edge to stay inside the viewport. `max-block-size` caps it so it always fits and scrolls inside. The block margin keeps 8px from the trigger and from the top and bottom of the viewport.

A popover is centred by default. Outside `@supports` it keeps that default, so an older browser without anchor positioning still shows a usable menu.

## Tooltip

```html
<button aria-describedby="due-tip" data-tip="due-tip">Due 3 Dec</button>
<div id="due-tip" popover="hint" role="tooltip">Thursday 3 December 2026, 17:00</div>
```

```css
[role="tooltip"] {
  overflow: visible;
}

[role="tooltip"]::before {
  content: "";
  position: absolute;
  inset: -8px;
}
```

```js
let timer;
let closedAt = 0;
let current = null;

function hide() {
  clearTimeout(timer);
  if (!current) return;
  current.hidePopover();
  current = null;
  closedAt = performance.now();
}

document.querySelectorAll("[data-tip]").forEach((trigger) => {
  const tip = document.getElementById(trigger.dataset.tip);
  const open = () => {
    current = tip;
    if (!tip.matches(":popover-open")) tip.showPopover({ source: trigger });
  };
  const show = () => {
    clearTimeout(timer);
    const warm = current !== null || performance.now() - closedAt < 300;
    if (warm) open();
    else timer = setTimeout(open, 500);
  };
  const leave = (event) => {
    if (trigger.contains(event.relatedTarget) || tip.contains(event.relatedTarget)) return;
    hide();
  };

  trigger.addEventListener("pointerenter", show);
  trigger.addEventListener("focus", show);
  trigger.addEventListener("pointerleave", leave);
  tip.addEventListener("pointerleave", leave);
  trigger.addEventListener("blur", hide);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hide();
});
```

The tooltip adds detail the label lacks, so it describes the button rather than repeating its name. `source` makes the trigger its implicit anchor, so `position-area` places it with no `anchor-name`.

The first tooltip opens after 500ms. While one is open, or closed under 300ms ago, the next opens at once. The `::before` spans the gap to the trigger, and `relatedTarget` keeps the tooltip open while the pointer is over either, so no close delay is needed. Escape closes it from anywhere. Where `hint` is unsupported the popover falls back to `manual`, which these listeners already close.
