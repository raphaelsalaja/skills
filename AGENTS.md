# AGENTS.md

This file is the single source of guidance for coding agents working in this repository. `CLAUDE.md` imports it and adds nothing but Claude Code specifics, so put repository facts here and do not maintain a second copy.

## What this repository is

A collection of agent skills for the interface checks on [userinterface.wiki](https://www.userinterface.wiki). It is distributed two ways: via `npx skills add raphaelsalaja/skills` and as the Claude Code plugin `userinterface` served by the marketplace in this same repository. It is documentation. There is no repository-wide build, lint or test tooling.

The house rule is the pair. Every rule shows the broken line and the line that replaces it. `## The pair` in each skill is that rule, and a finding is `file:line - [rule-id]`.

The long-form articles, demos and the single compiled skill `userinterface-wiki` stay in [raphaelsalaja/userinterface-wiki](https://github.com/raphaelsalaja/userinterface-wiki). Do not paste those essays back into this repo. A skill here states the rule, the exact value and the detection pattern. It does not restate a sibling skill.

`.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` define the plugin and its marketplace. Both are named `userinterface`, so plugin users invoke skills as `/userinterface:timing-functions` while skills-CLI users invoke `/timing-functions`. Skills are discovered from `skills/` automatically, so adding a skill needs no manifest change. Bump `version` in `plugin.json` in the same commit as any change under `skills/`. That number is the only signal plugin users update on.

`opencode.json` registers `skills/` under `skills.paths` so opencode loads the collection while this repository itself is open.

## Structure

Each skill lives in `skills/<skill-name>/`, with `SKILL.md` as the entry point. `agents/openai.yaml` carries the display name.

Every `SKILL.md` carries:

- Frontmatter with `name` matching the directory, and a `description` of one or two sentences. The description matches that skill's line in `README.md`.
- A plain-name H1 and a two-sentence opener saying what the skill does.
- A calibration of how hard to press, including which values are exact.
- `## When to use`.
- Numbered steps for the procedure, then principle sections for the rules.
- A hand-off naming the sibling that owns an adjacent topic, in backticks, never as a relative link. Each skill directory ships on its own.
- A `## The pair` table. Each row is a rule id, the broken line and the line that replaces it. That table is the house rule.
- A `## Reporting` section with the severity ladder and the `file:line - [rule-id]` format.

Headings are sentence case. Number them only where the steps run in order. Straight quotes. No em dashes. En dashes are for numeric ranges only. No serial comma.

## Rule ownership

| Skill | Owns |
| --- | --- |
| `animation-principles` | Press scale `0.98`, squash inside `0.95`–`1.05`, stagger under `50ms`, one focal motion, dimmed backdrops, stacking |
| `timing-functions` | Spring versus easing versus linear versus none, duration bands, the `300ms` cap, context-menu entrances |
| `exit-animations` | `AnimatePresence`, exit props, keys, presence hooks, modes, nested `propagate` |
| `pseudo-elements` | `::before` and `::after`, native pseudos, view-transition names |
| `interface-sound` | When UI sound may play, mute, volume, reduced motion, preload |
| `synthesize-sound` | One `AudioContext`, exponential envelopes, click length and filter |
| `morphing-icons` | The three-line SVG icon model, collapsed lines, rotation groups |
| `container-bounds` | Measure the inner node, animate the outer node |
| `laws-of-ux` | Target size, hit area, choices, the `400ms` response, grouping laws |
| `predictive-prefetch` | Trajectory prefetch versus hover or viewport prefetch |
| `interface-typography` | Figures, OpenType, wrapping, uppercase spacing |
| `visual-design` | Concentric radius, shadows, alpha borders, the spacing scale |

`timing-functions` owns the `300ms` animation cap. `laws-of-ux` owns the `400ms` response threshold. `exit-animations` may cite `300ms` only for `mode="wait"`, and it names `timing-functions` beside that number. `pseudo-elements` owns the negative-inset hit recipe. `laws-of-ux` owns the `32px` minimum and points at `pseudo-elements` for the inset.

## Authoring

A description change updates `README.md` in the same commit. A rename updates the directory, the frontmatter `name` and `display_name` in `agents/openai.yaml`.

Sentences stay at or under 30 words, counting a code span as one word. Before adding a sentence, check whether another skill already owns that rule.
