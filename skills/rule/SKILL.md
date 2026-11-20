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

Read `AGENTS.md`, `CLAUDE.md` and the editor rule folders before acting. Acting against a written rule is `rule-read-before-acting`.

## 2. Read the user's edits

The user's edits to code the agent wrote count as corrections: a `duration: 400` changed to `200`, a revert or a variant picked. Diff what you wrote against what is there now. Record the value each edit landed on, not the steps that led there. A user's edit overwritten on the next pass is `rule-read-silent-edits`.

## 3. Write the pair

State the rule in one sentence, then the broken line and the line that replaces it. A rule with no example is `rule-write-the-pair`.

## 4. Keep it short

One rule is one to three sentences plus its pair. A paragraph of reasoning is `rule-keep-it-short`.

## 5. Give it one home

Put the rule in the file that owns its topic. Copying it into a second file is `rule-one-home`. When a new rule contradicts an old one, replace the old one and say so. Two contradicting rules left side by side is `rule-resolve-conflicts`.

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
| `rule-keep-it-short` | A paragraph of reasoning | One sentence and a pair |
| `rule-one-home` | One rule in three files | One file, the others point at it |
| `rule-resolve-conflicts` | "Use borders" beside "never use borders" | The old rule replaced, the change noted |
| `rule-check-when-matchable` | "Never use `#hex` in components" as prose alone | A lint pattern for `#[0-9a-f]{3,8}` in `components/`, run once: 14 hits |
| `rule-sweep-existing` | The rule added, twelve violations left | The violations fixed and listed |

## Reporting

**Severity.** `HIGH` is an edit that breaks a written rule, or two rules that contradict. `MEDIUM` is a rule with no pair, old violations left after a new rule, a user's edit left unrecorded or a matchable rule with no check. `LOW` is a rule longer than it needs.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every rule file you could not read as `Not verified`.
