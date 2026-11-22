---
name: viewports
description: Renders a page at every width, each breakpoint edge, a short landscape phone, 400% zoom, 200% text and spaced, longer, shorter, unbroken or mirrored text, then reports what overflows, clips or hides.
---

# Viewports

This skill renders one page at a fixed set of widths and heights. It measures each render for sideways scroll, clipped text, small targets and controls that only hover reveals.

## Every width rendered, none inferred

The widths are exact: 320, 375, 768, 1024, 1440 and 2560, plus each project breakpoint and the width 1px below it. The short sizes are exact too: 812×375 for a phone held sideways and 320×256 for 400% zoom. A width reasoned from the media queries is a finding.

When this skill loads on its own after a layout change, run the quick tier. Render 375, 768 and 1440 wide plus the breakpoint edges nearest the change, and run [overflow.js](overflow.js) on each. Run every step below when the user asks, names a phone or a width, or before a release.

Run each script by passing the file's contents to the browser tool's evaluate call, or load it with Playwright's `page.addScriptTag({ path })`. Set each size with `Emulation.setDeviceMetricsOverride`, passing `width`, `height`, `deviceScaleFactor` and `mobile`.

Opening the result belongs to `verify`. Alignment inside one render belongs to `alignment`. Rendering a component inside the container it ships in belongs to `stress`. Safe areas, hit areas and dynamic viewport units belong to `defaults`, and a failure there cites its id.

## 1. Read the breakpoints

Read the breakpoints from the CSS, the Tailwind config or the tokens. Add each one and the width 1px below it to the fixed widths. A sweep that skips the edges of a breakpoint is `viewports-cross-each-breakpoint`.

Run [overflow.js](overflow.js) once. Its `breakpoints` field reads every width query in the loaded stylesheets and lists `widths`, the `edges` to render and the `gaps`. Queries set only from JavaScript, such as `matchMedia`, never show there.

Each entry in `gaps` is a `max-width` up to 1px below another query's `min-width`. A `max-width: 767px` beside a `min-width: 768px` leaves 767.5px matching neither, and browser zoom or fractional display scaling lands there. That gap is `viewports-no-breakpoint-gap`.

## 2. Render each width

Render 320×568, 375×812, 768×1024, 1024×768, 1440×900 and 2560×1440. Breakpoint edges render 800px tall. Emulate touch at every width under 1024 with `Emulation.setTouchEmulationEnabled`. Take a full-page screenshot of each. A layout judged from the code is `viewports-render-every-width`.

At 375×812, set `Emulation.setSafeAreaInsetsOverride` to 44px top and 34px bottom. At 812×375 they are 44px left and right and 21px bottom. Clear them with empty insets before the other widths. A bar drawn under an inset cites `defaults-safe-areas`.

At 2560 the content sits centred in its column or uses the width on purpose. A 1200px column pinned left with 1360px of blank space beside it is `viewports-widest-width`.

## 3. Measure each render

Run [overflow.js](overflow.js) at each width. Treat each result as a candidate until a crop of that width shows it.

The page never scrolls sideways, though a box may scroll inside itself. A 40px sideways scroll at 320 is `viewports-no-sideways-scroll`. The script checks the right edge, or the left edge on a `dir="rtl"` page. A culprit under `aria-hidden`, `inert` or `visibility: hidden` still scrolls the page and carries `hidden: true`.

At 1440, set `window.__viewportsOptions = { scrollbar: true }` and run the script again. It draws the classic 15px scrollbar that macOS and touch emulation hide, and its `scrollbar` field reads 15 when that took effect. Delete `window.__viewportsOptions` afterwards, or every later run draws it too. A `width: 100vw` band 15px wider than the page is `viewports-classic-scrollbar`, so search the CSS for `100vw`. A centred column that jumps 15px between a short page and a long one cites `defaults-scrollbar-gutter`.

Text is never cut by its box without an ellipsis or a clamp. The script flags a box with `overflow: hidden` or `clip` whose own text, direct or nested, runs past its edge. A button label cut in half at 375 is `viewports-no-clipped-text`. A target under 24px cites `defaults-hit-area`.

## 4. Tap at touch widths

Tap through the page with touch emulated. Row actions, copy buttons and menus that appear on hover need another way to appear. A delete button that shows only on row hover is `viewports-no-hover-only-controls`.

## 5. Shorten the height

Render 812×375. The page works in both orientations and never asks to be turned. A "Rotate your device" overlay at 812×375 is `viewports-both-orientations`.

Open each dialog, sheet and menu at that size. Content scrolls inside the overlay and its actions stay reachable. A dialog whose `Save` sits below the screen with no scroll is `viewports-short-heights`. A `100vh` or `h-screen` app shell cites `defaults-dynamic-viewport`.

## 6. Zoom to 400%

Render 320×256 at a device scale factor of 4, which is a 1280×1024 window zoomed to 400%. Run [overflow.js](overflow.js) again. Text reflows with no sideways scroll.

Under 480px of height, fixed and sticky bars together cover at most a quarter of the screen, 64px at 256. A 56px sticky header above a 56px fixed tab bar, covering 112px of 256, is `viewports-unstick-when-short`.

## 7. Double the text

At 1024 wide, call `Page.setFontSizes` with `{ fontSizes: { standard: 32 } }`, which is the browser's own text-size setting doubled. When that call is blocked, set the root's inline `font-size` to twice its computed size in px. Setting the root to `200%` doubles a 62.5% root to 32px, not 20px.

Render again and run [overflow.js](overflow.js). Text wraps and its boxes grow, with nothing overlapping. Labels overlapping their icons at double text is `viewports-text-zoom`. Text that stays the same size under `Page.setFontSizes` cites `defaults-rem-sizes`.

## 8. Widen the spacing

[stretch.js](stretch.js) changes the page and finds nothing itself. Run [overflow.js](overflow.js) again after every mode, and take a screenshot.

At 375 and 1024, run stretch.js, then call `window.__stretch.run("spacing")`. Line height becomes 1.5 times the font size and paragraph spacing 2 times. Letter spacing becomes 0.12em and word spacing 0.16em. A tag with `height: 32px` cutting its label is `viewports-text-spacing`.

## 9. Lengthen and shorten the text

At 375 and 1440, run stretch.js. It doubles labels under 11 characters and lengthens longer text by 40–60%, as translation does. Labels wrap or truncate with a way back. A tab label pushing its neighbour off the bar is `viewports-longer-text`.

Then call `window.__stretch.run("unbreakable")` for values with no spaces: a long email, a camera file name, `Benachrichtigungseinstellungen`, a UUID and a long URL. Each wraps with `overflow-wrap: anywhere` or truncates in the middle. An email running out of its card is `viewports-unbreakable-text`.

Then call `window.__stretch.run("short")` for `J`, `Jo` and `a@b.test`. A layout built for long values still looks complete. A name link only as wide as `J` is `viewports-shorter-text`.

## 10. Change the script and the direction

At 375 and 1440, call `window.__stretch.run("scripts")`. It puts in Vietnamese `Đặng Thị Ngọc Hân`, Thai `สมศักดิ์ ใจดี` and Arabic `نور الهدى عبد الرحمن`. Marks clipped by a tight `line-height` leave `scrollHeight` unchanged, so judge them on a zoomed screenshot. Marks cut off `Đặng` by `overflow: hidden` are `viewports-tall-scripts`.

When the project ships a right-to-left locale, set `dir="rtl"` on the root and render both widths again. Padding stuck on one side because of `margin-left` is `viewports-mirror-rtl`.

In the mirrored render, arrows, chevrons, back, forward, send and undo flip. Clocks, checkmarks, the search magnifier and media play controls stay as drawn. A back chevron still pointing left under `dir="rtl"` is `viewports-flip-directional-icons`.

Text the user wrote takes `dir="auto"`, so an Arabic name inside a left-to-right page keeps its punctuation on the right. In a right-to-left interface, a paragraph of three or more lines aligns to its own language, and digits never reverse. A name whose full stop jumps to its wrong end is `viewports-dir-auto`.

## 11. Report by width

Return one screenshot per width with the overlay numbers from `window.__viewports.highlight()`, then the findings in the same order. A finding with no width named is `viewports-name-the-width`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `viewports-cross-each-breakpoint` | Checked at 375 and 1440 only | Also at 767 and 768, 1023 and 1024 | `MEDIUM` |
| `viewports-no-breakpoint-gap` | `max-width: 767px` beside `min-width: 768px`, nothing matching at 767.5px | `(width < 768px)` beside `(width >= 768px)` | `MEDIUM` |
| `viewports-render-every-width` | "The grid collapses at `md`, so mobile is fine" | Screenshots at 320, 375 and 768 | `MEDIUM` |
| `viewports-widest-width` | A 1200px column pinned left at 2560 | `margin-inline: auto` on the column | `MEDIUM` |
| `viewports-no-sideways-scroll` | A `width: 400px` card at 320 | `max-width: 100%` on the card | `HIGH` |
| `viewports-classic-scrollbar` | `width: 100vw` on a band, 15px wider than the page beside a classic scrollbar | `width: 100%` on the band | `HIGH` |
| `viewports-no-clipped-text` | `overflow: hidden` cutting a label at 375 | The label wraps, or truncates with a way back | `MEDIUM` |
| `viewports-no-hover-only-controls` | Row actions behind `:hover` alone | Shown at all times under `(hover: none)` | `HIGH` |
| `viewports-both-orientations` | A "Rotate your device" overlay at 812×375 | The layout reflowing to 812×375 | `HIGH` |
| `viewports-short-heights` | A dialog's `Save` below a 375px screen | `max-height: 100dvh` with the body scrolling | `HIGH` |
| `viewports-unstick-when-short` | A sticky header and a fixed tab bar covering 112px of a 256px screen | `@media (min-height: 480px) { .header { position: sticky } }`, the bars static below it | `MEDIUM` |
| `viewports-text-zoom` | `height: 32px` on a button that clips at double text | `min-height: 2rem` with padding | `MEDIUM` |
| `viewports-text-spacing` | `height: 32px` on a tag that clips at wider spacing | `min-height: 32px` with `padding-block: 4px` | `MEDIUM` |
| `viewports-longer-text` | `width: 96px` on a tab whose label doubles | `min-width: 96px` with the label free to grow | `MEDIUM` |
| `viewports-unbreakable-text` | An email running out of its card | `overflow-wrap: anywhere` on the email | `MEDIUM` |
| `viewports-shorter-text` | A name link only as wide as `J` | `min-width: 24px` on the link | `LOW` |
| `viewports-tall-scripts` | `line-height: 1` with `overflow: hidden` cutting the marks off `Đặng` | `line-height: 1.5` on the line | `MEDIUM` |
| `viewports-mirror-rtl` | `margin-left: 12px` on a row's icon | `margin-inline-start: 12px` | `MEDIUM` |
| `viewports-flip-directional-icons` | A back chevron pointing left under `dir="rtl"`, or a clock flipped with it | `:dir(rtl) .icon-directional { transform: scaleX(-1) }` on arrows and chevrons only | `MEDIUM` |
| `viewports-dir-auto` | `<span>{name}</span>` holding `نور الهدى عبد الرحمن` | `<span dir="auto">{name}</span>` | `MEDIUM` |
| `viewports-name-the-width` | "The header overlaps" | "At 768, the header overlaps the search field" | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause, naming the width:

```
1. file:line - [rule-id] at 375, what is wrong (measured values)
```

Cite the script's element when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark any width you could not render as `Not verified`.
