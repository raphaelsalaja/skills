---
name: bones
description: Gives every async view a layout-matched skeleton from its loaded layout, times the cross-fade and proves it with a side-by-side recording.
---

# Bones

This skill gives every async view a skeleton that matches its loaded layout. It measures the real boxes, wires the handoff and proves the pair with a recording.

## Boxes come from the loaded view

Measure every box. Do not draw a skeleton by eye. Radii, gaps and type come from the project's tokens.

The wait itself belongs to `defaults`. A loading branch that returns nothing is `defaults-instant-feedback`. The delay, the minimum time on screen and a skeleton that matches its layout are `defaults-no-flicker-loading`. A busy button that keeps its label is `defaults-loading-button`.

The cross-fade belongs to `motion`, as `motion-opacity-for-chrome`. Movement under reduced motion belongs to `motion-reduced-motion`. Frame cost of the handoff belongs to `frames`. A looping before and after clip belongs to `clip`. Forcing the loading state open on one page belongs to `lab`. Opening the running result belongs to `verify`.

Use it when the user wants skeletons, loading states or layout shift fixed. Use it when the app should feel instant, or when someone asks what a page looks like while it loads.

## 1. Find the waits

Search for `isLoading`, `isPending`, a Suspense `fallback`, `return null` while data is in flight, a spinner and an image with no set size. A view left on a spinner or on nothing is `bones-find-every-wait`.

## 2. Render the loaded view

Render each view with a fixture or with realistic data, in the state the user actually sees. A skeleton drawn from the empty branch is `bones-from-the-loaded-layout`.

## 3. Measure each block

Run [measure.js](measure.js) in the loaded view. It returns each block's box. Text comes back as line count, line height and last-line width. Avatars, images, buttons and cards come back as boxes. A rectangle chosen by eye is `bones-measure-the-box`.

## 4. Write the skeleton beside the view

Write one skeleton component next to each view. Use the project's skeleton primitive. With none, use the pulsing block in the header of `measure.js`, and do not pulse it under reduced motion. A second skeleton system is `bones-one-primitive`.

Radii, gaps and line height use the project's tokens. A literal `border-radius` or `gap` in the skeleton is `bones-tokens-not-numbers`. Line widths are the measured ones.

## 5. Reserve the image box

Give every image its aspect ratio before it loads, from the measured box. An image that arrives and pushes the layout is `bones-reserve-the-ratio`.

## 6. Hand off without a flash

Follow the delay and the minimum named above. Cross-fade the content in. Under `prefers-reduced-motion: reduce`, swap in one frame with no fade. A fade that still runs is `bones-instant-when-reduced`.

## 7. Add a latency switch

Add a development-only query such as `?latency=slow3g` that delays every async view the same way. A wait you can see only on a real slow network is `bones-latency-switch`. Keep the switch out of production.

## 8. Prove the pair

For each view, write CLS before and after. Save an image of the skeleton at 50% over the loaded view. Record before and after at that slow latency, side by side. A match claimed with no overlay and no CLS is `bones-overlay-and-cls`. A fix with no recording is `bones-before-and-after`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `bones-find-every-wait` | `if (isLoading) return null` | The view's skeleton |
| `bones-from-the-loaded-layout` | A skeleton of the empty state | A skeleton of the loaded card |
| `bones-measure-the-box` | A 14px bar drawn by eye | The line's measured height and last-line width |
| `bones-one-primitive` | A new shimmer beside the project's `Skeleton` | The project's `Skeleton` |
| `bones-tokens-not-numbers` | `border-radius: 7px` on a bone | `border-radius: var(--radius-2)` |
| `bones-reserve-the-ratio` | An `img` with no width or height | `aspect-ratio` from the measured box |
| `bones-instant-when-reduced` | A 200ms cross-fade under reduced motion | An instant swap |
| `bones-latency-switch` | Loading visible only on a slow network | `?latency=slow3g` in development |
| `bones-overlay-and-cls` | "The skeleton matches" | CLS before and after, plus the 50% overlay |
| `bones-before-and-after` | "It feels faster" | A side-by-side recording at `slow3g` |

## Reporting

**Severity.** `HIGH` is a view left on a spinner or on nothing. It is also a before and after with no recording.

`MEDIUM` is a skeleton of the empty state, a box drawn by eye or a second primitive. It is also a literal radius or gap, an image that shifts or a fade under reduced motion. It is also a missing latency switch, one shipped to production or a match with no overlay.

`LOW` is CLS given for the page and not for each view.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every view you could not load as `Not verified`.
