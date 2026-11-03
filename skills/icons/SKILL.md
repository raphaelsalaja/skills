---
name: icons
description: Draws missing icons in the project's own style, with one grid, stroke and radius measured from the icons it already has, then shows the set on one sheet.
---

# Icons

This skill draws the icons a project's set is missing, in that set's own style. It makes new icons indistinguishable from existing ones, then shows the set on one sheet.

## Nothing is drawn until the set is measured

The spec is exact. It is measured from 2 or 3 icons the project already has, and every new glyph follows it. A guessed stroke, radius or grid is a finding.

Run it for `draw an icon for`, `we need a ... icon`, `custom icons` or `the set doesn't have a`. Also run it for `match our icons`, `make icons consistent`, `filled version`, `animate this icon`, `icon sheet` or `this icon looks off next to the others`.

Which glyphs to draw belongs to `scope`. Searching the set first belongs to `reuse`. Optical size and nudges belong to `alignment`. Hover and active motion belong to `motion`. Accessible names belong to `defaults`. Visible labels belong to `copy`. Contrast belongs to `color`. Opening the sheet belongs to `verify`.

## 1. Draw only what the set lacks

Run `reuse` first. Search the icon package or folder and draw a glyph only when that glyph is absent. A second copy of a glyph the set has is `icons-only-missing`.

Add the file to that package or folder. A new file left in a feature folder is `icons-in-the-package`. A missing glyph added there is not a finding in `reuse`.

## 2. Write the spec before any path

Measure 2 or 3 existing icons and write `icon-spec.md` beside the icon package or folder. Record the viewBox, stroke width, caps and joins, corner radius, padding inside the viewBox and the fill ratio. The fill ratio is the ink area divided by the viewBox area.

Drawing with no spec, or a spec from one icon or from memory, is `icons-measure-the-spec`. Refuse to draw until that file exists. When the set has fewer than 2 icons, stop and draw nothing.

## 3. Draw on the set's grid

Place every coordinate on a whole or half pixel. Use `currentColor`. Use only `path`, `line`, `rect` and `circle`. A coordinate at `2.3`, a hex fill or a `polygon` is `icons-on-the-grid`.

When the measured icons are only rects on a whole-pixel grid, the set is pixel-style. Draw each glyph as a text grid first, then convert that grid to rects. A pixel icon begun as smooth paths is `icons-pixel-grid-first`.

## 4. Correct what the eye sees

Circles, arrows and play shapes take the optical size and nudge in `alignment`. Draw that correction into the coordinates. A circle drawn at the same size as a square, or a play icon centred on its box, cites `alignment-visual-weight` or `alignment-optical-glyph`.

## 5. Build outline and filled from one skeleton

Outline and filled variants share one skeleton. The filled form uses that same geometry. A filled icon redrawn from scratch is `icons-one-skeleton`.

## 6. Lint every icon against the spec

Check stroke, bounds, fill ratio and decimal precision against `icon-spec.md` and reject any `transform`. A stroke off the spec, ink past the padding, a fill ratio off the spec, a coordinate off the half-pixel grid or a `transform` is `icons-lint-the-spec`.

## 7. Show the set on one sheet

Render one sheet in the browser at 16, 20, 24 and 48px, in light and dark, and leave it out of the source tree. Mix the new icons among the existing ones. Add a 1x row for a squint test. A missing size, theme or squint row, or new icons grouped apart, is `icons-one-sheet`.

## 8. Animate only when asked

Add a hover or active state only when the user asks. When it exists, use the icon cross-fade and the spring in `motion`, and follow that skill's reduced-motion rule. A state on its own curve, or one that ignores `prefers-reduced-motion`, is `icons-states-follow-motion`.

## 9. Match the project's icon component

Generate components on the project's existing icon API, including its props and file shape. A one-off component with its own props, or a decorative icon with no `aria-hidden`, is `icons-match-the-api`. An icon that is the only content of a control cites `defaults-name-icon-buttons`. Contrast cites `color-ui-contrast`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `icons-only-missing` | A new `SearchIcon` when the set has one | The set's `SearchIcon` |
| `icons-in-the-package` | `ReceiptIcon` in a feature folder | `ReceiptIcon` in the icon package |
| `icons-measure-the-spec` | A 24px icon drawn from memory | `icon-spec.md` from 3 icons, then the path |
| `icons-on-the-grid` | `M 2.3 4` with `stroke="#111"` | `M 2.5 4` with `stroke="currentColor"` |
| `icons-pixel-grid-first` | A pixel glyph drawn as smooth paths | A text grid converted to rects |
| `icons-one-skeleton` | A filled icon drawn as a new path | The outline skeleton filled |
| `icons-lint-the-spec` | `transform="translate(0.5 0.5)"` on a 2px stroke | The spec's stroke and bounds, no transform |
| `icons-one-sheet` | The new icon alone at 24px | The set at 16, 20, 24 and 48px, both themes, plus a 1x row |
| `icons-states-follow-motion` | A hover on `ease-in` over `500ms` | The icon cross-fade and spring in `motion` |
| `icons-match-the-api` | A feature-file `svg` with its own size prop | The project's icon component, `aria-hidden` when decorative |

## Reporting

**Severity.** `HIGH` is a glyph drawn with no spec, or a duplicate of a glyph the set already has. `MEDIUM` is an off-grid icon, a pixel set drawn as paths, a failed lint or a second skeleton. `MEDIUM` is also a missing sheet, a file outside the icon package or a component off the project's API. `LOW` is a hover or active state that ignores `motion`.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a sheet you could not render as `Not verified`.
