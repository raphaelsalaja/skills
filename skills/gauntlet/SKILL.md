---
name: gauntlet
description: Photographs the interface at desktop, mobile and dark, has a fresh critic score the pictures alone, fixes the top three problems and repeats until it scores 9 out of 10.
---

# Gauntlet

This skill polishes a built interface by judgement from the picture alone. A new critic scores three screenshots each round, the top three fixes are made and the loop repeats until the score reaches 9.

## A fresh critic, three fixes, nine to stop

The views are exact: desktop 1440×900, mobile 375×812 at 2x and dark 1440×900. So are the limits: a target of 9.0 with no criterion under 8, three fixes a round and eight rounds. Run it after a large interface build and whenever the user asks to make it look better, polish it or review it like a stranger.

`audit` makes one pass against the house rules and cites ids. This skill reads no rule, it reports what a stranger would see. The full width sweep belongs to `viewports`, contrast ratios to `color` and measured edges to `alignment`. Opening the result belongs to `verify` and the smallest change to `scope`.

## 1. Shoot the three views

Run [shoot.mjs](shoot.mjs) against the running page with `node shoot.mjs <url> .gauntlet/<scope>/round-<n>`. It writes `desktop.png`, `mobile.png` and `dark.png`, each full page, through device emulation. A mockup, a crop or one view is `gauntlet-shoot-three-views`.

Use the same address and the same data every round, so a change in score comes from the interface.

## 2. Start a fresh critic

Start a new subagent for each round with a clean context. Hand it the three screenshots and [rubric.md](rubric.md), which holds the critic prompt. Nothing else goes in: no code, no diff, no earlier score, no earlier critique and no list of known problems. A critic that has seen any of these is `gauntlet-fresh-critic`.

When the tool has no subagents, start a new session with only those files. When that is not possible, say in the ledger and the report that the critic was not fresh.

## 3. Score and name three fixes

The critic scores the six criteria in the rubric from 0 to 10 and returns their mean to one decimal. One verdict such as "looks good, 8" is `gauntlet-score-the-rubric`.

It names exactly three fixes. Each names a screenshot, a region and one change, ranked by how much it would raise the score. Ten fixes, or a fix that names a file, is `gauntlet-three-fixes`.

Record the scores as returned. A score rounded up, averaged with an earlier round or written before the critic ran is `gauntlet-report-real-scores`.

## 4. Fix only the three

Make the three fixes in the shared component or stylesheet and change nothing else. A change the critic did not name is scope creep, even a better one. It waits for the next critic or is dropped. A round that touches a fourth thing is `gauntlet-fix-only-the-three`.

An edit a fix cannot work without, such as a token it reads, counts as part of that fix. Where the fix lives belongs to `reuse`.

## 5. Write the ledger

Copy [ledger.html](ledger.html) to `.gauntlet/<scope>/index.html`, an ignored folder and never the source tree. Write `ledger.js` beside it in the shape its header comment shows, then open it after every round.

The page draws the score line, the six scores, the three fixes and a before and after strip for each round. Write data only. A page written from scratch is `gauntlet-write-the-ledger`.

## 6. Repeat or stop

Shoot again and start a new critic. Stop when the overall score is 9.0 or more and no criterion is under 8. Another round after that is `gauntlet-stop-at-nine`.

Stop after eight rounds and report the score reached. A ninth round is `gauntlet-round-cap`. When the same fix is named in two rounds in a row, it did not land. Stop, name what blocks it and ask. Fixing it a third time is `gauntlet-same-fix-twice`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `gauntlet-shoot-three-views` | One desktop screenshot | `desktop.png`, `mobile.png` and `dark.png`, full page |
| `gauntlet-fresh-critic` | The critic gets the diff and last round's notes | A new subagent with three images and the rubric |
| `gauntlet-score-the-rubric` | "Looks good, 8" | Six scores, mean 7.3 |
| `gauntlet-three-fixes` | Ten notes, one naming `styles.css` | Three fixes, each a screenshot, a region and a change |
| `gauntlet-report-real-scores` | 8.4 written as 9 so the loop can stop | 8.4 in the ledger, another round |
| `gauntlet-fix-only-the-three` | Three fixes and a restyled sidebar | Three fixes, the sidebar left for the next critic |
| `gauntlet-write-the-ledger` | A summary in the chat | `ledger.html` copied, only `ledger.js` written |
| `gauntlet-stop-at-nine` | Round 9 run after a 9.1 | Stopped at 9.1 with every criterion over 8 |
| `gauntlet-round-cap` | Round 11 at 8.6 | Stopped at round 8, 8.6 reported |
| `gauntlet-same-fix-twice` | The dark card fix tried a third time | Stopped after the second, blocker named |

## Reporting

**Severity.** `HIGH` is a critic that saw code or an earlier round, a fix nobody named or a score not written as returned. `MEDIUM` is a missing view, a fix list that is not three or a loop that ran past nine or the cap. `LOW` is a ledger left stale for a round.

**Format.** One finding per root cause:

```
round 3 - [rule-id] what is wrong (evidence)
```

Then a `Rule | Count | Severity` summary and one line for the run: first score, last score, rounds and why it stopped. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a round you could not run as `Not verified`.
