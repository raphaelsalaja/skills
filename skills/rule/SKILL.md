---
name: rule
description: Turns a repeated correction into a short project rule with the broken and fixed line, then applies it to existing code.
---

# Rule

This skill turns a correction into a written rule. It writes the rule once in the right file, then fixes the code that already breaks it.

## Twice is a rule

When the user says "make it a rule", "always", "never" or "remember this", write it down. When they correct the same thing twice, propose a rule. A rule is a pair, short enough to read before every edit.

Following the rules while editing, and the later instruction winning in a thread, belong to `scope`. Reviewing a codebase against all of them runs in `audit`.

## 1. Read what exists

Before writing, read `AGENTS.md`, `CLAUDE.md`, the editor rule folders and every nested rule file. They show which file owns the topic and which old rule the new one meets.

## 2. Read the user's edits

The user's edits to code the agent wrote count as corrections: a `duration: 400` changed to `200`, a revert or a variant picked. Diff what you wrote against what is there now. Record the value each edit landed on, not the steps that led there. A user's edit overwritten on the next pass is `rule-read-silent-edits`.

## 3. Write the pair

State the rule in one sentence, then the broken line and the line that replaces it. A rule with no example is `rule-write-the-pair`.

Write always or never with the exact value. "Try to", "consider", "where possible" and shouting such as "IMPORTANT" are `rule-no-hedges`. `rg -n -i '\b(try to|consider|where possible)\b|important:'` finds them in the rule files.

## 4. Keep it short

One rule is one to three sentences plus its pair. A paragraph of reasoning is `rule-keep-it-short`.

Write only what the code cannot show: a decision, a trap or a value the user chose. The folder layout and the framework are already in the repository. Keep each rule file under 200 lines, and move rules for one folder out first when it grows.

## 5. Give it one home

Put the rule in the file that owns its topic. Copying it into a second file is `rule-one-home`. When a new rule contradicts an old one, replace the old one and say so. Two contradicting rules left side by side is `rule-resolve-conflicts`.

A rule about one folder goes in that folder's `AGENTS.md` or in a rule limited to its paths. A root rule that only applies under one path is `rule-scope-to-the-path`.

A preference about the user's own machine, editor or habits goes in their personal rules, never in the repository. Committing one to the shared file is `rule-personal-stays-personal`. Ask which home when the line could be either.

## 6. Ship a check

When matching code can find a violation, the rule ships with a check: a lint pattern, a token restriction or a test. Run it once and report its hit count before fixing anything. When the project forbids running checks locally, write the check and leave it for CI. A matchable rule written as prose alone is `rule-check-when-matchable`.

## 7. Sweep the code

Search for code that breaks the new rule and list every hit. Fix the hits in files the change already touches, then ask once before fixing the rest. A rule written with old violations left unlisted is `rule-sweep-existing`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `rule-read-silent-edits` | The user's `duration: 200` set back to `400` on the next pass | `200` read from the diff and written as the rule | `HIGH` |
| `rule-write-the-pair` | "Use good casing" | "Labels take Title Case. `Add to library` becomes `Add to Library`" | `MEDIUM` |
| `rule-no-hedges` | "IMPORTANT: try to keep buttons consistent" | "Buttons use `Button`. `<button className="btn">` becomes `<Button>`" | `LOW` |
| `rule-keep-it-short` | A paragraph of reasoning | One sentence and a pair | `LOW` |
| `rule-one-home` | One rule in three files | One file, the others point at it | `MEDIUM` |
| `rule-resolve-conflicts` | "Use borders" beside "never use borders" | The old rule replaced, the change noted | `HIGH` |
| `rule-scope-to-the-path` | "API handlers validate with the shared schemas" in the root file | The line in `src/api/AGENTS.md` | `LOW` |
| `rule-personal-stays-personal` | "Never run builds on my laptop" committed to `AGENTS.md` | The line in the user's personal rules, the repository file unchanged | `MEDIUM` |
| `rule-check-when-matchable` | "Never use `#hex` in components" as prose alone | A lint pattern for `#[0-9a-f]{3,8}` in `components/`, run once: 14 hits | `MEDIUM` |
| `rule-sweep-existing` | The rule added, twelve violations left unlisted | Twelve hits listed, the three in touched files fixed, "Fix the other nine?" | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every rule file you could not read as `Not verified`.
