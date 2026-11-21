# Styles

The directions, the references, the signals and the questions that pick a set's style. Every value is a starting point on a 24 grid. The user's eye settles the final one, and the stroke step checks it beside the product's type.

## Directions

Each direction is its own construction, not a filter over another. Offer only the 2 or 3 the references and the signals support. A reference the user loves that fits no row becomes its own direction, described in these columns.

| Direction | Stroke | Radius (outside / inside) | Ends and joins | Angles and curves | Detail | Reads as |
| --- | --- | --- | --- | --- | --- | --- |
| Technical | 1.5 | 0 (0 / 0) | Butt ends, miter joins | 0°, 45° and 90° only, arcs from circles | Minimal | Precise, dense, serious |
| Neutral | 1.5 | 1 (1.75 / 0.25) | Butt ends, miter joins on unrounded corners | 0°, 45° and 90°, true arcs | Minimal | Plain, calm, out of the way |
| Soft | 1.5 | 2 (2.75 / 1.25) | Round ends, round joins | 0°, 45° and 90°, true arcs | Moderate | Composed and approachable |
| Round | 2 | 3 (4 / 2) | Round ends, round joins | Circles and arcs before straight corners, wide counters | Moderate | Warm, friendly, consumer |
| Flowing | 1.5–2 | 3 (3.75–4 / 2–2.25) | Round ends, round joins | Free curves wherever a shape bends | Moderate | Fluid, distinctive, expressive |
| Chunky | 2.5–3, or filled masses with line details | 4 (5.25–5.5 / 2.5–2.75) | Round ends, round joins | Inflated simple shapes, drawn on a 48 grid and shown from 24 up | Low | Playful, cartoonish, loud |
| Hand-drawn | 1.5–2, varying by up to 0.25 | Loose | Round ends | A slight wobble, lines that overshoot or stop short | Moderate | Human, crafted, informal |
| Pixel | Whole pixels | 0 | Square | Stepped diagonals at 1:1 or 2:1 | Low | Retro, playful, nostalgic |

The radius is the path's own, the value `style.json` keeps. A stroke adds half its width outside the corner and takes half inside, never below 0, which the brackets show. A filled direction rounds its shapes by the radius directly.

For another size, scale a value by the size over 24 and round it to the nearest quarter. A 2 stroke becomes 1.25 at 16, and a 3 radius becomes 2.

A dimensional direction, such as soft 3D, clay or glass, is offered only for icons shown at 32px and up, such as pictograms and empty states. It faces straight on and never replaces the UI icons.

A native app may stay close to its platform's own symbols. That direction takes the platform's weight scale, matched to the system font, and draws only what the platform lacks. Its icons ship through the templates under [Radius, logo and platform](#radius-logo-and-platform).

## Duotone

Duotone is a fill, not a direction, and pairs with any of them. It comes in two forms:

| Form | Back layer | Front layer |
| --- | --- | --- |
| Line duo | The enclosed areas of a line icon, filled | The line icon, which reads alone |
| Solid duo | One filled shape | Filled details in a second colour, which read alone |

Mark the back layer `data-layer="back"` in the source, so the app can colour it on its own. It takes one opacity for the whole set, from 0.2 to 0.4, or a second colour. Where the layers overlap, the front cuts the back, so an overlap never reads darker.

Duotone works at every size the set ships when its smallest size passes in real rows. At 12 and 16, the back layer keeps to large simple areas and drops thin details. Check it in both themes, since one opacity reads differently on light and dark.

## The taste test

Put it on the review page before the first checkpoint when the request names no references. Show 6 to 8 open icon sets that span the directions. Pick from a sharp set, a neutral one, a soft one, a round one, a filled one, a duotone one, a hand-drawn one and a pixel one.

Each set draws the same 6 concepts: a folder, a search, a gear, a bell, a user and an arrow. Put each set in its own row on the review page, beside labels in the product's font, in both themes.

Ask which row feels closest and which feels furthest, then ask why in a free answer. The closest row is a starting point, not the answer. Write what the user liked about it as values in `style.md`.

## Questions about feel

Ask 2 or 3 in plain words, and keep the answers in the user's own words before turning them into values.

- What should someone feel the first time they see the sidebar?
- What should the icons never feel like?
- Which product's icons feel closest, and what would you change about them?
- If the icons were a person, what would they wear?
- Which current icon bothers you most, and why?
- Where do icons sit most: dense lists, toolbars, navigation, empty states or marketing?

## Sliders

Ask 3 at the first checkpoint, each as one question with 4 positions and no middle.

| Slider | The left leans | The right leans | But not |
| --- | --- | --- | --- |
| Serious to Playful | Technical, Neutral | Round, Chunky | Playful, but not childish |
| Classic to Modern | Neutral, Soft | Technical, Flowing | Modern, but not cold |
| Quiet to Loud | Neutral, a light stroke, line only | Chunky, filled or duotone | Loud, but not crowded |
| Refined to Raw | Technical, Flowing | Hand-drawn, Pixel | Raw, but not careless |

Keep the two marks furthest from the middle. Write each as "X, but not Y" in `style.md`, then judge every tile against the "but not" as well.

## Feedback words

A vague note names a feeling, not a fix. Show 2 or 3 variants that each change one property from its row, side by side, and let the user pick.

| The user says | Try one of |
| --- | --- |
| Harsh, sharp, cold, clinical | A larger radius, round ends, round joins, a stroke one step lighter |
| Soft, bubbly, toy-like, childish | A smaller radius, natural proportions instead of inflated ones, a stroke one step lighter |
| Heavy, loud, dark | A lighter stroke, fewer parts, smaller filled areas, open junctions |
| Thin, weak, faint, lost | A heavier stroke, filled when selected, a larger optical size |
| Busy, cluttered, noisy | Fewer parts, inner detail dropped, wider gaps between parts |
| Generic, boring, stock | One signature move from the voice, such as lines run on to the keyline, a cut corner or a shared notch |
| Dated, old | Less detail, no gradients or depth, one stroke everywhere |
| Inconsistent, messy | The parts register, the keyline each icon sits on, one angle for diagonals |
| Off, wrong, with no word | Weight, size, alignment and angle against the neighbours, one at a time |

When none of the variants lands, ask the user to point at one icon that feels most wrong and one that feels most right. The difference between them is the property.

## Radius by part

A radius in `style.json` is the largest a corner takes. Each corner takes less where its segments are short or its angle is sharp. Work it out in this order, on a 24 grid with a set radius of 2.

| Corner | Radius | Example |
| --- | --- | --- |
| Any corner | The set radius or a quarter of the shorter segment, whichever is smaller | Segments of 10 and 6 take 1.5 |
| An angle under 60° | Half of the above | A star point of 3.4 at 36° takes 0.425 |
| 3 or more lines meeting | None | The centre of an asterisk |
| A line that ended on a corner now rounded | The line stops on the arc, along its own direction | A cube's back edge meets the rounded outer corner instead of poking past it |
| A silhouette or duotone back layer | The outline's radius plus the offset outside, minus it inside | A 2.5 corner under a 0.625 offset takes 3.125 |
| A pixel direction | None | Every corner |

After a radius change, reopen stars, bolts, arrowheads, chevrons and small badges first. They break before anything else.

## Reading the type

Measure the interface typeface at body size, in the weight icons sit beside. Measure only what changes a choice. The stem width almost always does, and the rest settles close calls between two directions.

| Feature | How to measure | Icon setting |
| --- | --- | --- |
| Stem width | The stem of a lowercase `l` at body size, in pixels: draw it at 100px on a canvas, measure the dark run across its middle and scale by body size over 100 | The stroke at the icon's shipped size, to the nearest quarter |
| Label weight | The weight of labels beside icons | A heavier label takes the heavier end of the range |
| Contrast | The thickest stroke of `o` over its thinnest | Above about 1.5:1, the light end of the range |
| Apertures | How far `c`, `e` and `a` open | Open apertures open arrowheads and break closed outlines; closed ones keep shapes closed |
| Terminals | How the strokes of `t`, `r` and `a` end | Round terminals take round ends; flat or angled cuts take butt ends |
| Corners | Where strokes meet in `M`, `N` and `V` | Round joins or miter joins to match |
| Ink traps | Notches where strokes meet in `M` or `n` | Wider gaps at junctions, written into the voice |
| x-height | x-height over cap height | A low x-height shortens arrowheads and shrinks badges; a high one widens counters |

Measure `l`, never `H`. Capital stems run heavier, such as 1.4 against 1.26 at 14px, which moves the nearest quarter, and labels are mostly lowercase. A row across the middle of `H` also runs along its bar and reads the whole letter's width.

Measure each size beside the type it ships next to. A 24 icon beside a 20px medium title takes that title's stem, such as 2.26, not the 14px label's.

## Radius, logo and platform

The control radius suggests the corners.

| Control radius | Directions |
| --- | --- |
| 0–4px | Technical, Neutral |
| 4–8px | Neutral, Soft |
| 8px and up, or pills | Soft, Round, Flowing |

The logo and illustrations narrow it further. Straight cuts lean Technical, circles lean Round, free curves lean Flowing, lettering by hand leans Hand-drawn and pixel marks lean Pixel. Icons beside existing illustrations share their corners and ends.

A bold brand shape can overpower an interface at icon size. Where the logo is sharper or heavier than the type, the icons follow the type and borrow one detail from the logo.

The platform sets the default fill.

| Where icons sit | Convention |
| --- | --- |
| Bottom navigation on Android and the web | Line when unselected, filled when selected, heavier where no filled form exists |
| Tab bar in a native iOS app | Filled on every tab, the selected one marked by tint |
| Sidebar navigation beside labels | Line, the selected row marked by its background or tint |
| Toolbars, lists and rows beside text | Line |

Line and filled icons are recognised about as fast overall. Light line icons on dark read slightly slower, so a product that starts dark judges its tiles on dark first.

A native app ships its custom icons in the platform's own template, so they follow the system's weights, scales and text.

| Platform | Template | What it needs |
| --- | --- | --- |
| iOS and macOS | The custom symbol template exported from the system's symbol app, in its variable setup | Ultralight, Regular and Black at the small scale, filled paths with the same count, order and points so the other weights interpolate, and margins per variant |
| Android | A vector drawable on a 24 by 24 viewport | One file per style, tinted by the theme rather than a fixed colour |
| The web | The SVG tree in [formats.md](formats.md#svg-tree) | Nothing more |

Draw the Regular source first and get it right. Copy its paths into the Ultralight and Black sources, then only move points, since an added or removed point breaks interpolation.

## The questions

The direction question is single-select. The first option is the recommendation, and each option gives the direction, its key values and the reference or signal behind it.

```
Round (Recommended) - 2 stroke, round ends, 3 radius - matches the 10px controls and the circles in the logo
Soft - 1.5 stroke, round ends, 2 radius - closest to the set you linked
Keep the old set's style - 1.25 stroke, butt ends, 1 radius - as measured in the audit
```

The fill question follows, with the platform's convention first.

```
Line, filled when selected (Recommended) - the phone layout has bottom navigation
Line only
Filled throughout
Duotone - a translucent back layer under the line, coloured on its own
```
