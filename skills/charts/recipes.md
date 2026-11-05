# Recipes

Code for the chart rules in `SKILL.md`. Use the chart the project already has. These snippets are the layer, written for a plain SVG chart and then hooked to the library that owns the series.

The curves are the ones in `motion`.

```js
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";

function ease(x1, y1, x2, y2, t) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const x =
      3 * (1 - mid) ** 2 * mid * x1 +
      3 * (1 - mid) * mid ** 2 * x2 +
      mid ** 3;
    if (x < t) lo = mid;
    else hi = mid;
  }
  const u = (lo + hi) / 2;
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
}

const move = (t) => ease(0.77, 0, 0.175, 1, t);
```

## Overlay

One rect covers the plot. The hairline and the readout update through the DOM, not through render state.

```html
<p class="readout">
  <span class="value"></span>
  <span class="when"></span>
</p>
<div class="plot" tabindex="0" style="touch-action: pan-y">
  <svg>
    <path class="area"></path>
    <path class="stroke" fill="none"></path>
    <line class="hairline" stroke-width="1" visibility="hidden"></line>
    <circle class="dot" r="3" visibility="hidden"></circle>
    <rect class="hit" fill="transparent"></rect>
  </svg>
</div>
```

```js
function localX(event, svg, viewWidth) {
  const rect = svg.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * viewWidth;
}

function nearestIndex(points, x) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dist = Math.abs(points[i].x - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function bandIndex(count, x, width) {
  if (count <= 1) return 0;
  const index = Math.floor(x / (width / count));
  return Math.max(0, Math.min(count - 1, index));
}

function showPoint(points, index) {
  const point = points[index];
  hairline.setAttribute("x1", point.x);
  hairline.setAttribute("x2", point.x);
  hairline.setAttribute("y1", plotTop);
  hairline.setAttribute("y2", plotBottom);
  hairline.setAttribute("visibility", "visible");
  dot.setAttribute("cx", point.x);
  dot.setAttribute("cy", point.y);
  dot.setAttribute("visibility", "visible");
  value.textContent = format(point.value);
  when.textContent = point.label;
}

hit.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  showPoint(shown, nearestIndex(shown, localX(event, svg, viewWidth)));
});
```

On a bar chart, call `bandIndex` instead of `nearestIndex`.

## Readout

Keep the readout outside the plot, in one place. At rest, pass the last index. Format with `Intl.NumberFormat` and set `font-variant-numeric: tabular-nums` on `.value`.

## Range morph

Resample to the larger count, then interpolate values and the y domain together. At the end, draw the real destination series so the snap points stay real.

```js
function resample(points, count) {
  if (points.length === count) return points.map((point) => ({ ...point }));
  const last = points.length - 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : (i / (count - 1)) * last;
    const a = Math.floor(t);
    const b = Math.min(last, a + 1);
    const f = t - a;
    out.push({
      value: points[a].value + (points[b].value - points[a].value) * f,
      label: f < 0.5 ? points[a].label : points[b].label,
    });
  }
  return out;
}

function morphTo(next) {
  const from = current;
  const count = Math.max(from.length, next.length);
  const a = resample(from, count);
  const b = resample(next, count);
  const started = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - started) / 200);
    const e = move(t);
    const mid = a.map((point, i) => ({
      value: point.value + (b[i].value - point.value) * e,
      label: e < 0.5 ? point.label : b[i].label,
    }));
    draw(mid);
    if (t < 1) requestAnimationFrame(frame);
    else {
      current = next;
      draw(next);
    }
  }
  requestAnimationFrame(frame);
}
```

For bars, interpolate each bar's height from `resample` and skip the path.

Write the chosen range into the query string and set `aria-pressed` on its button.

## Draw-in

Animate the stroke once. Fade the fill over the same 400ms. Clear the dash array when the draw-in ends.

```js
function drawIn(stroke, area) {
  const length = stroke.getTotalLength();
  stroke.style.strokeDasharray = `${length}`;
  stroke.style.strokeDashoffset = `${length}`;
  const drawn = stroke.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    { duration: 400, easing: EASE_OUT, fill: "forwards" },
  );
  drawn.onfinish = () => {
    stroke.style.strokeDasharray = "none";
    stroke.style.strokeDashoffset = "0";
  };
  area.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 400,
    easing: EASE_OUT,
    fill: "forwards",
  });
}
```

A second series delays its `drawIn` by the staged stagger in `motion`. Do not call `drawIn` again when the range changes or the data refreshes.

## Touch

```js
let finger = false;

hit.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  finger = true;
  hit.setPointerCapture(event.pointerId);
  showPoint(shown, nearestIndex(shown, localX(event, svg, viewWidth)));
});

hit.addEventListener("pointermove", (event) => {
  if (!finger || event.pointerType === "mouse") return;
  showPoint(shown, nearestIndex(shown, localX(event, svg, viewWidth)));
});

hit.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse") return;
  finger = false;
  hide();
});

hit.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse" && !finger) hide();
});

plot.addEventListener("keydown", (event) => {
  const last = shown.length - 1;
  let index = currentIndex ?? last;
  if (event.key === "ArrowLeft") index = Math.max(0, index - 1);
  else if (event.key === "ArrowRight") index = Math.min(last, index + 1);
  else if (event.key === "Home") index = 0;
  else if (event.key === "End") index = last;
  else return;
  event.preventDefault();
  showPoint(shown, index);
});
```

`pointermove` for the mouse sits in [Overlay](#overlay). Keep both listeners, or fold them into one that treats a finger as down-only.

## Dark values

Map the series to the project's accent token in each theme. With no token, set the grid and the crosshair here. Check both themes with `color`.

```css
:root {
  --chart-grid: rgba(0, 0, 0, 0.08);
  --chart-crosshair: rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  :root {
    --chart-grid: rgba(255, 255, 255, 0.12);
    --chart-crosshair: rgba(255, 255, 255, 0.55);
  }
}
```

## Reduced motion

Skip the draw-in. Cross-fade the series on a range change. Move the hairline by setting it, with no transition.

```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function changeRange(next) {
  if (!reduce) {
    morphTo(next);
    return;
  }
  series.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    easing: EASE_OUT,
  });
  setTimeout(() => draw(next), 100);
}
```

## Libraries

| Library | Pointer | Points |
| --- | --- | --- |
| Plain SVG | The overlay rect | The array you plotted |
| Recharts | An overlay inside the chart. Do not use the default tooltip | The `data` prop |
| Visx | An overlay rect and `localPoint` | The data array, bisect on x |
| Chart.js | `getElementsAtEventForMode(event, "index", { intersect: false }, true)` | The dataset at that index |
| ECharts | `updateAxisPointer`, with the default tooltip hidden | `convertFromPixel`, then the nearest index |
| D3 | An overlay rect and `d3.pointer` | `d3.bisector` on x |
| react-native-skia | `Gesture.Pan()` on the canvas | Hit test the scaled x |
