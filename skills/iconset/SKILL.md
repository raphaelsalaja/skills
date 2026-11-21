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

Run every step in order without asking whether to go on. Stop only at 5 checkpoints: the references, the style, the seed, the first batch and the swap. A question a step raises waits for the next checkpoint, such as which unused icons to drop.

Each checkpoint asks all its questions in one message, so it costs the user one reply. Stopping after a step to ask whether to continue is `iconset-run-every-step`.

Run it when the user asks for a new icon set, a redraw of the whole set or a replacement for an inherited library. A missing glyph in a set that already exists belongs to `icons`.

Drawing each glyph, the measured spec, the sheet, the lint, the morph form and kept codepoints belong to `icons`. Which icons the product drops belongs to `scope`. A board of references from the user's own saves belongs to `gather`. Releasing the package belongs to `ship`.

Labels on the catalogue belong to `copy`, and accessible names belong to `defaults`. Mirroring directional icons in right-to-left layouts belongs to `viewports`. How a swapping icon animates belongs to `motion`.

## 1. Open one review page

Copy [review.html](review.html) to `.iconset/index.html`, an ignored folder, and write `review.js` beside it as its header comment shows. The user opens it from disk, so it never waits on the product or a dev server.

Where the agent draws, `.iconset/render.mjs` runs the icon scripts and writes `review.js`. Every file that outlives the review is committed beside the icons, never in `.iconset/`, as the tree in [formats.md](formats.md) shows.

Every step adds its section: the audit, the contested pictures, the references and the directions. Then come the voice, the strokes, the parts, the seed, each batch with its rows and the migration map. Rows set icons beside the product's labels in its own font, and Both Themes shows light and dark side by side.

When the product's font is not installed, copy its files into `.iconset/fonts/` and load them in `review.js`, as the header shows. Rows in a fallback font judge the icons beside the wrong stems.

End every checkpoint with the page's path, the sections that changed and what to look at. Work shown only inside the running app, or only described in chat, is `iconset-review-page`.

Copy Feedback hands back the user's picks, their stroke, caps and joins overrides and their notes. Read that message before changing anything. The glyph sheet from `icons` stays the measuring tool, and the review page is what the user looks at.

## 2. Audit the old set

Count the icons from the source files, never from the docs. List duplicates under two names, icons no code references, codepoints that lead nowhere and every custom viewBox and stroke. A redraw scoped from a documented count is `iconset-audit-the-old-set`.

Search the code for each name and codepoint to find what is used. An icon nothing uses is a drop candidate unless the product plans it. Mark the candidates on the review page, and the user decides through `scope` at the first checkpoint.

## 3. Pin one icon to each concept

List every concept the product shows as an icon, including the ones only this product has. Each concept gets exactly one icon, and the concept table says which. Two icons for one idea, or one icon for two, is `iconset-one-icon-per-concept`. The table's format is in [formats.md](formats.md#concepts).

Tag each icon with the words someone would search for, so a search for "search" finds `magnifying-glass`. An icon found only by its own name is `iconset-tag-every-icon`.

Mark a concept Swaps when its icon changes in place to another, such as play and pause or copy and copied. Step 12 gives only those the morph form.

Check each concept for what changes across the product's languages and regions. A letter, a currency sign, a regional object such as a postbox or a gendered figure gets a neutral metaphor or one drawing per locale. A `$` drawn for Billing in a product that charges in euros is `iconset-local-metaphors`. A product in one language and currency checks only the figures.

Mark a concept contested when other sets draw it many ways, the request says its old icon is disliked or only this product has it. Step 4 finds its picture before anything draws it, the style tiles included.

## 4. Find each contested concept's picture

Collect 10 to 20 versions of each contested concept from other icon sets, products and image searches. Order them from the literal to the abstract for the first checkpoint. SVG from open sets goes in an options section, and a product screenshot in an images section.

The user picks the version closest to right, and every later drawing of that concept riffs on it. A contested concept drawn from imagination is `iconset-find-the-picture`.

## 5. Learn the user's taste

Ask for references before proposing anything. Ask for icon sets, apps or sites whose icons the user likes, ones they dislike and the current icons they would change. Ask why for each. A style proposed before the user is asked for references is `iconset-ask-for-references`.

Ask 2 or 3 plain questions about feel in the same message, from [styles.md](styles.md#questions-about-feel), such as what the icons should never feel like. This message is the first checkpoint, sent once the audit, the drop candidates and the contested pictures are on the review page.

When the request names no references, put the taste test from [styles.md](styles.md#the-taste-test) on the page before that message. A user with nothing to link picks its closest row and its furthest instead. When the product has no type, brand or illustrations to read either, ask the [sliders](styles.md#sliders) too.

Read each reference for what it does, never by its name. Write down its stroke, ends, corners, fill and detail, so "like that set" becomes values. Put the references on the review page.

Write the two strongest feel answers under `## Traits` in `style.md`, each as "X, but not Y". A current icon the user would change becomes contested. Its pictures go on the review page for the second checkpoint, and the style tiles leave it out.

## 6. Pick the style with the user

The references lead and the product narrows them. The directions, the signals and the questions are in [styles.md](styles.md).

Read the product: the interface type at body size, the control radius, the logo, any illustrations, the platform, the default theme, the density and whether the set covers pictograms. Measure the type as [Reading the type](styles.md#reading-the-type) says, usually only its stem width.

Write the signals into `style.md`, as [formats.md](formats.md#style) shows. A direction proposed before the signals are written is `iconset-read-the-product`.

Choose 2 or 3 directions the references and the signals both support. A reference's own style is a direction too, described in the table's columns. In a redraw, the old set's measured style counts as one, tiled with the old icons themselves. A native app may count staying close to the platform's symbols as one.

Draw 12 to 20 icons in every direction, or every concept when the product shows fewer. Start with the hardest: the most abstract concept from its picked picture, one with curves, one with a diagonal and one recurring part. A style that survives the hardest concept survives the rest.

Where the agent draws, each icon is a short script of shared helpers, such as a rounded polyline and an arc, as [formats.md](formats.md#icon-scripts) shows. Each direction's scripts sit in `.iconset/directions/<name>/` beside that direction's own `style.json`. Where a designer draws, each direction is a frame with its own variables.

Draw each size the set will ship, with the values scaled as [styles.md](styles.md#directions) says. One drawing serves the range in `icons-size-range`, so a second size starts only where the product shows icons past it.

Set each tile in real rows of the product on the review page, in both themes. A direction picked from adjectives, a library's name or 3 icons is `iconset-style-tiles`.

Then ask which direction to take with the question tool. Mark the first Recommended and give each its key values and the reference behind it. Ask how fill is used in a second question, with the platform's convention first. A sharp technical style assumed without asking is `iconset-ask-the-style`.

These questions are the second checkpoint. The answer is the pick, and Copy Feedback adds the user's overrides and notes to it. A lukewarm yes, such as "that's fine", is not a pick. Ask what is missing, change one property and show the tile again. Record the pick and why in `style.md`.

The direction changes how a shape is built, never what it shows. People recognise and like familiar metaphors most, so search stays a magnifying glass in every direction. An eye drawn for search to look on-brand is `iconset-style-keeps-metaphors`.

## 7. Keep the look in variables

Move the picked direction's scripts into the icons' `src/`. Write its values into `style.json` with the user's overrides from Copy Feedback, such as a lighter 24 stroke, as [formats.md](formats.md#variables) shows. Step 9 settles each size's stroke beside the type.

Every drawing reads `style.json`, so one change moves the whole set. A radius typed into each path by hand is `iconset-style-in-variables`.

The variables are for deciding, not for shipping, so the package offers no stroke or radius slider. A correction the eye asks for lives in the icon's own script as a named override, so the next global change keeps it. An edit to a generated SVG is lost on the next run.

Name the property behind a vague note. "Too harsh" can mean the corners, the stroke ends or the weight, so show 2 or 3 variants that each change one of them. The translations are in [styles.md](styles.md#feedback-words). A guessed fix for a vague note is `iconset-name-the-property`.

When the user rejects a drawing outright, ask what is wrong with it or show one-change variants. A new attempt after "I don't like any of those", with no new reference or reason, is `iconset-no-blind-retry`.

A radius is never one number for every corner. Cap it at a quarter of the shorter segment it joins, halve it on angles under 60° and drop it where 3 or more lines meet. A star rounded like a square is `iconset-radius-fits-the-part`. The table is in [styles.md](styles.md#radius-by-part).

After every global change, reopen the whole set on the review page, small and sharp-angled icons first, and fix what the change broke. A global change shipped after checking only the icons it was tried on is `iconset-recheck-after-global`.

## 8. Write the voice before the first drawing

The voice is how every icon is built, written under `## Voice` in `style.md` as rules with a drawn example each. Start from the picked values in `style.md` and `style.json`.

Write how shapes start, such as straight lines at 0°, 45° and 90° with sharp corners, or circles and free curves with round ends. Write whether a shape that could stay open is closed, whether lines run on to the keyline and how far corners round.

A hand-drawn direction also writes how lines wobble, overshoot or stop short, and which flourishes it allows.

Write which way an either-way composition faces and which way a slash cuts. Write the standard last: an icon never takes more attention than the label beside it.

A voice of adjectives, such as "friendly but precise", is `iconset-write-the-voice`. Each line names a broken drawing and the drawing that replaces it, like a pair.

Mark each line must or should. A must holds everywhere, such as the stroke, the caps and the grid. A should, such as running lines on to the keyline, bends where the icon reads better, and its row says why. A should followed into an icon that reads worse is `iconset-must-and-should`.

## 9. Pick each stroke beside the product's type

Draw 3 icons from the picked tiles at 3 candidate strokes, centred on the stem width of the type each size sits beside. A stroke the user set in Copy Feedback is always one of the 3. Set each in a real row of the product, beside its own font at its interface size. Pick the stroke that holds its own beside the text without outweighing it.

Give each size its own section with `size`, `labelSize` and `labelWeight`, as the review page's header shows. Write each pick and why under `## Stroke` in `style.md`.

A stroke picked on an empty artboard, or copied from another set, is `iconset-stroke-beside-text`. A filled direction picks its narrowest counter the same way, and a pixel direction picks its pixel step.

Light strokes on a dark background read heavier than the same stroke on light. When the themes disagree, the theme the product opens in decides.

Each size gets its own drawing and its own stroke, such as 1.25 at 16 and 1.75 at 24. A filled form of a line icon may step its stroke up one notch.

## 10. Register every recurring part

List each part the concept table uses in more than one icon, such as files, folders, badges, slashes, dots, notches and eyes. Draw each once as a source, with its size and position, as [formats.md](formats.md#parts) shows. Build every icon that uses it from that source, so one change updates all of them. A folder redrawn by hand in its tenth icon is `iconset-register-parts`.

Keep one overview per part on the review page, lining up every icon that uses it. A drifted badge or a deeper notch shows there before it ships.

Compose parts at the source and ship each icon flat. Parts composed at runtime cost about twice the bytes per icon and can shift artwork by a pixel. A runtime `badge` prop is `iconset-ship-flat`.

## 11. Draw a seed set and check it in the product

Draw 12 to 20 seed icons before the bulk, starting from the picked tile and the registered parts. Cover each keyline, a diagonal, an arrow and every registered part. Include the lightest glyph the set will need, such as a single-stroke chevron, and its densest.

The seed sets the ink range the lint holds every later icon to. A seed with no single-stroke glyph fails every chevron and check in the bulk.

Load the seed into the sheet from `icons` as the set, never as new icons, one sheet per size. The seed passes when the sheet lists no outliers. Then copy the spec to `icon-spec.md`, one property table per size.

Copy the voice from `style.md` into its Voice table, with its must or should and two seed icons for each line. From then on that table is the voice, and every icon goes through `icons`.

Drawing the bulk before the seed passes is `iconset-seed-first`.

Show the seed in real rows on the review page and, where the product runs, in the product itself. Ask the user to look at it at 100% on their own screen. This is the third checkpoint.

## 12. Draw the bulk in batches

A concept added after step 4, such as a screen the user asks for at the seed, goes through steps 3 and 4 first. Its pictures wait for the next checkpoint beside its row.

Give each contested concept and each new metaphor a row of at least 3 attempts at its shipped size. Pick beside its neighbours in the set, never alone, and keep the row so the next choice can see why. A new concept shipped from one attempt is `iconset-explore-in-rows`.

A variant composed from registered parts, such as a folder with a plus, needs one drawing and no row. A hand-drawn direction draws each icon at least 3 times and keeps the strongest, then evens out the weight.

Draw in batches by family, such as every file icon together, so a part stays aligned across the family. Run each batch through `icons`, from the lint to the phone.

Only the concepts marked Swaps take the morph form, which `icons` checks through `swaps: true`. Padding every icon to the most complex one's path and segment counts multiplies the bytes for nothing. Morph form on icons that never swap is `iconset-morph-only-swaps`.

Set each group of icons the product shows together, such as the tab bar or an editor toolbar, at its shipped size. Press Squint on the review page, which blurs every icon by 1px. Two icons that blur into one shape are confused at a glance, so change the silhouette of one. A pair told apart only by an inner detail is `iconset-distinct-in-a-row`.

Show a concept only this product has to 5 people from its audience without its label. Ask what it shows, then what clicking it would do, naming only the kind of product. A question that uses a word from the label primes the answer.

Fewer than 4 right means a redraw or a visible label beside it. A new metaphor shipped untested is `iconset-test-new-metaphors`, and without testers the report says `Not tested`.

Show the first batch, about 40 icons from the first few families, before drawing the rest. It is the last cheap point to change the style. Redrawing the whole set before the user sees a first batch is `iconset-first-batch`. This is the fourth checkpoint.

## 13. Map every old icon to its replacement

Give every old icon one state: To Do, Coupled to its replacement or Removed. A coupled icon keeps its old codepoint under `icons-keep-codepoints`, so the swap breaks no reference. In a set with no codepoints, the swap moves every reference to the new name in the same change. A removed icon is retired on purpose, and nothing in the code still uses it.

Swapping the set while any icon is To Do, or while a removed icon is still referenced, is `iconset-map-the-migration`. Show the map on the review page, each old icon beside its replacement. The map's format is in [formats.md](formats.md#migration). The swap is the fifth checkpoint.

## 14. Make the SVG files the contract

The design source owns how an icon looks, and the repository owns all code made from it. Export one SVG per drawn variant into a fixed tree with a manifest, as [formats.md](formats.md#svg-tree) shows. Where the agent draws, the export is the first stage of step 15's command. Every file keeps its frame's fixed viewBox, with `overflow="visible"` where artwork passes the frame.

The export writes a report of missing, empty, duplicate and misaligned variants, each with its source node. Generating code while the report lists a miss is `iconset-svg-is-the-contract`.

Fix each problem where it starts: the drawing, the export, the generator or the catalogue. A CSS nudge in a generated component, or a hand edit to generated code, is `iconset-fix-at-the-source`.

A native app also exports each icon into the platform's own symbol template, so it takes the system's weights, scales and text alignment. The templates are in [styles.md](styles.md#radius-logo-and-platform). A custom iOS icon shipped as a flat image beside system symbols is `iconset-platform-template`.

## 15. Build everything with one command

One command reads the SVG tree and the manifest, then writes everything else. It generates the components, the sprite or font, the package index, the catalogue data and the counts the docs quote. A release that needs a manual step after the export is `iconset-one-command`.

Ship SVG: components where the product renders with a framework, and one sprite where it serves plain pages. Where the product already has an icon API, such as a map of SVG strings, generate that instead. An icon font draws boxes or stray words when fonts are blocked, late or overridden by the reader. A new set shipped only as an icon font is `iconset-pick-the-format`.

Build a font only where the product already ships one or a platform needs codepoints. It loads with `font-display: block` and holds only the icons the product uses.

The components follow `icons-match-the-api`, each style its own export and each size its own drawing. Write the steps to add an icon beside the package: draw it, export it and run the command.

## 16. Generate the catalogue from the manifest

The same command builds a catalogue page in the project's own stack. It shows the set by size and style and searches the tags. Copy buttons for an icon's SVG, name and codepoint show on hover and on focus. It holds the concept table and a list of icons beside real labels at their shipped size.

A catalogue kept by hand, or a docs page quoting last month's count, is `iconset-catalogue-from-manifest`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `iconset-run-every-step` | "The audit is done. Should I move on to the concepts?" | The audit, the concepts and the contested pictures done, then the references asked at the first checkpoint |
| `iconset-review-page` | "Run the dev server and open Settings to see the icons" | "Open `.iconset/index.html`. Directions and In Context are new" |
| `iconset-audit-the-old-set` | "Redraw all 498 icons", the count in the docs | "468 drawn, 12 duplicates, 30 unused, 4 dead codepoints" |
| `iconset-one-icon-per-concept` | `bolt` and `sparkle` both meaning the agent | `Agent: sparkle` in the concept table, `bolt` kept for speed |
| `iconset-tag-every-icon` | `magnifying-glass` with no tags | `magnifying-glass` tagged `search, find, lookup` |
| `iconset-local-metaphors` | A `$` on Billing in a product that charges in euros and yen | A banknote with no sign, read the same in every currency |
| `iconset-find-the-picture` | A tag icon invented, then redrawn 4 times | 14 tags from other sets on the review page, the chevron tag picked and riffed on |
| `iconset-ask-for-references` | Three directions drawn from the product's type alone | The user's two linked sets and one disliked set on the review page, then directions |
| `iconset-read-the-product` | Round proposed before the type or radius is read | `style.md` lists a 1.26 stem and 10px controls, then Round |
| `iconset-ask-the-style` | A sharp 0°, 45° and 90° set drawn because the last product had one | 3 directions offered with their values and references, Round picked |
| `iconset-style-tiles` | Neutral picked from a folder, a gear and a star | 16 icons in each direction in real sidebar rows, the abstract ones first |
| `iconset-style-keeps-metaphors` | An eye for search, drawn to look playful | The magnifying glass, drawn in the playful direction |
| `iconset-style-in-variables` | `rx="2"` typed into 371 files | `radius: 2` in `style.json`, read by every drawing |
| `iconset-name-the-property` | "Too harsh", answered with every corner rounded | Round ends, a 1.5 radius and a lighter stroke shown side by side, round ends picked |
| `iconset-no-blind-retry` | "I don't like any of those", answered with 3 new guesses | "Is it the hole, the angle or the shape?", then one-change variants |
| `iconset-radius-fits-the-part` | The star's 3.4 long points at 36°, rounded at 2 | The star's points at 0.425, a quarter of 3.4 halved for the angle |
| `iconset-recheck-after-global` | Radius raised, checked on the folder and shipped | Radius raised, the whole set reopened, the star and the bolt fixed |
| `iconset-write-the-voice` | "Friendly but precise" | "A cloud from straight segments with rounded joins, never from circles" |
| `iconset-must-and-should` | The bolt bent to 45° because diagonals run at 45° | The bolt at its own angle, its row noting the should it bent |
| `iconset-stroke-beside-text` | 1.5 chosen on an empty artboard | 1.25 chosen in a sidebar row beside the product's own labels |
| `iconset-register-parts` | The folder redrawn by hand in `FolderLockIcon` | `FolderLockIcon` built from the registered folder |
| `iconset-ship-flat` | `<FileIcon badge="clock" />` composed at runtime | `FileBadgeClockIcon` shipped flat |
| `iconset-seed-first` | 200 icons drawn, then measured | 16 seed icons passing the sheet, then the rest |
| `iconset-explore-in-rows` | One menu icon drawn and shipped | A row of menu icons, picked beside the set |
| `iconset-morph-only-swaps` | 400 icons padded to 6 paths of 14 segments each | The 12 icons marked Swaps in the morph form, the rest in plain paths |
| `iconset-distinct-in-a-row` | Inbox and Archive in one tab bar, told apart by one line inside the tray | Archive redrawn as a box with a lid, a different shape when blurred |
| `iconset-test-new-metaphors` | The parallel-run icon shipped because the team liked it | 4 of 5 people said "run in parallel" without the label |
| `iconset-first-batch` | All 371 icons redrawn, then "it's too harsh" | 40 icons shown, the radius raised, then the rest |
| `iconset-map-the-migration` | The new font swapped in and the breaks fixed after | Every old icon Coupled or Removed, none To Do |
| `iconset-svg-is-the-contract` | Components generated while the report lists 3 empty variants | The report empty, then the components |
| `iconset-fix-at-the-source` | `translate: 0 -1px` in the generated `ChatIcon` | The chat drawing fixed and exported again |
| `iconset-platform-template` | A custom iOS icon as a PDF that stays Regular beside Bold labels | The icon in the symbol template, its 3 sources matched path for path |
| `iconset-one-command` | A README with six steps after the export | `npm run icons` |
| `iconset-pick-the-format` | A new set shipped as an icon font to a React app | Generated components, tree-shaken per icon |
| `iconset-catalogue-from-manifest` | A hand-written docs page that says 498 icons | The catalogue built from the manifest by the same command |

## Reporting

**Severity.** `HIGH` is a swap with icons still To Do, a removed icon still referenced, two icons for one concept or a hand edit to generated code.

`MEDIUM` is a redraw with no audit, no review page or no references asked. It is also a style assumed or picked without tiles, or a familiar metaphor traded for style. A voice of adjectives, a stroke not picked beside the text, values typed by hand or a radius that ignores the part are `MEDIUM`.

`MEDIUM` also covers a global change not rechecked, a guessed fix for a vague note or a blind retry. So is the bulk drawn before the seed or the first batch, or a part redrawn by hand. Runtime composition, code generated past the report, a manual release step and a catalogue kept by hand are `MEDIUM` too.

A metaphor bound to one language or region, icons in one row told apart only by inner detail and a contested concept drawn without its picture are `MEDIUM`. So are a native icon outside the platform's template and a new set shipped only as a font.

`LOW` is an untagged icon, a new concept from one attempt or a direction proposed before the signals are read. It is also a should followed into a worse icon, an untested new metaphor or a stop between steps. Morph form on icons that never swap is `LOW`.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a catalogue or review page you could not open as `Not verified`.
