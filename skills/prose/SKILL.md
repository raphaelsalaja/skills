---
name: prose
description: Writes posts and breakdowns that open on where the author stands, show the options that lost, give exact numbers and mark every guess as a guess.
---

# Prose

This skill writes and reviews long-form text: posts, breakdowns, case studies and design notes. It explains each decision through the problem it solved and the options it beat, in plain sentences told by the person who did the work.

## Facts are exact, the voice is the author's

A guess stated as fact, an uncited claim and an experience the author never described are findings every time. Style rules bend to the author's draft. Their tense and register stay, and so does their choice of I or we.

Interface labels, em dashes and ellipses belong to `copy`. Commit messages belong to `ship`.

## Open on where you stand

The first paragraph says what the piece is about and where the author stands: they built it, rebuilt it, use it or noticed it. The problem it answers arrives by the end of that paragraph. A line on what the piece isn't is welcome.

A contents list, "In this post I'll cover" or a feature tour as the opener is `prose-open-with-context`.

## Tell it in the first person

The author is in the piece. "I" covers their own work and "we" a team's, saying what they built, tried, saw and dropped. A breakdown nobody seems to have written is `prose-first-person`.

## Each decision names what it beat

State the choice, then at least one option that was considered and why it lost. "The highlight is an inset pill" with nothing beside it is `prose-show-the-alternatives`.

The reason is what the choice does for the person using it. "This makes it feel snappy" is `prose-reason-for-the-person`.

## Numbers, not adjectives

Where a value exists, write the value. "A really fast spring" is `prose-specifics`. Words like seamless, robust, powerful, blazing and delightful are `prose-no-hype`.

## Plain declarative sentences

One idea per sentence, at most 30 words. Split anything longer. That is `prose-short-sentences`.

Delete throat-clearing such as "It's worth noting", "Let's dive in" and "Not just X, but Y". That is `prose-no-filler`.

## Asides sit in brackets

An aside steps out of the argument for a moment: an admission, a credit or a joke. It sits in brackets, runs under 15 words and appears at most once a section.

An aside that carries the argument, or a second aside in one section, is `prose-asides`.

## Footnotes hold asides as well as sources

A footnote can carry a personal aside: the caveat, the attempt that failed, the story behind a number. A caveat that breaks the main line moves to a footnote. Leaving it inline is `prose-footnote-the-caveat`.

## Say how you know

Each fact says where it came from: inspected, measured, read in the source or quoted. A value with no method is `prose-say-how-you-know`.

A claim from someone else carries a footnote linking the original. "Navigation got 30% faster" with no link is `prose-cite-claims`.

## Mark guesses as guesses

An inference reads as one: "I think", "my guess is", "the way I read it". A motive stated as fact is `prose-mark-the-guess`. A measured fact wrapped in "I believe" is `prose-no-hedged-facts`.

## Never invent the author's experience

Writing for someone else, add no anecdote, feeling or attempt they did not describe. That covers asides and footnote stories too. "At first I wondered why" is `prose-no-invented-experience`. Ask for the real moment or leave the line out.

## Edit the words, keep the voice

Fix spelling, grammar and order in the author's draft. Rewriting their register into yours is `prose-keep-the-voice`.

## Spelling is British

Running text uses British spelling: colour, behaviour, centre, grey, favourite, customise, recognise, organise and judgement. Code, CSS and API names, interface labels and quoted titles keep their own spelling. "Color" in a sentence is `prose-british-spelling`.

## Show what has shape

A sequence, a comparison or a set of values goes in a list, table or figure. Five shortcuts strung through one paragraph is `prose-show-the-shape`.

## End on the principle

Close each section on the rule its details point to, in one sentence. A closing paragraph that repeats the headings is `prose-end-on-the-principle`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `prose-open-with-context` | `In this post I'll cover anatomy, motion and keys.` | `I rebuilt a command menu I open a hundred times a day. This isn't a tutorial. It's what I found taking it apart.` |
| `prose-first-person` | `The menu was rebuilt from inspect element and the source.` | `I rebuilt the menu from inspect element and the source.` |
| `prose-show-the-alternatives` | `The highlight is an inset pill.` | `A full-width stripe reads like a table. An inset pill reads like something you hold.` |
| `prose-reason-for-the-person` | `This makes it feel snappy.` | `The height moves on the same keystroke that changed the list.` |
| `prose-specifics` | `A really fast spring` | `A stiffness of 20000, settled in about a tenth of a second` |
| `prose-no-hype` | `A seamless, powerful menu` | `A menu that never makes you wait` |
| `prose-short-sentences` | One 45-word sentence | Two sentences under 30 words |
| `prose-no-filler` | `It's worth noting that rows are 46 tall.` | `Rows are 46 tall.` |
| `prose-asides` | `Note that this is not a criticism of the team that built it.` | `(Not a knock on the team, who ship careful work.)` |
| `prose-footnote-the-caveat` | `The list is pinned to the top, though at first it was centred and that moved every card.` | `The list is pinned to the top.[^1]` with the centred version in the footnote |
| `prose-say-how-you-know` | `The spring has a stiffness of 20000.` | `The spring has a stiffness of 20000, the number in their code.` |
| `prose-cite-claims` | `Navigation got 30% faster.` | `Navigation got 30% faster.[^1]` with the source linked |
| `prose-mark-the-guess` | `They did this to stop the highlight flickering.` | `I think they did this to stop the highlight flickering.` |
| `prose-no-hedged-facts` | `I believe rows are 46 tall.` | `Rows are 46 tall.` |
| `prose-no-invented-experience` | `At first I wondered why there's no bounce.` | `Why no bounce at all?` |
| `prose-keep-the-voice` | `I thought I might try my hand` rewritten as `This project explores` | `I thought I'd try my hand` |
| `prose-british-spelling` | `The color fades from the center.` | `The colour fades from the centre.` |
| `prose-show-the-shape` | Five shortcuts in one paragraph | A keymap table |
| `prose-end-on-the-principle` | `In summary, we covered anatomy, motion and keys.` | `Focus never leaves what you're typing.` |

## Reporting

**Severity.** `HIGH` is an invented experience, a guess stated as fact or an uncited claim. `MEDIUM` is a decision with no alternative, an adjective where a number exists, hype or filler. It is also an opener with no context, a breakdown with nobody in it or a rewritten voice. `LOW` is a long sentence, an American spelling, an inline caveat, a misused aside, prose that should be a table or a summary ending.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
