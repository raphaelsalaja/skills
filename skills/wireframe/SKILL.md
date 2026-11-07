---
name: wireframe
description: Turns the running page into a structural wireframe and back, on a hard wipe, and reads spacing from the live geometry.
disable-model-invocation: true
---

# Wireframe

This skill turns a running page into a low-fidelity structural view and back. The layout stays put, and a hard wipe covers it with filled shapes measured from the page.

## Measured shapes, then the wipe

Use it when someone asks to see the running interface as a wireframe. The ground, the marks and the wipe are exact. Ground is `#F2F2F2`, a light surface is `#FFFFFF`, a control is `#E4E4E7` and a mark is `#C7C6C9`. The wipe is `240ms` linear.

The view is a development inspection. It never stays mounted and it never ships.

A spacing audit belongs to `alignment`. House motion belongs to `motion`. A page of forced states belongs to `lab`. This view does not export a spec, draw a loading placeholder or open a second page.

## 1. Load the runtime

Open the page in the state the user named. Evaluate [wireframe.js](wireframe.js) in that page. It installs `window.__wireframe` and draws nothing. A sketch of boxes in a new file is `wireframe-live-geometry`.

## 2. Enter on the local page

Call `window.__wireframe.enter()`. It refuses a host that is not local unless the call passes `allowRemote: true`, which a production page must not set. Mounting it in a shipped bundle is `wireframe-dev-only`.

The ground covers the viewport. Text becomes one rounded bar per line rectangle. A bar is `0.62em` tall, centred on the line rectangle and as wide as that rectangle. Images, icons and avatars become filled shapes on their own boxes, using the element's radius. Outlined boxes are `wireframe-filled-shapes`. One bar per paragraph is `wireframe-text-lines`.

A node with `data-wireframe-ignore` stays real and receives clicks.

## 3. Wipe left to right

The cover enters on a hard vertical edge moving left to right, and leaves on a hard vertical edge moving left to right. The edge is a `clip-path` inset. Opacity and blur stay out of it. A fade, a blur or a right-to-left edge is `wireframe-hard-wipe`.

Under `prefers-reduced-motion: reduce` the view swaps with no animation. A wipe that still runs is `wireframe-reduced-motion`.

## 4. Stay registered

Shapes use the live client rectangles, so the page does not reflow. Compare `shapes()` to the live rectangles before calling the view done. The runtime draws its own nodes and does not clone the document. A jump when the view opens is `wireframe-no-shift`. A cloned tree, with copied ids or copied handlers, is `wireframe-no-clone`.

Clicks, keys and drags land on the cover, not on the page under it. A control that still fires is `wireframe-block-input`. Escape calls `exit()`. Focus returns to the element that had it.

## 5. Follow the page

Scroll, resize and DOM edits remeasure on the next frame. Nested scrollers scroll under the pointer. A shape left behind after a scroll is `wireframe-follow-the-page`.

## 6. Read the spacing

Hover draws a blue fill at `rgba(20, 131, 244, 0.16)`, a `#1483F4` box, extended guides and badges. Guides run `24px` past each edge of the box. A container badges its padding, the first eight gaps between its children and its size. A leaf badges the gap to each neighbour and its size. The numbers are `Math.round` of those distances. A badge of `8` that was not measured is `wireframe-measured-gaps`.

## 7. Put it back

`exit()` removes the cover, the listeners and any style it set, and restores focus. `destroy()` removes the runtime as well. An exit that leaves a node, a listener or a lifted `z-index` is `wireframe-clean-exit`.

## 8. Name what it cannot see

Same-origin frames and open shadow roots are walked. Cross-origin frames, closed shadow roots, canvas pixels and pseudo-elements are one box or nothing. Outside list markers are not drawn. Say which, and mark them `Not verified`. A rotated element uses its axis-aligned bounds.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `wireframe-live-geometry` | A sketch of grey boxes in a new file | `window.__wireframe.enter()` on the running page |
| `wireframe-dev-only` | The runtime imported in the production bundle | Evaluate it on a local page, then `destroy()` |
| `wireframe-filled-shapes` | `outline: 1px solid grey` on each region | A filled mark on the measured box |
| `wireframe-text-lines` | One rectangle for the whole paragraph | One rounded bar per line rectangle |
| `wireframe-hard-wipe` | `opacity` from 0 to 1 | A hard `clip-path` inset, left to right, both ways |
| `wireframe-reduced-motion` | The wipe still runs | The view swaps in the same frame |
| `wireframe-no-shift` | The page jumps when the view opens | Shapes over the live boxes, layout shift 0 |
| `wireframe-no-clone` | `body.cloneNode(true)` into an overlay | Drawn nodes with no copied id or handler |
| `wireframe-block-input` | `pointer-events: none` on the cover | The cover takes the hit |
| `wireframe-follow-the-page` | Shapes stay put while the page scrolls | Remeasure on scroll, resize and edits |
| `wireframe-measured-gaps` | A badge that always reads 8 | A badge of the rounded live gap |
| `wireframe-clean-exit` | The cover and its listener left in the page | `exit()` restores the page |

## Reporting

**Severity.** `HIGH` is guessed boxes, a cloned document, a runtime in a shipped bundle or a click that reaches the page. `MEDIUM` is a fade, the wrong wipe direction, one bar per paragraph, an unmeasured badge, a layout shift or motion under reduced motion. It is also a shape that stays put on scroll. `LOW` is an exit that leaves a listener, or a limit that was not named.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Cite the element from `shapes()` when the source line is not found. Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a cross-origin frame, a closed shadow root, canvas pixels and pseudo-elements as `Not verified`.
