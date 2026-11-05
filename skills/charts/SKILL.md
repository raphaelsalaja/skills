---
name: charts
description: Finds the chart already in the project and adds scrubbing, a range morph, a first draw-in and a dark palette.
---

# Charts

This skill makes a chart feel made by hand. It finds the chart already in the project and adds scrubbing, a range morph, a first draw-in and a dark palette.

## The layer is exact, the library stays

The snap, the readout, the morph and the draw-in are exact. They apply to every line, area and bar chart the work builds or edits. A chart that is only correct is a finding.

Run it for `polish this chart`, `make the graph feel better`, `add scrubbing` or `chart interactions`. Also run it when the work builds or edits a line, area or bar chart.

Which chart to change belongs to `scope`. Keeping the project's chart component belongs to `reuse`. Labels belong to `copy`. Curves, the gesture's keyboard twin and the reduced-motion cross-fade belong to `motion`. Contrast belongs to `color`. Tabular figures and focus rings belong to `defaults`. A scrub that drops frames belongs to `frames`. Opening the recording belongs to `verify`.

## 1. Find the chart that is there

Search the project and add the layer to the chart that is already there, whatever draws it. Replacing that chart with another library is `charts-keep-the-library`.

A legend, a brush or an export control cites `restraint`. The overlay, the morph and the draw-in are written out in [recipes.md](recipes.md).

## 2. Scrub on a hairline that snaps

One transparent rectangle covers the plot and receives the pointer. A listener on the stroke or on each bar is `charts-hit-the-plot`.

A 1px hairline spans the plot and a 6px dot sits on the snapped point. On a line or an area the point is the one whose x is nearest the pointer. On a bar chart it is the band that contains the pointer. A hairline left between two points is `charts-snap-the-crosshair`.

The hairline shows while the pointer is over the plot or a finger is down, and hides when the pointer leaves or the finger lifts.

Left and Right step one point. Home and End jump to the ends. A scrub with no keys cites `motion-gesture-alternative`. The plot is one tab stop, and its ring cites `defaults`.

Move the hairline and the readout through a ref or a custom property. Driving them through React state on each pointer move cites `frames-animate-outside-render`. See [recipes.md](recipes.md#overlay).

## 3. Read the value in one place

The rolling readout shows the snapped point's value and its label, anchored above the plot, updating in place. At rest it shows the last point. Format the number with the locale rules in `defaults`, and use tabular figures from there too. A tooltip that tracks the pointer, or a value that eases toward the snapped point, is `charts-anchor-the-readout`. See [recipes.md](recipes.md#readout).

## 4. Morph on a range change

Switching range morphs the line, the area or the bars from the old shape to the new one over 200ms, on the movement curve in `motion`. Resample both series to the larger point count first, then interpolate. A range that remounts the chart or swaps the path in one frame is `charts-morph-the-range`. See [recipes.md](recipes.md#range-morph).

The selected range sets `aria-pressed`. Range labels follow `copy`. Keeping that range in the URL cites `defaults`.

## 5. Draw the series in once

On first view the stroke draws from the start of the series to the end over 400ms, once, on the ease-out in `motion`. The fill fades in over the same 400ms. A second series waits the staged stagger in `motion`. Remove the dash array when the draw-in ends, so a later morph is not clipped. A series painted whole, or a draw-in that runs again on a range change, is `charts-draw-in-once`. See [recipes.md](recipes.md#draw-in).

## 6. Let a finger scrub

Pointer events drive the scrub for mouse and touch. The plot sets `touch-action: pan-y`, so a sideways drag scrubs and a vertical drag still scrolls. Where there is no CSS, a pan gesture on the plot is the same rule. A chart that listens only to mouse move is `charts-touch-scrubs`. See [recipes.md](recipes.md#touch).

## 7. Tune dark on its own

Series, grid, crosshair and readout each have a dark value written beside the light one. With no token, the grid is black at 8% in light and white at 12% in dark. The crosshair is black at 40% in light and white at 55% in dark. Reusing the light series colour in the dark theme is `charts-tune-dark-mode`. Contrast of those colours belongs to `color`. See [recipes.md](recipes.md#dark-values).

## 8. Keep the scrub under reduced motion

Under reduced motion the draw-in does not run, and the range change uses the opacity cross-fade in `motion`. The crosshair still jumps to the snapped point with no easing. A draw-in that still plays, or a crosshair that glides, is `charts-reduced-motion`. See [recipes.md](recipes.md#reduced-motion).

## 9. Record the scrub

Record one video of a pointer scrubbing the series, then one range change. Save the video beside the change. A reply that says the chart feels better, with no video of a scrub, is `charts-record-the-scrub`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `charts-keep-the-library` | A Recharts line rewritten as a canvas | The crosshair added on the chart already there |
| `charts-hit-the-plot` | `onMouseMove` on the `<path>` | One transparent rect over the plot |
| `charts-snap-the-crosshair` | A hairline left halfway between two points | A 1px line and a 6px dot on the nearest point |
| `charts-anchor-the-readout` | A tooltip whose `left` tracks `clientX` | The value and the label anchored above the plot |
| `charts-morph-the-range` | `key={range}` remounting the chart | Both series resampled, the shape interpolated over 200ms |
| `charts-draw-in-once` | The path at full length on first paint | `stroke-dashoffset` from the length to 0 over 400ms, once |
| `charts-touch-scrubs` | `onMouseMove` and no touch handler | Pointer events and `touch-action: pan-y` on the plot |
| `charts-tune-dark-mode` | The light series colour reused on a dark page | A dark series colour written beside the light one |
| `charts-reduced-motion` | The draw-in still playing under reduced motion | The series in place, the range change a cross-fade |
| `charts-record-the-scrub` | "The chart feels better" | A video of one scrub and one range change |

## Reporting

**Severity.** `HIGH` breaks use. That is a chart a finger cannot scrub, or a chart called done with no scrub video.

`MEDIUM` is a hairline between points, a readout that follows the pointer or a range that remounts. It is also a missing or repeated draw-in, a light series reused in dark mode or a draw-in that ignores reduced motion. It is also a chart replaced with another library.

`LOW` is a listener on the stroke instead of the plot.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a chart you did not open. When the miss is the work and not a file, cite `request 2 - [rule-id]`. Mark a recording you could not take as `Not verified`.
