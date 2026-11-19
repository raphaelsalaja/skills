---
name: defaults
description: Applies house defaults for scroll edges, surfaces, type, tables, sound, focus, forms, loading, hotkeys and overlays.
---

# Defaults

This skill holds the interface defaults that apply on every screen. It covers surfaces, type, tables, sound, focus, forms, loading and overlays.

## Tokens first, then these values

Use the project's token wherever one exists for a value below. Where none exists, the values here are exact. A hard scroll cut or a clipped shadow is a finding in any style.

Words and punctuation belong to `copy`. Building any of these with the project's primitive belongs to `reuse`. Whether a sound or an animation should exist at all belongs to `restraint`. How things move belongs to `motion`, and colour and contrast belong to `color`. Concentric radii, optical nudges and icon alignment belong to `alignment`. Empty, failed and stale screens belong to `states`.

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

## Hover styles need a hover pointer

Wrap hover-only styles in `@media (hover: hover) and (pointer: fine)`, or a tap leaves them stuck on touch screens. A card that stays lifted after a tap is `defaults-hover-capable-only`.

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

## Columns align by type

Numbers, amounts and dates align right, and text aligns left. Each header takes its own column's alignment. Only single-glyph columns, such as a checkbox or a status dot, centre. A centred price column is `defaults-align-columns`.

## Tables rule rows, not cells

Rows take a 1px translucent divider and columns take none. A vertical rule goes only between two numeric columns that could be confused. A border on every cell is `defaults-row-dividers`.

## Long tables keep their labels

A table taller than the screen keeps its header with `position: sticky` and an opaque background. When it scrolls sideways, the first column sticks as well. A header that scrolls away over 200 rows is `defaults-sticky-table-header`.

The whole header cell is the sort button. The sorted column shows its direction and sets `aria-sort`. A sort dropdown above the table is `defaults-sortable-header`.

## Row controls hold their column

Checkbox and row action columns keep their width at all times. Hover changes only their opacity. Columns shifting as a checkbox appears on row hover is `defaults-reserved-row-controls`.

## Headings balance, paragraphs wrap pretty

Headings take `text-wrap: balance` and body paragraphs take `text-wrap: pretty`. A heading with one word alone on its last line is `defaults-balanced-wrap`.

## Paragraphs keep a readable measure

Running text stops at `max-width: 65ch`. Buttons, navigation and table cells are exempt. A paragraph stretching across a 1440px window is `defaults-line-length`.

## Leading tightens as type grows

Set `line-height` unitless: 1.5 for body text and 1.1–1.3 for headings. Anything that wraps to three lines or more takes at least 1.4. `leading-none` on a three-line description is `defaults-leading-by-size`.

## Tracking follows size

Type above 32px tightens to about `-0.02em`. Uppercase labels open to about `0.05em` and come from `text-transform`, never typed capitals. A 48px heading at the font's default tracking is `defaults-tracking-by-size`.

## Every weight is a real face

Load each weight and italic the design uses. Bold or italic drawn by the browser from the regular face is `defaults-real-faces`.

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

## Waits show feedback at once

An action responds within 400ms or shows feedback straight away, as an optimistic value, a skeleton or a progress bar. A loading branch that returns `null` is `defaults-instant-feedback`.

Hold a spinner or skeleton back 150–300ms, then keep it up at least 300–500ms once shown. A skeleton that flashes for one frame is `defaults-no-flicker-loading`. A skeleton matches the layout it stands in for. See [recipes.md](recipes.md#loading-delay).

## Sound confirms, never alone

Sound fits confirmations such as payment, upload or submit. It also fits errors that must not be missed. Every cue has a visible twin, such as a status change. A success chime with nothing changing on screen is `defaults-sound-has-a-twin`.

Typing, hover, scroll and keyboard navigation make no sound. A click on every keystroke is `defaults-no-sound-on-repeat`.

The user can turn sound off, and volume starts at `0.3`. A hardcoded `audio.volume = 1` with no off switch is `defaults-sound-optional`. Playback and a synthesized click are in [recipes.md](recipes.md#sound).

## One dialog at a time

Never open a dialog on top of a dialog. Use a menu, a popover or a new page. That is `defaults-no-stacked-dialogs`.

## Locking scroll never moves the page

Set `scrollbar-gutter: stable` on the root, so locking scroll behind a modal does not shift the page sideways. A centred layout jumping 15px as a dialog opens is `defaults-stable-gutter`.

## Anchored overlays stay on screen

A menu or popover that does not fit flips to the other side of its trigger. Then it shifts along the edge, then caps its height and scrolls inside. It keeps 8px from the viewport edge. A menu cut off at the bottom of the window is `defaults-flip-then-shift`.

Overlays render in a portal at the document root, so no ancestor's `overflow` or `transform` can clip them. A dialog clipped by a card with a `transform` is `defaults-portal-overlays`.

## Tooltips hold a label

A tooltip holds a short label and nothing to click. Anything with a link or a button is a popover, opened by a click. A tooltip holding a link is `defaults-tooltip-is-a-label`.

Content shown on hover stays open while the pointer crosses onto it, and closes with Escape. A preview card that vanishes in the gap to its trigger is `defaults-hover-content-stays`.

## Phones get sheets

Below 600px a dialog holding content or a form opens as a bottom sheet. Alerts stay centred at every width. A centred form dialog at 375 is `defaults-sheet-on-phones`.

## Outside clicks never lose work

A click outside closes an overlay only when nothing would be lost. A dialog with unsaved input, or a destructive confirm, closes only from its own buttons and Escape. A form dialog that drops typed text on an outside click is `defaults-safe-outside-press`.

## Only blocking overlays dim the page

A dialog or sheet dims the page with black at 25–50%. Menus, popovers and tooltips dim nothing. A dimmed page behind a dropdown is `defaults-backdrop-only-modal`.

## Toasts queue

At most three toasts show at once, and the rest queue. A toast stays 4–6 seconds and pauses while hovered or focused. Six toasts stacked at once is `defaults-toast-budget`.

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
| `defaults-hover-capable-only` | `.card:hover { transform: translateY(-2px) }` | The same rule inside `@media (hover: hover) and (pointer: fine)` |
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
| `defaults-align-columns` | A centred price column | `text-align: right` on the cells and the header |
| `defaults-row-dividers` | A border on every cell | `border-bottom: 1px solid var(--gray-a3)` on rows only |
| `defaults-sticky-table-header` | A header that scrolls away over 200 rows | `position: sticky; top: 0` with `background: var(--surface)` |
| `defaults-sortable-header` | A sort dropdown above the table | The header cell as a button, with `aria-sort="ascending"` |
| `defaults-reserved-row-controls` | A checkbox column that appears on row hover | The column always there, its opacity rising on hover |
| `defaults-balanced-wrap` | One word alone on a heading's last line | `h1 { text-wrap: balance }` and `p { text-wrap: pretty }` |
| `defaults-line-length` | A paragraph across a 1440px window | `max-width: 65ch` |
| `defaults-leading-by-size` | `line-height: 1` on a three-line description | `line-height: 1.4` |
| `defaults-tracking-by-size` | A 48px heading at the font's default tracking | `letter-spacing: -0.02em` |
| `defaults-real-faces` | `font-weight: 600` with only the 400 face loaded | The 600 face in `@font-face` |
| `defaults-antialiased-root` | Default subpixel smoothing on light text | `-webkit-font-smoothing: antialiased` on the root |
| `defaults-inline-mono` | `<code>` at the size of its sentence | `font-size: 0.9em` |
| `defaults-truncate-with-way-back` | A truncated file name and nothing else | A tooltip with the full name |
| `defaults-survives-long-content` | A long email pushing the row menu off screen | `min-width: 0` on the text, `flex-shrink: 0` on the menu |
| `defaults-omit-empty-fields` | A dash where a missing role would be | The role line left out |
| `defaults-locale-format` | `{count} members` with `count` at `1` | `Intl.PluralRules` choosing `member` or `members` |
| `defaults-announce-updates` | A toast mounted with its text and no role | An empty `role="status"` region whose text updates |
| `defaults-instant-feedback` | `if (isLoading) return null` | `if (isLoading) return <Skeleton />` |
| `defaults-no-flicker-loading` | A spinner shown for a 40ms response | Shown after 200ms, held for at least 400ms |
| `defaults-sound-has-a-twin` | `playSound("success")` with no status change | `setStatus("success")` beside the sound |
| `defaults-no-sound-on-repeat` | `playSound("keystroke")` inside `onChange` | No sound on typing |
| `defaults-sound-optional` | `audio.volume = 1` and no off switch | A sound setting, volume `0.3` by default |
| `defaults-no-stacked-dialogs` | A confirm dialog opened from a settings dialog | A menu or popover inside the dialog |
| `defaults-stable-gutter` | `overflow: hidden` on `body` shifting the page 15px | `scrollbar-gutter: stable` on `html` |
| `defaults-flip-then-shift` | A menu cut off at the bottom of the window | Flipped above its trigger, then shifted, then capped and scrolling |
| `defaults-portal-overlays` | A dialog clipped by a card with a `transform` | The dialog in a portal at the document root |
| `defaults-tooltip-is-a-label` | A tooltip holding a `Learn More` link | A popover opened by a click |
| `defaults-hover-content-stays` | A preview card that closes in the gap to its trigger | The card open while the pointer crosses onto it |
| `defaults-sheet-on-phones` | A centred form dialog at 375 | A bottom sheet below 600px |
| `defaults-safe-outside-press` | A form dialog that closes on an outside click and drops the text | Outside clicks ignored while the form has changes |
| `defaults-backdrop-only-modal` | A dimmed page behind a dropdown | No backdrop on menus and popovers |
| `defaults-toast-budget` | Six toasts stacked at once | Three visible, the rest queued |

## Reporting

**Severity.** `HIGH` breaks use or access. That is a clipped shadow, a hard scroll cut, hotkeys that fire while typing, a stacked dialog, a target under 24px or a silent wait. It is also a field that rejects pasted formatting, or sound with no visual twin or off switch. It is also an unnamed icon button, status in colour alone, focus that escapes a dialog, blocked zoom or a route with no link. It is also a submit disabled until valid, a truncated value with no way back or a destructive action with no undo or confirmation. It is also content pushed off screen by a long value, a `100vh` shell hiding its controls or a bar under the home indicator. It is also an overlay cut off by the window or by an ancestor, a tooltip holding a link or an outside click that drops typed work.

`MEDIUM` is a pill button, a click focus ring or a hover stuck on touch. It is also proportional figures in data, sound on a frequent action, scroll leaking from an overlay, state lost on refresh or a flickering skeleton. It is also a field with the wrong keyboard, a mobile input under 16px, a dead label, Enter that does not submit or a busy button with no indicator. It is also an unannounced update, a field hidden under sticky chrome or a card inside a card. It is also a tap flash or tap delay, a selectable control label or an unformatted number or plural. It is also a centred number column, a long table with no sticky header, a sort with no `aria-sort` or row controls that shift columns. It is also a paragraph past `65ch`, wrapped text under 1.4 leading or a browser-drawn bold. It is also a page that shifts on scroll lock, hover content that vanishes or a centred form dialog on a phone. It is also a backdrop behind a menu or more than three toasts.

`LOW` is an opaque border beside a shadow, a decorative glow, a single harsh shadow or a transitioned `box-shadow`. It is also unbalanced headings, a missing image outline, a borderless sticky header, a light scrollbar on a dark page, a smeared theme switch or missing root font smoothing. It is also full-size inline code or a placeholder dash for an empty field. It is also a border on every table cell or display type at default tracking.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open the screen when a check depends on layout, and mark every check you could not run as `Not verified`.
