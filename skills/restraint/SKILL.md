---
name: restraint
description: Ships the smallest thing that does the job and deletes what nobody asked for.
---

# Restraint

This skill cuts a change down to the ask. It removes extra interface, options and code and treats "remove" as delete.

## Build the ask

An element, option or code path the user did not ask for is a finding unless the ask needs it to work. Work that has not shipped carries no backwards compatibility. A cut the user has not approved is a proposal, not an edit.

Label wording belongs to `copy`. Reusing an existing part, a library or a native element belongs to `reuse`. Which element a change may touch belongs to `scope`. Staging and committing belong to `ship`. Whether an animation should exist belongs to `motion`, and deleting one cleanly belongs here.

## Nothing beside the ask

Add no sections, badges, counts, captions, footers, icons inside buttons, sounds or decorative effects the user did not request. A count badge on every row is `restraint-no-unrequested-ui`.

## No feedback the screen already gives

Do not add a toast or a dialog for an action whose result is already on screen. That is `restraint-no-redundant-feedback`.

## The smallest build that works

Build at the size the ask needs: local state before a store, one app before a monorepo and a fixed value before a setting. A global store added for one panel's toggle is `restraint-smallest-build`. A preference nobody will change is `restraint-no-needless-setting`.

Write code inline until a second caller needs it. A new helper, hook, wrapper or config object with one caller is `restraint-no-single-use-abstraction`, and two callers are fine. When `rg -w useRowFormatter` finds only the definition and one call, inline it.

## Only the lines the ask needs

A fix does not reformat, rename, reorder imports or upgrade packages around it. Compare `git diff --stat` with `git diff -w --stat`. A large gap between them is whitespace churn. Unasked churn is `restraint-no-drive-by-changes`.

## No files nobody asked for

Add no README, notes, summary, example page or script the task did not ask for. Delete scratch files made while working before you reply. A stray `NOTES.md` or `test-fix.js` is `restraint-no-unrequested-files`. `git status --short` marks every new file `??`, so read that list before replying. This covers only files you made. A file someone else changed stays, and `ship` asks before committing it.

## No defensive code before release

Keep no legacy branch and no compatibility shim in unshipped work. That is `restraint-no-legacy`. Do not add a fallback for a value that is always set. That is `restraint-no-fallbacks`.

Validate only where data enters: user input, the network and storage. A `try` with an empty `catch` around code that cannot throw goes too.

## Remove means delete

When the user says remove, delete the code and its styles, variables, routes and menu entries. "Deferred for review" is `restraint-delete-dont-defer`. A removed package that leaves its variables in `theme.css` is `restraint-remove-the-trail`.

Asked for a cleanup, list unused files, exports, styles, dependencies and leftover prototypes. Delete them once approved.

## A deleted animation takes its start and its waits

Deleting an animation also deletes its start state: `initial={{ opacity: 0 }}`, `animation-fill-mode: forwards` from `opacity: 0` and reveal classes waiting on an observer. A start state left behind keeps the element invisible, which is `restraint-remove-the-start-state`.

It also deletes what waited on it: `onAnimationEnd`, `transitionend`, exit-complete callbacks and timeouts sized to a duration. Focus moved in such a callback moves at once instead. A leftover `setTimeout(focusInput, 200)` is `restraint-remove-the-wait`.

## No debugging left behind

Remove every debug `console` call, `debugger` and block of commented-out code you added before reporting done. `git diff -U0 | rg '^\+.*(console\.(log|warn|info|table|debug|trace)\(|\bdebugger\b)'` finds them. One left in the diff is `restraint-no-leftover-debug`.

## Comments state constraints or go

Delete comments that narrate the code. Keep one only when it states a constraint the code cannot show. A narrating comment is `restraint-no-narrating-comments`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `restraint-no-unrequested-ui` | A count badge on every row | No badge | `MEDIUM` |
| `restraint-no-redundant-feedback` | A toast after a move the user can see | No toast | `MEDIUM` |
| `restraint-smallest-build` | A global store added for one panel's open toggle | `useState` in the panel | `MEDIUM` |
| `restraint-no-needless-setting` | A preference for a gap nobody changes | A fixed `--gap` | `HIGH` |
| `restraint-no-single-use-abstraction` | A `useRowFormatter` hook with one caller | Its three lines inline | `MEDIUM` |
| `restraint-no-drive-by-changes` | A one-line fix with 300 lines of reformatting | The one line | `MEDIUM` |
| `restraint-no-unrequested-files` | `NOTES.md` and `test-fix.js` left in the tree | Neither created, or both deleted before the reply | `MEDIUM` |
| `restraint-no-legacy` | A legacy branch kept "for safety" | Deleted | `MEDIUM` |
| `restraint-no-fallbacks` | `value ?? defaultValue` for a value that is always set | `value` | `MEDIUM` |
| `restraint-delete-dont-defer` | "Deferred for your review" | Deleted, or one question | `HIGH` |
| `restraint-remove-the-trail` | A removed package's variables left in `theme.css` | The variables removed with it | `MEDIUM` |
| `restraint-remove-the-start-state` | `animate` removed, `initial={{ opacity: 0 }}` left | Both removed, and `motion.div` back to `div` | `HIGH` |
| `restraint-remove-the-wait` | `setTimeout(focusInput, 200)` left after the exit is gone | `focusInput()` when the panel closes | `MEDIUM` |
| `restraint-no-leftover-debug` | `console.log("row", row)` in the diff | Removed | `LOW` |
| `restraint-no-narrating-comments` | `// Render the header` | No comment | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. An unrequested feature or screen is `HIGH`, though a small unrequested element stays `MEDIUM`.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
