# Formats

The files an icon library keeps beside its drawings. The drawings read the variables, and the build command reads every file after them, so the code and the catalogue never drift.

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

## Changes
First batch: "a bit harsh". Round ends picked over a larger radius and a lighter stroke.
```

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

`cut` is the gap where a badge or slash clips a shape. `duotone` is absent when the set has none, and `back` is `opacity` or `colour`.

## Concepts

`concepts.md` sits beside the icons. Each concept appears once and each icon answers one concept. The tags carry the synonyms, so they also feed the catalogue's search.

```
| Concept | Icon | Tags |
| --- | --- | --- |
| Agent | `sparkle` | ai, assistant, model |
| Search | `magnifying-glass` | search, find, lookup |
| Parallel run | `lanes` | parallel, concurrent, fan out |
```

## Migration

`migration.json` holds one entry per old icon. `To Do` is unmapped. `Coupled` names the replacement and keeps the old codepoint. `Removed` records the reference count, which is 0 before the swap.

```json
{
  "arrow-up": { "state": "Coupled", "to": "ArrowUp", "codepoint": "U+E001" },
  "debug-alt": { "state": "Removed", "references": 0 },
  "git-fetch": { "state": "To Do" }
}
```

## SVG tree

One folder per icon, one file per drawn style and size. A combination never drawn has no file, so the generated type lists only the sizes that exist.

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

`REPORT.md` lists one miss per line with the source node or script to open. The build stops while it has any line:

```
ArrowRight fill-24 - empty variant, node 412:1180
FileLock outline-24 - artwork 0.5 past the frame with no overflow, node 520:44
Folder outline-16 - duplicate of Directory outline-16, node 88:902
```
