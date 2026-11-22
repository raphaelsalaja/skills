---
name: deconstruct
description: Breaks an animation or interaction into a state machine and a timeline of every property, on a page you can scrub and edit.
disable-model-invocation: true
---

# Deconstruct

This skill takes an animation or interaction apart. It names every state and event, splits each transition into one track per property and puts both on a page the user can scrub and edit.

## Every frame accounted for

Nothing is described by feel. Every state has a name, every transition has an event and every animated property has its from, to, delay, duration and easing. A value that could not be read is marked `Not verified`, never estimated.

Reading computed values and the side-by-side proof belong to `match`. Forcing component states open belongs to `lab`. Opening the result runs in `verify`. Whether the motion's values are right belongs to `motion`.

## 1. Capture the real motion

Open the source: the code, the live page or a recording. Read keyframes, transitions and spring configs, or step through frames at reduced playback speed. A breakdown from one viewing is `deconstruct-capture-the-source`.

On a live page, read the browser's own record of every CSS animation, CSS transition and Web Animations API animation. Run this before triggering the motion:

```js
const seen = new WeakSet();
const watch = () => {
  for (const animation of document.getAnimations()) {
    if (seen.has(animation)) continue;
    seen.add(animation);
    animation.playbackRate = 0.1;
    console.log(
      animation.transitionProperty ?? animation.animationName ?? (animation.id || "element.animate()"),
      animation.effect.target,
      animation.effect.getKeyframes(),
      animation.effect.getComputedTiming(),
    );
  }
  requestAnimationFrame(watch);
};
requestAnimationFrame(watch);
```

It polls every frame because `element.animate()`, behind most library animations that run off the main thread, fires neither `transitionrun` nor `animationstart`. `getComputedTiming()` gives the delay, duration and easing, and `getKeyframes()` gives each offset with its own easing. A timing guessed from a clip of a CSS transition is `deconstruct-read-the-animations`.

Motion stepped by `requestAnimationFrame`, such as a JavaScript spring, never appears there, so read its config in the code. A spring handed to the Web Animations API shows as a `linear()` easing. Record the spring from the code when it exists, and keep the `linear()` string when it does not.

A timing read from a recording is a whole number of frames, 16.7ms each at 60fps and 8.3ms at 120fps. Capture at the display's highest rate, write that rate in the track's `note` and set `fps` in `timeline.js`, so the arrow keys step one captured frame. A 30fps capture reported to the millisecond is `deconstruct-frame-timing`.

## 2. Name the states and events

List the states the element can rest in and the events that move it between them, such as press, release, resolve and timeout. Write them as a table of state, entered on and left on. A sentence like "it shrinks, then spins" is `deconstruct-name-the-states`.

## 3. Split each transition into tracks

Give every animated property its own track: scale, opacity, blur, width, colour, icon and label. Each track lists from, to, delay, duration and easing. "About 300ms" is `deconstruct-every-property`.

Keep the curve as written. A spring stays a spring with its stiffness, damping and mass, or its bounce with a duration or visual duration. A spring flattened into a guessed bezier is `deconstruct-keep-the-curve`. A `linear()` or `steps()` easing stays as written too, and the viewer plays both.

A keyframe animation with stops between its ends becomes one segment per interval. Each keyframe's easing runs only to the next keyframe, never across the whole animation, so an easing on the last keyframe is never used. A `40%` stop folded into one segment is `deconstruct-split-keyframes`.

## 4. Drive it from one clock

Render the element as a pure function of one time value. Scrubbing, pausing and looping then show the same frame for the same time. A viewer that replays CSS and cannot stop mid-transition is `deconstruct-one-clock`.

## 5. Build the viewer

Copy [viewer.html](viewer.html) beside the rebuild as a development-only page, write `timeline.js` next to it in the shape its header comment shows and open it. It shows the element, the state machine and one lane per track with its live value.

The viewer ships with the skill, so write data only. A page with its own markup or styles is `deconstruct-shipped-viewer`. It highlights the active state, and clicking a state seeks to it. Its scrubber, play, pause and 0.25× stay in. A timeline with no scrubber is `deconstruct-scrub-the-timeline`.

The inspector writes from, to, delay, duration and easing, and the preview follows. Drag a segment to change its delay. Drag its right edge to change its duration. Drag an event mark to move that event on every track. A timing changed in the reply instead of on the segment is `deconstruct-edit-the-segment`.

A spring's length follows from its curve, so change stiffness, damping and mass, or drag the edge of a bounce and duration spring. Opening a track draws its value over time, so an overshoot shows. Original plays the timeline as loaded, so each edit is judged against the source. Zoom, snapping, undo and the keys are listed in the viewer's header comment.

## 6. Compare at slow speed

Play the original and the rebuild side by side at 0.25×. Set `recording` to a capture of the original, and the viewer plays it beside the preview on the same clock. Name every frame that drifts. A breakdown checked only at full speed is `deconstruct-compare-slowed`.

Press I and O to loop one range, such as press to release. Onion Skin ghosts the last frames over the preview. Wipe lays the recording over the preview with a divider. Crop the recording to the preview frame so the two line up.

## 7. Hand back the data

`timeline.js` is the hand-back: the state table and the tracks as one object. It sets `window.timeline`, so the rebuild loads that file with `import "./timeline.js"` or a script tag rather than copying it. The viewer and the shipped motion then read the same values. A timeline that lives only in the reply is `deconstruct-timeline-as-data`.

Copy Timeline writes the open page back into that object, and you paste it over `timeline.js`. If the clipboard is blocked, the toast says Copy Failed. An edit left only in the open page is `deconstruct-copy-the-timeline`.

Gate the viewer to development or delete it before release, and keep `timeline.js`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `deconstruct-capture-the-source` | A breakdown from watching it once | The code read and frames stepped at 0.1× | `HIGH` |
| `deconstruct-read-the-animations` | "The fade looks like about 200ms" from a clip of a CSS transition | `getComputedTiming()` read as `{ delay: 0, duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }` | `MEDIUM` |
| `deconstruct-frame-timing` | A press of `130ms`, read off a 30fps capture | 8 frames at 60fps, `133ms`, with "60fps capture" in the track's `note` | `LOW` |
| `deconstruct-name-the-states` | "It shrinks, then spins" | Idle, Pressed, Copying and Copied with their events | `HIGH` |
| `deconstruct-every-property` | "About 300ms" | Scale `1` to `0.96`, 120ms, ease-out, at 400ms | `MEDIUM` |
| `deconstruct-keep-the-curve` | A spring approximated as `ease-out` | `stiffness: 400, damping: 30` as written | `MEDIUM` |
| `deconstruct-split-keyframes` | `@keyframes pop { 40% { scale: 1.1 } }` as one segment, `1` to `1` | `1` to `1.1` over the first 40%, then `1.1` to `1`, each with its keyframe's easing | `MEDIUM` |
| `deconstruct-one-clock` | A CSS replay button | Every frame computed from one `t` | `MEDIUM` |
| `deconstruct-scrub-the-timeline` | A looping preview only | A scrubber, play, pause and 0.25× | `MEDIUM` |
| `deconstruct-shipped-viewer` | A viewer page written from scratch | `viewer.html` copied, only `timeline.js` written | `MEDIUM` |
| `deconstruct-compare-slowed` | Checked once at full speed | Original and rebuild side by side at 0.25× | `MEDIUM` |
| `deconstruct-timeline-as-data` | A timeline described in the reply | `timeline.js`, loaded by the rebuild | `MEDIUM` |
| `deconstruct-edit-the-segment` | "Make the press 80ms" | Duration edited on the segment | `LOW` |
| `deconstruct-copy-the-timeline` | The edit left in the open page | Pasted back over `timeline.js` | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every value you could not read from the source as `Not verified`.
