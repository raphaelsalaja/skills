---
name: palette
description: Builds a ⌘K or Ctrl+K command palette for quick search and jump-to, indexed from the app's routes, actions and settings, and re-runs after new pages.
---

# Palette

This skill builds a command palette from the app's own routes, actions and settings. It writes a typed index, mounts the palette and re-runs so a new page does not go missing.

## Indexed from the app, then kept in step

The command shape is exact. Each entry has `id`, `title`, `keywords`, `group`, `icon`, `shortcut` and `handler`. Run it for a command palette, ⌘K or Ctrl+K, quick search or jump-to. Also run it when new pages should update the palette.

`keyboard` walks what the page can already reach. The palette adds a path and does not stand in for a control the walk cannot operate. Labels follow `copy`. The shortcut guard and the focus trap belong to `defaults`, and a failure there cites that id. Which control to build with belongs to `reuse`. Glyphs come from the project's set, and a missing one belongs to `icons`. Duration, easing and reduced motion belong to `motion`.

## 1. Crawl routes, actions and settings

Read `app` for `page.tsx` and `route.tsx`, or the file that builds the React Router routes. Then read exported actions, files marked `"use server"` and the settings keys. A command list typed from memory is `palette-index-the-app`.

Treat a settings object, schema or constants file as the settings source.

## 2. Write commands.ts

Write `commands.ts` beside the palette. A command missing `id`, `title`, `keywords`, `group`, `icon`, `shortcut` or `handler` is `palette-typed-command`.

Add the path and plain synonyms to `keywords`. A route's handler navigates, an action's handler calls the export and a setting's handler applies the value or opens its page.

`title` follows `copy`, including `copy-title-case` and `copy-no-em-dash`. A nested command is the one label that ends in `…`, as in `Change Theme…`. That trailing `…` marks a page and is not the status ellipsis `copy` forbids.

`icon` names a glyph from the project's set. Anything else cites `reuse-icon-set-native-size` or goes to `icons`.

## 3. Build with what is already there

Use the project's palette component when it has one, which is `reuse-house-component-first`. Otherwise search `package.json` for `cmdk` and for `base-ui`. When either is installed, build with it and read its docs first, which is `reuse-read-the-docs`.

When neither is installed, use a native `dialog` opened with `showModal()` and a `listbox`. The native path puts a `combobox` and a `listbox` inside the `dialog`. Installing a palette package for this skill is `palette-use-what-is-installed`.

## 4. Open from anywhere, except a field

Listen for ⌘K and for Ctrl+K on every screen. A palette that opens only from a button on one page is `palette-open-from-anywhere`.

The shortcut does not open the palette while an input, a textarea or an editable element outside it has focus. Firing anyway cites `defaults-keys-ignore-inputs`. Inside the open palette the same shortcut closes it.

Focus moves inside on open, stays inside and returns to the trigger on close. A miss cites `defaults-trap-and-return-focus`.

## 5. Search, group, remember and nest

Fuzzy match against `title` and `keywords`, not a prefix of the title alone. A prefix-only filter is `palette-fuzzy-search`.

Group by the kind the app already uses, such as Navigation, Actions and Settings. A single ungrouped list is `palette-group-the-results`.

After a command runs, an empty query lists up to 5 recent commands first, from `localStorage`. An empty query that drops them is `palette-show-recents`.

Show each `shortcut` as a hint beside its command. A shortcut that exists only in the listener is `palette-show-shortcuts`.

A command that opens another list pushes a page, and Escape pops it. `Change Theme…` leading to Light, Dark and System is the pattern. Navigating the app instead of pushing a page is `palette-nested-pages`.

Escape on the root page closes the dialog, which is `keyboard-escape-closes`. Arrow keys move inside the listbox, which is `keyboard-arrows-inside-composites`. Enter runs the highlighted command.

The field placeholder is `Search`. No matches renders `No Results`. A blank dialog is `palette-empty-state`.

## 6. Open from 0.98 and reorder with layout

The palette opens from `scale(0.98)` with opacity from 0 to 1. The origin stays the centre, which is `motion-origin-from-trigger`. A pop from `scale(1)` with no fade, or from below 0.98, is `palette-open-scale`.

When the result list changes, items move with a layout animation. A list that swaps with no movement is `palette-reorder-layout`.

Curve, duration, the shorter close and named properties belong to `motion`, citing `motion-strong-ease-out`, `motion-under-300ms`, `motion-close-faster` and `motion-name-the-properties`. Under reduced motion the scale and the layout move drop, which is `motion-reduced-motion`. Keystrokes do not pulse the field, which is `motion-no-motion-on-repeat`.

## 7. Re-run and report the gap

When asked to update the palette, or after routes or actions change, compare them with `commands.ts`. List every route, action and setting key that has no command. A re-run that only edits the index and stays silent is `palette-report-uncovered`.

Return the palette, the index, the coverage report and a recording of the shortcut, a search and a nested page. A written claim with none of those is `palette-show-the-work`. Opening the running palette belongs to `verify`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `palette-index-the-app` | A command list written from memory | Routes, actions and settings read from the app |
| `palette-typed-command` | `{ title: "invoices" }` | `id`, `title`, `keywords`, `group`, `icon`, `shortcut` and `handler` |
| `palette-use-what-is-installed` | `npm install cmdk` in a project that has neither | A native `dialog` and `listbox` |
| `palette-open-from-anywhere` | A Search button on the home page only | ⌘K and Ctrl+K on every screen |
| `palette-fuzzy-search` | `title.startsWith(query)` | A fuzzy match on `title` and `keywords` |
| `palette-group-the-results` | One flat list | Rows under Navigation, Actions and Settings |
| `palette-show-recents` | An empty query with no Recent group after a command ran | The last 5 commands first |
| `palette-show-shortcuts` | `shortcut: "G I"` stored and not shown | `G I` as a hint on the row |
| `palette-nested-pages` | `Change Theme…` navigating to `/settings` | A page of Light, Dark and System, Escape pops it |
| `palette-empty-state` | A blank dialog when nothing matches | `No Results` |
| `palette-open-scale` | `scale(1)` with no fade | `scale(0.98)` fading to `1` |
| `palette-reorder-layout` | Results swapped with no movement | Items moving with a layout animation |
| `palette-report-uncovered` | The index edited and the new route left unmentioned | `/vendors` listed as uncovered |
| `palette-show-the-work` | "The palette is done" | The palette, the index, the coverage report and a recording |

## Reporting

**Severity.** `HIGH` is an index written from memory, a palette that cannot open from every screen or a re-run that hides an uncovered route, action or setting. `MEDIUM` is a command missing a field, a palette package added for this skill, prefix-only search or a flat list. It is also missing recents, shortcut hints, an empty state or a nested page that leaves the app. It is also an open that skips `scale(0.98)` or a result list that swaps with no layout move. `LOW` is a finished palette with no recording or no coverage report.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark every check you could not run as `Not verified`.
