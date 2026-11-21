---
name: rule
description: Turns a repeated correction into a short project rule with the broken and fixed line, then applies it to existing code.
---

# Rule

This skill turns a correction into a written rule. It writes the rule once in the right file, then fixes the code that already breaks it.

## Twice is a rule

When the user says "make it a rule", "always", "never" or "remember this", write it down. When they correct the same thing twice, propose a rule. A rule is a pair, short enough to read before every edit.

Following the rules while editing belongs to `scope`. Reviewing a codebase against all of them runs in `audit`.

## 1. Read what exists

Read `AGENTS.md`, `CLAUDE.md` and the editor rule folders before acting. Read nested rule files too: the one nearest the edited path wins, and the user's message outranks every file. Acting against a written rule is `rule-read-before-acting`.

## 2. Read the user's edits

The user's edits to code the agent wrote count as corrections: a `duration: 400` changed to `200`, a revert or a variant picked. Diff what you wrote against what is there now. Record the value each edit landed on, not the steps that led there. A user's edit overwritten on the next pass is `rule-read-silent-edits`.

## 3. Write the pair

State the rule in one sentence, then the broken line and the line that replaces it. A rule with no example is `rule-write-the-pair`.

Write always or never with the exact value. "Try to", "consider", "where possible" and shouting such as "IMPORTANT" are `rule-no-hedges`. `rg -n -i 'try to|consider|where possible|important:'` finds them in the rule files.

## 4. Keep it short

One rule is one to three sentences plus its pair. A paragraph of reasoning is `rule-keep-it-short`.

Write only what the code cannot show: a decision, a trap or a value the user chose. The folder layout and the framework are already in the repository. Keep each rule file under 200 lines, and move rules for one folder out first when it grows.

## 5. Give it one home

Put the rule in the file that owns its topic. Copying it into a second file is `rule-one-home`. When a new rule contradicts an old one, replace the old one and say so. Two contradicting rules left side by side is `rule-resolve-conflicts`.

A rule about one folder goes in that folder's `AGENTS.md` or in a rule limited to its paths. A root rule that only applies under one path is `rule-scope-to-the-path`.

A preference about the user's own machine, editor or habits goes in their personal rules, never in the repository. Committing one to the shared file is `rule-personal-stays-personal`. Ask which home when the line could be either.

## 6. Ship a check

When matching code can find a violation, the rule ships with a check: a lint pattern, a token restriction or a test. Run it once and report its hit count before fixing anything. A matchable rule written as prose alone is `rule-check-when-matchable`.

## 7. Sweep the code

Search for code that breaks the new rule, fix it and list the files. A rule written with old violations left in place is `rule-sweep-existing`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `rule-read-before-acting` | A pill button added in a repo whose rules forbid pills | Rules read first, rounded button |
| `rule-read-silent-edits` | The user's `duration: 200` set back to `400` on the next pass | `200` read from the diff and written as the rule |
| `rule-write-the-pair` | "Use good casing" | "Labels take Title Case. `Add to library` becomes `Add to Library`" |
| `rule-no-hedges` | "IMPORTANT: try to keep buttons consistent" | "Buttons use `Button`. `<button className="btn">` becomes `<Button>`" |
| `rule-keep-it-short` | A paragraph of reasoning | One sentence and a pair |
| `rule-one-home` | One rule in three files | One file, the others point at it |
| `rule-resolve-conflicts` | "Use borders" beside "never use borders" | The old rule replaced, the change noted |
| `rule-scope-to-the-path` | "API handlers validate with the shared schemas" in the root file | The line in `src/api/AGENTS.md` |
| `rule-personal-stays-personal` | "Never run builds on my laptop" committed to `AGENTS.md` | The line in the user's personal rules, the repository file unchanged |
| `rule-check-when-matchable` | "Never use `#hex` in components" as prose alone | A lint pattern for `#[0-9a-f]{3,8}` in `components/`, run once: 14 hits |
| `rule-sweep-existing` | The rule added, twelve violations left | The violations fixed and listed |

## Reporting

**Severity.** `HIGH` is an edit that breaks a written rule, or two rules that contradict. `MEDIUM` is a rule with no pair, old violations left after a new rule, a user's edit left unrecorded or a matchable rule with no check. It is also a personal preference committed to the shared file. `LOW` is a rule longer than it needs, a hedged rule or a folder's rule kept at the root.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every rule file you could not read as `Not verified`.
