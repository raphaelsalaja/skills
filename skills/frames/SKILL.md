---
name: frames
description: Records a performance trace of one interaction on a throttled CPU, names what drops frames or delays input, then proves the fix with a second trace.
disable-model-invocation: true
---

# Frames

This skill measures whether an interaction stays smooth. It records the interaction on a throttled CPU, traces each slow frame to its cause and proves the fix with a second recording.

## A trace, never a feeling

The budgets are exact. Every frame lands within one refresh interval, 16.7ms at 60Hz, and no animation frame runs past 50ms while something moves. Every interaction paints its response within 200ms. "Feels smooth" with no numbers is a finding.

What a motion's values should be belongs to `motion`. Taking a motion apart frame by frame belongs to `deconstruct`. Opening the running result belongs to `verify`.

## 1. Name the interaction

Write the route, the steps and the moment that matters, such as "open the command palette and type three letters". Throttle the CPU 4× through the browser's emulation call, which stands in for a mid-range phone. A trace on an unthrottled laptop is `frames-throttle-the-cpu`.

CPU throttling models a slow processor, not a weak GPU or small memory. Trace blur-heavy or layer-heavy motion on a real mid-range phone over remote debugging, or report it as `Not verified on device`. A blurred sheet traced only on a throttled laptop is `frames-gpu-on-device`.

## 2. Record it

Run [observe.js](observe.js) through the browser's evaluate call. Call `window.__frames.start()`, perform the interaction three times, then call `window.__frames.stop()`. When a long frame has no named script, record a full performance profile too. Reporting smoothness without a recording is `frames-trace-not-feel`.

## 3. Read the budget

Compare the recording against the budgets. Dropped frames or a long animation frame while something moves is `frames-hold-the-budget`. An interaction whose `duration` passes 200ms is `frames-answer-in-200ms`. Name whether the time went to input delay, processing or presentation.

## 4. Find the cause

Read each long frame's scripts and their forced layout time, then the code they point to.

A layout property animated across a large subtree reflows every frame. `top` or `width` animated on a full-page panel is `frames-compositor-properties`. Move it to `transform` and `opacity`.

Reading layout after writing a style forces the browser to lay out mid-frame. `offsetHeight` read inside a loop that sets `style.height` is `frames-no-forced-layout`. Read every value first, then write.

A loop that runs past 50ms holds every key and click behind it. Yield to input every 50ms with `await scheduler.yield()`, falling back to `setTimeout(0)` where it is missing. Wait for scrolling to stop with the `scrollend` event, not a debounced `scroll` handler. A 5,000-row loop with no yield, or a debounced scroll handler, is `frames-yield-every-50ms`.

A list over about 1,000 rows is virtualized or paginated, and the report says which. Rendering 5,000 rows into one scroller is `frames-virtualize-long-lists`.

A state update on every frame re-renders the component tree each frame. `setState` inside a `requestAnimationFrame` loop or a scroll handler is `frames-animate-outside-render`. Write `transform` on the moving element itself, through a motion value or a ref.

A custom property inherits, so writing one on a parent recalculates style for every descendant each frame. That is what makes a drag lag in a long list. `parent.style.setProperty("--y", d)` on each pointer move is `frames-no-inherited-variable`.

Motion that plays while the page is busy with navigation, fetching or hydration runs in CSS or the Web Animations API. Layout animations and per-frame callbacks stay on the main thread and stutter while it works. A tab underline moved by a shared-layout animation during a route change is `frames-off-main-thread`. Move it to a CSS `transform` transition.

A large surface repainted each frame costs more than the motion is worth. `backdrop-filter` on a full-screen layer that moves is `frames-small-paint`. Shrink the painted area or fade a static copy.

`will-change` holds a compositor layer for as long as it is set. Set it just before a motion starts and remove it when the motion ends. `will-change: transform` left on every card in a grid is `frames-brief-will-change`.

## 5. Trace the fix

Record again with the same steps and the same throttle. Report both recordings side by side. "Should be faster now" is `frames-before-and-after`. Clear the CPU throttle when done.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `frames-throttle-the-cpu` | Traced on an unthrottled laptop | Traced at 4× CPU throttle |
| `frames-gpu-on-device` | A blurred sheet traced only on a throttled laptop | Traced on a mid-range phone, or marked `Not verified on device` |
| `frames-trace-not-feel` | "The drawer feels smooth" | "Drawer open: 0 dropped frames, worst gap 17ms at 4×" |
| `frames-hold-the-budget` | 14 dropped frames while the sheet opens | 0 dropped, no animation frame over 50ms |
| `frames-answer-in-200ms` | A keystroke painting after 340ms, 280ms of it processing | 90ms, with the filter moved off the keystroke |
| `frames-compositor-properties` | `animate={{ width: 320 }}` on the full-page sidebar | `animate={{ x: 0 }}` with the width fixed |
| `frames-no-forced-layout` | `el.style.height = el.scrollHeight + "px"` in a loop over rows | All heights read first, then all written |
| `frames-yield-every-50ms` | A 5,000-row loop with no yield, and a debounced `scroll` handler | `await scheduler.yield()` every 50ms, and a `scrollend` listener |
| `frames-virtualize-long-lists` | 5,000 rows rendered into one scroller | The visible rows virtualized, the report saying so |
| `frames-animate-outside-render` | `setProgress(p)` on every frame | `progress.set(p)` on a motion value bound to `transform` |
| `frames-no-inherited-variable` | `parent.style.setProperty("--y", d)` on each pointer move | ``el.style.transform = `translateY(${d}px)` `` |
| `frames-off-main-thread` | A tab underline moved by a shared-layout animation during a route change | A CSS `transform` transition on the underline |
| `frames-small-paint` | `backdrop-filter: blur(20px)` on a moving full-screen layer | Blur on the static backdrop, the panel moving above it |
| `frames-brief-will-change` | `.card { will-change: transform }` on 200 cards | Set on pointer down, removed on `transitionend` |
| `frames-before-and-after` | "Should be faster now" | Before 14 dropped, after 0, same steps at 4× |

## Reporting

**Severity.** `HIGH` is an interaction over 200ms at the throttle, or a report of smoothness with no recording. `MEDIUM` is dropped frames during motion, a layout property animated on a large subtree, forced layout or a state update per frame. It is also a custom property written on a parent per frame, a frame loop animating while the page is busy or a loop that never yields. It is also a list over 1,000 rows rendered whole, a trace taken without a throttle or blur-heavy motion neither traced on a device nor marked. `LOW` is a large repaint that still holds the budget, a `will-change` left set or a fix reported without a second recording.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (dropped, worst gap, duration)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a browser without long animation frame support as `Not verified` for script attribution.
