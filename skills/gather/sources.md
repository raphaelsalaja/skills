# Sources

How to reach each source in `SKILL.md`, the files each search agent writes and the board settings.

## Which sources

Before searching, ask which sources to use, with each name below as its own option, in this order. Connect any picked source that is missing, then search only the picked ones.

| Source | The user's saves | The site |
| --- | --- | --- |
| Pond | Saves from every platform it imports | None, it is a local library |
| marked.dev | Saved refs and collections | Explore, browsed by what moves |
| [Are.na](https://www.are.na) | Channels, through Pond when connected | Search across public channels |
| [Cosmos](https://www.cosmos.so) | Clusters, through Pond when connected | Visual similarity, colour and motion search |
| [Pinterest](https://www.pinterest.com) | Boards, through Pond when connected | Search, and a pin's More Ideas |
| [Savee](https://savee.com) | Saves, through Pond when connected | Graphic, brand, editorial and web work, searched by colour and image |
| [Dribbble](https://dribbble.com) | Likes and collections, through Pond when connected | Shots posted by designers, mostly concepts |
| [Behance](https://www.behance.net) | Appreciations and moodboards, through Pond when connected | Case studies posted by designers, mostly concepts |
| [Layers](https://layers.to) | Checked when signed in | Work posted by designers, mostly concepts |
| Mobbin | Saved collections | Screens, flows and marketing sections |
| [Recent](https://recent.design) | Checked when signed in | High-end sites, branding, motion and type, picked daily. The Web filter shows sites only |
| [Refero](https://refero.design) | Checked when signed in | Real product screens, flows, patterns and elements, mostly web |
| [Siteinspire](https://www.siteinspire.com) | Checked when signed in | Editorial, typographic sites, filtered by style, type and subject |
| [Minimal Gallery](https://minimal.gallery) | Checked when signed in | Restrained, functional sites |
| [Land-book](https://land-book.com) | Checked when signed in | Landing pages, filtered by page type and style |
| [Saaspo](https://saaspo.com) | Checked when signed in | Software landing, pricing and product pages |
| [Page Flows](https://pageflows.com) | Checked when signed in | Recorded flows from live web and mobile apps |
| [Nicely Done](https://nicelydone.club) | Favourites and collections | Screens, components and flows from SaaS apps, searchable by the text inside them |
| [Design Spells](https://www.designspells.com) | Checked when signed in | Micro-interactions, easter eggs and small details from shipped products |
| [60fps](https://60fps.design) | Checked when signed in | Recorded motion from mobile apps, tagged by gesture, pattern and effect |
| [Awwwards](https://www.awwwards.com) | Checked when signed in | Award-winning sites, judged from paid submissions |
| [One Page Love](https://onepagelove.com) | Checked when signed in | Single-page sites and page sections, picked by hand |
| [Lapa Ninja](https://www.lapa.ninja) | Checked when signed in | Landing pages with full-page screenshots and recordings |
| [Fonts In Use](https://fontsinuse.com) | Checked when signed in | Type in real work, indexed by typeface |
| [Typewolf](https://www.typewolf.com) | Checked when signed in | Type on current sites, named by typeface |
| [CodePen](https://codepen.io) | Likes and collections | Live front-end experiments, mostly concepts |

One option covers both columns. A picked source gets a search of the user's saves there and a search of the site itself. Mark Are.na, Cosmos, Pinterest, Savee, Dribbble and Behance "through Pond" when Pond is connected.

For a site with accounts, open it in the browser and look for the user's likes, boards, collections or bookmarks before searching. When it shows signed out, ask once whether to sign in or search it signed out. A site with no account, or none signed in, gets the site search only.

## Queries

Give each search agent the brief, its parts with their synonyms, the platform and the urls already on the board. Per part, run three to five short queries built from the synonyms, plus one image search. A long query can return nothing while its short parts match.

| Brief part | Queries |
| --- | --- |
| Top bar | `"top bar"`, `"app header"`, `"toolbar"`, `"navigation bar"` |
| Empty state | `"empty state"`, `"blank slate"`, `"zero state"`, `"no results"` |
| Row density | `"dense table"`, `"compact list"`, `"data grid"` |

## Candidates

Each agent writes one file, `.gather/<brief>/candidates/<source>.json`, holding an array:

```json
[
  {
    "title": "Linear",
    "source": "Mobbin",
    "url": "https://mobbin.com/screens/4c03063e",
    "media": "https://bytescale.mobbin.com/…/4c03063e.webp",
    "kind": "image",
    "group": "Grouping",
    "note": "Take the grouped list, not the colours.",
    "details": { "Kind": "Shipped" }
  }
]
```

- `url` is the original and identifies the item, so each one is unique.
- `media` is a full URL, an absolute local path or a path inside `.gather/<brief>/`. The collector downloads or copies it into `img/`.
- `kind` is `image` or `video`. Without it, the file extension decides.
- `poster` is optional, a still for a video.
- `source` puts › between a library and the board inside it, such as `Pond › Are.na`.
- `saved` is `true` for an item from the user's own saves on any source. Saved items lead each group.
- `details` adds rows to the viewer, such as `{ "Creator": "Kevin", "Style": ["Minimal", "Clean"] }`.

## Board

`.gather/<brief>/board.json` sets what the candidates cannot:

```json
{
  "title": "Settings Page",
  "brief": "Desktop settings page, looking for grouping and density.",
  "groups": [{ "title": "Grouping", "description": "How long lists of options are split up." }],
  "cut": ["https://mobbin.com/screens/9f12ab07"]
}
```

The board title takes Title Case. Groups appear in this order, and any group named only by a candidate follows them. A url under `cut` stays off the board.

Run the collector from anywhere:

| Command | Does |
| --- | --- |
| `node collect.mjs .gather/<brief>` | Builds the board once |
| `node collect.mjs .gather/<brief> --serve` | Serves it, rebuilds on every change and keeps the board reloading |
| `node collect.mjs .gather/<brief> --done` | Builds it a last time and stops the reloading |

Downloads run 8 at a time and are cached under a hash of the media url, so a second run fetches only what is new. A download that fails is named in the output and left off the board.

## What the user gave

| Input | Reach it with |
| --- | --- |
| Open browser tabs | List the tabs and read each page |
| Screenshots in the thread | Read the images |
| Design files | The Figma MCP `get_screenshot` on the linked node |
| Live sites | Open the page. For exact values, hand over to `match` |

## Live capture

When the best reference is a shipped product, open its page in the browser and screenshot the part the brief names. Use the screenshot's path as `media`, the live page as `url` and `Live` as `source`. Stop at a login and say so.

## Pond

The user's own library of saves from X, Instagram, Pinterest, Are.na, Cosmos, Savee, Dribbble, Behance, Threads, Bluesky, Tumblr, Reddit, TikTok, YouTube, Vimeo, Unsplash, GitHub, Substack, the web and local files. The Pond choice downloads from https://pond.raphaelsalaja.com and connects under Settings, Model Context Protocol. Connecting an account needs the Pond browser extension, from Browser Extension in the library menu. Pond runs as a local MCP server over stdio:

```json
{
  "mcpServers": {
    "pond": {
      "command": "/Applications/Pond.app/Contents/MacOS/Pond",
      "args": ["--mcp"]
    }
  }
}
```

Copy the exact command from Pond, under Settings, Model Context Protocol. The Search Saves switch under Access must be on.

| Tool | Use |
| --- | --- |
| `search_library` | Search by meaning, such as `{ "query": "website design" }` |
| `search_library` with `source` | Only one platform: `arena`, `cosmos`, `pinterest`, `savee`, `dribbble`, `behance`, `twitter` and the rest of the list above |
| `search_library` with `visual: { "kind": "saveId", "id" }` | Saves that look like one the user likes |
| `search_library` with `media: ["video"]` | Motion references only |
| `search_library` with `folderId` | Inside one of the user's folders, from `list_folders` |
| `query_library` | Exact filters: `keywords` limited by `keywordScopes`, and `scope` by source, folder, tag or `savedSince`, with a sort and `cursor` paging |
| `list_folders` | Find the user's own groupings before searching |
| `read_save` | Caption, text in images, note, link and metadata, or one part with `field`: `caption`, `ocr`, `transcript`, `notes` or `description` |
| `grep_library` | Exact words in `query` inside captions, transcripts, notes, titles and image text |
| `open_save`, `apply_filter` | Show a result in the Pond window |

`compress_images` replaces the originals in the library, so gathering never calls it.

For an image search, find the save closest to what the user gave, then pass its id as `visual`. Run it again from the best two or three results.

A save's files sit in `<Library>.pond/items/<id>.info/`, so `media` is the absolute path to the original file. The Local API also saves URLs with `POST /enqueue`, and `created: false` means the URL is already saved. Its token stays in Pond's settings and is never pasted into chat.

## marked.dev

The user's saved interfaces and motion from X, Pinterest and the web, each credited to its maker. It also holds Explore, a public catalogue browsed by what moves: hover, scroll and drag. It runs as a remote MCP server with no API key. Copy the config from https://marked.dev/mcp, then approve the connection in the browser.

| Tool | Use |
| --- | --- |
| `list_collections`, `get_collection` | The user's own collections, read before searching |
| `search_refs` | The user's saved refs, with `unsorted: true` for refs in no collection |
| `get_ref` | A saved ref's media, source and author |
| `search_explore`, `get_explore_ref` | Public refs, with `category: "motion"` for what moves |
| `search_refs` or `search_explore` with filters | `categories` (`app`, `saas`, `software`, `motion`), `platforms` (`x`, `pinterest`, `other`), `tags` and `authors` |
| `save_ref` | Save a pick into a collection, only when the user asks |

Search it by interaction when the brief is about motion, such as "hover card lift" or "scroll reveal". A ref's video is the `media`, with `kind: "video"`.

## Sites in the browser

Every source but Pond, marked.dev and Mobbin opens in the browser, or with computer use where the browser cannot reach it. Open only the sites the user picked.

With Pond connected, read the user's saves on Are.na, Cosmos, Pinterest, Savee, Dribbble and Behance through Pond. Set `source` to `arena`, `cosmos`, `pinterest`, `savee`, `dribbble` or `behance`. Open their own pages for a channel Pond hasn't imported and for each site's search.

| Site | Image search |
| --- | --- |
| Cosmos | Open an element and use its similar results. AI images hide on request |
| Pinterest | A pin's More Ideas |
| Savee | Search by colour or by an image |

Read the user's existing channel and board names before creating one. Prefer sites picked by hand to ones that take paid submissions. Dribbble, Behance, Layers and CodePen are mostly concepts, so mark what comes from them.

## Mobbin

| Tool | Use |
| --- | --- |
| Mobbin `search_screens` | Single screens. Set `platform` to `web` for desktop and web work |
| Mobbin `search_flows` | Multi-step flows, such as onboarding or checkout |
| Mobbin `search_sections` | Sections of marketing sites |
| Mobbin `exclude_screen_ids` | Leave out screens already shown when the user asks for more |
| Mobbin `list_collections`, `get_collection_contents` | The user's own saved collections, searched first. `id: "all-saved"` reads everything saved, one `content_type` and `platform` per call |
| Mobbin `create_collection`, `save_content` | Save picks into a new or existing collection, only when the user asks |
| Mobbin `add_comment` | Note on a saved item why it was picked, only when the user asks |

A Mobbin result's `image_url` is the `media` and its `mobbin_url` is the `url`. The image link expires after 30 days, which the download covers.
