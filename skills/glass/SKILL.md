---
name: glass
description: Builds real refractive glass on the project's own nav bars, sheets and cards, then measures text contrast over the worst backdrops and fixes legibility, with clean Safari and reduced-transparency fallbacks.
---

# Glass

This skill builds glass surfaces that bend what is behind them and stay readable over every backdrop. The work is the contrast: it measures each surface's text over the worst content that can scroll under it, and tunes the tint until it holds.

## Legibility is the craft, measured

Run it when the user says "make it glass", "liquid glass", "frosted nav" or "text unreadable on the blur". Glass is added only where the user asks, and it overrides the blur ban in `defaults` for those surfaces only.

Text on glass clears 4.5:1 at every size, because the backdrop moves under it. The large-text allowance in `color` does not apply here. Every number is read from a screenshot, never from a token.

Surface elevation, rings and nested cards belong to `defaults`. Ratios for flat surfaces belong to `color`. Whether to add the effect at all belongs to `restraint`. Opening the result belongs to `verify`.

## 1. Find the surfaces

List every surface that floats over scrolling content: nav bars, tab docks, sheets, cards, menus and toasts. Build the glass on the project's own components and tokens. A surface that is left out of the sweep is `glass-find-the-surfaces`.

## 2. Measure the worst backdrops

Run [probe.js](probe.js) in the page. Scroll the page in 130px steps through its whole height, in every theme. At each step call `window.__glass.hideText()`, take a viewport screenshot, call `showText()`, then pass the screenshot to `window.__glass.read()`.

Each reading is the contrast of the text colour against the 5th-percentile pixel under that text, measured through the real blur and refraction. Keep the three lowest as the worst-case backdrops. A white sky, a black and white check, a saturated photo and a wall of text are the usual three. A ratio taken from the token is `glass-measure-the-backdrop`.

Every reading under 4.5 is a finding. Read the numbers before changing anything, and name the surface, the text and the backdrop. "Looks fine over the hero" is `glass-read-the-worst-three`.

## 3. Tint per theme until it holds

A tint is a role token with its own value in each theme. The light theme tints toward white and takes dark text. The dark theme tints toward black, dims the backdrop with `brightness()` and takes light text. One grey tint shared by both themes is `glass-tint-per-theme`.

Find the smallest alpha that clears 4.5:1 on every reading, stepping 0.05 and re-running the sweep each time. A tint chosen by eye, or raised past what the sweep needs, is `glass-smallest-tint`. Raise the tint rather than the text weight, and never add a text shadow to rescue a ratio.

The rim and the refraction never sit under text. The rim is decoration, exempt from `color-ui-contrast`.

## 4. Refract the edge

Real glass bends what is behind its edge and leaves the middle flat. Pass `backdrop-filter` an SVG displacement filter whose map is neutral in the middle and pulls pixels in a bezel about 22px wide. Text never sits in the bezel, so it is never distorted. See [recipes.md](recipes.md).

Build the map for each surface's own size and radius, and rebuild it on resize. One map stretched across a nav bar and a card is `glass-refract-the-edge`.

Add a rim: a 1.5px gradient ring, bright at the top left and bottom right, with an inner top highlight. A flat `border: 1px solid rgba(255, 255, 255, 0.2)` is `glass-specular-rim`.

## 5. Fall back cleanly

Refraction is drawn by Chromium only. Gate it behind a Chromium check, and let every other browser take the blur and saturate path with the `-webkit-` prefix. A `url()` filter declared for everyone is `glass-refract-where-drawn`.

Where `backdrop-filter` is missing, use an opaque surface in the theme's solid token. Under `prefers-reduced-transparency: reduce`, use the same solid surface, with no blur and no refraction. A surface left translucent in either case is `glass-opaque-fallback`.

Run the sweep on every path: refracted, blur only and opaque. A fallback that was never measured is `glass-measure-the-fallbacks`.

A glass surface never sits behind another glass surface. Two blurs compound into mud and double the cost. That is `glass-no-glass-on-glass`.

## 6. Prove it

Put the before and after at each of the three worst backdrops side by side, with the measured ratio of each. Record the content scrolling under the glass. "Reads well now" is `glass-prove-the-worst-three`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `glass-find-the-surfaces` | Only the nav bar made glass and checked | Nav bar, dock, card and sheet listed and swept |
| `glass-measure-the-backdrop` | "The token is `#14161a`, so it passes" | The 5th-percentile ratio under the text, read from a screenshot |
| `glass-read-the-worst-three` | "Looks fine over the hero" | `dock "Explore": 1.3 over the wall of text, nav "Explore": 1.37 over the sky` |
| `glass-tint-per-theme` | `rgba(128, 128, 128, 0.3)` in both themes | `--glass-tint` per theme, with dark text on light and light text on dark |
| `glass-smallest-tint` | A tint of 0.9 picked by eye | The smallest 0.05 step that clears 4.5:1 on every reading |
| `glass-refract-the-edge` | One displacement map stretched over every surface | A map per surface, neutral in the middle, rebuilt on resize |
| `glass-specular-rim` | `border: 1px solid rgba(255, 255, 255, 0.2)` | A 1.5px gradient ring and an inner top highlight |
| `glass-refract-where-drawn` | `backdrop-filter: url(#glass)` for every browser | The filter behind a Chromium check, blur and saturate elsewhere |
| `glass-opaque-fallback` | A translucent surface under reduced transparency | `background: var(--glass-solid)` with `backdrop-filter: none` |
| `glass-measure-the-fallbacks` | The refracted path measured alone | The refracted, blur only and opaque paths each swept |
| `glass-no-glass-on-glass` | A glass menu opened over a glass nav bar | A solid menu over the glass bar |
| `glass-prove-the-worst-three` | "Reads well now" | Before and after at three backdrops, with their ratios |

## Reporting

**Severity.** `HIGH` is any reading under 4.5:1 on a surface, a translucent surface under reduced transparency or a refraction filter served to a browser that does not draw it. `MEDIUM` is one tint for both themes, a fallback never measured, glass over glass or a tint raised past what the sweep needs. `LOW` is a flat border for a rim, a map shared between surfaces or a fix with no before and after.

**Format.** One finding per root cause, with the measured ratio:

```
file:line - [rule-id] what is wrong (surface, backdrop, ratio)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a theme or a fallback path you could not run as `Not verified`.
