---
name: contract
description: Drives hand-built widgets with real keys and pointer events against a behaviour contract for each pattern, then fixes every check that fails.
---

# Contract

This skill presses real keys and pointer events on every hand-built dialog, menu, combobox, tabs and sortable list. It checks each against the behaviour its pattern promises, fixes the cause and runs the board again.

## Every check pressed, none read from the markup

A widget passes when the events pass, not when the markup looks right. The contracts below are exact. Run them after any hand-built widget, and whenever the user says a dropdown, modal or menu feels broken.

Whether Tab reaches a control at all belongs to `keyboard`. A widget the project or the platform already provides belongs to `reuse`, and rebuilding it by hand cites `reuse-library-before-custom`. Focus rings, accessible names, scroll containment and the dialog's own defaults belong to `defaults`. Opening the result belongs to `verify`.

## 1. Name the widgets

List each hand-built widget: `role` attributes, `onKeyDown` handlers, and `div` or `span` elements with a click handler that open something. Name the pattern for each one. A widget with no named pattern, or one checked against a neighbour's contract, is `contract-name-the-pattern`.

## 2. Pick the contract

Each pattern has one contract. Apply all of its rows.

| Pattern | The contract |
| --- | --- |
| Dialog | Focus moves inside on open. Tab and Shift+Tab never leave it. Escape closes it. Focus returns to the trigger. The page behind takes no press. A drag that starts inside and ends on the backdrop keeps it open. |
| Menu | Enter and ArrowDown open it onto the first item, ArrowUp onto the last. Arrows move and wrap, Home and End jump, and only one item is a Tab stop. Typing a name moves to the item that starts with it. Enter runs the item. Escape closes it and focus returns to the trigger. A press outside closes it. |
| Combobox | The input has `role="combobox"`, `aria-expanded` and `aria-controls` naming a `listbox`. ArrowDown moves `aria-activedescendant` while focus stays in the input. Enter picks the active option. A click picks an option. The first Escape closes the list and the second clears the text. |
| Tabs | One tab is a Tab stop. Arrows wrap, Home and End jump, and selection follows focus. Each tab names its panel with `aria-controls`, and only the selected panel shows. |
| Sortable list | Space lifts an item, arrows move it and Space drops it. Escape puts it back. A pointer drag reorders and drops on release. A live region announces the lift, each move and the drop. |

Tabs whose panels fetch data select on Enter or Space instead of on focus. Say so in the report.

## 3. Run the board

Run [contracts.mjs](contracts.mjs) with a Playwright page and one object per widget. The header of the file lists the selectors each pattern takes. It reloads the page before every check, so no check starts from another's leftovers.

It uses real key and pointer events. A call to `element.click()`, `dispatchEvent` or `focus()` standing in for a key is `contract-press-real-keys`. Starting a check from `focus()` is allowed, since the contract starts from a focused control.

Return the board as one row per check with its rule id, the result and the detail. A failure with no key or press in its detail is not finished.

## 4. Dialog

Focus in, the trap and the return cite `defaults-trap-and-return-focus`, and Escape cites `keyboard-escape-closes`. Those two skills own the rule. This board only presses the keys.

A control behind the dialog that a press can reach, even though the backdrop looks solid, is `contract-dialog-background-inert`. Put `inert` on the page while the dialog is open.

A backdrop that closes on `click` with a target check also closes when the press started inside the dialog. That is `contract-dialog-outside-press`. Close only when `pointerdown` and `click` both landed on the backdrop.

## 5. Menu

The keys that open it are `contract-menu-open-keys`. Opening with Enter and ArrowDown focuses the first item. Opening with ArrowUp focuses the last.

Items take `tabindex="-1"`, and arrows move focus with wrap. Eight Tab stops, or an arrow that stops at the end, is `contract-menu-roving-focus`.

Typing keeps a buffer that resets after 500ms. A menu that ignores letters is `contract-menu-typeahead`.

Enter and Space run the focused item. A `div` item that only has `onClick` is `contract-menu-enter-activates`.

Closing by any route puts focus back on the trigger. Focus left on `body` is `contract-menu-close-returns-focus`. A press outside closes the menu, and a menu that waits for Escape is `contract-menu-outside-press`.

## 6. Combobox

The roles are `contract-combobox-roles`. The input is the only focused element, so options never take focus. Moving through them sets `aria-activedescendant`, and a missing one is `contract-combobox-active-descendant`.

Enter picks the active option and closes the list. A list that stays open or a value that stays as typed is `contract-combobox-enter-selects`.

A press on an option moves focus first, and a list that closes on `blur` unmounts under the click. Keep focus in the input with `mousedown` and `preventDefault`. Otherwise it is `contract-combobox-pointer-select`.

Escape clears the text only when the list is already closed. One Escape that does both is `contract-combobox-escape-order`.

## 7. Tabs

The tab list is one Tab stop with roving `tabindex`. Three tabs that all take Tab is `contract-tabs-one-stop`.

Arrows move focus and selection, wrapping at both ends. Home and End jump. A tab list that ignores arrows is `contract-tabs-arrows`.

Each tab names its panel and the panel has `role="tabpanel"`. A panel hidden by class with no `aria-controls` link is `contract-tabs-panel-link`.

## 8. Sortable list

Space and the arrows reorder with no pointer. A list that only drags is `contract-sortable-keyboard-reorder`.

Escape returns the item to where it was lifted. A list where Escape leaves it in the new place is `contract-sortable-escape-cancels`.

A pointer drag moves the item under the pointer and drops it on release. A drag that leaves the order unchanged is `contract-sortable-pointer-drag`.

The live region says "Lifted", the new position on each move and "Dropped". Silence is `contract-sortable-announce`.

## 9. Fix and run it again

Fix the shared primitive the widget is built from, so each sibling inherits it. The sweep after that fix belongs to `reuse`, and it cites `reuse-fix-in-the-primitive`. Run the whole board again and report the count before and after, with one line for each failure and its fix. A fix reported without the second run is `contract-run-it-again`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `contract-name-the-pattern` | A tab list judged against the menu contract | Pattern named, then its own contract |
| `contract-press-real-keys` | `item.click()` to test Enter | `keyboard.press("Enter")` on the focused item |
| `contract-dialog-background-inert` | A press on `Save` reaches the page behind the dialog | `inert` on the page while the dialog is open |
| `contract-dialog-outside-press` | `onclick={e => e.target === backdrop && close()}` | Close when `pointerdown` and `click` both hit the backdrop |
| `contract-menu-open-keys` | ArrowDown on the trigger does nothing | ArrowDown opens onto the first item |
| `contract-menu-roving-focus` | `tabindex="0"` on all four items | `tabindex="-1"`, arrows with wrap, Home and End |
| `contract-menu-typeahead` | Typing "du" leaves focus on `Rename` | Focus moves to `Duplicate` |
| `contract-menu-enter-activates` | A `div` item with `onClick` only | Enter and Space call the item's action |
| `contract-menu-close-returns-focus` | Focus on `body` after Escape | `trigger.focus()` on every close |
| `contract-menu-outside-press` | The menu stays open after a press elsewhere | A `pointerdown` outside closes it |
| `contract-combobox-roles` | A bare `input` and a `div` list | `role="combobox"`, `aria-expanded`, `aria-controls` and `role="listbox"` |
| `contract-combobox-active-descendant` | A `.hl` class on the option, nothing on the input | `aria-activedescendant="opt-1"` on the input |
| `contract-combobox-enter-selects` | Enter leaves the list open | Enter sets the value and closes the list |
| `contract-combobox-pointer-select` | `onBlur` hides the list before the click lands | `onMouseDown={e => e.preventDefault()}` on each option |
| `contract-combobox-escape-order` | One Escape clears the text and closes the list | First Escape closes, second clears |
| `contract-tabs-one-stop` | Three tabs, three Tab stops | `tabindex="0"` on the selected tab, `-1` on the rest |
| `contract-tabs-arrows` | ArrowRight does nothing | ArrowRight focuses and selects the next tab, wrapping |
| `contract-tabs-panel-link` | `.on` on the panel, no `aria-controls` | `aria-controls` and `role="tabpanel"` on the panel |
| `contract-sortable-keyboard-reorder` | A list that only reorders by drag | Space, arrows and Space reorder it |
| `contract-sortable-escape-cancels` | Escape leaves the item in the new place | Escape restores the lifted index |
| `contract-sortable-pointer-drag` | A drag handler that never reorders | The item follows the pointer and drops on release |
| `contract-sortable-announce` | No `aria-live` text during a move | "Lifted", "Moved to position 2" and "Dropped" |
| `contract-run-it-again` | "Keys work now" | The board rerun, with the count before and after |

## Reporting

**Severity.** `HIGH` is a keyboard or pointer path that cannot finish the task. That is a menu with no way to choose an item or a combobox that cannot pick. It is also a dialog the page behind still takes presses from, or a list that cannot be reordered without a pointer. `MEDIUM` is a missing wrap, typeahead, announcement or `aria` link, focus lost on close, or a press that closes more than it should. `LOW` is a report with no second run.

**Format.** One finding per root cause, with the key or press that failed:

```
1. file:line - [rule-id] widget, key or press, what is wrong
```

Cite the widget's selector when the source line is not found. Then a `Rule | Count | Severity` summary and the board count before and after, such as `5 of 25` then `25 of 25`. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a widget inside a cross-origin frame as `Not verified`.
