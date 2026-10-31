[![skills.sh](https://skills.sh/b/raphaelsalaja/skills)](https://skills.sh/raphaelsalaja/skills)

A collection of agent skills for building interfaces with coding agents.

They come in two kinds. **Principle** skills hold a standard the agent applies while it works. **Procedure** skills run a job in order, and the ones marked user-invoked only run when you call them.

## The pair

The house rule. Every rule shows the broken line and the line that replaces it.

A skill follows it in `## The pair`: one row per rule id, the broken line in the second column and the replacement in the third. Findings stay `file:line - [rule-id]`. A rule with no pair is not finished.

## Skills

### Principles

- [**scope**](skills/scope/SKILL.md): Changes **exactly what was asked**, keeps what already worked and finishes every item in the message.
- [**reuse**](skills/reuse/SKILL.md): Reaches for the **project's own components**, then a maintained library, then a native feature, before writing new code.
- [**restraint**](skills/restraint/SKILL.md): Ships the **smallest thing** that does the job and deletes what nobody asked for.
- [**copy**](skills/copy/SKILL.md): Writes interface labels in **Title Case**, short and plain, with one-line descriptions and no em dashes.
- [**prose**](skills/prose/SKILL.md): Writes posts and breakdowns that **open on the problem**, show the options that lost, give exact numbers and mark every guess as a guess.
- [**defaults**](skills/defaults/SKILL.md): Applies house defaults for **scroll edges**, surfaces, type, sound, focus, forms, loading, hotkeys and dialogs.
- [**motion**](skills/motion/SKILL.md): Applies house motion for what animates, **easing, durations**, springs, gestures, exits and reduced motion.
- [**color**](skills/color/SKILL.md): Holds text and control **contrast to exact ratios**, routes colour through role tokens and gives dark mode its own palette.

### Procedures

- [**verify**](skills/verify/SKILL.md): Checks a change **in the running app** before calling it done, then says where to see it.
- [**gather**](skills/gather/SKILL.md): Collects references from **the user's own library**, their boards and pattern sites onto one linked board before a design is built.
- [**match**](skills/match/SKILL.md): Rebuilds a named reference from its **real source and computed values**, then compares the two side by side.
- [**rule**](skills/rule/SKILL.md): Turns a **repeated correction** into a short project rule with the broken and fixed line, then applies it to existing code.
- [**viewports**](skills/viewports/SKILL.md): Renders a page at **every width**, each breakpoint edge, a short landscape phone and 200% text, then reports what overflows, clips or hides.
- [**ship**](skills/ship/SKILL.md): Commits, pushes, merges and releases a change, **watches the checks** and confirms it is live. User-invoked.
- [**prototype**](skills/prototype/SKILL.md): Builds several **real, labelled variants** of one idea on a single page so the user can pick, then deletes the rest. User-invoked.
- [**lab**](skills/lab/SKILL.md): Builds a temporary page that shows **every variant and state** of real components at once, each linked to its source. User-invoked.
- [**deconstruct**](skills/deconstruct/SKILL.md): Breaks an animation or interaction into **a state machine and a timeline** of every property, on a page you can scrub and edit. User-invoked.
- [**alignment**](skills/alignment/SKILL.md): Measures a running page for edges, gaps, centring and radii that **miss by a pixel or two**, then judges visual weight and returns a numbered report with proof. User-invoked.
- [**keyboard**](skills/keyboard/SKILL.md): Walks a running page with **the keyboard alone**, records every focus stop and reports controls it cannot reach, see or operate. User-invoked.
- [**frames**](skills/frames/SKILL.md): Records **a performance trace** of one interaction on a throttled CPU, names what drops frames or delays input, then proves the fix with a second trace. User-invoked.
- [**avatar**](skills/avatar/SKILL.md): Draws any object as **a flat character with two capsule eyes**, then animates its whole body so it glances, blinks, breathes, follows the pointer and falls asleep. User-invoked.
- [**audit**](skills/audit/SKILL.md): Reviews a change, a session or a whole codebase **against every skill** in this collection and returns one ranked, numbered report. User-invoked.

## Install

```bash
npx skills add raphaelsalaja/skills
```

## Use a skill

Principle skills and `verify`, `gather`, `match`, `rule` and `viewports` apply on their own when the work calls for them. Call the user-invoked ones by name:

```text
/ship
/prototype a denser filter bar
/lab the menu components
/deconstruct the copy button animation
/alignment the settings page
/keyboard the settings dialog
/frames opening the command palette
/avatar a coffee cup for the support card
/audit the uncommitted diff
```

A review ends as `file:line` findings with a rule id, then a short summary table. `Block` means a high-severity finding remains. `Approve` means it does not.

## Claude Code plugin

```text
/plugin marketplace add raphaelsalaja/skills
/plugin install userinterface@userinterface
```

Plugin skills take the plugin name as a prefix, such as `/userinterface:audit`.
