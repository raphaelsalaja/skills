---
name: tune
description: Wires a dev-only knobs panel to a real component, then writes the settled values back into source and removes the panel.
disable-model-invocation: true
---

# Tune

This skill wires live knobs to one real component so its visual values can be dragged. It writes the settled values back into source and removes the panel.

## Knobs start from the source

Each knob starts at the value already in source, and the component reads it on every change. The panel choice, the spring fields and the opacity step are exact. Motion is one group. Spacing, radius, blur, shadow, opacity and colour are the rest.

Use it when the user wants to tweak, dial in or fine-tune values live with sliders or a knobs panel and keep the result.

Whether a settled duration, curve or spring is right belongs to `motion`. A timeline of tracks belongs to `deconstruct`. Several variants of one idea belong to `prototype`. Every state of a component on one page belongs to `lab`. Contrast of a settled colour belongs to `color`. Opening the running result belongs to `verify`.

## 1. Read the values

Name the component and each value to tune: duration, easing, spring stiffness, spring damping, spacing, radius, blur, shadow, opacity and colour. Read the current number from the token, the CSS variable or the component constant. A guessed start is `tune-read-the-source`.

## 2. Pick the panel

On React 18 or newer, Solid 1.6 or newer, Svelte 5.8 or newer, Vue 3.3 or newer or plain JavaScript, install DialKit and mount one dev-only root. Import it from `dialkit`, `dialkit/solid`, `dialkit/svelte`, `dialkit/vue` or `dialkit/vanilla`. On React, Solid and Vue, install the `motion` peer it asks for. Vue also needs `motion-v`.

When that install does not fit, use Leva on React, and a small built-in panel of range inputs anywhere else. A hand-built panel where DialKit fits is `tune-dialkit-first`.

Import the panel stylesheet once, except on Svelte, which injects it. Mount one root for every panel. DialKit hides its root in production unless `productionEnabled` is set. Leave that unset. Hide Leva outside development. A root forced on in production is `tune-dev-only`.

A timeline dock in place of knobs is `tune-knobs-not-a-timeline`.

## 3. Bind the real component

Pass the component's own values through the panel and render that component, not a copy. A slider wired to a mock is `tune-real-component`.

The first number in a slider is the source value. `[default, min, max, step]` is the shape. Opacity steps by 0.01. A spring control uses physics form, `stiffness` from 1–1000 and `damping` from 1–100. Colour stays in the source format, such as hex or oklch. A shadow is a folder of offset, blur and opacity.

Give duration and easing an easing control, and stiffness and damping that spring control. A duration slider with the radius left hardcoded, when both are in the ask, is `tune-every-visual-value`.

```tsx
const values = useDialKit("Card", {
  spacing: [20, 0, 48],
  radius: [16, 0, 40],
  blur: [8, 0, 32],
  shadow: { y: [8, 0, 24], blur: [16, 0, 48], opacity: [0.12, 0, 0.4, 0.01] },
  opacity: [1, 0, 1, 0.01],
  color: "#1c1917",
  hover: { type: "easing", duration: 0.16, ease: [0.23, 1, 0.32, 1] },
  press: { type: "spring", stiffness: 400, damping: 30 },
});
```

The numbers above are the ones read from source. A knob that changes a readout and not the component is `tune-live-binding`.

## 4. Open it

Start the dev server and open the page. Leave the panel up until the user settles on the values. A path in the reply with nothing opened is `tune-open-it`.

## 5. Write the values back

When the user settles, read the live values from the panel. Write each one into the token, CSS variable or constant it came from. Keep the unit and the colour format. Write a spring as its stiffness and damping, and an easing as its duration and curve. A value left only on the clipboard, or a spring saved as a bezier, is `tune-write-back`.

## 6. Remove the panel

Delete the root, the hook, the imports and the dependency when nothing else uses it. The diff that remains is the value change. A `DialRoot` left in the tree is `tune-remove-the-panel`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `tune-read-the-source` | A radius slider starting at `0` | The slider starting at the token's `16` |
| `tune-dialkit-first` | A custom slider row in a React app | `useDialKit` and one `DialRoot` |
| `tune-dev-only` | `<DialRoot productionEnabled />` | `<DialRoot />` |
| `tune-knobs-not-a-timeline` | `<DialTimeline />` for a press | Sliders for duration, stiffness and damping |
| `tune-real-component` | A copied card beside the product | The product `Card` reading the knobs |
| `tune-every-visual-value` | Only `duration`, with radius left at `16` | Radius, blur, shadow, opacity and colour beside the motion |
| `tune-live-binding` | A slider that updates a number only | The card's radius following the slider |
| `tune-open-it` | "Tuned at `/card`" | The page opened and a slider dragged |
| `tune-write-back` | The new radius left in the panel | `--radius: 20px` written where `16px` was |
| `tune-remove-the-panel` | `DialRoot` still mounted | The value in source and the panel gone |

## Reporting

**Severity.** `HIGH` is a mock in place of the real component, a settled value never written into source or a panel left mounted. `MEDIUM` is a hand-built panel where DialKit fits, a root forced on in production or a timeline dock. It is also a motion-only panel, a knob that does not drive the component or a guessed start. `LOW` is a page that was not opened.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every value you could not read from the source as `Not verified`.
