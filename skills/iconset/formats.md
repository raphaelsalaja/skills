# Formats

The files an icon library keeps beside its drawings. The drawings read the variables, and the build command reads every file after them, so the code and the catalogue never drift.

They sit in the icon source folder, such as `icons/`, and are committed. Only the review page and the unpicked directions live in the ignored `.iconset/`.

## Style

`style.md` sits beside the icons and records how the direction was picked. The voice and the stroke step start from it, and a later redraw reads why.

```
## References
Loved: the linked set - 1.5 stroke, round ends, 2 radius, closed shapes. "Calm, nothing shouts"
Loved: the user's notes app - filled when selected, duotone back layer at 0.3
Disliked: the old set - butt ends and sharp corners. "Too harsh next to the rounded buttons"
Change first: tag, sparkle, settings

## Signals
Type: humanist sans, stem 1.4 at 14px, contrast 1.1:1, open apertures, round terminals, x-height 0.53
Labels: 14px regular
Radius: 10px controls, pill buttons
Logo: circles and one free curve
Platform: web and iOS, bottom navigation on phones
Theme: light first
Tiers: UI icons, plus pictograms on empty states

## Traits
Calm, but not sleepy
Friendly, but not childish

## Offered
Round, Soft, Keep the old set's style

## Picked
Round. Soft read thin beside the labels on a phone.

## Fill
Line, filled when selected

## Voice
Must: closed shapes. Broken: a folder with an open top. Fixed: the folder closed along its tab.
Must: one diagonal angle, 45°. Broken: a 40° arrow. Fixed: the arrow at 45°.
Should: lines run on to the keyline. Broken: a phone stopping short of the keyline. Fixed: the phone on the tall keyline. Bent in: bolt, which reads better at its own height.
Standard: no icon takes more attention than the label beside it.

## Stroke
16: 1.25, beside the 14px regular labels (l stem 1.31). 1.5 outweighed them.
24: 1.75, beside the 20px medium title (l stem 2.26). The stroke the user set; 2 drew the eye first.

## Changes
First batch: "a bit harsh". Round ends picked over a larger radius and a lighter stroke.
```

Once the seed passes, the Voice section is copied into the Voice table of `icon-spec.md`, which owns it from then on. `style.md` keeps the history of why.

## Variables

`style.json` holds the picked values every drawing reads. Change a value, regenerate the set and reopen the review page. `radius` is the largest a corner takes, and each corner takes less by the radius table in [styles.md](styles.md#radius-by-part).

```json
{
  "sizes": {
    "16": { "stroke": 1.25, "radius": 1.5, "cut": 1.5 },
    "24": { "stroke": 1.5, "radius": 2, "cut": 2 }
  },
  "caps": "round",
  "joins": "round",
  "fill": "line, filled when selected",
  "duotone": { "back": "opacity", "opacity": 0.3 }
}
```

`radius` is the path's own radius at the centre of the stroke. `cut` is the gap where a badge or slash clips a shape, and it is never narrower than that size's stroke. `duotone` is absent when the set has none, and `back` is `opacity` or `colour`.

Before the pick, each direction keeps a `style.json` in this format in `.iconset/directions/<name>/`. The picked one moves beside the icons with the user's overrides.

## Icon scripts

Where the agent draws, each icon is a script that returns its parts from shared helpers. The caller passes the size, the values and the helpers, so one script draws every size, direction and one-change variant. A correction the eye asks for is a named override beside the part it bends, so regenerating the set keeps it.

```js
// star.mjs
export default ({ poly, starPoints }) =>
  poly(starPoints(), {
    closed: true,
    // 36° points: a quarter of 3.4, halved for the angle.
    corners: { points: 0.425 },
  });
```

`helpers.mjs` sits beside the icons. It scales 24-grid coordinates to each size, snaps anchors to the grid step and applies the radius table, so a script names only its shape.

Snap what the helpers compute too: where a rounded corner's arc starts and ends, each corner radius, each curve's end point and each dot's radius. Unsnapped, a 45° corner lands at 10.563 and the seed fails the grid lint. Curve handles stay free.

A named override is in 24-grid units and scales with the rest. A script may branch on `size` where a smaller drawing needs its own coordinates, such as loops kept a stroke apart at 16.

`draw(script, size, style, { morph })` writes the morph form for icons marked Swaps. It turns lines, arcs, circles and `Z` into an `M` and explicit `C` segments, then pads to the pair's larger path and segment counts.

`.iconset/render.mjs` draws every script with each direction's values, or with `style.json` once one is picked, and writes `review.js`. Run it after every change, because a page opened from disk cannot import modules or fetch JSON.

```js
import { readFileSync } from "node:fs";
import { draw } from "../icons/helpers.mjs";
import folder from "./directions/round/folder.mjs";

const round = JSON.parse(readFileSync(new URL("directions/round/style.json", import.meta.url)));
const svg = { 16: draw(folder, 16, round), 24: draw(folder, 24, round) };
```

The build runs the same scripts, so the scripts and the SVG tree never disagree.

## Parts

Each registered part is a script in `parts/` beside the icons. It draws at a fixed size and position and exports any anchor a badge needs. An icon script imports it, so a change to the part redraws every icon that uses it.

```js
// parts/folder.mjs
export const centre = [12, 13.5];
export default ({ poly }) => poly([[3, 5], [9, 5], [11.5, 7.5], [21, 7.5], [21, 19.5], [3, 19.5]], { closed: true });

// src/folder-plus.mjs
import folder, { centre } from "../parts/folder.mjs";
import plus from "../parts/plus.mjs";
export default (k) => [folder(k), plus(k, centre)];
```

The review page's Parts section reads the imports, so each part's overview lists exactly the icons built from it.

## Concepts

`concepts.md` sits beside the icons. Each concept appears once and each icon answers one concept. The tags carry the synonyms, so they also feed the catalogue's search.

```
| Concept | Icon | Tags | Marks |
| --- | --- | --- | --- |
| Agent | `sparkle` | ai, assistant, model | Contested: picked from 14 versions |
| Search | `magnifying-glass` | search, find, lookup | |
| Play | `play` | start, run, resume | Swaps with `pause` |
| Expand | `chevron-down` | expand, open, disclosure | Swaps with `chevron-right`, Spins |
| Billing | `banknote` | billing, payment, invoice | Local: no currency sign |
| Parallel run | `lanes` | parallel, concurrent, fan out | Contested, new: 4 of 5 in testing |
```

Marks records what the steps decided. Contested names the picture it came from, Swaps names its partner and Local names the neutral form or the locales. A new metaphor adds its test result. Spins marks a Swaps pair that is one drawing turned, which rotates and skips the morph form.

Keep the table this shape, one row per concept, because the review page, the export and the catalogue all parse it.

## Migration

`migration.json` holds one entry per old icon. `To Do` is unmapped. `Coupled` names the replacement and keeps the old codepoint where the set has codepoints. `Removed` records the reference count, which is 0 before the swap.

```json
{
  "arrow-up": { "state": "Coupled", "to": "ArrowUp", "codepoint": "U+E001" },
  "dollar": { "state": "Coupled", "to": "banknote", "references": 1 },
  "debug-alt": { "state": "Removed", "references": 0 },
  "git-fetch": { "state": "To Do" }
}
```

A set with no codepoints, such as a map of SVG strings, records each coupled icon's references instead. The swap moves each one to the new name.

## SVG tree

One folder per icon, named as the project's icon API names it, and one file per drawn style and size. A combination never drawn has no file, so the generated type lists only the sizes that exist.

Where the agent draws, the export renders each script at every size in `style.json` and Swaps icons in the morph form. It reads each concept and its tags from `concepts.md`. Where a designer draws, the design tool's export plugin writes the same tree.

```
svg/
  ArrowRight/
    outline-16.svg
    outline-24.svg
    fill-16.svg
  manifest.json
  REPORT.md
```

`manifest.json` names every icon with its concept, tags, codepoint and variants:

```json
{
  "ArrowRight": {
    "concept": "Next",
    "tags": ["next", "forward", "continue"],
    "codepoint": "U+E014",
    "variants": [
      { "style": "outline", "size": 16, "file": "ArrowRight/outline-16.svg" },
      { "style": "outline", "size": 24, "file": "ArrowRight/outline-24.svg" },
      { "style": "fill", "size": 16, "file": "ArrowRight/fill-16.svg" }
    ]
  }
}
```

`REPORT.md` lists one miss per line with the source node or script to open. It also lists a migration entry still To Do or coupled to an icon that is not drawn. The build stops while it has any line:

```
ArrowRight fill-24 - empty variant, node 412:1180
FileLock outline-24 - artwork 0.5 past the frame with no overflow, node 520:44
Folder outline-16 - duplicate of Directory outline-16, node 88:902
```
