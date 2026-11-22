---
name: keyboard
description: Walks a running page with the keyboard alone, records every focus stop and reports controls it cannot reach, see or operate.
disable-model-invocation: true
---

# Keyboard

This skill puts the mouse away and walks a running page with keys alone. It records every focus stop in order and returns a numbered report of what the keyboard cannot reach, see or operate.

## Every stop pressed, never read from the code

Focus order, reach and operation are judged from keys pressed in the running page. A stop the walk did not press is `Not verified`, never assumed. One unreachable control is a finding however minor the control.

How the focus ring is styled, sticky chrome that covers focus and accessible names belong to `defaults`. Dialog focus traps and how an overlay declares its dismissal belong to `overlays`. A failure there cites its id. Opening the running result belongs to `verify`. Forcing hidden states open belongs to `lab`.

## 1. Load the recorder

Open the page at the state the user named and click nothing. Pass the contents of [tabstops.js](tabstops.js) to the browser tool's evaluate call. It returns pointer targets with no keyboard way in, scrollers with nothing to focus, reordered containers and the skip link, then records each stop. Judging order or reach from the markup is `keyboard-press-the-keys`.

Send keys through trusted input, such as Playwright's `keyboard.press` or the operating system. A dispatched DOM `KeyboardEvent` never moves focus, so a walk with no stops means the keys never arrived. `window.__keyboard.keys` counts Tab presses as `trusted` and `untrusted`.

Loop the keys inside one script call rather than one tool call per key: `for (let i = 0; i < 60; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(50); }`. The 50ms wait lets the recorder read each ring two frames after focus.

## 2. Walk forward, then back

Press Tab from the top of the page until focus leaves it, then Shift+Tab back to the start. Read `window.__keyboard.stops` and call `window.__keyboard.highlight()`.

Stops follow the reading order of the layout. A jump from the header to the footer and back, or any positive `tabindex`, is `keyboard-order-follows-layout`. Search the CSS for `order:`, `row-reverse`, `column-reverse`, `grid-auto-flow: dense` and explicit `grid-row`, `grid-column` or `grid-area`. The recorder's `reordered` list names each container whose boxes land out of source order around two or more stops. Fix the source order, because `reading-flow` works only in Chromium.

Every stop shows an indicator on screen. A stop with no visible change is `keyboard-see-every-stop`. The recorder compares focused and unfocused paint after transitions settle, on the element, its `::before` and `::after` and any `:focus-within` ancestor. `ringSource` names where the ring was found.

A stop marked `shadowOnly` changed only a `box-shadow`, which forced colours drop, and cites `defaults-focus-outline`. A `ringWidth` under 2px cites `defaults-focus-keyboard-only`. A `ringStyle` of `auto` is the browser's own ring, which reads 1px however wide it draws.

The house bar is a 3:1 change between focused and unfocused pixels. That is WCAG 2.4.13, a AAA criterion. AA asks only for a visible indicator, under 2.4.7.

Every stop is something the user can see. Focus landing on links inside a closed drawer is `keyboard-no-hidden-stops`. The recorder marks a stop `obscured`, `fully` or `partly`, when sticky chrome, a banner or a toast covers it. Fully covered fails WCAG 2.4.11 at AA. Partly covered passes AA and fails only 2.4.12 at AAA. Either cites `defaults-clear-sticky-chrome`, and a stop with no name cites `defaults-name-icon-buttons`.

When navigation comes before the main content, the first stop is a skip link to it. It shows when focused, and after Enter the next Tab lands inside `main`. Twenty header stops before the first result is `keyboard-skip-link`. The recorder's `skipLink` reads `target: null` for a link to a missing id, and each stop's `inMain` shows where that next Tab landed.

## 3. Reach every control

Compare the stops against what the page shows and against the recorder's `unreachable` list. A clickable `div` the walk never lands on is `keyboard-reach-every-control`. A list that reorders only by dragging cites `motion-gesture-alternative`.

A region that scrolls but holds nothing focusable takes `tabindex="0"`, `role="region"` and an `aria-label`, because Safari never puts a scroller in the tab order. The recorder's `scrollers` list names each one. A code block that only a wheel can scroll is `keyboard-scroll-regions`.

Toasts sit in a region labelled "Notifications" that a documented shortcut, such as Alt+T, reaches. A toast's Undo the walk cannot reach is `keyboard-reach-toasts`.

An editor that keeps Tab for indenting lets Escape then Tab move focus to the next control, and says so beside the editor. A code editor that Tab enters and never leaves is `keyboard-leave-editors`.

## 4. Operate each control

Enter and Space press buttons, Enter follows links and Space toggles checkboxes and switches. A control that answers a click but no key is `keyboard-operate-every-control`.

Menus, tabs, radio groups, listboxes and grids take one Tab stop, and arrows move inside them. A menu where every item is its own Tab stop is `keyboard-arrows-inside-composites`.

Tab into a composite lands on its selected item, such as the active tab or the checked radio, and on the last focused cell of a grid. Home and End jump to the first and last item. Tab back into a tablist landing on the first tab while the third is selected is `keyboard-return-to-active-item`.

## 5. Open and close each overlay

Open each dialog, menu and popover from the keyboard. Focus moves inside, stays inside a modal and returns to the trigger on close. A failure cites `overlays-trap-and-return-focus`.

Press Escape in each one, and on each tooltip shown by focus. It closes the topmost layer only. An overlay that only a click can close is `keyboard-escape-closes`. Its fix follows `overlays-declare-closedby`.

## 6. Remove or navigate, then find focus

Delete a row, dismiss a toast, collapse a section and submit a form from the keyboard. Call `window.__keyboard.check()` after each action. It returns a `lost` stop when focus fell to `body` or the focused element left the page, which `focusout` does not report reliably. A lost stop is `keyboard-focus-survives-removal`.

Follow a link that changes the route without a full page load. Focus moves to the new page's `h1`, which takes `tabindex="-1"`, or to `main`. The next Tab starting from `body` or the old link is `keyboard-focus-after-route-change`. The first load of a page moves nothing.

## 7. Report the walk

Return the stops as a numbered list of role and name, with the screenshot showing the `highlight()` numbers. Cite each finding by its stop number and the key that failed. A finding with no stop and no key is `keyboard-numbered-walk`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `keyboard-press-the-keys` | "The markup uses buttons, so it is reachable" | The walk recorded with Tab and Shift+Tab | `HIGH` |
| `keyboard-order-follows-layout` | `tabindex="3"` on the search field | No positive `tabindex`, the field placed in reading order | `MEDIUM` |
| `keyboard-see-every-stop` | Stop 7 focused with no visible ring, or a ring at 1.4:1 against the unfocused pixels | Stop 7 showing the project's `:focus-visible` outline, a 3:1 change from unfocused | `MEDIUM` |
| `keyboard-no-hidden-stops` | Tab landing on links in the closed drawer | `inert` on the drawer while it is closed | `MEDIUM` |
| `keyboard-skip-link` | Twenty header stops before the first result | A `Skip to Content` link as stop 1 | `LOW` |
| `keyboard-reach-every-control` | `<div onClick={openRow}>` | `<button onClick={openRow}>` | `HIGH` |
| `keyboard-scroll-regions` | `<pre class="overflow-auto">` that only a wheel scrolls | `<pre tabindex="0" role="region" aria-label="Code Sample">` | `MEDIUM` |
| `keyboard-reach-toasts` | A toast's Undo that Tab never reaches | `aria-label="Notifications"` on the region, reached with Alt+T | `MEDIUM` |
| `keyboard-leave-editors` | A code editor that turns every Tab into an indent | Escape, then Tab, moving focus to the next control, with that hint beside the editor | `HIGH` |
| `keyboard-operate-every-control` | A switch that toggles on click only | Space toggles it | `HIGH` |
| `keyboard-arrows-inside-composites` | Eight Tab stops inside one menu | One stop, arrows move between items | `MEDIUM` |
| `keyboard-return-to-active-item` | Tab back into the tablist landing on `Overview` while `Billing` is selected | `tabindex="0"` on the selected tab and `tabindex="-1"` on the rest | `MEDIUM` |
| `keyboard-escape-closes` | A popover that closes on outside click only | Escape closes it and focus returns to the trigger | `MEDIUM` |
| `keyboard-focus-survives-removal` | Focus on `body` after deleting a row | Focus on the next row | `HIGH` |
| `keyboard-focus-after-route-change` | Focus on `body` after a client-side route change | `<h1 tabIndex={-1}>` focused once the new page renders | `MEDIUM` |
| `keyboard-numbered-walk` | "Keyboard support is patchy" | "Stop 12, Space does nothing on `Notifications`" | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause, numbered and citing the stop:

```
1. file:line - [rule-id] stop N, key, what is wrong
```

Cite the recorder's element when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark content inside cross-origin frames as `Not verified`.
