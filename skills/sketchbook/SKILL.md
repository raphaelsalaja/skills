---
name: sketchbook
description: Generates a daily batch of interaction experiments in the project's own stack as live tiles you keep or kill, learning your taste with every batch.
disable-model-invocation: true
---

# Sketchbook

This skill generates a fresh batch of small interaction experiments in the project's own stack. The user keeps or kills each live tile, so the next batch leans further toward what they kept.

## Counts and the stack are exact

Each run is a new batch of 6–9 live experiments. Of those, 1 or 2 sit outside the current taste. The gallery is temporary and uses the project's own framework, styling, animation library, tokens and fonts.

Use it when the user says "sketchbook", "inspire me", "give me interaction ideas" or "daily interactions".

Easing, durations, springs and reduced motion belong to `motion`. Tile names and the one-line note belong to `copy`. Surfaces belong to `defaults`, and contrast belongs to `color`. Reaching for an existing component before a new one belongs to `reuse`. Collecting outside references belongs to `gather`. Variants of one idea belong to `prototype`. Forcing every state of a component open belongs to `lab`.

## 1. Read the project

Read the framework, the styling, the animation library, the tokens and the fonts. A batch started before that read is `sketchbook-read-the-stack`.

## 2. Read the taste file

Taste is personal, so it never enters the repository. Keep `sketchbook/taste.md` in the user's own agent store when one exists, since taste carries across projects.

Without one, use a `sketchbook/` folder in the project and add `sketchbook/` to `.git/info/exclude` before writing anything. `git check-ignore sketchbook/taste.md` confirms it. Taste or kept tiles showing in `git status` is `sketchbook-taste-stays-personal`.

Read the taste file before choosing the batch. When the summary exists, the next batch leans further toward the kept tiles. A batch that ignores a file already there is `sketchbook-read-taste`.

When the file is missing, ask one round before building. Ask for 1–3 interactions or products whose feel the user likes, one they dislike and why for each. Offer "None" so the question never blocks. Add a multi-select of the ten kinds in step 3, plus "Surprise me".

Read each answer for what it does, never by its name, so "the toggle in my notes app" becomes "Easing: springs, bounce under 0.2". Write the answers into a new taste file as its first Summary, each dislike as a "no" on its line. A first batch built with no question asked is `sketchbook-ask-on-first-run`.

Skip any interaction already listed under Kept or Killed. A repeat is `sketchbook-never-repeat`.

## 3. Generate the batch

Write 6–9 small interactions. Each one is a hover, toggle, press, reveal, drag, scroll, cursor, text, loader or transition. A count outside 6–9 is `sketchbook-batch-size`.

Build each one with the framework, styling, animation library, tokens and fonts just read. A mock-up or a second stack is `sketchbook-real-stack`.

A first batch spreads across at least 4 of those kinds, starting with the ones the user picked. Nine hovers on a first run is `sketchbook-spread-the-first-batch`.

Include 1 or 2 experiments that sit outside the taste summary. Those 1 or 2 keep the batch from settling on one style. With no taste yet, those 1 or 2 differ in kind from the rest. A count other than 1 or 2 is `sketchbook-wildcards`.

Tag each wildcard `Wildcard` on its tile. A killed wildcard then reads as a missed stretch, not a step away from what the user likes. An unmarked wildcard is `sketchbook-mark-the-wildcards`.

## 4. Show one gallery

Put this batch alone on `/sketchbook` as a grid of live playable tiles. A static sheet, a route per experiment or a second batch on the page is `sketchbook-one-gallery`.

Gate the route to development when you build it, such as rendering not found unless `process.env.NODE_ENV === "development"` or `import.meta.env.DEV`. A gallery a production build can reach is `sketchbook-dev-only`.

Give each tile a Title Case name, a one-line note and Keep and Kill controls. Names and the note follow `copy`. Each control takes an optional one-line reason. A tile with no choice is `sketchbook-keep-or-kill`.

Choices survive a reload through `localStorage`. A Copy Choices button copies every choice so far as lines such as `Kill Cursor Trail: too busy`, for the user to paste back.

A tile whose motion runs once, such as a loader, an entrance or a transition, gets a Replay control that remounts it. A one-shot tile seen only on load is `sketchbook-replay-the-tile`.

## 5. Open it

Start the dev server, open `/sketchbook` and play every tile once. A path in the reply with nothing opened is `sketchbook-open-it`.

## 6. Read the choice

The user answers by pasting Copy Choices or in their own words.

A lukewarm reply, such as "it's fine", "maybe" or "cool I guess", is neither Keep nor Kill. Ask what would make it a keep, then change the one property the answer points at, such as speed, easing, size or colour. Replay it in the gallery. Recording a shrug as a choice is `sketchbook-lukewarm-is-not-a-keep`.

Killed lines carry the user's own reason, and Kept lines carry one when given. When a Kill comes with none, ask once with likely reasons as options: too slow, too busy, seen it, wrong feel or broken. When the user skips it, write `no reason given`. A reason the agent supplied is `sketchbook-reason-from-the-user`.

When the user kills every tile or says none land, ask which came closest and what was off. Write the answer into the Summary before building again. A fresh batch after "none of these", with no new reason, is `sketchbook-no-blind-batch`.

## 7. Save the choice

When the user keeps or kills a tile, update the taste file in the same turn. The file has three headings, Kept, Killed and Summary, in this shape:

```md
# Taste

## Kept

- Soft Press: the settle after release

## Killed

- Cursor Trail: too busy

## Summary

- Easing: springs, bounce under 0.2
- Speed: 150–250ms, nothing over 300ms
- Density: one moving part per tile
- Playfulness: small surprises on release, no idle loops
- Colour: the accent only on the part that moves
```

The summary covers easing, speed, density, playfulness and colour use. Rewrite it so the next batch leans further toward the kept tiles. A missing update or any other shape is `sketchbook-save-the-taste`.

Write each summary line as values, such as "springs, bounce under 0.2". "Playful but refined" steers nothing, and a summary of adjectives is `sketchbook-taste-in-values`.

Move a kept experiment to the excluded `sketchbook/kept/` folder as a clean reusable component, with the gallery chrome removed. Moving it into the app is the user's call. A kept tile left only on the route is `sketchbook-keep-the-component`.

Delete a killed experiment. Only its name and reason stay in the taste file. Code left behind after Kill is `sketchbook-delete-the-killed`.

When every tile has a choice, delete the `/sketchbook` route. A gallery left after the batch is sorted is `sketchbook-remove-the-gallery`.

## 8. Suggest a clip

Name which kept tiles are worth a clip and give one line on why. When none were kept, say so. Ending the review with no suggestion is `sketchbook-suggest-a-clip`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `sketchbook-read-the-stack` | A batch written before the project is read | Framework, styling, animation library, tokens and fonts read first | `MEDIUM` |
| `sketchbook-taste-stays-personal` | `sketchbook/taste.md` committed with the feature | The taste file in the user's agent store, or `sketchbook/` in `.git/info/exclude` | `MEDIUM` |
| `sketchbook-read-taste` | A second batch with `sketchbook/taste.md` unread | The summary read and the batch steered by it | `MEDIUM` |
| `sketchbook-ask-on-first-run` | A first batch built with no question | "Which interactions feel right to you, and which don't?", then the kinds to try | `MEDIUM` |
| `sketchbook-never-repeat` | "Press Scale" again after it was killed | A new interaction, the old name left in the file | `MEDIUM` |
| `sketchbook-batch-size` | 4 tiles | 6–9 tiles | `MEDIUM` |
| `sketchbook-real-stack` | A PNG standing in for a hover | The hover built in the project's stack | `HIGH` |
| `sketchbook-spread-the-first-batch` | Nine hovers on a first run | Hovers, a toggle, a drag, a loader and a text effect | `LOW` |
| `sketchbook-wildcards` | 9 tiles, all inside the current taste | 7 in taste and 2 outside it | `MEDIUM` |
| `sketchbook-mark-the-wildcards` | A wildcard that looks like every other tile | `Wildcard` on its tile | `LOW` |
| `sketchbook-one-gallery` | 8 routes, one per experiment | One `/sketchbook` grid of live tiles | `MEDIUM` |
| `sketchbook-dev-only` | `/sketchbook` served by the production build | The route rendering not found outside development | `HIGH` |
| `sketchbook-keep-or-kill` | A tile with no choice | `Soft Press`, one note, Keep and Kill | `MEDIUM` |
| `sketchbook-replay-the-tile` | A loader seen once on load | A Replay control that remounts it | `LOW` |
| `sketchbook-open-it` | "Built at `/sketchbook`" | The gallery opened, every tile played | `LOW` |
| `sketchbook-lukewarm-is-not-a-keep` | "It's fine" saved under Kept | "What would make it a keep?", then one property changed and replayed | `MEDIUM` |
| `sketchbook-reason-from-the-user` | `Cursor Trail: probably too much`, written by the agent | `Cursor Trail: too busy`, in the user's words | `MEDIUM` |
| `sketchbook-no-blind-batch` | "None of these" answered with nine new guesses | "Which came closest, and what was off?", asked first | `MEDIUM` |
| `sketchbook-save-the-taste` | "You kept Soft Press" only in the reply | Soft Press under Kept, with the summary updated | `MEDIUM` |
| `sketchbook-taste-in-values` | `Summary: playful but refined` | `Easing: springs, bounce under 0.2` | `MEDIUM` |
| `sketchbook-keep-the-component` | Soft Press left inline on the gallery route | `sketchbook/kept/SoftPress`, gallery chrome removed | `HIGH` |
| `sketchbook-delete-the-killed` | Cursor Trail commented out in the gallery | The code deleted, the name and reason kept in taste | `MEDIUM` |
| `sketchbook-remove-the-gallery` | `/sketchbook` still routed after every choice | The route deleted, kept components still in `sketchbook/kept/` | `MEDIUM` |
| `sketchbook-suggest-a-clip` | The batch ends with no next step | "Record Soft Press. The settle is worth a clip." | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every tile you could not play as `Not verified`.
