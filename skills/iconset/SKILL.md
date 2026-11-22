---
name: iconset
description: Builds or redraws a whole icon library from the user's description and at most 3 questions, a confirmed sample row, shared parts and one build command.
disable-model-invocation: true
---

# Iconset

This skill builds an icon library from nothing, or redraws an inherited one as a single system. It asks what icons the user wants, confirms the look on one sample row, then ships every icon through one command.

## The pipeline is exact and the look is the user's

The pipeline is exact. Each concept has one icon, each size has one stroke and every old icon has one migration state before the swap.

The look is the user's, said in their own words and confirmed on the sample row. The product's existing icon API, file format and platform templates win over this skill's defaults.

The run stops twice: at the sample row, and before the swap when an old set is replaced. Between them it runs every step without asking whether to go on.

After each step, write it under `## Progress` in `style.md`, as [formats.md](formats.md#style) shows, and set `step` in `review.js`. A new session continues from there.

A missing glyph in a set that already exists belongs to `icons`, as do drawing each glyph, the measured spec, the sheet, the lint, the morph form and kept codepoints. Which icons the product drops belongs to `scope`. A board of the user's own saves belongs to `gather`. Releasing the package belongs to `ship`. Catalogue labels belong to `copy`, accessible names to `defaults`, mirrored icons to `viewports` and swap animations to `motion`.

## 1. Ask what icons they want

Open with one question: "What kind of icons do you want?" A description, a set they like or a screenshot all count. Drawing anything before asking is `iconset-ask-first`.

Then ask at most 3 follow-ups with the question tool, in one message, only about what the answer left open. Pick from line or filled, light or heavy, round or sharp corners and which sizes ship. A fourth question, or a second round before the sample, is `iconset-few-questions`.

Fill every other gap from the product without asking, as [Reading the product](styles.md#reading-the-product) shows. The type sets the stroke, the control radius sets the corners and the platform sets the fills.

Turn the answers into values with [Directions](styles.md#directions) and [Fills](styles.md#fills). Write the user's words and the values into `style.md`.

## 2. Show a sample row

Copy [review.html](review.html) to `.iconset/index.html`, an ignored folder, and write `review.js` beside it as its header comment shows. The user opens it from disk, so it never waits on a dev server.

Rows set icons beside the product's labels in its own font, copied into `.iconset/fonts/` when not installed, since a fallback font judges icons beside the wrong stems.

Where the agent draws, write `icons/helpers.mjs` and `.iconset/render.mjs` in the project first, as [formats.md](formats.md#icon-scripts) specifies. Each icon is then a short script in `src/` that reads `style.json`.

Draw about 8 of the product's own icons, hardest first: the most abstract concept, one with curves, one with a diagonal and one recurring part. Set them in real rows of the product, in both themes and at every size that ships.

End with the page's path and what to look at. Work shown only in the running app, or only described in chat, is `iconset-review-page`. This is the first checkpoint.

Copy Feedback hands back the user's picks, overrides and notes. Read it before changing anything.

A lukewarm "that's fine" is not a confirmation. "Too harsh" can mean the corners, the ends or the weight, so show variants that each change one, from [Feedback words](styles.md#feedback-words). A guessed fix, or a new attempt with no new reason, is `iconset-name-the-property`.

Record the confirmed values and each change in `style.md`. Drawing the rest before the user confirms the sample is `iconset-sample-first`.

## 3. Draw the full set

List every concept the product shows as an icon, and give each exactly one icon in the concept table, as [formats.md](formats.md#concepts) shows. Two icons for one idea, or one icon for two, is `iconset-one-icon-per-concept`.

Tag each icon with the words someone would search for, so "search" finds `magnifying-glass`. An icon found only by its own name is `iconset-tag-every-icon`.

Keep every look value in `style.json`, as [formats.md](formats.md#variables) shows, so one change redraws the set. A radius typed into each path by hand is `iconset-style-in-variables`. A correction the eye asks for is a named override in the icon's own script.

The values are for drawing, so the package ships no stroke or radius prop. After a global change, reopen the whole set, small and sharp-angled icons first.

The style changes how a shape is built, never what it shows. An eye drawn for search to look on-brand, instead of the magnifying glass people recognise, is `iconset-style-keeps-metaphors`.

Draw each part used in more than one icon once as a source, such as a file, a folder, a badge or a slash, as [formats.md](formats.md#parts) shows. A folder redrawn by hand in its tenth icon is `iconset-register-parts`.

Compose parts at the source and ship each icon flat, since runtime composition doubles the bytes and can shift artwork by a pixel. A runtime `badge` prop is `iconset-ship-flat`.

Load the sample into the sheet from `icons` as the set, one sheet per size, and copy its spec to `icon-spec.md`. From then on every icon goes through `icons`, in batches by family.

Mark a concept Swaps when its icon changes in place into another, such as play and pause. Padding every icon to the most complex one's counts multiplies the bytes, so morph form on an icon not marked Swaps is `iconset-morph-only-swaps`.

## 4. Map every old icon, when replacing a set

Count the old icons from the source files, never from the docs. Give each one state: To Do, Coupled to its replacement or Removed, as [formats.md](formats.md#migration) shows. A coupled icon keeps its codepoint under `icons-keep-codepoints`.

A set with no codepoints moves every reference to the new name in the same change. Swapping while any icon is To Do, or a removed icon is still referenced, is `iconset-map-the-migration`.

Show the map on the review page. The swap is the second checkpoint.

## 5. Make the SVG files the contract

Export one SVG per drawn variant into a fixed tree with a manifest, as [formats.md](formats.md#svg-tree) shows. Each keeps its fixed viewBox, with `overflow="visible"` where artwork passes the frame. Where the agent draws, the export is the first stage of step 6's command.

The export reports missing, empty, duplicate and misaligned variants with their source. Generating code while the report lists a miss is `iconset-svg-is-the-contract`.

Fix each problem where it starts. A CSS nudge in a generated component, or a hand edit to generated code, is `iconset-fix-at-the-source`.

A native app also exports each icon into the platform's symbol template, so it takes the system's weights and scales, as [styles.md](styles.md#platform-templates) shows. A custom iOS icon shipped as a flat image is `iconset-platform-template`.

## 6. Build everything with one command

One command reads the SVG tree and the manifest, then writes the components, the sprite or font, the package index, the counts the docs quote and the catalogue. A release that needs a manual step after the export is `iconset-one-command`.

Ship SVG components, one sprite for plain pages or the product's own icon API, such as a map of SVG strings. A font draws boxes when blocked or late, so a new set shipped only as a font is `iconset-pick-the-format`.

Build a font only where the product already ships one or a platform needs codepoints. It loads with `font-display: block` and holds only the icons in use.

The components follow `icons-match-the-api`. Write the steps to add an icon beside the package: draw it, export it and run the command.

The catalogue, in the project's own stack, shows the set by size and style, searches the tags and holds the concept table. Copy buttons for SVG, name and codepoint show on hover and on focus. A catalogue kept by hand, or docs quoting last month's count, is `iconset-catalogue-from-manifest`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `iconset-ask-first` | Three styles drawn from the product's type alone | "What kind of icons do you want?", then the follow-ups | `MEDIUM` |
| `iconset-few-questions` | Eight questions about feel, references and sliders | "Rounded, light line icons", then 2 follow-ups: the fill and the sizes | `MEDIUM` |
| `iconset-review-page` | "Run the dev server and open Settings" | "Open `.iconset/index.html`. Sample is new" | `MEDIUM` |
| `iconset-name-the-property` | "Too harsh" or "none of those", answered with new guesses | Round ends, a smaller radius and a lighter stroke side by side | `MEDIUM` |
| `iconset-sample-first` | All 371 icons drawn, then "it's too harsh" | 8 icons shown, the radius raised, then the rest | `MEDIUM` |
| `iconset-one-icon-per-concept` | `bolt` and `sparkle` both meaning the agent | `Agent: sparkle` in the concept table, `bolt` kept for speed | `HIGH` |
| `iconset-tag-every-icon` | `magnifying-glass` with no tags | `magnifying-glass` tagged `search, find, lookup` | `LOW` |
| `iconset-style-in-variables` | `rx="2"` typed into 371 files | `radius: 2` in `style.json` | `MEDIUM` |
| `iconset-style-keeps-metaphors` | An eye for search, drawn to look playful | The magnifying glass, drawn playfully | `MEDIUM` |
| `iconset-register-parts` | The folder redrawn by hand in `FolderLockIcon` | `FolderLockIcon` built from the registered folder | `MEDIUM` |
| `iconset-ship-flat` | `<FileIcon badge="clock" />` composed at runtime | `FileBadgeClockIcon` shipped flat | `MEDIUM` |
| `iconset-morph-only-swaps` | 400 icons padded to 6 paths of 14 segments | The 12 Swaps icons in the morph form, the rest plain | `LOW` |
| `iconset-map-the-migration` | The new font swapped in and the breaks fixed after | Every old icon Coupled or Removed, none To Do | `HIGH` |
| `iconset-svg-is-the-contract` | Components generated while the report lists 3 empty variants | The report empty, then the components | `MEDIUM` |
| `iconset-fix-at-the-source` | `translate: 0 -1px` in the generated `ChatIcon` | The chat drawing fixed and exported again | `HIGH` |
| `iconset-platform-template` | A custom iOS icon as a PDF that stays Regular beside Bold labels | The icon in the symbol template | `MEDIUM` |
| `iconset-one-command` | A README with six steps after the export | `npm run icons` | `MEDIUM` |
| `iconset-pick-the-format` | A new set shipped as an icon font to a React app | Generated components, tree-shaken per icon | `MEDIUM` |
| `iconset-catalogue-from-manifest` | A hand-written docs page that says 498 icons | The catalogue built by the same command | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a catalogue or review page you could not open as `Not verified`.
