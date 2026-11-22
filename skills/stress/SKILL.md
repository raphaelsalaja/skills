---
name: stress
description: Swaps the worst real data into a screen through its own data boundary, then reports every value that breaks it.
disable-model-invocation: true
---

# Stress

This skill runs a screen or component against the worst data it can receive. It maps every value the screen renders, swaps in a worst-case fixture through the same boundary as the demo data and records what breaks.

## Real limits, every case rendered

Each limit comes from the validation schema, the database column or the API contract. Where none of the three sets one, the map says "no limit found" and the longest case applies. The cases in the catalog are exact strings, so paste each one as written. Run it on any screen that shows data a person or another system writes.

Longer translated and pseudo-localised interface text, other scripts, mirrored layouts and the width set belong to `viewports`. Which states a screen shows, such as empty or failed, belong to `states`. Combinations the data should never hold belong to `invariants`. Opening the running result belongs to `verify`. A break another skill owns cites that skill's id, such as `viewports-no-clipped-text`.

## 1. Map every value

List every value the screen renders. Beside each one, write its source and its limit, read from the validation schema, the database column or the API contract.

```
Value          Source                      Limit
title          projects.title              varchar(255), no minimum
owner name     users.name                  no limit found
owner avatar   users.avatar_url            no limit found
progress       tasks API, done / total     0 to 100, not enforced
due date       projects.due_at             timestamptz, nullable
```

A fixture built before the map tests only the values someone remembered, and is `stress-map-every-value`. Note where two limits disagree, such as an input capped at 50 characters that saves to a 255-character column. That mismatch is reported under `invariants`.

When the user gives read access to real data, add the longest stored value of each text field beside its limit. Query lengths only, such as `SELECT max(length(title)) FROM projects`, and never copy a real value into the fixture. Never write to that database. A schema limit with the real longest value left unchecked is `stress-longest-real-value`.

## 2. Change the data, never the markup

Build the worst-case fixture beside the demo data. Load it through the same boundary the demo data uses: the fixture file, the mock handler or the component's props. Text typed into the rendered markup or the DOM skips the code that formats, escapes and truncates it, and is `stress-change-the-data`.

Write each fixture value literally, or generate it from a fixed seed. Pin "now" to one instant, such as `2025-06-15T12:00:00Z`, and set every date relative to it. Hand the screen's clock the same instant, through `page.clock.setFixedTime()` in the test browser, a `now` prop or the formatter's reference date. Otherwise the "Now" case reads "1 year ago". `Math.random()`, an unseeded generator or `new Date()` gives new rows on each reload, so a break cannot be shown twice. That is `stress-fixed-fixture`.

Serve the data sets from the test browser first, so the app gains no code. Intercept the screen's requests with Playwright's `page.route` or a Mock Service Worker handler and answer with the fixture. A permanent in-app switch on a screen that fetches its data is `stress-intercept-first`.

The sets are Demo, Worst Case, Empty, One and 1,000 Rows. Build 1,000 Rows by cycling the catalog's cases, so no two neighbours match.

The worst responses come too. Slow delays every response 3 seconds and then serves the demo data, and Failed answers every request with a 500. What the screen shows then belongs to `states`. Handlers that only serve good data are `stress-slow-and-failed`.

Add an in-app switch only when no request boundary exists, such as data imported at build time. It reads and writes `?data=` as `demo`, `worst`, `empty`, `one`, `1000`, `slow` and `error`, so a reload keeps the case. Build it with the project's own components.

Render the switch in development only and gate the fixture loader the same way. A switch or fixture reachable in production is `stress-dev-only-switch`.

## 3. Run the catalog

Fill each mapped value with every case in [catalog.md](catalog.md) that fits its type. Add two cases per limit in the map: a value exactly at the limit and one a character past it. A case skipped because "nobody has a name that long" is `stress-run-the-catalog`.

## 4. Render at the real width

Render each case inside the component's real container at the width it ships at, such as a 280px sidebar or a three-column grid at 1440. A card checked alone on an empty full-width page is `stress-real-container`.

Record each break with the case, the value and what happened. A break is text past its box, an ellipsis with no way to read the rest or wrong initials. It is also markup that runs, `NaN`, `Invalid Date`, a raw float, a crash or a value lost on save.

For every case a form can edit, open the form, save without changing anything and reopen it. A value the round trip changed is a break. Screenshot every case that breaks.

## 5. Keep the fixture

Keep the worst-case fixture and its route handlers or switch after the run, beside the demo data. When the project has component, snapshot or visual tests, add one that renders the fixture with the runner it already uses. A fixture deleted once the screen looks fine is `stress-keep-the-fixture`. When the project has no tests, the fixture and its handlers are the regression check.

## 6. Report by case

Return one screenshot per broken case, then the findings in the same order. A finding with no case named, such as "long names overflow", is `stress-name-the-case`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `stress-map-every-value` | A fixture of the three values someone remembered | Every rendered value listed with its source and limit | `MEDIUM` |
| `stress-longest-real-value` | "Titles are `varchar(255)`" with the stored data never measured | "Titles are `varchar(255)`, the longest stored is 212", with both lengths in the fixture | `LOW` |
| `stress-change-the-data` | A long name typed into the DOM | The name in `fixtures/worst.ts`, loaded through the props | `MEDIUM` |
| `stress-fixed-fixture` | Names from an unseeded generator, `dueAt: new Date()` | The generator seeded with `7`, `now = "2025-06-15T12:00:00Z"` and `dueAt` 3 days after `now` | `MEDIUM` |
| `stress-intercept-first` | A `?data=` switch added to a screen that loads through `fetch` | `page.route("**/api/projects", ...)` answering with `fixtures/worst.ts` | `MEDIUM` |
| `stress-slow-and-failed` | Handlers for Demo and Worst Case only | A Slow set holding every response 3s and a Failed set answering 500 | `MEDIUM` |
| `stress-dev-only-switch` | `?data=worst` working on the production site | The switch and the fixture loader gated to development | `HIGH` |
| `stress-run-the-catalog` | "Nobody has a name that long" | `Christopher Alexander Montgomery III` rendered in the row | `MEDIUM` |
| `stress-real-container` | A card checked alone at 1440 | The card inside the 280px sidebar it ships in | `MEDIUM` |
| `stress-keep-the-fixture` | The fixture deleted after the run | `fixtures/worst.ts` kept and rendered by the existing visual test | `LOW` |
| `stress-name-the-case` | "Long names overflow" | "At 280px, the 64-character email pushes the role off the card" | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. A break another skill owns, such as clipped text, takes that skill's row level. Markup that runs, a crash or a lost save is `HIGH`.

**Format.** One finding per root cause, naming the case and the width:

```
1. file:line - [rule-id] case, at 280px, what is wrong (measured values)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every case the data boundary could not carry as `Not verified`, such as a slow image with no way to delay the response.
