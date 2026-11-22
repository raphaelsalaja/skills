---
name: copy
description: Writes interface labels, errors, confirm dialogs and statuses, short and plain, in the project's casing or Title Case when it has none.
---

# Copy

This skill writes and reviews the words inside an interface. It covers labels, placeholders, descriptions, errors, status text and the punctuation they use.

## Casing follows the project, Title Case by default

Match the casing the project's interface already uses. Title Case applies only when the project has none, and then a sentence-case label is a finding. Em dashes and ellipses work the same way: the project's convention first, the bans below when it has none.

These rules cover interface text. A label that could lose a word is a finding only when the shorter label still says what happens.

Extra interface beyond the words belongs to `restraint`. Which state a message appears in, such as filtered to zero, belongs to `states`. Where a field error sits and how it ties to its field belong to `forms`.

## Labels take Title Case

In a project with no casing of its own, buttons, menu items, tabs, headings and setting names use Title Case. Articles, coordinating conjunctions and prepositions of three letters or fewer stay lowercase unless first or last. That is a, an, the, and, but, or, nor, for, so, yet, as, at, by, in, of, off, on, per, to and via.

A particle that belongs to a phrasal verb takes a capital, as in `Log In`, `Turn Off` and `Back Up`, while `to` in `Add to Library` stays lowercase. Prepositions of four letters or more, such as With and From, take a capital, and so do short verbs and pronouns such as Is and It. "Add to library", "Import from CSV" or a label off the project's own casing is `copy-title-case`.

## Verbs keep their space

A two-word verb stays two words on a button: `Log In`, `Sign Up`, `Set Up`, `Check Out` and `Back Up`. The joined form is the noun, as in `Login Settings` or `Setup Guide`. Write `Log In to the Dashboard`, never `Log Into`. `Login` or `Setup` on a button is `copy-phrasal-verbs`.

## As few words as still say what happens

"Start Download" on a download screen is `copy-fewest-words`. Show a number on its own when the context already names the noun. "12 items" is `copy-number-not-noun`.

## The key word comes first

In navigation, settings lists and headings, the first two words carry the meaning, and siblings never open on the same word. Buttons keep their verb first. `Manage Users`, `Manage Billing` and `Manage Teams` in one menu is `copy-key-word-first`.

## Buttons start with the verb

A button names what it does, starting with the verb. "OK", "Yes" or "Let's Go" on an action with consequences is `copy-verb-first`.

A confirm button repeats the action from its question, so "Delete Project" answers "Delete this project?" without reading the body. "Yes" there is `copy-confirm-names-the-action`.

The confirm dialog's body names the object and what goes with it: "Delete Q3 Roadmap and its 12 files?" A body reading "Are you sure?" is `copy-confirm-names-the-target`.

The last step of a stepped flow names what it does, such as `Create Workspace`, while earlier steps may read `Next`. `Next` on the step that creates the workspace is `copy-last-step-names-action`.

## Errors say what to do

An error says how to fix the problem in plain words, with no blame and no exclamation mark. "Invalid name" or "Oops! Something went wrong." is `copy-errors-say-the-fix`.

A field error is a sentence in sentence case, an instruction to the user that reuses the label's words. Empty reads "Enter your full name", too long reads "Summary must be 400 characters or less" and a wrong format reads "Enter a date like 11 Oct 2026". "Please", "sorry", "oops", "valid", "invalid" and "you forgot" never appear, so "Please enter a valid name" is `copy-error-by-kind`.

## Links make sense alone

Link text says where it goes, so it still reads in a list of every link on the page. "Click here", or two "Learn More" links on one page, is `copy-link-text`.

## Instructions name the control

An instruction names the control, never only its shape, colour, position or sound. "Click the green button on the right" is `copy-not-by-place`.

## Toggles name the on state

A switch or checkbox label says what happens when it is on. "Don't Send Read Receipts" is `copy-toggle-on-state`.

## Sentences stay whole

A sentence holding a value is one translatable string with a placeholder. Joining fragments around the value is `copy-whole-sentences`.

## Plain names, never ids

An internal acronym or an invented persona is `copy-plain-words`. Show a thing's display name, not its id. `instagram_graph` in a select is `copy-display-names`.

## One point of view

Things the user owns take one possessive everywhere, either "your" or "my", so the sidebar, page titles and settings agree. A checkbox the user ticks may speak as them, as in "Remember my device". Say "we" only for something a person on the team does, such as "We'll review your appeal". `My Projects` in the sidebar over a `Your Projects` title, or "Change your preferences in My Account", is `copy-one-point-of-view`.

## One action, one name

An action carries the same label in every menu, button, toast and shortcut list. Remove, Delete and Trash for one action is `copy-one-name-per-action`.

Create makes something new, and Add puts something that already exists into a place, such as `Add to Folder`. `Add Project` on a button that makes a blank project is `copy-create-vs-add`.

## One line of description or none

Move optional detail into a tooltip or a linked page. Two lines under a setting is `copy-one-line-description`. Anything the user needs to act, such as a limit, a price or a warning, stays on the page, because `overlays` keeps it out of tooltips. Input requirements, such as password rules and formats, sit between the label and the field, as `forms` sets out.

## Placeholders show an example or nothing

A placeholder holds a sample value in the expected format, such as `name@example.com`, or stays empty. It never repeats the label or gives an instruction, which vanishes on the first keystroke. A search box is the exception and may read `Search…`. `Enter your email` inside an Email field is `copy-placeholder-example`.

## Status matches the moment

"Searched" while the search still runs is `copy-state-tense`.

A status after an action names what changed, so it still reads alone in a toast or a screen reader announcement. "Success!" or "Done" after a delete is `copy-status-names-the-change`. The page that ends a finished flow belongs to `states`.

## Numbers keep their units and their symbols

A non-breaking space keeps a number with its unit, a key with the next key and a short name with its number. Write `10&nbsp;MB`, `⌘&nbsp;K` and `Step&nbsp;2`, or `\u00A0` in a string. `10` ending one line and `MB` starting the next is `copy-nbsp-units`.

Negative numbers and decrements take the minus sign `−`, U+2212. Dimensions and multipliers take `×`, U+00D7, as in `1920 × 1080` and `2×`. A hyphen in `-12` or a letter x in `1920x1080` is `copy-true-symbols`. Values meant to be copied as code keep the hyphen.

## Em dashes and ellipses follow the project

Where the project's interface has no convention, a comma or a full stop replaces an em dash. An em dash there is `copy-no-em-dash`. Posts and other text around the interface belong to `prose`.

Where the project has no convention, an ellipsis appears only in a search placeholder or on a menu item that needs more input, such as `Export…` or `Rename…`. A loading label drops it. Wherever an ellipsis appears, it is the single character `…`, never three periods. "Loading..." or `Export...` is `copy-no-ellipsis`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `copy-title-case` | `Add to library` and `Import from CSV` in a Title Case interface | `Add to Library` and `Import From CSV` | `MEDIUM` |
| `copy-phrasal-verbs` | `Login` and `Setup` on buttons | `Log In` and `Set Up`, with `Login Settings` as the page | `LOW` |
| `copy-fewest-words` | `Start Download` on the download screen | `Start` | `LOW` |
| `copy-number-not-noun` | `12 items` | `12` | `LOW` |
| `copy-key-word-first` | `Manage Users`, `Manage Billing`, `Manage Teams` | `Users`, `Billing`, `Teams` | `LOW` |
| `copy-verb-first` | `OK` on a save dialog | `Save` | `MEDIUM` |
| `copy-confirm-names-the-action` | `Yes` under "Delete this project?" | `Delete Project` | `HIGH` |
| `copy-confirm-names-the-target` | "Are you sure?" above a delete | "Delete Q3 Roadmap and its 12 files?" | `HIGH` |
| `copy-last-step-names-action` | `Next` on the final step of a workspace setup | `Create Workspace` | `MEDIUM` |
| `copy-errors-say-the-fix` | `Oops! Something went wrong.` | `Couldn't save. Check your connection and try again.` | `MEDIUM` |
| `copy-error-by-kind` | `Please enter a valid name` | `Enter your full name` | `MEDIUM` |
| `copy-link-text` | Two `Learn More` links on one page | `Learn More About Exports` | `MEDIUM` |
| `copy-not-by-place` | "Click the green button on the right" | "Select Continue" | `MEDIUM` |
| `copy-toggle-on-state` | `Don't Send Read Receipts` | `Send Read Receipts` | `MEDIUM` |
| `copy-whole-sentences` | `"You have " + count + " new messages"` | `t("inbox.new", { count })` holding the whole sentence | `MEDIUM` |
| `copy-plain-words` | `PDP` | `Product Page` | `HIGH` |
| `copy-display-names` | `instagram_graph` | `Instagram` | `HIGH` |
| `copy-one-point-of-view` | `My Projects` in the sidebar, `Your Projects` as the page title | `Your Projects` in both | `LOW` |
| `copy-one-name-per-action` | `Remove`, `Delete` and `Trash` for one action | `Delete` everywhere | `MEDIUM` |
| `copy-create-vs-add` | `Add Project` on a button that makes a blank project | `Create Project`, with `Add to Folder` for an existing one | `LOW` |
| `copy-one-line-description` | Two lines under a setting | One line, the optional rest in a tooltip | `MEDIUM` |
| `copy-placeholder-example` | `placeholder="Enter your email"` under an Email label | `placeholder="name@example.com"`, or none | `LOW` |
| `copy-state-tense` | `Searched` while running | `Searching`, then `Searched` | `MEDIUM` |
| `copy-status-names-the-change` | `Success!` after a delete | `Q3 Roadmap deleted` | `MEDIUM` |
| `copy-nbsp-units` | `10 MB` breaking between `10` and `MB` | `10&nbsp;MB` | `LOW` |
| `copy-true-symbols` | `-12` and `1920x1080` | `−12` and `1920 × 1080` | `LOW` |
| `copy-no-em-dash` | `Synced &mdash; 2 minutes ago` in an interface with no em dash convention | `Synced 2 minutes ago` | `MEDIUM` |
| `copy-no-ellipsis` | `Loading...` and `Export...` | `Loading` and `Export…` | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
