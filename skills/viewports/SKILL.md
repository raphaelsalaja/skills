---
name: viewports
description: Renders a page at every width, each breakpoint edge, a short landscape phone, 200% text and spaced, longer, shorter, unbroken or mirrored text, then reports what overflows, clips or hides.
---

# Viewports

This skill renders one page at a fixed set of widths and heights. It measures each render for sideways scroll, clipped text, small targets and controls that only hover reveals.

## Every width rendered, none inferred

The widths are exact: 320, 375, 768, 1024, 1440 and 2560, plus 1px either side of each project breakpoint. A width reasoned from the media queries is a finding. Run it after any layout change and whenever the user names a phone or a width.

Opening the result belongs to `verify`. Alignment inside one render belongs to `alignment`. Safe areas, hit areas and dynamic viewport units belong to `defaults`, and a failure there cites its id.

## 1. Read the breakpoints

Read the breakpoints from the CSS, the Tailwind config or the tokens. Add 1px below and 1px above each one to the fixed widths. A sweep that skips the edges of a breakpoint is `viewports-cross-each-breakpoint`.

## 2. Render each width

Set the viewport through device emulation at each width. Use 320×568, 375×812, 768×1024, 1024×768, 1440×900 and 2560×1440. Breakpoint edges render 800px tall. Emulate touch at every width under 1024. Take a full-page screenshot of each. A layout judged from the code is `viewports-render-every-width`.

At 2560 the content sits centred in its column or uses the width on purpose. A 1200px column pinned left with 1360px of blank space beside it is `viewports-widest-width`.

A component that ships inside a narrower container also renders at that container's width. Render it inside its real parent, or set its wrapper to that width. A list checked at 1440 that ships in a 280px sidebar is `viewports-container-width`.

## 3. Measure each render

Run [overflow.js](overflow.js) through the browser's evaluate call at each width. Treat each result as a candidate until a crop of that width shows it.

The page never scrolls sideways, though a box may scroll inside itself. A 40px sideways scroll at 320 is `viewports-no-sideways-scroll`.

Text is never cut by its box without an ellipsis or a clamp. A button label cut in half at 375 is `viewports-no-clipped-text`. A target under 24px cites `defaults-hit-area`.

## 4. Tap at touch widths

Tap through the page with touch emulated. Row actions, copy buttons and menus that appear on hover need another way to appear. A delete button that shows only on row hover is `viewports-no-hover-only-controls`.

## 5. Shorten the height

Render 812×375, a phone held sideways. The page works in both orientations and never asks to be turned. A "Rotate your device" overlay at 812×375 is `viewports-both-orientations`.

Open each dialog, sheet and menu at that size. Content scrolls inside the overlay and its actions stay reachable. A dialog whose `Save` sits below the screen with no scroll is `viewports-short-heights`.

## 6. Double the text

At 1024 wide, set the root font size to 200% and render again. Text wraps and its boxes grow, with nothing overlapping. Labels overlapping their icons at 200% is `viewports-text-zoom`. A layout that cannot grow because sizes are set in `px` gets the same id.

## 7. Widen the spacing

At 375 and 1024, run [stretch.js](stretch.js) through the browser's evaluate call, then call `window.__stretch.run("spacing")`. Line height becomes 1.5 times the font size and paragraph spacing 2 times. Letter spacing becomes 0.12em and word spacing 0.16em. Nothing clips or overlaps. A tag with `height: 32px` cutting its label is `viewports-text-spacing`.

## 8. Lengthen and shorten the text

At 375 and 1440, run [stretch.js](stretch.js). It doubles labels under 11 characters and lengthens longer text by 40–60%, as translation does. Labels wrap or truncate with a way back. A tab label pushing its neighbour off the bar is `viewports-longer-text`.

Then call `window.__stretch.run("unbreakable")` for values with no spaces. It puts in `bartholomew.fitzgerald@northwind-industries-holdings.example.com`, `IMG_20250914_183022_HDR_portrait_edited_edited.HEIC`, `Benachrichtigungseinstellungen`, a UUID and a long URL with a query string. Each wraps with `overflow-wrap: anywhere` or truncates in the middle. An email running out of its card is `viewports-unbreakable-text`.

Then call `window.__stretch.run("short")` for the shortest values: `J`, `Jo` and `a@b.test`. A layout built for long values still looks complete. A name link only as wide as `J`, or a card that looks broken around `Jo`, is `viewports-shorter-text`.

## 9. Change the script and the direction

At 375 and 1440, call `window.__stretch.run("scripts")`. It puts in Vietnamese `Đặng Thị Ngọc Hân`, Thai `สมศักดิ์ ใจดี` and Arabic `نور الهدى عبد الرحمن`. Marks above and below the letters show whole. A tight `line-height` with `overflow: hidden` cutting the marks off `Đặng` is `viewports-tall-scripts`.

When the project ships a right-to-left locale, set `dir="rtl"` on the root and render both widths again. The layout mirrors. Padding stuck on one side because of `margin-left` is `viewports-mirror-rtl`.

In the mirrored render, icons that point a direction flip: arrows, chevrons, back, forward, send and undo. Clocks, checkmarks, the search magnifier and media play controls stay as drawn. A back chevron still pointing left under `dir="rtl"` is `viewports-flip-directional-icons`. Fix it with `:dir(rtl) .icon-directional { transform: scaleX(-1) }` or the mirrored glyph.

Text the user wrote takes `dir="auto"`, so `نور الهدى عبد الرحمن` inside a left-to-right page keeps its punctuation and icons on the right. In a right-to-left interface, a paragraph of three or more lines aligns to its own language, and digits never reverse. A name whose full stop jumps to its wrong end is `viewports-dir-auto`.

## 10. Report by width

Return one screenshot per width with the overlay numbers, then the findings in the same order. A finding with no width named is `viewports-name-the-width`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `viewports-cross-each-breakpoint` | Checked at 375 and 1440 only | Also at 767 and 768, 1023 and 1024 |
| `viewports-render-every-width` | "The grid collapses at `md`, so mobile is fine" | Screenshots at 320, 375 and 768 |
| `viewports-widest-width` | A 1200px column pinned left at 2560 | `margin-inline: auto` on the column |
| `viewports-container-width` | A list checked at 1440 that ships in a 280px sidebar | The list rendered inside a 280px wrapper |
| `viewports-no-sideways-scroll` | A `width: 400px` card at 320 | `max-width: 100%` on the card |
| `viewports-no-clipped-text` | `overflow: hidden` cutting a label at 375 | The label wraps, or truncates with a way back |
| `viewports-no-hover-only-controls` | Row actions behind `:hover` alone | Shown at all times under `(hover: none)` |
| `viewports-both-orientations` | A "Rotate your device" overlay at 812×375 | The layout reflowing to 812×375 |
| `viewports-short-heights` | A dialog's `Save` below a 375px screen | `max-height: 100dvh` with the body scrolling |
| `viewports-text-zoom` | `height: 32px` on a button that clips at 200% | `min-height: 2rem` with padding |
| `viewports-text-spacing` | `height: 32px` on a tag that clips at wider spacing | `min-height: 32px` with `padding-block: 4px` |
| `viewports-longer-text` | `width: 96px` on a tab whose label doubles | `min-width: 96px` with the label free to grow |
| `viewports-unbreakable-text` | An email running out of its card | `overflow-wrap: anywhere` on the email |
| `viewports-shorter-text` | A name link only as wide as `J` | `min-width: 24px` on the link |
| `viewports-tall-scripts` | `line-height: 1` with `overflow: hidden` cutting the marks off `Đặng` | `line-height: 1.5` on the line |
| `viewports-mirror-rtl` | `margin-left: 12px` on a row's icon | `margin-inline-start: 12px` |
| `viewports-flip-directional-icons` | A back chevron pointing left under `dir="rtl"`, or a clock flipped with it | `:dir(rtl) .icon-directional { transform: scaleX(-1) }` on arrows and chevrons only |
| `viewports-dir-auto` | `<span>{name}</span>` holding `نور الهدى عبد الرحمن` | `<span dir="auto">{name}</span>` |
| `viewports-name-the-width` | "The header overlaps" | "At 768, the header overlaps the search field" |

## Reporting

**Severity.** `HIGH` is sideways page scroll, a control that hover alone reveals on touch or an action unreachable at a short height. It is also a page locked to one orientation. `MEDIUM` is clipped text, overlap at 200% text or a break at a breakpoint edge. It is also a layout that breaks under longer text or fails to mirror. It is also a directional icon pointing the wrong way once mirrored, or a non-directional one flipped. It is also text cut by wider spacing, a value with no spaces escaping its box, marks cut off a tall script or user text in the wrong direction. It is also a component never rendered at its container width or content stranded at 2560. `LOW` is a finding that does not name its width, or a layout that looks broken with the shortest values.

**Format.** One finding per root cause, naming the width:

```
1. file:line - [rule-id] at 375, what is wrong (measured values)
```

Cite the script's element when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark any width you could not render as `Not verified`.
