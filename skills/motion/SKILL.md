---
name: motion
description: Applies house motion for what animates, easing, durations, springs, gestures, exits, motion blur and reduced motion.
---

# Motion

This skill holds whether and how things move on every screen. It covers what animates, the curve and duration, gestures, choreography, exits, motion blur and reduced motion.

## Durations and curves are exact

Use the project's motion tokens wherever they exist. Where none exists, the durations, curves, scales and physics constants here are exact. Motion the user starts that runs past 300ms is a finding, apart from the drawer and hold exceptions below.

It applies to anything that moves, fades or resizes, and the first question is whether it should move at all. Data, frequent surfaces and idle elements hold still by default.

Motion blur draws with `@web-kits/motion-blur`, whose defaults are exact: a 180° shutter, Echo at one copy per 1.5px up to 16 copies and a 1.05 smear limit.

Deleting an animation and what it leaves behind belongs to `restraint`. Taking an existing animation apart belongs to `deconstruct`. Whether it holds its frame rate belongs to `frames`. Surfaces, loading, hover styles and sound belong to `defaults`. How dialogs, sheets and toasts open and close belongs to `overlays`.

## Data holds still

Charts do not draw in from zero on mount or refresh, numbers do not count up on load and table rows do not animate in. Motion marks only a real value change the user caused. A bar chart growing from zero on every refresh is `motion-still-data`.

## Sections do not reveal on scroll

Sections do not fade up as they scroll into view. A marketing page may keep one hero entrance, and any reveal that stays fires once. A fade-up on every section is `motion-no-scroll-reveals`.

## Nothing moves at rest

Persistent elements do not pulse, shimmer, glow, float or spin unless they show loading. Even a loading indicator avoids slow sustained sway near 0.2 Hz, a 5s cycle. `animate-pulse` on a status badge, or `animation: float 5s ease-in-out infinite` on a hero card, is `motion-no-idle-loops`.

An idle demo loop on a marketing page waits 2.5s before its first run, repeats no more often than every 6s and stops while the user interacts.

## Moving content pauses

Anything that moves, scrolls or updates on its own for more than 5 seconds beside other content has a visible pause, stop or hide control. A carousel stops advancing on hover and on focus. A ticker with no pause is `motion-pause-moving-content`.

## Frequent actions do not animate

Typing, keyboard shortcuts, keyboard navigation and fast toggles do not animate. A command palette opened from the keyboard appears at once. A context menu appears at once and may fade out. A scale pulse on every keystroke is `motion-no-motion-on-repeat`.

Surfaces used tens of times a day, such as rows and cards, keep only the lightest motion. Hover changes colour or border at once, with no scale or lift, and an entrance is a 150ms opacity fade. A card lifting on hover is `motion-fade-on-frequent`.

## Nothing waits on an animation

Input works from the first frame of any motion. `pointer-events: none` during an entrance, or a button disabled until a stagger lands, is `motion-never-wait`.

## App chrome fades

Page switches, panels and loading states fade with `opacity` and do not slide or scale. That is `motion-opacity-for-chrome`. Animate only the axis that changes. Animating width when only height changes is `motion-changing-axis-only`.

## Entrances do not replay

Switching pages does not replay entrances. Set `initial={false}` on the route-level `AnimatePresence`, and on any that wraps a state swap. That is `motion-no-replay-on-entry`. A cached view renders at once, with no fade or skeleton flash. That is `motion-no-flash-on-return`. See [recipes.md](recipes.md#route-transitions).

Rows in a virtualized list get no entrance, because recycled rows replay it as the list scrolls. `initial={{ opacity: 0 }}` on a virtualized row is `motion-no-entrance-on-recycled-rows`.

## Name the properties you animate

A transition lists the properties it animates, usually `opacity` and `transform`. `transition: all` is `motion-name-the-properties`.

## Toggled state transitions, keyframes run once

Interactive state changes use transitions or springs, which retarget when the user reverses. A keyframe animation on a toggled class is `motion-transitions-for-state`. Keep keyframes for sequences that run once.

Stop an animation in flight before starting another on the same element, so repeated hovers never stack sequences. A fresh `animate()` on each `mouseenter` with the last one still running is `motion-stop-before-replay`.

## Motion starts where it comes from

A dropdown or popover scales from its trigger, with `transform-origin` set to that edge. A menu growing from its own centre is `motion-origin-from-trigger`. Modals stay centred, because no trigger anchors them.

Off-screen offsets use percentages, so a sheet starts at `translateY(100%)` whatever its height. `translateY(420px)` is `motion-percent-offsets`.

An SVG part animates on a `<g>` wrapper with `transform-box: fill-box` and `transform-origin: center`, so it rotates or scales around its own centre. A spinner arc that swings around the corner of its SVG is `motion-svg-fill-box`.

## Nothing grows from zero

An entrance starts from `scale(0.95)` or higher, together with `opacity: 0`. `scale(0)` is `motion-no-scale-from-zero`.

## Gestures use springs

Drag, swipe and any motion the user can reverse mid-flight use a spring. On release, pass the pointer velocity into it. A drag release on a fixed `ease-out` is `motion-spring-for-gestures`. See [recipes.md](recipes.md#drag-release).

On release, project the flick forward and snap to the point nearest `current + project(v)`. `project(v)` is `(v / 1000) * d / (1 - d)`, with `d` at 0.998, or 0.99 for a snappier stop. Snapping to the nearest point while ignoring the flick is `motion-project-to-snap`.

Motion in two dimensions runs separate x and y springs, each with its own velocity. One spring on the combined distance is `motion-split-2d-springs`.

## The pointer drives a drag

While the pointer is down, write the offset straight to the transform or motion value, with no spring, transition or easing. The spring runs only on release. A spring chasing the pointer is `motion-track-one-to-one`.

Values linked to a drag, such as a scrim's opacity or the scale of the page behind a sheet, derive from drag progress. A scrim running its own fade beside a dragged sheet is `motion-derive-linked-values`.

Decorative pointer-follow, such as a tilt or parallax, passes through `useSpring(value, { stiffness: 100, damping: 10 })`. A functional value, such as a drag or a slider thumb, never does. A tilt card snapping to the raw pointer is `motion-spring-pointer-follow`.

## Bounce comes from force

A spring started by a click, a key or the system runs `bounce: 0`. Bounce comes only from a drag or flick release: the house `stiffness: 500, damping: 30`, or `bounce` 0.1–0.3 on a duration spring. The same sheet closed by its button settles with no bounce. A click-opened menu that bounces is `motion-bounce-after-force`.

## Drags start on purpose

A drag starts after 3px of movement, and an axis locks after 10px, so a click never nudges the element. The drag preview sits at `opacity: 0.8`. A card that shifts on every click is `motion-drag-threshold`.

Buttons, inputs and links inside a draggable surface never start a drag. A sheet that moves when its close button is pressed is `motion-controls-dont-drag`.

`touch-action` names the axis the browser keeps: `pan-y` on a horizontal carousel or swipe, `pan-x` on a vertical sheet handle and `none` only where the element handles both axes. `touch-action: none` on a carousel, which traps page scroll, is `motion-touch-action-axis`. A carousel uses `scroll-snap-type: x mandatory` with `scroll-snap-align: start` on each slide before one built by hand.

## Flicks dismiss, edges resist

A swipe dismisses on distance or on speed, so past about `0.11` px per millisecond a short flick is enough. A sheet that ignores a fast flick is `motion-flick-dismisses`.

Dragging past a boundary meets growing friction rather than a wall. The offset shown is `(1 - 1 / (overshoot * 0.55 / size + 1)) * size`, where `size` is the sheet's length along the drag. A drawer that stops dead at the top is `motion-friction-at-edges`. Capture the pointer once a drag starts and ignore extra touches. See [recipes.md](recipes.md#flick-to-dismiss).

A sheet whose body scrolls starts a drag from its handle, or from the body once it is scrolled to the top. A sheet that closes as the user scrolls its list back up is `motion-scroll-before-drag`.

## A failed drop goes back

An invalid or failed drop springs back to where it started. While a drag nears the edge of a scrolling container, the container scrolls. A card left where an invalid drop released it is `motion-drop-returns`.

## Every gesture has a button

Each drag, swipe or pinch also works with a click and with the keyboard. A list that reorders only by dragging is `motion-gesture-alternative`.

Shaking or tilting the device counts as a gesture, so it also has a button, and a setting turns the motion trigger off. Shake to undo with no off switch is `motion-no-shake-only`.

## Easing fits the change

System changes such as a toast use easing, not a spring. Entrances and exits ease out, and a change of view eases in and out. Linear is only for progress bars, clocks and a hold-to-confirm fill. A modal entering on `ease-in` is `motion-ease-by-direction`.

The built-in `ease-out` keyword is too weak. Use `cubic-bezier(0.23, 1, 0.32, 1)` to enter and exit, and `cubic-bezier(0.77, 0, 0.175, 1)` for movement on screen. A bare `ease-out` is `motion-strong-ease-out`.

## A hold fills slowly and lets go fast

A hold-to-confirm fills over 2s linear, such as `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)`. On release it snaps back over 200ms on `cubic-bezier(0.23, 1, 0.32, 1)`. The fill is a timer, so it is the named exception to the 300ms cap. A hold that drains as slowly as it filled is `motion-hold-slow-release-fast`. See [recipes.md](recipes.md#hold-to-confirm).

## One component keeps one timing

Sub-animations of one component share one duration and one easing family, set once in a `MotionConfig` wrapper or one token. A dialog whose scrim, panel and content each pick their own curve is `motion-one-timing-family`.

A follow-on move starts just before the previous one ends, such as a checkmark at 0.5s into a 0.6s draw. A checkmark waiting for the draw to finish is `motion-overlap-the-handoff`.

## Closes are faster than opens

A close runs shorter than its open. Nothing delays a close or a hover-out. A modal that takes as long to leave as it took to arrive is `motion-close-faster`.

## Motion stays under 300ms

Hover colour changes are instant, with no transition. A button fading its background over 200ms on hover is `motion-instant-hover-color`.

Press and hover movement take 120–180ms. Small state changes take 180–260ms. Nothing the user starts runs longer than 300ms, except a full panel or drawer at up to 400ms. A 500ms dropdown is `motion-under-300ms`.

Under `mode="wait"` the exit and the entrance play in series, so halve each. When motion feels slow, shorten it before changing the curve. Samples are in [recipes.md](recipes.md#curves-and-durations).

## Tooltips wait once

The first tooltip in a group opens after a delay. Its neighbours open at once and without animation while one is showing, and every tooltip closes instantly. A toolbar where each tooltip waits the full delay is `motion-tooltip-delay`.

## Icons cross-fade when they swap

An icon that swaps in place, such as copy to copied, cross-fades. Scale runs `0.25` to `1`, opacity `0` to `1` and blur `4px` to `0`. A hard swap is `motion-icon-crossfade`. See [recipes.md](recipes.md#icon-swap).

Two icons in the morph form from `icons` morph instead, animating each path's `d` as a small state change on the movement curve. Under reduced motion they cross-fade. A cross-fade between two morph-form icons is `motion-icon-morph`. See [recipes.md](recipes.md#icon-morph).

## Blur bridges a cross-fade

When a cross-fade between two states still reads as two objects, add `filter: blur(2px)` while it runs. Keep blur under 20px, which gets expensive in Safari. Two labels visibly overlapping mid-swap is `motion-blur-the-crossfade`.

## Motion blur only where the eye cannot follow

A screen already smears what the eye tracks, so added blur turns text into grey bars while someone reads it. Blur a thrown card, a dismissed sheet, a panel snapping in or a spinner. Blur on scrolling, a carousel page, a list sliding into place or text being read is `motion-blur-untracked-only`.

Draw the streak with `useMotionBlur` in React and `motionBlur(element)` elsewhere. The package sizes it from speed, frame time and shutter, follows curves and clears it at rest. A hand-written `filter: blur()` or copy loop on a moving element is `motion-blur-package`. See [recipes.md](recipes.md#motion-blur).

## The blur sits on what moves

The package watches the host's own transform. A ref on a wrapper while its child animates draws nothing, and is `motion-blur-ref-on-mover`. With the `MotionBlur` component, animate the component itself and style what sits inside it.

The host's first child is the layer, and the streak is drawn into it. Backgrounds, borders and shadows go on the layer or inside it. A background on the host stays sharp under the streak and is `motion-blur-transparent-host`.

The techniques write the layer's transform, so the layer has none of its own. A tilt or scale on the layer is lost while it moves, which is `motion-blur-bare-layer`. Put it on an element inside.

## Echo draws the streak

Keep the default `echo()`. It is the only technique shaped like a camera's blur, and the only one that follows rotation, scale and curves. Reach for `squeeze()`, `svg()` or `smear()` only when a `frames` trace shows the copies cost too much.

Those three blur the whole layer one amount in one direction, but a spinning element's edges move at different speeds. A spinner or orbit on anything but Echo is `motion-blur-echo-for-turns`. A smear limit past 1.05 on anything with text is `motion-blur-smear-limit`.

`squeeze()` and `svg()` turn the layer and its child in opposite directions, so the layer wraps exactly one element. A layer with two children throws, and is `motion-blur-one-child`.

## Curves pass a path

For a position set by hand, such as a physics loop, call `blur.render(previous, current)` once a frame. When the motion bends, pass a path instead so the copies sit along the curve. Two transforms on an orbit is `motion-blur-follow-path`. See [recipes.md](recipes.md#motion-blur-by-hand).

A demo played at a quarter of its speed multiplies the shutter by four, so `shutter: 720` keeps the full-speed streak. A slow-motion control left at 180° is `motion-blur-slowdown-shutter`.

## Custom techniques undo everything

A custom technique returns a painter whose `clear` removes every style `paint` set, and whose `destroy` removes anything it added to the page. A technique built inside a render also sets `key`, so an equal one does not rebuild the painter. A filter left on a still element, or an inline technique with no `key`, is `motion-blur-custom-technique`. See [recipes.md](recipes.md#custom-technique).

## Presses scale lightly

A pressed control scales to `0.98`, and squash or stretch stays within `0.95–1.05`. `whileTap={{ scale: 0.8 }}` is `motion-press-scale`.

## Staggers stay short

List items stagger by under 50ms each, and every item after the fifth shares the fifth item's delay. The whole list lands within 300ms. `staggerChildren: 0.15` on a list is `motion-short-stagger`.

A staged entrance that plays once, such as a title, text and actions, staggers by 100ms. Routine interactions never stagger.

A panel enters or its children stagger, never both at once. A sheet sliding in while its rows stagger is `motion-one-entrance-per-container`.

## Steps move the way they go

Steps inside one surface, such as a wizard or a nested menu, enter from the right going forward and from the left going back. Right-to-left layouts mirror both. Pages still fade.

With `AnimatePresence`, pass `custom={direction}` to the wrapper and the child, so the exiting child takes the new direction. A Back step that slides the forward way is `motion-direction-aware-steps`. See [recipes.md](recipes.md#direction-aware-steps).

## Exits need a presence boundary

A conditional element with an `exit` sits inside `AnimatePresence`, keyed by a stable id, and exits to its `initial` values. An exit that never plays because the wrapper is missing is `motion-exit-in-presence`. See [recipes.md](recipes.md#exits).

A dialog from a component library stays mounted and toggles its `open` prop. A dialog rendered behind `open &&`, which loses its close animation, is `motion-dialogs-stay-mounted`.

## Exits leave together and leave fully

Exits never stagger, and everything leaves at once. A list fading out item by item is `motion-exit-together`.

An element faded to `opacity: 0` gets `visibility: hidden`, or is removed, once the fade ends. An invisible menu still catching clicks is `motion-hide-after-fade`.

## CSS sets its own start state

A CSS entrance sets its start in `@starting-style` inside the open selector, not with a mounted flag set in an effect. A `useEffect` flipping `mounted` to start a fade is `motion-starting-style`.

A top-layer exit transitions `opacity`, `transform`, `display` and `overlay`, with `transition-behavior: allow-discrete` as its own declaration. Inside the shorthand, older browsers drop the whole transition. Animate `::backdrop` the same way. Only Chromium animates `overlay`, so the exit is instant elsewhere. See [recipes.md](recipes.md#top-layer-entrances).

A CSS animation with a delay sets `animation-fill-mode: both`, or delayed items flash their end state first. A delayed fade with no fill mode is `motion-fill-both-on-delay`.

## View transitions hand over focus

With `document.startViewTransition()`, each `view-transition-name` is unique on each side and removed once the transition ends. Focus moves to the new content after `transition.finished`. A name left on two cards, or focus left on the old view, is `motion-view-transition-focus`.

## Size animates to auto

For a CSS transition to content size, set `:root { interpolate-size: allow-keywords }` and transition `block-size` from `0` to `auto`. Browsers without support jump to the final size, which is acceptable. A `ResizeObserver` feeding a CSS transition is `motion-animate-to-auto`.

An accordion transitions `block-size` and `content-visibility` on `details::details-content`, with `transition-behavior: allow-discrete`. An exclusive accordion uses `<details name="group">`. See [recipes.md](recipes.md#height-to-auto).

Measure only for a spring library: read an inner element with a `ResizeObserver` and animate the outer one to its size. Measuring and animating the same node is `motion-measure-inner`. See [recipes.md](recipes.md#container-bounds).

A container resizing between views takes 2ms per px of height change, clamped to 150–270ms. A fixed 300ms on every resize is `motion-duration-by-distance`.

While a panel collapses, its content keeps its open width, so nothing reflows mid-animation. Sidebar content set to `w-full` as the sidebar closes is `motion-hold-content-size`.

## Nothing flashes fast

No element flashes more than three times in any one second. An alert that blinks five times a second is `motion-no-fast-flash`.

## Reduced motion removes movement

When `prefers-reduced-motion: reduce` matches, slides, scales and blurs become an opacity cross-fade. Delays and staggers drop to zero. A drag still tracks 1:1 but loses its momentum and bounce. A sliding drawer that ignores the setting is `motion-reduced-motion`.

Motion blur drops its streak under the setting while `reducedMotion` stays at `"user"`. `reducedMotion: "never"` is `motion-blur-reduced-motion`.

`scroll-behavior: smooth`, and `behavior: "smooth"` in `scrollTo` or `scrollIntoView`, sit inside `@media (prefers-reduced-motion: no-preference)` or its `matchMedia` check. A jump farther than one viewport height goes instantly even then. A bare `html { scroll-behavior: smooth }` is `motion-smooth-scroll-gated`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `motion-still-data` | Bars growing from zero on every refresh | Bars drawn at their values, moving only when a filter changes them |
| `motion-no-scroll-reveals` | `whileInView={{ opacity: 1, y: 0 }}` on every section | Sections rendered in place, one hero entrance at most |
| `motion-no-idle-loops` | `animate-pulse` on a status badge | A steady badge |
| `motion-pause-moving-content` | An auto-advancing carousel with no pause | A pause control, and no advance on hover or focus |
| `motion-no-motion-on-repeat` | `animate={{ scale: [1, 1.02, 1] }}` on each keystroke | No motion on the input |
| `motion-fade-on-frequent` | `hover:-translate-y-0.5 hover:shadow-lg` on a list card | `hover:bg-muted`, applied at once |
| `motion-never-wait` | `pointer-events: none` until the entrance ends | Input live from the first frame |
| `motion-opacity-for-chrome` | `initial={{ x: 20, scale: 0.95 }}` on a page | `initial={{ opacity: 0 }}` |
| `motion-changing-axis-only` | `animate={{ width, height }}` when only height changes | `animate={{ height }}` |
| `motion-no-replay-on-entry` | `<AnimatePresence>` around routes, entrances replay | `<AnimatePresence initial={false}>` |
| `motion-no-flash-on-return` | A skeleton flash on a cached view | The cached view rendered at once |
| `motion-no-entrance-on-recycled-rows` | `initial={{ opacity: 0 }}` on a virtualized row | The row rendered in place |
| `motion-name-the-properties` | `transition: all 200ms` | `transition: opacity 200ms, transform 200ms` |
| `motion-transitions-for-state` | `.open { animation: slide-in 200ms }` | `transition: transform 200ms` on the toggled property |
| `motion-stop-before-replay` | `animate(el, sequence)` on every `mouseenter` | `controls?.stop()` before the next `animate()` |
| `motion-origin-from-trigger` | A dropdown scaling from `center` | `transform-origin: top left` under a left-aligned trigger |
| `motion-percent-offsets` | `transform: translateY(420px)` on a closed sheet | `transform: translateY(100%)` |
| `motion-svg-fill-box` | `rotate` on a `<path>` turning around the SVG's top-left corner | The path in a `<g>` with `transform-box: fill-box; transform-origin: center` |
| `motion-no-scale-from-zero` | `initial={{ scale: 0 }}` on a popover | `initial={{ scale: 0.95, opacity: 0 }}` |
| `motion-spring-for-gestures` | A drag release on `duration: 0.3, ease: "easeOut"` | `type: "spring"` with `velocity: info.velocity.x` |
| `motion-project-to-snap` | Snapping to the point nearest the release position | Snapping to the point nearest `current + project(v)` |
| `motion-split-2d-springs` | One spring on `Math.hypot(dx, dy)` | One spring on `x` and one on `y`, each with its own velocity |
| `motion-track-one-to-one` | `animate(y, offset, { type: "spring" })` on pointer move | `y.set(offset)` on pointer move, the spring in the end handler |
| `motion-derive-linked-values` | `animate(scrim, { opacity: 0 })` beside a dragged sheet | `useTransform(y, [0, height], [1, 0])` |
| `motion-spring-pointer-follow` | `rotateX` set straight from the pointer on a tilt card | `useSpring(rotateX, { stiffness: 100, damping: 10 })` |
| `motion-bounce-after-force` | `bounce: 0.3` on a menu opened by a click | `bounce: 0` |
| `motion-drag-threshold` | A drag that starts on the first pixel | A drag that starts after 3px, the axis locked after 10px |
| `motion-controls-dont-drag` | A drag starting from any pointer-down in the sheet | `if (target.closest("button, input, a")) return` |
| `motion-touch-action-axis` | `touch-action: none` on a horizontal carousel | `touch-action: pan-y` |
| `motion-flick-dismisses` | Dismiss only past a fixed distance | Dismiss past the distance or above `0.11` px per ms |
| `motion-friction-at-edges` | A drawer that stops dead at its top | `(1 - 1 / (overshoot * 0.55 / size + 1)) * size` past the edge |
| `motion-scroll-before-drag` | `drag="y"` on a sheet whose list scrolls | The drag starting from the handle, or from the list at `scrollTop: 0` |
| `motion-drop-returns` | A card left where an invalid drop released it | The card springing back to its source |
| `motion-gesture-alternative` | Rows that reorder only by drag | `Move Up` and `Move Down` in the row menu |
| `motion-no-shake-only` | Shake to undo with no button | An `Undo` button, and a setting that turns shaking off |
| `motion-ease-by-direction` | A modal entering on `ease-in` | Ease-out in and out, the exit shorter |
| `motion-strong-ease-out` | `transition: transform 200ms ease-out` | `transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1)` |
| `motion-hold-slow-release-fast` | `transition: clip-path 2s linear` both ways | `2s linear` to fill, `200ms cubic-bezier(0.23, 1, 0.32, 1)` back |
| `motion-one-timing-family` | A scrim at `300ms ease`, its panel at `200ms` on a spring | Both under one `MotionConfig` transition |
| `motion-overlap-the-handoff` | A checkmark that starts once a `0.6s` draw ends | The checkmark starting at `0.5s` |
| `motion-close-faster` | A modal at `200ms` in and `200ms` out | `200ms` in, `150ms` out |
| `motion-instant-hover-color` | `transition: background-color 200ms` on a button | The hover colour applied at once |
| `motion-under-300ms` | `transition={{ duration: 0.5 }}` on a dropdown | `duration: 0.2` |
| `motion-tooltip-delay` | Each toolbar tooltip waiting the full delay | The first waits, its neighbours open at once |
| `motion-icon-crossfade` | `{copied ? <CheckIcon /> : <CopyIcon />}` | Both icons cross-fading with scale and blur |
| `motion-icon-morph` | Two morph-form icons cross-fading | Each `motion.path` animating `d` to its partner |
| `motion-blur-the-crossfade` | Two button labels overlapping mid-swap | `filter: blur(2px)` while the swap runs |
| `motion-blur-untracked-only` | Blur on a carousel page swipe | No blur, or blur only on the flung card |
| `motion-blur-package` | `filter: blur(8px)` while a card flies | `useMotionBlur()` on the card |
| `motion-blur-ref-on-mover` | `ref={blur.ref}` on a wrapper around the `motion.div` | `ref={blur.ref}` on the `motion.div` |
| `motion-blur-transparent-host` | `bg-white rounded-xl` on the host | The same classes on its first child |
| `motion-blur-bare-layer` | `rotate-3` on the layer | `rotate-3` on an element inside the layer |
| `motion-blur-echo-for-turns` | `technique: squeeze()` on a spinner | `technique: echo()` |
| `motion-blur-smear-limit` | `smear({ limit: 1.3 })` on a card with text | `smear()` at its 1.05 default, or `echo()` |
| `motion-blur-one-child` | `squeeze()` on a layer holding an icon and a label | The icon and label wrapped in one element |
| `motion-blur-follow-path` | `blur.render(previous, current)` on an orbit | `blur.render((t) => at(angle + t * speed * frameTime))` |
| `motion-blur-slowdown-shutter` | A ¼× demo at `shutter: 180` | `shutter: 720` |
| `motion-blur-custom-technique` | `clear() {}`, or `technique: ({ layer }) => …` inside a render | `clear()` removing every style `paint` set, and a `key` |
| `motion-press-scale` | `whileTap={{ scale: 0.8 }}` | `whileTap={{ scale: 0.98 }}` |
| `motion-short-stagger` | `staggerChildren: 0.15` | `delay: Math.min(i, 4) * 0.03` |
| `motion-one-entrance-per-container` | A sheet sliding in while its rows stagger | The sheet sliding in with its rows already in place |
| `motion-direction-aware-steps` | `custom={direction}` on the child only | `custom={direction}` on `AnimatePresence` and the child |
| `motion-exit-in-presence` | `{open && <motion.div exit={{ opacity: 0 }} />}` | The same element inside `<AnimatePresence>` |
| `motion-dialogs-stay-mounted` | `{open && <Dialog.Root open>}` | `<Dialog.Root open={open} onOpenChange={setOpen}>` |
| `motion-exit-together` | `staggerChildren: 0.03` on the exit | Every item leaving at once |
| `motion-hide-after-fade` | `opacity: 0` on a closed menu | `opacity: 0` and then `visibility: hidden` |
| `motion-starting-style` | `useEffect(() => setMounted(true), [])` to start a fade | `@starting-style { opacity: 0 }` inside `[open]` |
| `motion-fill-both-on-delay` | `animation: fade-in 200ms 100ms` | `animation: fade-in 200ms 100ms both` |
| `motion-view-transition-focus` | `view-transition-name: card` on every card | A name per card, cleared after `transition.finished` and focus moved |
| `motion-animate-to-auto` | A `ResizeObserver` setting `height` for a CSS transition | `interpolate-size: allow-keywords` and `block-size: auto` |
| `motion-measure-inner` | `ref` and `animate={{ height: bounds.height }}` on one node | The outer node animates, the inner node holds the `ref` |
| `motion-duration-by-distance` | `duration: 0.3` on every resize | `Math.min(Math.max(Math.abs(delta) / 500, 0.15), 0.27)` |
| `motion-hold-content-size` | `w-full` content inside a collapsing sidebar | `w-64` content that keeps its width |
| `motion-no-fast-flash` | `animation: blink 200ms infinite` on an alert | A steady alert |
| `motion-reduced-motion` | A drawer that slides and a list that staggers under reduced motion | An opacity cross-fade with no delay |
| `motion-blur-reduced-motion` | `reducedMotion: "never"` | The default `"user"` |
| `motion-smooth-scroll-gated` | `html { scroll-behavior: smooth }` | The same rule inside `@media (prefers-reduced-motion: no-preference)`, with `behavior: "instant"` past one viewport height |

## Reporting

**Severity.** `HIGH` breaks use or access. That is an exit that never plays, a container that measures itself or a gesture with no button. It is also anything flashing more than three times a second, or a sheet that closes when its list scrolls. It is also motion blur on text being read, or a layer with two children under `squeeze()` or `svg()`. It is also input blocked by an animation, an invisible element still taking clicks or moving content with no pause. It is also a control that starts a drag, a carousel that traps page scroll or a shake with no button. It is also focus left behind after a view transition.

`MEDIUM` is a sliding page, a replayed entrance, a gesture on a fixed curve or motion over 300ms. It is also motion on typing, a wrong curve, `transition: all`, keyframes on toggled state or ignored reduced motion. It is also a conditionally rendered dialog, content reflowing as it collapses, a `scale(0)` entrance or a sheet that ignores a flick. It is also a hand-written blur, a blur ref on a wrapper, an opaque host or a transform on the layer. It is also a spinner on anything but Echo, a smear past 1.05 or `reducedMotion: "never"`. It is also data that animates in, sections that reveal on scroll or an idle loop. It is also a spring chasing the pointer, a linked value on its own animation or a drag with no threshold. It is also stacked hover sequences, entrances on recycled rows or a panel and its children entering together. It is also a mounted flag instead of `@starting-style`, a delay with no fill mode or a Back step sliding forward. It is also a failed drop that stays put, a staggered exit or a `ResizeObserver` behind a CSS transition. It is also an SVG part that turns around the SVG's origin rather than its own centre. It is also smooth scrolling outside a reduced motion query, or a long jump that glides.

`LOW` is a faded hover colour, a heavy press scale or a long stagger. It is also motion from the wrong origin, a close as slow as its open, a slow tooltip or a hard icon swap. It is also a bare `ease-out`, an unblurred cross-fade or a drawer with no edge friction. It is also two transforms on a curve, a slowed demo at the full-speed shutter or a custom technique that leaves styles or rebuilds. It is also a lifting card, a pixel offset, an ignored flick projection, one spring across two axes or a click that bounces. It is also an unsprung tilt, mixed timings in one component, a follow-on that waits or a hold that drains slowly. It is also a fixed resize duration.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Play the motion when a check depends on timing, and freeze it at its fastest point when a check depends on a streak. Mark every check you could not run as `Not verified`.
