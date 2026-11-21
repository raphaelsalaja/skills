# Recipes

Code for the overlays in `SKILL.md`. Swap the literal values for the project's tokens where they exist.

## Top layer

```html
<button command="show-modal" commandfor="rename">Rename</button>

<dialog id="rename" closedby="any">
  <form method="dialog">
    <label>Name <input name="name" /></label>
    <button value="cancel" formnovalidate>Cancel</button>
    <button value="save">Save</button>
  </form>
</dialog>

<button popovertarget="sort-menu">Sort</button>

<ul id="sort-menu" popover>
  <li><button>Newest</button></li>
  <li><button>Oldest</button></li>
</ul>
```

`dialog.showModal()` from script does what `command="show-modal"` does. A `popover` with no value is `auto`, so opening another one closes it, and an outside click or Escape dismisses it. Toasts take `popover="manual"`, so opening a menu leaves them alone.

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

The backdrop stops wheel and touch scrolling from chaining to the page in Chrome 144 and Firefox 150 onward. Safari only honours `overscroll-behavior` on a box that can scroll, so the `:has()` rule locks the root there. The stable gutter keeps the width when the root's scrollbar goes. Test on an iPhone by scrolling over the backdrop and inside a short dialog.

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

`command="request-close"` fires `cancel` before closing, so the Cancel button needs no script where commands exist. `showDiscardBar` shows Discard and Keep Editing inside the dialog, never a second dialog. Escape and the Cancel button both pass through `cancel`, so the guard holds where `closedby` is missing.

## Anchor positioning

```css
.sort-button {
  anchor-name: --sort;
}

.sort-menu {
  position-anchor: --sort;
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline;
}

@supports (position-area: block-end) {
  .sort-menu {
    inset: auto;
    margin: 0;
  }
}
```

A popover is centred by default. Outside `@supports` it keeps that default, so an older browser without anchor positioning still shows a usable menu.

## Tooltip

```html
<button aria-describedby="due-tip" data-tip="due-tip">Due 3 Dec</button>
<div id="due-tip" popover="hint" role="tooltip">Thursday 3 December 2026, 17:00</div>
```

```js
document.querySelectorAll("[data-tip]").forEach((trigger) => {
  const tip = document.getElementById(trigger.dataset.tip);
  const show = () => tip.showPopover({ source: trigger });
  const hide = () => tip.hidePopover();

  trigger.addEventListener("pointerenter", show);
  trigger.addEventListener("focus", show);
  trigger.addEventListener("pointerleave", hide);
  trigger.addEventListener("blur", hide);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
});
```

The tooltip adds detail the label lacks, so it describes the button rather than repeating its name. `source` makes the trigger its implicit anchor, so `position-area` places it with no `anchor-name`. Where `hint` is unsupported the popover falls back to `manual`, which these listeners already close. Hover content that must stay open while the pointer crosses onto it needs a short close delay, which belongs to `motion`.
