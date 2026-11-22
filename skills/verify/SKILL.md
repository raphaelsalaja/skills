---
name: verify
description: Checks a change in the running app before calling it done, then says where to see it.
---

# Verify

This skill decides when a change may be called done. It asks for evidence from the running result, not from a passing build.

## A build is not evidence

A typecheck, a lint pass or a green build does not show that a visual or behavioural change works. Saying "fixed" without opening the result is a finding. Opening it and reporting an imperfect result is not.

Run it after any change to UI or behaviour, before replying "done". Run it at once when the user says "still", "nothing changed" or "test it yourself". What to change belongs to `scope`. Matching an outside app belongs to `match`. Evidence behind a review finding belongs to `audit`.

## 1. See the problem first

Open the app, the page or the output and find the symptom before editing. Use the browser, a screenshot or computer use. Editing from the description alone is `verify-reproduce-first`. When you cannot reach the running result, say what blocks you.

## 2. Look where the user will look

First confirm the running app serves your edit. The dev server must run from this checkout, on the port you open, restarted after any config or `.env` change. `lsof -iTCP -sTCP:LISTEN -n -P` names the process on each port, and `lsof -a -p <pid> -d cwd` names its folder. Judging a stale server or another worktree is `verify-served-the-edit`.

Reload, or confirm hot reload applied, then look at the same place. A build pass offered as proof is `verify-build-is-not-proof`. Click every control you added once. A control with no effect is `verify-click-new-controls`.

Look at the whole surface, not only the line you edited. Scroll to both ends and open each state the change touches. Checking only the edited element is `verify-whole-surface`.

Read the console before and after. Done means no error or warning the change introduced, such as a missing `key` warning. A new console error or warning left behind is `verify-clean-console`.

A change to touch behaviour is confirmed on a real phone over remote debugging, ideally one a few years old. That covers sticky hover, tap delay, rubber-banding, safe areas and the on-screen keyboard. Check once with the keyboard open and once in landscape. Without a phone, check in emulation and report `Not verified on device`. A touch fix called done from emulation alone is `verify-on-device`.

## 3. Keep every check honest

A check made to pass is not a pass. Never delete or skip a test, or add `.skip`, `.only`, `@ts-ignore` or `eslint-disable` to get past one. Never change an expected value to match new output, and never special-case the input a test uses. When a test contradicts the request, stop and name the conflict. Any of these is `verify-no-weakened-checks`.

Search your own diff for them before reporting, staged and new files included. Run `git diff HEAD -U0 | rg '^\+.*(\.skip\(|\.only\(|\bx(it|describe)\(|\.todo\(|@ts-(ignore|expect-error)|eslint-disable)'`. Run the same pattern over `git ls-files -o --exclude-standard`. Each hit needs a reason the user agreed to.

## 4. Find the cause on a repeat report

When the user reports the same problem again, stop adjusting the same value. Diff against the last commit where it worked, read the computed style or search for the cause. A third guess at one property is `verify-root-cause-on-repeat`.

## 5. Report what you saw

Say what you checked, how and where the user can see it: the route, the window, the menu path or the folder. "It should work now" is `verify-say-where`. Open the result for the user when you can. A bare output path is `verify-open-the-result`.

Attach the evidence. A visual change carries the screenshot taken after the fix. A behaviour change carries the steps and what happened. "Verified, looks good" with nothing attached is `verify-show-evidence`.

Name anything you could not check and why. "Done" with an unchecked item is `verify-name-the-gap`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `verify-reproduce-first` | Editing from the bug report alone | Open the screen, see the bug, then edit | `MEDIUM` |
| `verify-served-the-edit` | Checked on port 3000 while the edit lives in another worktree | The server's folder confirmed with `lsof`, then checked | `HIGH` |
| `verify-build-is-not-proof` | "Typecheck passes, so it is fixed" | "Reloaded Settings and the toggle now persists" | `HIGH` |
| `verify-click-new-controls` | A new "Add Condition" button with no handler | Click it once and see a row appear | `HIGH` |
| `verify-whole-surface` | Checking the edited row only | The whole panel, scrolled to both ends | `MEDIUM` |
| `verify-clean-console` | "Done" with a new missing `key` warning in the console | The warning fixed, the console as clean as before | `MEDIUM` |
| `verify-on-device` | A safe-area fix checked in desktop emulation alone | Checked on a phone with the keyboard open and in landscape, or emulated and marked `Not verified on device` | `MEDIUM` |
| `verify-no-weakened-checks` | `expect(total).toBe(42)` changed to `toBe(41)` so the suite passes | The code fixed, or "The test expects 42 and the request says 41. Which is right?" | `HIGH` |
| `verify-root-cause-on-repeat` | A third tweak to the same `padding` | Diff against the last working commit, then fix | `MEDIUM` |
| `verify-say-where` | "It should work now" | "Open Library, right-click a save, choose Hide" | `MEDIUM` |
| `verify-open-the-result` | `~/Downloads/clips` printed in the reply | The folder opened for the user | `LOW` |
| `verify-show-evidence` | "Verified, looks good" | The screenshot of Settings after the fix, and "clicked Save, reloaded, the value stayed" | `LOW` |
| `verify-name-the-gap` | "Done" while export was never run | "Not verified: export, it needs a signed build" | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause, citing the request when no file applies:

```
file:line - [rule-id] what is wrong
request 2 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a change you did not open. Mark every check you could not run as `Not verified`.
