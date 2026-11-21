---
name: scope
description: Changes exactly what was asked, keeps what already worked and finishes every item in the message.
---

# Scope

This skill holds an edit to the request. It reads the smallest literal meaning, keeps everything that already worked and accounts for every item the user sent.

## The smallest reading wins

A change outside the named element is a finding unless the user asked for a sweep. One short question before a broad change is not a finding. Press hardest on short messages that point at one element, on batched messages and on refactors.

Deleting what nobody asked for belongs to `restraint`. Proving the change works belongs to `verify`.

## Every ask gets an answer

Split the message into numbered items and add the open items from earlier turns. Close with the same list, each item done or not done with the reason. Doing the first of four asks is `scope-list-every-ask`.

A message sent while you work adds items to the list. It cancels nothing unless it says stop or replaces an item by name.

## The named element and nothing around it

Restate the target in a few words. "The card" means the card, not the page around it. Restyling the whole shell for a top bar request is `scope-smallest-reading`.

Read "this", "it" and "here" as what the user last pointed at: the attached screenshot, the selected code or the last item named.

## Ask only what the code cannot answer

Search the repository before asking. Where a file lives, which component renders a screen and what a value is now are lookups, not questions. Asking one is `scope-search-before-asking`.

Ask about intent: which of two readings fits, or a value only the user knows. Ask once, in one short question that names both readings and the one you would take.

## Earlier instructions still stand

Before editing, read the user's earlier corrections in the thread and the rules in the repository. Re-adding something they removed is `scope-remember-instructions`. A value they gave, such as `16px` of left padding, stays. Guessing a new one is `scope-keep-given-values`.

When two of the user's instructions conflict, the later one wins. Say which earlier one it replaced. Applying the older one is `scope-later-wins`.

## The named approach or a stated reason

When the user names an approach, a file or a library, use it. When it cannot work, stop and say why before building something else. Shipping a different approach without a word is `scope-say-the-substitution`.

## What worked keeps working

Before a refactor, list the features, buttons and states that exist now, then check each one after. A dropped back button is `scope-keep-what-worked`. When fixing one property, keep the others. Fixing a clip by removing the width animation is `scope-no-collateral`.

## Unshipped work is done now

Work that has not shipped is not split into phases or marked out of scope without asking. A "phase 2" list is `scope-no-phasing`. While planning, plan only. Editing files before the plan is approved is `scope-plan-means-plan`.

## An explanation is the answer

When the user asks how something works, explain it and wait. Answering "how does this work" with a diff is `scope-explain-when-asked`.

A question about the code, such as "why does the header jump?", gets an answer first. A request phrased as a question, such as "can you tighten the gap?", is a request.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `scope-list-every-ask` | The first of four asks done, three dropped | Four numbered items, each reported |
| `scope-smallest-reading` | "Fix the top bar" restyles the whole shell | Only the top bar changes |
| `scope-search-before-asking` | "Which file renders the sidebar?" | `Sidebar.tsx` found by search, then "Collapse it on phones too? I would leave phones as they are." |
| `scope-remember-instructions` | Dots the user removed come back | Earlier turns read before editing |
| `scope-keep-given-values` | Left padding re-guessed as `12px` | The `16px` the user gave |
| `scope-later-wins` | The `12px` from turn 2 applied after turn 5 said `16px` | `16px`, with "replaces the `12px` from earlier" |
| `scope-say-the-substitution` | Asked for a CSS fix, a `ResizeObserver` shipped without a word | "CSS cannot read the content height here. Use a `ResizeObserver` instead?" |
| `scope-keep-what-worked` | A refactor drops back and forward buttons | Before and after feature list, both buttons kept |
| `scope-no-collateral` | The clip is fixed and the width animation is gone | Clip fixed, width animation kept |
| `scope-no-phasing` | "Saved filters: phase 2" | Built now, or one question |
| `scope-plan-means-plan` | Files edited during planning | Plan only until it is approved |
| `scope-explain-when-asked` | "Explain how it works" answered with a diff | An explanation, then wait |

## Reporting

**Severity.** `HIGH` is a dropped feature, or an earlier instruction undone. `MEDIUM` is a change outside the named element, or an ask left unreported. It is also an older instruction applied over a later one, or a named approach swapped without a word. `LOW` is a question asked where one reading was plain, or one the repository already answered.

**Format.** One finding per root cause, citing the request when no file applies:

```
file:line - [rule-id] what is wrong
request 2 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a diff you did not read. Mark every check you could not run as `Not verified`.
