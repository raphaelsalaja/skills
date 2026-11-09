---
name: gather
description: Collects references from the user's own saves and every site they pick onto one linked board before a design is built.
---

# Gather

This skill collects inspiration before a design is built or reworked. It searches every source at once, fills one board as results land and links every reference back with the part to take.

## Evidence for a choice, not a style to copy

A reference shows how one part could work. Taking a whole app's look when the user asked for its top bar is a finding. With no number given, gather at least 20 references from at least three sources.

Use it when the user asks for inspiration, references or "inspo", or says a screen looks bad and asks how to improve it. Building variants from the board belongs to `prototype`. Rebuilding one reference value for value belongs to `match`.

## 1. Name the brief

Write one line naming the surface, its platform and what to look for: layout, navigation, density, type, colour, motion or overall taste. A search with no target is `gather-name-the-brief`.

Split the brief into its parts, such as "top bar", "empty state" and "row density", and give each part two or three synonyms. Queries come from the parts, two or three words each. One long query carrying the whole brief is `gather-split-the-brief`.

Search on the same platform as the work. A desktop or web app takes web and desktop references. Mobile screens for a desktop app is `gather-same-platform`.

## 2. Start with what the user gave

Open the tabs, screenshots, links and design files already in the thread before searching anywhere. They seed the image searches in step 4. Searching Mobbin while the user's screenshots sit open in the browser is `gather-start-with-given`.

## 3. Ask which sources to use

Ask one multi-select question with every source in [sources.md](sources.md#which-sources) as its own option, marking each one connected or not. Search only the sources picked.

Where the question tool caps its options, split the list across questions in the order `sources.md` gives. A source missing from the question, a searched source left out or no question at all is `gather-ask-which-sources`.

Connect a picked source that is missing before searching it. How to connect each one is in [sources.md](sources.md). Wait for the answer before searching anywhere. Ask once per brief, so More Like This and "more" keep the same picks.

Pond imports the user's saves from Are.na, Cosmos, Pinterest, Savee, Dribbble and Behance, so with Pond connected read those saves through Pond's `source` filter. Calling a board's API, or asking to sign in only to read saves Pond holds, is `gather-boards-through-pond`.

A source the user left out stays out of Pond too. Pond's `source` filter cannot exclude, so drop every Pond result whose source was left out.

## 4. Search every picked source at once

Start one agent per picked source, or run their searches as parallel calls where agents are unavailable. Each writes `candidates/<source>.json` in the shape [sources.md](sources.md#candidates) shows. Searching one source after another is `gather-parallel-sources`.

When Mobbin answers that monthly usage is high, stop calling it, tell the user and carry on with the other sources. Search Mobbin again only when the user asks for it by name. Another Mobbin call after that warning is `gather-stop-at-usage-limit`.

Every picked site the user can sign into gets two searches: their saves there and the site's own catalogue. Searching only one side while the other holds matches is `gather-saves-and-site`.

The user's own saves lead each group, from any source, each marked `saved: true`. A board with none of the user's saves while a picked source holds matches is `gather-own-library-first`.

Pull from at least three of the picked sources, or from every one when fewer are picked. A board drawn from one app is `gather-go-wide`.

Seed image searches from what the user gave and from their closest saves, through Pond `visual` and Cosmos. Text queries alone when the user shared screenshots is `gather-search-by-image`.

When the best reference is a shipped product, open its live page and screenshot the part. A gallery thumbnail of a site that is one click away is `gather-capture-live`.

Pull about twice the number asked, then cut. When the user asks for more, leave out every url already on the board. Repeats under "50 more" is `gather-enough-to-choose`.

## 5. Collect into one board

Run the collector once the first candidates land and open the board straight away. It copies the board page, downloads every image and video and fills the board live as agents finish.

```sh
node <skill>/collect.mjs .gather/<brief> --serve
```

`.gather/` stays out of version control. Write the title, brief and group order to `.gather/<brief>/board.json` as [sources.md](sources.md#board) shows. Links pasted in chat instead of a board is `gather-one-board`.

Gathering only reads the user's library. The collector copies each save into `img/` and the originals stay as they are. Compressing or rewriting saves in place is `gather-read-only-library`.

The collector and the board ship with the skill, so a run writes data only. A hand-written board page, or a per-run script that downloads or builds, is `gather-shipped-collector`.

## 6. Look at every reference

Open each downloaded file and look at the part the brief names. A reference kept on its title, metadata or a preview is `gather-look-at-every-image`.

Cut only clear misses, by adding their url to `cut` in `board.json`. When two references sit close, both stay and the user decides. A close call settled by the agent is `gather-cut-clear-misses`.

Each reference gets one note naming the part to take, such as "the top bar". A reference with no note is `gather-name-the-part`. Each keeps its source link. An image with no link is `gather-link-every-reference`.

Mark each reference `Shipped` or `Concept` under `Kind` in its `details`. A concept shot shown as a shipped product is `gather-concept-or-shipped`.

Name each group in two or three words of Title Case, such as "Agent Activity", and put the detail in its description. A group named like a sentence is `gather-short-group-names`.

When the cut is done, run the collector once more with `--done` so the board stops reloading.

## 7. Act on what comes back

The board copies three prompts. Copy Picks returns the picks with the user's notes, which become the brief for the next step. More Like This returns one reference. Save Picks returns the picks to save.

For More Like This, seed an image search from that reference and keep to its group, with every url on the board left out. A text search on its title is `gather-more-from-the-pick`.

## 8. Save what the user keeps

Send picks where the user says: their library, a channel or a board. Read the destination's naming first and match it. A new channel named "FW 26 🔥" beside `fashion / inspiration / 2026 / fall winter` is `gather-match-the-naming`.

Check for each item before adding it. A second copy of a saved item is `gather-no-duplicates`. When a source needs a login or a CAPTCHA, stop and say which one. Working around a login is `gather-ask-at-login`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `gather-name-the-brief` | "Searching settings pages" | "Desktop settings page, looking for grouping and density" |
| `gather-split-the-brief` | `query: "desktop settings page with grouped dense options"` | `"settings groups"`, `"preferences list"`, `"dense settings"` |
| `gather-same-platform` | iOS screens for a desktop app | `platform: "web"` and desktop apps |
| `gather-start-with-given` | A Mobbin search while the user's tabs are open | The open tabs read first |
| `gather-ask-which-sources` | Six sources offered while Savee and Refero go unlisted | Every source in `sources.md` as its own option, marked connected or not |
| `gather-boards-through-pond` | "Are.na's API blocks scripted requests, so I'll search it in the browser" while Pond is connected | Pond searched with `source: "arena"`, `"cosmos"` and `"pinterest"` |
| `gather-parallel-sources` | Pond, then Mobbin, then Cosmos, one after another | One agent per source, started together |
| `gather-stop-at-usage-limit` | Mobbin searched again after "your monthly usage is high" | "Mobbin says monthly usage is high, so I've stopped searching it" |
| `gather-saves-and-site` | Mobbin searched while the user's Mobbin collections go unread | `get_collection_contents` with `id: "all-saved"`, then `search_screens` |
| `gather-own-library-first` | A board of Mobbin screens while Pond holds matches | The user's saves first in each group |
| `gather-go-wide` | Twenty screens from one app | The user's saves and three sites |
| `gather-search-by-image` | Text queries while the user's screenshot sits in the thread | `search_library` with `visual` seeded from it |
| `gather-capture-live` | A Land-book thumbnail of linear.app | A screenshot of the live top bar, linked to linear.app |
| `gather-enough-to-choose` | "50 more" returns the first 20 again | 50 new references, earlier urls left out |
| `gather-one-board` | Twenty links pasted in chat | `.gather/settings/` served and opened, grouped by idea |
| `gather-read-only-library` | Saves compressed in place for the board | Copies in `img/`, originals untouched |
| `gather-shipped-collector` | A `build.mjs` written for this run | `node collect.mjs .gather/settings --serve` |
| `gather-look-at-every-image` | A screen kept on its title or a preview | The downloaded file opened and the top bar looked at |
| `gather-cut-clear-misses` | Two close references, one cut by the agent | Both on the board for the user |
| `gather-name-the-part` | A screenshot with no note | "Take the grouped list, not the colours" |
| `gather-link-every-reference` | An image with no source | The image linked to its original |
| `gather-concept-or-shipped` | A Dribbble concept shown as a product | `details: { Kind: "Concept" }` |
| `gather-short-group-names` | "Activity: thinking, tool calls and steps" | "Agent Activity" |
| `gather-more-from-the-pick` | More Like This searched as "Linear settings" | An image search seeded from the picked screen |
| `gather-match-the-naming` | A new channel named "FW 26 🔥" | `fashion / inspiration / 2026 / fall winter` |
| `gather-no-duplicates` | The same pin added twice | Existing items checked and skipped |
| `gather-ask-at-login` | A login worked around | "Pinterest needs you to sign in" |

## Reporting

**Severity.** `HIGH` is a whole look copied when one part was asked for, items saved twice or under the wrong name, or saves rewritten in the user's library.

`MEDIUM` is the wrong platform, one source only, sources searched in turn, a board with no links or a hand-written board or build script. It is also a search that skipped the source question or the user's own saves, or searched a source the user left out. So is a site searched without the user's saves there, or the reverse. So is a reference kept unseen, a close call settled by the agent or a concept shown as shipped. So is a Mobbin call after its usage warning, or a board reached around Pond while Pond holds its saves.

`LOW` is one long query, text search where an image search fits or a gallery thumbnail of a live site. So is a reference with no note, a long group name, repeats under "more" or More Like This searched by title.

**Format.** One finding per root cause, citing the request when no file applies:

```
file:line - [rule-id] what is wrong
request 2 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every source you could not reach as `Not verified`.
