---
name: defaults
description: Applies house defaults for scroll edges, surfaces, corners, focus, app chrome motion, hotkeys and stacked dialogs.
---

# Defaults

This skill holds the interface defaults that apply on every screen. It covers edges, surfaces, focus, keys, chrome motion and overlays.

## Tokens first, then these values

Use the project's token wherever one exists for a value below. Where none exists, the values here are exact. A hard scroll cut or a clipped shadow is a finding in any style.

Words belong to `copy`. Building any of these with the project's primitive belongs to `reuse`.

## Scroll edges fade

A scroll container fades at its ends with a `mask-image` gradient. A hard cut at the overflow edge is `defaults-fade-not-cut`. The recipe is in [recipes.md](recipes.md#scroll-fade).

## Shadows are never cut off

Give a scroller enough padding that its children's shadows fit inside it. A shadow clipped by `overflow: hidden` is `defaults-no-clipped-shadow`. See [recipes.md](recipes.md#room-for-shadows).

## Code and tables scroll, never wrap

Code blocks and data tables scroll sideways with a hidden scrollbar. A wrapping code line is `defaults-scroll-not-wrap`. See [recipes.md](recipes.md#sideways-scroll).

## Floating surfaces take a shadow, not a border

A popover, menu or card that floats takes a shadow alone. A border and a shadow together is `defaults-shadow-only`.

## Rounded, not pill

Buttons and chips use the radius token. `border-radius: 9999px` is `defaults-rounded-not-pill`.

## No decoration

Drop decorative gradients, glows, blur and depth effects. A glow behind a card is `defaults-no-decoration`.

## Focus rings for the keyboard only

Use `:focus-visible` with `outline`. A ring on every click is `defaults-focus-keyboard-only`.

## Hotkeys stay out of inputs

Hotkeys do not fire while an input, a textarea or an editable element has focus. That is `defaults-keys-ignore-inputs`. See [recipes.md](recipes.md#hotkey-guard).

## App chrome fades

Page switches, panels and loading states fade with `opacity` and do not slide or scale. That is `defaults-opacity-for-chrome`. Animate only the axis that changes. Animating width when only height changes is `defaults-changing-axis-only`.

## Entrances do not replay

Switching pages does not replay entrances. Set `initial={false}` on the route-level `AnimatePresence`. That is `defaults-no-replay-on-entry`. A cached view renders at once, with no fade or skeleton flash. That is `defaults-no-flash-on-return`. See [recipes.md](recipes.md#route-transitions).

## One dialog at a time

Never open a dialog on top of a dialog. Use a menu, a popover or a new page. That is `defaults-no-stacked-dialogs`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `defaults-fade-not-cut` | `overflow: auto` with a hard cut | A `mask-image` fade at both ends |
| `defaults-no-clipped-shadow` | A card shadow cut by `overflow: hidden` | `padding: 8px` on the scroller |
| `defaults-scroll-not-wrap` | A code line wrapping to two lines | `white-space: nowrap` and `overflow-x: auto` |
| `defaults-shadow-only` | `border: 1px solid var(--gray-a4)` plus `box-shadow` on a popover | The shadow alone |
| `defaults-rounded-not-pill` | `border-radius: 9999px` on a button | `border-radius: var(--radius-2)` |
| `defaults-no-decoration` | A gradient glow behind a card | A flat background |
| `defaults-focus-keyboard-only` | `.button:focus { box-shadow: 0 0 0 2px var(--accent) }` | `.button:focus-visible { outline: 2px solid var(--accent) }` |
| `defaults-keys-ignore-inputs` | `J` moves the selection while typing in search | Hotkeys skip `input`, `textarea` and `[contenteditable]` |
| `defaults-opacity-for-chrome` | `initial={{ x: 20, scale: 0.95 }}` on a page | `initial={{ opacity: 0 }}` |
| `defaults-changing-axis-only` | `animate={{ width, height }}` when only height changes | `animate={{ height }}` |
| `defaults-no-replay-on-entry` | `<AnimatePresence>` around routes, entrances replay | `<AnimatePresence initial={false}>` |
| `defaults-no-flash-on-return` | A skeleton flash on a cached view | The cached view rendered at once |
| `defaults-no-stacked-dialogs` | A confirm dialog opened from a settings dialog | A menu or popover inside the dialog |

## Reporting

**Severity.** `HIGH` is a clipped shadow, a hard scroll cut, hotkeys that fire while typing or a stacked dialog. `MEDIUM` is a pill button, a click focus ring, a sliding page or a replayed entrance. `LOW` is a border left beside a shadow, or a decorative glow.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open the screen when a check depends on layout, and mark every check you could not run as `Not verified`.
