---
name: prose
description: Writes posts and breakdowns that open on where the author stands, show the options that lost, give exact numbers and mark every guess as a guess.
---

# Prose

This skill writes and reviews long-form text: posts, breakdowns, case studies and design notes. It explains each decision through the problem it solved and the options it beat, in plain sentences told by the person who did the work.

## Evidence is strict, the voice is the author's

Evidence rules hold in every piece: no invented experience, guesses marked, exact values with their baseline, sources, dated claims and the options that lost. Breaking one is a finding every time.

Voice rules are defaults: person, tense, spelling and aside length. They shape a piece written from nothing and yield to the author's draft and locale.

Em dashes and ellipses in a post follow the draft and the project's convention. With neither, a comma, a colon or brackets stand in for the em dash. Interface text belongs to `copy` and commit messages to `ship`.

## Open on where you stand

The first paragraph says what the piece is about, whether the author built, rebuilt, uses or noticed it, and the problem it answers. A contents list, "In this post I'll cover" or a feature tour as the opener is `prose-open-with-context`.

Headings state the point of what follows, so they alone read as a summary. "Under the hood" is `prose-plain-headings`.

## The author is in the piece

"I" covers the author's own work and "we" a team's. A breakdown nobody seems to have written is `prose-first-person`.

Process is told in the past tense as what the author did: I'd record the screen and rebuild it beside the recording. Present-tense advice with no account of doing it is `prose-tell-what-happened`.

"You" is for a reader about to act, such as trying a demo, and a run of instructions to the reader is `prose-fewer-you`.

Own work that claims no limits, rather than naming one in passing without apology, is `prose-admit-the-limits`.

## Each decision names what it beat

State the choice, then at least one option considered and why it lost. "The highlight is an inset pill" with nothing beside it is `prose-show-the-alternatives`.

The reason is what the choice does for the person using it. "This makes it feel snappy" is `prose-reason-for-the-person`.

## Numbers with both ends

Where a value exists, write it, and a change gives both ends so the reader can judge its size. "A really fast spring" or "The bundle shrank by 40%" alone is `prose-specifics`.

Seamless, robust, powerful, blazing, delightful, effortless, game-changing, supercharge and unlock are `prose-no-hype`.

## Every fact says how you know

Each fact says where it came from, such as measured or read in the source. A value with no method is `prose-say-how-you-know`. Someone else's claim carries a footnote linking the original, and "Navigation got 30% faster" with no link is `prose-cite-claims`.

A claim that will age, such as browser support or anything called new, carries its version or month. "The latest Safari supports it" is `prose-date-the-claims`.

An inference reads as one: "I think", "my guess is", "the way I read it". A motive stated as fact is `prose-mark-the-guess`. A measured fact wrapped in "I believe" is `prose-no-hedged-facts`.

Writing for someone else, add no anecdote, feeling, attempt or limit they did not describe, and ask for the real moment instead. "At first I wondered why" is `prose-no-invented-experience`.

## Sentences carry their reasons

A fact and its consequence share a sentence, joined by so, but or because. A reason left for the next sentence is `prose-link-the-reason`.

A run of fragments for emphasis is `prose-no-fragment-runs`.

## Four items in a sentence, five in a list

Up to four items run inside one sentence after a colon, and five or more go in a list, table or figure. A row of fragments standing in for a short list is `prose-list-in-the-sentence`. Five shortcuts strung through one paragraph is `prose-show-the-shape`.

An item that needs explaining carries its gloss in brackets: spacing (a scale someone chose and stuck to). Glosses split into separate sentences are `prose-gloss-in-brackets`.

## Nothing is easy for the reader

Simply, just, easy, obviously, clearly and basically tell a stuck reader the fault is theirs, though "just once" stays. "Simply wrap it in a provider" is `prose-no-simply`.

"It's worth noting", "Let's dive in", "Here's the thing" and "Not just X, but Y" are `prose-no-filler`.

## Asides sit in brackets or footnotes

An aside, such as an admission or a joke, sits in brackets by default, under 15 words and once a section. A longer one, or a caveat that breaks the main line, moves to a footnote. An aside carrying the argument, a second in one section or a long caveat left inline is `prose-asides`.

## Edit the words, keep the voice

Fix spelling, grammar and order in the author's draft. Rewriting their register into yours is `prose-keep-the-voice`.

An unfamiliar abbreviation is spelled out once, as in Interaction to Next Paint (INP), though API, URL, CSS and units need none. A bare "INP" never spelled out is `prose-define-terms`.

Spelling follows the draft and the author's locale, British when there is neither: colour, behaviour, centre, grey, customise and judgement. Code, API names, interface labels and quoted titles keep their own. "Color" in a piece with no American draft behind it is `prose-british-spelling`.

## Code and captions show what matters

A code block holds the lines the paragraph is about, 20 at most, cuts marked `// ...` and the full file linked. A 120-line component pasted to show one prop is `prose-trim-the-code`.

A caption says what happens in its demo, in order, in two sentences at most. One that states the lesson or runs to three sentences is `prose-caption-the-action`.

## End modestly

The last line says what the work does for now or what is next. A punchline, an aphorism or a summary of the headings is `prose-modest-ending`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `prose-open-with-context` | `In this post I'll cover anatomy, motion and keys.` | `I rebuilt a command menu I open a hundred times a day.` | `MEDIUM` |
| `prose-plain-headings` | `## Under the hood` | `## Rows never measure themselves` | `LOW` |
| `prose-first-person` | `The menu was rebuilt from inspect element and the source.` | `I rebuilt the menu from inspect element and the source.` | `LOW` |
| `prose-tell-what-happened` | `Record it, then rebuild it beside the recording.` | `I'd record it, then rebuild it beside the recording.` | `LOW` |
| `prose-fewer-you` | `You open the menu. You watch it grow.` | `The menu grows from the button that opened it.` | `LOW` |
| `prose-show-the-alternatives` | `The highlight is an inset pill.` | `A full-width stripe reads like a table, so the highlight is an inset pill.` | `MEDIUM` |
| `prose-reason-for-the-person` | `This makes it feel snappy.` | `The height moves on the same keystroke that changed the list.` | `MEDIUM` |
| `prose-specifics` | `A really fast spring`, or `The bundle shrank by 40%.` | `A stiffness of 20000`, or `The bundle went from 210 KB to 126 KB.` | `MEDIUM` |
| `prose-no-hype` | `A seamless, powerful menu` | `A menu that never makes you wait` | `MEDIUM` |
| `prose-say-how-you-know` | `The spring has a stiffness of 20000.` | `The spring has a stiffness of 20000, the number in their code.` | `MEDIUM` |
| `prose-cite-claims` | `Navigation got 30% faster.` | `Navigation got 30% faster.[^1]` with the source linked | `HIGH` |
| `prose-date-the-claims` | `The latest Safari supports it.` | `Safari 18.4 supports it, as of April 2025.` | `MEDIUM` |
| `prose-mark-the-guess` | `They did this to stop the highlight flickering.` | `I think they did this to stop the highlight flickering.` | `HIGH` |
| `prose-no-hedged-facts` | `I believe rows are 46 tall.` | `Rows are 46 tall.` | `LOW` |
| `prose-no-invented-experience` | `At first I wondered why there's no bounce.` | `Why no bounce at all?` | `HIGH` |
| `prose-link-the-reason` | `Rows have fixed heights. The frame never measures itself.` | `Rows have fixed heights, so the frame never has to measure itself.` | `LOW` |
| `prose-no-fragment-runs` | `The page works. You don't want to stay.` | `The page works, but nobody wants to stay on it.` | `LOW` |
| `prose-list-in-the-sentence` | `Spacing that's off. A hover that scales.` | `What it misses is small: spacing that's off and a hover that scales.` | `LOW` |
| `prose-show-the-shape` | Five shortcuts in one paragraph | A keymap table | `LOW` |
| `prose-gloss-in-brackets` | `There's a spacing scale. Someone stuck to it.` | `Under it sits spacing (a scale someone stuck to).` | `LOW` |
| `prose-no-simply` | `Simply wrap it in a provider.` | `Wrap it in a provider.` | `LOW` |
| `prose-no-filler` | `It's worth noting that rows are 46 tall.` | `Rows are 46 tall.` | `MEDIUM` |
| `prose-admit-the-limits` | A rebuild that claims to match the original | `My version only covers part of it.` | `MEDIUM` |
| `prose-asides` | `The list is pinned to the top, though at first it was centred and that moved every card.` | `The list is pinned to the top.[^1]` | `LOW` |
| `prose-define-terms` | `INP dropped to 90 ms.`, never spelled out | `Interaction to Next Paint (INP) dropped to 90 ms.` | `LOW` |
| `prose-british-spelling` | `The color fades from the center.` with no draft | `The colour fades from the centre.` | `LOW` |
| `prose-keep-the-voice` | `I thought I might try my hand` rewritten as `This project explores` | `I thought I'd try my hand` | `MEDIUM` |
| `prose-trim-the-code` | A 120-line component pasted to show one prop | The 6 lines that set it, cuts marked `// ...`, the file linked | `LOW` |
| `prose-caption-the-action` | `The second version has fewer things in it.`, or four sentences | `The card loses its gradient and the button answers a press.` | `LOW` |
| `prose-modest-ending` | `The best tool is one you forget is there.` | `It's the kind of software I try to build.` | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. A voice rule is never a finding against the author's own draft.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
