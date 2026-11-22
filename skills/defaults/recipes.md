# Recipes

Code for the defaults in `SKILL.md`. Swap the literal values for the project's tokens where they exist.

## Scroll fade

```css
.scroller {
  overflow-y: auto;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    rgb(0 0 0 / 0.36) 5px,
    rgb(0 0 0 / 0.64) 10px,
    rgb(0 0 0 / 0.84) 14px,
    rgb(0 0 0 / 0.96) 19px,
    black 24px,
    black calc(100% - 24px),
    rgb(0 0 0 / 0.96) calc(100% - 19px),
    rgb(0 0 0 / 0.84) calc(100% - 14px),
    rgb(0 0 0 / 0.64) calc(100% - 10px),
    rgb(0 0 0 / 0.36) calc(100% - 5px),
    transparent
  );
}
```

For a horizontal scroller, use `to right`. Where content only ever scrolls one way, as in a chat log, fade only the end it scrolls toward. Pad the scroller by the fade's 24px at each faded end, so nothing sits under the fade at rest.

## Room for shadows

```css
.scroller {
  overflow: auto;
  padding: 8px;
  margin: -8px;
}
```

The negative margin keeps the scroller's content aligned with its neighbours while the padding gives each child's shadow room inside the clip.

## Sideways scroll

```css
pre.code {
  white-space: pre;
}

pre.code,
.table-scroll {
  overflow-x: auto;
  scrollbar-width: none;
}

pre.code::-webkit-scrollbar,
.table-scroll::-webkit-scrollbar {
  display: none;
}
```

```html
<div class="table-scroll">
  <table>...</table>
</div>
```

`white-space: pre` keeps every newline and indent, where `nowrap` would collapse the block onto one line. The table's cells keep wrapping, so a long value breaks inside its cell, and the wrapper scrolls only once the columns reach their minimum widths. Short values such as amounts and dates may take `white-space: nowrap` on their own cells.

Pair it with the scroll fade on the horizontal axis so the hidden scrollbar still reads as more content. A code block holding only text also needs a keyboard way in, which `keyboard` covers.

## Layered shadow

```css
.card {
  border: 1px solid transparent;
  box-shadow:
    0 0 0 1px var(--gray-a4),
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.03);
}
```

The first layer is the ring. The transparent border only shows in forced-colours mode, which removes every shadow. Every surface on the screen uses the same downward offsets. A dropdown and a modal step up the same scale rather than inventing their own shadow.

## Raised on hover

```css
.card {
  position: relative;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .card:hover::after {
    opacity: 1;
  }
}
```

Without `content: ""` the pseudo-element never renders. Without `position: relative` on the parent it covers the wrong box.

## Image outline

```css
.content-image {
  outline: 1px solid light-dark(rgb(0 0 0 / 0.1), rgb(255 255 255 / 0.1));
  outline-offset: -1px;
}
```

`light-dark()` follows the root's `color-scheme`, so the theme switch drives it with no second selector. Keep the outline pure black or pure white, because a tinted neutral shows as a coloured fringe.

## Theme switch

```css
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0a0a0a);
  --text-primary: light-dark(#171717, #ededed);
}

:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
}
```

Every token reads `color-scheme`, so the switch and the system setting reach the same place. With no `data-theme`, `light dark` follows the system, so System is the absence of the attribute.

A blocking script at the top of `<head>`, before any stylesheet, applies a saved choice before first paint. It is inline and carries no `defer`, `async` or `type="module"`.

```html
<script>
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = theme === "dark" ? "#0a0a0a" : "#ffffff";
      document.head.prepend(meta);
    }
  } catch {}
</script>
```

```ts
const themeColors = { light: "#ffffff", dark: "#0a0a0a" };

export function setTheme(choice: "system" | "light" | "dark") {
  const style = document.createElement("style");
  style.textContent = "*, *::before, *::after { transition: none !important; }";
  document.head.append(style);

  const root = document.documentElement;
  document.querySelector('meta[name="theme-color"]:not([media])')?.remove();
  if (choice === "system") {
    delete root.dataset.theme;
    localStorage.removeItem("theme");
  } else {
    root.dataset.theme = choice;
    localStorage.setItem("theme", choice);
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = themeColors[choice];
    document.head.prepend(meta);
  }
  void getComputedStyle(document.body).opacity;

  requestAnimationFrame(() => style.remove());
}
```

The browser uses the first `theme-color` tag whose media matches, so the unscoped tag prepended for a picked theme wins. System removes it and leaves the two media-scoped tags to follow the setting, with no listener needed. Reading a computed style forces the new theme to apply before transitions return. When the project uses a theme library, use its option for this instead.

## Forced colours

```css
@media (forced-colors: active) {
  .tab[aria-selected="true"],
  .nav-item[aria-current="page"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }

  .mask-icon {
    forced-color-adjust: none;
    background-color: CanvasText;
  }
}
```

System colours such as `Highlight`, `CanvasText` and `ButtonText` are the only ones that survive. Keep the block to small fixes for marks that vanished, never a second design.

## Hit area

```css
.icon-button {
  position: relative;
}

.icon-button::before {
  content: "";
  position: absolute;
  inset: -12px;
}
```

A 16px glyph with `inset: -12px` gives a 40px target, `-14px` gives 44px for touch and `-4px` gives the 24px floor. Shrink the inset where it would overlap a neighbour's hit area.

## Mobile baseline

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
/>
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
```

```css
html {
  color-scheme: light dark;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}

html,
body {
  overscroll-behavior: none;
}

button,
a,
[role="button"] {
  touch-action: manipulation;
}

button,
[role="button"],
[role="tab"],
.tab-bar a {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.app {
  height: 100dvh;
}

.tab-bar {
  padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
  padding-inline: max(16px, env(safe-area-inset-left, 0px)) max(16px, env(safe-area-inset-right, 0px));
}
```

Match each `theme-color` to the top of the page, not the brand colour. Safari 26 reads the colour from the fixed or sticky element touching each edge instead, so that element's `background-color` is opaque, with any blur on an inner layer. The second rule covers app controls only, with `.tab-bar a` standing for links that act as controls. Links in prose keep `user-select` and `-webkit-touch-callout`, so people can copy the text and preview the link. Set `overscroll-behavior: none` only on apps, not on documents people read.

## Keyboard inset

Where `interactive-widget` is ignored, the on-screen keyboard shrinks only the visual viewport. Lift a bottom-pinned composer by the difference.

```ts
const composer = document.querySelector<HTMLElement>(".composer");
const viewport = window.visualViewport;

function liftComposer() {
  if (!composer || !viewport) return;
  const covered = window.innerHeight - viewport.height - viewport.offsetTop;
  composer.style.bottom = `${Math.max(0, covered)}px`;
}

viewport?.addEventListener("resize", liftComposer);
viewport?.addEventListener("scroll", liftComposer);
```

Where `resizes-content` works, `innerHeight` shrinks with the keyboard, `covered` stays 0 and nothing doubles. Check it on a real iPhone with the composer focused.

## Hotkey guard

```ts
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.matches("input, textarea, select");
}

window.addEventListener("keydown", (event) => {
  if (isTyping(event.target)) return;
  handleHotkey(event);
});
```

When the project uses a hotkey library, use its option for ignoring form fields instead.

## Steady weight

A selected tab whose label must turn bold keeps its width with a hidden bold copy of the label.

```html
<button class="tab" data-label="Billing" aria-selected="true">Billing</button>
```

```css
.tab {
  display: inline-grid;
  font-weight: 400;
}

.tab::after {
  height: 0;
  overflow: hidden;
  font-weight: 600;
  content: attr(data-label);
  visibility: hidden;
  user-select: none;
}

.tab[aria-selected="true"] {
  font-weight: 600;
}
```

## Loading delay

```tsx
export function useLoadingVisible(loading: boolean, delay = 200, minimum = 400) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    const remaining = minimum - (Date.now() - shownAt.current);
    const timer = setTimeout(() => setVisible(false), Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [loading, delay, minimum]);

  return visible;
}
```

A response faster than `delay` never shows the skeleton. One that crosses it keeps the skeleton up for `minimum`, so it never flashes.

## Sound

Playback from files:

```ts
const sources = {
  success: "/sounds/success.mp3",
};
type Cue = keyof typeof sources;

const cues = new Map<Cue, HTMLAudioElement>();

function cueAudio(cue: Cue) {
  let audio = cues.get(cue);
  if (!audio) {
    audio = new Audio(sources[cue]);
    audio.preload = "auto";
    cues.set(cue, audio);
  }
  return audio;
}

export function preloadCues() {
  (Object.keys(sources) as Cue[]).forEach((cue) => cueAudio(cue).load());
}

export function playCue(cue: Cue, settings: { enabled: boolean; volume: number }) {
  if (!settings.enabled) return;
  const audio = cueAudio(cue);
  audio.volume = settings.volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
```

Nothing touches `Audio` at module scope, so the file imports safely during server rendering. Call `preloadCues()` from a client-side effect, and reset `currentTime` so a second trigger is heard. A blocked autoplay rejects `play()`, and the catch keeps that rejection out of the console while the visible twin still carries the message. A cue lasts about as long as its action, near 50ms for a press. A toggle gets a soft click, a purchase a short chime and an error a quiet cue, never a buzzer.

A synthesized click:

```ts
let context: AudioContext | null = null;

export async function playClick(volume = 0.3) {
  context ??= new AudioContext();
  const ctx = context;
  if (ctx.state === "suspended") await ctx.resume();

  const length = Math.floor(ctx.sampleRate * 0.008);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 4000;
  filter.Q.value = 3;

  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.008);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  source.start(t);
}
```

One `AudioContext` serves the page. Decay ramps exponentially to `0.001`, never to `0`, which throws. A click is 5–15ms of noise through a bandpass at 3000–6000Hz with a Q of 2–5 and gain at or under `1`.

A confirmation tone is an oscillator whose pitch moves, such as 400 to 600Hz over 40ms. When the user describes a sound, translate it. Harsh means a lower frequency or Q, muffled means a higher frequency and too long means a shorter buffer.
