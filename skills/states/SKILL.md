---
name: states
description: Designs every state a screen can enter, from first run and filtered to zero through failures, rollbacks, stale data and the end of a list.
---

# States

This skill holds what a screen shows when it is not full of good data. It covers empty screens, missing values, errors, retries, rollbacks, edit conflicts, stale data, denied access, finished tasks and the end of a list.

## Every state is designed or ruled out

A surface is done when each state it can enter is designed, or ruled out in writing with a reason. A blank region, a raw `undefined` or a screen with no way forward is a finding in any style.

Loading delays, skeletons, busy buttons, undo, omitted fields and live regions belong to `defaults`. How fields accept and check input belongs to `forms`, and so does the prompt before leaving a changed form. The words in each state belong to `copy`. Flags that allow impossible combinations belong to `invariants`. Showing every state on one page belongs to `lab`.

## List the states before building

Before building a surface that shows data, list its states: populated, first run, cleared, filtered to zero, loading, partial data, each kind of error, stale and the end. Mark each one designed, or `n/a` with the reason. A component whose only branch is the populated one is `states-list-every-state`.

Build the hardest state first: the failure, the 500-row list and the longest name.

## Empty is three states

First run, cleared and filtered to zero all render no rows, and each needs its own screen. First run says what the place will hold and offers to create or import. Cleared stays calm, with a quiet way to create again. One screen for all three is `states-three-empties`.

An empty screen renders only after the fetch returns zero rows, so the loading check comes first. "No Projects Yet" flashing during the fetch because `rows.length === 0` is `states-no-empty-before-load`.

Filtered to zero names the query and offers Clear Filters as its one action. "Create Your First Project" after a search matched nothing tells the user their data is gone. That is `states-filtered-names-the-query`.

An empty or failed region keeps its frame. A table keeps its header, with the message inside it below the header. A table replaced by a centred illustration is `states-keep-the-frame`.

A tab never disappears or disables because its content is empty. Its panel shows the first-run empty state instead. A Files tab hidden while a new project has no files is `states-tab-stays`.

## Records have holes

A missing image keeps its box with `aspect-ratio` and shows a fallback built from the record, such as initials on a colour hashed from its id. An avatar that collapses when its image fails is `states-fallback-media`.

Initials split the name into graphemes with `Intl.Segmenter` and take the first and last word, skipping Jr, Sr, II and III. They are uppercased, with a fallback icon for an empty name. `name[0]` turns "🦊 Fox" into a broken glyph, and first letters alone turn "Christopher Alexander Montgomery III" into "CI". Both are `states-initials-by-grapheme`. Test `👩🏽‍💻 Priya`, `dana`, `王秀英` and `Sam Lee` padded with spaces: the emoji stays whole, then `D`, `王` and `SL`.

Never render `undefined`, `null`, `NaN` or `Invalid Date`. Only a real zero shows as `0`, so a count that is `NaN` because its data is missing never becomes `0`. `NaN members` is `states-no-raw-values`.

An empty or whitespace-only title renders a placeholder such as "Untitled". A heading that collapses to nothing, or a row with no height, is `states-blank-strings`.

## User text renders as typed

User text is escaped once and never inserted as raw HTML. `<script>alert(1)</script>`, `&amp;` and `**bold**` each show exactly as typed. A comment set through `innerHTML` is `states-literal-text`. A newline in a single-line value, such as a title, never doubles its row's height.

## Many values still fit

Tags past the row's width collapse into one count, such as `+8`. One tag wider than its container truncates. Fourteen tags wrapping a row onto three lines is `states-tag-overflow`.

Check a list with every status in its enum present at once, so badge widths and colours are seen together. A list reviewed with only `Active` rows is `states-every-status-at-once`.

## Your own row says You

The current user's row says "You" and hides actions that cannot apply to yourself, such as Remove. A Remove button on your own row in a members list is `states-current-user`.

## Errors appear where the user is looking

A failed fetch shows inside the region it would have filled, with a Retry button. A toast for a list that failed to load is `states-error-at-the-source`.

A failure in the background, such as an autosave or a sync, leaves a marker that stays until it clears. An autosave failure shown only in a toast that expires is `states-persistent-background-error`.

A 403, a 404 or a deleted record says what happened and offers a way out, such as back to the list. A blank page with only a status code is `states-no-dead-end`.

## A crash stays in its region

A rendering error in one region shows that region's failed state with Retry, and the rest of the page keeps working. Wrap each independent region in its own error boundary, or the framework's per-route equivalent. One boundary at the root that blanks the app over a broken chart is `states-contain-crashes`.

## Each failure has its own way forward

Reads retry on their own up to 3 times, at 1, 2 and 4 seconds, before any error shows. Writes retry on their own only with an idempotency key, so a payment never runs twice. After that, each kind of failure gets its own path. Offline waits and retries on the `online` event. A 5xx offers Retry. A 429 counts down its `Retry-After` seconds, then offers Retry. A 401 asks to sign in again and keeps the input. One "Something went wrong" for every failure is `states-failure-by-kind`.

## A failed part degrades quietly

A count or badge whose data failed to load is hidden or marked Unavailable, never shown as `0`. One page shows at most 5 degraded-service messages and groups the rest into one, such as "3 more services are unavailable". An unread badge reading `0` because its request failed is `states-degrade-quietly`.

## Failure keeps the input and the layout

A failed submit keeps everything the user typed. A form that clears on a server error is `states-keep-input`.

Free text longer than a line, such as a comment or a post, saves as a draft while it is typed, to `localStorage` or the server. A reload, a crash or a closed tab brings it back with a quiet Draft Restored marker. The draft clears once it is sent. A half-written comment gone after an accidental reload is `states-draft-survives-reload`.

An error appears without moving what sits around it. Reserve the line its message takes, so the submit button stays under the pointer. A button pushed down by an error message is `states-error-holds-layout`.

## A known fix is one click

When the likely correction is known, offer it as one button. The city matching a ZIP code, or "Did you mean gmail.com?" under `gmial.com`, saves retyping. An error that names the typo but leaves the fix to the keyboard is `states-offer-the-fix`.

## Retry happens in place

A retry runs inside its button, which keeps its width, while the content stays on screen and the scroll holds. A retry that drops the region back to a skeleton is `states-contained-retry`. A retry that works needs no success toast, because the content is the confirmation.

The same failure three times changes the message and offers another path, such as contacting support or working offline. An identical error on the fifth try is `states-escalate-repeats`.

## A rollback is visible

When an optimistic change fails, the value returns and keeps a failure marker with Retry until the user acts. A toggle that flips back with no sign anything failed is `states-visible-rollback`.

The confirmed value renders the same as the optimistic one, so a server id or timestamp does not flicker in.

A delete waits for the server, or keeps the row dimmed through its undo window. A row that vanishes, then returns when the request fails, is `states-no-optimistic-delete`.

## Conflicts show, never overwrite

A save on a record someone changed since it loaded never overwrites in silence. Send the version with the save, such as an `If-Match` header, and answer a 412 with who changed it and when. Offer Reload and Overwrite, never a silent merge. A teammate's edit lost to a later save is `states-show-conflicts`.

## Values that age say when

A value someone could act on wrongly once it is old, such as a price, a balance or a live status, shows when it was last updated. A cached balance shown as current while offline is `states-mark-stale`.

Offline, an action that needs the network is disabled or queued, and the queue shows what has not synced. A Send button that fails silently offline is `states-offline-actions`.

## Denied access names a way in

A permission screen names who can grant access and offers to request it. "You don't have access" with nothing else is `states-who-can-grant`. Choose 403 or 404 for hidden records once, then use it across the app.

## Sessions warn before they end

A session timeout warns first and gives at least 20 seconds to extend it with one action. "Session ends in 60s" with Stay Signed In does that. After signing in again, the user lands in the same place with their input kept. A sign-out with no warning is `states-extend-before-timeout`.

## Waiting on the user is not loading

A step blocked on the user's approval shows the approve and reject controls, never a spinner. An agent run waiting for confirmation behind a spinner is `states-waiting-on-user`.

## Every wait shows progress and ends

Work with no known end shows the time elapsed and a way to cancel. A progress bar driven by an invented percentage is `states-no-fake-progress`.

A spinner covers waits of about 2–10 seconds. Work over 10 seconds whose size is known shows done out of total with Cancel, such as "Importing 3 of 50". A spinner through a 50-file import is `states-count-known-work`.

Every loading indicator, including a loading toast, ends in success or failure. A request that never settles fails after 30 seconds. A loading toast that spins forever when the request hangs is `states-loading-ends`.

## A finished task says what happens next

A completion page shows the reference number, what happens next and when, such as "We'll email you within 5 days". It offers a way to keep a record, such as Download PDF, and the likely next links. It survives a reload or a bookmark. "Success!" alone is `states-confirmation-next`.

## Lists end

A list that has loaded everything says so at its end. A feed that stops loading with no end marker reads as broken, which is `states-list-terminus`.

A next page that fails keeps every loaded item and shows Retry where the next items would start. A feed that falls back to a full-page error when page 4 fails is `states-next-page-retry`.

A list holding exactly one page of items shows no empty page 2. "Showing 40 of 40" hides the pagination, and a list of one item still looks intentional. An empty page 2 after exactly 40 items is `states-page-boundary`.

New items arriving above the viewport do not push the content down. Hold the scroll and offer a `3 New` button. A feed that jumps as items arrive is `states-no-push-from-above`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `states-list-every-state` | A list component with only a populated branch | Each state designed or marked `n/a` with its reason |
| `states-three-empties` | One "No Projects Yet" screen for every empty case | First run, cleared and filtered to zero each with their own screen |
| `states-no-empty-before-load` | "No Projects Yet" during the fetch because `rows.length === 0` | Loading checked first, the empty screen only after zero rows return |
| `states-filtered-names-the-query` | "Create Your First Project" after a search matched nothing | "No results for 'quarterly'" with `Clear Filters` |
| `states-keep-the-frame` | An empty table replaced by an illustration | The header kept, the message in the table below it |
| `states-tab-stays` | A Files tab hidden while a new project has no files | The tab kept, its panel showing the first-run empty state |
| `states-fallback-media` | An avatar that collapses when its image 404s | `aspect-ratio: 1` with initials on a colour hashed from the id |
| `states-initials-by-grapheme` | `name[0]`, a broken glyph for "🦊 Fox" | `Intl.Segmenter` graphemes from the first and last word, suffixes skipped |
| `states-no-raw-values` | `NaN members` | The count left out while its data is missing, `0 members` only for a real zero |
| `states-blank-strings` | A title of `"  "` collapsing its heading | "Untitled" in place of the blank title |
| `states-literal-text` | `el.innerHTML = comment` | `el.textContent = comment`, so `<script>` shows as typed |
| `states-tag-overflow` | Fourteen tags wrapping a row onto three lines | Six tags and a `+8` |
| `states-every-status-at-once` | A list reviewed with only `Active` rows | One row for every status, badges side by side |
| `states-current-user` | `Remove` on your own row | "You" beside your name, with `Remove` hidden |
| `states-error-at-the-source` | A toast saying the list failed to load | The message and `Retry` inside the list |
| `states-persistent-background-error` | "Autosave failed" in a toast that expires | A marker beside the title until the save succeeds |
| `states-no-dead-end` | A blank page reading `404` | "This project was deleted" with `Back to Projects` |
| `states-contain-crashes` | One `<ErrorBoundary>` around `<App />`, the whole page blank when a chart throws | A boundary per region, the chart's card showing its failure and `Retry` |
| `states-failure-by-kind` | "Something went wrong" for an offline device, a 500 and a 429 alike | Offline retrying on `online`, `Retry` for the 500 and "Try again in 30s" for the 429 |
| `states-degrade-quietly` | An unread badge reading `0` after its request failed | The badge hidden or marked Unavailable, and past 5 failures one grouped message |
| `states-keep-input` | `reset()` in the submit's `catch` | The values kept and the error shown |
| `states-draft-survives-reload` | A comment box held only in `useState` | The text saved to `localStorage` under the thread's id, restored on load and cleared on send |
| `states-error-holds-layout` | The submit button pushed down by an error line | The error's line reserved below the field |
| `states-offer-the-fix` | "Check the email domain" under `gmial.com` | "Did you mean gmail.com?" with the domain as a button |
| `states-contained-retry` | Retry dropping the region back to a skeleton | The content kept, the indicator inside `Retry` |
| `states-escalate-repeats` | The same error on the fifth try | A new message and another path on the third |
| `states-visible-rollback` | A toggle flipping back with no message | The old value with a failure marker and `Retry` |
| `states-no-optimistic-delete` | A row removed, then restored when the request fails | The row dimmed until the server confirms |
| `states-show-conflicts` | `PUT /doc/42` overwriting a teammate's edit made a minute earlier | `If-Match: "v7"`, and on 412 "Sam Lee edited this 1 minute ago" with `Reload` and `Overwrite` |
| `states-mark-stale` | A cached balance shown as current while offline | "Updated 30 minutes ago" beside the balance |
| `states-offline-actions` | `Send` failing silently offline | `Send` queueing the message, marked "Not sent yet" |
| `states-who-can-grant` | "You don't have access" | "Ask Sam Lee, an owner, for access" with `Request Access` |
| `states-extend-before-timeout` | A sign-out with no warning that drops the draft | "Session ends in 60s" with `Stay Signed In` |
| `states-waiting-on-user` | A spinner while an agent waits for approval | The step shown with `Approve` and `Reject` |
| `states-no-fake-progress` | A bar crawling to 90% on a timer | "Working for 12s" with `Cancel` |
| `states-count-known-work` | A spinner through a 50-file import | "Importing 3 of 50" with `Cancel` |
| `states-loading-ends` | A loading toast that spins forever when the request hangs | The toast ending in success or failure, failing after 30s |
| `states-confirmation-next` | "Success!" alone, gone on reload | Order 4821, "We'll email you within 5 days", `Download PDF` and `View Orders`, at a URL that reloads |
| `states-list-terminus` | A feed that stops with nothing at its end | An end marker after the last item |
| `states-next-page-retry` | Page 4 failing and the feed replaced by an error screen | Pages 1–3 kept, `Retry` after the last loaded item |
| `states-page-boundary` | An empty page 2 after exactly 40 items | "Showing 40 of 40" with no pagination |
| `states-no-push-from-above` | A feed that jumps as new posts arrive | Scroll held, with a `3 New` button |

## Reporting

**Severity.** `HIGH` loses data or the user's way forward. That is a filtered-to-zero screen offering creation, input cleared on failure, a dead end or a silent rollback. It is also a raw `undefined` or `NaN`, a background failure shown only in a toast, an offline action that fails silently or an approval hidden behind a spinner. It is also an empty screen during loading, user text rendered as HTML, a session that ends without warning or a loading indicator that never ends. It is also a crash in one region that blanks the page, a teammate's edit overwritten in silence or a typed draft lost to a reload.

`MEDIUM` is a component with only its populated state, one screen for three empty states or a region that drops its frame. It is also an error away from its source, an error that moves the layout or a retry that collapses the region. It is also an error that never escalates, an optimistic delete, an unmarked stale value, a permission screen with no path, invented progress or a feed pushed from above. It is also a hidden tab, broken initials, a collapsed blank title, overflowing tags, actions offered on your own row, an uncounted long task or an empty last page. It is also a failed count shown as `0`, more than 5 degraded-service messages or a completion page with no reference, next step or reload. It is also one message for every kind of failure, or a failed next page that drops the loaded list.

`LOW` is an image with no fallback, a list with no end, statuses never seen together or a known fix left to retyping.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a surface whose states you did not force open. Mark every state you could not reach as `Not verified`.
