---
name: defaults
description: Applies house defaults for scroll edges, surfaces, theme, focus, names, page structure, links, mobile, type, tables, data, loading and sound.
---

# Defaults

This skill holds the interface defaults that apply on every screen. It covers scroll, surfaces, theme, focus, names, page structure, links, mobile, type, tables, data, loading and sound.

## Tokens first, then these values

Use the project's token wherever one exists for a value below. Where none exists, the values here are exact. A hard scroll cut or a clipped shadow is a finding in any style.

Fields, labels, validation and submit belong to `forms`. Dialogs, menus, popovers, tooltips, sheets and toasts belong to `overlays`. Words and punctuation belong to `copy`. Building any of these with the project's primitive belongs to `reuse`. Whether a sound or an animation should exist at all belongs to `restraint`. How things move belongs to `motion`, and colour and contrast belong to `color`. Concentric radii, optical nudges and icon alignment belong to `alignment`. Empty, failed and stale screens belong to `states`.

## Scroll edges fade

A scroll container fades at its ends with a `mask-image` gradient. A hard cut at the overflow edge is `defaults-fade-not-cut`. The recipe is in [recipes.md](recipes.md#scroll-fade).

## Shadows are never cut off

Give a scroller enough padding that its children's shadows fit inside it. A shadow clipped by `overflow: hidden` is `defaults-no-clipped-shadow`. See [recipes.md](recipes.md#room-for-shadows).

## Code and tables scroll, never wrap

Code blocks and data tables scroll sideways with a hidden scrollbar. A wrapping code line is `defaults-scroll-not-wrap`. See [recipes.md](recipes.md#sideways-scroll).

A hidden scrollbar still needs a keyboard way in, and reaching a scroller that holds nothing focusable belongs to `keyboard`.

## Scrollbars never shift the layout

A scroller whose content can grow past its height sets `scrollbar-gutter: stable`, and so does the root of a site whose pages vary in length. A centred layout that jumps 15px between a short page and a long one is `defaults-scrollbar-gutter`.

## Scroll stays where it starts

Inner scrollers such as drawers, menus, side panels and chat logs set `overscroll-behavior: contain`. A modal list whose end scrolls the page behind it is `defaults-contain-overscroll`.

An app sets `overscroll-behavior: none` on `html, body`, so pull-to-refresh and the bounce stay out of its gestures. Never block scrolling with a `touchmove` listener that calls `preventDefault()`. Pull-to-refresh firing while a sheet is dragged is `defaults-no-page-overscroll`.

## Sticky chrome keeps its edge

A sticky header or footer takes a 1px border against the content scrolling under it. A borderless sticky header is `defaults-sticky-border`.

Set `scroll-padding-block-start` to the sticky header's height and `scroll-padding-block-end` to the bottom bar's, so anchors and focused fields land clear of both. Toasts, chat widgets and cookie banners never cover the focused element. A focused field hidden under sticky chrome is `defaults-clear-sticky-chrome`.

## Layers stack on a named scale

Every `z-index` comes from a small named scale set once as tokens, such as base, dropdown, sticky, overlay and toast. `z-index: 9999`, or any value picked to beat the last one, is `defaults-z-index-scale`. Surfaces on the top layer need no `z-index`, as `overlays-top-layer` sets out.

## Floating surfaces take a ring, not a border

A popover, menu or card that floats pairs its shadow with a translucent 1px ring inside the shadow stack. An opaque `border` beside a shadow is `defaults-ring-not-border`. Keep `border: 1px solid transparent` under the ring, so forced-colours mode still draws an edge.

## Shadows are layered and fall one way

Use the project's elevation token. Without one, layer three shadows with blur growing and opacity falling, all offset downward. One `0 4px 16px rgba(0, 0, 0, 0.2)` is `defaults-layered-shadows`. See [recipes.md](recipes.md#layered-shadow).

Where `motion` allows a surface to lift on hover, fade in a pseudo-element that holds the raised shadow. A transition on `box-shadow` is `defaults-fade-the-shadow`. See [recipes.md](recipes.md#raised-on-hover).

## Content images take a faint outline

Photos and screenshots take a 1px outline inset by 1px, black at 10% in light mode and white at 10% in dark. A photo edge melting into its card is `defaults-image-outline`. Skip logos and transparent artwork. See [recipes.md](recipes.md#image-outline).

## Images fill their box at any ratio

An image in a fixed box takes `object-fit: cover`, so a 4000×200 panorama or a 200×4000 strip never stretches. A stretched avatar is `defaults-cover-any-ratio`. Sizing media before it loads belongs to `vitals`.

## Cards never nest

A card never sits inside another card. Put the heading outside and let one surface hold the content. A card inside a card is `defaults-no-nested-cards`.

## Rounded, not pill

Buttons and chips use the radius token. `border-radius: 9999px` is `defaults-rounded-not-pill`.

## No decoration

Drop decorative gradients, glows, blur and depth effects. A glow behind a card is `defaults-no-decoration`.

## Translucency gives way on request

Under `prefers-reduced-transparency: reduce`, translucent and blurred surfaces turn opaque. Under `prefers-contrast: more` they turn near-solid and take a border. A `backdrop-filter: blur(20px)` over `rgba(255, 255, 255, 0.6)` in every mode is `defaults-reduced-transparency`.

## The theme follows the system

A first visit follows `prefers-color-scheme`. The theme switch offers System, Light and Dark, with System as the default. A switch with only Light and Dark is `defaults-theme-follows-system`.

The root sets `color-scheme: light dark` and the head carries `<meta name="color-scheme" content="light dark">`, so first paint, scrollbars and native controls follow the theme. A white flash or a light scrollbar on a dark page is `defaults-color-scheme`. Set one `theme-color` tag per colour scheme, matching the top of the page. Safari 26 ignores the tag and tints its bars from a fixed or sticky header touching the edge, so that header takes an opaque `background-color`.

Dark styles key off one source the switch controls. Write colour tokens with `light-dark()`, which reads `color-scheme`, and let the switch set `color-scheme` on the root. A `@media (prefers-color-scheme: dark)` block that stays dark after the user picks Light is `defaults-theme-one-source`. See [recipes.md](recipes.md#theme-switch).

A theme switch turns transitions off for one frame. When it toggles a class, it also sets `color-scheme` and updates `<meta name="theme-color">` in the same handler. Every colour fading at once as the theme changes is `defaults-quiet-theme-switch`. See [recipes.md](recipes.md#theme-switch).

## Focus rings for the keyboard only

Use `:focus-visible` with a 2px solid `outline` at `outline-offset: 2px`. A ring on every click is `defaults-focus-keyboard-only`.

Never remove the outline without drawing another. A `box-shadow` ring is no replacement, because forced-colours mode erases every shadow. Search for `outline: none`, `outline: 0` and Tailwind's `outline-none` with no `focus-visible:` ring beside it. Each one is `defaults-focus-outline`. Whether each ring shows in the running page, at a 3:1 change from unfocused, is checked by `keyboard`.

## Forced colours keep every edge and state

Under `forced-colors: active` the browser repaints text, backgrounds and borders from a small system palette and drops every shadow. A state shown by a background fill alone vanishes there, so selected, checked and current items also take an outline, a border or an icon. Icons are inline SVG in `currentColor`. A `mask-image` icon painted by `background-color` turns the page colour and disappears. A selected tab marked only by its fill is `defaults-forced-colors`. Check it with forced-colours emulation in the browser's rendering tools. See [recipes.md](recipes.md#forced-colours).

## Targets are at least 24px

Every interactive target is at least 24px on its shorter side, and aims for 40px with a mouse and 44px on touch. When the glyph is smaller, a pseudo-element with a negative inset carries the hit area. A 16px icon button with a 16px hit box is `defaults-hit-area`. Extended hit areas never overlap. See [recipes.md](recipes.md#hit-area).

Borderless controls keep about 24px between their visible edges, and bordered controls about 12px. Two 16px icon buttons 4px apart is `defaults-target-spacing`.

## Actions fire on release

An action fires on `click`, at release, never on `pointerdown`, `mousedown` or `touchstart`. Opening a menu or a select may happen on `pointerdown`, as native menus do, but anything that changes data waits for release. The pressed look may show at once through `:active`, and a drag released outside any target reverts. A row deleted on `pointerdown` is `defaults-act-on-release`.

## Controls say what they are

An icon-only button carries an `aria-label` that says what it does. A bare trash icon with no name is `defaults-name-icon-buttons`.

An accessible name contains the visible label at its start, so voice control can say what it reads. `aria-label="Submit form"` on a button reading Send is `defaults-label-in-name`.

A custom control exposes its state: `aria-expanded` on a disclosure, `aria-pressed` on a toggle button, `role="switch"` with `aria-checked`, `aria-selected` on a tab and `aria-current="page"` on the current nav link. A Filters button that hides whether it is open is `defaults-expose-state`.

Status never rests on colour alone. Pair it with an icon or a word. A red dot as the only sign of an error is `defaults-not-color-alone`.

## Hidden from screen readers means hidden from the keyboard

Never set `aria-hidden="true"` on an element that can take focus or contains one, because the keyboard still lands where a screen reader hears nothing. Hide a region with `inert` instead. A marquee's duplicate row under `aria-hidden="true"`, its links still taking focus, is `defaults-no-hidden-focusable`.

## Collapsed content stays findable

Accordions, Show More panels and collapsed sections use `<details>` or `hidden="until-found"`, so find in page and a link to the section open them. An element under `hidden="until-found"` never takes `display: none`, which stops the reveal. A collapsed FAQ answer that find in page never reaches is `defaults-findable-collapsed`.

## Images say what they are for

An image's `alt` says what the image does where it sits, such as where a linked logo leads. A decorative image takes `alt=""`, so screen readers skip it. `alt="image"` or a file name is `defaults-alt-by-purpose`.

## Media can be followed and stopped

Video with speech carries captions through `<track kind="captions">`, and audio alone has a transcript. A product video with no captions is `defaults-caption-media`.

Autoplaying video is `muted` and shows a visible pause control. Nothing plays sound on its own for more than 3 seconds. A hero video looping with no pause is `defaults-autoplay-controls`.

## Pages have a structure

Visual headings are real `h1` to `h6` elements in order, with one `h1`, and regions use `main` and `nav`. A `<div class="title-lg">` standing in for a heading is `defaults-real-headings`.

Each route sets a unique `<title>` and updates it on client navigation, such as `Invoices · Acme`. `<title>App</title>` on every page is `defaults-page-title`.

The root sets `<html lang>`, and a phrase in another language takes its own `lang`. A bare `<html>` is `defaults-page-lang`.

Product names, code and identifiers take `translate="no"`, so automatic page translation leaves them intact. A product name translated into a common noun, or a code sample with its keywords translated, is `defaults-no-translate-names`.

## Links are links

Navigation items are `<a href>`, so new-tab clicks, middle clicks and copy link all work, and hovering shows the URL. A `button` or `div` whose `onClick` calls `router.push` is `defaults-links-are-links`.

A link inside running text is underlined, because colour alone fails anyone who cannot tell the hues apart. Navigation bars and lists made only of links may drop the underline. A paragraph link marked by blue alone is `defaults-underline-prose-links`.

Link underlines set `text-underline-position: from-font` and `text-decoration-skip-ink: auto`, so the line sits where the font places it and breaks around descenders. An underline striking through the tails of g and y is `defaults-underline-from-font`.

## State lives in the URL

Filters, tabs, pagination and open panels write to the URL, so refresh, share and Back keep them. A filter lost on refresh is `defaults-state-in-url`.

Back from an item opened in a long or infinite list restores the scroll position and the pages already loaded. A list that returns to its top after Back is `defaults-restore-list-position`.

Changing a filter never scrolls the results to the top while focus stays in the filter panel. On phones, filters wait for an Apply button, and the results dim as a whole while they refetch. Results jumping to the top on each filter checkbox is `defaults-filters-hold-scroll`.

## Navigation shows where you are

The last breadcrumb is plain text with `aria-current="page"`. Crumbs show the hierarchy, not the history, and phones show only the parent. A last crumb that links to the current page is `defaults-breadcrumb-current-plain`.

Help, contact and chat links that repeat across pages keep the same relative order. A Help link that moves from the header to the footer between pages is `defaults-help-in-one-place`.

The selected item in a list or a nav shows with a background fill, and colour or a reserved bold weight beside it. A thin bar alone is easy to miss and lands on the wrong side once mirrored. A coloured left border as the only mark is `defaults-selected-not-left-bar`.

## Zoom stays on

Never set `maximum-scale=1` or `user-scalable=no` in the viewport tag. A page that blocks pinch zoom is `defaults-allow-zoom`.

## Taps feel native

Set `-webkit-tap-highlight-color: transparent` once on the root, and give every tappable element its own `:active` state. A grey flash on tap is `defaults-no-tap-highlight`.

Buttons and links set `touch-action: manipulation`. A tap then stays instant after the user zooms, and two quick taps on a stepper never zoom the page. A `+` button whose second quick tap zooms the page is `defaults-fast-tap`. See [recipes.md](recipes.md#mobile-baseline).

Links and images used as controls set `-webkit-touch-callout: none`, so a long press opens no preview. A tile that pops a link preview on a long press is `defaults-no-touch-callout`.

## Hover styles need a hover pointer

Wrap hover-only styles in `@media (hover: hover) and (pointer: fine)`, or a tap leaves them stuck on touch screens. A card that stays lifted after a tap is `defaults-hover-capable-only`. In Tailwind v4, `hover:` is already gated by `@media (hover: hover)`, and v3 needs `future.hoverOnlyWhenSupported: true`.

## Full-height layouts use dynamic units

An app shell or a bottom-pinned bar uses `100dvh`, and a first screen uses `min-height: 100svh`. A `100vh` shell whose bottom button hides under the URL bar is `defaults-dynamic-viewport`.

The viewport tag carries `interactive-widget=resizes-content`, so `100dvh` layouts and bottom-pinned inputs follow the on-screen keyboard. Chrome and Firefox on Android honour it, and Safari before 27.3 ignores it. There, a bottom-pinned composer follows `visualViewport` resize events instead. A message composer hidden behind the keyboard is `defaults-keyboard-resizes`. See [recipes.md](recipes.md#keyboard-inset).

## Content clears the notch

Add `viewport-fit=cover` to the viewport tag, then pad fixed headers, tab bars, toasts and sheets with `env(safe-area-inset-*)`. Wrap the inset in `max()` with the bar's own padding, such as `max(12px, env(safe-area-inset-bottom))`, so a phone without a home indicator keeps its 12px. In landscape the notch sits at the side, so full-width bars pad their inline ends too. A bottom bar under the home indicator is `defaults-safe-areas`.

## Controls are not selectable

Buttons, tabs, chips and drag handles set `user-select: none`, so a long press does not select their label. Content text stays selectable. A button label highlighted by a long press is `defaults-controls-not-selectable`.

## Hotkeys stay out of the way

Hotkeys do not fire while an input, a textarea or an editable element has focus. That is `defaults-keys-ignore-inputs`. See [recipes.md](recipes.md#hotkey-guard).

A shortcut that is a lone letter, number or symbol can be turned off or remapped, or works only while its component has focus. `J` and `K` bound on `window` with no off switch is `defaults-single-key-off-switch`.

## Busy buttons keep their label and their focus

While its request runs, a button keeps its label and shows an indicator beside it. A label replaced by a spinner that shrinks the button is `defaults-loading-button`.

A busy button sets `aria-disabled="true"` and `aria-busy="true"` and ignores clicks in its handler, so it keeps focus and its place in the tab order. The `disabled` attribute, which drops focus to the body, is `defaults-busy-keeps-focus`.

## Destructive actions can be undone

Offer undo after a destructive action. Where undo is impossible, confirm in place with a menu or a popover. A delete with neither is `defaults-undo-destructive`.

An undo that changes something off screen scrolls to it and highlights it, and its button names the action, such as Undo Delete Row. An undo that restores a row the user cannot see is `defaults-undo-shows-result`.

## Numbers line up

Prices, counts, timers and table columns use `font-variant-numeric: tabular-nums`. A counter whose width jitters as it ticks is `defaults-tabular-numbers`.

## Tables are tables

Tabular data is a `<table>` whose header cells are `<th scope="col">` or `<th scope="row">`, or a full `role="grid"` with rows, cells and arrow keys. Rows built from styled `div` elements, which a screen reader cannot read by column, are `defaults-real-table`.

## Columns align by type

Numbers, amounts and dates align right, and text aligns left. Each header takes its own column's alignment. Only single-glyph columns, such as a checkbox or a status dot, centre. A centred price column is `defaults-align-columns`.

## Tables rule rows, not cells

Rows take a 1px translucent divider and columns take none. A vertical rule goes only between two numeric columns that could be confused. A border on every cell is `defaults-row-dividers`.

## Long tables keep their labels

A table taller than the screen keeps its header with `position: sticky` and an opaque background. A header that scrolls away over 200 rows is `defaults-sticky-table-header`.

A table that scrolls sideways keeps its first column, the one that names each row, sticky at `inset-inline-start: 0` with an opaque background. Row names scrolling away while the user reads the twelfth column is `defaults-sticky-first-column`.

A long table pages or virtualises, and shows the count and the position, such as `1–50 of 1,240`. A pager with only Next and Previous, or a list with no count, is `defaults-paginate-tables`. The row count that forces it belongs to `frames`.

The whole header cell is the sort button. The sorted column shows its direction and sets `aria-sort`. A sort dropdown above the table is `defaults-sortable-header`.

## Row controls hold their column

Checkbox and row action columns keep their width at all times. Hover changes only their opacity. Columns shifting as a checkbox appears on row hover is `defaults-reserved-row-controls`.

## Headings balance, paragraphs wrap pretty

Headings take `text-wrap: balance` and body paragraphs take `text-wrap: pretty`. A heading with one word alone on its last line is `defaults-balanced-wrap`.

Running text never takes `text-align: justify`, which opens rivers between words. A justified paragraph is `defaults-no-justify`.

## Paragraphs keep a readable measure

Running text stops at `max-width: 65ch`. Buttons, navigation and table cells are exempt. A paragraph stretching across a 1440px window is `defaults-line-length`.

## Sizes come from the type scale

Font sizes come from the project's type scale tokens. Where a size seems missing, the nearest step wins over a new value. A one-off `font-size: 13.5px` between two steps is `defaults-type-from-scale`.

The scale is in `rem`, and the root never sets a font size in `px`, so the browser's own text-size setting still scales the page. `html { font-size: 14px }` is `defaults-rem-sizes`.

## Leading tightens as type grows

Set `line-height` unitless: 1.5 for body text and 1.1–1.3 for headings. Anything that wraps to three lines or more takes at least 1.4. `leading-none` on a three-line description is `defaults-leading-by-size`.

## Tracking follows size

Type above 32px tightens to about `-0.02em`. Uppercase labels open to about `0.05em` and come from `text-transform`, never typed capitals. A 48px heading at the font's default tracking is `defaults-tracking-by-size`.

## Every weight is a real face

Load each weight and italic the design uses. Bold or italic drawn by the browser from the regular face is `defaults-real-faces`.

Text never sets a weight under 400, least of all at small sizes, and colour carries the hierarchy instead. `font-weight: 300` on 13px secondary text is `defaults-no-light-weights`.

## Weight never marks a state

Font weight never changes on hover, focus or the selected state, because the wider glyphs shift every sibling. Colour carries the state, or a hidden bold copy of the label reserves its width. A tab row that jumps as the selected tab turns `font-weight: 600` is `defaults-steady-weight`. See [recipes.md](recipes.md#steady-weight).

## Text renders crisp

Set `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` once, on the root. Smoothing missing, or set component by component, is `defaults-antialiased-root`.

## Inline code sits smaller

Monospace inside running text drops to `0.9em`. Inline code at full size, towering over its sentence, is `defaults-inline-mono`.

## Truncation has a way back

Truncated text the user needs opens in full through a tooltip, an expand control or a detail view. A cut-off file name with no way to read it is `defaults-truncate-with-way-back`. File names and paths truncate in the middle, where they differ. Numbers, amounts and dates never truncate.

## Layouts survive real data

Text columns take `min-width: 0`, fixed boxes such as avatars take `flex-shrink: 0` and emails and URLs take `overflow-wrap: anywhere`. A long email pushing the row menu off screen is `defaults-survives-long-content`. Finding the longest real value belongs to `stress`, and rendering it at each width to `viewports`.

A missing optional field drops its line rather than showing a placeholder. A lone dash where the role should be is `defaults-omit-empty-fields`.

## Numbers, dates and plurals follow the locale

Format them through `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.PluralRules`. `1 members` or a raw `1284` is `defaults-locale-format`.

Relative times say "Just now" under a minute and switch to an absolute date after 7 days, such as 12 Dec 2025. Hours roll up to days, and a future time never reads `-3 days ago`. `0 seconds ago`, `340 days ago` or an epoch default rendered as `1970-01-01` is `defaults-relative-time-edges`.

Progress bars and meters clamp their value to 0–100. Displayed numbers are rounded, and large counts take the compact form, such as `1M`. A bare `width: ${pct}%`, or `0.30000000000000004` on screen, is `defaults-clamp-meters`.

## Updates announce themselves

Toasts, result counts and inline validation sit in a polite live region, `role="status"`, rendered empty before its text changes. A toast that screen readers never hear is `defaults-announce-updates`.

`role="alert"` interrupts whatever is being read, so it is kept for urgent failures that block the task, such as a failed payment. A Saved toast announced through `role="alert"` is `defaults-alert-for-urgent`.

## Waits show feedback at once

An action responds within 400ms or shows feedback straight away, as an optimistic value, a skeleton or a progress bar. A loading branch that returns `null` is `defaults-instant-feedback`.

Hold a spinner or skeleton back 150–300ms, then keep it up at least 300–500ms once shown. A skeleton that flashes for one frame is `defaults-no-flicker-loading`. A skeleton matches the layout it stands in for. See [recipes.md](recipes.md#loading-delay).

## Sound confirms, never alone

Sound fits confirmations such as payment, upload or submit. It also fits errors that must not be missed. Every cue has a visible twin, such as a status change. A success chime with nothing changing on screen is `defaults-sound-has-a-twin`.

Typing, hover, scroll and keyboard navigation make no sound. A click on every keystroke is `defaults-no-sound-on-repeat`.

The user can turn sound off, and volume starts at `0.3`. A hardcoded `audio.volume = 1` with no off switch is `defaults-sound-optional`. Playback and a synthesized click are in [recipes.md](recipes.md#sound).

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `defaults-fade-not-cut` | `overflow: auto` with a hard cut | A `mask-image` fade at both ends |
| `defaults-no-clipped-shadow` | A card shadow cut by `overflow: hidden` | `padding: 8px` on the scroller |
| `defaults-scroll-not-wrap` | A code line wrapping to two lines | `white-space: nowrap` and `overflow-x: auto` |
| `defaults-scrollbar-gutter` | A centred layout jumping 15px as a route grows past the window | `html { scrollbar-gutter: stable }` |
| `defaults-contain-overscroll` | A drawer list that scrolls the page at its end | `overscroll-behavior: contain` on the drawer |
| `defaults-no-page-overscroll` | Pull-to-refresh firing while a sheet is dragged | `html, body { overscroll-behavior: none }` |
| `defaults-sticky-border` | A sticky header with no edge | `border-bottom: 1px solid var(--gray-a4)` |
| `defaults-clear-sticky-chrome` | A focused field under a 56px sticky header or a cookie banner | `scroll-padding-block-start: 56px` and `scroll-padding-block-end` for bottom bars |
| `defaults-z-index-scale` | `z-index: 9999` on a sticky header | `z-index: var(--z-sticky)` from a scale of base, dropdown, sticky, overlay and toast |
| `defaults-ring-not-border` | `border: 1px solid #e5e5e5` plus `box-shadow` on a popover | `0 0 0 1px var(--gray-a4)` first in the shadow, over a transparent border |
| `defaults-layered-shadows` | `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2)` | Three downward layers, blur growing and opacity falling |
| `defaults-fade-the-shadow` | `transition: box-shadow 200ms` | `opacity` on a `::after` that holds the raised shadow |
| `defaults-image-outline` | A photo with no edge on a white card | `outline: 1px solid rgba(0, 0, 0, 0.1)` at `outline-offset: -1px` |
| `defaults-cover-any-ratio` | A 4000×200 panorama stretched into a square box | `object-fit: cover` with `aspect-ratio: 1` |
| `defaults-no-nested-cards` | A card holding a heading and another card | The heading above one card |
| `defaults-rounded-not-pill` | `border-radius: 9999px` on a button | `border-radius: var(--radius-2)` |
| `defaults-no-decoration` | A gradient glow behind a card | A flat background |
| `defaults-reduced-transparency` | `backdrop-filter: blur(20px)` over `rgba(255, 255, 255, 0.6)` in every mode | An opaque surface under `prefers-reduced-transparency: reduce` |
| `defaults-theme-follows-system` | A theme switch with only Light and Dark | System, Light and Dark, with System as the default |
| `defaults-color-scheme` | A white flash and light scrollbars on a dark page | `color-scheme: light dark` on the root and in a `color-scheme` meta tag |
| `defaults-theme-one-source` | `@media (prefers-color-scheme: dark) { :root { --surface: #0a0a0a } }` beside a Light, Dark and System switch | `--surface: light-dark(#ffffff, #0a0a0a)` with the switch setting `color-scheme` on the root |
| `defaults-quiet-theme-switch` | Every colour transition firing on a theme switch | Transitions off for one frame, `theme-color` updated in the handler |
| `defaults-focus-keyboard-only` | `.button:focus { box-shadow: 0 0 0 2px var(--accent) }` | `.button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` |
| `defaults-focus-outline` | `className="focus:outline-none"` and no other ring | `focus-visible:outline-2 focus-visible:outline-offset-2` |
| `defaults-forced-colors` | `.tab[aria-selected="true"] { background: var(--gray-a3) }` as the only mark | The same fill plus `outline: 2px solid Highlight` under `forced-colors: active` |
| `defaults-hit-area` | A 16px icon button with a 16px hit box | `inset: -12px` on its `::before`, a 40px target |
| `defaults-target-spacing` | Two 16px icon buttons 4px apart | 24px between their visible edges |
| `defaults-act-on-release` | `onPointerDown={deleteRow}` | `onClick={deleteRow}` with the pressed style on `:active` |
| `defaults-name-icon-buttons` | `<button><TrashIcon /></button>` | `<button aria-label="Delete">` |
| `defaults-label-in-name` | `<button aria-label="Submit form">Send</button>` | No `aria-label`, or `aria-label="Send message"` |
| `defaults-expose-state` | `<button onClick={toggle}>Filters</button>` | `<button aria-expanded={open} aria-controls="filters">Filters</button>` |
| `defaults-not-color-alone` | A red dot as the only error cue | The dot with an icon or the word `Failed` |
| `defaults-no-hidden-focusable` | `aria-hidden="true"` on a marquee's duplicate row of links | `inert` on the duplicate row |
| `defaults-findable-collapsed` | An FAQ answer toggled with `display: none` | `<details><summary>` around the answer, or `hidden="until-found"` on the panel |
| `defaults-alt-by-purpose` | `<img alt="logo.png">` inside the home link | `<img alt="Home">` |
| `defaults-caption-media` | A talking-head video with no captions | `<track kind="captions" src="talk.vtt">` |
| `defaults-autoplay-controls` | `<video autoplay loop>` with sound and no pause | `<video autoplay muted loop>` with a visible `Pause` button |
| `defaults-real-headings` | `<div class="title-lg">Billing</div>` | `<h2>Billing</h2>` |
| `defaults-page-title` | `<title>App</title>` on every route | `<title>Invoices · Acme</title>`, updated on navigation |
| `defaults-page-lang` | `<html>` | `<html lang="en">` and `<span lang="fr">Français</span>` |
| `defaults-no-translate-names` | `<span class="logo">Acme</span>` open to page translation | `<span class="logo" translate="no">` and `<pre translate="no">` |
| `defaults-links-are-links` | `<button onClick={() => router.push("/settings")}>` in the nav | `<a href="/settings">`, or the router's link component |
| `defaults-underline-prose-links` | A link in a paragraph shown by `color: var(--accent)` alone | `text-decoration: underline` on links inside running text |
| `defaults-underline-from-font` | `text-decoration: underline` cutting through descenders | `text-underline-position: from-font; text-decoration-skip-ink: auto` |
| `defaults-state-in-url` | A filter held only in `useState` | `?status=open` in the URL |
| `defaults-restore-list-position` | Back from item 140 landing at the top of the list | The scroll position and loaded pages restored |
| `defaults-filters-hold-scroll` | Results jumping to the top on each filter checkbox | Scroll held, the results dimmed while they refetch |
| `defaults-breadcrumb-current-plain` | The last crumb as a link to the current page | Plain text with `aria-current="page"` |
| `defaults-help-in-one-place` | Help in the header on one page and the footer on the next | Help in the same place on every page |
| `defaults-selected-not-left-bar` | `border-left: 2px solid var(--accent)` as the only mark on the current nav item | `background: var(--gray-a3)` with `color: var(--text-primary)` on the current item |
| `defaults-allow-zoom` | `maximum-scale=1, user-scalable=no` | `width=device-width, initial-scale=1` |
| `defaults-no-tap-highlight` | The browser's grey flash on every tap | `-webkit-tap-highlight-color: transparent` and an `:active` style |
| `defaults-fast-tap` | Two quick taps on a `+` stepper zooming the page | `touch-action: manipulation` on the stepper's buttons |
| `defaults-no-touch-callout` | A link preview popping on a long-pressed tile | `-webkit-touch-callout: none` on the tile |
| `defaults-hover-capable-only` | `.card:hover { transform: translateY(-2px) }` | The same rule inside `@media (hover: hover) and (pointer: fine)` |
| `defaults-dynamic-viewport` | `height: 100vh` on the app shell | `height: 100dvh` |
| `defaults-keyboard-resizes` | A composer hidden behind the on-screen keyboard | `interactive-widget=resizes-content` in the viewport tag, and the composer following `visualViewport` on iOS |
| `defaults-safe-areas` | A tab bar under the home indicator, or `padding-bottom: env(safe-area-inset-bottom)` leaving 0px elsewhere | `padding-bottom: max(12px, env(safe-area-inset-bottom))` with `viewport-fit=cover` |
| `defaults-controls-not-selectable` | A long press selecting a tab's label | `user-select: none` on the tab |
| `defaults-keys-ignore-inputs` | `J` moves the selection while typing in search | Hotkeys skip `input`, `textarea` and `[contenteditable]` |
| `defaults-single-key-off-switch` | `J` and `K` bound on `window` | Scoped to the focused list, or a `Keyboard Shortcuts` toggle |
| `defaults-loading-button` | The label swapped for a spinner | Label kept, spinner beside it |
| `defaults-busy-keeps-focus` | `disabled={isSaving}` on the submit button | `aria-disabled="true" aria-busy="true"`, clicks ignored while busy |
| `defaults-undo-destructive` | A delete that happens at once with no way back | A toast with `Undo` |
| `defaults-undo-shows-result` | `Undo` restoring a row off screen | `Undo Delete Row`, scrolling to the row and highlighting it |
| `defaults-tabular-numbers` | A ticking timer that shifts width | `font-variant-numeric: tabular-nums` |
| `defaults-real-table` | `<div class="row">` holding `<div class="cell">` for each value | `<table>` with `<th scope="col">` headers |
| `defaults-align-columns` | A centred price column | `text-align: right` on the cells and the header |
| `defaults-row-dividers` | A border on every cell | `border-bottom: 1px solid var(--gray-a3)` on rows only |
| `defaults-sticky-table-header` | A header that scrolls away over 200 rows | `position: sticky; top: 0` with `background: var(--surface)` |
| `defaults-sticky-first-column` | A wide table whose name column scrolls away | `position: sticky; inset-inline-start: 0` on the first column, with `background: var(--surface)` |
| `defaults-paginate-tables` | 1,240 rows under a pager reading only `Next` | `1–50 of 1,240` beside the pager, the page in the URL |
| `defaults-sortable-header` | A sort dropdown above the table | The header cell as a button, with `aria-sort="ascending"` |
| `defaults-reserved-row-controls` | A checkbox column that appears on row hover | The column always there, its opacity rising on hover |
| `defaults-balanced-wrap` | One word alone on a heading's last line | `h1 { text-wrap: balance }` and `p { text-wrap: pretty }` |
| `defaults-no-justify` | `text-align: justify` on a paragraph | `text-align: start` |
| `defaults-line-length` | A paragraph across a 1440px window | `max-width: 65ch` |
| `defaults-type-from-scale` | `font-size: 13.5px` on a label | `font-size: var(--text-sm)` |
| `defaults-rem-sizes` | `html { font-size: 14px }` | No root size, and `--text-sm: 0.875rem` |
| `defaults-leading-by-size` | `line-height: 1` on a three-line description | `line-height: 1.4` |
| `defaults-tracking-by-size` | A 48px heading at the font's default tracking | `letter-spacing: -0.02em` |
| `defaults-real-faces` | `font-weight: 600` with only the 400 face loaded | The 600 face in `@font-face` |
| `defaults-no-light-weights` | `font-weight: 300` on 13px secondary text | `font-weight: 400`, with colour carrying the hierarchy |
| `defaults-steady-weight` | `.tab[aria-selected="true"] { font-weight: 600 }` shifting the row | Colour for the selected tab, or a hidden bold `::after` reserving its width |
| `defaults-antialiased-root` | Default subpixel smoothing on light text | `-webkit-font-smoothing: antialiased` on the root |
| `defaults-inline-mono` | `<code>` at the size of its sentence | `font-size: 0.9em` |
| `defaults-truncate-with-way-back` | A truncated file name and nothing else | A tooltip with the full name |
| `defaults-survives-long-content` | A long email pushing the row menu off screen | `min-width: 0` on the text, `flex-shrink: 0` on the menu |
| `defaults-omit-empty-fields` | A dash where a missing role would be | The role line left out |
| `defaults-locale-format` | `{count} members` with `count` at `1` | `Intl.PluralRules` choosing `member` or `members` |
| `defaults-relative-time-edges` | `340 days ago` | `12 Dec 2025` |
| `defaults-clamp-meters` | `width: ${pct}%` | `width: ${Math.min(100, Math.max(0, pct))}%` |
| `defaults-announce-updates` | A toast mounted with its text and no role | An empty `role="status"` region whose text updates |
| `defaults-alert-for-urgent` | `role="alert"` on a Saved toast | `role="status"`, with `role="alert"` kept for "Payment failed" |
| `defaults-instant-feedback` | `if (isLoading) return null` | `if (isLoading) return <Skeleton />` |
| `defaults-no-flicker-loading` | A spinner shown for a 40ms response | Shown after 200ms, held for at least 400ms |
| `defaults-sound-has-a-twin` | `playSound("success")` with no status change | `setStatus("success")` beside the sound |
| `defaults-no-sound-on-repeat` | `playSound("keystroke")` inside `onChange` | No sound on typing |
| `defaults-sound-optional` | `audio.volume = 1` and no off switch | A sound setting, volume `0.3` by default |

## Reporting

**Severity.** `HIGH` breaks use or access. That is a clipped shadow, a hard scroll cut, hotkeys that fire while typing, a target under 24px or a silent wait. It is also sound with no visual twin or off switch. It is also media that plays sound with no pause or speaks with no captions. It is also an unnamed icon button, a name that does not start with its visible label, hidden control state or status in colour alone. It is also blocked zoom, a route with no link, an action fired on press or a lone-key shortcut with no off switch. It is also a truncated value with no way back or a destructive action with no undo or confirmation. It is also content pushed off screen by a long value or a bar under the home indicator. It is also controls hidden behind a `100vh` shell or the on-screen keyboard. It is also an image with no `alt` or a focusable element under `aria-hidden`. It is also a busy button that drops focus to the body, or tabular data built from `div` elements. It is also a focus outline removed with nothing in its place.

`MEDIUM` is a pill button, a click focus ring or a hover stuck on touch. It is also proportional figures in data, sound on a frequent action, scroll leaking out of a scroller, state lost on refresh or a flickering skeleton. It is also a busy button with no indicator, an unannounced update, a focused element left covered or a card inside a card. It is also a tap flash or a double tap that zooms, a selectable control label, a page that bounces or an unformatted number or plural. It is also alt text naming the file rather than the purpose, headings built from styled `div` elements, a shared page title or a missing `lang`. It is also a centred number column, a long table with no sticky header, a sort with no `aria-sort` or row controls that shift columns. It is also a wide table whose first column scrolls away, a long table with no count or a link in prose shown by colour alone. It is also a paragraph past `65ch`, wrapped text under 1.4 leading, a browser-drawn bold or a weight under 400. It is also a theme that ignores the system, translucency that ignores the user's setting, a stretched image or controls crowded closer than their spacing. It is also a list that loses its place on Back or results that jump on a filter change. It is also an undo with no visible result, a relative time past its edges or an unclamped meter. It is also a routine update announced as an alert, or a weight change that shifts its siblings. It is also a theme switch the styles ignore or a state lost in forced colours. It is also collapsed text that find in page misses or a root font size in `px`.

`LOW` is an opaque border beside a shadow, a decorative glow, a single harsh shadow or a transitioned `box-shadow`. It is also unbalanced headings, justified text, a missing image outline or a borderless sticky header. It is also a light scrollbar or white flash on a dark page, a smeared theme switch or missing root font smoothing. It is also full-size inline code, a code line that wraps, a placeholder dash for an empty field or a long-press preview on a control. It is also a border on every table cell, display type at default tracking, a linked last breadcrumb or help links that move between pages. It is also a product name or code open to page translation, or an underline through descenders. It is also an ad hoc `z-index`, a font size off the type scale or a selected item marked by a left bar alone. It is also a layout that shifts as a scrollbar appears.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open the screen when a check depends on layout, and mark every check you could not run as `Not verified`.
