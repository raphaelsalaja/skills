---
name: keyboard
description: Walks a running page with the keyboard alone, records every focus stop and reports controls it cannot reach, see or operate.
disable-model-invocation: true
---

# Keyboard

This skill puts the mouse away and walks a running page with keys alone. It records every focus stop in order and returns a numbered report of what the keyboard cannot reach, see or operate.

## Every stop pressed, never read from the code

Focus order, reach and operation are judged from keys pressed in the running page. A stop the walk did not press is `Not verified`, never assumed. One unreachable control is a finding however minor the control.

How the focus ring is styled, sticky chrome that covers focus and accessible names belong to `defaults`. Dialog focus traps belong to `overlays`. A failure there cites its id. Opening the running result belongs to `verify`. Forcing hidden states open belongs to `lab`.

## 1. Load the recorder

Open the page at the state the user named and click nothing. Run [tabstops.js](tabstops.js) through the browser's evaluate call. It returns pointer targets with no keyboard way in and scrollers with nothing to focus, then records each stop as keys are pressed. Judging order or reach from the markup is `keyboard-press-the-keys`.

Send keys through trusted input, such as Playwright's `keyboard.press` or the operating system. A dispatched DOM `KeyboardEvent` never moves focus, so a walk with no stops means the keys never arrived.

## 2. Walk forward, then back

Press Tab from the top of the page until focus leaves it, then Shift+Tab back to the start. Read `window.__keyboard.stops` and call `window.__keyboard.highlight()`.

Stops follow the reading order of the layout. A jump from the header to the footer and back, or any positive `tabindex`, is `keyboard-order-follows-layout`. Search the CSS for `order:`, `row-reverse`, `column-reverse` and `grid-auto-flow: dense`, which move boxes but not their stops. Fix the source order, because `reading-flow` works only in Chromium.

Every stop shows an indicator on screen whose pixels change by 3:1 from the unfocused state. A stop with no visible ring is `keyboard-see-every-stop`. The recorder's `ringWidth` gives the outline thickness, and one under 2px cites `defaults-focus-keyboard-only`. Focus landing on links inside a closed drawer is `keyboard-no-hidden-stops`. A stop with no name cites `defaults-name-icon-buttons`.

The recorder marks a stop `obscured`, fully or partly, when sticky chrome, a banner or a toast covers it. An obscured stop cites `defaults-clear-sticky-chrome`.

When navigation comes before the main content, the first stop is a skip link to it. It shows when focused, and after Enter the next Tab lands inside `main`. Twenty header stops before the first result is `keyboard-skip-link`.

## 3. Reach every control

Compare the stops against what the page shows and against the recorder's `unreachable` list. A clickable `div` the walk never lands on is `keyboard-reach-every-control`. A list that reorders only by dragging cites `motion-gesture-alternative`.

A region that scrolls but holds nothing focusable takes `tabindex="0"`, `role="region"` and an `aria-label`, because Safari never puts a scroller in the tab order. The recorder's `scrollers` list names each one. A code block that only a wheel can scroll is `keyboard-scroll-regions`.

Toasts sit in a region labelled "Notifications" that a documented shortcut, such as Alt+T, reaches. An editor that keeps Tab for indenting lets Escape then Tab leave it. A toast's Undo the walk cannot reach, or an editor Tab never leaves, is `keyboard-reach-toasts`.

## 4. Operate each control

Enter and Space press buttons, Enter follows links and Space toggles checkboxes and switches. A control that answers a click but no key is `keyboard-operate-every-control`.

Menus, tabs, radio groups, listboxes and grids take one Tab stop, and arrows move inside them. A menu where every item is its own Tab stop is `keyboard-arrows-inside-composites`.

Tab into a composite lands on its selected item, such as the active tab or the checked radio, and on the last focused cell of a grid. Home and End jump to the first and last item. Tab back into a tablist landing on the first tab while the third is selected is `keyboard-return-to-active-item`.

Escape closes the open menu, popover, sheet or dialog. An overlay that only a click can close is `keyboard-escape-closes`.

## 5. Open and close each overlay

Open each dialog, menu and popover from the keyboard. Focus moves inside, stays inside a modal and returns to the trigger on close. A failure cites `overlays-trap-and-return-focus`.

## 6. Remove or navigate, then find focus

Delete a row, dismiss a toast, collapse a section and submit a form from the keyboard. Focus lands on a neighbour, the container or the result. A stop the recorder marks `lost`, with focus left on `body`, is `keyboard-focus-survives-removal`.

Follow a link that changes the route without a full page load. Focus moves to the new page's `h1`, which takes `tabindex="-1"`, or to `main`. The next Tab starting from `body` or the old link is `keyboard-focus-after-route-change`. The first load of a page moves nothing.

## 7. Report the walk

Return the stops as a numbered list of role and name, with the screenshot showing the `highlight()` numbers. Cite each finding by its stop number and the key that failed. A finding with no stop and no key is `keyboard-numbered-walk`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `keyboard-press-the-keys` | "The markup uses buttons, so it is reachable" | The walk recorded with Tab and Shift+Tab |
| `keyboard-order-follows-layout` | `tabindex="3"` on the search field | No positive `tabindex`, the field placed in reading order |
| `keyboard-see-every-stop` | Stop 7 focused with no visible ring, or a ring at 1.4:1 against the unfocused pixels | Stop 7 showing the project's `:focus-visible` outline, a 3:1 change from unfocused |
| `keyboard-no-hidden-stops` | Tab landing on links in the closed drawer | `inert` on the drawer while it is closed |
| `keyboard-skip-link` | Twenty header stops before the first result | A `Skip to Content` link as stop 1 |
| `keyboard-reach-every-control` | `<div onClick={openRow}>` | `<button onClick={openRow}>` |
| `keyboard-scroll-regions` | `<pre class="overflow-auto">` that only a wheel scrolls | `<pre tabindex="0" role="region" aria-label="Code Sample">` |
| `keyboard-reach-toasts` | A toast's Undo that Tab never reaches | `aria-label="Notifications"` on the region, reached with Alt+T |
| `keyboard-operate-every-control` | A switch that toggles on click only | Space toggles it |
| `keyboard-arrows-inside-composites` | Eight Tab stops inside one menu | One stop, arrows move between items |
| `keyboard-return-to-active-item` | Tab back into the tablist landing on `Overview` while `Billing` is selected | `tabindex="0"` on the selected tab and `tabindex="-1"` on the rest |
| `keyboard-escape-closes` | A popover that closes on outside click only | Escape closes it and focus returns to the trigger |
| `keyboard-focus-survives-removal` | Focus on `body` after deleting a row | Focus on the next row |
| `keyboard-focus-after-route-change` | Focus on `body` after a client-side route change | `<h1 tabIndex={-1}>` focused once the new page renders |
| `keyboard-numbered-walk` | "Keyboard support is patchy" | "Stop 12, Space does nothing on `Notifications`" |

## Reporting

**Severity.** `HIGH` is a control the keyboard cannot reach or operate, an editor Tab cannot leave or focus lost to `body` after an action. `MEDIUM` is a stop out of reading order, a stop with no visible ring or a stop hidden off screen. It is also a composite with a Tab stop per item, or an overlay Escape does not close. It is also a composite that forgets its selected item, a scroller Tab never reaches or focus left behind after a route change. `LOW` is a missing skip link, or a report without numbered stops. It is also a toast region with no name or no shortcut.

**Format.** One finding per root cause, numbered and citing the stop:

```
1. file:line - [rule-id] stop N, key, what is wrong
```

Cite the recorder's element when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark content inside cross-origin frames as `Not verified`.
