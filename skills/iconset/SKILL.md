---
name: iconset
description: Builds or redraws a whole icon library, from an audit of the old set and one icon per concept through the style the user picks, a written voice, shared parts and a migration map to one build command.
disable-model-invocation: true
---

# Iconset

This skill builds an icon library from nothing, or redraws an inherited one as a single system. It settles the concepts, the style, the voice, the strokes and the shared parts before the bulk is drawn, then ships every icon through one command.

## The set is decided before it is drawn

The decisions are exact. The style is the user's pick from drawn tiles, never a default. Each concept has one icon, each size has one stroke and every old icon has one migration state before the swap. Nothing past the seed set is drawn until the voice is written and the seed passes the sheet.

Run it when the user asks for a new icon set, a redraw of the whole set or a replacement for an inherited library. A missing glyph in a set that already exists belongs to `icons`.

Drawing each glyph, the measured spec, the sheet, the lint, the morph form and kept codepoints belong to `icons`. Which icons the product drops belongs to `scope`. Releasing the package belongs to `ship`. Labels on the catalogue belong to `copy`, and accessible names belong to `defaults`.

## 1. Audit the old set

Count the icons from the source files, never from the docs. List duplicates under two names, icons no code references, codepoints that lead nowhere and every custom viewBox and stroke. A redraw scoped from a documented count is `iconset-audit-the-old-set`.

Search the code for each name and codepoint to find what is used. An icon nothing uses is dropped unless the product plans it, and the user decides through `scope`.

## 2. Pin one icon to each concept

List every concept the product shows as an icon, including the ones only this product has. Each concept gets exactly one icon, and the concept table says which. Two icons for one idea, or one icon for two, is `iconset-one-icon-per-concept`. The table's format is in [formats.md](formats.md#concepts).

Tag each icon with the words someone would search for, so a search for "search" finds `magnifying-glass`. An icon found only by its own name is `iconset-tag-every-icon`.

## 3. Pick the style with the user

The style is read from the product, asked and proven in drawn tiles. The directions, the signals and the questions are in [styles.md](styles.md).

Read the product before asking anything. Measure the interface typeface at body size: its stem width, contrast, apertures, terminals, corners and x-height. Note the control radius, the logo's shapes, any illustrations, the platform, the default theme, the density and whether the set also covers pictograms.

Write the signals into `style.md`, as [formats.md](formats.md#style) shows. A direction proposed before the signals are written is `iconset-read-the-product`.

Ask with the question tool. Offer 2 or 3 directions the signals support, the first marked Recommended, each with its key values and the signal behind it. A redraw also offers the old set's measured style, and a native app offers staying close to the platform's symbols.

Where the signals are thin, such as a new product with no type or brand, ask 3 personality sliders first, each with no middle. Write the two strongest as "X, but not Y", such as "friendly, but not childish", then offer directions.

Ask how fill is used in a second question: line only, line filled when selected, filled throughout or duotone. Its default comes from the platform. Wait for both answers before drawing anything. A sharp technical style assumed without asking is `iconset-ask-the-style`.

Draw the same 3 hard icons in every offered direction: one with curves, one with a diagonal and one with a recurring part. Set each tile in a real row of the product at interface size, in both themes, dark first when the product starts dark.

The user picks a tile, and `style.md` records the pick and why. A direction picked from adjectives or a library's name is `iconset-style-tiles`.

The direction changes how a shape is built, never what it shows. People recognise and like familiar metaphors most, so search stays a magnifying glass in every direction. An eye drawn for search to look on-brand is `iconset-style-keeps-metaphors`.

## 4. Write the voice before the first drawing

The voice is how every icon is built, written as rules with a drawn example each. Start from the picked direction's values in `style.md`.

Write how shapes start, such as straight lines at 0°, 45° and 90° with sharp corners, or circles and free curves with round ends. Write whether a shape that could stay open is closed, whether lines run on to the keyline and how far corners round.

A hand-drawn direction also writes how lines wobble, overshoot or stop short, and which flourishes it allows.

Write which way an either-way composition faces and which way a slash cuts. Write the standard last: an icon never takes more attention than the label beside it.

A voice of adjectives, such as "friendly but precise", is `iconset-write-the-voice`. Each line names a broken drawing and the drawing that replaces it, like a pair.

## 5. Pick each stroke beside the product's type

Draw 3 seed icons at 3 candidate strokes from the picked direction's range, centred on the type's measured stem width. Set each in a real row of the product, beside its own font at its interface size. Pick the stroke that holds its own beside the text without outweighing it. A stroke picked on an empty artboard, or copied from another set, is `iconset-stroke-beside-text`. A filled direction picks its narrowest counter the same way, and a pixel direction picks its pixel step.

Each size gets its own drawing and its own stroke, such as 1.25 at 16 and 1.5 at 24. One drawing serves the range in `icons-size-range`, so add a size only where the product shows icons past it. A filled form of a line icon may step its stroke up one notch.

## 6. Draw a seed set and measure it

Draw 12 to 20 seed icons before the bulk. Cover each keyline, a diagonal, an arrow and every part that recurs, such as a file, a folder and the plus badge. The circle keyline is drawn larger than the square so both read as one size.

Load the seed into the sheet from `icons` as the set, then copy its spec to `icon-spec.md` and fill in its Voice table from step 4. From then on every icon goes through `icons`. Drawing the bulk before the seed passes is `iconset-seed-first`.

## 7. Register every recurring part

List each part that appears in more than one icon, such as files, folders, badges, slashes, dots, notches and eyes. Draw each once as a source in the design file, with its size and position. Build every icon that uses it from that source, so one change updates all of them. A folder redrawn by hand in its tenth icon is `iconset-register-parts`.

Keep one overview board per part, lining up every icon that uses it. A drifted badge or a deeper notch shows there before it ships.

Compose parts in the design file and ship each icon flat. Parts composed at runtime cost about twice the bytes per icon and can shift artwork by a pixel. A runtime `badge` prop is `iconset-ship-flat`.

## 8. Explore each concept in a row

Give each new concept a row of at least 3 attempts at its shipped size. Pick beside its neighbours in the set, never alone, and keep the row so the next choice can see why. One attempt drawn and shipped is `iconset-explore-in-rows`. A hand-drawn direction draws each icon at least 3 times and keeps the strongest, then evens out the weight.

Draw in batches by family, such as every file icon together, so a part stays aligned across the family. Run each batch through `icons`, from the lint to the phone.

## 9. Map every old icon to its replacement

Give every old icon one state: To Do, Coupled to its replacement or Removed. A coupled icon keeps its old name, or its codepoint under `icons-keep-codepoints`, so the swap breaks no reference. A removed icon is retired on purpose, and nothing in the code still uses it.

Swapping the set while any icon is To Do, or while a removed icon is still referenced, is `iconset-map-the-migration`. Show the map as one grid with each old icon beside its replacement. The map's format is in [formats.md](formats.md#migration).

## 10. Make the SVG files the contract

The design file owns how an icon looks, and the repository owns all code made from it. Export one SVG per drawn variant into a fixed tree with a manifest, as [formats.md](formats.md#svg-tree) shows. Every file keeps its frame's fixed viewBox, with `overflow="visible"` where artwork passes the frame.

The export writes a report of missing, empty, duplicate and misaligned variants, each with its node in the design file. Generating code while the report lists a miss is `iconset-svg-is-the-contract`.

Fix each problem where it starts: the drawing, the export, the generator or the catalogue. A CSS nudge in a generated component, or a hand edit to generated code, is `iconset-fix-at-the-source`.

## 11. Build everything with one command

One command reads the SVG tree and the manifest, then writes everything else. It generates the components, the sprite or font, the package index, the catalogue data and the counts the docs quote. It stops when the report lists a miss. A release that needs a manual step after the export is `iconset-one-command`.

The components follow `icons-match-the-api`, each style its own export and each size its own drawing. Write the steps to add an icon beside the package: draw it, export it and run the command.

## 12. Generate the catalogue from the manifest

The same command builds a catalogue page in the project's own stack. It shows the set by size and style, searches the tags and copies an icon's SVG, name or codepoint on hover. It holds the concept table and a list of icons beside real labels at their shipped size.

A catalogue kept by hand, or a docs page quoting last month's count, is `iconset-catalogue-from-manifest`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `iconset-audit-the-old-set` | "Redraw all 498 icons", the count in the docs | "468 drawn, 12 duplicates, 30 unused, 4 dead codepoints" |
| `iconset-one-icon-per-concept` | `bolt` and `sparkle` both meaning the agent | `Agent: sparkle` in the concept table, `bolt` kept for speed |
| `iconset-tag-every-icon` | `magnifying-glass` with no tags | `magnifying-glass` tagged `search, find, lookup` |
| `iconset-read-the-product` | Round proposed before the type or radius is measured | `style.md` lists a 1.4 stem, open apertures and 10px controls, then Round |
| `iconset-ask-the-style` | A sharp 0°, 45° and 90° set drawn because the last product had one | 3 directions offered with their values and signals, Round picked |
| `iconset-style-tiles` | "Make it friendly", picked from a word | The same 3 icons in each direction in a real sidebar row, Round picked |
| `iconset-style-keeps-metaphors` | An eye for search, drawn to look playful | The magnifying glass, drawn in the playful direction |
| `iconset-write-the-voice` | "Friendly but precise" | "A cloud from straight segments with rounded joins, never from circles" |
| `iconset-stroke-beside-text` | 1.5 chosen on an empty artboard | 1.25 chosen in a sidebar row beside the product's own labels |
| `iconset-seed-first` | 200 icons drawn, then measured | 16 seed icons passing the sheet, then the rest |
| `iconset-register-parts` | The folder redrawn by hand in `FolderLockIcon` | `FolderLockIcon` built from the registered folder |
| `iconset-ship-flat` | `<FileIcon badge="clock" />` composed at runtime | `FileBadgeClockIcon` shipped flat |
| `iconset-explore-in-rows` | One menu icon drawn and shipped | A row of menu icons, picked beside the set |
| `iconset-map-the-migration` | The new font swapped in and the breaks fixed after | Every old icon Coupled or Removed, none To Do |
| `iconset-svg-is-the-contract` | Components generated while the report lists 3 empty variants | The report empty, then the components |
| `iconset-fix-at-the-source` | `translate: 0 -1px` in the generated `ChatIcon` | The chat drawing fixed and exported again |
| `iconset-one-command` | A README with six steps after the export | `npm run icons` |
| `iconset-catalogue-from-manifest` | A hand-written docs page that says 498 icons | The catalogue built from the manifest by the same command |

## Reporting

**Severity.** `HIGH` is a swap with icons still To Do, a removed icon still referenced, two icons for one concept or a hand edit to generated code. `MEDIUM` is a redraw with no audit, no written voice, a stroke not picked beside the text or the bulk drawn before the seed. `MEDIUM` is also a part redrawn by hand, runtime composition, code generated past the report, a manual release step or a catalogue kept by hand. It is also a style assumed without asking, picked without tiles or bought with a familiar metaphor. `LOW` is an untagged icon, a concept shipped from one attempt or a direction proposed before the signals are read.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a catalogue you could not open as `Not verified`.
