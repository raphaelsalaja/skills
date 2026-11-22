---
name: states
description: Designs every state a screen can enter, from first run and filtered to zero through failures, rollbacks, stale data and the end of a list.
---

# States

This skill holds what a screen shows when it is not full of good data. It covers empty screens, missing values, failures, conflicts, stale data, waits and the end of a list.

## Every state is designed or ruled out

A surface is done when each state it can enter is designed, or ruled out in writing with a reason. A blank region, a raw `undefined` or a screen with no way forward is a finding in any style.

Loading delays, skeletons, busy buttons, undo, omitted fields and live regions belong to `defaults`. Field input and field errors belong to `forms`, including the line an error reserves, a one-click fix and the prompt before leaving. Wording belongs to `copy`, impossible flag combinations to `invariants` and showing every state on one page to `lab`.

## List the states before building

Before building, list the states: populated, first run, cleared, filtered to zero, loading, partial, each kind of error, stale and the end, each designed or `n/a` with a reason. A populated-only component is `states-list-every-state`.

## Empty is three states

First run says what the place will hold and offers to create or import, and cleared stays calm. One screen for those and filtered to zero is `states-three-empties`.

"No Projects Yet" flashing during the fetch because `rows.length === 0` is `states-no-empty-before-load`.

Filtered to zero names the query and offers Clear Filters. "Create Your First Project" after a search matched nothing says the data is gone, which is `states-filtered-names-the-query`.

An empty or failed region keeps its frame, so a table keeps its header with the message below it. A table replaced by a centred illustration is `states-keep-the-frame`.

A Files tab hidden or disabled while a new project has no files, instead of showing its first-run state, is `states-tab-stays`.

## Records have holes

A missing image keeps its box with `aspect-ratio` and shows a fallback built from the record, such as initials on a colour hashed from its id. An avatar that collapses when its image fails is `states-fallback-media`.

Initials split the name into graphemes with `Intl.Segmenter` and take the first and last word, skipping Jr, Sr, II and III, with a fallback icon for an empty name. `name[0]` turns "🦊 Fox" into a broken glyph, and first letters alone turn "Christopher Alexander Montgomery III" into "CI". Both are `states-initials-by-grapheme`. Test `👩🏽‍💻 Priya`, `dana`, `王秀英` and `Sam Lee` padded with spaces: the emoji stays whole, then `D`, `王` and `SL`.

A rendered `undefined`, `null`, `NaN` or `Invalid Date`, or a missing count shown as `0`, is `states-no-raw-values`.

An empty value's treatment depends on where it sits. A blank or whitespace-only title renders "Untitled". A review page row reads "Not Provided", as `forms` sets out, and an optional detail line is left out, as `defaults` sets out. A heading that collapses to nothing is `states-blank-strings`.

User text shows as typed, `&amp;` and `**bold**` included, and a newline never doubles a single-line row. A comment set through `innerHTML` is `states-literal-text`.

## Many values still fit

Tags past the row's width collapse into a count such as `+8`, and fourteen tags wrapping onto three lines is `states-tag-overflow`.

A list reviewed with only `Active` rows, instead of every status in the enum at once, is `states-every-status-at-once`.

A Remove button on your own row, with no "You" beside your name, is `states-current-user`.

## Errors appear where the user is looking

A failed fetch shows inside the region it would have filled, with a Retry button. A toast for a list that failed to load is `states-error-at-the-source`.

An autosave or sync failure shown only in an expiring toast, instead of a marker that stays until it clears, is `states-persistent-background-error`.

A 403, 404 or deleted record shown as a blank page with a status code, and no way back, is `states-no-dead-end`.

Each independent region sits in its own error boundary, or the per-route equivalent, so a crash shows that region's failed state with Retry. One root boundary blanking the app over a broken chart is `states-contain-crashes`.

## Each failure has its own way forward

Reads retry on their own only after a network failure, a 5xx or a 429. They try up to 3 times with jittered backoff from 1s, honouring any `Retry-After`. Any other 4xx never retries, because the same request fails the same way. Writes retry on their own only with an idempotency key, so a payment never runs twice.

After that, each kind of failure gets its own path. Offline waits for the `online` event, a 5xx offers Retry and a 429 counts down its `Retry-After`. A 401 asks to sign in again and keeps the input. One "Something went wrong" for every failure is `states-failure-by-kind`.

A count or badge whose data failed is hidden or marked Unavailable, never `0`. A page shows at most 5 degraded-service messages and groups the rest, as in "3 more services are unavailable". An unread badge reading `0` after its request failed is `states-degrade-quietly`.

## Failure keeps the input

A form that clears on a server error is `states-keep-input`.

Free text longer than a line saves as a draft while it is typed, to `localStorage` or the server. A reload or closed tab brings it back with a quiet Draft Restored marker, and sending clears it. A half-written comment lost to a reload is `states-draft-survives-reload`.

## Retry happens in place

A retry runs inside its button, which keeps its width, while content and scroll stay put, and success needs no toast. A retry that drops back to a skeleton is `states-contained-retry`.

The same failure three times changes the message and offers another path, such as contacting support. An identical error on the fifth try is `states-escalate-repeats`.

## A rollback is visible

A failed optimistic change returns the old value with a failure marker and Retry until the user acts. A toggle that flips back with no sign anything failed is `states-visible-rollback`. The confirmed value renders like the optimistic one, so no server id or timestamp flickers in.

A row that vanishes on delete, then returns when the request fails, is `states-no-optimistic-delete`. Keep it dimmed until the server confirms.

## Conflicts show, never overwrite

A save sends the version it loaded, such as an `If-Match` header, and a 412 says who changed it and when. Offer Reload and Overwrite, never a silent merge. A teammate's edit lost to a later save is `states-show-conflicts`.

## Values that age say when

A cached price, balance or status shown as current, with no time it was last updated, is `states-mark-stale`.

Offline, a network action is disabled or queued, with the queue visible. A Send button that fails silently offline is `states-offline-actions`.

## Denied access names a way in

A permission screen names who can grant access and offers to request it. "You don't have access" with nothing else is `states-who-can-grant`. Choose 403 or 404 for hidden records once, then use it across the app.

## Sessions warn before they end

A session timeout warns first and gives at least 20 seconds to extend it with one action, such as "Session ends in 60s" with Stay Signed In. Signing in again returns to the same place with input kept. A sign-out with no warning is `states-extend-before-timeout`.

## Waiting on the user is not loading

An agent run waiting for approval behind a spinner, instead of showing Approve and Reject, is `states-waiting-on-user`.

## Every wait shows progress and ends

Work with no known end shows time elapsed and Cancel, and a bar driven by an invented percentage is `states-no-fake-progress`.

A spinner covers waits of about 2–10 seconds. Longer work of known size shows done out of total with Cancel, such as "Importing 3 of 50". A spinner through a 50-file import is `states-count-known-work`.

Every loading indicator, including a loading toast, ends in success or failure. A request that reports no progress fails after 30 seconds, while work reporting progress runs as long as progress keeps arriving. A loading toast that spins forever on a hung request is `states-loading-ends`.

## A finished task says what happens next

A completion page shows the reference number, what happens next and when, a record such as Download PDF and the next links, and survives a reload. "Success!" alone is `states-confirmation-next`.

## Lists end

A feed that has loaded everything and stops with no end marker reads as broken, which is `states-list-terminus`.

A next page that fails keeps every loaded item and shows Retry where the next items would start. A feed that falls back to a full-page error when page 4 fails is `states-next-page-retry`.

A list holding exactly one page shows no empty page 2, and "Showing 40 of 40" hides the pagination. An empty page 2 after exactly 40 items is `states-page-boundary`.

New items above the viewport hold the scroll behind a `3 New` button. A feed that jumps as items arrive is `states-no-push-from-above`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `states-list-every-state` | A list component with only a populated branch | Each state designed or marked `n/a` with its reason | `MEDIUM` |
| `states-three-empties` | One "No Projects Yet" screen for every empty case | First run, cleared and filtered to zero each with their own screen | `MEDIUM` |
| `states-no-empty-before-load` | "No Projects Yet" during the fetch because `rows.length === 0` | Loading checked first, the empty screen only after zero rows return | `HIGH` |
| `states-filtered-names-the-query` | "Create Your First Project" after a search matched nothing | "No results for 'quarterly'" with `Clear Filters` | `HIGH` |
| `states-keep-the-frame` | An empty table replaced by an illustration | The header kept, the message in the table below it | `MEDIUM` |
| `states-tab-stays` | A Files tab hidden while a new project has no files | The tab kept, its panel showing the first-run empty state | `MEDIUM` |
| `states-fallback-media` | An avatar that collapses when its image 404s | `aspect-ratio: 1` with initials on a colour hashed from the id | `LOW` |
| `states-initials-by-grapheme` | `name[0]`, a broken glyph for "🦊 Fox" | `Intl.Segmenter` graphemes from the first and last word, suffixes skipped | `MEDIUM` |
| `states-no-raw-values` | `NaN members` | The count left out while its data is missing, `0 members` only for a real zero | `HIGH` |
| `states-blank-strings` | A title of `"  "` collapsing its heading | "Untitled" for the title, "Not Provided" on a review row, an optional line left out | `MEDIUM` |
| `states-literal-text` | `el.innerHTML = comment` | `el.textContent = comment`, so `<script>` shows as typed | `HIGH` |
| `states-tag-overflow` | Fourteen tags wrapping a row onto three lines | Six tags and a `+8` | `MEDIUM` |
| `states-every-status-at-once` | A list reviewed with only `Active` rows | One row for every status, badges side by side | `LOW` |
| `states-current-user` | `Remove` on your own row | "You" beside your name, with `Remove` hidden | `MEDIUM` |
| `states-error-at-the-source` | A toast saying the list failed to load | The message and `Retry` inside the list | `MEDIUM` |
| `states-persistent-background-error` | "Autosave failed" in a toast that expires | A marker beside the title until the save succeeds | `HIGH` |
| `states-no-dead-end` | A blank page reading `404` | "This project was deleted" with `Back to Projects` | `HIGH` |
| `states-contain-crashes` | One `<ErrorBoundary>` around `<App />` | A boundary per region, the chart's card showing `Retry` | `HIGH` |
| `states-failure-by-kind` | "Something went wrong" for an offline device, a 500 and a 429 alike, or a 403 retried | Offline retrying on `online`, `Retry` for the 500, "Try again in 30s" for the 429, no retry for the 403 | `MEDIUM` |
| `states-degrade-quietly` | An unread badge reading `0` after its request failed | The badge hidden or marked Unavailable | `MEDIUM` |
| `states-keep-input` | `reset()` in the submit's `catch` | The values kept and the error shown | `HIGH` |
| `states-draft-survives-reload` | A comment box held only in `useState` | The text in `localStorage` under the thread's id, cleared on send | `HIGH` |
| `states-contained-retry` | Retry dropping the region back to a skeleton | The content kept, the indicator inside `Retry` | `MEDIUM` |
| `states-escalate-repeats` | The same error on the fifth try | A new message and another path on the third | `MEDIUM` |
| `states-visible-rollback` | A toggle flipping back with no message | The old value with a failure marker and `Retry` | `HIGH` |
| `states-no-optimistic-delete` | A row removed, then restored when the request fails | The row dimmed until the server confirms | `MEDIUM` |
| `states-show-conflicts` | `PUT /doc/42` overwriting a teammate's edit | `If-Match: "v7"`, and on 412 "Sam Lee edited this 1 minute ago" with `Reload` and `Overwrite` | `HIGH` |
| `states-mark-stale` | A cached balance shown as current while offline | "Updated 30 minutes ago" beside the balance | `MEDIUM` |
| `states-offline-actions` | `Send` failing silently offline | `Send` queueing the message, marked "Not sent yet" | `HIGH` |
| `states-who-can-grant` | "You don't have access" | "Ask Sam Lee, an owner, for access" with `Request Access` | `MEDIUM` |
| `states-extend-before-timeout` | A sign-out with no warning that drops the draft | "Session ends in 60s" with `Stay Signed In` | `HIGH` |
| `states-waiting-on-user` | A spinner while an agent waits for approval | The step shown with `Approve` and `Reject` | `HIGH` |
| `states-no-fake-progress` | A bar crawling to 90% on a timer | "Working for 12s" with `Cancel` | `MEDIUM` |
| `states-count-known-work` | A spinner through a 50-file import | "Importing 3 of 50" with `Cancel` | `MEDIUM` |
| `states-loading-ends` | A loading toast that spins forever when the request hangs | The toast ending in success or failure, failing after 30s with no progress | `HIGH` |
| `states-confirmation-next` | "Success!" alone, gone on reload | Order 4821, "We'll email you within 5 days" and `Download PDF`, at a URL that reloads | `MEDIUM` |
| `states-list-terminus` | A feed that stops with nothing at its end | An end marker after the last item | `LOW` |
| `states-next-page-retry` | Page 4 failing and the feed replaced by an error screen | Pages 1–3 kept, `Retry` after the last loaded item | `MEDIUM` |
| `states-page-boundary` | An empty page 2 after exactly 40 items | "Showing 40 of 40" with no pagination | `MEDIUM` |
| `states-no-push-from-above` | A feed that jumps as new posts arrive | Scroll held, with a `3 New` button | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a surface whose states you did not force open. Mark every state you could not reach as `Not verified`.
