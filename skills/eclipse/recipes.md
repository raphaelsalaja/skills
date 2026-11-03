# Recipes

Code for the reveal in `SKILL.md`. Use the attribute the project already uses. The samples below use `data-theme`.

## Reveal

View-transition pseudos do not inherit custom properties, so the circle bakes its centre and radius into the animation. The soft mask animates `--eclipse-r` on the pseudo, which needs `@property`. Keep the mask rule on the soft mask variant only, or it clips the circle.

```css
@property --eclipse-x {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --eclipse-y {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --eclipse-r {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2;
}

html[data-eclipse="reveal"]::view-transition-group(root),
html[data-eclipse="mask"]::view-transition-group(root) {
  animation-duration: 300ms;
}

html[data-eclipse="mask"]::view-transition-new(root) {
  mask-image: radial-gradient(
    circle at var(--eclipse-x) var(--eclipse-y),
    #000 max(0px, calc(var(--eclipse-r) - 48px)),
    transparent var(--eclipse-r)
  );
}

html[data-eclipse="reduce"]::view-transition-group(root) {
  animation-duration: 150ms;
}

html[data-eclipse="reduce"]::view-transition-old(root) {
  animation: eclipse-fade-out 150ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

html[data-eclipse="reduce"]::view-transition-new(root) {
  animation: eclipse-fade-in 150ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes eclipse-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes eclipse-fade-in {
  from {
    opacity: 0;
  }
}
```

```js
const ECLIPSE_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
let eclipseRunning = false;

function eclipseReveal(next, toggle, variant = "circle") {
  if (eclipseRunning) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canTransition = typeof document.startViewTransition === "function";

  if (!canTransition) {
    const release = eclipseHold();
    applyTheme(next);
    requestAnimationFrame(() => requestAnimationFrame(release));
    return;
  }

  const mode = reduce ? "reduce" : variant === "mask" ? "mask" : "reveal";
  document.documentElement.dataset.eclipse = mode;

  let frames = null;
  if (!reduce) {
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.ceil(
      Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)),
    );
    frames =
      variant === "wipe"
        ? eclipseWipe(x)
        : variant === "mask"
          ? eclipseMask(x, y, radius)
          : eclipseCircle(x, y, radius);
  }

  const release = eclipseHold();
  eclipseRunning = true;
  const transition = document.startViewTransition(() => {
    applyTheme(next);
    void getComputedStyle(document.documentElement).opacity;
  });

  transition.ready.then(() => {
    if (!frames) return;
    document.documentElement.animate(frames, {
      duration: 300,
      easing: ECLIPSE_EASE,
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    });
  });

  transition.finished.finally(() => {
    release();
    eclipseRunning = false;
    delete document.documentElement.dataset.eclipse;
  });
}

function eclipseCircle(x, y, radius) {
  return [
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
  ];
}

function eclipseWipe(x) {
  const fromRight = x > innerWidth / 2;
  const from = fromRight ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
  return [{ clipPath: from }, { clipPath: "inset(0 0 0 0)" }];
}

function eclipseMask(x, y, radius) {
  return [
    { "--eclipse-x": `${x}px`, "--eclipse-y": `${y}px`, "--eclipse-r": "0px" },
    {
      "--eclipse-x": `${x}px`,
      "--eclipse-y": `${y}px`,
      "--eclipse-r": `${radius}px`,
    },
  ];
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {}
  const meta = document.querySelector('meta[name="theme-color"]');
  const header = document.querySelector("header");
  const top = getComputedStyle(header || root).backgroundColor;
  if (meta && top && top !== "transparent" && top !== "rgba(0, 0, 0, 0)") {
    meta.setAttribute("content", top);
  }
}
```

When the CSS keys off `.dark`, toggle that class inside `applyTheme` instead of `data-theme`. When it uses `light-dark()`, set `color-scheme` to `light` or `dark` and leave it as the only switch.

With `next-themes`, turn off `disableTransitionOnChange`. It puts transitions back after one frame. Set the provider's attribute yourself inside the callback so the snapshot does not wait for an effect, then call `setTheme`. In React, wrap that update in `flushSync`.

```tsx
flushSync(() => {
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.style.colorScheme = next;
  setTheme(next);
});
```

## Blocking script

Put this in the head after the theme CSS. It has to be inline and it must not be `defer`, `async` or `module`. The storage key matches the one `applyTheme` writes.

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var theme =
        stored === "light" || stored === "dark"
          ? stored
          : matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      var root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      var meta = document.querySelector('meta[name="theme-color"]');
      var top = getComputedStyle(root).backgroundColor;
      if (meta && top && top !== "transparent" && top !== "rgba(0, 0, 0, 0)") {
        meta.setAttribute("content", top);
      }
    } catch (error) {}
  })();
</script>
```

## Quiet

Hold transitions for the whole reveal. The instant fallback releases them on the next frame instead.

```js
function eclipseHold() {
  const style = document.createElement("style");
  style.dataset.eclipse = "quiet";
  style.textContent =
    "*, *::before, *::after { transition: none !important; }";
  document.head.appendChild(style);
  return () => style.remove();
}
```

## Artwork

Keep both versions in the page. `content-visibility` and a late `src` swap can miss the snapshot, so both should already be decoded.

```css
.for-dark {
  display: none;
}

:root[data-theme="dark"] .for-light {
  display: none;
}

:root[data-theme="dark"] .for-dark {
  display: block;
}
```

```html
<img class="for-light" src="/logo-light.svg" alt="Logo" />
<img class="for-dark" src="/logo-dark.svg" alt="" />
```
