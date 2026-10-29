# AGENTS.md

This file is the single source of guidance for coding agents working in this repository. `CLAUDE.md` imports it and adds nothing but Claude Code specifics, so put repository facts here and do not maintain a second copy.

## What this repository is

A collection of agent skills for building interfaces with coding agents. It is distributed two ways: via `npx skills add raphaelsalaja/skills` and as the Claude Code plugin `userinterface` served by the marketplace in this same repository. It is documentation. There is no repository-wide build, lint or test tooling.

The house rule is the pair. Every rule shows the broken line and the line that replaces it. `## The pair` in each skill is that rule, and a finding is `file:line - [rule-id]`. When a finding is about the work rather than a file, cite the request or the step instead: `request 2 - [rule-id]`.

A skill states the rule, the exact value and the detection pattern. It does not restate a sibling skill. It names no person, company or outside product as its source.

`.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` define the plugin and its marketplace. Both are named `userinterface`, so plugin users invoke skills as `/userinterface:verify` while skills-CLI users invoke `/verify`. Skills are discovered from `skills/` automatically, so adding a skill needs no manifest change. Bump `version` in `plugin.json` in the same commit as any change under `skills/`. That number is the only signal plugin users update on.

`opencode.json` registers `skills/` under `skills.paths` so opencode loads the collection while this repository itself is open.

## Two kinds of skill

**Principle** skills hold a standard applied during any work: `scope`, `reuse`, `restraint`, `copy` and `defaults`. Their headings state the point, such as `## Shadows are never cut off`, and they have no numbered steps.

**Procedure** skills run a job in order: `verify`, `gather`, `match`, `rule`, `ship`, `prototype`, `lab`, `deconstruct`, `alignment` and `audit`. Their steps are numbered `## 1.` onward.

## Invocation

`ship`, `prototype`, `lab`, `deconstruct`, `alignment` and `audit` are user-invoked. Each one sets `disable-model-invocation: true` in its frontmatter and `allow_implicit_invocation: false` under `policy` in `agents/openai.yaml`. Set both or neither. The README line ends with "User-invoked." Every other skill may load on its own.

## Structure

Each skill lives in `skills/<name>/`, with `SKILL.md` as the entry point. `agents/openai.yaml` carries the display name and the short description. A supporting file such as `recipes.md`, `sources.md` or `report.md` sits beside `SKILL.md` only when it holds code or a format too long for the skill. Link it from the section that uses it.

Every `SKILL.md` carries:

- Frontmatter with `name` matching the directory, a one-sentence `description` and the invocation flag where it applies. The description matches that skill's line in `README.md`, without the bold.
- A plain-name H1 and a two-sentence opener saying what the skill does.
- A calibration section whose heading states how hard to press, including which values are exact and when the skill applies.
- A hand-off naming the sibling that owns an adjacent topic, in backticks, never as a relative link. Each skill directory ships on its own.
- Principle sections or numbered steps, by kind.
- A `## The pair` table. Each row is a rule id, the broken line and the line that replaces it. That table is the house rule.
- A `## Reporting` section with the severity ladder and the `file:line - [rule-id]` format.

Every rule id starts with its skill's name, such as `defaults-fade-not-cut`. Each id appears once in the prose and once in the pair.

Headings are sentence case. Straight quotes. No em dashes. En dashes are for numeric ranges only. No serial comma.

## Rule ownership

| Skill | Owns |
| --- | --- |
| `verify` | Evidence from the running result, repeat reports, where to see the change |
| `scope` | Every ask in the message, the smallest reading, earlier instructions, keeping what worked, no phasing |
| `reuse` | Own component, then library, then platform, then custom, one standard, fixes in the primitive and the sibling sweep |
| `restraint` | Unrequested interface, settings and code, fallbacks, legacy, deleting instead of deferring, narrating comments |
| `copy` | Title Case labels, word count, one-line descriptions, status tense, em dashes and ellipses |
| `defaults` | Scroll edges, clipped shadows, pills, decoration, focus rings, hotkeys in inputs, chrome motion, stacked dialogs |
| `gather` | Finding references across the user's library, boards and pattern sites, the linked board, saving picks |
| `match` | Inspecting a named reference, computed values, state inventory, side-by-side proof |
| `rule` | Writing a correction into the agent file, conflicts between rules, sweeping old breaks |
| `ship` | Commits, changesets, pushes, merges, pull requests per bug, releases, deploy checks |
| `prototype` | Labelled real-code variants of one idea, pruning after the pick |
| `lab` | Every state of real components forced open on one development page |
| `deconstruct` | Motion broken into named states, events and per-property tracks, the scrubbable viewer |
| `alignment` | Measured edges, gaps, ink centring, optical nudges, concentric radii, visual weight, the annotated report |
| `audit` | Review scope, running every skill, merging by root cause, the numbered report and the verdict |

`reuse` owns the sweep that follows a fix moved into a shared component. `rule` owns the sweep that follows a new rule. `restraint` owns what to leave out of the interface. `copy` owns the words that stay. `defaults` owns how the surfaces that stay behave. `audit` owns the shared severity ladder in `audit/report.md`, and every other skill uses the same three words.

## Authoring

A description change updates `README.md` in the same commit. A rename updates the directory, the frontmatter `name`, the rule id prefix and `display_name` in `agents/openai.yaml`.

Sentences stay at or under 30 words, counting a code span as one word. Before adding a sentence, check whether another skill already owns that rule.
