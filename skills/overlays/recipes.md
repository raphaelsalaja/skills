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
```

The backdrop stops wheel and touch scrolling from chaining to the page, so the root keeps its scrollbar and nothing shifts. Where a library still sets `overflow: hidden` on `body`, add `html { scrollbar-gutter: stable }` so the width holds.

## Dismissal

```html
<dialog id="edit" closedby="closerequest">
  <form method="dialog">
    <textarea name="note"></textarea>
    <button type="button" data-cancel>Cancel</button>
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

dialog.querySelector("[data-cancel]").addEventListener("click", () => {
  if (dialog.requestClose) return dialog.requestClose();
  const cancel = new Event("cancel", { cancelable: true });
  if (dialog.dispatchEvent(cancel)) dialog.close();
});
```

`showDiscardBar` shows Discard and Keep Editing inside the dialog, never a second dialog. Escape and the Cancel button both pass through `cancel`, so the guard holds where `closedby` or `requestClose()` is missing.

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

A popover is centred by default. Outside `@supports` it keeps that default, so a browser without anchor positioning still shows a usable menu.
