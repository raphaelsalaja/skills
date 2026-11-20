# Styles

The directions, the signals and the questions that pick a set's style. Every value is a starting point on a 24 grid, and the stroke step settles the final one beside the product's type.

## Directions

Each direction is its own construction, not a filter over another. Offer only the 2 or 3 the signals support.

| Direction | Stroke | Corners outside / inside | Ends and joins | Angles and curves | Detail | Reads as |
| --- | --- | --- | --- | --- | --- | --- |
| Technical | 1.5 | 0 / 0 | Butt ends, miter joins | 0°, 45° and 90° only, arcs from circles | Minimal | Precise, dense, serious |
| Neutral | 1.5 | 2 / 0 | Butt ends, miter inside corners | 0°, 45° and 90°, true arcs | Minimal | Plain, calm, out of the way |
| Soft | 1.5 | 2 / 1 | Round ends, round joins | 0°, 45° and 90°, true arcs | Moderate | Composed and approachable |
| Round | 2 | 3 / 2 | Round ends, round joins | Circles and arcs before straight corners, wide counters | Moderate | Warm, friendly, consumer |
| Flowing | 1.5–2 | 3 / 2 | Round ends, round joins | Free curves wherever a shape bends | Moderate | Fluid, distinctive, expressive |
| Chunky | 2.5–3, or filled masses with line details | 4 / 2 | Round ends, round joins | Inflated simple shapes, drawn on a 48 grid and shown from 24 up | Low | Playful, cartoonish, loud |
| Hand-drawn | 1.5–2, varying by up to 0.25 | Loose | Round ends | A slight wobble, lines that overshoot or stop short | Moderate | Human, crafted, informal |
| Pixel | Whole pixels | 0 / 0 | Square | Stepped diagonals at 1:1 or 2:1 | Low | Retro, playful, nostalgic |

Duotone is a fill, not a direction, and pairs with any line direction. Its second layer fills enclosed areas at one opacity for the whole set, from 0.3 to 0.4. The first layer reads alone, and duotone ships from 20px up only.

A dimensional direction, such as soft 3D, clay or glass, is offered only for icons shown at 32px and up, such as pictograms and empty states. It faces straight on and never replaces the UI icons.

A native app may stay close to its platform's own symbols. That direction takes the platform's weight scale, matched to the system font, and draws only what the platform lacks.

## Reading the type

Measure the interface typeface at body size, in the weight icons sit beside. The type decides more than any adjective.

| Feature | How to measure | Icon setting |
| --- | --- | --- |
| Stem width | The vertical stroke of `l` or `H` at body size, in pixels | The stroke at that size, to the nearest quarter |
| Label weight | The weight of labels beside icons | A heavier label takes the heavier end of the range |
| Contrast | The thickest stroke of `o` over its thinnest | Above about 1.5:1, the light end of the range |
| Apertures | How far `c`, `e` and `a` open | Open apertures open arrowheads and break closed outlines; closed ones keep shapes closed |
| Terminals | How the strokes of `t`, `r` and `a` end | Round terminals take round ends; flat or angled cuts take butt ends |
| Corners | Where strokes meet in `M`, `N` and `V` | Round joins or miter joins to match |
| Ink traps | Notches where strokes meet in `M` or `n` | Wider gaps at junctions, written into the voice |
| x-height | x-height over cap height | A low x-height shortens arrowheads and shrinks badges; a high one widens counters |

## Radius, logo and platform

The control radius sets the corners.

| Control radius | Directions |
| --- | --- |
| 0–4px | Technical, Neutral |
| 4–8px | Neutral, Soft |
| 8px and up, or pills | Soft, Round, Flowing |

The logo and illustrations narrow it further. Straight cuts lean Technical, circles lean Round, free curves lean Flowing, lettering by hand leans Hand-drawn and pixel marks lean Pixel. Icons beside existing illustrations share their corners and ends.

The platform sets the default fill.

| Where icons sit | Convention |
| --- | --- |
| Bottom navigation on Android and the web | Line when unselected, filled when selected, heavier where no filled form exists |
| Tab bar in a native iOS app | Filled on every tab, the selected one marked by tint |
| Toolbars, lists and rows beside text | Line |

Line and filled icons are recognised about as fast overall. Light line icons on dark read slightly slower, so a product that starts dark judges its tiles on dark first.

## Sliders

Ask these when the product has no type, brand or illustrations to read. Ask 3, each as one question with 4 positions and no middle.

| Slider | The left leans | The right leans | But not |
| --- | --- | --- | --- |
| Serious to Playful | Technical, Neutral | Round, Chunky | Playful, but not childish |
| Classic to Modern | Neutral, Soft | Technical, Flowing | Modern, but not cold |
| Quiet to Loud | Neutral, a light stroke, line only | Chunky, filled or duotone | Loud, but not crowded |
| Refined to Raw | Technical, Flowing | Hand-drawn, Pixel | Raw, but not careless |

Keep the two marks furthest from the middle. Write each as "X, but not Y" in `style.md`, then judge every tile against the "but not" as well.

## The questions

The direction question is single-select. The first option is the recommendation, and each option gives the direction, its key values and the signal behind it.

```
Round (Recommended) - 2 stroke, round ends, 3 radius - matches the 10px controls and round terminals
Soft - 1.5 stroke, round ends, 2 radius - closer to the regular label weight
Keep the old set's style - 1.25 stroke, butt ends, 1 radius - as measured in the audit
```

The fill question follows, with the platform's convention first.

```
Line, filled when selected (Recommended) - the phone layout has bottom navigation
Line only
Filled throughout
Duotone - 20px and up only
```
