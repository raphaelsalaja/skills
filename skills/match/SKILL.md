---
name: match
description: Rebuilds a named reference from its real source and computed values, then compares the two side by side.
---

# Match

This skill rebuilds something the user pointed at in another app, site or design. It works from the real source and its measured values, not from memory of how it looks.

## One to one means exact values

When the user says "one to one", "exact" or "like this", every value comes from the reference. A guessed value is a finding. When the user says "inspired by", carry the concept and use the project's own tokens.

Use it whenever a message names an app, a URL, a screenshot, a design file or a design reference library. Building with the project's parts belongs to `reuse`. Breaking a reference's motion into tracks on a timeline belongs to `deconstruct`. Checking the result runs in `verify`.

## 1. Open the real source

Open the reference itself: the live page, the installed app, the design file or the screenshot. Rebuilding from memory is `match-inspect-the-source`. When the reference is a native or desktop app, look at that app, not its website. Judging a desktop app by its marketing page is `match-same-platform`.

## 2. Read the values

Read computed styles, design tokens or measurements from the source. Write down sizes, spacing, radius, colours, type, durations and easing. A radius chosen by eye is `match-read-computed-values`.

Read each value once motion settles, when `el.getAnimations({ subtree: true })` returns an empty list. A computed value mid-transition is one frame, not the value. Read `getComputedStyle(el, "::before")`, `"::after"` and `"::placeholder"` too, since borders, icons and fades often live there.

Read the font each side actually renders with the DevTools protocol's `CSS.getPlatformFontsForNode`, not the first name in `font-family`. A rebuild that copies the stack but renders `Arial`, because the first font never loads in the project, is `match-rendered-font`.

Read motion from the running animations. Trigger the change, then read `getTiming()` and `getKeyframes()` from each entry in `el.getAnimations({ subtree: true })`. A guessed `200ms ease` on a menu that runs `240ms cubic-bezier(0.32, 0.72, 0, 1)` is `match-read-the-motion`.

A design file's type values need converting. Letter spacing of `-2%` is `-0.02em`, and a line height of `150%` is `1.5`. `letter-spacing: -2%` pasted into CSS is dropped by the browser, and is `match-convert-design-units`.

A screenshot measures in device pixels. Find its scale from the image width against the window, such as 2880px for a 1440 window, then divide every measurement by it. A 24px gap read off a 2× screenshot copied as `gap: 24px` is `match-measure-at-scale`. Sample a colour from a flat patch at least 4×4 pixels away from any edge, and mark it Not Verified.

## 3. Inventory the states

List every state the reference has: hover, pressed, focus, open, empty, loading, error, selected and disabled. Then list its transitions. Rebuilding the resting state alone is `match-inventory-states`.

Hold hover, focus and active with the DevTools protocol's `CSS.forcePseudoState`, then read the values again in each state. A hover colour read while the pointer drifts off the element is a guess.

## 4. Copy the named part

Rebuild the part the user named and nothing around it. Asked for the sidebar, copying the whole layout is `match-copy-the-named-part`. Carry the idea, not the brand. Their logo, product names and colours stay behind unless the user asked for them. That is `match-concept-not-brand`.

## 5. Compare side by side

Put the reference and the rebuild next to each other at the same size and in the same state. Name every difference left. "Looks close" with no comparison is `match-side-by-side`.

Capture both in every state from step 3 at one size and one device scale factor. Crop both to the same box, aligned at the part's top-left corner. In the page's Difference view, every pixel that still lights up is a difference to name. Copy [compare.html](compare.html) to `.match/<part>/index.html`, an ignored folder and never the source tree. Write `compare.js` beside it in the shape its header comment shows, with captures in `img/`, then open it.

The compare page ships with the skill, so write data only. A page with its own markup or styles is `match-shipped-compare`. Mark each value Match, Differs or Not Verified. The user sends what is left back with Copy Differences.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `match-inspect-the-source` | A menu rebuilt from memory | The live menu opened and inspected |
| `match-same-platform` | A desktop app judged by its website | The installed app opened |
| `match-read-computed-values` | `border-radius: 8px` by eye | The `6px` read from computed styles |
| `match-rendered-font` | `font-family: "Brand Sans", Arial` copied, `Arial` rendering in the rebuild | Both sides reporting the same family from `CSS.getPlatformFontsForNode` |
| `match-read-the-motion` | `transition: transform 200ms ease` guessed | `240ms cubic-bezier(0.32, 0.72, 0, 1)` read from `getTiming()` during the change |
| `match-convert-design-units` | `letter-spacing: -2%` pasted from the design file | `letter-spacing: -0.02em` |
| `match-measure-at-scale` | `gap: 24px` read off a 2× screenshot | `gap: 12px`, 24 device pixels divided by 2 |
| `match-inventory-states` | The resting state only | Hover, pressed, open, empty and error rebuilt |
| `match-copy-the-named-part` | The whole layout copied for "the sidebar" | The sidebar only |
| `match-concept-not-brand` | Their logo and accent colour shipped | The pattern in the project's tokens |
| `match-side-by-side` | "Looks close" | Both at one size, differences listed |
| `match-shipped-compare` | A compare page written from scratch | `compare.html` copied, only `compare.js` written |

## Reporting

**Severity.** `HIGH` is a rebuild made without opening the source, or a missing state the user named. `MEDIUM` is a guessed value under "one to one", a part copied beyond the ask or a hand-written compare page. It is also a fallback font rendering on either side, guessed motion, a design-file unit pasted unconverted or a screenshot measured in device pixels. `LOW` is a remaining difference that was found and named.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every value you could not read from the source as `Not verified`.
