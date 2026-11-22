---
name: motion
description: Applies house motion for what animates, easing, durations, springs, gestures, exits, motion blur and reduced motion.
---

# Motion

This skill holds whether and how things move on every screen. It covers what animates, the curve and duration, gestures, choreography, exits, motion blur and reduced motion.

## Durations and curves are exact

Use the project's motion tokens wherever they exist. Where none exists, the durations, curves, scales and physics constants here are exact. Motion the user starts that runs past 300ms is a finding, apart from the drawer and hold exceptions below.

It applies to anything that moves, fades or resizes, and first asks whether it should move at all.

Deleting an animation belongs to `restraint`, taking one apart to `deconstruct` and adding motion across a flow to `animate`. Frame rate belongs to `frames`, and surfaces, loading, hover styles and sound to `defaults`. When an overlay opens and closes belongs to `overlays`, and how it moves belongs here.

## Data and idle elements hold still

Charts, counters and table rows render at their values and move only when the user changes one. A bar chart growing from zero on every refresh is `motion-still-data`.

Sections never fade up as they scroll into view, including through `animation-timeline: view()`, and a marketing page keeps one hero entrance at most. A fade-up on every section is `motion-no-scroll-reveals`.

A reading progress bar runs on `animation-timeline: scroll()` inside `@supports`, with `animation-duration: 1ms` because Firefox skips a zero duration. See [recipes.md](recipes.md#scroll-linked-progress).

Persistent elements never pulse, shimmer, float or spin unless they show loading, and even a loader avoids slow sway near 0.2 Hz. `animate-pulse` on a status badge is `motion-no-idle-loops`. A character the user asked to live is exempt, and `avatar` owns it.

An idle demo loop on a marketing page waits 2.5s before its first run, repeats at most every 6s and stops while the user interacts.

Anything that moves on its own for more than 5 seconds beside other content has a pause control, and a carousel stops on hover and focus. A ticker with no pause is `motion-pause-moving-content`.

## Frequent actions stay still and input never waits

Typing, shortcuts, keyboard navigation and fast toggles do not animate, so a palette opened from the keyboard appears at once. A scale pulse on every keystroke is `motion-no-motion-on-repeat`. A context menu appears at once and may fade out.

Surfaces used many times a day, such as rows and cards, change colour on hover at once and enter with a 150ms opacity fade. A card lifting on hover is `motion-fade-on-frequent`. The daily counts that make a moment frequent belong to `animate`.

Input works from the first frame of any motion. `pointer-events: none` during an entrance, or a button disabled until a stagger lands, is `motion-never-wait`.

## App chrome fades and entrances do not replay

Page switches, panels and loading states fade with `opacity` and never slide or scale, which is `motion-opacity-for-chrome`. Animating width when only height changes is `motion-changing-axis-only`.

Set `initial={false}` on a route-level `AnimatePresence` and on any that wraps a state swap. Entrances replaying on every page switch are `motion-no-replay-on-entry`. A fade or skeleton flash on a cached view is `motion-no-flash-on-return`. See [recipes.md](recipes.md#route-transitions).

An entrance on a virtualized row, which replays as rows recycle, is `motion-no-entrance-on-recycled-rows`.

## Transitions name their properties and retarget

`transition: all` is `motion-name-the-properties`. Toggled state uses transitions or springs, which retarget on reverse, so a keyframe animation on a toggled class is `motion-transitions-for-state`. A fresh `animate()` on each `mouseenter` while the last still runs is `motion-stop-before-replay`.

## Motion starts where it comes from

A dropdown scales from its trigger's edge, while modals stay centred. A menu growing from its own centre is `motion-origin-from-trigger`. A sheet starts at `translateY(100%)` whatever its height, and `translateY(420px)` is `motion-percent-offsets`.

An SVG part animates on a `<g>` with `transform-box: fill-box; transform-origin: center`. A spinner arc swinging around its SVG's corner is `motion-svg-fill-box`. An entrance starts at `scale(0.95)` or higher with `opacity: 0`, and `scale(0)` is `motion-no-scale-from-zero`.

## Gestures follow the pointer, then spring

A drag, swipe or any motion reversible mid-flight releases into a spring that takes the pointer velocity. A drag release on a fixed `ease-out` is `motion-spring-for-gestures`. See [recipes.md](recipes.md#drag-release).

On release, snap to the point nearest `current + project(v)`, where `project(v)` is `(v / 1000) * d / (1 - d)` with `d` at 0.998, or 0.99 for a snappier stop. Ignoring the flick is `motion-project-to-snap`. One spring on the combined distance of a 2D move is `motion-split-2d-springs`.

While the pointer is down, write the offset straight to the transform. A spring chasing the pointer is `motion-track-one-to-one`. A scrim fading on its own beside a dragged sheet, rather than deriving from drag progress, is `motion-derive-linked-values`.

Decorative pointer-follow, such as a tilt, passes through `useSpring(value, { stiffness: 100, damping: 20 })`, critically damped so it never overshoots. A functional value never does. A tilt card snapping to the raw pointer is `motion-spring-pointer-follow`.

A spring started by a click, a key or the system runs `bounce: 0`. Bounce comes only from a drag or flick release: the house `stiffness: 500, damping: 30`, or `bounce` 0.1–0.3. A click-opened menu that bounces, or a `cubic-bezier()` with y past 1, is `motion-bounce-after-force`.

## Drags start on purpose and end safely

A drag starts after 3px and locks its axis after 10px, with the preview at `opacity: 0.8`. A card that shifts on every click is `motion-drag-threshold`. A sheet that drags from its own close button is `motion-controls-dont-drag`.

`touch-action` names the axis the browser keeps: `pan-y` on a horizontal carousel, `pan-x` on a vertical sheet handle and `none` only where the element handles both. `touch-action: none` on a carousel traps page scroll and is `motion-touch-action-axis`.

A swipe dismisses on distance or on a speed past `0.11` px per millisecond, read over the last 100ms before release. A sheet that ignores a fast flick is `motion-flick-dismisses`.

Past a boundary the offset shown is `(1 - 1 / (overshoot * 0.55 / size + 1)) * size`, with `size` the sheet's length along the drag. A drawer that stops dead is `motion-friction-at-edges`. See [recipes.md](recipes.md#flick-to-dismiss).

A sheet whose body scrolls drags from its handle, or from the body once scrolled to the top. A sheet that closes as its list scrolls back up is `motion-scroll-before-drag`.

An invalid drop springs back to its source, and a drag near a scrolling container's edge scrolls it. A card left where an invalid drop released it is `motion-drop-returns`.

Each drag, swipe or pinch also works with a click and the keyboard. A list that reorders only by dragging is `motion-gesture-alternative`. Shake to undo with no button and no setting to turn it off is `motion-no-shake-only`.

## Easing fits the change

System changes such as a toast use easing, not a spring. Entrances and exits ease out and a change of view eases in and out. Linear is only for progress, clocks and a hold fill. A modal entering on `ease-in` is `motion-ease-by-direction`.

Use `cubic-bezier(0.23, 1, 0.32, 1)` to enter and exit, and `cubic-bezier(0.77, 0, 0.175, 1)` for movement on screen. A bare `ease-out`, which is too weak, is `motion-strong-ease-out`.

A CSS transition with a spring's shape takes its duration and `linear()` from a generator, such as `${spring(0.3, 0)}` in Motion. The 300ms cap applies to the first argument. Hand-typed `linear()` stops are `motion-css-spring-linear`. See [recipes.md](recipes.md#css-springs).

## A hold fills slowly and lets go fast

A hold-to-confirm fills over 2s linear, the named exception to the cap, and snaps back over 200ms on the house ease-out. A hold that drains as slowly as it filled is `motion-hold-slow-release-fast`.

It confirms only when the fill finishes while the hold is still active. Drive it from pointer and key events, because `:active` is unreliable on iOS and never held for Enter. See [recipes.md](recipes.md#hold-to-confirm).

## Motion stays under 300ms

Hover colour changes are instant, and a 200ms background fade on hover is `motion-instant-hover-color`. Press and hover movement take 120–180ms and small state changes 180–260ms. Nothing the user starts runs past 300ms, except a panel or drawer at 400ms. A 500ms dropdown is `motion-under-300ms`.

A close runs shorter than its open, and nothing delays a close or a hover-out. A modal as slow to leave as to arrive is `motion-close-faster`.

Parts of one component share one duration and easing family, set once in a `MotionConfig` or a token. A scrim and panel on different curves is `motion-one-timing-family`. A checkmark waiting for its 0.6s draw to end, rather than starting at 0.5s, is `motion-overlap-the-handoff`.

Under `mode="wait"` the exit and entrance play in series, so halve each. Samples are in [recipes.md](recipes.md#curves-and-durations).

The first tooltip in a group opens after a delay, its neighbours open at once without animation and every tooltip closes instantly. Each toolbar tooltip waiting the full delay is `motion-tooltip-delay`.

## Icons cross-fade or morph when they swap

An icon swapping in place, such as copy to copied, cross-fades from scale `0.25`, opacity `0` and blur `4px`. A hard swap is `motion-icon-crossfade`. See [recipes.md](recipes.md#icon-swap).

Two icons in the morph form from `icons` animate each path's `d` on the movement curve, and cross-fade under reduced motion. Cross-fading them otherwise is `motion-icon-morph`. See [recipes.md](recipes.md#icon-morph).

A cross-fade that still reads as two objects takes `filter: blur(2px)` while it runs, under 20px for Safari. Two labels overlapping mid-swap is `motion-blur-the-crossfade`.

## Motion blur only where the eye cannot follow

A screen already smears what the eye tracks, so added blur turns text being read into grey bars. Blur a thrown card, a dismissed sheet or a spinner. Blur on scrolling, a carousel page or text being read is `motion-blur-untracked-only`.

Draw the streak with `@web-kits/motion-blur`, through `useMotionBlur` in React and `motionBlur(element)` elsewhere. Its defaults are exact: Echo at a 180° shutter, one copy per 1.5px up to 16 copies and a 1.05 smear limit. Leave Echo only when a `frames` trace demands it, and never on anything that turns. A hand-written `filter: blur()`, a spinner off Echo or a smear past 1.05 on text is `motion-blur-package`.

The element whose transform moves is the host and takes the ref. Its one child is the layer, which carries every background, border and shadow and no transform of its own. A ref on a wrapper, styling on the host or a tilt on the layer is `motion-blur-ref-on-mover`.

A position set by hand, such as a physics loop, calls `blur.render()` once a frame, passing a path when the motion bends. Two transforms on an orbit is `motion-blur-follow-path`. Slowed demos, custom techniques and the freeze-frame check are in [recipes.md](recipes.md#motion-blur).

## Presses, staggers and steps stay small

A pressed control scales to `0.98`, and squash or stretch stays within `0.95–1.05`. `whileTap={{ scale: 0.8 }}` is `motion-press-scale`.

List items stagger by 30ms, and items after the fifth share its 120ms delay, so a 150ms fade lands by 270ms. `staggerChildren: 0.15` is `motion-short-stagger`. A staged entrance on load, such as title, text and actions, staggers by 100ms.

A panel enters or its children stagger, never both. A sheet sliding in while its rows stagger is `motion-one-entrance-per-container`.

Steps inside one surface enter from the right going forward and from the left going back, mirrored in right-to-left layouts. Pass `custom={direction}` to `AnimatePresence` as well as the child. A Back step sliding the forward way is `motion-direction-aware-steps`. See [recipes.md](recipes.md#direction-aware-steps).

## Exits play and leave fully

An `exit` with no `AnimatePresence` around its element never plays, which is `motion-exit-in-presence`. See [recipes.md](recipes.md#exits). A library dialog rendered behind `open &&` loses its close animation and is `motion-dialogs-stay-mounted`.

A list fading out item by item is `motion-exit-together`. A menu faded to `opacity: 0` that still catches clicks, with no `visibility: hidden`, is `motion-hide-after-fade`.

## CSS sets its own start state

A CSS entrance sets its start in `@starting-style` inside the open selector, so a `mounted` flag flipped in an effect is `motion-starting-style`. A `@starting-style` block outside the open rule comes after it, because both carry the same specificity.

A top-layer exit transitions `opacity`, `transform`, `display` and `overlay`, with `transition-behavior: allow-discrete` as its own declaration, because older browsers drop a shorthand holding it. Only Chromium transitions `overlay`, so elsewhere the backdrop vanishes at once and the panel can slip under the page. See [recipes.md](recipes.md#top-layer-entrances).

A delayed CSS animation without `animation-fill-mode: both` flashes its end state first, which is `motion-fill-both-on-delay`.

## View transitions swap at once and hand over focus

A view transition needs two things: each `view-transition-name` used once per side, and focus moved to the new content after `transition.finished`. A shared name skips the whole transition, and `match-element` names list items within one document only. A name on two cards, or focus left on the old view, is `motion-view-transition-focus`.

Remove a name set from script once the transition ends. A running transition covers the page and takes its clicks, so set `::view-transition { pointer-events: none }`.

The page is frozen until the update callback resolves, so data loads before `startViewTransition()`. An `await fetch()` inside the callback is `motion-view-transition-fetch-first`. Where the method is missing, run the update plainly. See [recipes.md](recipes.md#view-transitions).

A multi-page site sets `@view-transition { navigation: auto; }` on both pages. A link handler holding the navigation while an exit plays is `motion-cross-document-transitions`.

## Size animates to auto

A CSS transition to content size sets `:root { interpolate-size: allow-keywords }` and transitions `block-size` from `0` to `auto`. One end must be a length, and browsers other than Chromium jump to the final size. A `ResizeObserver` feeding a CSS transition is `motion-animate-to-auto`. An accordion does the same on `details::details-content`. See [recipes.md](recipes.md#height-to-auto).

A spring library measures an inner element and animates the outer one to its size. Measuring and animating the same node is `motion-measure-inner`. See [recipes.md](recipes.md#container-bounds).

A container resizing between views takes 2ms per px of height change, clamped to 150–270ms. A fixed 300ms on every resize is `motion-duration-by-distance`.

A collapsing panel's content keeps its open width, so nothing reflows. Sidebar content set to `w-full` as the sidebar closes is `motion-hold-content-size`.

## Reduced motion removes movement

An alert that blinks more than three times in any one second is `motion-no-fast-flash`, whatever the setting.

When `prefers-reduced-motion: reduce` matches, slides, scales and blurs become an opacity cross-fade, and delays and staggers drop to zero. A drag still tracks 1:1 without momentum or bounce. A drawer that still slides is `motion-reduced-motion`.

A view transition keeps its cross-fade under the setting through `::view-transition-group(*) { animation: none }`. Motion blur drops its streak while `reducedMotion` stays at `"user"`, so `reducedMotion: "never"` is `motion-blur-reduced-motion`.

Smooth scrolling, in CSS or in `scrollTo` and `scrollIntoView`, sits inside a `prefers-reduced-motion: no-preference` check, and a jump past one viewport height goes instantly. A bare `html { scroll-behavior: smooth }` is `motion-smooth-scroll-gated`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `motion-still-data` | Bars growing from zero on every refresh | Bars drawn at their values | `MEDIUM` |
| `motion-no-scroll-reveals` | `whileInView={{ opacity: 1, y: 0 }}` on every section | Sections in place, one hero entrance at most | `MEDIUM` |
| `motion-no-idle-loops` | `animate-pulse` on a status badge | A steady badge | `MEDIUM` |
| `motion-pause-moving-content` | An auto-advancing carousel with no pause | A pause control, no advance on hover or focus | `HIGH` |
| `motion-no-motion-on-repeat` | `animate={{ scale: [1, 1.02, 1] }}` on each keystroke | No motion on the input | `MEDIUM` |
| `motion-fade-on-frequent` | `hover:-translate-y-0.5 hover:shadow-lg` on a list card | `hover:bg-muted`, applied at once | `LOW` |
| `motion-never-wait` | `pointer-events: none` until the entrance ends | Input live from the first frame | `HIGH` |
| `motion-opacity-for-chrome` | `initial={{ x: 20, scale: 0.95 }}` on a page | `initial={{ opacity: 0 }}` | `MEDIUM` |
| `motion-changing-axis-only` | `animate={{ width, height }}` when only height changes | `animate={{ height }}` | `LOW` |
| `motion-no-replay-on-entry` | `<AnimatePresence>` around routes, entrances replay | `<AnimatePresence initial={false}>` | `MEDIUM` |
| `motion-no-flash-on-return` | A skeleton flash on a cached view | The cached view rendered at once | `MEDIUM` |
| `motion-no-entrance-on-recycled-rows` | `initial={{ opacity: 0 }}` on a virtualized row | The row rendered in place | `MEDIUM` |
| `motion-name-the-properties` | `transition: all 200ms` | `transition: opacity 200ms, transform 200ms` | `MEDIUM` |
| `motion-transitions-for-state` | `.open { animation: slide-in 200ms }` | `transition: transform 200ms` | `MEDIUM` |
| `motion-stop-before-replay` | `animate(el, sequence)` on every `mouseenter` | `controls?.stop()` before the next `animate()` | `MEDIUM` |
| `motion-origin-from-trigger` | A dropdown scaling from `center` | `transform-origin: top left` under a left-aligned trigger | `LOW` |
| `motion-percent-offsets` | `transform: translateY(420px)` on a closed sheet | `transform: translateY(100%)` | `LOW` |
| `motion-svg-fill-box` | `rotate` on a `<path>` turning around the SVG's corner | The path in a `<g>` with `transform-box: fill-box` | `MEDIUM` |
| `motion-no-scale-from-zero` | `initial={{ scale: 0 }}` on a popover | `initial={{ scale: 0.95, opacity: 0 }}` | `MEDIUM` |
| `motion-spring-for-gestures` | A drag release on `duration: 0.3, ease: "easeOut"` | `type: "spring"` with `velocity: info.velocity.x` | `MEDIUM` |
| `motion-project-to-snap` | Snapping to the point nearest the release position | Snapping to the point nearest `current + project(v)` | `LOW` |
| `motion-split-2d-springs` | One spring on `Math.hypot(dx, dy)` | One spring per axis, each with its own velocity | `LOW` |
| `motion-track-one-to-one` | `animate(y, offset, { type: "spring" })` on pointer move | `y.set(offset)`, the spring on release | `MEDIUM` |
| `motion-derive-linked-values` | `animate(scrim, { opacity: 0 })` beside a dragged sheet | `useTransform(y, [0, height], [1, 0])` | `MEDIUM` |
| `motion-spring-pointer-follow` | `rotateX` set straight from the pointer | `useSpring(rotateX, { stiffness: 100, damping: 20 })` | `LOW` |
| `motion-bounce-after-force` | `bounce: 0.3` on a menu opened by a click | `bounce: 0` | `LOW` |
| `motion-drag-threshold` | A drag that starts on the first pixel | Starting after 3px, the axis locked after 10px | `MEDIUM` |
| `motion-controls-dont-drag` | A drag starting from any pointer-down in the sheet | `if (target.closest("button, input, a")) return` | `HIGH` |
| `motion-touch-action-axis` | `touch-action: none` on a horizontal carousel | `touch-action: pan-y` | `HIGH` |
| `motion-flick-dismisses` | Dismiss only past a fixed distance | Distance, or `0.11` px per ms over the last 100ms | `MEDIUM` |
| `motion-friction-at-edges` | A drawer that stops dead at its top | `(1 - 1 / (overshoot * 0.55 / size + 1)) * size` past the edge | `LOW` |
| `motion-scroll-before-drag` | `drag="y"` on a sheet whose list scrolls | The drag from the handle, or from the list at `scrollTop: 0` | `HIGH` |
| `motion-drop-returns` | A card left where an invalid drop released it | The card springing back to its source | `MEDIUM` |
| `motion-gesture-alternative` | Rows that reorder only by drag | `Move Up` and `Move Down` in the row menu | `HIGH` |
| `motion-no-shake-only` | Shake to undo with no button | An `Undo` button and a setting to turn shaking off | `HIGH` |
| `motion-ease-by-direction` | A modal entering on `ease-in` | Ease-out in and out, the exit shorter | `MEDIUM` |
| `motion-strong-ease-out` | `200ms ease-out` | `200ms cubic-bezier(0.23, 1, 0.32, 1)` | `LOW` |
| `motion-css-spring-linear` | `@keyframes settle` with stops tuned by eye | `transition: scale ${spring(0.3, 0)}` | `LOW` |
| `motion-hold-slow-release-fast` | `clip-path 2s linear` both ways, confirmed on any `transitionend` | `2s linear` fill, `200ms` back, confirmed only while held | `LOW` |
| `motion-one-timing-family` | A scrim at `300ms ease`, its panel on a spring | Both under one `MotionConfig` | `LOW` |
| `motion-overlap-the-handoff` | A checkmark that starts once a `0.6s` draw ends | The checkmark starting at `0.5s` | `LOW` |
| `motion-instant-hover-color` | `transition: background-color 200ms` on a button | The hover colour applied at once | `LOW` |
| `motion-under-300ms` | `transition={{ duration: 0.5 }}` on a dropdown | `duration: 0.2` | `MEDIUM` |
| `motion-close-faster` | A modal at `200ms` in and `200ms` out | `200ms` in, `150ms` out | `LOW` |
| `motion-tooltip-delay` | Each toolbar tooltip waiting the full delay | The first waits, its neighbours open at once | `LOW` |
| `motion-icon-crossfade` | `{copied ? <CheckIcon /> : <CopyIcon />}` | Both icons cross-fading with scale and blur | `LOW` |
| `motion-icon-morph` | Two morph-form icons cross-fading | Each `motion.path` animating `d` to its partner | `LOW` |
| `motion-blur-the-crossfade` | Two button labels overlapping mid-swap | `filter: blur(2px)` while the swap runs | `LOW` |
| `motion-blur-untracked-only` | Blur on a carousel page swipe | No blur, or blur only on the flung card | `HIGH` |
| `motion-blur-package` | `filter: blur(8px)` while a card flies | `useMotionBlur()` at its defaults | `MEDIUM` |
| `motion-blur-ref-on-mover` | `ref={blur.ref}` on a wrapper, or `bg-white` on the host | The ref on the `motion.div`, styling on its one child | `HIGH` |
| `motion-blur-follow-path` | `blur.render(previous, current)` on an orbit | `blur.render((t) => at(angle + t * speed * frameTime))` | `LOW` |
| `motion-press-scale` | `whileTap={{ scale: 0.8 }}` | `whileTap={{ scale: 0.98 }}` | `LOW` |
| `motion-short-stagger` | `staggerChildren: 0.15` | `delay: Math.min(i, 4) * 0.03` on a `0.15` fade | `LOW` |
| `motion-one-entrance-per-container` | A sheet sliding in while its rows stagger | The sheet sliding in, its rows in place | `MEDIUM` |
| `motion-direction-aware-steps` | `custom={direction}` on the child only | `custom={direction}` on `AnimatePresence` and the child | `MEDIUM` |
| `motion-exit-in-presence` | `{open && <motion.div exit={{ opacity: 0 }} />}` | The same element inside `<AnimatePresence>` | `HIGH` |
| `motion-dialogs-stay-mounted` | `{open && <Dialog.Root open>}` | `<Dialog.Root open={open} onOpenChange={setOpen}>` | `MEDIUM` |
| `motion-exit-together` | `staggerChildren: 0.03` on the exit | Every item leaving at once | `MEDIUM` |
| `motion-hide-after-fade` | `opacity: 0` on a closed menu | `opacity: 0` and then `visibility: hidden` | `HIGH` |
| `motion-starting-style` | `useEffect(() => setMounted(true), [])` to start a fade | `@starting-style { opacity: 0 }` inside `[open]` | `MEDIUM` |
| `motion-fill-both-on-delay` | `animation: fade-in 200ms 100ms` | `animation: fade-in 200ms 100ms both` | `MEDIUM` |
| `motion-view-transition-focus` | `view-transition-name: card` on every card | `match-element` on each card, focus moved after `transition.finished` | `HIGH` |
| `motion-view-transition-fetch-first` | `startViewTransition(async () => render(await fetch(url)))` | `await load(url)`, then `startViewTransition(() => render(data))` | `HIGH` |
| `motion-cross-document-transitions` | `event.preventDefault()`, a 300ms fade-out, then `location.href = url` | `@view-transition { navigation: auto; }` and a plain link | `MEDIUM` |
| `motion-animate-to-auto` | A `ResizeObserver` setting `height` for a CSS transition | `interpolate-size: allow-keywords` and `block-size: auto` | `MEDIUM` |
| `motion-measure-inner` | `ref` and `animate={{ height: bounds.height }}` on one node | The outer node animated, the inner one measured | `HIGH` |
| `motion-duration-by-distance` | `duration: 0.3` on every resize | `Math.min(Math.max(Math.abs(delta) / 500, 0.15), 0.27)` | `LOW` |
| `motion-hold-content-size` | `w-full` content inside a collapsing sidebar | `w-64` content that keeps its width | `MEDIUM` |
| `motion-no-fast-flash` | `animation: blink 200ms infinite` on an alert | A steady alert | `HIGH` |
| `motion-reduced-motion` | A drawer sliding under reduced motion | An opacity cross-fade | `MEDIUM` |
| `motion-blur-reduced-motion` | `reducedMotion: "never"` | The default `"user"` | `MEDIUM` |
| `motion-smooth-scroll-gated` | `html { scroll-behavior: smooth }` | The rule inside `@media (prefers-reduced-motion: no-preference)` | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Play the motion when a check depends on timing, and freeze it at its fastest point when a check depends on a streak. Mark every check you could not run as `Not verified`.
