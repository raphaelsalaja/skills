---
name: overlays
description: Builds dialogs, menus, popovers, tooltips, sheets and toasts on the browser's top layer, with declared dismissal and a page that never moves.
---

# Overlays

This skill holds how layers above the page open, sit and close. It covers dialogs, menus, popovers, tooltips, sheets, toasts, banners, scroll lock and dismissal.

## The platform first, then these values

Build blocking overlays on `<dialog>` and the rest on `popover`, unless the project's component library already provides them. Where no token exists, the offsets, counts and durations here are exact. An overlay clipped by an ancestor or a page that shifts as one opens is a finding in any style.

Shadows, rings, scroll fades and focus rings inside an overlay belong to `defaults`, and so do live regions and undo. A form inside a dialog belongs to `forms`, and so does the guard on leaving a changed form. How an overlay enters, exits and drags belongs to `motion`, and backdrop contrast belongs to `color`. Walking overlays from the keyboard belongs to `keyboard`, and a dialog taller than a short screen belongs to `viewports`.

## Overlays live in the top layer

A blocking overlay is a `<dialog>` opened with `showModal()`, or by `command="show-modal"` and `commandfor`. Menus, tooltips and toasts use the `popover` attribute. On the top layer, a modal makes the page inert, traps focus, closes on Escape or the back gesture and returns focus on close. The `open` attribute and `show()` give a non-modal dialog that leaves the page live, so a blocking dialog never uses either.

A portal with `z-index: 9999`, `role="dialog"`, `aria-modal` or a hand-written trap is `overlays-top-layer`, unless the project's component library provides it. See [recipes.md](recipes.md#top-layer).

## Dialogs hold focus

Focus left on the page behind an open dialog, or not returned to its trigger on close, is `overlays-trap-and-return-focus`.

Focus starts on the element marked `autofocus`, such as the first field of a form. A dialog whose text runs past its first screen focuses its heading instead, set to `tabindex="-1"`, so the start stays in view. A long dialog that opens scrolled down to its first button is `overlays-initial-focus`.

## Dialogs say what they are and how to leave

A dialog takes its name from its visible heading through `aria-labelledby`. A dialog announced only as "dialog" is `overlays-name-the-dialog`.

Every dialog and sheet has a visible Close or Cancel button in its tab order. Escape and outside clicks are invisible, and a touch screen has no Escape key. A dialog that closes only by Escape or a click on the backdrop is `overlays-visible-close`. The button that stands in for a sheet's drag belongs to `motion`.

## One dialog at a time

Never open a dialog on top of a dialog. Use a menu, a popover or a new page. That is `overlays-no-stacked-dialogs`.

No dialog opens on page load. A startup problem, such as being offline, shows cached content with a quiet inline marker. A modal greeting every visit is `overlays-no-dialog-on-load`.

## Dialog buttons keep one order

A dialog footer puts Cancel on the left as a secondary button and the primary action outermost on the right. `Save` left of `Cancel` is `overlays-button-order`. Keeping one primary button per footer belongs to `color`.

## Destructive buttons are never the default

A destructive button is never the default or autofocused, so focus starts on Cancel and Enter never deletes. The rarest and worst actions, such as deleting a workspace, require typing the object's name. A Delete button with `autofocus` is `overlays-destructive-not-default`.

## Locking scroll never moves the page

A modal locks the page in CSS, with `overscroll-behavior: contain` on `dialog:modal` and `overflow: hidden; overscroll-behavior: contain` on `dialog::backdrop`. Safari ignores `overscroll-behavior` on a box that cannot scroll, so `html:has(dialog:modal)` also takes `overflow: hidden`. Never set `position: fixed` on `body`, because the page jumps to the top and back.

The lock moves nothing behind the dialog, so hiding the root's scrollbar relies on the stable gutter that `defaults` owns. A page that shifts or jumps as a dialog opens is `overlays-stable-gutter`. See [recipes.md](recipes.md#scroll-lock).

## Outside clicks never lose work

A click outside closes an overlay only when nothing would be lost. A dialog with unsaved input, or a destructive confirm, closes only from its own buttons and Escape. A form dialog that drops typed text on an outside click is `overlays-safe-outside-press`.

Each dialog declares its dismissal. `closedby="any"` allows an outside click, and a dialog holding changes takes `closedby="closerequest"` with a guard in its `cancel` handler. Its Cancel button takes `command="request-close"`, or calls `requestClose()`, so the same guard runs. Safari lacks `closedby`, so the guard stays in `cancel`. Chrome lets a page cancel `cancel` only once per user activation, so a second Escape closes a dirty dialog anyway. So the first Escape shows the confirm inside the dialog and keeps the draft, rather than relying on `preventDefault()` alone. One Escape closes one layer, the topmost, which the top layer does on its own. A `mousedown` or Escape `keydown` listener on the document deciding what closes is `overlays-declare-closedby`. See [recipes.md](recipes.md#dismissal).

## Anchored overlays stay on screen

A menu or popover that does not fit flips to the other side of its trigger. Then it shifts along the edge, then caps its height and scrolls inside. It keeps 8px from its trigger and from the top and bottom of the viewport. A menu cut off at the bottom of the window is `overlays-flip-then-shift`.

Anchored overlays position with CSS anchor positioning, `position-area` and `position-try-fallbacks`, and `max-block-size` caps them. Gate `inset: auto` and the margin in `@supports`, so an older browser without anchor positioning still shows the popover centred. Leave `position-visibility` at its default rather than `always`, so a menu hides once its trigger scrolls out of view. A scroll listener recomputing `top` and `left` is `overlays-anchor-in-css`. See [recipes.md](recipes.md#anchor-positioning).

## One popover at a time

Only one popover is open at a time. Clicking another trigger closes the open one and opens the new one in the same click, which `popover="auto"` does on its own. A menu bar that needs two clicks to move between menus is `overlays-popover-switch`.

Submenus go one level deep. A submenu past about five items becomes its own menu. A submenu that opens a third level is `overlays-one-submenu-level`.

A submenu stays open while the pointer moves diagonally toward it across its siblings. Keep a triangle from the pointer to the submenu's near edge, and drop it after 300ms or once the pointer leaves it. A submenu that closes as the pointer cuts across the next item is `overlays-submenu-safe-path`.

## Menus hold commands, navigation holds links

`role="menu"` holds commands, with `menuitem` children and arrow keys between them. A dropdown of site links is a disclosure instead: a button with `aria-expanded` and a plain list of `<a href>`. A navigation dropdown built as `role="menu"` around links is `overlays-menu-for-commands`.

## Tooltips hold a label

A tooltip holds a short label and nothing to click. Anything with a link or a button is a popover, opened by a click. A tooltip holding a link is `overlays-tooltip-is-a-label`.

A tooltip is `popover="hint"` with `role="tooltip"`, tied to its trigger by `aria-describedby`, so opening it leaves an open menu alone. A tooltip that only repeats an icon button's `aria-label` skips `aria-describedby`, so the name is not read twice. Safari treats `hint` as `manual`, so the script closes it on blur, leave and Escape. A hover tooltip on `popover="auto"` that closes the open menu is `overlays-tooltip-hint`. See [recipes.md](recipes.md#tooltip).

A tooltip opens on keyboard focus as well as hover, and never closes on a timer. A tooltip that only a pointer can open is `overlays-tooltip-on-focus`.

A tooltip never holds the only copy of something the user needs, because a touch screen has no hover. A plan limit, a price or a warning also shows in the page. A storage limit shown only in a hover tooltip is `overlays-tooltip-not-only-copy`.

A disabled button carries no tooltip, because it takes no focus and keyboard users never reach it. Put the reason beside it as text, or keep it focusable with `aria-disabled="true"` and ignore its clicks. A tooltip explaining a `disabled` button is `overlays-no-tooltip-on-disabled`.

Content shown on hover stays open while the pointer is over its trigger or itself, and closes with Escape. A preview card that vanishes in the gap to its trigger is `overlays-hover-content-stays`.

## Phones get sheets

Below 600px a dialog holding content or a form opens as a bottom sheet. Alerts stay centred at every width. A centred form dialog at 375 is `overlays-sheet-on-phones`.

## Only blocking overlays dim the page

A dialog or sheet dims the page with black at 25–50%. Menus, popovers and tooltips dim nothing. A dimmed page behind a dropdown is `overlays-backdrop-only-modal`.

## One banner at a time

A page shows one banner at a time, in normal flow below the main navigation. It never sticks or stacks, and the next one waits until it closes. Two banners stacked above the header, or one pinned with `position: sticky`, is `overlays-one-banner`.

## Toasts queue

At most three toasts show at once, and the rest queue. A routine toast stays 4–6 seconds and pauses while hovered, focused or while `document.visibilityState` is `"hidden"`. Six toasts stacked at once is `overlays-toast-budget`. Toasts sit 24px from the viewport edge, and 16px below 600px wide.

A toast carrying an action, such as Undo or Retry, or a critical message never closes on a timer. It stays until dismissed or used, with one action of two words or fewer and at most three lines. The action is also reachable outside the toast, such as Restore in the trash. An Undo toast gone after 5 seconds is `overlays-action-toast-stays`. A `popover="manual"` toast outside an open modal is inert, so an action toast opens inside the dialog or after it closes.

A repeat toast with a stable id updates the one on screen. Three identical "Saved" toasts stacked is `overlays-toast-in-place`. A loading toast that must end in success or failure belongs to `states`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `overlays-top-layer` | `createPortal(<Menu />, document.body)` with `z-index: 9999` | `<ul popover>` opened by `popovertarget` | `MEDIUM` |
| `overlays-trap-and-return-focus` | Tab reaching the page behind a dialog | Focus kept inside, then returned to the trigger | `HIGH` |
| `overlays-initial-focus` | A terms dialog opening scrolled to its `Accept` button | `<h2 tabindex="-1" autofocus>` at the top of the dialog | `MEDIUM` |
| `overlays-name-the-dialog` | `<dialog>` with a heading and no name, read as "dialog" | `<dialog aria-labelledby="rename-title">` pointing at its `<h2 id="rename-title">` | `MEDIUM` |
| `overlays-visible-close` | A dialog that closes only on Escape or a backdrop click | A visible `Close` button in its header, or `Cancel` in its footer | `HIGH` |
| `overlays-no-stacked-dialogs` | A confirm dialog opened from a settings dialog | A menu or popover inside the dialog | `HIGH` |
| `overlays-no-dialog-on-load` | An offline dialog on startup | Cached content with an inline `Offline` marker | `MEDIUM` |
| `overlays-button-order` | `Save` on the left, `Cancel` on the right | `Cancel` secondary on the left, `Save` primary on the far right | `MEDIUM` |
| `overlays-destructive-not-default` | `<button autofocus>Delete</button>` in a confirm | Focus on `Cancel`, and typing the name for the worst cases | `HIGH` |
| `overlays-stable-gutter` | `overflow: hidden` on `body` shifting the page 15px, or `position: fixed` jumping it to the top | `overscroll-behavior: contain` on `dialog:modal` and its backdrop, and `html:has(dialog:modal) { overflow: hidden }` over a stable gutter | `MEDIUM` |
| `overlays-safe-outside-press` | A form dialog that closes on an outside click and drops the text | Outside clicks ignored while the form has changes | `HIGH` |
| `overlays-declare-closedby` | `document.addEventListener("mousedown", closeIfOutside)` | `<dialog closedby="any">`, or `closedby="closerequest"` with a `cancel` guard and `command="request-close"` on Cancel | `MEDIUM` |
| `overlays-flip-then-shift` | A menu cut off at the bottom of the window | Flipped above its trigger, then shifted, then capped and scrolling | `HIGH` |
| `overlays-anchor-in-css` | A `scroll` listener setting `style.top` and `style.left` | `position-area` with `position-try-fallbacks` and `max-block-size` | `LOW` |
| `overlays-popover-switch` | Two clicks to move from one open menu to the next | `popover="auto"`, the next menu opening in the same click | `MEDIUM` |
| `overlays-one-submenu-level` | A submenu opening a third level | One submenu level, a long one split into its own menu | `LOW` |
| `overlays-submenu-safe-path` | `onPointerEnter={() => setOpen(item.id)}` on every item, closing the submenu mid-diagonal | A pointer triangle toward the open submenu, ignored entries inside it, dropped after 300ms | `MEDIUM` |
| `overlays-menu-for-commands` | `<ul role="menu">` holding `<a role="menuitem" href="/pricing">` in the site header | `<button aria-expanded="false">Products</button>` and a `<ul>` of `<a href>` | `MEDIUM` |
| `overlays-tooltip-is-a-label` | A tooltip holding a `Learn More` link | A popover opened by a click | `HIGH` |
| `overlays-tooltip-hint` | `<div popover="auto" role="tooltip">` closing the open menu on hover | `<div popover="hint" role="tooltip" id="tip">` with `aria-describedby="tip"` on the trigger | `MEDIUM` |
| `overlays-tooltip-on-focus` | A tooltip on `mouseenter` only, gone after 3 seconds | Open on `focus` and hover, closed on blur, leave or Escape | `HIGH` |
| `overlays-tooltip-not-only-copy` | "10 GB limit" only in a tooltip on the storage meter | "4.2 of 10 GB" printed beside the meter | `HIGH` |
| `overlays-no-tooltip-on-disabled` | A tooltip on a `disabled` Publish button | "Add a title to publish" beside the button, or `aria-disabled="true"` | `MEDIUM` |
| `overlays-hover-content-stays` | A preview card that closes in the gap to its trigger | The card open while the pointer crosses onto it | `MEDIUM` |
| `overlays-sheet-on-phones` | A centred form dialog at 375 | A bottom sheet below 600px | `MEDIUM` |
| `overlays-backdrop-only-modal` | A dimmed page behind a dropdown | No backdrop on menus and popovers | `MEDIUM` |
| `overlays-one-banner` | A trial banner and an outage banner stacked in a sticky header | One banner in flow below the navigation, the next queued | `MEDIUM` |
| `overlays-toast-budget` | Six toasts stacked at once | Three visible, the rest queued, timers paused while the tab is hidden | `MEDIUM` |
| `overlays-action-toast-stays` | An `Undo` toast gone after 5 seconds | The toast held until dismissed or used, with `Restore` in the trash as well | `HIGH` |
| `overlays-toast-in-place` | Three identical "Saved" toasts stacked | `toast("Saved", { id: "save" })` updating the one on screen | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open each overlay from a pointer and from the keyboard when a check depends on behaviour, and mark every check you could not run as `Not verified`.
