---
name: color
description: Holds text and control contrast to exact ratios, routes colour through role tokens and gives dark mode its own palette.
---

# Color

This skill holds the colour rules that apply on every screen. It covers contrast, role tokens, translucent neutrals, dark mode and what the accent is for.

## Ratios are exact, measured on screen

The contrast ratios here are exact and apply in every theme. They are WCAG 2 ratios, the method conformance claims and accessibility law cite. A ratio is read from the colour the screen draws, never guessed from a token's name. A ratio under the threshold is a finding in any style.

Taste values, such as off-white text, alpha neutrals and the gradient stops, yield to a palette the project already follows. The ratios never yield.

Searching for an existing token belongs to `reuse`. `color-scheme`, `theme-color`, the theme switch, status shown by colour alone and surfaces under reduced transparency belong to `defaults`. Whether a colour should be there at all belongs to `restraint`. A focus ring's style belongs to `defaults`, and its 3:1 change from the unfocused state is checked stop by stop in `keyboard`.

## Body text clears 4.5:1

Text under 24px, or under 18.66px when bold, meets 4.5:1 against what sits behind it. Larger text meets 3:1. Placeholders and secondary text count, and disabled controls do not. `#999` text on white, at 2.8:1, is `color-text-contrast`.

## Field edges and icons clear 3:1

The edge that shows where a field is, a toggle's track and an icon that carries meaning meet 3:1 against their surround. A field whose only edge is a `#e5e5e5` border on white, at 1.3:1, is `color-ui-contrast`. Dividers and the ring on a floating surface are decoration and exempt.

Native checkboxes, radios and range inputs take the accent through `accent-color`, and the drawn control meets 3:1 against its surface. With `color-scheme: light dark` on the root, they redraw for the dark theme. A default blue checkbox beside an orange accent is `color-accent-color`.

## Measure the colour on screen

Translucent colours and `opacity` composite over every layer behind them before the ratio is read. Read each theme and each surface the text appears on. A ratio taken from the token's hex while the text sits at `opacity: 0.6` is `color-measure-composited`.

Run [contrast.js](contrast.js) in the page through the browser's evaluate call. Treat each result as a candidate, and confirm it in a zoomed crop before reporting it. Each failure carries `suggestion`, the nearest colour at the same hue that passes. Fix with the role token closest to it. Each text finding also carries `lc`, its APCA lightness contrast.

## The ratio is the pass line

APCA lightness contrast (Lc) is a second read, never a pass. No standard requires it yet. White on `#f97316` reads at Lc 58 but fails at 2.8:1, and calling it a pass is `color-ratio-is-the-pass-line`.

The ratio overstates light text on dark surfaces. `#888888` on `#0a0a0a` passes at 5.6:1 yet reads at only Lc 38. Report Lc beside the ratio in the dark theme, and between two passing candidates take the higher absolute Lc.

## The contrast-color() function stays off mid-tones

`contrast-color()` returns white or black, whichever has the higher ratio. On a mid-tone fill the pick can pass and still read poorly. `#2277d3` gets black at 4.65:1 and Lc 33, while white reads at Lc 76.

Use it only on fills where its pick clears 7:1, a fill luminance under 0.1 or over 0.3. Give a mid-tone fill a paired token such as `--on-accent`. `contrast-color()` on a mid-blue button is `color-contrast-color-mid-tones`. Declare a fixed colour before it, which older browsers keep.

## Text over images takes a scrim

Text on a photo or a video sits on a gradient scrim or a solid plate. The ratio holds at the lightest point of the image under the text. White text over a bright sky is `color-scrim-under-text`.

## Components use role tokens

Components reference tokens named for their role, such as `--text-secondary` or `--surface-raised`. Only the theme file maps a role to a palette step. `color: var(--gray-500)` inside a component is `color-role-tokens`.

## States mix from their role token

Hover and pressed states of a coloured fill, such as `--accent`, derive from that token with `color-mix(in oklch, …)` or relative colour syntax. Every theme then carries them. Mix toward `--text-primary`, not black, so the dark theme lightens on hover. A hand-picked `#1d4ed8` hover beside `--accent: #2563eb` is `color-states-from-tokens`. The mixed fill is measured like any other.

## Neutrals on surfaces are translucent

Borders, dividers, hover fills and pressed fills use alpha neutrals, so they read on any surface beneath them. A solid `#f5f5f5` hover fill that vanishes on a grey card is `color-alpha-neutrals`.

## Dark mode is its own palette

Dark surfaces rise by getting lighter, because a shadow barely shows on a dark page. A dark popover the colour of the page, raised by a shadow alone, is `color-dark-raises-lighter`.

Accents and status colours take dark values tuned for contrast. The light `#2563eb` link reused on a `#0a0a0a` page, at 3.8:1, is `color-dark-tuned-accents`.

Dark body text is an off-white such as `#ededed`, which still reads at 16.9:1 on `#0a0a0a`. Pure `#ffffff` at 19.8:1 halates on near-black, and is `color-dark-off-white-text`.

Logos and brand images carry a variant or a treatment that reads in both themes. A dark logo on a dark surface is `color-logo-both-themes`. An image with a white background dims slightly in dark mode, with `filter: brightness(0.9)`.

## Increased contrast has its own tokens

Under `@media (prefers-contrast: more)` the role tokens remap. Small text reaches 7:1, translucent surfaces turn near-solid and translucent borders turn opaque. Read every colour in light, dark and increased contrast. A theme with no `prefers-contrast: more` block is `color-more-contrast`.

## Gradients blend in oklab and fade on a curve

A gradient between two hues interpolates `in oklab`, which keeps the middle clean without swinging through a third hue. `in srgb` greys the middle, and a blue to yellow gradient with a muddy grey middle is `color-gradient-interpolation`. A `color-mix()` between two hues takes `in oklab` too.

Use `in oklch` only when a saturated middle is wanted, and name the hue path. `in oklch shorter hue` takes the short way round the wheel, so blue to yellow passes through green. `in oklch longer hue` passes through magenta and red instead.

A fade to transparent, such as a scroll edge or a scrim, takes about 6 stops along an ease-out curve. Two linear stops leave a visible line where the fade meets the solid colour. `linear-gradient(transparent, black 24px)` is `color-eased-gradient`.

## The accent marks action

The accent colour marks the primary action, the selection and focus. An accent heading or a row of accent icons is `color-one-accent`.

Each view or region, such as a card, a toolbar or a form, holds one accent-filled button, and the rest are secondary or quiet. Two filled accent buttons side by side is `color-one-primary`. A dialog footer's order belongs to `overlays-button-order`.

Each status colour keeps one meaning. Red marks errors and destructive actions only. A red "New" badge is `color-status-meaning`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `color-text-contrast` | `color: #999` on white, 2.8:1 | `color: #737373`, 4.7:1 | `HIGH` |
| `color-ui-contrast` | A field edged by `#e5e5e5` on white, 1.3:1 | `border-color: #8a8a8a`, 3.5:1 | `HIGH` |
| `color-accent-color` | A default blue checkbox beside an orange accent | `accent-color: var(--accent)` at 3:1, with `color-scheme: light dark` on the root | `LOW` |
| `color-measure-composited` | "The token is `#171717`, so it passes" | The ratio of the drawn colour at `opacity: 0.6`, read on screen | `MEDIUM` |
| `color-ratio-is-the-pass-line` | "White on `#f97316` reads at Lc 58, so it passes" | 2.8:1 fails, so the fill darkens to `#c2410c`, 5.18:1 | `MEDIUM` |
| `color-contrast-color-mid-tones` | `color: contrast-color(#2277d3)`, black at 4.65:1 and Lc 33 | `color: var(--on-accent)` set to `#ffffff`, 4.52:1 and Lc 76 | `MEDIUM` |
| `color-scrim-under-text` | White text straight over a photo | An eased scrim from `rgba(0, 0, 0, 0.6)` at the bottom to transparent, under the text | `HIGH` |
| `color-role-tokens` | `color: var(--gray-500)` in `Card` | `color: var(--text-secondary)` | `MEDIUM` |
| `color-states-from-tokens` | `.button:hover { background: #1d4ed8 }` beside `--accent: #2563eb` | `background: color-mix(in oklch, var(--accent), var(--text-primary) 12%)` | `MEDIUM` |
| `color-alpha-neutrals` | `background: #f5f5f5` on hover | `background: var(--gray-a3)` on hover | `MEDIUM` |
| `color-dark-raises-lighter` | A dark popover at the page's `#0a0a0a` | The popover at `#1a1a1a` over the `#0a0a0a` page | `MEDIUM` |
| `color-dark-tuned-accents` | `#2563eb` links on `#0a0a0a`, 3.8:1 | `#60a5fa` in the dark theme, 7.8:1 | `MEDIUM` |
| `color-dark-off-white-text` | `--text-primary: #ffffff` on `#0a0a0a`, 19.8:1 | `--text-primary: #ededed`, 16.9:1 | `LOW` |
| `color-logo-both-themes` | The dark logo on the `#0a0a0a` page | A light logo variant in the dark theme | `MEDIUM` |
| `color-more-contrast` | One set of role tokens for every contrast setting | A `prefers-contrast: more` block with small text at 7:1, near-solid surfaces and opaque borders | `LOW` |
| `color-gradient-interpolation` | `linear-gradient(to right, #2563eb, #facc15)` with a grey middle | `linear-gradient(in oklab to right, #2563eb, #facc15)` | `LOW` |
| `color-eased-gradient` | `linear-gradient(transparent, black 24px)` | `linear-gradient(transparent, rgb(0 0 0 / 0.36) 5px, rgb(0 0 0 / 0.64) 10px, rgb(0 0 0 / 0.84) 14px, rgb(0 0 0 / 0.96) 19px, black 24px)` | `LOW` |
| `color-one-accent` | Section headings in the accent colour | Headings in `--text-primary`, the accent on the primary button | `LOW` |
| `color-one-primary` | `Save Draft` and `Publish` side by side, both accent-filled | `Publish` filled, `Save Draft` secondary | `MEDIUM` |
| `color-status-meaning` | A red "New" badge | A neutral or accent badge | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. `color-more-contrast` rises to `MEDIUM` when the project already targets increased contrast.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong (measured ratio)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a theme you did not open. Mark text over canvas, video and cross-origin frames as `Not verified`.
