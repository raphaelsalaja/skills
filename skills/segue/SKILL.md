---
name: segue
description: Finds hard cuts between screens and states, then makes the element the user touched carry over, interruptibly, with the project's own View Transitions, FLIP or Motion.
---

# Segue

This skill finds the places where one state replaces another with a hard cut. It makes the element the user touched travel across the change, in the project's own animation stack, and proves it frame by frame.

## Carry the touched element, measured

Run it when a row opens a detail, a card opens a dialog, a mini player opens the full player or a tab changes its indicator. Run it when the user says "it just pops in", "make it feel connected" or "shared element". Every number here is exact.

A cut is a frame step that covers over half the element's travel. A carry moves the element over at least three frames, from where it was to where it lands. A change with no element on both sides is not a segue, and only fades.

How long the carry runs, its curve and the fade around it belong to `motion`. Whether it holds its frame rate belongs to `frames`. Focus, scroll position and dialogs belong to `defaults`. Opening the result belongs to `verify`.

## 1. Find the cuts

List every state change where something the user touched exists on both sides. Cover rows and details, cards and dialogs, thumbnails and lightboxes, mini and full players, and tabs and their indicators. Read the router, the conditional renders and the open flags. Fix the pairs the user named and every sibling that shares the component. A pair left unlisted is `segue-find-the-cuts`.

Run [probe.js](probe.js) as an init script, so it is in place before the page loads. Call `window.__segue.start({ name: [selectors] })` with one entry per carried element. Give each entry the selector on the old side, then the selector on the new side. Click, wait for the motion to settle, then call `window.__segue.stop()`.

Read `verdict`, `moving` and `maxStep`. `cut` means the element teleported. `carried` means it travelled over several frames. A verdict taken by eye is `segue-read-the-probe`.

## 2. Pick what travels

The carried element is the one the user touched, such as the cover, the thumbnail, the avatar or the indicator. The rest of the incoming screen fades in around it. The whole incoming page sliding in from the side is `segue-carry-the-touched-element`.

Boxes and images scale and move. Text never scales. A title scaled from 14px to 24px blurs and re-wraps, so it fades in place beside the carried element. That is `segue-text-fades-in-place`.

Each carried element has one name on screen at a time. Two elements with the same `view-transition-name` or `layoutId` cancel the transition. Put the name on the touched row only, and remove it after. That is `segue-one-name-per-element`.

## 3. Use the project's own stack

Read the dependencies before writing anything. Where the project uses Motion, give both elements one `layoutId`. Where it uses View Transitions, set `view-transition-name` and call `document.startViewTransition`. Cross-document navigation takes `@view-transition { navigation: auto }`. Otherwise use FLIP with the Web Animations API. See [recipes.md](recipes.md).

A library added for one transition, beside the one the project already has, is `segue-use-the-project-stack`. The reuse order belongs to `reuse`.

A view transition cannot be retargeted. Starting a second one while the first runs skips the first to its end, so the element jumps. Use View Transitions for changes the user cannot reverse mid-flight, and Motion or FLIP for the rest.

The carry moves with `transform` and nothing else. Animating `top`, `left`, `width` or `height` moves layout on every frame, and is `segue-transform-only`.

## 4. Make it interruptible

The user can tap again at any moment. A second tap carries the element from where it is drawn now, to the new target. Read `getBoundingClientRect()` before cancelling the running animation and use it as the first keyframe. A carry that restarts from the old rest position is `segue-retarget-from-current`.

Nothing blocks the next tap. A closing layer takes `pointer-events: none`, and no flag drops taps while the motion runs. An `isAnimating` guard that ignores the second tap is `segue-never-block-input`.

Test it. Call `window.__segue.mark()`, then tap the reverse control about halfway through. Read `interrupts`. `snapped: true` means the element jumped, and `snapped: false` means it carried on from where it was.

## 5. Reduced motion

Under `prefers-reduced-motion: reduce` nothing travels. The element arrives in place and fades in over 120ms, and the state change still lands. Emulate the setting and run the probe again. The verdict reads `cut` because nothing travels, and `fadeFrames` over 0 shows the fade. A carry that still travels, or a change with no fade, is `segue-reduced-carry-fades`.

## 6. Prove it

Take the strip. Click the trigger, call `window.__segue.seek(0)`, then seek to `0.25`, `0.5`, `0.75` and `1`, with a screenshot after each. A cut shows the same frame four times. A carry shows the element at four different places. Put the strip beside its before.

Show one interruption and the reduced-motion run with their probe lines. "Feels smoother" is `segue-prove-the-frames`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `segue-find-the-cuts` | Only the row to detail change fixed | Row, card, mini player and tab indicator listed and read |
| `segue-read-the-probe` | "The detail feels abrupt" | `cover: cut, 1 moving frame, 184px max step` |
| `segue-carry-the-touched-element` | The whole detail page slides in from the right | The cover travels from the row, the page fades in around it |
| `segue-text-fades-in-place` | `transform: scale(1.7)` on the title | The title fades in place beside the carried cover |
| `segue-one-name-per-element` | `view-transition-name: cover` on every row | The name on the touched row only, removed after |
| `segue-use-the-project-stack` | A second animation library beside Motion | `layoutId="cover-a1"` on both elements |
| `segue-transform-only` | Animating `width` and `top` | `translate()` and `scale()` from the measured rects |
| `segue-retarget-from-current` | `anim.cancel()` then keyframes from the rest rect | The drawn `getBoundingClientRect()` as the first keyframe |
| `segue-never-block-input` | `if (isAnimating) return` on the back button | `pointer-events: none` on the closing layer, and the tap retargets |
| `segue-reduced-carry-fades` | The cover still travels, or the change is a bare cut | In place with a 120ms fade, `fadeFrames` over 0 |
| `segue-prove-the-frames` | "Feels smoother now" | The 0, 25, 50, 75 and 100% strip, beside its before |

## Reporting

**Severity.** `HIGH` is a touched element that teleports, a second tap that snaps the element or is ignored, or a carry that ignores reduced motion. `MEDIUM` is the whole page travelling instead of the element, scaled text, duplicate names, layout properties animated or a second library added. `LOW` is a fix with no strip or a pair never listed.

**Format.** One finding per root cause, with the probe numbers:

```
file:line - [rule-id] what is wrong (measured value)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a change you could not run in the browser as `Not verified`.
