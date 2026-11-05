---
name: preview
description: Builds an og:image and optional looping og:video for a page, then previews the link on X, iMessage, Slack and Discord before it ships.
---

# Preview

This skill builds the card a shared link shows. It takes a still and an optional loop from the running page, then places X, iMessage, Slack and Discord side by side at the crops below.

## Crops and limits are exact

The still is 1200×630. Each crop and each text limit below is exact. A guessed ratio, or a limit taken from a screenshot, is a finding.

Run it when shipping or launching a page, when sharing a link or when a message names OG, og:image, og:video, a social card, a link preview or a Twitter card.

Labels on the card belong to `copy`. Opening the result belongs to `verify`. Committing and releasing belong to `ship`. How the loop moves belongs to `motion`. `theme-color` belongs to `defaults`.

## 1. Read the source

Open the page and read the HTML the server sends. A crawler does not run script. Tags that appear only after hydration are `preview-source-tags`.

Run `node check.mjs <url> --board .preview/<page>/board.js` from this skill. A file path works when the page is not served yet. The command reads the source, the image and the video, then writes the report and `board.js`.

## 2. Build the still

Copy [card.html](card.html) beside the page and write `card.js` as its header shows. Point `live` at the running page, or `capture` at a shot of it. Set the viewport to 1200×630 and screenshot that frame.

The file is png, jpeg or webp, at most 5MB, with both sides at least 150 and the width at least 900. The HTML at the link stays at or under 1MB.

Any other pixel size, a file over 5MB, a declared width or height that differs from the file, a format outside those three or HTML over 1MB is `preview-image-size`. A flat colour, a failed fetch or a capture of an empty page is `preview-no-blank-card`.

Keep the subject inside the centre 630×600. X drops 15px at the top and the bottom. Slack keeps the centre square, 285px in from each side.

## 3. Build the loop

When the page has motion a viewer should see, record the same 1200×630 frame for one cycle of at most 6 seconds. The file is a muted H.264 mp4, the still is its poster and `og:video` points at the file itself.

The board plays that loop on iMessage and Discord. X and Slack keep the still, because a player card on X is not shown for an unapproved domain and Slack does not play this file.

An embed URL, a soundtrack, another size, a run past 6 seconds or a loop shown on X is `preview-video-loops`. The still and the video together stay at or under 10MB. When the page does not move, skip the video and say so.

## 4. Write the tags

Write these in the source. A missing one is `preview-required-tags`. An `og:image` or `og:video` that is not an absolute `https` URL is `preview-absolute-url`.

```html
<meta property="og:title" content="Evening Tide" />
<meta property="og:description" content="High water at 18:40." />
<meta property="og:site_name" content="Harbor" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/tides" />
<meta property="og:image" content="https://example.com/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Evening tide chart" />
<meta name="twitter:card" content="summary_large_image" />
```

With a loop, add the video tags and set `og:type` to `video.other` after `twitter:card`. The last layout tag then asks Discord for the video, while X still asks for the large still.

```html
<meta property="og:video" content="https://example.com/og.mp4" />
<meta property="og:video:secure_url" content="https://example.com/og.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1200" />
<meta property="og:video:height" content="630" />
<meta property="og:type" content="video.other" />
```

`og:title` is at most 70 characters and at most 70 bytes. A longer title is `preview-title-fits`. `og:description` is at most 200 characters and at most 350 bytes. A longer description is `preview-description-fits`. iMessage cuts the title at 2 lines and does not show the description.

## 5. Open the board

Copy [board.html](board.html) to `.preview/<page>/index.html`, an ignored folder and never the source tree. The header of [board.html](board.html) shows the shape, and step 1 writes `board.js`. Open that page. A mock drawn by hand is `preview-shipped-board`.

The four frames are exact. The board marks `Cut` where a limit above clips the text.

| Platform | Frame | Crop | Text |
| --- | --- | --- | --- |
| X | 504×252 | Centre 2:1 | Title at 70 characters. No description |
| iMessage | 320×168 | Full frame | Title at 2 lines. The loop plays |
| Slack | 80×80 | Centre square | Description at 3 lines beside the square |
| Discord | 400×210 | Scaled, no crop | Title at 70 bytes. Description at 350 bytes. The loop plays |

Shipping or launching the page before this board is open is `preview-board-before-ship`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `preview-source-tags` | `og:title` injected after load | The same tag in the server HTML |
| `preview-required-tags` | A page with only `<title>` | `og:title`, `og:description`, `og:image` and `twitter:card` in the source |
| `preview-absolute-url` | `content="/og.png"` | `content="https://example.com/og.png"` |
| `preview-image-size` | A 1200×800 screenshot | A 1200×630 png under 5MB |
| `preview-no-blank-card` | An empty viewport saved as `og.png` | The running page, captured at 1200×630 |
| `preview-title-fits` | A 90 character `og:title` | The title at 70 characters and 70 bytes |
| `preview-description-fits` | A 400 character `og:description` | The description at 200 characters and 350 bytes |
| `preview-video-loops` | `og:video` pointed at a player page | A muted 1200×630 mp4, at most 6 seconds |
| `preview-shipped-board` | Four cards drawn in a new page | `board.html` copied, only `board.js` written |
| `preview-board-before-ship` | The page shipped, the board never opened | The board opened, then the page shipped |

## Reporting

**Severity.** `HIGH` is a blank card or a missing `og:title` or `og:image`. A launch with the board unopened is `HIGH` too. `MEDIUM` is any other missing tag, the wrong size, a cropped title or a cropped description. A relative URL, tags that exist only after script and a video that breaks the loop rule are `MEDIUM` too. `LOW` is a board drawn by hand.

**Format.** One finding per root cause, citing the step when no file applies:

```
file:line - [rule-id] what is wrong
step 5 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every check you could not run as `Not verified`.
