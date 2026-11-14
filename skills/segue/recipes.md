# Recipes

## FLIP with the Web Animations API

Use it when the project has no animation library. `node` is the element that lands, `to` is a rect or `null` for its resting place.

```js
const running = new WeakMap();

export function carry(node, to, { from, ms = 300 } = {}) {
  const start = from ?? node.getBoundingClientRect(); // drawn now, transform included
  running.get(node)?.cancel();
  node.style.transform = "none";
  const home = node.getBoundingClientRect();
  const at = (r) =>
    r
      ? `translate(${r.left - home.left}px, ${r.top - home.top}px) scale(${r.width / home.width}, ${r.height / home.height})`
      : "none";
  const end = at(to);
  const anim = node.animate([{ transform: at(start) }, { transform: end }], {
    duration: ms,
    easing: "cubic-bezier(0.77, 0, 0.175, 1)",
  });
  running.set(node, anim);
  anim.onfinish = () => { node.style.transform = end; };
  return anim;
}
```

Set `transform-origin: 0 0` on the node. Hide the source element with `visibility: hidden` while the carried copy is up, and show it again when the carry returns. Under reduced motion, skip the keyframes and fade `opacity` from `0` to `1` over 120ms.

## Motion

Give both elements one `layoutId`. Motion measures both rects and retargets from the current one when the state flips mid-flight.

```tsx
<motion.img layoutId={`cover-${id}`} src={src} />
```

Wrap the incoming screen in `AnimatePresence` so its exit plays. `MotionConfig reducedMotion="user"` turns the travel into a fade.

## View Transitions

Name the touched element on the old side before the snapshot, and the destination on the new side. Remove the name afterwards, so no two elements share it.

```js
row.cover.style.viewTransitionName = "cover";
const transition = document.startViewTransition(() => {
  row.cover.style.viewTransitionName = "";
  detail.hero.style.viewTransitionName = "cover";
  showDetail(row);
});
await transition.finished;
detail.hero.style.viewTransitionName = "";
```

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(cover) { animation-duration: 0.01ms; }
  ::view-transition-old(cover),
  ::view-transition-new(cover) { animation-duration: 120ms; }
}
```

Read the carry with `"vt:cover"` in the probe's selector list. A second `startViewTransition` while this one runs skips it to its end.
