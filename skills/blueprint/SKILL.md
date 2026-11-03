---
name: blueprint
description: Draws a flat measured drawing of a real screen or component, with gaps, type, colour and hit areas read from the render, then exports a still and a reveal.
disable-model-invocation: true
---

# Blueprint

This skill draws a real screen or component as a flat engineering sheet. It reads the render, places callouts on what is there and exports a still plus a short reveal.

## The spec as built, drawn flat

Every figure is read from computed style and the DOM. The capture is 2x and the reveal is 3.2s. A guessed figure is a finding. The sheet stays in the plane of the screen.

Run it when the user asks for a blueprint, spec sheet, redline, x-ray or annotated breakdown of a real screen or component. The result is for a post, a handoff, docs or a review.

Pixel misses belong to `alignment`. A looping interaction clip belongs to `clip`. Motion tracks belong to `deconstruct`. A named reference belongs to `match`. Opening the result belongs to `verify`. Whether a hit area is large enough belongs to `defaults`. What a colour means belongs to `color`. Callout words follow `copy`. The reveal uses the on-screen curve from `motion`.

## 1. Name the subject

Name one screen or one component, and the route it renders on. A drawing of the whole app is `blueprint-name-the-subject`.

## 2. Open the running render

Open the page at the viewport it ships at, with a device scale factor of 2. Leave a quiet margin around the subject so leaders fit. A sheet traced from the source file is `blueprint-read-the-render`.

## 3. Measure

Run [measure.js](measure.js) in the page with `window.__blueprintOptions = { root }`, where `root` is a selector for the subject. It returns the clip to photograph, the outlines and the proposed callouts.

Each figure comes from that result. A padding chosen by eye is `blueprint-read-computed`. A colour named as a hex while a token matches is `blueprint-name-the-token`. The hit area is the control's border box, extended by a negative-inset pseudo-element when one exists. The glyph's own box used as the hit area is `blueprint-hit-from-dom`.

The proposal leaves out a gap under 8px, because the dimension line will not fit.

## 4. Keep the callouts that explain it

Keep the subject's padding, the gaps between its parts, each distinct radius, one type spec per style, one swatch per colour token and the hit area of each control. Delete the rest before drawing.

A leader on every node is `blueprint-callouts-that-fit`. A callout that marks a figure as wrong is `blueprint-state-the-spec`. The sheet states the spec as built.

## 5. Draw the sheet

Copy [sheet.html](sheet.html) to `.blueprint/<subject>/index.html`, an ignored folder and never the source tree. Save the 2x screenshot of the clip as `screen.png`. Write `sheet.js` in the shape the header comment shows, then open the sheet.

The sheet ships with the skill, so write data only. A drawing page written from scratch is `blueprint-shipped-sheet`.

Leaders, extension lines and dimension lines lie on the screenshot. Parts pulled apart, stacked in depth or drawn in perspective are `blueprint-flat-drawing`. Scrub or play to wipe from the real screen to the drawing. The wipe crosses the same pixels. A camera move shares that finding.

## 6. Export the pair

Run [export.mjs](export.mjs) on the folder. It writes `drawing.png` and `reveal.mp4`. The still is the wipe fully open. The video holds the screen, wipes across in 2.4s and holds the drawing, 3.2s in all.

A reply with the spec and neither file is `blueprint-export-the-pair`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `blueprint-name-the-subject` | The whole settings app on one sheet | The billing card |
| `blueprint-read-the-render` | Padding copied out of the CSS file | Measured on the open page at 2x |
| `blueprint-read-computed` | "About 16px of padding" | Padding 16, from computed style |
| `blueprint-name-the-token` | Fill labelled `#111111` | Fill labelled Background Raised |
| `blueprint-hit-from-dom` | A 16px icon box labelled as the hit area | The 40px control box, inset included |
| `blueprint-callouts-that-fit` | A leader on every span | Padding, the gaps, one type spec per style, the swatches and the hits |
| `blueprint-state-the-spec` | "Gap 12, should be 8" | Gap 12 |
| `blueprint-flat-drawing` | The card's rows pulled apart on a z axis | Leaders on the screenshot, in the same plane |
| `blueprint-shipped-sheet` | A drawing page written from scratch | `sheet.html` copied, only `sheet.js` written |
| `blueprint-export-the-pair` | "The padding is 20" and no files | `drawing.png` and `reveal.mp4` |

## Reporting

**Severity.** `HIGH` is a sheet made without the running render, or parts drawn out of the plane. `MEDIUM` is a guessed figure, a hex in place of a token or a hit area taken from the glyph. It is also every node labelled, a figure marked wrong, a hand-written sheet or a reply with neither file. `LOW` is a leader that leaves the frame, or a reveal longer than 4 seconds.

**Format.** One finding per root cause, citing the sheet or the request when no source line applies:

```
.blueprint/billing/drawing.png - [rule-id] what is wrong
request 1 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a sheet you did not open. Mark a closed shadow root, and every figure you could not read, as `Not verified`.
