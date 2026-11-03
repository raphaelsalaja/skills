---
name: island
description: Merges scattered status UI into one morphing pill that expands and collapses instead of stacking separate popups.
---

# Island

This skill merges scattered status UI into one morphing pill. The pill expands and collapses instead of stacking separate popups.

## One surface, exact sizes

The sizes, priorities, insets and anchor below are exact where the project has no token for them. A second floating status for the same live work is a finding in any layout.

Run it for a Dynamic Island, a morphing status pill, toasts and progress on one surface, or notifications that morph instead of stacking.

Run `reuse` first and build the pill from the project's own components. Curves, the size spring, the blurred cross-fade, exits and reduced motion belong to `motion`. Surfaces, safe areas, hit targets and the live region belong to `defaults`. Labels belong to `copy`. Contrast belongs to `color`. Seeing it run belongs to `verify`. The clip of the morph belongs to `clip`. Anything unrequested belongs to `restraint`. Frame rate belongs to `frames`.

## 1. Find the competing surfaces

Search for live status that floats or sits in a corner. Count toasts, upload progress, recording and now-playing indicators, background jobs and saving labels. Leaving two or more of them on screen is `island-scattered-status`.

A single one-off toast, with no sibling status, stays where it is.

## 2. Leave one-off toasts alone

A toast that appears and leaves on its own stays in the project's toast library, such as Sonner. Island is for persistent live status, and it may wrap a toast that tracks a job. Moving a one-off "Copied" into the pill is `island-live-status-only`.

## 3. Mount one pill

Mount one provider at the root and one pill. Fix it to the top centre, at `max(12px, env(safe-area-inset-top))`, using the safe-area inset from `defaults`. Sit it above the page header and below dialogs. A second pill, or one that covers the page title, is `island-one-pill`.

When the title already occupies the top centre, move the pill into the free span of that edge. Still one pill.

```ts
island.show({ id, title, detail, body, progress, priority, size })
island.update(id, patch)
island.dismiss(id)
```

`progress` runs from 0 to 1. `size` is `compact`, `expanded` or `full`, and it defaults to `compact`. `body` is the full size only.

Features call `island.show`, `island.update` and `island.dismiss`. A local setter that also renders its own corner widget is `island-show-api`.

## 4. Queue three sizes

| Size | Height | Width | Radius |
| --- | --- | --- | --- |
| `compact` | 40px | content, from 96px to 280px | 20px |
| `expanded` | 96px | min(360px, the viewport minus 32px) | 28px |
| `full` | 200px | min(480px, the viewport minus 16px) | 32px |

Pad the content 16px. Centre it at compact, and align it to the start at expanded and full. The reverse is `island-content-align`. A single fixed size, or a size off this table, is `island-three-sizes`.

Higher priority wins, and only the head is on screen.

| Work | Priority |
| --- | --- |
| Recording | 50 |
| Upload or progress | 40 |
| Now playing | 30 |
| Background job | 20 |
| Saving | 10 |

A caller may pass `priority` to override that table. Equal priority keeps arrival order. A higher item morphs into place and the rest wait. A stack of statuses, or a saving label covering a recording, is `island-priority-queue`.

Compact shows the title and, when `progress` is set, a bar along the bottom of the shell. Expanded adds `detail`, such as the file name. Full adds `body`. The bar fill is linear, as `motion` requires for progress.

## 5. Morph the shell, hold the text

Morph one shell's width, height and radius together. Use the project's motion package `layout`, or FLIP only when the project refuses that dependency. Swapping in a new pill per state is `island-shared-layout`.

Drive the size with the gesture spring from `motion`, stiffness 500 and damping 30. Cross-fade the content over 200ms on `--ease-out`, with the blur `motion` puts on a cross-fade. A size change on a fixed ease, or a spring on the text itself, is `island-spring-the-size`.

Keep each label at its own width and scale for the whole morph. Scaling the text, or animating the text node's width, is `island-text-holds-shape`.

Under reduced motion, follow `motion`: snap the size and cross-fade on opacity alone. When the queue empties, spring back through compact, fade out and unmount inside the presence boundary from `motion`.

## 6. Tap, swipe and Escape

Tap steps compact, then expanded, then full when `body` is set. Swipe up dismisses the head on the flick rule in `motion`. Swipe sideways past 48px cycles the queue when it holds more than one item. Escape dismisses unless a dialog is open or a field has focus. A pill that only vanishes on a timer, or that ignores Escape, is `island-tap-swipe-escape`.

Ship the button `motion` requires for each swipe: Expand, Next and Dismiss. Arrow Right cycles forward.

When the head changes, update the polite live region from `defaults`. A visual swap the region never hears is `island-announce`.

## 7. Move the call sites

Replace each competing surface with `show`, `update` and `dismiss`, then delete the old widget. An upload starts compact, fills its bar, expands to the file name, shows Saved and collapses. Leaving the old progress bar beside the pill is `island-move-the-calls`.

## 8. Record the morph

When the work needs a clip, record the running pill with `clip`, including its compare when the old corners should sit beside it. Show the size morph and the content cross-fade in one take. A recorder written for this skill, or a mock standing in for the pill, is `island-clip-the-morph`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `island-scattered-status` | A toast, a progress bar and a Saved label in three corners | One pill for all three |
| `island-live-status-only` | `toast("Copied")` routed through `island.show` | `toast("Copied")` left in the toast library |
| `island-one-pill` | A pill over the title, plus a second pill | One pill in the free top span |
| `island-show-api` | `setUploading(true)` rendering its own bar | `island.show({ id: "upload", title: "Uploading", progress: 0 })` |
| `island-three-sizes` | One 40px pill for every state | Compact 40px, expanded 96px and full 200px |
| `island-content-align` | The compact title aligned to the start | The compact title centred |
| `island-priority-queue` | Saving drawn over an active recording | Recording at priority 50, Saving queued at 10 |
| `island-shared-layout` | A new node mounted per state | One shell morphing width, height and radius |
| `island-spring-the-size` | `transition: width 200ms ease-out` on the shell | The gesture spring from `motion` on width, height and radius |
| `island-text-holds-shape` | `scaleX(1.2)` on the file name | The file name cross-fades at its own size |
| `island-tap-swipe-escape` | The pill auto-hides and ignores Escape | Tap expands, swipe up or Escape dismisses |
| `island-announce` | The title swaps and the live region stays stale | The live region from `defaults` updates with the head |
| `island-move-the-calls` | The corner bar left in place beside the pill | The bar deleted, its calls on `island.update` |
| `island-clip-the-morph` | A screen recorder written beside the pill | The running pill recorded with `clip` |

## Reporting

**Severity.** `HIGH` breaks use. That is status left in separate corners, a second pill, a pill over the title, a queue that hides a recording or no way to expand and dismiss. It is also a call site that still renders its own widget.

`MEDIUM` is a one-off toast pulled into the pill, one size, a remounted shell, a size on a fixed ease or text that scales. It is also a silent swap or a hand-written recorder.

`LOW` is a compact title aligned to the start, or an expanded title centred.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Play the morph when a check depends on motion, and mark every check you could not run as `Not verified`.
