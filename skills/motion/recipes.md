# Recipes

Code for the motion rules in `SKILL.md`. Swap the literal values for the project's tokens where they exist.

## Route transitions

```tsx
<AnimatePresence initial={false} mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: [0.77, 0, 0.175, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

Opacity only, no `x`, `y` or `scale`. With `initial={false}` the first page renders in place and only later switches fade.

## Curves and durations

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

| Motion | Duration | Curve |
| --- | --- | --- |
| Hover colour | Instant | None |
| Press and hover movement | `150ms` | `--ease-out` |
| Tooltip | `125ms` | `--ease-out` |
| Toggle or small state change | `200ms` | `--ease-out` |
| Modal or popover entering | `200ms` | `--ease-out` |
| Modal or popover leaving | `150ms` | `--ease-out` |
| Panel or drawer entering | `400ms` | `--ease-drawer` |
| Panel or drawer leaving | `350ms` | `--ease-drawer` |
| Staged entrance | `100ms` between parts | `--ease-out` |
| List stagger | `30ms` per item, held at `120ms` from the fifth, `150ms` fade | `--ease-out` |
| Frequent surface entering | `150ms`, opacity only | `--ease-out` |
| Container resize | `2ms` per px, `150ms` to `270ms` | `--ease-in-out` |
| Page change under `mode="wait"` | `150ms` each way | `--ease-in-out` |
| Toast | `200ms` | `--ease-out` |
| Progress bar | `100ms` per step | `linear` |
| Hold-to-confirm fill | `2s` | `linear` |
| Hold-to-confirm release | `200ms` | `--ease-out` |
| Drag release | Spring | `stiffness: 500, damping: 30` |
| Click, key or system spring | Spring | `bounce: 0` |
| Decorative pointer-follow | Spring | `stiffness: 100, damping: 20` |

In Motion, pass the same curves as arrays, such as `ease: [0.23, 1, 0.32, 1]`.

Similar controls share one duration. A spring that visibly oscillates, such as `stiffness: 1000` with `damping: 5`, is too loose.

## CSS springs

```tsx
import { spring } from "motion";

<style>{`
  .chip {
    transition: scale ${spring(0.3, 0)};
  }
`}</style>;
```

`spring(visualDuration, bounce)` prints a duration and a `linear()` curve. The first argument is when the motion looks done, so it is the value the duration caps apply to. The printed duration runs longer, because it includes the settling tail. Keep `bounce` at `0` for anything a click, key or the system starts.

Without a generator, sample the spring yourself:

```ts
function springEasing({ stiffness = 400, damping = 40, mass = 1 } = {}, step = 10) {
  let x = 0;
  let v = 0;
  let t = 0;
  const samples = [0];
  while (t < 5000 && (Math.abs(1 - x) > 0.001 || Math.abs(v) > 0.001)) {
    for (let i = 0; i < step; i++) {
      v += ((stiffness * (1 - x) - damping * v) / mass) / 1000;
      x += v / 1000;
    }
    t += step;
    samples.push(Math.round(x * 10000) / 10000);
  }
  samples[samples.length - 1] = 1;
  return `${t}ms linear(${samples.join(", ")})`;
}
```

Each sample is one `step` in ms, so stops sit evenly and need no percentages. Damping at `2 * Math.sqrt(stiffness * mass)` gives no bounce. The defaults reach 95% at 239ms, inside the 300ms cap, and settle at 640ms. A CSS transition carries no velocity, so a gesture release stays on a JavaScript spring.

## Drag release

```tsx
const x = useMotionValue(0);

function onDragEnd(_: PointerEvent, info: PanInfo) {
  animate(x, 0, {
    type: "spring",
    stiffness: 500,
    damping: 30,
    velocity: info.velocity.x,
  });
}

<motion.div drag="x" style={{ x }} onDragEnd={onDragEnd} />;
```

The built-in `drag` inertia already carries velocity. This is for a release the code animates itself.

A sheet driven by hand tracks the pointer with `set`, derives its scrim from the same value and springs only on release, towards the snap point nearest the projected flick.

```tsx
const DECELERATION = 0.998;

const y = useMotionValue(0);
const scrimOpacity = useTransform(y, [0, height], [1, 0]);

function project(velocity: number) {
  return ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);
}

function onPointerMove(event: PointerEvent) {
  y.set(Math.max(0, event.clientY - startY));
}

function onPointerUp(velocity: number) {
  const target = y.get() + project(velocity);
  const snap = snapPoints.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  animate(y, snap, { type: "spring", stiffness: 500, damping: 30, velocity });
}
```

`velocity` is in px per second. Use `0.99` for a snappier stop. A drag in two dimensions runs this once for `x` and once for `y`.

## Flick to dismiss

```ts
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.11;
const samples: { distance: number; time: number }[] = [];

function track(distance: number) {
  const time = performance.now();
  samples.push({ distance, time });
  while (samples.length > 2 && time - samples[0].time > 100) samples.shift();
}

function shouldDismiss(distance: number) {
  track(distance);
  const first = samples[0];
  const last = samples[samples.length - 1];
  const velocity = last.time > first.time ? (last.distance - first.distance) / (last.time - first.time) : 0;
  return distance >= DISMISS_DISTANCE || velocity > DISMISS_VELOCITY;
}

function rubberband(overshoot: number, size: number) {
  const offset = (1 - 1 / ((Math.abs(overshoot) * 0.55) / size + 1)) * size;
  return Math.sign(overshoot) * offset;
}
```

`distance` is positive toward dismissal. Empty `samples` when a drag starts, call `track` on every pointer move and `shouldDismiss` on release, so the speed is read over the last 100ms. Dividing the whole distance by the whole drag time misses a flick at the end of a slow drag.

Run `rubberband` on the distance dragged past a boundary, with `size` the sheet's length along the drag. The sheet slows rather than stopping and never travels past `size`. Call `setPointerCapture` on pointer-down and ignore a second pointer while one is dragging.

## Icon swap

```tsx
<AnimatePresence mode="popLayout" initial={false}>
  <motion.span
    key={copied ? "check" : "copy"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
  >
    {copied ? <CheckIcon /> : <CopyIcon />}
  </motion.span>
</AnimatePresence>
```

Keep `bounce` at `0`. Without a motion library, keep both icons in the DOM and cross-fade them over `300ms` on `--ease-out`. An icon that changes on every hover or tab switch swaps instantly instead.

## Icon morph

```tsx
const reduce = useReducedMotion();
const paths = copied ? checkPaths : copyPaths;

<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
  {paths.map((d, index) => (
    <motion.path
      key={index}
      initial={false}
      animate={{ d }}
      transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [0.77, 0, 0.175, 1] }}
    />
  ))}
</svg>
```

Both icons share one morph form, so path `index` in one meets path `index` in the other. Key the paths by index, never by icon, or they remount instead of morphing. Under reduced motion, wrap the swap in the cross-fade above. Without a motion library, `transition: d 240ms cubic-bezier(0.77, 0, 0.175, 1)` morphs in browsers that animate `d`. Elsewhere it swaps at once.

## Exits

```tsx
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.li
      key={item.id}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
      }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    />
  ))}
</AnimatePresence>
```

Key by id, never by index, or the wrong item exits. A reordering list uses `mode="popLayout"` so the leaving item drops out of flow. Under `mode="sync"`, take the leaving element out of flow yourself.

Nested `AnimatePresence` sets `propagate`, or children vanish when the parent exits. Keep parent and child exit durations close.

Inside an exiting child, `useIsPresent` turns off interaction, as in `disabled={!isPresent}`. Async cleanup uses `usePresence` and calls `safeToRemove` when it finishes.

## Direction-aware steps

```tsx
const variants = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
};

<AnimatePresence initial={false} mode="popLayout" custom={direction}>
  <motion.div
    key={step}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.2, ease: [0.77, 0, 0.175, 1] }}
  />
</AnimatePresence>
```

`direction` is `1` going forward and `-1` going back, flipped in right-to-left layouts. The exiting child reads `custom` from `AnimatePresence`, because its own props froze when it left.

## Hold to confirm

```css
.hold {
  user-select: none;
  -webkit-touch-callout: none;
}

.hold-fill {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hold[data-holding] .hold-fill {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

```js
const hold = document.querySelector(".hold");
const fill = hold.querySelector(".hold-fill");

function start(event) {
  if (event.type === "keydown" && (event.repeat || (event.key !== "Enter" && event.key !== " "))) return;
  if (event.type === "pointerdown") hold.setPointerCapture(event.pointerId);
  hold.dataset.holding = "";
}

function stop() {
  delete hold.dataset.holding;
}

hold.addEventListener("pointerdown", start);
hold.addEventListener("keydown", start);
for (const type of ["pointerup", "pointercancel", "keyup", "blur"]) hold.addEventListener(type, stop);

fill.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "clip-path" || !("holding" in hold.dataset)) return;
  stop();
  confirmAction();
});
```

The transition on the target state wins, so the fill runs `2s` linear and the release runs `200ms`. The release transition fires `transitionend` too, so the handler confirms only while `data-holding` is still set. `:active` is unreliable on iOS and is never held for Enter, so pointer and key events set the state.

## Top-layer entrances

```css
dialog {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 150ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 150ms cubic-bezier(0.23, 1, 0.32, 1),
    display 150ms,
    overlay 150ms;
  transition-behavior: allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: scale(1);
  transition-duration: 200ms;

  @starting-style {
    opacity: 0;
    transform: scale(0.95);
  }
}

dialog::backdrop {
  opacity: 0;
  transition:
    opacity 150ms,
    display 150ms,
    overlay 150ms;
  transition-behavior: allow-discrete;
}

dialog[open]::backdrop {
  opacity: 1;

  @starting-style {
    opacity: 0;
  }
}
```

The open state sets `200ms` and the closed state `150ms`, so the close runs faster. A popover uses the same pattern on `:popover-open`. A `@starting-style` block written at the top level instead of nested goes after `dialog[open]`, or the open rule overrides it.

## View transitions

```ts
async function navigate(url: string) {
  const data = await load(url);
  if (!document.startViewTransition) {
    render(data);
    return;
  }
  const transition = document.startViewTransition(() => render(data));
  await transition.finished;
  document.querySelector<HTMLElement>("main h1")?.focus();
}
```

In React, wrap the state change in `flushSync` inside the callback so the DOM has changed when it returns. The heading takes `tabIndex={-1}` so it can hold focus.

```css
.card {
  view-transition-name: match-element;
  view-transition-class: card;
}

::view-transition {
  pointer-events: none;
}

::view-transition-group(*.card) {
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) {
    animation: none;
  }
}
```

While a transition runs, its pseudo-elements sit over the page and take every click. `pointer-events: none` on `::view-transition` sends input to the page underneath. Two rendered elements with one name make `transition.ready` reject and skip the transition. `match-element` names by element identity, so it never crosses documents. A shared element across two pages takes the same explicit name on both.

For a multi-page site, both pages carry the opt-in:

```css
@view-transition {
  navigation: auto;
}
```

It runs on same-origin link clicks and Back and Forward, never on a typed URL or a reload. Chromium skips a navigation that takes longer than 4s.

## Height to auto

```css
:root {
  interpolate-size: allow-keywords;
}

.collapsible {
  block-size: 0;
  overflow: hidden;
  transition: block-size 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.collapsible[data-open] {
  block-size: auto;
}

details::details-content {
  block-size: 0;
  overflow: hidden;
  transition:
    block-size 200ms cubic-bezier(0.23, 1, 0.32, 1),
    content-visibility 200ms;
  transition-behavior: allow-discrete;
}

details[open]::details-content {
  block-size: auto;
}
```

```html
<details name="faq">
  <summary>Shipping</summary>
  <p>…</p>
</details>
```

Every `details` sharing a `name` closes the others when one opens. Browsers without `interpolate-size` jump to the final size.

## Scroll-linked progress

```css
@supports (animation-timeline: scroll()) {
  .reading-progress {
    transform-origin: left;
    animation: reading-progress 1ms linear both;
    animation-timeline: scroll(root block);
  }
}

@keyframes reading-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
```

Set `animation-timeline` after the `animation` shorthand, which resets it. A progress bar shows position rather than movement, so it stays under reduced motion. A parallax on the same timeline sits inside `@media (prefers-reduced-motion: no-preference)`.

## Container bounds

```tsx
function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <motion.div
      animate={{ height: height > 0 ? height : "auto" }}
      transition={{ duration: 0.2, delay: 0.05 }}
      style={{ overflow: "hidden" }}
    >
      <div ref={setNode}>{children}</div>
    </motion.div>
  );
}
```

The callback ref attaches the observer when the node mounts. The `auto` guard stops the first frame growing from zero. When the outer node collapses to `0`, give the inner node its open size, such as `width: 256px`, so its content does not reflow. Keep this for a spring library animating content that changes size, such as a label swap. A CSS transition uses [Height to auto](#height-to-auto) instead.

## Motion blur

```sh
npm install @web-kits/motion-blur
```

The element that moves is the host. Its first child is the layer, which holds everything visible.

```tsx
import { useMotionBlur } from "@web-kits/motion-blur/react";

const blur = useMotionBlur();

<motion.div ref={blur.ref} animate={{ x: open ? 320 : 0 }}>
  <div className="card-face">…</div>
</motion.div>;
```

Without React it is one call, `motionBlur(element)`. CSS transitions, CSS animations, the Web Animations API and inline transform changes are picked up on their own.

`MotionBlurProvider` sets the technique, shutter and reduced motion for a tree. Options on a blur win, and `shutter={0}` on a provider turns off every blur inside it.

```tsx
import { echo } from "@web-kits/motion-blur";
import { MotionBlurProvider } from "@web-kits/motion-blur/react";

<MotionBlurProvider technique={echo({ spacing: 1 })} shutter={270}>
  <App />
</MotionBlurProvider>;
```

| Technique | Options | Draws |
| --- | --- | --- |
| `echo()` | `spacing = 1.5`, `copies = 16` | Copies of the layer along the path, added with `plus-lighter` |
| `squeeze()` | `factor = 16` | One CSS blur stretched along the motion |
| `svg()` | | `feGaussianBlur` along one axis, turned to the motion |
| `smear()` | `limit = 1.05` | The layer stretched along the motion, with no blur |

The host stays transparent. Backgrounds, borders and shadows go on the layer or inside it, or they stay sharp under the streak. The techniques write the layer's transform, so a tilt or scale goes on an element inside the layer. With the `MotionBlur` component, animate the component and style what sits inside it.

Echo is the only technique shaped like a camera's blur, and the only one that follows rotation, scale and curves. The other three blur the whole layer one amount in one direction, so they suit straight moves only, and a spinner's edges move at different speeds. `squeeze()` and `svg()` turn the layer and its child in opposite directions, so a layer with two children throws. A smear past 1.05 distorts text.

## Motion blur by hand

For a physics loop or any position you work out yourself, call `render` once a frame. The first call stops the automatic watching.

```ts
blur.render(previous, current);
```

When the motion bends, pass a path. `t` is in frames, so `path(-0.5)` is half a frame back.

```ts
element.style.transform = at(angle).toString();
blur.render((t) => at(angle + t * speed * frameTime));
```

## Custom technique

```ts
import { sigmaFor, type Technique } from "@web-kits/motion-blur";

const soft: Technique = ({ layer }) => ({
  paint({ dx, dy }) {
    layer.style.filter = `blur(${sigmaFor(Math.hypot(dx, dy))}px)`;
  },
  clear() {
    layer.style.removeProperty("filter");
  },
});
soft.key = "soft";
```

`clear` removes every style `paint` set, and `destroy` removes anything the technique added to the page. A technique built inside a render sets `key`, so an equal one does not rebuild the painter.

Each frame carries `path(t)`, `matrix`, `dx` and `dy` in the element's own px, `streak` in screen px, and `origin`, `width` and `height`.

## Checking motion blur

Freeze the motion at its fastest point, with a ¼× control or a paused timeline. At that point:

- Sideways motion keeps its top and bottom edges sharp, and only the leading and trailing edges soften.
- Echo shows no steps at the streak length you ship.
- The streak at 60Hz is twice as long as at 120Hz.
- Nothing stays blurred once the element stops.

A demo played at a quarter of its speed multiplies the shutter by four, so `shutter: 720` keeps the full-speed streak.

`onFrame` reports the streak length in px each frame. A background tab throttles `requestAnimationFrame` and stretches every streak, so check in a focused tab.
