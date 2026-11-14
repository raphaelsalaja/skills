# Recipes

## The glass surface

Colour comes from role tokens, one set per theme. `--glass-solid` is the opaque fallback.

```css
.glass {
  background: rgba(var(--glass-tint), var(--glass-alpha));
  -webkit-backdrop-filter: blur(14px) brightness(var(--glass-bright)) saturate(1.5);
  backdrop-filter: blur(14px) brightness(var(--glass-bright)) saturate(1.5);
}

/* Chromium only: the displacement filter sits between blur and brightness */
html.refract .glass {
  backdrop-filter: blur(14px) var(--refract) brightness(var(--glass-bright)) saturate(1.5);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--glass-solid); }
}

@media (prefers-reduced-transparency: reduce) {
  .glass, html.refract .glass {
    background: var(--glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
```

## The rim

```css
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.5px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.08) 38%, rgba(255, 255, 255, 0.08) 62%, rgba(255, 255, 255, 0.7));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```

## The displacement map

The map is a canvas the size of the surface. Red is the horizontal pull and green is the vertical pull, with 128 meaning none. Pixels inside the bezel are pulled along the inward normal of the rounded rectangle, and the middle stays at 128, so text is never distorted.

```js
function bezelMap(w, h, radius, bezel) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  const image = g.createImageData(w, h);
  const inside = (x, y) => {
    const dx = Math.abs(x - w / 2) - (w / 2 - radius);
    const dy = Math.abs(y - h / 2) - (h / 2 - radius);
    return radius - (Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0));
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = inside(x + 0.5, y + 0.5);
      const i = (y * w + x) * 4;
      let nx = 0, ny = 0, pull = 0;
      if (d < bezel) {
        nx = (inside(x + 1.5, y + 0.5) - inside(x - 0.5, y + 0.5)) / 2;
        ny = (inside(x + 0.5, y + 1.5) - inside(x + 0.5, y - 0.5)) / 2;
        pull = (1 - Math.max(d, 0) / bezel) ** 2;
      }
      image.data.set([128 + 127 * pull * nx, 128 + 127 * pull * ny, 128, 255], i);
    }
  }
  g.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
```

One filter per surface, in an inline SVG, with `color-interpolation-filters="sRGB"` so the 128 stays neutral:

```js
function refract(surface, id, bezel = 22, scale = 46) {
  const { width, height } = surface.getBoundingClientRect();
  const w = Math.round(width), h = Math.round(height);
  const radius = parseFloat(getComputedStyle(surface).borderTopLeftRadius);
  defs.insertAdjacentHTML("beforeend",
    `<filter id="${id}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">
       <feImage href="${bezelMap(w, h, radius, bezel)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
       <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
     </filter>`);
  surface.style.setProperty("--refract", `url(#${id})`);
}
```

Gate it: `const chromium = navigator.userAgentData?.brands.some((b) => b.brand === "Chromium")`. Add `refract` to `<html>` only then, and call `refract` for each surface again on resize.
