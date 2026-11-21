---
name: frames
description: Records a performance trace of one interaction on a throttled CPU, names what drops frames or delays input, then proves the fix with a second trace.
disable-model-invocation: true
---

# Frames

This skill measures whether an interaction stays smooth. It records the interaction on a throttled CPU, traces each slow frame to its cause and proves the fix with a second recording.

## A trace, never a feeling

The budgets are exact. Every frame lands within one refresh interval, 16.7ms at 60Hz and 8.3ms at 120Hz. No animation frame runs past 50ms while something moves. Every interaction paints its response within 200ms. "Feels smooth" with no numbers is a finding.

What a motion's values should be belongs to `motion`. Taking a motion apart frame by frame belongs to `deconstruct`. Opening the running result belongs to `verify`.

## 1. Name the interaction

Write the route, the steps and the moment that matters, such as "open the command palette and type three letters". Throttle the CPU 4× through the browser's emulation call, which stands in for a mid-range phone. When DevTools holds a calibrated mid-tier mobile preset, use its rate instead and name it. A trace on an unthrottled laptop is `frames-throttle-the-cpu`.

CPU throttling models a slow processor, not a weak GPU or small memory. Trace blur-heavy or layer-heavy motion on a real mid-range phone over remote debugging, or report it as `Not verified on device`. A blurred sheet traced only on a throttled laptop is `frames-gpu-on-device`.

## 2. Record it

Run [observe.js](observe.js) through the browser's evaluate call. Through `Runtime.evaluate`, pass `includeCommandLineAPI: true`, or its `listeners` field reads `null`. Call `window.__frames.start()`, perform the interaction three times, then call `window.__frames.stop()`. When a long frame has no named script, record a full performance profile too. Reporting smoothness without a recording is `frames-trace-not-feel`.

Perform it with trusted input, such as Playwright's `mouse` and `keyboard` or the operating system. Event timing skips script-dispatched input, so `interactions` stays empty while `inputs` counts only `untrusted`. A result with `throttled: true` means the browser held a background tab's frames. Bring the tab to the front and record again, or mark the frame numbers `Not verified`.

## 3. Read the budget

Compare the recording against the budgets. Dropped frames or a long animation frame while something moves is `frames-hold-the-budget`. An interaction whose `duration` passes 200ms is `frames-answer-in-200ms`. Name whether the time went to input delay, processing or presentation.

## 4. Find the cause

Read each long frame's scripts with their forced layout time, then the frame's `render` and `styleAndLayout` time. Then open the code the scripts point to.

An input shows its response before the handler's heavy work runs. Set the pressed state or the typed value, `await scheduler.yield()`, then run the work. A keystroke whose letter waits behind a 300ms filter is `frames-paint-first`.

A layout property animated across a large subtree reflows every frame. `top` or `width` animated on a full-page panel is `frames-compositor-properties`. Move it to `transform` and `opacity`.

Reading layout after writing a style forces the browser to lay out mid-frame. `offsetHeight` read inside a loop that sets `style.height` is `frames-no-forced-layout`. Read every value first, then write.

A loop that runs past 50ms holds every key and click behind it. Yield to input every 50ms with `await scheduler.yield()`, falling back to `setTimeout(0)` where it is missing, as in Safari. A 5,000-row loop with no yield is `frames-yield-every-50ms`.

A `touchstart`, `touchmove` or `wheel` listener on an element holds each scroll until it returns, in case it calls `preventDefault()`. Register it with `{ passive: true }`, and block gestures with `touch-action` instead. A `wheel` listener on a scrolling list without that flag is `frames-passive-listeners`. The recording's `listeners.blocking` names each one.

A `scroll` listener that writes a style on each event runs on the main thread and trails the scroll. Move the effect onto a CSS scroll timeline, built as `motion` sets out. A progress bar whose `width` a `scroll` listener writes is `frames-scroll-driven`. Scroll during the recording, and `scrollWrites` names each element a scroll handler styled. Work that waits for scrolling to stop listens for `scrollend`, never a debounced `scroll` handler.

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
| `frames-paint-first` | `onInput` filtering 5,000 rows before the typed letter paints | The value set, `await scheduler.yield()`, then the filter |
| `frames-compositor-properties` | `animate={{ width: 320 }}` on the full-page sidebar | `animate={{ x: 0 }}` with the width fixed |
| `frames-no-forced-layout` | `el.style.height = el.scrollHeight + "px"` in a loop over rows | All heights read first, then all written |
| `frames-yield-every-50ms` | A 5,000-row loop with no yield | `await scheduler.yield()` every 50ms |
| `frames-passive-listeners` | `list.addEventListener("wheel", onWheel)` that never calls `preventDefault()` | `list.addEventListener("wheel", onWheel, { passive: true })` |
| `frames-scroll-driven` | A `scroll` listener writing a progress bar's `width` | `animation-timeline: scroll()` driving `transform: scaleX()` on the bar |
| `frames-virtualize-long-lists` | 5,000 rows rendered into one scroller | The visible rows virtualized, the report saying so |
| `frames-animate-outside-render` | `setProgress(p)` on every frame | `progress.set(p)` on a motion value bound to `transform` |
| `frames-no-inherited-variable` | `parent.style.setProperty("--y", d)` on each pointer move | ``el.style.transform = `translateY(${d}px)` `` |
| `frames-off-main-thread` | A tab underline moved by a shared-layout animation during a route change | A CSS `transform` transition on the underline |
| `frames-small-paint` | `backdrop-filter: blur(20px)` on a moving full-screen layer | Blur on the static backdrop, the panel moving above it |
| `frames-brief-will-change` | `.card { will-change: transform }` on 200 cards | Set on pointer down, removed on `transitionend` |
| `frames-before-and-after` | "Should be faster now" | Before 14 dropped, after 0, same steps at 4× |

## Reporting

**Severity.** `HIGH` is an interaction over 200ms at the throttle, or a report of smoothness with no recording. `MEDIUM` is dropped frames during motion, a layout property animated on a large subtree, forced layout or a state update per frame. It is also a custom property written on a parent per frame, a frame loop animating while the page is busy or a loop that never yields. It is also heavy work before an input paints, a scroll-blocking listener or a style written from a `scroll` listener. It is also a list over 1,000 rows rendered whole, a trace taken without a throttle or blur-heavy motion neither traced on a device nor marked. `LOW` is a large repaint that still holds the budget, a `will-change` left set or a fix reported without a second recording.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (dropped, worst gap, duration)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Long animation frames exist only in Chromium. Mark a recording from another engine `Not verified` for script attribution.
