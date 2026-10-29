---
name: defaults
description: Applies house defaults for scroll edges, surfaces, type, motion, sound, focus, forms, loading, hotkeys and dialogs.
---

# Defaults

This skill holds the interface defaults that apply on every screen. It covers surfaces, type, motion, sound, focus, forms, loading and overlays.

## Tokens first, then these values

Use the project's token wherever one exists for a value below. Where none exists, the values here are exact. A hard scroll cut or a clipped shadow is a finding in any style.

Words and punctuation belong to `copy`. Building any of these with the project's primitive belongs to `reuse`. Whether a sound or an animation should exist at all belongs to `restraint`. Concentric radii, optical nudges and icon alignment belong to `alignment`. Taking an existing animation apart belongs to `deconstruct`.

## Scroll edges fade

A scroll container fades at its ends with a `mask-image` gradient. A hard cut at the overflow edge is `defaults-fade-not-cut`. The recipe is in [recipes.md](recipes.md#scroll-fade).

## Shadows are never cut off

Give a scroller enough padding that its children's shadows fit inside it. A shadow clipped by `overflow: hidden` is `defaults-no-clipped-shadow`. See [recipes.md](recipes.md#room-for-shadows).

## Code and tables scroll, never wrap

Code blocks and data tables scroll sideways with a hidden scrollbar. A wrapping code line is `defaults-scroll-not-wrap`. See [recipes.md](recipes.md#sideways-scroll).

## Overlays keep their scroll

Scrollable dialogs, drawers, menus and side panels set `overscroll-behavior: contain`. A modal list whose end scrolls the page behind it is `defaults-contain-overscroll`.

## Sticky chrome keeps its edge

A sticky header or footer takes a 1px border against the content scrolling under it. A borderless sticky header is `defaults-sticky-border`.

Set `scroll-padding-block-start` to the sticky header's height, so anchors and focused fields land below it. A focused field hidden under the header is `defaults-clear-sticky-chrome`.

## Floating surfaces take a ring, not a border

A popover, menu or card that floats pairs its shadow with a translucent 1px ring inside the shadow stack. An opaque `border` beside a shadow is `defaults-ring-not-border`. Keep `border: 1px solid transparent` under the ring, so forced-colours mode still draws an edge.

## Shadows are layered and fall one way

Use the project's elevation token. Without one, layer three shadows with blur growing and opacity falling, all offset downward. One `0 4px 16px rgba(0, 0, 0, 0.2)` is `defaults-layered-shadows`. See [recipes.md](recipes.md#layered-shadow).

To raise a surface on hover, fade in a pseudo-element that holds the raised shadow. A transition on `box-shadow` is `defaults-fade-the-shadow`. See [recipes.md](recipes.md#raised-on-hover).

## Content images take a faint outline

Photos and screenshots take a 1px outline inset by 1px, black at 10% in light mode and white at 10% in dark. A photo edge melting into its card is `defaults-image-outline`. Skip logos and transparent artwork. See [recipes.md](recipes.md#image-outline).

## Cards never nest

A card never sits inside another card. Put the heading outside and let one surface hold the content. A card inside a card is `defaults-no-nested-cards`.

## Rounded, not pill

Buttons and chips use the radius token. `border-radius: 9999px` is `defaults-rounded-not-pill`.

## No decoration

Drop decorative gradients, glows, blur and depth effects. A glow behind a card is `defaults-no-decoration`.

## The theme reaches the browser

A dark theme sets `color-scheme: dark` on the root, so scrollbars and native controls follow it. A light scrollbar on a dark page is `defaults-color-scheme`. Set one `theme-color` tag per colour scheme, matching the top of the page.

A theme switch turns transitions off for one frame. Every colour fading at once as the theme changes is `defaults-quiet-theme-switch`. See [recipes.md](recipes.md#theme-switch).

## Focus rings for the keyboard only

Use `:focus-visible` with `outline`. A ring on every click is `defaults-focus-keyboard-only`.

## Dialogs hold focus

A dialog moves focus inside on open, keeps Tab inside and returns focus to its trigger on close. Focus left on the page behind an open dialog is `defaults-trap-and-return-focus`. A native `<dialog>` opened with `showModal()` handles the trap.

## Targets are at least 24px

Every interactive target is at least 24px on its shorter side, and aims for 40px with a mouse and 44px on touch. When the glyph is smaller, a pseudo-element with a negative inset carries the hit area. A 16px icon button with a 16px hit box is `defaults-hit-area`. Extended hit areas never overlap. See [recipes.md](recipes.md#hit-area).

## Controls say what they are

An icon-only button carries an `aria-label` that says what it does. A bare trash icon with no name is `defaults-name-icon-buttons`.

Status never rests on colour alone. Pair it with an icon or a word. A red dot as the only sign of an error is `defaults-not-color-alone`.

## Links are links

Navigation uses `<a href>`, so new-tab clicks, middle clicks and copy link all work. A `div` whose `onClick` changes the route is `defaults-links-are-links`.

## State lives in the URL

Filters, tabs, pagination and open panels write to the URL, so refresh, share and Back keep them. A filter lost on refresh is `defaults-state-in-url`.

## Zoom stays on

Never set `maximum-scale=1` or `user-scalable=no` in the viewport tag. A page that blocks pinch zoom is `defaults-allow-zoom`.

## Taps feel native

Set `-webkit-tap-highlight-color: transparent` once on the root, and give every tappable element its own `:active` state. A grey flash on tap is `defaults-no-tap-highlight`.

Buttons and links set `touch-action: manipulation`, so a tap fires without waiting for a second tap. A tap that lands 300ms late is `defaults-fast-tap`. See [recipes.md](recipes.md#mobile-baseline).

## Full-height layouts use dynamic units

An app shell or a bottom-pinned bar uses `100dvh`, and a first screen uses `min-height: 100svh`. A `100vh` shell whose bottom button hides under the URL bar is `defaults-dynamic-viewport`.

## Content clears the notch

Add `viewport-fit=cover` to the viewport tag, then pad fixed headers, tab bars, toasts and sheets with `env(safe-area-inset-*)`. A bottom bar under the home indicator is `defaults-safe-areas`.

## Controls are not selectable

Buttons, tabs, chips and drag handles set `user-select: none`, so a long press does not select their label. Content text stays selectable. A button label highlighted by a long press is `defaults-controls-not-selectable`.

## Hotkeys stay out of inputs

Hotkeys do not fire while an input, a textarea or an editable element has focus. That is `defaults-keys-ignore-inputs`. See [recipes.md](recipes.md#hotkey-guard).

## Enter submits

Enter submits a form with one field, or from the form's last field. In a textarea, Enter adds a line and ⌘ or Ctrl with Enter submits. A search field that needs a click to submit is `defaults-enter-submits`.

## Fields accept what people paste

A field takes input the way people type or paste it, such as spaces in a card number or brackets in a phone number. Strip the formatting in code and show the value cleanly. A phone field that rejects `+1 (555) 010-2030` is `defaults-accept-messy-input`. Never block paste, and trim the trailing space some keyboards add.

## Fields ask for the right keyboard

Every field sets `type`, `inputmode` and `autocomplete`, so the keyboard and autofill fit it. An email field typed as plain text is `defaults-input-types`.

On mobile, inputs render at 16px or larger, or iOS zooms the page on focus. A 14px input on a phone is `defaults-input-16px`.

## Labels share the hit area

Every control has a label, and clicking the label works the control. A checkbox whose text does nothing when clicked is `defaults-label-hit-area`.

## Forms validate on submit

Submit stays enabled until the request starts. On submit, show each error beside its field and focus the first one. A submit button disabled until the form is valid is `defaults-validate-on-submit`.

## Busy buttons keep their label

While its request runs, a button keeps its label, shows an indicator and disables itself. A label replaced by a spinner that shrinks the button is `defaults-loading-button`.

## Destructive actions can be undone

Offer undo after a destructive action. Where undo is impossible, confirm in place with a menu or a popover. A delete with neither is `defaults-undo-destructive`.

## Numbers line up

Prices, counts, timers and table columns use `font-variant-numeric: tabular-nums`. A counter whose width jitters as it ticks is `defaults-tabular-numbers`.

## Headings balance, paragraphs wrap pretty

Headings take `text-wrap: balance` and body paragraphs take `text-wrap: pretty`. A heading with one word alone on its last line is `defaults-balanced-wrap`.

## Text renders crisp

Set `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` once, on the root. Smoothing missing, or set component by component, is `defaults-antialiased-root`.

## Inline code sits smaller

Monospace inside running text drops to `0.9em`. Inline code at full size, towering over its sentence, is `defaults-inline-mono`.

## Truncation has a way back

Truncated text the user needs opens in full through a tooltip, an expand control or a detail view. A cut-off file name with no way to read it is `defaults-truncate-with-way-back`. File names and paths truncate in the middle, where they differ. Numbers, amounts and dates never truncate.

## Layouts survive real data

Test every field with the longest realistic value. Text columns take `min-width: 0`, fixed boxes such as avatars take `flex-shrink: 0` and emails and URLs take `overflow-wrap: anywhere`. A long email pushing the row menu off screen is `defaults-survives-long-content`.

A missing optional field drops its line rather than showing a placeholder. A lone dash where the role should be is `defaults-omit-empty-fields`.

## Numbers, dates and plurals follow the locale

Format them through `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.PluralRules`. `1 members` or a raw `1284` is `defaults-locale-format`.

## Updates announce themselves

Toasts, result counts and inline validation sit in a polite live region, `role="status"`, rendered empty before its text changes. A toast that screen readers never hear is `defaults-announce-updates`.

## App chrome fades

Page switches, panels and loading states fade with `opacity` and do not slide or scale. That is `defaults-opacity-for-chrome`. Animate only the axis that changes. Animating width when only height changes is `defaults-changing-axis-only`.

## Entrances do not replay

Switching pages does not replay entrances. Set `initial={false}` on the route-level `AnimatePresence`, and on any that wraps a state swap. That is `defaults-no-replay-on-entry`. A cached view renders at once, with no fade or skeleton flash. That is `defaults-no-flash-on-return`. See [recipes.md](recipes.md#route-transitions).

## Waits show feedback at once

An action responds within 400ms or shows feedback straight away, as an optimistic value, a skeleton or a progress bar. A loading branch that returns `null` is `defaults-instant-feedback`.

Hold a spinner or skeleton back 150–300ms, then keep it up at least 300–500ms once shown. A skeleton that flashes for one frame is `defaults-no-flicker-loading`. A skeleton matches the layout it stands in for. See [recipes.md](recipes.md#loading-delay).

## Name the properties you animate

A transition lists the properties it animates, usually `opacity` and `transform`. `transition: all` is `defaults-name-the-properties`.

## Toggled state transitions, keyframes run once

Interactive state changes use transitions or springs, which retarget when the user reverses. A keyframe animation on a toggled class is `defaults-transitions-for-state`. Keep keyframes for sequences that run once.

## Motion starts where it comes from

A dropdown or popover scales from its trigger, with `transform-origin` set to that edge. A menu growing from its own centre is `defaults-origin-from-trigger`. Modals stay centred, because no trigger anchors them.

## Nothing grows from zero

An entrance starts from `scale(0.95)` or higher, together with `opacity: 0`. `scale(0)` is `defaults-no-scale-from-zero`.

## Gestures use springs

Drag, swipe and any motion the user can reverse mid-flight use a spring. On release, pass the pointer velocity into it. A drag release on a fixed `ease-out` is `defaults-spring-for-gestures`. See [recipes.md](recipes.md#drag-release).

## Flicks dismiss, edges resist

A swipe dismisses on distance or on speed, so past about `0.11` px per millisecond a short flick is enough. A sheet that ignores a fast flick is `defaults-flick-dismisses`.

Dragging past a boundary meets growing friction rather than a wall. A drawer that stops dead at the top is `defaults-friction-at-edges`. Capture the pointer once a drag starts and ignore extra touches. See [recipes.md](recipes.md#flick-to-dismiss).

## Every gesture has a button

Each drag, swipe or pinch also works with a click and with the keyboard. A list that reorders only by dragging is `defaults-gesture-alternative`.

## Easing fits the change

System changes such as a toast use easing, not a spring. Entrances and exits ease out, and a change of view eases in and out. Linear is for progress bars and clocks only. A modal entering on `ease-in` is `defaults-ease-by-direction`.

The built-in `ease-out` keyword is too weak. Use `cubic-bezier(0.23, 1, 0.32, 1)` to enter and exit, and `cubic-bezier(0.77, 0, 0.175, 1)` for movement on screen. A bare `ease-out` is `defaults-strong-ease-out`.

## Closes are faster than opens

A close runs shorter than its open. Nothing delays a close or a hover-out. A modal that takes as long to leave as it took to arrive is `defaults-close-faster`.

## Motion stays under 300ms

Hover colour changes are instant, with no transition. A button fading its background over 200ms on hover is `defaults-instant-hover-color`.

Press and hover movement take 120–180ms. Small state changes take 180–260ms. Nothing the user starts runs longer than 300ms, except a full panel or drawer at up to 400ms. A 500ms dropdown is `defaults-under-300ms`.

Under `mode="wait"` the exit and the entrance play in series, so halve each. When motion feels slow, shorten it before changing the curve. Samples are in [recipes.md](recipes.md#curves-and-durations).

## Frequent actions do not animate

Typing, keyboard shortcuts, keyboard navigation and fast toggles do not animate. A command palette opened from the keyboard appears at once. A context menu appears at once and may fade out. A scale pulse on every keystroke is `defaults-no-motion-on-repeat`.

## Hover styles need a hover pointer

Wrap hover-only styles in `@media (hover: hover) and (pointer: fine)`, or a tap leaves them stuck on touch screens. A card that stays lifted after a tap is `defaults-hover-capable-only`.

## Tooltips wait once

The first tooltip in a group opens after a delay. Its neighbours open at once and without animation while one is showing, and every tooltip closes instantly. A toolbar where each tooltip waits the full delay is `defaults-tooltip-delay`.

## Icons cross-fade when they swap

An icon that swaps in place, such as copy to copied, cross-fades. Scale runs `0.25` to `1`, opacity `0` to `1` and blur `4px` to `0`. A hard swap is `defaults-icon-crossfade`. See [recipes.md](recipes.md#icon-swap).

## Blur bridges a cross-fade

When a cross-fade between two states still reads as two objects, add `filter: blur(2px)` while it runs. Keep blur under 20px, which gets expensive in Safari. Two labels visibly overlapping mid-swap is `defaults-blur-the-crossfade`.

## Presses scale lightly

A pressed control scales to `0.98`, and squash or stretch stays within `0.95–1.05`. `whileTap={{ scale: 0.8 }}` is `defaults-press-scale`. List items stagger by less than 50ms each. `staggerChildren: 0.15` on a list is `defaults-short-stagger`. A staged entrance that plays once, such as a title, text and actions, staggers by 100ms. Routine interactions never stagger, and a stagger never blocks input.

## Exits need a presence boundary

A conditional element with an `exit` sits inside `AnimatePresence`, keyed by a stable id, and exits to its `initial` values. An exit that never plays because the wrapper is missing is `defaults-exit-in-presence`. See [recipes.md](recipes.md#exits).

A dialog from a component library stays mounted and toggles its `open` prop. A dialog rendered behind `open &&`, which loses its close animation, is `defaults-dialogs-stay-mounted`.

## Size follows content from a second element

To animate a container's width or height, measure an inner element with a `ResizeObserver` and animate the outer one. Measuring and animating the same node is `defaults-measure-inner`. See [recipes.md](recipes.md#container-bounds).

While a panel collapses, its content keeps its open width, so nothing reflows mid-animation. Sidebar content set to `w-full` as the sidebar closes is `defaults-hold-content-size`.

## Reduced motion removes movement

When `prefers-reduced-motion: reduce` matches, slides, scales and blurs become an opacity cross-fade. A sliding drawer that ignores the setting is `defaults-reduced-motion`.

## Sound confirms, never alone

Sound fits confirmations such as payment, upload or submit. It also fits errors that must not be missed. Every cue has a visible twin, such as a status change. A success chime with nothing changing on screen is `defaults-sound-has-a-twin`.

Typing, hover, scroll and keyboard navigation make no sound. A click on every keystroke is `defaults-no-sound-on-repeat`.

The user can turn sound off, and volume starts at `0.3`. A hardcoded `audio.volume = 1` with no off switch is `defaults-sound-optional`. Playback and a synthesized click are in [recipes.md](recipes.md#sound).

## One dialog at a time

Never open a dialog on top of a dialog. Use a menu, a popover or a new page. That is `defaults-no-stacked-dialogs`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `defaults-fade-not-cut` | `overflow: auto` with a hard cut | A `mask-image` fade at both ends |
| `defaults-no-clipped-shadow` | A card shadow cut by `overflow: hidden` | `padding: 8px` on the scroller |
| `defaults-scroll-not-wrap` | A code line wrapping to two lines | `white-space: nowrap` and `overflow-x: auto` |
| `defaults-contain-overscroll` | A drawer list that scrolls the page at its end | `overscroll-behavior: contain` on the drawer |
| `defaults-sticky-border` | A sticky header with no edge | `border-bottom: 1px solid var(--gray-a4)` |
| `defaults-clear-sticky-chrome` | A focused field under a 56px sticky header | `scroll-padding-block-start: 56px` |
| `defaults-ring-not-border` | `border: 1px solid #e5e5e5` plus `box-shadow` on a popover | `0 0 0 1px var(--gray-a4)` first in the shadow, over a transparent border |
| `defaults-layered-shadows` | `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2)` | Three downward layers, blur growing and opacity falling |
| `defaults-fade-the-shadow` | `transition: box-shadow 200ms` | `opacity` on a `::after` that holds the raised shadow |
| `defaults-image-outline` | A photo with no edge on a white card | `outline: 1px solid rgba(0, 0, 0, 0.1)` at `outline-offset: -1px` |
| `defaults-no-nested-cards` | A card holding a heading and another card | The heading above one card |
| `defaults-rounded-not-pill` | `border-radius: 9999px` on a button | `border-radius: var(--radius-2)` |
| `defaults-no-decoration` | A gradient glow behind a card | A flat background |
| `defaults-color-scheme` | A dark theme with light scrollbars | `color-scheme: dark` on the root |
| `defaults-quiet-theme-switch` | Every colour transition firing on a theme switch | Transitions off for one frame |
| `defaults-focus-keyboard-only` | `.button:focus { box-shadow: 0 0 0 2px var(--accent) }` | `.button:focus-visible { outline: 2px solid var(--accent) }` |
| `defaults-trap-and-return-focus` | Tab reaching the page behind a dialog | Focus kept inside, then returned to the trigger |
| `defaults-hit-area` | A 16px icon button with a 16px hit box | `inset: -12px` on its `::before`, a 40px target |
| `defaults-name-icon-buttons` | `<button><TrashIcon /></button>` | `<button aria-label="Delete">` |
| `defaults-not-color-alone` | A red dot as the only error cue | The dot with an icon or the word `Failed` |
| `defaults-links-are-links` | `<div onClick={() => router.push("/settings")}>` | `<a href="/settings">` |
| `defaults-state-in-url` | A filter held only in `useState` | `?status=open` in the URL |
| `defaults-allow-zoom` | `maximum-scale=1, user-scalable=no` | `width=device-width, initial-scale=1` |
| `defaults-no-tap-highlight` | The browser's grey flash on every tap | `-webkit-tap-highlight-color: transparent` and an `:active` style |
| `defaults-fast-tap` | A button that responds 300ms after the tap | `touch-action: manipulation` |
| `defaults-dynamic-viewport` | `height: 100vh` on the app shell | `height: 100dvh` |
| `defaults-safe-areas` | A tab bar under the home indicator | `padding-bottom: env(safe-area-inset-bottom)` with `viewport-fit=cover` |
| `defaults-controls-not-selectable` | A long press selecting a tab's label | `user-select: none` on the tab |
| `defaults-keys-ignore-inputs` | `J` moves the selection while typing in search | Hotkeys skip `input`, `textarea` and `[contenteditable]` |
| `defaults-enter-submits` | A search field with no `form` around it | A `form` whose `onSubmit` runs the search |
| `defaults-accept-messy-input` | A phone field that rejects `+1 (555) 010-2030` | Accepted, stored as `+15550102030` and shown formatted |
| `defaults-input-types` | `<input type="text">` for an email | `type="email" autocomplete="email"` |
| `defaults-input-16px` | `font-size: 14px` on a mobile input | `font-size: 16px` |
| `defaults-label-hit-area` | A checkbox beside a bare `span` | The checkbox and its text inside one `label` |
| `defaults-validate-on-submit` | `disabled={!isValid}` on submit | Enabled, with errors shown and the first focused on submit |
| `defaults-loading-button` | The label swapped for a spinner | Label kept, spinner beside it, button disabled |
| `defaults-undo-destructive` | A delete that happens at once with no way back | A toast with `Undo` |
| `defaults-tabular-numbers` | A ticking timer that shifts width | `font-variant-numeric: tabular-nums` |
| `defaults-balanced-wrap` | One word alone on a heading's last line | `h1 { text-wrap: balance }` and `p { text-wrap: pretty }` |
| `defaults-antialiased-root` | Default subpixel smoothing on light text | `-webkit-font-smoothing: antialiased` on the root |
| `defaults-inline-mono` | `<code>` at the size of its sentence | `font-size: 0.9em` |
| `defaults-truncate-with-way-back` | A truncated file name and nothing else | A tooltip with the full name |
| `defaults-survives-long-content` | A long email pushing the row menu off screen | `min-width: 0` on the text, `flex-shrink: 0` on the menu |
| `defaults-omit-empty-fields` | A dash where a missing role would be | The role line left out |
| `defaults-locale-format` | `{count} members` with `count` at `1` | `Intl.PluralRules` choosing `member` or `members` |
| `defaults-announce-updates` | A toast mounted with its text and no role | An empty `role="status"` region whose text updates |
| `defaults-opacity-for-chrome` | `initial={{ x: 20, scale: 0.95 }}` on a page | `initial={{ opacity: 0 }}` |
| `defaults-changing-axis-only` | `animate={{ width, height }}` when only height changes | `animate={{ height }}` |
| `defaults-no-replay-on-entry` | `<AnimatePresence>` around routes, entrances replay | `<AnimatePresence initial={false}>` |
| `defaults-no-flash-on-return` | A skeleton flash on a cached view | The cached view rendered at once |
| `defaults-instant-feedback` | `if (isLoading) return null` | `if (isLoading) return <Skeleton />` |
| `defaults-no-flicker-loading` | A spinner shown for a 40ms response | Shown after 200ms, held for at least 400ms |
| `defaults-name-the-properties` | `transition: all 200ms` | `transition: opacity 200ms, transform 200ms` |
| `defaults-transitions-for-state` | `.open { animation: slide-in 200ms }` | `transition: transform 200ms` on the toggled property |
| `defaults-origin-from-trigger` | A dropdown scaling from `center` | `transform-origin: top left` under a left-aligned trigger |
| `defaults-no-scale-from-zero` | `initial={{ scale: 0 }}` on a popover | `initial={{ scale: 0.95, opacity: 0 }}` |
| `defaults-spring-for-gestures` | A drag release on `duration: 0.3, ease: "easeOut"` | `type: "spring"` with `velocity: info.velocity.x` |
| `defaults-flick-dismisses` | Dismiss only past a fixed distance | Dismiss past the distance or above `0.11` px per ms |
| `defaults-friction-at-edges` | A drawer that stops dead at its top | Movement damped the further it is dragged |
| `defaults-gesture-alternative` | Rows that reorder only by drag | `Move Up` and `Move Down` in the row menu |
| `defaults-ease-by-direction` | A modal entering on `ease-in` | Ease-out in and out, the exit shorter |
| `defaults-strong-ease-out` | `transition: transform 200ms ease-out` | `transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1)` |
| `defaults-close-faster` | A modal at `200ms` in and `200ms` out | `200ms` in, `150ms` out |
| `defaults-instant-hover-color` | `transition: background-color 200ms` on a button | The hover colour applied at once |
| `defaults-under-300ms` | `transition={{ duration: 0.5 }}` on a dropdown | `duration: 0.2` |
| `defaults-no-motion-on-repeat` | `animate={{ scale: [1, 1.02, 1] }}` on each keystroke | No motion on the input |
| `defaults-hover-capable-only` | `.card:hover { transform: translateY(-2px) }` | The same rule inside `@media (hover: hover) and (pointer: fine)` |
| `defaults-tooltip-delay` | Each toolbar tooltip waiting the full delay | The first waits, its neighbours open at once |
| `defaults-icon-crossfade` | `{copied ? <CheckIcon /> : <CopyIcon />}` | Both icons cross-fading with scale and blur |
| `defaults-blur-the-crossfade` | Two button labels overlapping mid-swap | `filter: blur(2px)` while the swap runs |
| `defaults-press-scale` | `whileTap={{ scale: 0.8 }}` | `whileTap={{ scale: 0.98 }}` |
| `defaults-short-stagger` | `staggerChildren: 0.15` | `staggerChildren: 0.03` |
| `defaults-exit-in-presence` | `{open && <motion.div exit={{ opacity: 0 }} />}` | The same element inside `<AnimatePresence>` |
| `defaults-dialogs-stay-mounted` | `{open && <Dialog.Root open>}` | `<Dialog.Root open={open} onOpenChange={setOpen}>` |
| `defaults-measure-inner` | `ref` and `animate={{ height: bounds.height }}` on one node | The outer node animates, the inner node holds the `ref` |
| `defaults-hold-content-size` | `w-full` content inside a collapsing sidebar | `w-64` content that keeps its width |
| `defaults-reduced-motion` | A drawer that slides under reduced motion | An opacity cross-fade |
| `defaults-sound-has-a-twin` | `playSound("success")` with no status change | `setStatus("success")` beside the sound |
| `defaults-no-sound-on-repeat` | `playSound("keystroke")` inside `onChange` | No sound on typing |
| `defaults-sound-optional` | `audio.volume = 1` and no off switch | A sound setting, volume `0.3` by default |
| `defaults-no-stacked-dialogs` | A confirm dialog opened from a settings dialog | A menu or popover inside the dialog |

## Reporting

**Severity.** `HIGH` breaks use or access. That is a clipped shadow, a hard scroll cut, hotkeys that fire while typing, a stacked dialog, a target under 24px or a silent wait. It is also an exit that never plays, a container that measures itself, a field that rejects pasted formatting or sound with no visual twin or off switch. It is also an unnamed icon button, status in colour alone, focus that escapes a dialog, blocked zoom, a route with no link or a gesture with no button. It is also a submit disabled until valid, a truncated value with no way back or a destructive action with no undo or confirmation. It is also content pushed off screen by a long value, a `100vh` shell hiding its controls or a bar under the home indicator.

`MEDIUM` is a pill button, a click focus ring, a sliding page, a replayed entrance, a gesture on a fixed curve or motion over 300ms. It is also motion on typing, a wrong curve, `transition: all`, keyframes on toggled state, ignored reduced motion or a hover stuck on touch. It is also proportional figures in data, sound on a frequent action, scroll leaking from an overlay, state lost on refresh or a flickering skeleton. It is also a field with the wrong keyboard, a mobile input under 16px, a dead label, Enter that does not submit or a busy button with no indicator. It is also an unannounced update, a conditionally rendered dialog, content reflowing as it collapses, a field hidden under sticky chrome or a card inside a card. It is also a tap flash or tap delay, a selectable control label, a `scale(0)` entrance, a sheet that ignores a flick or an unformatted number or plural.

`LOW` is an opaque border beside a shadow, a faded hover colour, a decorative glow, a single harsh shadow or a transitioned `box-shadow`. It is also unbalanced headings, a heavy press scale or a long stagger. It is also a missing image outline, a borderless sticky header, a light scrollbar on a dark page, a smeared theme switch or missing root font smoothing. It is also full-size inline code, motion from the wrong origin, a close as slow as its open, a slow tooltip or a hard icon swap. It is also a bare `ease-out`, an unblurred cross-fade, a placeholder dash for an empty field or a drawer with no edge friction.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open the screen when a check depends on layout, and mark every check you could not run as `Not verified`.
