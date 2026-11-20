---
name: overlays
description: Builds dialogs, menus, popovers, tooltips, sheets and toasts on the browser's top layer, with declared dismissal and a page that never moves.
---

# Overlays

This skill holds how layers above the page open, sit and close. It covers dialogs, menus, popovers, tooltips, sheets, toasts, banners, scroll lock and dismissal.

## The platform first, then these values

Build blocking overlays on `<dialog>` and the rest on `popover`, unless the project's component library already provides them. Where no token exists, the offsets, counts and durations here are exact. An overlay clipped by an ancestor or a page that shifts as one opens is a finding in any style.

Shadows, rings, scroll fades and focus rings inside an overlay belong to `defaults`, and so do live regions and undo. A form inside a dialog belongs to `forms`. How an overlay enters, exits and drags belongs to `motion`, and backdrop contrast belongs to `color`. Walking overlays from the keyboard belongs to `keyboard`.

## Overlays live in the top layer

A blocking overlay is a `<dialog>` opened with `showModal()`, or by `command="show-modal"` and `commandfor`. Menus, tooltips and toasts use the `popover` attribute. On the top layer, a modal makes the page inert, traps focus, closes on Escape or the back gesture and returns focus on close.

A portal with `z-index: 9999`, `role="dialog"`, `aria-modal` or a hand-written trap is `overlays-top-layer`, unless the project's component library provides it. See [recipes.md](recipes.md#top-layer).

## Dialogs hold focus

A modal moves focus inside on open, keeps Tab inside and returns focus to its trigger on close. Focus left on the page behind an open dialog is `overlays-trap-and-return-focus`.

## One dialog at a time

Never open a dialog on top of a dialog. Use a menu, a popover or a new page. That is `overlays-no-stacked-dialogs`.

No dialog opens on page load. A startup problem, such as being offline, shows cached content with a quiet inline marker. A modal greeting every visit is `overlays-no-dialog-on-load`.

## Dialog buttons keep one order

A dialog footer puts Cancel on the left as a secondary button and the one primary action outermost on the right. A dialog never holds two primary buttons. `Save` left of `Cancel`, or two filled buttons in one footer, is `overlays-button-order`.

## Destructive buttons are never the default

A destructive button is never the default or autofocused, so focus starts on Cancel and Enter never deletes. The rarest and worst actions, such as deleting a workspace, require typing the object's name. A Delete button with `autofocus` is `overlays-destructive-not-default`.

## Locking scroll never moves the page

A modal locks the page in CSS, with `overscroll-behavior: contain` on `dialog:modal` and `overflow: hidden; overscroll-behavior: contain` on `dialog::backdrop`. Never set `overflow: hidden` or `position: fixed` on `html` or `body`. Where a library still locks scroll itself, `scrollbar-gutter: stable` on the root holds the layout. A centred layout jumping 15px as a dialog opens is `overlays-stable-gutter`. See [recipes.md](recipes.md#scroll-lock).

## Outside clicks never lose work

A click outside closes an overlay only when nothing would be lost. A dialog with unsaved input, or a destructive confirm, closes only from its own buttons and Escape. A form dialog that drops typed text on an outside click is `overlays-safe-outside-press`.

Each dialog declares its dismissal. `closedby="any"` allows an outside click, and a dialog holding changes takes `closedby="closerequest"` with a guard in its `cancel` handler. Its Cancel button calls `requestClose()`, so the same guard runs. Safari lacks `closedby`, so the guard stays in `cancel`. A `mousedown` listener on the document deciding what closes is `overlays-declare-closedby`. See [recipes.md](recipes.md#dismissal).

## Anchored overlays stay on screen

A menu or popover that does not fit flips to the other side of its trigger. Then it shifts along the edge, then caps its height and scrolls inside. It keeps 8px from the viewport edge. A menu cut off at the bottom of the window is `overlays-flip-then-shift`.

Anchored overlays position with CSS anchor positioning, `position-area` and `position-try-fallbacks: flip-block, flip-inline`. Gate `inset: auto; margin: 0` in `@supports`, so a browser without anchor positioning, such as Firefox, still shows the popover centred. A scroll listener recomputing `top` and `left` is `overlays-anchor-in-css`. See [recipes.md](recipes.md#anchor-positioning).

## One popover at a time

Only one popover is open at a time. Clicking another trigger closes the open one and opens the new one in the same click, which `popover="auto"` does on its own. A menu bar that needs two clicks to move between menus is `overlays-popover-switch`.

Submenus go one level deep. A submenu past about five items becomes its own menu. A submenu that opens a third level is `overlays-one-submenu-level`.

## Tooltips hold a label

A tooltip holds a short label and nothing to click. Anything with a link or a button is a popover, opened by a click. A tooltip holding a link is `overlays-tooltip-is-a-label`.

A tooltip opens on keyboard focus as well as hover, and never closes on a timer. A tooltip that only a pointer can open is `overlays-tooltip-on-focus`.

A disabled button carries no tooltip, because it takes no focus and keyboard users never reach it. Put the reason beside it as text, or keep it focusable with `aria-disabled="true"` and ignore its clicks. A tooltip explaining a `disabled` button is `overlays-no-tooltip-on-disabled`.

Content shown on hover stays open while the pointer crosses onto it, and closes with Escape. A preview card that vanishes in the gap to its trigger is `overlays-hover-content-stays`.

## Phones get sheets

Below 600px a dialog holding content or a form opens as a bottom sheet. Alerts stay centred at every width. A centred form dialog at 375 is `overlays-sheet-on-phones`.

## Only blocking overlays dim the page

A dialog or sheet dims the page with black at 25–50%. Menus, popovers and tooltips dim nothing. A dimmed page behind a dropdown is `overlays-backdrop-only-modal`.

## One banner at a time

A page shows one banner at a time, in normal flow below the main navigation. It never sticks or stacks, and the next one waits until it closes. Two banners stacked above the header, or one pinned with `position: sticky`, is `overlays-one-banner`.

## Toasts queue

At most three toasts show at once, and the rest queue. A routine toast stays 4–6 seconds and pauses while hovered, focused or while `document.visibilityState` is `"hidden"`. Six toasts stacked at once is `overlays-toast-budget`. Toasts sit 24px from the viewport edge, and 16px below 600px wide.

A toast carrying an action, such as Undo or Retry, or a critical message never closes on a timer. It stays until dismissed or used, with one action of two words or fewer and at most three lines. The action is also reachable outside the toast, such as Restore in the trash. An Undo toast gone after 5 seconds is `overlays-action-toast-stays`.

A repeat toast with a stable id updates the one on screen. Three identical "Saved" toasts stacked is `overlays-toast-in-place`.

A loading toast always resolves to success or failure. A saving toast that spins on after the request ends is `overlays-toast-resolves`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `overlays-top-layer` | `createPortal(<Menu />, document.body)` with `z-index: 9999` | `<ul popover>` opened by `popovertarget` |
| `overlays-trap-and-return-focus` | Tab reaching the page behind a dialog | Focus kept inside, then returned to the trigger |
| `overlays-no-stacked-dialogs` | A confirm dialog opened from a settings dialog | A menu or popover inside the dialog |
| `overlays-no-dialog-on-load` | An offline dialog on startup | Cached content with an inline `Offline` marker |
| `overlays-button-order` | `Save` on the left, `Cancel` on the right, both filled | `Cancel` secondary on the left, `Save` the one primary on the far right |
| `overlays-destructive-not-default` | `<button autofocus>Delete</button>` in a confirm | Focus on `Cancel`, and typing the name for the worst cases |
| `overlays-stable-gutter` | `overflow: hidden` on `body` shifting the page 15px | `dialog:modal { overscroll-behavior: contain }` and `dialog::backdrop { overflow: hidden; overscroll-behavior: contain }` |
| `overlays-safe-outside-press` | A form dialog that closes on an outside click and drops the text | Outside clicks ignored while the form has changes |
| `overlays-declare-closedby` | `document.addEventListener("mousedown", closeIfOutside)` | `<dialog closedby="any">`, or `closedby="closerequest"` with a `cancel` guard |
| `overlays-flip-then-shift` | A menu cut off at the bottom of the window | Flipped above its trigger, then shifted, then capped and scrolling |
| `overlays-anchor-in-css` | A `scroll` listener setting `style.top` and `style.left` | `position-area` with `position-try-fallbacks: flip-block, flip-inline` |
| `overlays-popover-switch` | Two clicks to move from one open menu to the next | `popover="auto"`, the next menu opening in the same click |
| `overlays-one-submenu-level` | A submenu opening a third level | One submenu level, a long one split into its own menu |
| `overlays-tooltip-is-a-label` | A tooltip holding a `Learn More` link | A popover opened by a click |
| `overlays-tooltip-on-focus` | A tooltip on `mouseenter` only, gone after 3 seconds | Open on `focus` and hover, closed on blur, leave or Escape |
| `overlays-no-tooltip-on-disabled` | A tooltip on a `disabled` Publish button | "Add a title to publish" beside the button, or `aria-disabled="true"` |
| `overlays-hover-content-stays` | A preview card that closes in the gap to its trigger | The card open while the pointer crosses onto it |
| `overlays-sheet-on-phones` | A centred form dialog at 375 | A bottom sheet below 600px |
| `overlays-backdrop-only-modal` | A dimmed page behind a dropdown | No backdrop on menus and popovers |
| `overlays-one-banner` | A trial banner and an outage banner stacked in a sticky header | One banner in flow below the navigation, the next queued |
| `overlays-toast-budget` | Six toasts stacked at once | Three visible, the rest queued, timers paused while the tab is hidden |
| `overlays-action-toast-stays` | An `Undo` toast gone after 5 seconds | The toast held until dismissed or used, with `Restore` in the trash as well |
| `overlays-toast-in-place` | Three identical "Saved" toasts stacked | `toast("Saved", { id: "save" })` updating the one on screen |
| `overlays-toast-resolves` | A loading toast left spinning after the request fails | The same toast turned into the failure, with `Retry` |

## Reporting

**Severity.** `HIGH` breaks use or access. That is a stacked dialog, focus that escapes a dialog or an overlay cut off by the window or an ancestor. It is also an outside click that drops typed work, a destructive button that Enter can trigger, a tooltip holding a link or one only a pointer can open. It is also a tooltip on a disabled button, or an action toast that closes on a timer.

`MEDIUM` is a portal at `z-index: 9999`, a page that shifts or scrolls behind a modal, hover content that vanishes or a centred form dialog on a phone. It is also a dialog on page load, dismissal written by hand, a backdrop behind a menu, two clicks between menus or a toast that never resolves. It is also more than three toasts, or repeat toasts that stack. It is also Cancel and the primary action out of order, two primary buttons in one dialog or banners that stack or stick.

`LOW` is an overlay positioned by a scroll listener or a submenu two levels deep.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open each overlay from a pointer and from the keyboard when a check depends on behaviour, and mark every check you could not run as `Not verified`.
