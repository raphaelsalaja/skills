---
name: copy
description: Writes interface labels in Title Case, short and plain, with one-line descriptions and no em dashes.
---

# Copy

This skill writes and reviews the words inside an interface. It covers labels, descriptions, status text and the punctuation they use.

## Casing and punctuation are exact

A label in sentence case is a finding. An em dash is a finding. A label that could lose a word is a finding only when the shorter label still says what happens.

Extra interface beyond the words belongs to `restraint`. Which state a message appears in, such as filtered to zero, belongs to `states`.

## Labels take Title Case

Buttons, menu items, tabs, headings and setting names use Title Case. Short articles, conjunctions and prepositions stay lowercase unless they come first. "Add to library" is `copy-title-case`.

## As few words as still say what happens

"Start Download" on a download screen is `copy-fewest-words`. Show a number on its own when the context already names the noun. "12 items" is `copy-number-not-noun`.

## Buttons start with the verb

A button names what it does, starting with the verb. "OK", "Yes" or "Let's Go" on an action with consequences is `copy-verb-first`.

A confirm button repeats the action from its question, so "Delete Project" answers "Delete this project?" without reading the body. "Yes" there is `copy-confirm-names-the-action`.

## Errors say what to do

An error says how to fix the problem in plain words, with no blame and no exclamation mark. "Invalid name" or "Oops! Something went wrong." is `copy-errors-say-the-fix`.

## Links make sense alone

Link text says where it goes, so it still reads in a list of every link on the page. "Click here", or two "Learn More" links on one page, is `copy-link-text`.

## Toggles name the on state

A switch or checkbox label says what happens when it is on. "Don't Send Read Receipts" is `copy-toggle-on-state`.

## Sentences stay whole

A sentence holding a value is one translatable string with a placeholder. Joining fragments around the value is `copy-whole-sentences`.

## Plain names, never ids

An internal acronym or an invented persona is `copy-plain-words`. Show a thing's display name, not its id. `instagram_graph` in a select is `copy-display-names`.

## One line of description or none

Move any detail into a tooltip. Two lines under a setting is `copy-one-line-description`.

## Status matches the moment

"Searched" while the search still runs is `copy-state-tense`.

## No em dashes, no ellipses

Use a comma or a full stop where an em dash would go. That is `copy-no-em-dash`. Use no ellipsis except in a search placeholder. "Loading..." is `copy-no-ellipsis`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `copy-title-case` | `Add to library` | `Add to Library` |
| `copy-fewest-words` | `Start Download` on the download screen | `Start` |
| `copy-number-not-noun` | `12 items` | `12` |
| `copy-verb-first` | `OK` on a save dialog | `Save` |
| `copy-confirm-names-the-action` | `Yes` under "Delete this project?" | `Delete Project` |
| `copy-errors-say-the-fix` | `Oops! Something went wrong.` | `Couldn't save. Check your connection and try again.` |
| `copy-link-text` | Two `Learn More` links on one page | `Learn More About Exports` |
| `copy-toggle-on-state` | `Don't Send Read Receipts` | `Send Read Receipts` |
| `copy-whole-sentences` | `"You have " + count + " new messages"` | `t("inbox.new", { count })` holding the whole sentence |
| `copy-plain-words` | `PDP` | `Product Page` |
| `copy-display-names` | `instagram_graph` | `Instagram` |
| `copy-one-line-description` | Two lines under a setting | One line, the rest in a tooltip |
| `copy-state-tense` | `Searched` while running | `Searching`, then `Searched` |
| `copy-no-em-dash` | `Synced &mdash; 2 minutes ago` | `Synced 2 minutes ago` |
| `copy-no-ellipsis` | `Loading...` | `Loading` |

## Reporting

**Severity.** `HIGH` is an id or internal jargon shown to the user, or a status that says the wrong thing. It is also a confirm button that does not name its action. `MEDIUM` is a label in the wrong case, a two-line description or an em dash. It is also a button with no verb, an error with no fix, a link that means nothing alone, a negative toggle or a sentence joined from fragments. `LOW` is a label one word longer than it needs.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
