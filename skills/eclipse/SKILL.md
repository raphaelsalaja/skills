---
name: eclipse
description: Turns the light and dark switch into a reveal from the toggle and fixes a theme that flashes, flickers or smears.
---

# Eclipse

This skill turns a light and dark theme switch into a reveal that spreads from the toggle. It also fixes the flash, flicker and smear that a theme change leaves behind.

## The circle is measured from the toggle

The origin, the radius, the duration and the fallback are exact. The reveal runs only when the user presses the theme control. A page that fades or slides its theme is a finding.

Run it when the user wants a nicer theme toggle, a dark mode transition or reveal, or the theme flashing, flickering or smearing fixed.

Route and element view transitions are out of scope. Setting `view-transition-name` on a route or a widget is `eclipse-root-only`.

The dark palette belongs to `color`. Curves belong to `motion`, and this reveal uses that entrance curve at `300ms`. The quiet switch and the scrollbar belong to `defaults`. A looping clip for a post belongs to `clip`. Opening the result belongs to `verify`.

## 1. Find the mechanism

Search for the theme before writing a second one. It is `next-themes` or another provider, a `class` or `data-theme` on `html`, or `color-scheme` with `light-dark()`. The toggle is the control that already changes it.

Use the attribute the CSS already keys off. A new store beside the existing one is `eclipse-find-the-mechanism`.

## 2. Reveal from the toggle

On press, read the toggle's centre with `getBoundingClientRect`. Change the theme synchronously inside `document.startViewTransition`, so the new snapshot already shows it when the callback returns.

Animate `::view-transition-new(root)` with `clip-path: circle()` from `0px` at that centre out to the farthest viewport corner. Leave `::view-transition-old(root)` still and fully opaque underneath. A circle from the pointer, a circle from the screen corner or the default cross-fade left in place is `eclipse-from-the-toggle`.

The radius is the distance to the farther corner, rounded up. A circle that stops short of a corner is `eclipse-reach-the-corner`.

The reveal takes `300ms` on `cubic-bezier(0.23, 1, 0.32, 1)`. A second press while it runs is `eclipse-one-reveal`.

The circle is the default. Wipe and soft mask are the other two, used when asked for. The wipe is a horizontal `clip-path: inset()` from the side nearer the toggle. The soft mask is a radial gradient with a `48px` feather. Any other effect is `eclipse-three-variants`. The code is in [recipes.md](recipes.md#reveal).

## 3. Fall back cleanly

Where `document.startViewTransition` is missing, swap the theme on that same press with no animation. A toggle that does nothing in that browser is `eclipse-instant-fallback`.

When `prefers-reduced-motion: reduce` matches, skip the circle, the wipe and the mask. Cross-fade the two snapshots in `150ms` or less, on the same curve. Movement under that setting, or a longer cross-fade, is `eclipse-reduced-crossfade`.

## 4. Stop the flash

The first paint uses the stored theme, or the system theme when nothing is stored. Set it with an inline blocking script in the head, after the theme CSS, and set `color-scheme` to that same value. A script at the end of the body, a module or an effect after paint is `eclipse-block-the-flash`. See [recipes.md](recipes.md#blocking-script).

## 5. Hold transitions for the reveal

Turn transitions off before the theme changes and keep them off until the reveal finishes. Restoring them on the next frame, while the circle is still moving, lets each background smear. That is `eclipse-quiet-for-the-reveal`, and it cites `defaults-quiet-theme-switch`. See [recipes.md](recipes.md#quiet).

Where view transitions are missing, restore transitions on the next frame, as `defaults` does.

## 6. Swap the artwork

Logos and images with a light and a dark version both sit in the page, and the theme attribute shows the matching one. Swap them in the same turn as the theme, so the new snapshot includes the right art. A logo left on the other theme is `eclipse-swap-the-art`. An SVG that uses `currentColor` already follows.

## 7. Match the chrome

Set `color-scheme` on the root to the active theme in the same turn, so the scrollbar follows. A miss cites `defaults-color-scheme`.

Point the `theme-color` meta at the computed colour of the top of the page. Read it after the theme has applied. Two tags that only listen to `prefers-color-scheme` stay on the system theme after a manual choice. A stale `theme-color` is `eclipse-theme-color`.

## 8. Show the proof

Leave the toggle code, the audit list, a recording of the reveal and a strip of six frames from the closed circle to the covered page. Record a hard reload before the flash fix and one after it. Leave the recording and the strip out of the commit unless the project already keeps examples. A reply with none of these is `eclipse-show-the-proof`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `eclipse-root-only` | `view-transition-name: card` on a product tile | Only `::view-transition-new(root)`, and only from the theme toggle |
| `eclipse-find-the-mechanism` | A second `theme` store beside `next-themes` | The provider's `setTheme`, on the attribute the CSS already uses |
| `eclipse-from-the-toggle` | A cross-fade from the centre of the screen | `clip-path: circle()` from the toggle's centre on `::view-transition-new(root)` |
| `eclipse-reach-the-corner` | A circle of `200px` that leaves a corner | The radius to the farthest viewport corner, rounded up |
| `eclipse-one-reveal` | A second `startViewTransition` while one is running | The second press ignored until the reveal finishes |
| `eclipse-three-variants` | A blur fade in place of the reveal | Circle by default, wipe and soft mask when asked |
| `eclipse-instant-fallback` | The toggle ignored when `startViewTransition` is missing | The theme swaps on that press with no animation |
| `eclipse-reduced-crossfade` | The circle running under reduced motion | A cross-fade of `150ms` |
| `eclipse-block-the-flash` | The theme set in an effect after paint | An inline blocking script in the head, with `color-scheme` |
| `eclipse-quiet-for-the-reveal` | Transitions restored on the next frame | Transitions off until the reveal finishes |
| `eclipse-swap-the-art` | A light logo left up on the dark theme | Both versions in the page, the theme showing one |
| `eclipse-theme-color` | `theme-color` stuck on the light value | The meta set to the computed colour at the top of the page |
| `eclipse-show-the-proof` | "The theme animates now" | The toggle code, the audit list, a recording and six frames |

## Reporting

**Severity.** `HIGH` breaks the theme or the proof. That is a toggle that does nothing where view transitions are missing, a flash of the wrong theme on load or a route or element transition added here. It is also a reveal with no recording and no frame strip.

`MEDIUM` is a circle from the wrong origin, a radius that stops short or a second reveal started while one is running. It is also movement under reduced motion, artwork stuck on the other theme or transitions restored while the reveal runs.

`LOW` is a stale `theme-color`, a cross-fade longer than `150ms` or an effect other than the circle, the wipe and the soft mask.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a theme change you did not play. Mark a browser you could not open as `Not verified`.
