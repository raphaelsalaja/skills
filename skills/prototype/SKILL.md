---
name: prototype
description: Builds several real, labelled variants of one idea on a single page so the user can pick, then deletes the rest.
disable-model-invocation: true
---

# Prototype

This skill explores one idea as several working variants. The user compares them in the running app, picks one and the others are deleted.

## Real code, then gone

Each variant is real code with real data in the real app, not a mockup. Build the number asked for. With no number, build five that differ in approach, not only in colour. The page is temporary and goes once a variant is picked.

Every state of an existing component on one page belongs to `lab`. Copying an outside reference belongs to `match`.

## 1. Restate the idea

Write the idea in one line and the axis the variants explore, such as layout, motion or density. Ask one question when the idea has two readings.

## 2. Build real variants

Use the project's components and real or realistic data. A static image or lorem ipsum is `prototype-real-code` or `prototype-real-data`.

## 3. Put them on one page

Show every variant on one route. Separate pages per variant is `prototype-one-page`. Copy [switcher.js](switcher.js) into the app beside that route and load it once, as its header comment shows. Wrap the variants in `<prototype-switcher>`, one child each with `data-variant` and `data-note`.

The switcher ships with the skill, so write the variants only. A switcher, tab row or grid written from scratch is `prototype-shipped-switcher`.

Give each a short label that says how it differs. "Variant 3" is `prototype-label-variants`. Use the app's current theme unless the user asked for both. Light and dark side by side by default is `prototype-one-theme`.

Each `data-note` holds one line on when the variant wins and one on what it costs. A note that only describes the layout is `prototype-name-the-cost`.

The bar sits at the bottom centre. When a variant uses that spot, such as a toast stack, set `data-position="top"` on `<prototype-switcher>`. A bar covering the variant's own toasts is `prototype-bar-clears-the-work`.

## 4. Open it

Start the dev server, open the page and look at every variant once. A path in the reply with nothing opened is `prototype-open-it`.

Click the current variant and press R to replay it, so its entrance runs again without a reload. The switcher's header comment shows how a framework component remounts on replay. Judging an entrance from the first load alone is `prototype-replay-motion`.

## 5. Prune after the pick

The bar's Pick button copies a line such as "Pick Inline Filters from /prototypes/filters" for the user to paste back. When the user picks, move that variant into the product. Delete the losing variants with the route, `switcher.js` and its type declaration. Leftover variants after a pick is `prototype-prune-after-pick`.

## 6. Riff on the pick

When the user asks for another round, build it around the chosen variant. Each new variant keeps what won and pushes one part of it a different way. A second round that starts from scratch is `prototype-riff-the-pick`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `prototype-real-code` | A static mockup image | The variant built from project components |
| `prototype-real-data` | Lorem ipsum rows | Real or realistic rows |
| `prototype-one-page` | Five routes, one per variant | One route with a switcher |
| `prototype-shipped-switcher` | A switcher written from scratch | `switcher.js` loaded, only the variants written |
| `prototype-label-variants` | `Variant 3` | `Inline Filters` |
| `prototype-one-theme` | Light and dark side by side, unasked | The app's current theme |
| `prototype-name-the-cost` | `data-note="Pills above the grid"` | `data-note="Wins with under 6 filters. Costs a row above the grid."` |
| `prototype-bar-clears-the-work` | The bar over a bottom-centre toast stack | `<prototype-switcher data-position="top">` |
| `prototype-open-it` | "Built at `/prototypes/filters`" | The page opened, every variant checked |
| `prototype-replay-motion` | An entrance judged once, then reloaded to see it again | R pressed to replay the variant in place |
| `prototype-prune-after-pick` | Four losing variants left in `src/` | The pick shipped, the rest deleted |
| `prototype-riff-the-pick` | Five fresh ideas after the user picked one | Five turns on the pick, each changing one part |

## Reporting

**Severity.** `HIGH` is a variant that does not run, or losing variants left after a pick. `MEDIUM` is placeholder data, unlabelled variants, variants that differ only in colour or a hand-built switcher. It is also a bar covering the variant's own work, or an entrance judged from one load. `LOW` is a page that was not opened for the user, a variant with no cost named or a second round that ignores the pick.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every variant you could not open as `Not verified`.
