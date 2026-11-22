---
name: alignment
description: Measures a running page for edges, gaps, centring and radii that miss by a pixel or two, then judges visual weight and returns a numbered report with proof.
disable-model-invocation: true
---

# Alignment

This skill checks a running page for things that are out of line or out of balance. It measures the rendered ink, confirms each finding in a zoomed screenshot and returns a numbered report.

## Measured to the pixel, judged by eye

Lines, gaps, centres and radii are measured, never estimated. A miss of 1–4px is a finding, because it reads as a mistake while a 16px indent reads as intent. Visual weight has no number, so it is judged from the screenshot and shown as a crop.

Opening the running result belongs to `verify`. Comparing against a named reference belongs to `match`. Forcing hover, open and error states belongs to `lab`. Moving a fix into the shared component belongs to `reuse`. Rendering every width belongs to `viewports`.

## 1. Open the shipped render

Open the page at the viewport it ships at, with a device scale factor of 2. Check each theme and each state the user named. Reasoning from the CSS about where things should land is `alignment-measure-the-render`.

## 2. Run the measurement

Read the spacing scale from the project's tokens first. Set `window.__alignmentOptions = { scale }`, then pass the contents of [measure.js](measure.js) to the browser tool's evaluate call.

It returns findings with a rule, the element, the measured values and a rectangle. Treat each as a candidate until step 3 confirms it.

The script checks the shared edge, even gaps, the scale, padding over gap, icon-side padding, ink centring, icons with labels and the optical glyph. It also checks shared baselines, whole pixels, concentric radii and the radius floor. Top alignment beside wrapping text and visual weight are judged by eye.

## 3. Check the lines

Crop each candidate from the 2x screenshot and count the pixels. Drop any finding the pixels do not show.

Text, icons and controls that start a column share one x. A title 2px right of its description is `alignment-shared-edge`.

Repeated siblings sit at one gap. A list spaced 8, 8 then 12px is `alignment-even-gaps`. A gap at least twice the usual one is a deliberate group break.

Every padding, gap and margin is a step on the project's scale. A 6px padding on a 4px scale is `alignment-on-scale`.

A surface's padding is never smaller than the gap between its children, on the axis that gap separates. A card at 8px padding around rows 16px apart is `alignment-padding-over-gap`. Tables and full-bleed lists are exempt.

A button with a leading or trailing icon takes 2px less padding on the icon side, because the icon's box carries its own empty edge. Equal padding around a leading icon is `alignment-icon-side-padding`. That 2px is an optical offset, exempt from the scale.

Boxes land on whole CSS pixels. Half a pixel stays sharp at 2x but blurs text and 1px borders at 1x. The script reads both `transform` and `translate`. A dialog centred with `translate(-50%, -50%)` at a 301px width, sitting at x 489.5, is `alignment-whole-pixels`.

## 4. Check the centres

Text in a control centres on its cap height and baseline, not its line box. Ink sitting 2px low in a button is `alignment-ink-centre`. Trim the box with `text-box: trim-both cap alphabetic` or balance the padding.

An icon beside a label centres on the label's cap height. An icon centred on the line box and sitting 1px low is `alignment-icon-with-label`.

Text of two sizes in one row shares a baseline. A 32px price centred beside its 14px `/month`, their baselines 6px apart, is `alignment-shared-baseline`. Set `align-self: center` on any button in that row.

Once text can wrap, the row top-aligns. An avatar centred beside a three-line name drifts to the middle line, and that is `alignment-top-when-wrapping`.

Play icons, arrows and triangles carry their weight on one side, so centring their ink box makes them look shifted. A play icon whose ink box sits dead centre in its button is `alignment-optical-glyph`. Nudge it toward its light side and name the value, such as `--play-nudge: 1px`. The script finds the weight from points along the outline, and passes an icon already nudged.

A nested surface's radius is the outer radius minus the inset. A 16px panel inside a 16px card at 8px inset is `alignment-concentric-radius`, and it takes 8px.

When that subtraction falls below 2px, the inner radius holds at 2px. A panel at 0 or 1px inside a rounded card reads as a mistake, and is `alignment-concentric-floor`.

## 5. Judge the weight

Look at the screenshot at 1x and name what the eye lands on first. Compare icon strokes with the text's stem weight, filled icons beside outline icons and circles drawn the same size as squares.

Circles and triangles need roughly 10% more size than a square to read as equal. A 2px icon stroke beside 1.5px text stems is `alignment-visual-weight`.

## 6. Report with proof

Copy [report.html](report.html) to `.alignment/<page>/index.html`, an ignored folder and never the source tree. Save the 2x screenshot beside it and write `report.js` in the shape its header comment shows, then open it.

The report draws the numbered outlines and cuts each zoomed crop from that screenshot, so write data only. A report with its own markup or crops cut by hand is `alignment-shipped-report`. A finding with no measurement and no rect is `alignment-annotated-proof`.

## 7. Fix only when asked

The report is the deliverable. When the user asks for fixes, change the token or primitive behind each finding. Rerun the script and the screenshot, then report what cleared.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `alignment-measure-the-render` | "The flex container centres it" | Measured in the running page at 2x | `MEDIUM` |
| `alignment-shared-edge` | Title inset 2px from its description | Both start on one ink line | `MEDIUM` |
| `alignment-even-gaps` | Rows at 8, 8 and 12px | Rows at 8, 8 and 8px | `MEDIUM` |
| `alignment-on-scale` | `padding: 6px` on a 4px scale | `padding: 8px` | `LOW` |
| `alignment-padding-over-gap` | `padding: 8px` around rows `16px` apart | `padding: 16px` | `MEDIUM` |
| `alignment-icon-side-padding` | `padding: 0 12px` on a button with a leading icon | `padding: 0 12px 0 10px` | `MEDIUM` |
| `alignment-whole-pixels` | `left: 50%; transform: translate(-50%, -50%)` on a 301px dialog, landing at x 489.5 | `position: fixed; inset: 0; display: grid; place-items: center` on its wrapper | `MEDIUM` |
| `alignment-ink-centre` | Label ink 2px low in its button | `text-box: trim-both cap alphabetic` | `MEDIUM` |
| `alignment-icon-with-label` | Icon centred on the line box | Icon centred on the cap height | `MEDIUM` |
| `alignment-shared-baseline` | A 32px price and its 14px `/month` centred, baselines 6px apart | `align-items: baseline` on the row | `MEDIUM` |
| `alignment-top-when-wrapping` | `align-items: center` beside a three-line name | `align-items: flex-start`, the avatar level with the first line | `MEDIUM` |
| `alignment-optical-glyph` | Play icon centred by its ink box | Play icon nudged `1px` right, named | `MEDIUM` |
| `alignment-concentric-radius` | 16px panel in a 16px card at 8px inset | 8px panel radius | `MEDIUM` |
| `alignment-concentric-floor` | A square panel in a 6px card at 8px inset | `border-radius: max(var(--card-radius) - 8px, 2px)`, a 2px panel radius | `MEDIUM` |
| `alignment-visual-weight` | 2px icon stroke beside 1.5px stems | Stroke matched to the text weight | `MEDIUM` |
| `alignment-shipped-report` | Crops cut by hand into a page written from scratch | `report.html` copied, only `report.js` written | `MEDIUM` |
| `alignment-annotated-proof` | "The button looks a bit off" | Finding 3, 1.8px low, with the crop | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. A miss visible at 1x on a primary surface, such as a heading column or a primary button, rises to `HIGH`.

**Format.** One finding per root cause, numbered to match the overlay:

```
1. file:line - [rule-id] what is wrong (measured values)
```

Cite the element from the script when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark canvas, image and cross-origin content as `Not verified`.
