# Recipes

Code for the defaults in `SKILL.md`. Swap the literal values for the project's tokens where they exist.

## Scroll fade

```css
.scroller {
  overflow-y: auto;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 24px,
    black calc(100% - 24px),
    transparent
  );
}
```

For a horizontal scroller, use `to right`. Where content only ever scrolls one way, as in a chat log, fade only the end it scrolls toward.

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
.code,
.table {
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

.code::-webkit-scrollbar,
.table::-webkit-scrollbar {
  display: none;
}
```

Pair it with the scroll fade on the horizontal axis so the hidden scrollbar still reads as more content.

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

## Route transitions

```tsx
<AnimatePresence initial={false} mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

Opacity only, no `x`, `y` or `scale`. With `initial={false}` the first page renders in place and only later switches fade.
