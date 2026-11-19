---
name: states
description: Designs every state a screen can enter, from first run and filtered to zero through failures, rollbacks, stale data and the end of a list.
---

# States

This skill holds what a screen shows when it is not full of good data. It covers empty screens, missing values, errors, retries, rollbacks, stale data, denied access and the end of a list.

## Every state is designed or ruled out

A surface is done when each state it can enter is designed, or ruled out in writing with a reason. A blank region, a raw `undefined` or a screen with no way forward is a finding in any style.

Loading delays, skeletons, busy buttons, undo, omitted fields and live regions belong to `defaults`. The words in each state belong to `copy`. Flags that allow impossible combinations belong to `invariants`. Showing every state on one page belongs to `lab`.

## List the states before building

Before building a surface that shows data, list its states: populated, first run, cleared, filtered to zero, loading, partial data, each kind of error, stale and the end. Mark each one designed, or `n/a` with the reason. A component whose only branch is the populated one is `states-list-every-state`.

Build the hardest state first: the failure, the 500-row list and the longest name.

## Empty is three states

First run, cleared and filtered to zero all render no rows, and each needs its own screen. First run says what the place will hold and offers to create or import. Cleared stays calm, with a quiet way to create again. One screen for all three is `states-three-empties`.

Filtered to zero names the query and offers Clear Filters as its one action. "Create Your First Project" after a search matched nothing tells the user their data is gone. That is `states-filtered-names-the-query`.

An empty or failed region keeps its frame. A table keeps its header, with the message inside it below the header. A table replaced by a centred illustration is `states-keep-the-frame`.

## Records have holes

A missing image keeps its box with `aspect-ratio` and shows a fallback built from the record, such as initials on a colour hashed from its id. An avatar that collapses when its image fails is `states-fallback-media`.

Never render `undefined`, `null`, `NaN` or `Invalid Date`. Zero is a value and shows as `0`. `NaN members` is `states-no-raw-values`.

## Errors appear where the user is looking

A failed fetch shows inside the region it would have filled, with a Retry button. A toast for a list that failed to load is `states-error-at-the-source`.

A failure in the background, such as an autosave or a sync, leaves a marker that stays until it clears. An autosave failure shown only in a toast that expires is `states-persistent-background-error`.

A 403, a 404 or a deleted record says what happened and offers a way out, such as back to the list. A blank page with only a status code is `states-no-dead-end`.

## Failure keeps the input and the layout

A failed submit keeps everything the user typed. A form that clears on a server error is `states-keep-input`.

An error appears without moving what sits around it. Reserve the line its message takes, so the submit button stays under the pointer. A button pushed down by an error message is `states-error-holds-layout`.

## Retry happens in place

A retry runs inside its button, which keeps its width, while the content stays on screen and the scroll holds. A retry that drops the region back to a skeleton is `states-contained-retry`. A retry that works needs no success toast, because the content is the confirmation.

The same failure three times changes the message and offers another path, such as contacting support or working offline. An identical error on the fifth try is `states-escalate-repeats`.

## A rollback is visible

When an optimistic change fails, the value returns and keeps a failure marker with Retry until the user acts. A toggle that flips back with no sign anything failed is `states-visible-rollback`.

The confirmed value renders the same as the optimistic one, so a server id or timestamp does not flicker in.

A delete waits for the server, or keeps the row dimmed through its undo window. A row that vanishes, then returns when the request fails, is `states-no-optimistic-delete`.

## Values that age say when

A value someone could act on wrongly once it is old, such as a price, a balance or a live status, shows when it was last updated. A cached balance shown as current while offline is `states-mark-stale`.

Offline, an action that needs the network is disabled or queued, and the queue shows what has not synced. A Send button that fails silently offline is `states-offline-actions`.

## Denied access names a way in

A permission screen names who can grant access and offers to request it. "You don't have access" with nothing else is `states-who-can-grant`. Choose 403 or 404 for hidden records once, then use it across the app.

## Waiting on the user is not loading

A step blocked on the user's approval shows the approve and reject controls, never a spinner. An agent run waiting for confirmation behind a spinner is `states-waiting-on-user`.

Work with no known end shows the time elapsed and a way to cancel. A progress bar driven by an invented percentage is `states-no-fake-progress`.

## Lists end

A list that has loaded everything says so at its end. A feed that stops loading with no end marker reads as broken, which is `states-list-terminus`.

New items arriving above the viewport do not push the content down. Hold the scroll and offer a `3 New` button. A feed that jumps as items arrive is `states-no-push-from-above`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `states-list-every-state` | A list component with only a populated branch | Each state designed or marked `n/a` with its reason |
| `states-three-empties` | One "No Projects Yet" screen for every empty case | First run, cleared and filtered to zero each with their own screen |
| `states-filtered-names-the-query` | "Create Your First Project" after a search matched nothing | "No results for 'quarterly'" with `Clear Filters` |
| `states-keep-the-frame` | An empty table replaced by an illustration | The header kept, the message in the table below it |
| `states-fallback-media` | An avatar that collapses when its image 404s | `aspect-ratio: 1` with initials on a colour hashed from the id |
| `states-no-raw-values` | `NaN members` | `0 members` |
| `states-error-at-the-source` | A toast saying the list failed to load | The message and `Retry` inside the list |
| `states-persistent-background-error` | "Autosave failed" in a toast that expires | A marker beside the title until the save succeeds |
| `states-no-dead-end` | A blank page reading `404` | "This project was deleted" with `Back to Projects` |
| `states-keep-input` | `reset()` in the submit's `catch` | The values kept and the error shown |
| `states-error-holds-layout` | The submit button pushed down by an error line | The error's line reserved below the field |
| `states-contained-retry` | Retry dropping the region back to a skeleton | The content kept, the indicator inside `Retry` |
| `states-escalate-repeats` | The same error on the fifth try | A new message and another path on the third |
| `states-visible-rollback` | A toggle flipping back with no message | The old value with a failure marker and `Retry` |
| `states-no-optimistic-delete` | A row removed, then restored when the request fails | The row dimmed until the server confirms |
| `states-mark-stale` | A cached balance shown as current while offline | "Updated 30 minutes ago" beside the balance |
| `states-offline-actions` | `Send` failing silently offline | `Send` queueing the message, marked "Not sent yet" |
| `states-who-can-grant` | "You don't have access" | "Ask Sam Lee, an owner, for access" with `Request Access` |
| `states-waiting-on-user` | A spinner while an agent waits for approval | The step shown with `Approve` and `Reject` |
| `states-no-fake-progress` | A bar crawling to 90% on a timer | "Working for 12s" with `Cancel` |
| `states-list-terminus` | A feed that stops with nothing at its end | An end marker after the last item |
| `states-no-push-from-above` | A feed that jumps as new posts arrive | Scroll held, with a `3 New` button |

## Reporting

**Severity.** `HIGH` loses data or the user's way forward. That is a filtered-to-zero screen offering creation, input cleared on failure, a dead end or a silent rollback. It is also a raw `undefined` or `NaN`, a background failure shown only in a toast, an offline action that fails silently or an approval hidden behind a spinner.

`MEDIUM` is a component with only its populated state, one screen for three empty states or a region that drops its frame. It is also an error away from its source, an error that moves the layout or a retry that collapses the region. It is also an error that never escalates, an optimistic delete, an unmarked stale value, a permission screen with no path, invented progress or a feed pushed from above.

`LOW` is an image with no fallback or a list with no end.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a surface whose states you did not force open. Mark every state you could not reach as `Not verified`.
