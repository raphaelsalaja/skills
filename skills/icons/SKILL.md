---
name: icons
description: Draws missing icons in the project's own style, measured from every icon the set already has and built to morph, then shows the set on one sheet.
---

# Icons

This skill draws the icons a project's set is missing, in that set's own style. Every new glyph is measured against the whole set, written to animate and morph, then shown on one sheet.

## Nothing is drawn until the set is measured

The spec is exact. The sheet measures it from every icon the set already has, and each new glyph follows it. A guessed stroke, radius or grid is a finding. The size range and the codepoints are exact too. The voice holds to the range the set already draws.

Run it for `draw an icon for`, `we need a ... icon`, `custom icons` or `the set doesn't have a`. Also run it for `match our icons`, `filled version`, `animate this icon`, `morph`, `icon sheet`, `icon font`, `doesn't feel like ours` or `this icon looks off next to the others`.

Building or redrawing a whole set belongs to `iconset`. Which glyphs to draw belongs to `scope`. Searching the set first belongs to `reuse`. Optical nudges belong to `alignment`. The curve, duration and reduced-motion fallback of any icon animation belong to `motion`. Accessible names belong to `defaults`. Visible labels belong to `copy`. Contrast belongs to `color`. Mirroring a directional icon in right-to-left layouts belongs to `viewports`.

A set built with `iconset` keeps its values in `style.json` and its decisions in `concepts.md`. Where those files exist, a new glyph reads its stroke, radius and cut from them and adds its own `concepts.md` row. Where the set's icons are scripts in `src/` beside `helpers.mjs`, a new glyph is a script too, so the next global change moves it. The set's one build command then ships it, never a hand-written component.

## 1. Draw only what the set lacks

Run `reuse` first. Search the icon package, the icon folder or the map that holds inline icons by the concept and two or three synonyms, not only the name. A search glyph may ship as `MagnifyingGlassIcon`. Draw a glyph only when the concept is absent. A second glyph for a concept the set already draws is `icons-only-missing`.

Add the glyph where the set lives, beside its siblings. A new icon left in a feature file is `icons-in-the-package`. A missing glyph added there is not a finding in `reuse`.

A glyph that draws a letter, a currency sign, a regional object or a gendered figure cites `iconset-local-metaphors`.

## 2. Measure the whole set

Copy [sheet.html](sheet.html) to `.icons/<set>/index.html`, an ignored folder and never the source tree. Write `sheet.js` beside it with every existing icon, as its header comment shows, then open it.

Mark logos and brand marks `brand: true`. They are never measured, redrawn or restyled.

The sheet derives the spec from every existing icon on the most common viewBox. It records the stroke, caps, joins, radii, grid step, padding, round overshoot and ink coverage per kind. Copy Spec gives `icon-spec.md`, saved beside the icons.

An agent driving the browser reads the same text from `window.__icons.specMarkdown()`, and the findings from `window.__icons.findingsText()`. Where `icon-spec.md` already exists, replace only its property table and keep its filled Voice table.

Drawing before `icon-spec.md` exists, or from a spec measured by hand, from a sample or from memory, is `icons-measure-the-spec`. With fewer than 3 icons on one viewBox, stop and ask for the reference set. A set that does not exist yet is built with `iconset`.

An existing icon off the spec shows as an outlier. List it in the report and leave it, because redrawing it is a separate ask under `scope`.

## 3. Draw on the set's grid

Put every anchor point on the spec's grid step, while curve handles stay free. Use `currentColor` and never a literal colour. A coordinate off the step or a hex stroke is `icons-on-the-grid`.

Within the step, keep straight stroke edges on whole pixels. A 2 stroke centres on whole pixels and a 1 stroke on half pixels. A 1.5 stroke centres on a quarter, so its outer edge lands on a whole pixel. Snap at the drawing's native size only, because one drawing shown at 12, 16 and 20px has no single pixel grid.

Straight segments run at the angles the set already uses, such as 0°, 45° and 90°, unless the concept needs another, such as a bolt. Diagonals and 3D views share one angle across the set. A 40° arrow among 45° arrows is `icons-set-angles`.

A drawing holds from 0.75 to 1.25 times its grid, so a 16 grid serves 12–20px. Past that its stroke scales too, and a 1.25 stroke becomes 2.5 at 32px. A drawing shown outside its range is `icons-size-range`.

When the set ships a separate drawing per size, draw every size and run one sheet per size. Each size takes the stroke its own sheet measures, and `icon-spec.md` keeps one property table per size. The smaller drawing drops detail and the larger may add it, such as a keyhole on the 24 lock.

When the set's icons are only rects on whole pixels, the set is pixel-style. Draw each glyph as a text grid first, then convert that grid to rects. A pixel icon begun as smooth paths is `icons-pixel-grid-first`. Pixel sets skip step 7 and swap with the cross-fade in `motion`.

## 4. Hold the set's voice

The voice is how the set builds a shape, which a stroke and a grid alone do not fix. The sheet measures what it can of it beside the spec.

Construction counts the icons that draw a free curve, one whose bend changes along its length, rather than lines, arcs and round corners. Corners gives the radius range of every rounded turn. Parts gives the most separate strokes an icon of each kind carries.

Build each new glyph the way the set builds its own. Where the set makes a cloud from straight segments with rounded joins, a cloud of free curves is off its voice. A free curve the set rarely draws, a corner outside its range or more parts than its kind carries is `icons-hold-the-voice`. A concept that cannot be drawn without a free curve, such as a wave, keeps it and the report says why.

A corner smaller than the range passes where the set's radius table gives it, such as a sharp star point in a set built with `iconset`. A Voice line marked should may bend where the glyph reads better, and the report says why.

Fill in the Voice table in `icon-spec.md` before drawing, naming two existing icons for each tendency. It records whether a shape that could stay open is closed, whether lines run on to the keyline and which way an either-way composition faces. It also records how caps and small details end and how much detail an icon carries. A voice written as adjectives, such as "clean and friendly", is `icons-write-the-voice`.

A new glyph never takes more attention than its neighbours. One more detailed, more decorative or cleverer than the set reads as another hand, even when it lints clean.

## 5. Fit each glyph to a keyline and reuse its parts

Every glyph fits one of 4 keylines: a square at the padding, a circle past it by the round overshoot, a wide rectangle and a tall rectangle. The sheet reads the rectangles from the widest and tallest existing icons. A diagonal glyph takes the circle.

Grid in the icon dialog draws all 4 over the glyph, and Keylines in the spec gives their sizes.

Pick the keyline by the object's own proportions, so a pencil stays tall and a banknote stays wide. A tall object stretched to fill the square is `icons-keyline-shapes`.

A part the set already draws, such as a folder, a file, a badge or a slash, reuses that part's path data, size and position. A plus badge sits in the same corner at the same size every time. A folder redrawn for one new glyph is `icons-same-parts`.

A slash cuts flat through the glyph at the set's angle and draws no shadow line beside it. A composition that could face either way, such as a diagonal arrow or a small object above a large one, faces the set's way.

## 6. Correct what the eye sees

Separate parts sit at least one stroke width apart, and never under 1px. Two strokes that merge into one blot at 16px are `icons-open-gaps`. A cut where a badge or slash clips a base shape keeps one width across the set, the `cut` in `style.json` where the set has one.

Measure every gap and cut from the ink. A round cap carries the ink half a stroke past an open end, so two 1.25 ends 2.5 apart leave 1.25 of white, and a switch to round caps reopens every gap in the set.

Where 3 or more strokes meet, the overlap reads darker than any one stroke, and light strokes on Dark Tiles bloom further. End one converging stroke half a stroke width short of the junction. A clogged corner that reads heavy on Weight is `icons-open-junctions`.

A dot takes the diameter its role already has in the set: a dot ending a line, a dot in an ellipsis or a lone dot. Measure each role from the existing icons. A dot sized off its role is `icons-dots-by-role`.

Round shapes may pass the padding by the spec's round overshoot and no further. Arrows and play shapes take the nudge in `alignment`, drawn into the coordinates. A circle drawn at a square's size cites `alignment-visual-weight`, and a play icon centred on its box cites `alignment-optical-glyph`.

## 7. Write every new icon in the morph form

Every new icon animates and morphs into every other new icon of its kind. Each one is the same number of `path` elements, and each path is an absolute `M` followed by the same number of explicit `C` segments.

The sheet sets both counts from the most complex new icon and shows them as Morph Form. Pad a shorter path with zero-length segments at its end.

In a set whose `concepts.md` marks icons Swaps, only those take the morph form. Mark them `swaps: true` in `sheet.js`, and the sheet sets the counts and checks the form on those alone.

Two icons that are one shape turned, such as back and forward, share one drawing. The swap rotates the whole icon instead of moving points, and the sheet marks the pair Spins.

A straight segment is a cubic whose handles sit on its own ends. A closed stroke returns to its start point instead of using `Z`. An unused path collapses to one point on another stroke, where it stays hidden.

Each path starts at its topmost anchor, leftmost on a tie. Order the paths longest first, so large strokes morph into large strokes. To morph into an existing icon, add that icon's morph form as a new icon with the same ink.

An optimiser that merges paths or converts shapes breaks the form, so turn off `mergePaths` and `convertShapeToPath` for these files. A `circle`, `rect`, `line`, `Z`, relative command or path count off the morph form is `icons-morph-form`.

## 8. Build outline and filled from one skeleton

Outline and filled variants share one skeleton and one morph form. The filled form fills the outline's own paths and keeps its silhouette. Inner detail becomes a counter at least 1px wide, and narrower counters are dropped. A filled icon redrawn from scratch is `icons-one-skeleton`. A fill cannot morph, so outline and filled swap with the cross-fade in `motion`.

## 9. Lint every icon against the spec

The sheet lints each new icon for viewBox, stroke, caps where ends are open, joins where corners exist, grid, padding, radii and more than 3 decimals. It also rejects transforms, ids, classes, inline styles, masks and clip paths.

Ink coverage compares outline with outline and filled with filled, inside the range the set already spans. A kind the set lacks shows `Not Verified` and is judged on the sheet. Each miss is `icons-lint-the-spec`. Each new icon's free curves, corner radii and parts are checked against the voice.

## 10. Read the set on one sheet

The sheet sorts by name, so new glyphs sit among old ones, and badges each new one. Style, Size and Dark Tiles at the top set what the grid shows.

Pixels rasterises each icon at its native size, one device pixel per unit, and enlarges it three times. Soft or doubled edges there are a grid problem.

Weight blurs the 48px icons by 2px, so only weight remains. A new glyph that reads darker or lighter than its neighbours there is too dense or too thin.

Context sets each glyph at its shipped size in a list row, a button and a sentence of 13px text. A glyph that sits high or reads heavy beside its label shows there first.

Morph plays each new icon into the next of its kind on the curve in `motion`. A morph that twists, crosses itself or flashes a dot has its paths out of order.

Clicking an icon opens its dialog. Its Morph tab chains any icons under the stage, pasted ones included, and says whether each step spins, morphs as drawn or needs converting.

A converted preview is the sheet's own guess, not the form that ships. Prompts copies the fix, the redraw or the morph-form request for the agent to apply.

A sheet written from scratch, or icons checked one at a time, is `icons-one-sheet`. Fix every finding and reopen it until Findings is empty. The only exception is a free curve the concept needs.

## 11. Match the project's icon component

Generate components on the project's existing icon API, including its props and file shape. Name each glyph by what it draws, with the siblings' casing and variant suffix, such as `LockFillIcon` beside `LockIcon`. Keep each path its own element, so a caller can animate `d` or draw the stroke on. A one-off component with its own props, or a decorative icon with no `aria-hidden`, is `icons-match-the-api`.

When each size has its own drawing, the `size` prop picks that drawing and never scales another. Its type lists only the sizes drawn, such as `12 | 16`.

In a native app whose icons are custom symbols, a new glyph ships in the same symbol template as its siblings, with every source the template interpolates from.

When the set ships as an icon font, a new glyph takes the next unused codepoint. A redrawn glyph keeps its old codepoint, and a retired codepoint never goes to another glyph. A moved or reused codepoint is `icons-keep-codepoints`. Outline strokes in the font build, never in the source the sheet reads.

Add a hover, active or swap animation only when the user asks, and run it through `motion`. An icon that is the only content of a control cites `defaults-name-icon-buttons`. Contrast cites `color-ui-contrast`.

## 12. See each new glyph beside real text

Context on the sheet uses its own rows, not the project's type, spacing or colour. Render each new glyph in the project's own row beside its label, at its shipped size, in both themes. Then view it at 100% zoom on a phone, where 16px is 16px. A glyph approved only on the sheet or zoomed in is `icons-in-context`. Without a phone, report `Not verified on device`.

Blur that row by 1px. A new glyph that blurs into the shape of a neighbour in the same bar cites `iconset-distinct-in-a-row`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `icons-only-missing` | A new `SearchIcon` when the set has `MagnifyingGlassIcon` | The set's `MagnifyingGlassIcon` |
| `icons-in-the-package` | `ReceiptIcon` in a feature folder | `ReceiptIcon` beside its siblings in the set |
| `icons-measure-the-spec` | A spec measured by hand from 3 icons | `icon-spec.md` copied from the sheet, then the path |
| `icons-on-the-grid` | `M5 2.3` with `stroke="#111"` on a 0.25 step | `M5 2.25` with `stroke="currentColor"` |
| `icons-set-angles` | A 40° arrow among 45° arrows | The arrow at 45° |
| `icons-size-range` | The 16 drawing scaled to 28px | The 24 drawing at 28px |
| `icons-pixel-grid-first` | A pixel glyph drawn as smooth paths | A text grid converted to rects |
| `icons-hold-the-voice` | A cloud of free curves in a set built from lines and round corners | The cloud from straight segments with rounded joins |
| `icons-write-the-voice` | "Voice: clean and friendly" | "Open or closed: closed, as in `FolderIcon` and `BoxIcon`" |
| `icons-keyline-shapes` | A pencil widened to fill the square | The pencil on the tall keyline |
| `icons-same-parts` | A folder redrawn for `FolderPlusIcon` | The set's folder path with its plus badge |
| `icons-open-gaps` | Two 1.5 strokes 0.5 apart | The strokes 1.5 apart |
| `icons-open-junctions` | Three strokes meeting at one point | One stroke ended half a stroke width short |
| `icons-dots-by-role` | An ellipsis dot 1.5 across where the set's are 2 | The ellipsis dot 2 across |
| `icons-morph-form` | `<circle r="4.5" />` beside `<path d="M10.5 10.5l3 3" />` | 3 paths, each `M` and 5 `C` segments |
| `icons-one-skeleton` | A filled icon drawn as a new path | The outline's paths filled |
| `icons-lint-the-spec` | `transform="translate(0.5 0.5)"` on a 2px stroke | The spec's stroke and padding, no transform |
| `icons-one-sheet` | The new icon screenshotted alone at 24px | `sheet.html` copied, only `sheet.js` written |
| `icons-match-the-api` | A feature-file `svg` with its own size prop | The project's icon component, `aria-hidden` when decorative |
| `icons-keep-codepoints` | `arrow-up` moved from `U+E001` to `U+E0F3` | The redrawn `arrow-up` at `U+E001` |
| `icons-in-context` | A glyph approved on the sheet at 300% zoom | The glyph in its real row beside its label, at 100% on a phone |

## Reporting

**Severity.** `HIGH` is a glyph drawn with no spec, a duplicate of a concept the set already draws or a moved or reused codepoint. `MEDIUM` is an off-grid icon, a glyph off the set's voice, an off-angle diagonal, a drawing shown outside its size range or a pixel set drawn as paths. `MEDIUM` is also a glyph stretched off its keyline, a recurring part redrawn, closed gaps, a failed lint, an icon off the morph form or a second skeleton. It is also a missing sheet, a file outside the set, a component off the project's API or a glyph never seen beside real text. `LOW` is a voice written as adjectives, a clogged junction, a dot off its role's size or a morph that twists or flashes on the sheet.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary and the existing outliers as a separate list. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a sheet you could not render as `Not verified`.
