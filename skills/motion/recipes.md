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
| List stagger | `30ms` per item, held from the fifth | `--ease-out` |
| Frequent surface entering | `150ms`, opacity only | `--ease-out` |
| Container resize | `2ms` per px, `150ms` to `270ms` | `--ease-in-out` |
| Page change under `mode="wait"` | `150ms` each way | `--ease-in-out` |
| Toast | `200ms` | `--ease-out` |
| Progress bar | `100ms` per step | `linear` |
| Hold-to-confirm fill | `2s` | `linear` |
| Hold-to-confirm release | `200ms` | `--ease-out` |
| Drag release | Spring | `stiffness: 500, damping: 30` |
| Click, key or system spring | Spring | `bounce: 0` |
| Decorative pointer-follow | Spring | `stiffness: 100, damping: 10` |

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

function shouldDismiss(distance: number, startedAt: number) {
  const velocity = Math.abs(distance) / (Date.now() - startedAt);
  return Math.abs(distance) >= DISMISS_DISTANCE || velocity > DISMISS_VELOCITY;
}

function rubberband(overshoot: number, size: number) {
  const offset = (1 - 1 / ((Math.abs(overshoot) * 0.55) / size + 1)) * size;
  return Math.sign(overshoot) * offset;
}
```

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

Keep `bounce` at `0`. Without a motion library, keep both icons in the DOM and cross-fade them over `300ms` with `cubic-bezier(0.2, 0, 0, 1)`. An icon that changes on every hover or tab switch swaps instantly instead.

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
.hold-fill {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hold:active .hold-fill {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

The transition on the target state wins, so the fill runs `2s` linear and the release runs `200ms`. Confirm on the fill's `transitionend`.

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

Two rendered elements with one name make `transition.ready` reject and skip the transition. `match-element` names by element identity, so it never crosses documents. A shared element across two pages takes the same explicit name on both.

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

Each frame carries `path(t)`, `matrix`, `dx` and `dy` in the element's own px, `streak` in screen px, and `origin`, `width` and `height`.

## Checking motion blur

Freeze the motion at its fastest point, with a ¼× control or a paused timeline. At that point:

- Sideways motion keeps its top and bottom edges sharp, and only the leading and trailing edges soften.
- Echo shows no steps at the streak length you ship.
- The streak at 60Hz is twice as long as at 120Hz.
- Nothing stays blurred once the element stops.

`onFrame` reports the streak length in px each frame. A background tab throttles `requestAnimationFrame` and stretches every streak, so check in a focused tab.
