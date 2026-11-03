# Recipes

Code for the ticker rules in `SKILL.md`. Duration and easing are the small-state pair in `motion`. Swap them for the project's tokens where they exist.

## Installed package

Leave `respectMotionPreference` at its default, so reduced motion does not roll. Set tabular figures on the element.

```tsx
import NumberFlow from "@number-flow/react";

const ease = "cubic-bezier(0.23, 1, 0.32, 1)";
const timing = { duration: 200, easing: ease };

<NumberFlow
  value={total}
  locales="en-IE"
  format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
  transformTiming={timing}
  spinTiming={timing}
  opacityTiming={timing}
  style={{ fontVariantNumeric: "tabular-nums" }}
/>
```

## Digit columns

Pass a stable `options` object. If a numeral is not an ASCII digit, the value renders as plain text.

```css
.ticker {
  --tick-ms: 200ms;
  --tick-ease: cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  display: inline-block;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ticker-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ticker-row {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}

.slot {
  display: inline-grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns var(--tick-ms) var(--tick-ease);
}

.slot[data-open="1"] { grid-template-columns: 1fr; }

.slot-inner {
  overflow: hidden;
  min-width: 0;
}

.tick-window {
  position: relative;
  display: block;
  width: 1ch;
  height: 1lh;
  overflow: hidden;
}

.tick-strut {
  visibility: hidden;
  display: block;
  height: 1lh;
  line-height: 1;
}

.tick-strip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  transition: transform var(--tick-ms) var(--tick-ease);
}

.tick-strip span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1lh;
  line-height: 1;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .slot,
  .tick-strip {
    transition: none;
  }
}
```

```js
const formatters = new Map();
function formatterFor(locale, options) {
  const key = locale + "\0" + JSON.stringify(options ?? {});
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, options);
    formatters.set(key, format);
  }
  return format;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function tokensFor(value, format) {
  const parts = format.formatToParts(value);
  for (const part of parts) {
    if ((part.type === "integer" || part.type === "fraction") && /[^0-9]/.test(part.value)) {
      return [{ kind: "affix", key: "plain", text: format.format(value) }];
    }
  }
  const integer = parts
    .filter((part) => part.type === "integer")
    .flatMap((part) => [...part.value].filter((ch) => /\d/.test(ch)));
  const tokens = [];
  let intSeen = 0;
  let fracSeen = 0;
  let literal = 0;

  for (const part of parts) {
    if (part.type === "integer" || part.type === "fraction") {
      for (const ch of part.value) {
        if (!/\d/.test(ch)) continue;
        if (part.type === "integer") {
          const place = integer.length - intSeen - 1;
          tokens.push({ kind: "digit", key: "i" + place, digit: Number(ch) });
          intSeen += 1;
        } else {
          tokens.push({ kind: "digit", key: "f" + fracSeen, digit: Number(ch) });
          fracSeen += 1;
        }
      }
      continue;
    }
    if (part.type === "group") {
      const placeToTheRight = integer.length - intSeen - 1;
      tokens.push({ kind: "affix", key: "g" + placeToTheRight, text: part.value });
      continue;
    }
    if (part.type === "decimal") {
      tokens.push({ kind: "affix", key: "decimal", text: part.value });
      continue;
    }
    if (part.type === "currency") {
      const before = intSeen === 0 && fracSeen === 0;
      tokens.push({
        kind: "affix",
        key: before ? "currency-pre" : "currency-post",
        text: part.value,
      });
      continue;
    }
    if (part.type === "minusSign" || part.type === "plusSign" || part.type === "percentSign") {
      tokens.push({ kind: "affix", key: part.type, text: part.value });
      continue;
    }
    tokens.push({ kind: "affix", key: "l" + literal, text: part.value });
    literal += 1;
  }
  return tokens;
}

function stepOffset(current, digit, direction) {
  const shown = mod(Math.round(current), 10);
  let delta = digit - shown;
  if (direction > 0 && delta < 0) delta += 10;
  else if (direction < 0 && delta > 0) delta -= 10;
  else if (direction === 0) {
    if (delta > 5) delta -= 10;
    else if (delta < -5) delta += 10;
  }
  return current + delta;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function tickMs() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--tick-ms").trim();
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : 200;
}

function createTicker(el, { locale, options }) {
  const format = formatterFor(locale, options);
  el.classList.add("ticker");

  const live = document.createElement("span");
  live.className = "ticker-live";
  live.setAttribute("role", "status");

  const row = document.createElement("span");
  row.className = "ticker-row";
  row.setAttribute("aria-hidden", "true");
  el.replaceChildren(live, row);

  let prev = null;
  let booted = false;
  let announced = false;

  function paint(state, animate) {
    const strip = state.strip;
    const measured = state.strip.parentElement.getBoundingClientRect().height;
    const lh = measured || parseFloat(getComputedStyle(row).fontSize) || state.lh || 0;
    state.lh = lh;
    const base = Math.round(state.offset);
    const need = new Set();
    for (let n = base - 12; n <= base + 12; n += 1) need.add(n);
    for (const child of [...strip.children]) {
      const n = Number(child.dataset.n);
      if (!need.has(n)) child.remove();
      else need.delete(n);
    }
    for (const n of need) {
      const cell = document.createElement("span");
      cell.dataset.n = String(n);
      cell.textContent = String(mod(n, 10));
      cell.style.top = n * lh + "px";
      strip.append(cell);
    }
    for (const child of strip.children) {
      child.style.top = Number(child.dataset.n) * lh + "px";
    }
    strip.dataset.offset = String(state.offset);
    const next = "translate3d(0, " + -state.offset * lh + "px, 0)";
    if (!animate) strip.style.transition = "none";
    strip.style.transform = next;
    if (!animate) {
      strip.getBoundingClientRect();
      strip.style.transition = "";
    }
  }

  function updateDigit(slot, digit, direction) {
    const state = slot._digit;
    if (state.fresh || reducedMotion()) {
      state.fresh = false;
      state.offset = digit;
      paint(state, false);
      return;
    }
    state.offset = stepOffset(state.offset, digit, direction);
    paint(state, true);
  }

  function closeSlot(slot) {
    if (reducedMotion()) {
      slot.remove();
      return;
    }
    slot.dataset.open = "0";
    const gen = (slot._gen = (slot._gen || 0) + 1);
    const remove = () => {
      if (slot._gen !== gen) return;
      if (slot.dataset.open === "0") slot.remove();
    };
    slot.addEventListener(
      "transitionend",
      (event) => {
        if (event.propertyName !== "grid-template-columns") return;
        remove();
      },
      { once: true },
    );
    setTimeout(remove, tickMs() + 80);
  }

  function set(value) {
    const direction = prev == null ? 0 : Math.sign(value - prev);
    prev = value;
    const text = format.format(value);
    const tokens = tokensFor(value, format);
    const instant = !booted || reducedMotion();
    const prior = [...row.children];
    const priorIndex = new Map(prior.map((node, index) => [node.dataset.key, index]));
    const existing = new Map(prior.map((node) => [node.dataset.key, node]));
    const used = new Set();
    const ordered = [];
    const digitUpdates = [];

    for (const token of tokens) {
      let slot = existing.get(token.key);
      if (!slot) {
        slot = document.createElement("span");
        slot.className = "slot";
        slot.dataset.key = token.key;
        slot.dataset.part = token.kind;
        const inner = document.createElement("span");
        inner.className = "slot-inner";
        slot.append(inner);
        if (token.kind === "digit") {
          const strip = document.createElement("span");
          strip.className = "tick-strip";
          const strut = document.createElement("span");
          strut.className = "tick-strut";
          strut.textContent = "0";
          const windowEl = document.createElement("span");
          windowEl.className = "tick-window";
          windowEl.append(strut, strip);
          slot._digit = { offset: token.digit, fresh: true, strip };
          inner.append(windowEl);
        } else {
          inner.textContent = token.text;
        }
        if (instant) {
          slot.style.transition = "none";
          slot.dataset.open = "1";
        } else {
          slot.dataset.open = "0";
          requestAnimationFrame(() => {
            if (slot.isConnected) slot.dataset.open = "1";
          });
        }
      } else if (token.kind === "affix") {
        slot.querySelector(".slot-inner").textContent = token.text;
        slot.dataset.open = "1";
        slot._gen = (slot._gen || 0) + 1;
      } else {
        digitUpdates.push([slot, token.digit]);
        slot.dataset.open = "1";
        slot._gen = (slot._gen || 0) + 1;
      }
      used.add(token.key);
      ordered.push(slot);
    }

    for (const slot of prior) {
      if (used.has(slot.dataset.key)) continue;
      const at = priorIndex.get(slot.dataset.key);
      ordered.splice(Math.min(at, ordered.length), 0, slot);
      closeSlot(slot);
    }

    let previous = null;
    for (const slot of ordered) {
      const expected = previous ? previous.nextSibling : row.firstChild;
      if (slot !== expected) row.insertBefore(slot, expected);
      previous = slot;
    }
    if (instant) row.getBoundingClientRect();
    for (const slot of ordered) {
      if (slot._digit && slot._digit.fresh) {
        slot.style.transition = "";
        paint(slot._digit, false);
        slot._digit.fresh = false;
      }
    }
    for (const [slot, digit] of digitUpdates) updateDigit(slot, digit, direction);
    booted = true;

    if (!announced) {
      announced = true;
      requestAnimationFrame(() => {
        live.textContent = text;
      });
    } else {
      live.textContent = text;
    }
  }

  return { set };
}
```

Keep the host element empty in the render output, so the framework does not wipe the columns.

```tsx
import { useLayoutEffect, useRef } from "react";

function Ticker({ value, locale, options }) {
  const ref = useRef(null);
  const api = useRef(null);

  useLayoutEffect(() => {
    const ticker = createTicker(ref.current, { locale, options });
    api.current = ticker;
    ticker.set(value);
    return () => ref.current?.replaceChildren();
  }, [locale, JSON.stringify(options)]);

  useLayoutEffect(() => {
    api.current?.set(value);
  }, [value]);

  return <span ref={ref} />;
}
```

## Count once

Roll from 0 after the first paint, then stop watching. A second pass on the way back up repeats the count.

```js
const seen = new WeakSet();
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting || seen.has(entry.target)) continue;
    seen.add(entry.target);
    observer.unobserve(entry.target);
    const ticker = createTicker(entry.target, { locale, options });
    ticker.set(0);
    requestAnimationFrame(() => ticker.set(Number(entry.target.dataset.value)));
  }
});
```
