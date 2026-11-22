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

Write the route, the steps and the moment that matters, such as "open the command palette and type three letters". Throttle the CPU with `Emulation.setCPUThrottlingRate` at `{ rate: 4 }`, which stands in for a mid-range phone. When DevTools holds a calibrated mid-tier mobile preset, use its rate instead and name it. A trace on an unthrottled laptop is `frames-throttle-the-cpu`.

CPU throttling models a slow processor, not a weak GPU or small memory. Trace blur-heavy or layer-heavy motion on a real mid-range phone over remote debugging, or report it as `Not verified on device`. A blurred sheet traced only on a throttled laptop is `frames-gpu-on-device`.

## 2. Record it

Pass the contents of [observe.js](observe.js) to `page.evaluate`, or to `Runtime.evaluate` with `awaitPromise: true` and `includeCommandLineAPI: true`. It resolves after 500ms of sampling the idle display rate, which becomes the frame budget. Keep the page still until then.

Call `window.__frames.start()`, perform the interaction once, then call `window.__frames.stop()`. Record three runs this way and report the median of each metric across them. Reporting smoothness without a recording is `frames-trace-not-feel`.

Perform it with trusted input, such as Playwright's `mouse` and `keyboard` or the operating system. Event timing skips script-dispatched input, so `interactions` stays empty while `inputs` counts only `untrusted`. A result with `throttled: true` means the browser held a background tab's frames. Bring the tab to the front and record again, or mark the frame numbers `Not verified`.

The recorder reads long frames, script attribution and layout inside long frames. It cannot see paint. For paint and layer cost, record `Tracing.start` with the `devtools.timeline` category around the same steps, then `Tracing.end`, and read its `Paint` and `Layout` events. The large-repaint and `will-change` checks in step 4 need that trace.

## 3. Read the budget

Compare the median run against the budgets. Dropped frames or a long animation frame while something moves is `frames-hold-the-budget`. An interaction whose `duration` passes 200ms is `frames-answer-in-200ms`. Name whether the time went to input delay, processing or presentation.

## 4. Find the cause

Read each long frame's scripts with their forced layout time, then the frame's `render` and `styleAndLayout` time. Then open the code the scripts point to.

An input shows its response before the handler's heavy work runs. A keystroke whose letter waits behind a 300ms filter is `frames-paint-first`.

A layout property animated across a large subtree reflows every frame. `top` or `width` animated on a full-page panel is `frames-compositor-properties`.

Reading layout after writing a style forces the browser to lay out mid-frame. `offsetHeight` read inside a loop that sets `style.height` is `frames-no-forced-layout`.

A loop that runs past 50ms holds every key and click behind it. Yield with `await scheduler.yield()`, falling back to `setTimeout(0)` where it is missing, as in Safari. A 5,000-row loop with no yield is `frames-yield-every-50ms`.

A `touchstart`, `touchmove` or `wheel` listener holds each scroll until it returns, in case it calls `preventDefault()`. Block gestures with `touch-action` instead. A `wheel` listener on a scrolling list without `{ passive: true }` is `frames-passive-listeners`.

The recording's `listeners.blocking` names each one when the script ran with `includeCommandLineAPI: true`. Under Playwright, open a CDP session and call `DOMDebugger.getEventListeners` with `depth: -1` on the document, then on `window`.

A `scroll` listener that writes a style on each event runs on the main thread and trails the scroll. A progress bar whose `width` a `scroll` listener writes is `frames-scroll-driven`, and building its scroll timeline belongs to `motion`. Scroll during the recording, and `scrollWrites` names each element styled inside a scroll listener or in the frame after one. Work that waits for scrolling to stop listens for `scrollend`.

A list over about 1,000 rows is virtualized or paginated, and the report says which. Rendering 5,000 rows into one scroller is `frames-virtualize-long-lists`.

A state update on every frame re-renders the component tree each frame. `setState` inside a `requestAnimationFrame` loop or a scroll handler is `frames-animate-outside-render`.

A custom property inherits, so writing one on a parent recalculates style for every descendant each frame. `parent.style.setProperty("--y", d)` on each pointer move is `frames-no-inherited-variable`.

Motion that plays while the page is busy with navigation, fetching or hydration runs in CSS or the Web Animations API. Layout animations and per-frame callbacks stutter while the main thread works. A tab underline moved by a shared-layout animation during a route change is `frames-off-main-thread`.

A large surface repainted each frame costs more than the motion is worth. `backdrop-filter` on a full-screen layer that moves is `frames-small-paint`.

`will-change` holds a compositor layer for as long as it is set. `will-change: transform` left on every card in a grid is `frames-brief-will-change`.

## 5. Trace the fix

Record three runs again with the same steps and the same throttle. Report both medians side by side. "Should be faster now" is `frames-before-and-after`. Clear the CPU throttle with `{ rate: 1 }` when done.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `frames-throttle-the-cpu` | Traced on an unthrottled laptop | Traced at 4× CPU throttle | `MEDIUM` |
| `frames-gpu-on-device` | A blurred sheet traced only on a throttled laptop | Traced on a mid-range phone, or marked `Not verified on device` | `MEDIUM` |
| `frames-trace-not-feel` | "The drawer feels smooth" | "Drawer open: 0 dropped frames, worst gap 17ms at 4×" | `HIGH` |
| `frames-hold-the-budget` | 14 dropped frames while the sheet opens | 0 dropped, no animation frame over 50ms | `MEDIUM` |
| `frames-answer-in-200ms` | A keystroke painting after 340ms, 280ms of it processing | 90ms, with the filter moved off the keystroke | `HIGH` |
| `frames-paint-first` | `onInput` filtering 5,000 rows before the typed letter paints | The value set, `await scheduler.yield()`, then the filter | `MEDIUM` |
| `frames-compositor-properties` | `animate={{ width: 320 }}` on the full-page sidebar | `animate={{ x: 0 }}` with the width fixed | `MEDIUM` |
| `frames-no-forced-layout` | `el.style.height = el.scrollHeight + "px"` in a loop over rows | All heights read first, then all written | `MEDIUM` |
| `frames-yield-every-50ms` | A 5,000-row loop with no yield | `await scheduler.yield()` every 50ms | `MEDIUM` |
| `frames-passive-listeners` | `list.addEventListener("wheel", onWheel)` that never calls `preventDefault()` | `list.addEventListener("wheel", onWheel, { passive: true })` | `MEDIUM` |
| `frames-scroll-driven` | A `scroll` listener writing a progress bar's `width` | `animation-timeline: scroll()` driving `transform: scaleX()` on the bar | `MEDIUM` |
| `frames-virtualize-long-lists` | 5,000 rows rendered into one scroller | The visible rows virtualized, the report saying so | `MEDIUM` |
| `frames-animate-outside-render` | `setProgress(p)` on every frame | `progress.set(p)` on a motion value bound to `transform` | `MEDIUM` |
| `frames-no-inherited-variable` | `parent.style.setProperty("--y", d)` on each pointer move | ``el.style.transform = `translateY(${d}px)` `` | `MEDIUM` |
| `frames-off-main-thread` | A tab underline moved by a shared-layout animation during a route change | A CSS `transform` transition on the underline | `MEDIUM` |
| `frames-small-paint` | `backdrop-filter: blur(20px)` on a moving full-screen layer | Blur on the static backdrop, the panel moving above it | `LOW` |
| `frames-brief-will-change` | `.card { will-change: transform }` on 200 cards | Set on pointer down, removed on `transitionend` | `LOW` |
| `frames-before-and-after` | "Should be faster now" | Before 14 dropped, after 0, same steps at 4× | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (dropped, worst gap, duration)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Long animation frames exist only in Chromium. Mark a recording from another engine `Not verified` for script attribution.
