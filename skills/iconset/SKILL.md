---
name: iconset
description: Builds or redraws a whole icon library, from the user's references and an audit of the old set through a style picked from drawn tiles, a written voice and shared parts to one build command.
disable-model-invocation: true
---

# Iconset

This skill builds an icon library from nothing, or redraws an inherited one as a single system. It learns the user's taste from references and drawn options, settles the concepts, voice and parts, then ships every icon through one command.

## The pipeline is exact and the look is judged by eye

The pipeline is exact. Each concept has one icon, each size has one stroke and every old icon has one migration state before the swap. The SVG files, the build command and the catalogue leave nothing to memory.

The look is judged by eye, the user's first. The style is the user's pick from drawn options, never a default, and each value records what the eye chose. A voice rule bends where the icon reads better for it. When rules conflict, clarity wins, then consistency, then the rule.

Run every step in order without asking whether to go on. Stop only at 5 checkpoints: the references, the style, the seed, the first batch and the swap. At each one, say what changed, where to see it and what comes next. Stopping after a step to ask whether to continue is `iconset-run-every-step`.

Run it when the user asks for a new icon set, a redraw of the whole set or a replacement for an inherited library. A missing glyph in a set that already exists belongs to `icons`.

Drawing each glyph, the measured spec, the sheet, the lint, the morph form and kept codepoints belong to `icons`. Which icons the product drops belongs to `scope`. A board of references from the user's own saves belongs to `gather`. Releasing the package belongs to `ship`. Labels on the catalogue belong to `copy`, and accessible names belong to `defaults`.

## 1. Open one review page

Copy [review.html](review.html) to `.iconset/index.html`, an ignored folder, and write `review.js` beside it as its header comment shows. The user opens it from disk, so it never waits on the product or a dev server.

Every step adds its section: the audit, the references, the directions, the seed, each batch and the migration map. Rows set icons beside the product's labels in its own font, and Both Themes shows light and dark side by side.

End every checkpoint with the page's path, the sections that changed and what to look at. Work shown only inside the running app, or only described in chat, is `iconset-review-page`.

Copy Feedback hands back the user's picks, their stroke, caps and joins overrides and their notes. Read that message before changing anything. The glyph sheet from `icons` stays the measuring tool, and the review page is what the user looks at.

## 2. Audit the old set

Count the icons from the source files, never from the docs. List duplicates under two names, icons no code references, codepoints that lead nowhere and every custom viewBox and stroke. A redraw scoped from a documented count is `iconset-audit-the-old-set`.

Search the code for each name and codepoint to find what is used. An icon nothing uses is dropped unless the product plans it, and the user decides through `scope`. Show the audit on the review page, with duplicates and dead codepoints marked.

## 3. Pin one icon to each concept

List every concept the product shows as an icon, including the ones only this product has. Each concept gets exactly one icon, and the concept table says which. Two icons for one idea, or one icon for two, is `iconset-one-icon-per-concept`. The table's format is in [formats.md](formats.md#concepts).

Tag each icon with the words someone would search for, so a search for "search" finds `magnifying-glass`. An icon found only by its own name is `iconset-tag-every-icon`.

Mark a concept contested when other sets draw it many ways, the user disliked its old icon or only this product has it. A contested concept gets references in step 10 before it is drawn.

## 4. Learn the user's taste

Ask for references before proposing anything. Ask for icon sets, apps or sites whose icons the user likes, ones they dislike and the current icons they would change. Ask why for each. A style proposed before the user is asked for references is `iconset-ask-for-references`.

Ask a few plain questions about feel, from [styles.md](styles.md#questions-about-feel), such as what the icons should never feel like. Write the two strongest answers as "X, but not Y" in `style.md`.

When the user has no references, run the taste test in [styles.md](styles.md#the-taste-test). The user picks the closest set and the furthest, and both go into `style.md`.

Read each reference for what it does, never by its name. Write down its stroke, ends, corners, fill and detail, so "like that set" becomes values. Put every reference on the review page. This is the first checkpoint.

## 5. Pick the style with the user

The references lead and the product narrows them. The directions, the signals and the questions are in [styles.md](styles.md).

Read the product: the interface type at body size, the control radius, the logo, any illustrations, the platform, the default theme, the density and whether the set covers pictograms. Measure the type only as far as it changes a choice, usually its stem width beside the labels.

Write the signals into `style.md`, as [formats.md](formats.md#style) shows. A direction proposed before the signals are written is `iconset-read-the-product`.

Ask with the question tool. Offer 2 or 3 directions the references and the signals both support, the first marked Recommended, each with its key values and the reference behind it. A reference's own style is a direction too, described in the table's columns.

A redraw also offers the old set's measured style, and a native app offers staying close to the platform's symbols. Ask how fill is used in a second question, with the platform's convention first. A sharp technical style assumed without asking is `iconset-ask-the-style`.

Draw 12 to 20 icons in every offered direction, hardest first: the most abstract concept, one with curves, one with a diagonal and one recurring part. A style that survives the hardest concept survives the rest.

Set each tile in real rows of the product on the review page, at interface size, in both themes. A direction picked from adjectives, a library's name or 3 icons is `iconset-style-tiles`.

A lukewarm yes, such as "that's fine", is not a pick. Ask what is missing, change one property and show the tile again. Record the pick and why in `style.md`. This is the second checkpoint.

The direction changes how a shape is built, never what it shows. People recognise and like familiar metaphors most, so search stays a magnifying glass in every direction. An eye drawn for search to look on-brand is `iconset-style-keeps-metaphors`.

## 6. Keep the look in variables

Write the picked values into `style.json`: each size's stroke, the radius, the caps, the joins, the cut width and the duotone's back layer. Its format is in [formats.md](formats.md#variables). Every drawing reads them, so one change moves the whole set. A radius typed into each path by hand is `iconset-style-in-variables`.

Where the agent draws, each icon is a short script of shared helpers, such as a rounded polyline, a rounded rect and an arc, and the SVG is its output. Where a designer draws, the values are the design file's variables.

The variables are for deciding, not for shipping. Each shipped icon is drawn at the picked values and corrected by hand, and the package offers no stroke or radius slider.

Name the property behind a vague note. "Too harsh" can mean the corners, the stroke ends or the weight, so show 2 or 3 variants that each change one of them. The translations are in [styles.md](styles.md#feedback-words). A guessed fix for a vague note is `iconset-name-the-property`.

A radius is never one number for every corner. Cap it at a quarter of the shorter segment it joins, halve it on angles under 60° and drop it where 3 or more lines meet. A star rounded like a square is `iconset-radius-fits-the-part`.

After every global change, reopen the whole set on the review page, small and sharp-angled icons first, and fix what the change broke. A global change shipped after checking only the icons it was tried on is `iconset-recheck-after-global`.

## 7. Write the voice before the first drawing

The voice is how every icon is built, written as rules with a drawn example each. Start from the picked values in `style.md` and `style.json`.

Write how shapes start, such as straight lines at 0°, 45° and 90° with sharp corners, or circles and free curves with round ends. Write whether a shape that could stay open is closed, whether lines run on to the keyline and how far corners round.

A hand-drawn direction also writes how lines wobble, overshoot or stop short, and which flourishes it allows.

Write which way an either-way composition faces and which way a slash cuts. Write the standard last: an icon never takes more attention than the label beside it.

A voice of adjectives, such as "friendly but precise", is `iconset-write-the-voice`. Each line names a broken drawing and the drawing that replaces it, like a pair.

Mark each line must or should. A must holds everywhere, such as the stroke, the caps and the grid. A should, such as running lines on to the keyline, bends where the icon reads better, and its row says why. A should followed into an icon that reads worse is `iconset-must-and-should`.

## 8. Pick each stroke beside the product's type

Draw 3 seed icons at 3 candidate strokes from the picked direction's range, centred on the type's stem width. Set each in a real row of the product, beside its own font at its interface size. Pick the stroke that holds its own beside the text without outweighing it.

A stroke picked on an empty artboard, or copied from another set, is `iconset-stroke-beside-text`. A filled direction picks its narrowest counter the same way, and a pixel direction picks its pixel step.

Light strokes on a dark background read heavier than the same stroke on light. When the themes disagree, the theme the product opens in decides.

Each size gets its own drawing and its own stroke, such as 1.25 at 16 and 1.5 at 24. One drawing serves the range in `icons-size-range`, so add a size only where the product shows icons past it. A filled form of a line icon may step its stroke up one notch.

## 9. Draw a seed set and check it in the product

Draw 12 to 20 seed icons before the bulk, starting from the picked tile. Cover each keyline, a diagonal, an arrow and every part that recurs, such as a file, a folder and the plus badge. The circle keyline is drawn larger than the square so both read as one size.

Load the seed into the sheet from `icons` as the set, then copy its spec to `icon-spec.md` and fill in its Voice table from step 7. From then on every icon goes through `icons`. Drawing the bulk before the seed passes is `iconset-seed-first`.

Show the seed in real rows on the review page and, where the product runs, in the product itself. Ask the user to look at it at 100% on their own screen. This is the third checkpoint.

## 10. Find each contested concept's picture

Before drawing a contested concept, collect 10 to 20 versions from other icon sets, products and image searches. Put them on the review page as options, from the literal to the abstract.

The user picks the version closest to right, and the row riffs on that one. A contested concept drawn from imagination is `iconset-find-the-picture`.

When the user rejects a drawing, ask what is wrong with it or show one-change variants. A new attempt after "I don't like any of those", with no new reference or reason, is `iconset-no-blind-retry`.

Show a concept only this product has to 5 people without its label, and ask what it shows and what it does. Fewer than 4 right means a redraw or a visible label beside it. A new metaphor shipped untested is `iconset-test-new-metaphors`, and without testers the report says `Not tested`.

## 11. Register every recurring part

List each part that appears in more than one icon, such as files, folders, badges, slashes, dots, notches and eyes. Draw each once as a source, with its size and position. Build every icon that uses it from that source, so one change updates all of them. A folder redrawn by hand in its tenth icon is `iconset-register-parts`.

Keep one overview per part, lining up every icon that uses it. A drifted badge or a deeper notch shows there before it ships.

Compose parts at the source and ship each icon flat. Parts composed at runtime cost about twice the bytes per icon and can shift artwork by a pixel. A runtime `badge` prop is `iconset-ship-flat`.

## 12. Draw the bulk in batches

Give each new or contested concept a row of at least 3 attempts at its shipped size. Pick beside its neighbours in the set, never alone, and keep the row so the next choice can see why. A new concept shipped from one attempt is `iconset-explore-in-rows`.

A variant composed from registered parts, such as a folder with a plus, needs one drawing and no row. A hand-drawn direction draws each icon at least 3 times and keeps the strongest, then evens out the weight.

Draw in batches by family, such as every file icon together, so a part stays aligned across the family. Run each batch through `icons`, from the lint to the phone.

Show the first batch, about 40 icons across several families, before drawing the rest. It is the last cheap point to change the style. Redrawing the whole set before the user sees a first batch is `iconset-first-batch`. This is the fourth checkpoint.

## 13. Map every old icon to its replacement

Give every old icon one state: To Do, Coupled to its replacement or Removed. A coupled icon keeps its old name, or its codepoint under `icons-keep-codepoints`, so the swap breaks no reference. A removed icon is retired on purpose, and nothing in the code still uses it.

Swapping the set while any icon is To Do, or while a removed icon is still referenced, is `iconset-map-the-migration`. Show the map on the review page, each old icon beside its replacement. The map's format is in [formats.md](formats.md#migration). The swap is the fifth checkpoint.

## 14. Make the SVG files the contract

The design source owns how an icon looks, and the repository owns all code made from it. Export one SVG per drawn variant into a fixed tree with a manifest, as [formats.md](formats.md#svg-tree) shows. Every file keeps its frame's fixed viewBox, with `overflow="visible"` where artwork passes the frame.

The export writes a report of missing, empty, duplicate and misaligned variants, each with its source node. Generating code while the report lists a miss is `iconset-svg-is-the-contract`.

Fix each problem where it starts: the drawing, the export, the generator or the catalogue. A CSS nudge in a generated component, or a hand edit to generated code, is `iconset-fix-at-the-source`.

## 15. Build everything with one command

One command reads the SVG tree and the manifest, then writes everything else. It generates the components, the sprite or font, the package index, the catalogue data and the counts the docs quote. It stops when the report lists a miss. A release that needs a manual step after the export is `iconset-one-command`.

The components follow `icons-match-the-api`, each style its own export and each size its own drawing. Write the steps to add an icon beside the package: draw it, export it and run the command.

## 16. Generate the catalogue from the manifest

The same command builds a catalogue page in the project's own stack. It shows the set by size and style, searches the tags and copies an icon's SVG, name or codepoint on hover. It holds the concept table and a list of icons beside real labels at their shipped size.

A catalogue kept by hand, or a docs page quoting last month's count, is `iconset-catalogue-from-manifest`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `iconset-run-every-step` | "The audit is done. Should I move on to the concepts?" | The audit, the concepts and the review page done, then the references asked at the first checkpoint |
| `iconset-review-page` | "Run the dev server and open Settings to see the icons" | "Open `.iconset/index.html`. Directions and In Context are new" |
| `iconset-audit-the-old-set` | "Redraw all 498 icons", the count in the docs | "468 drawn, 12 duplicates, 30 unused, 4 dead codepoints" |
| `iconset-one-icon-per-concept` | `bolt` and `sparkle` both meaning the agent | `Agent: sparkle` in the concept table, `bolt` kept for speed |
| `iconset-tag-every-icon` | `magnifying-glass` with no tags | `magnifying-glass` tagged `search, find, lookup` |
| `iconset-ask-for-references` | Three directions drawn from the product's type alone | The user's two linked sets and one disliked set on the review page, then directions |
| `iconset-read-the-product` | Round proposed before the type or radius is read | `style.md` lists a 1.4 stem and 10px controls, then Round |
| `iconset-ask-the-style` | A sharp 0°, 45° and 90° set drawn because the last product had one | 3 directions offered with their values and references, Round picked |
| `iconset-style-tiles` | Neutral picked from a folder, a gear and a star | 16 icons in each direction in real sidebar rows, the abstract ones first |
| `iconset-style-keeps-metaphors` | An eye for search, drawn to look playful | The magnifying glass, drawn in the playful direction |
| `iconset-style-in-variables` | `rx="2"` typed into 371 files | `radius: 2` in `style.json`, read by every drawing |
| `iconset-name-the-property` | "Too harsh", answered with every corner rounded | Round ends, a 1.5 radius and a lighter stroke shown side by side, round ends picked |
| `iconset-radius-fits-the-part` | The star's 3.4 long points rounded at 2 | The star's points capped at 0.85 |
| `iconset-recheck-after-global` | Radius raised, checked on the folder and shipped | Radius raised, the whole set reopened, the star and the bolt fixed |
| `iconset-write-the-voice` | "Friendly but precise" | "A cloud from straight segments with rounded joins, never from circles" |
| `iconset-must-and-should` | The bolt bent to 45° because diagonals run at 45° | The bolt at its own angle, its row noting the should it bent |
| `iconset-stroke-beside-text` | 1.5 chosen on an empty artboard | 1.25 chosen in a sidebar row beside the product's own labels |
| `iconset-seed-first` | 200 icons drawn, then measured | 16 seed icons passing the sheet, then the rest |
| `iconset-find-the-picture` | A tag icon invented, then redrawn 4 times | 14 tags from other sets on the review page, the chevron tag picked and riffed on |
| `iconset-no-blind-retry` | "I don't like any of those", answered with 3 new guesses | "Is it the hole, the angle or the shape?", then one-change variants |
| `iconset-test-new-metaphors` | The parallel-run icon shipped because the team liked it | 4 of 5 people said "run in parallel" without the label |
| `iconset-register-parts` | The folder redrawn by hand in `FolderLockIcon` | `FolderLockIcon` built from the registered folder |
| `iconset-ship-flat` | `<FileIcon badge="clock" />` composed at runtime | `FileBadgeClockIcon` shipped flat |
| `iconset-explore-in-rows` | One menu icon drawn and shipped | A row of menu icons, picked beside the set |
| `iconset-first-batch` | All 371 icons redrawn, then "it's too harsh" | 40 icons shown, the radius raised, then the rest |
| `iconset-map-the-migration` | The new font swapped in and the breaks fixed after | Every old icon Coupled or Removed, none To Do |
| `iconset-svg-is-the-contract` | Components generated while the report lists 3 empty variants | The report empty, then the components |
| `iconset-fix-at-the-source` | `translate: 0 -1px` in the generated `ChatIcon` | The chat drawing fixed and exported again |
| `iconset-one-command` | A README with six steps after the export | `npm run icons` |
| `iconset-catalogue-from-manifest` | A hand-written docs page that says 498 icons | The catalogue built from the manifest by the same command |

## Reporting

**Severity.** `HIGH` is a swap with icons still To Do, a removed icon still referenced, two icons for one concept or a hand edit to generated code.

`MEDIUM` is a redraw with no audit, no review page or no references asked. It is also a style assumed or picked without tiles, or a familiar metaphor traded for style. A voice of adjectives, a stroke not picked beside the text, values typed by hand or a radius that ignores the part are `MEDIUM`.

`MEDIUM` also covers a global change not rechecked, a guessed fix for a vague note or a blind retry. So is the bulk drawn before the seed or the first batch, or a part redrawn by hand. Runtime composition, code generated past the report, a manual release step and a catalogue kept by hand are `MEDIUM` too.

`LOW` is an untagged icon, a new concept from one attempt or a direction proposed before the signals are read. It is also a should followed into a worse icon, an untested new metaphor or a stop between steps.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a catalogue or review page you could not open as `Not verified`.
