---
name: animate
description: Finds where content teleports between states and adds the smallest motion that explains each change, gated by how often it happens.
disable-model-invocation: true
---

# Animate

This skill finds where an interface changes with no motion and adds it. It lists each moment content teleports, drops the frequent ones and builds the smallest motion that shows where things went.

## Motion that explains, never decorates

Each motion added answers one question: where did this come from, where did it go or what changed. A motion that answers none is a finding. The frequency gates in step 2 are exact. Run it when the user asks for motion or polish on a flow.

Every easing, duration, spring and stagger value belongs to `motion`, and a break there cites its id. Whether the motion holds its frame budget belongs to `frames`. Taking an existing motion apart belongs to `deconstruct`. Opening the running result belongs to `verify`.

## 1. Find the teleports

Walk the flow in the running app. List each moment where content jumps between two states with nothing between them, with what jumps and what triggered it.

Look for siblings that jump when an item is added, removed or reordered, and a panel that changes size in one frame. Look for an element that appears with no link to the control that opened it. Look for content swapped in place, such as a tab panel or a count, and an item that moves between two places.

Then search the code for what the walk missed. Teleports start at `{open && <`, at `hidden` or `display: none` toggled by state and at a `key` changed to swap content. They also start at a list `.map(` whose items are added or removed.

```
1. Delete a row: the rows below jump up 56px. Row menu.
2. Open filters: the panel appears full height in one frame. Toolbar button.
3. Archive the last item: the list swaps to the empty state at once. Row menu.
```

Motion added before this list exists, such as a fade on every card, is `animate-find-teleports`.

## 2. Gate by frequency

Write beside each moment how often a regular user triggers it in a day. Strike every moment over 100 a day, and every moment started by typing, a shortcut or keyboard navigation. A motion left on a struck moment cites `motion-no-motion-on-repeat`. Moments from 10 to 100 a day get functional motion only, and moments under 10 a day may also take delight. A moment built with no frequency beside it is `animate-gate-by-frequency`. Take counts from the project's analytics where it has them, and mark every other count as an estimate.

## 3. Explain the change

Pick the smallest motion that shows what happened. An element opened by a control grows from that control. Siblings of an added, removed or reordered item move to their new places as a layout animation. A container that changes size animates its size. Content swapped in place cross-fades. An item that moves between two places travels there as one shared element. A slide, bounce or flip where a cross-fade explains the swap is `animate-explain-the-change`.

| Change | With a motion library | In CSS |
| --- | --- | --- | --- |
| Opened by a control | `initial` and `animate`, with `transformOrigin` at the trigger | `@starting-style` on the open state, with `transform-origin` at the trigger |
| Siblings of an added, removed or reordered item | `layout` on each item | `view-transition-name: match-element` on each item, the change inside `startViewTransition()` |
| A container changes size | The outer node animated to the inner node's measured size | `interpolate-size: allow-keywords` and `block-size: auto` |
| Content swapped in place | `AnimatePresence mode="popLayout"`, keyed by the content | Both layers in one grid cell, `opacity` transitioned |
| An item moves between two places | One `layoutId` on both | One `view-transition-name` on both |
| Page to page in a multi-page site | None | `@view-transition { navigation: auto; }` on both pages |

Each technique's values and limits sit in `motion`, including where `match-element` and `interpolate-size` fall short.

## 4. Spend the delight budget

A flow gets at most one delight moment, only where the gate allows it, such as a first project created or an inbox cleared. Delight sits on top of the functional motion, such as a checkmark that draws itself. Delight on a routine save, or on two moments in one flow, is `animate-delight-budget`. A scroll reveal or an idle loop is never the delight, and cites `motion-no-scroll-reveals` or `motion-no-idle-loops`.

## 5. Build it

Build each motion with the animation library the project already uses, or with CSS transitions when it has none. A second animation library cites `reuse-one-library-per-job`. Take every value from `motion`, reduced motion included, and the project's motion tokens where they exist.

## 6. Show before and after

Record each built moment in the running app before and after the change, at full speed and at 0.25× playback. Report the list from step 1 with each moment marked built, struck or left as it was, and why. "Added motion to the list" with no recording is `animate-before-and-after`.

Record each moment once more with `prefers-reduced-motion: reduce` emulated, through the browser's rendering settings or `Emulation.setEmulatedMedia`. Check that clip against the reduced motion rule in `motion`. Clips with no reduced motion pass are `animate-reduced-motion-clip`.

Trigger each moment twice within 100ms, and reverse it halfway through. The motion picks up from where it is, with no jump back and no queued replay. A moment only ever triggered once from rest is `animate-interrupt-check`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `animate-find-teleports` | A fade added to every card unasked | A list of moments, each with what jumps and its trigger | `MEDIUM` |
| `animate-gate-by-frequency` | Motion on row hover with no count beside it | "Row hover: about 300 a day, struck" | `LOW` |
| `animate-explain-the-change` | Tab content sliding in with a bounce | The panel cross-fading while the tab indicator moves to the new tab | `MEDIUM` |
| `animate-delight-budget` | Confetti on every save | One drawn checkmark when the first project is created | `MEDIUM` |
| `animate-before-and-after` | "Added motion to the list" | Clips of the row delete before and after, at 1× and 0.25× | `HIGH` |
| `animate-reduced-motion-clip` | Clips at 1× and 0.25× only | A third clip of each moment with `prefers-reduced-motion: reduce` emulated | `MEDIUM` |
| `animate-interrupt-check` | Each moment triggered once from rest | The filter panel closed halfway open, and the delete pressed twice within 100ms | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. A motion left on a struck moment is `HIGH` here, whatever its level in `motion`.

**Format.** One finding per root cause, naming the moment and its frequency:

```
1. file:line - [rule-id] moment, about N a day, what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark each moment you could not trigger in the running app as `Not verified`.
