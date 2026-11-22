# Styles

The values that turn the user's description into a set's style. Every value is a starting point on a 24 grid, and the sample row settles the final one.

## Directions

Each direction is its own construction, not a filter over another. Map the description onto one row, so "rounded and friendly" reads as Round and "precise" as Technical. A description that fits no row becomes its own direction, described in these columns.

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

A native app may stay close to its platform's own symbols. That direction takes the platform's weight scale, matched to the system font, and draws only what the platform lacks. Its icons ship through the [Platform templates](#platform-templates).

## Fills

A fill is not a direction, and pairs with any of them. A set ships up to four: outline, fill, outline duo and fill duo. A set that ships a fill at a size draws it for every concept at that size.

| Fill | Built from | The second colour marks |
| --- | --- | --- |
| Outline | The skeleton, stroked | The accent part, such as a bell's clapper or a folder's tab |
| Fill | The outline's outer edge, filled | The same accent part |
| Outline duo | The outline over a soft back fill | The back fill |
| Fill duo | The fill's own paths, the accent kept at full and the rest soft | The soft part |

The fill's edge sits where the outline's stroke ended, so swapping outline for fill on selection keeps the icon's size. A shape whose meaning is its emptiness stays open in the fill, such as a lens, a ring or a frame.

Outline duo is redrawn wherever the outline leaves a gap, since a fill needs a closed edge. A trash body that stops short of its lid runs up to it. The back covers the one or two main shapes, never every enclosed area, so a gear's hub stays empty. Its edge sits under the stroke, between the centreline and the stroke's inner edge, so it never shows past the line.

Fill duo needs no new drawing. It takes the fill's paths, keeps the accent part at full and drops the rest to the soft opacity.

Mark the accent `data-layer="accent"` in outline and fill, and the soft part `data-layer="back"` in both duo fills. One selector, `[data-layer]`, then takes the app's second colour in every fill. Merge back shapes into one path, so one opacity never reads darker where two overlap.

Each duo fill takes one opacity for the whole set: 0.3 behind an outline and 0.4 in a fill duo, which carries the silhouette with no line. A second colour may replace the opacity.

A duo fill ships only at sizes where it passes in real rows. The smallest size usually ships outline and fill alone, since its back layer has no room. Check every fill in both themes, since one opacity reads differently on light and dark.

## Feedback words

A vague note names a feeling, not a fix. Show 2 or 3 variants that each change one property from its row, side by side, and let the user pick.

| The user says | Try one of |
| --- | --- |
| Harsh, sharp, cold, clinical | A larger radius, round ends, round joins, a stroke one step lighter |
| Soft, bubbly, toy-like, childish | A smaller radius, natural proportions instead of inflated ones, a stroke one step lighter |
| Heavy, loud, dark | A lighter stroke, fewer parts, smaller filled areas, open junctions |
| Thin, weak, faint, lost | A heavier stroke, filled when selected, a larger optical size |
| Busy, cluttered, noisy | Fewer parts, inner detail dropped, wider gaps between parts |
| Generic, boring, stock | One signature move across the set, such as lines run on to the keyline, a cut corner or a shared notch |
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
| A fill or a duo back layer | The outline's radius plus the offset outside, minus it inside | A fill sits half the stroke outside, so a 2.5 corner under a 1.25 stroke takes 3.125 |
| A pixel direction | None | Every corner |

After a radius change, reopen stars, bolts, arrowheads, chevrons and small badges first. They break before anything else.

## Reading the product

Read these only for what the user's answers left open, and never ask about them.

The stroke comes from the type. Draw a lowercase `l` of the interface font at 100px on a canvas and measure the dark run across its middle. Scale it by the label size over 100 and round to the nearest quarter.

Measure `l`, never `H`, since capital stems run heavier. Measure each size beside the type it ships next to, so a 24 icon beside a 20px medium title takes that title's stem.

Round terminals on `t`, `r` and `a` take round ends, and flat cuts take butt ends.

The control radius suggests the corners.

| Control radius | Directions |
| --- | --- |
| 0–4px | Technical, Neutral |
| 4–8px | Neutral, Soft |
| 8px and up, or pills | Soft, Round, Flowing |

The logo and illustrations narrow it further. Straight cuts lean Technical, circles lean Round, free curves lean Flowing, lettering by hand leans Hand-drawn and pixel marks lean Pixel.

A bold brand shape can overpower an interface at icon size. Where the logo is sharper or heavier than the type, the icons follow the type and borrow one detail from the logo.

The platform sets the default fill.

| Where icons sit | Convention |
| --- | --- |
| Bottom navigation on Android and the web | Line when unselected, filled when selected, heavier where no filled form exists |
| Tab bar in a native iOS app | Filled on every tab, the selected one marked by tint |
| Sidebar navigation beside labels | Line, the selected row marked by its background or tint |
| Toolbars, lists and rows beside text | Line |

Light line icons on dark read slightly slower, so a product that opens dark judges its sample on dark first.

## Platform templates

A native app ships its custom icons in the platform's own template, so they follow the system's weights, scales and text.

| Platform | Template | What it needs |
| --- | --- | --- |
| iOS and macOS | The custom symbol template exported from the system's symbol app, in its variable setup | Ultralight, Regular and Black at the small scale, filled paths with the same count, order and points so the other weights interpolate, and margins per variant |
| Android | A vector drawable on a 24 by 24 viewport | One file per style, tinted by the theme rather than a fixed colour |
| The web | The SVG tree in [formats.md](formats.md#svg-tree) | Nothing more |

Draw the Regular source first and get it right. Copy its paths into the Ultralight and Black sources, then only move points, since an added or removed point breaks interpolation.

