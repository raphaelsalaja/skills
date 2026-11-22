---
name: prototype
description: Builds several real, labelled variants of one idea on a single page so the user can pick, then deletes the rest.
disable-model-invocation: true
---

# Prototype

This skill explores one idea as several working variants. The user compares them in the running app, picks one and the others are deleted.

## Real code, then gone

Each variant is real code with real data in the real app, not a mockup. Build the number asked for. With no number, build five. The page is temporary and goes once a variant is picked.

Variants differ in approach along the axis from step 1, not in styling. Five filter bars that differ only in accent colour or radius are `prototype-differ-in-approach`. Inline pills, a sidebar, a command menu, a sheet and saved views are five approaches.

Every state of an existing component on one page belongs to `lab`. Copying an outside reference belongs to `match`.

## 1. Restate the idea

Write the idea in one line and the axis the variants explore, such as layout, motion or density. Ask one question when the idea has two readings.

## 2. Build real variants

Use the project's components and real or realistic data. A static image or lorem ipsum is `prototype-real-code` or `prototype-real-data`.

Every variant renders the same data, copy and container width, so the axis is the only difference. Load the rows from one shared fixture. Three rows in one variant beside forty in another is `prototype-hold-the-rest`.

Keep each variant in its own file beside the route, such as `prototypes/filters/inline-filters.tsx`. A variant that needs a shared component changed edits a copy in that folder, never the original. Until the pick, `git diff --stat` shows nothing outside the folder. The one exception is the line that registers the route in an app with a central router. `components/button.tsx` edited for one variant, changing every page, is `prototype-isolate-variants`.

## 3. Put them on one page

Show every variant on one route. Separate pages per variant is `prototype-one-page`. Copy [switcher.js](switcher.js) into the app beside that route and load it once, as its header comment shows. Wrap the variants in `<prototype-switcher>`, one child each with `data-variant` and `data-note`.

The route is development-only, gated the way the app gates its other dev pages or behind `process.env.NODE_ENV === "development"`. A prototype a production build can reach is `prototype-dev-only`.

The switcher ships with the skill, so write the variants only. A switcher, tab row or grid written from scratch is `prototype-shipped-switcher`.

Give each a short label that says how it differs. "Variant 3" is `prototype-label-variants`. The theme follows `defaults`.

Each `data-note` holds one line on when the variant wins and one on what it costs. A note that only describes the layout is `prototype-name-the-cost`.

The bar sits at the bottom centre. When a variant uses that spot, such as a toast stack, set `data-position="top"` on `<prototype-switcher>`. A bar covering the variant's own toasts is `prototype-bar-clears-the-work`.

The bar shows the current variant's name. Clicking it or pressing ⌘K opens a palette that searches labels and notes. A variant that needs ⌘K itself calls `preventDefault` on it and keeps it.

## 4. Open it

Open the page and look at every variant once, as `verify` asks. Click the current variant and press R to replay it, so its entrance runs again without a reload. The switcher's header comment shows how a framework component remounts on replay. Judging an entrance from the first load alone is `prototype-replay-motion`.

## 5. Prune after the pick

The bar's Keep and Drop buttons mark variants, Note adds the user's own note to one and Copy Prompt copies a review to paste back. With no marks, the current variant counts as kept:

```
Prototype review: /prototypes/filters

Keep:
- Inline Filters
  Note: Make the counts bigger

Unmarked:
- Sidebar List
- Filter Sheet

Next: Move Inline Filters into the product, then delete the other variants. Follow each note.
```

A note is part of the pick, so the shipped or merged variant carries out what it asks.

When the user keeps one variant, move it into the product. Delete the losing variants with the route, `switcher.js` and its type declaration. Leftover variants after a pick is `prototype-prune-after-pick`.

Two or more kept variants make a merge, and so does a pick naming parts of two, such as "Inline Filters with the sidebar's counts". Build that merge as one more variant, open it and prune once the user confirms it. Shipping Inline Filters and dropping the counts is `prototype-merge-named-parts`.

A variant under Drop has its file and section deleted at once, and unmarked variants stay for another look. A merge borrows nothing from a dropped variant. Filter Sheet left on the page, or its sheet reused in the merge, is `prototype-delete-dropped`.

## 6. Riff on the pick

When the user asks for another round, build it around the chosen variant. Each new variant keeps what won and pushes one part of it a different way. A second round that starts from scratch is `prototype-riff-the-pick`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `prototype-differ-in-approach` | Five filter bars in five accent colours | Inline pills, a sidebar, a command menu, a sheet and saved views | `MEDIUM` |
| `prototype-real-code` | A static mockup image | The variant built from project components | `MEDIUM` |
| `prototype-real-data` | Lorem ipsum rows | Real or realistic rows | `MEDIUM` |
| `prototype-hold-the-rest` | 3 rows in Inline Filters, 40 in Sidebar List | Both reading `fixtures/projects.ts` at the same width | `MEDIUM` |
| `prototype-isolate-variants` | `components/button.tsx` edited for the Sheet variant | `prototypes/filters/sheet/button.tsx` copied and edited | `HIGH` |
| `prototype-one-page` | Five routes, one per variant | One route with a switcher | `MEDIUM` |
| `prototype-dev-only` | `/prototypes/filters` served in production | The route gated to development | `HIGH` |
| `prototype-shipped-switcher` | A switcher written from scratch | `switcher.js` loaded, only the variants written | `MEDIUM` |
| `prototype-label-variants` | `Variant 3` | `Inline Filters` | `MEDIUM` |
| `prototype-name-the-cost` | `data-note="Pills above the grid"` | `data-note="Wins with under 6 filters. Costs a row above the grid."` | `LOW` |
| `prototype-bar-clears-the-work` | The bar over a bottom-centre toast stack | `<prototype-switcher data-position="top">` | `MEDIUM` |
| `prototype-replay-motion` | An entrance judged once, then reloaded to see it again | R pressed to replay the variant in place | `MEDIUM` |
| `prototype-prune-after-pick` | Four losing variants left in `src/` | The pick shipped, the rest deleted | `HIGH` |
| `prototype-merge-named-parts` | "Inline Filters with the sidebar's counts" shipped as Inline Filters alone | A merged variant with both, confirmed, then the rest deleted | `HIGH` |
| `prototype-delete-dropped` | Filter Sheet still on the page after the review dropped it | Filter Sheet's file and section deleted, the others kept | `MEDIUM` |
| `prototype-riff-the-pick` | Five fresh ideas after the user picked one | Five turns on the pick, each changing one part | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every variant you could not open as `Not verified`.
