[![skills.sh](https://skills.sh/b/raphaelsalaja/skills)](https://skills.sh/raphaelsalaja/skills)

A collection of agent skills for interface motion, sound, typography and visual detail.

These skills cover the checks written on [userinterface.wiki](https://www.userinterface.wiki). The articles and the single compiled skill live in [userinterface-wiki](https://github.com/raphaelsalaja/userinterface-wiki). This repository splits those checks into one skill per category, so an agent can load the topic in front of it.

## The pair

The house rule. Every rule shows the broken line and the line that replaces it.

A skill follows it in `## The pair`: one row per rule id, the broken line in the second column and the replacement in the third. Findings stay `file:line - [rule-id]`. A rule with no pair is not finished.

## Skills

- [**animation-principles**](skills/animation-principles/SKILL.md): Reviews press scale, squash and stretch, stagger and staging so one motion holds the frame.
- [**timing-functions**](skills/timing-functions/SKILL.md): Chooses springs, easing, linear time or no motion from the interaction, then checks duration.
- [**exit-animations**](skills/exit-animations/SKILL.md): Reviews Motion exit animations for AnimatePresence wrappers, keys, modes and nested exits.
- [**laws-of-ux**](skills/laws-of-ux/SKILL.md): Reviews targets, choices, response time and grouping against the UX laws used on userinterface.wiki.
- [**visual-design**](skills/visual-design/SKILL.md): Sets concentric radii, layered shadows, alpha borders and a shared spacing scale.
- [**pseudo-elements**](skills/pseudo-elements/SKILL.md): Reviews decorative pseudo-elements, native control styling and the View Transitions API.
- [**interface-sound**](skills/interface-sound/SKILL.md): Reviews UI audio so sound confirms, stays optional and never replaces a visual cue.
- [**synthesize-sound**](skills/synthesize-sound/SKILL.md): Reviews Web Audio UI sounds for one shared context, exponential decay and click-sized parameters.
- [**interface-typography**](skills/interface-typography/SKILL.md): Sets tabular numbers, OpenType features, wrapping and uppercase spacing for interface text.
- [**container-bounds**](skills/container-bounds/SKILL.md): Animates container width and height by measuring an inner element and transitioning an outer one.
- [**predictive-prefetch**](skills/predictive-prefetch/SKILL.md): Prefetches from cursor trajectory and keyboard focus, not from hover or from everything in view.
- [**morphing-icons**](skills/morphing-icons/SKILL.md): Builds icons that morph through three shared SVG lines, including collapsed lines and rotation groups.

## Install

```bash
npx skills add raphaelsalaja/skills
```

## Use a skill

Installing the collection registers every skill. Ask for the work in plain language, such as a motion review or a morphing icon, and the matching skill applies. You can also point an agent at one `SKILL.md` and tell it to follow that file.

A review ends as `file:line` findings with a rule id, then a short summary table. `Block` means a high-severity finding remains. `Approve` means it does not.

## Claude Code plugin

```text
/plugin marketplace add raphaelsalaja/skills
/plugin install userinterface@userinterface
```
