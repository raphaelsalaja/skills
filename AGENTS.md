# AGENTS.md

This file is the single source of guidance for coding agents working in this repository. `CLAUDE.md` imports it and adds nothing but Claude Code specifics, so put repository facts here and do not maintain a second copy.

## What this repository is

A collection of agent skills for building interfaces with coding agents. It is distributed two ways: via `npx skills add raphaelsalaja/skills` and as the Claude Code plugin `userinterface` served by the marketplace in this same repository. It is documentation. The only tooling is `kit/sync.mjs`, which copies the shared interface kit into the skills, and `scripts/check.mjs`, which checks the skills against this file.

The house rule is the pair. Every rule shows the broken line and the line that replaces it. `## The pair` in each skill is that rule, and a finding is `file:line - [rule-id]`. When a finding is about the work rather than a file, cite the request or the step instead: `request 2 - [rule-id]`.

A skill states the rule, the exact value and the detection pattern. It does not restate a sibling skill. It names no person, company or outside product as its source.

`.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` define the plugin and its marketplace. Both are named `userinterface`, so plugin users invoke skills as `/userinterface:verify` while skills-CLI users invoke `/verify`. Skills are discovered from `skills/` automatically, so adding a skill needs no manifest change. Bump `version` in `plugin.json` in the same commit as any change under `skills/`. That number is the only signal plugin users update on. Commit messages follow Conventional Commits, such as `feat(defaults): add the safe-area rule`.

`opencode.json` registers `skills/` under `skills.paths` so opencode loads the collection while this repository itself is open.

## Two kinds of skill

**Principle** skills hold a standard applied during any work: `scope`, `reuse`, `restraint`, `copy`, `prose`, `defaults`, `forms`, `overlays`, `motion`, `color` and `states`. Their headings state the point, such as `## Shadows are never cut off`, and they have no numbered steps.

**Procedure** skills run a job in order: `verify`, `gather`, `match`, `rule`, `viewports`, `icons`, `ship`, `prototype`, `lab`, `deconstruct`, `alignment`, `keyboard`, `frames`, `vitals`, `invariants`, `stress`, `animate`, `avatar`, `bots`, `sketchbook`, `iconset` and `audit`. Their steps are numbered `## 1.` onward.

## Invocation

`ship`, `prototype`, `lab`, `deconstruct`, `alignment`, `keyboard`, `frames`, `vitals`, `invariants`, `stress`, `animate`, `avatar`, `bots`, `sketchbook`, `iconset` and `audit` are user-invoked. Each one sets `disable-model-invocation: true` in its frontmatter and `allow_implicit_invocation: false` under `policy` in `agents/openai.yaml`. Set both or neither. The README line ends with "User-invoked." Every other skill may load on its own.

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

## The kit

`kit/` holds the interface shipped pages and overlays share: tokens, the page base, the head and bar, controls, the select, inputs, the toast and tip, the side sheet and section heads. Each skill still ships on its own, so the kit is copied into marked regions rather than imported.

A region opens on `/* kit:select */` in CSS or `// kit:h` in JavaScript and closes on the same marker with `end`. Add `prefix=lab` to rename every custom property, so tokens on a shadow host never reach slotted app components.

`kit/index.html` shows every component in both themes and syncs like any page.

Change a component in `kit/`, never inside a region, then run `node kit/sync.mjs`. `node kit/sync.mjs --check` exits 1 when any region has drifted from the kit.

A class the kit owns, such as `.pick` or `.tip`, means the kit component on every page. A page-only variant takes its own name, such as `.tool-pick`, and sits after the regions.

Work an agent builds in the user's project, such as sketchbook tiles or bot cards, uses that project's own stack and takes nothing from the kit.

Every rule id starts with its skill's name, such as `defaults-fade-not-cut`. Each id appears once in the prose and once in the pair.

Headings are sentence case. Straight quotes. No em dashes. En dashes are for numeric ranges only. No serial comma.

## Rule ownership

| Skill | Owns |
| --- | --- |
| `verify` | Evidence from the running result, a clean console, touch checked on a phone, repeat reports, where to see the change |
| `scope` | Every ask in the message, the smallest reading, earlier instructions, keeping what worked, no phasing |
| `reuse` | Own component, then library, then platform, then custom, one standard, fixes in the primitive and the sibling sweep |
| `restraint` | Unrequested interface, settings and code, fallbacks, legacy, deleting instead of deferring, a deleted animation's start state and waits, narrating comments |
| `copy` | Title Case labels, word count, the key word first, verb-first and confirm buttons, what a confirm loses, the last step's action, error fixes and errors by kind, link text, instructions that name the control, toggle labels, whole sentences, one name per action, Create and Add, one-line descriptions, status tense, units held by non-breaking spaces, true minus and times signs, em dashes and ellipses |
| `prose` | Long-form posts and breakdowns: the opening context, first person, linked reasons, lists in the sentence, what happened, own limits, rejected options, exact values, asides and footnotes, sources and citations, marked guesses, British spelling, captions, the ending, the author's voice |
| `defaults` | Scroll edges and overscroll, shadows, surfaces, the z-index scale, translucency, theme and the system setting, focus and accessible names, exposed state, focusables under `aria-hidden`, alt text, captions and autoplay, headings, titles and language, untranslated names, hit areas and spacing, actions on release, hover styles, links and underlines in prose, URL state and list position, breadcrumbs and the selected item, mobile viewport and taps, hotkeys, loading and busy focus, urgent alerts, undo, type rendering and the type scale, weights, steady weight and measure, real tables, sticky columns and pagination, relative times and meters, sound cues |
| `forms` | Labels and fieldsets, required marks, rules and plain hints between label and field, input types, keyboard hints and spellcheck, one name field, pasted input, soft limits, field width, columns and control height, textarea sizing, icons inside fields, radios, stacked options and searchable long lists, switches, kept options and select colours, typed dates, no change on input, autofocus off touch, unchecked consent, asking once, one question per page and the review page, Enter and composition, validation on submit, the error summary and error title, tied errors, user-invalid styles, the validating indicator, no reset button and one save, the unsaved-changes guard, sign-in without recall |
| `overlays` | The top layer, focus in dialogs, one dialog at a time and none on load, dialog button order, safe destructive defaults, CSS scroll lock, declared dismissal and outside clicks, anchored placement, one popover and one submenu level, tooltips and none on disabled buttons, sheets on phones, backdrops, one banner at a time, toasts and action toasts that stay |
| `motion` | What animates and what holds still, idle loops and pause controls, easing, durations, springs, bounce and flick projection, drags and gestures, sheet drags over scrolling content, staggers and choreography, exits and presence, SVG parts around their own centre, CSS entrances and size to auto, view transitions, cross-fades and icon morphs, motion blur through the package, flashing, reduced motion and gated smooth scroll |
| `color` | Text and control contrast, `accent-color` on native controls, composited measurement, the nearest passing colour, increased contrast, gradient interpolation and eased fades, scrims, role tokens, translucent neutrals, dark palettes and off-white text, logos in both themes, accent and status meaning, one primary per region |
| `states` | The listed states, the three empty states, missing values, user text as typed, many values at once, the current user, errors by kind and place, quiet degradation, kept input, one-click fixes, retry in place, visible rollback, stale values, denied access, session timeouts, waiting on the user, progress that ends, the confirmation page and the end of a list |
| `gather` | Asking which sources to use, the user's saves and the site on every source, boards through Pond, a read-only library, parallel source agents, stopping at a usage limit, queries and image searches, live captures, the collector, the linked board, More Like This and saving picks |
| `match` | Inspecting a named reference, computed values, state inventory, side-by-side proof |
| `rule` | Writing a correction into the agent file, the user's silent edits, conflicts between rules, a check for matchable rules, sweeping old breaks |
| `viewports` | The width set, breakpoint edges, sideways scroll, clipped text, hover-only controls, short heights, doubled text, text spacing, longer, shorter and unbroken text, other scripts, mirrored text and flipped directional icons |
| `icons` | Missing glyphs and concepts, the spec measured from the whole set, the set's voice, the grid and its angles, size ranges, keylines, reused parts, open junctions and dot roles, the morph form, one skeleton, the lint, the shipped sheet, the project's icon API, font codepoints and icons beside real text |
| `ship` | Commits and their Conventional Commit messages, changesets, pushes, merges, pull requests per bug, releases, deploy checks |
| `prototype` | Labelled real-code variants of one idea, the cost of each, a bar that clears the work, replaying entrances, pruning after the pick and riffing on it |
| `lab` | Every state of real components forced open on one development page |
| `deconstruct` | Motion broken into named states, events and per-property tracks, the editable timeline |
| `alignment` | Measured edges, gaps, padding over gap, icon-side padding, ink centring, optical nudges, top alignment beside wrapping text, concentric radii and their floor, visual weight, the annotated report |
| `keyboard` | The keyboard-only walk, focus order, reach, visible stops, composite arrows, Escape, reaching toasts and leaving editors, focus after removal |
| `frames` | The throttled trace, traces on a real phone, frame and input budgets, layout and paint cost per frame, yielding long loops, inherited variables per frame, motion off the main thread, long lists, brief `will-change`, the before and after recording |
| `vitals` | The throttled cold load, the median of three loads, the load budgets, LCP priority, sized media, video over GIF, late shifts, subset WOFF2 fonts, offscreen `content-visibility`, long load tasks and the before and after recording |
| `invariants` | Flags that move together, implied state machines and impossible states, one status and one writer, unchecked assumptions, matching input and storage limits, where each rule is enforced |
| `avatar` | Character silhouettes, eyes on a sphere, whole-body idle life, moods as eye shapes, reactions to the page, the contact sheet |
| `bots` | The Grok round, picked Bots only, stripping private details, real copy links, the Bot marks, the physics pile, Bot cards and the org chart |
| `sketchbook` | Daily batches of live interaction tiles, the taste file, kept components, wildcards and a clip suggestion |
| `iconset` | The old set's audit, one icon per concept and its tags, the written voice, strokes picked beside the type, the seed set, the parts register and flat shipping, exploration rows, the migration map, the SVG contract and fixes at the source, the one build command and the generated catalogue |
| `stress` | The value map with sources and limits, worst-case data through the demo boundary, the development-only data switch, the case catalog, the real container width and the kept fixture |
| `animate` | Moments where content teleports, the frequency gate, the smallest motion that explains a change, the delight budget and the before and after clips |
| `audit` | Review scope, the project's own system, content as data, the pattern scan, running every skill, merging by root cause, the numbered report, the verdict and self-contained hand-off plans |

`reuse` owns the sweep that follows a fix moved into a shared component. `rule` owns the sweep that follows a new rule. `restraint` owns what to leave out of the interface. `motion` owns whether an animation exists and `restraint` owns deleting it cleanly. `copy` owns the words that stay in the interface and `prose` owns the words around it. `defaults` owns how the surfaces that stay behave, `motion` owns how they move and `color` owns how they read. `forms` owns how fields take input and `overlays` owns how layers open and close. `states` owns which states a screen shows and `invariants` owns which combinations the code can hold. `iconset` owns the decisions for a whole icon set and `icons` owns each glyph drawn into it. `audit` owns the shared severity ladder in `audit/report.md`, and every other skill uses the same three words.

## Authoring

A description change updates `README.md` in the same commit. A rename updates the directory, the frontmatter `name`, the rule id prefix and `display_name` in `agents/openai.yaml`.

Sentences stay at or under 30 words, counting a code span as one word. Before adding a sentence, check whether another skill already owns that rule.

Run `node scripts/check.mjs` before committing. It exits 1 on a broken convention above, a skill change with no version bump or kit drift.
