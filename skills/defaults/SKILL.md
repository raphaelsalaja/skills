---
name: defaults
description: Applies house defaults for scroll edges, surfaces, theme, focus, names, page structure, links, mobile, type, tables, data, loading and sound.
---

# Defaults

This skill holds the interface defaults that apply on every screen. It covers scroll, surfaces, theme, focus, names, page structure, links, mobile, type, tables, data, loading and sound.

## Tokens first, then these values

Use the project's token wherever one exists for a value below. Where none exists, the values here are exact. A hard scroll cut or a clipped shadow is a finding in any style.

The house shapes are taste: the radius token over a pill, rings instead of borders, image outlines and no nested cards. They yield to a system the project has already established.

Fields belong to `forms`, and dialogs, menus, tooltips, sheets and toasts to `overlays`. Words belong to `copy`, and building with the project's primitive to `reuse`. Whether an animation should exist and how it moves belong to `motion`. Whether an unrequested sound or decorative effect is added belongs to `restraint`. Colour and contrast belong to `color`, radii and optical nudges to `alignment` and empty, failed and stale screens to `states`.

## Scroll edges fade and shadows fit

A scroll container fades its ends with a `mask-image` gradient (`defaults-fade-not-cut`). See [recipes.md](recipes.md#scroll-fade). It is padded so its children's shadows fit inside the clip (`defaults-no-clipped-shadow`). See [recipes.md](recipes.md#room-for-shadows).

Code blocks keep `white-space: pre` and scroll sideways, and a wide table scrolls in its own wrapper while its cells still wrap (`defaults-scroll-not-wrap`). See [recipes.md](recipes.md#sideways-scroll). A keyboard way into a scroller belongs to `keyboard`.

A scroller that can grow, and the root of a site whose pages vary in length, set `scrollbar-gutter: stable` (`defaults-scrollbar-gutter`).

## Scroll stays where it starts

Drawers, menus, side panels and chat logs set `overscroll-behavior: contain` (`defaults-contain-overscroll`). An app sets `overscroll-behavior: none` on `html, body` and never calls `preventDefault()` in a `touchmove` listener (`defaults-no-page-overscroll`).

## Sticky chrome keeps its edge and clears focus

A sticky header or footer takes a 1px border against the content under it (`defaults-sticky-border`). `scroll-padding-block-start` and `scroll-padding-block-end` match the sticky bars, and no toast, chat widget or cookie banner covers focus (`defaults-clear-sticky-chrome`).

## Surfaces stack, lift and edge the same way

Every `z-index` comes from a named scale of tokens: base, dropdown, sticky, overlay and toast (`defaults-z-index-scale`). The top layer needs none, as `overlays-top-layer` sets out.

A floating surface puts a translucent 1px ring first in its shadow stack, over a `1px solid transparent` border that forced colours still draw (`defaults-ring-not-border`). Without an elevation token, layer three downward shadows, blur growing and opacity falling (`defaults-layered-shadows`). See [recipes.md](recipes.md#layered-shadow).

A lift on hover fades in a pseudo-element holding the raised shadow, never a `box-shadow` transition (`defaults-fade-the-shadow`). See [recipes.md](recipes.md#raised-on-hover).

Photos and screenshots take a 1px outline inset by 1px, black at 10% in light mode and white at 10% in dark (`defaults-image-outline`). Logos and transparent artwork skip it. See [recipes.md](recipes.md#image-outline).

An image in a fixed box takes `object-fit: cover` (`defaults-cover-any-ratio`). Sizing media before it loads belongs to `vitals`.

A card never sits inside another card, so the heading goes outside (`defaults-no-nested-cards`). Buttons and chips take the radius token, never `9999px` (`defaults-rounded-not-pill`).

Under `prefers-reduced-transparency: reduce`, translucent and blurred surfaces turn opaque (`defaults-reduced-transparency`). Surfaces under increased contrast belong to `color`.

## The theme follows the system

A first visit follows `prefers-color-scheme`, and the switch offers System, Light and Dark with System as the default (`defaults-theme-follows-system`).

The root sets `color-scheme: light dark` and the head carries the matching meta tag, so first paint, scrollbars and native controls follow. A blocking script in the head applies a saved choice before first paint (`defaults-color-scheme`).

Set one `theme-color` tag per colour scheme, matching the top of the page. Safari 26 ignores the tag and tints its bars from a fixed or sticky header touching the edge, so that header is opaque.

Colour tokens use `light-dark()`. The switch sets `data-theme` on the root, which sets `color-scheme`, and System is the attribute's absence. A `prefers-color-scheme: dark` block that ignores a picked Light is `defaults-theme-one-source`.

The switch turns transitions off for one frame. A picked theme adds an unscoped `theme-color` tag ahead of the scoped ones, and System removes it (`defaults-quiet-theme-switch`). See [recipes.md](recipes.md#theme-switch).

## Focus shows for the keyboard and survives forced colours

Focus uses `:focus-visible` with a 2px solid `outline` at `outline-offset: 2px` (`defaults-focus-keyboard-only`).

Never remove the outline without drawing another. A `box-shadow` ring, Tailwind's `ring` included, vanishes in forced colours. Search for `outline: none`, `outline: 0` and `outline-none` with no `focus-visible:` outline beside it (`defaults-focus-outline`). The 3:1 change from unfocused is checked by `keyboard`.

Under `forced-colors: active` the browser repaints from a small system palette and drops every shadow. Selected, checked and current items need an outline, a border or an icon besides their fill (`defaults-forced-colors`). A `mask-image` icon painted by `background-color` vanishes, so icons are inline SVG in `currentColor`. See [recipes.md](recipes.md#forced-colours).

## Targets are big enough and fire on release

Every target is at least 24px on its shorter side, aiming for 40px with a mouse and 44px on touch. A pseudo-element with a negative inset carries it, never overlapping a neighbour's (`defaults-hit-area`). See [recipes.md](recipes.md#hit-area).

Borderless controls keep about 24px between their visible edges and bordered ones about 12px (`defaults-target-spacing`).

Anything that changes data fires on `click`, never on `pointerdown`, `mousedown` or `touchstart` (`defaults-act-on-release`). A menu or a select may open on `pointerdown`, and `:active` shows the press at once.

## Controls carry names and state

Every icon-only button has an accessible name (`defaults-name-icon-buttons`). That name starts with the visible label, so voice control can say what it reads (`defaults-label-in-name`).

A custom control exposes `aria-expanded`, `aria-pressed`, `aria-checked` on `role="switch"`, `aria-selected` or `aria-current="page"` (`defaults-expose-state`). Status pairs its colour with an icon or a word (`defaults-not-color-alone`).

Nothing that takes or contains focus sits under `aria-hidden="true"`, and a hidden region takes `inert` instead (`defaults-no-hidden-focusable`).

Accordions and Show More panels use `<details>` or `hidden="until-found"`, so find in page opens them (`defaults-findable-collapsed`). `display: none` on an `until-found` element stops the reveal.

## Pages have a structure

An `alt` says what the image does where it sits, and decoration takes `alt=""` (`defaults-alt-by-purpose`). Headings are real `h1` to `h6` in order (`defaults-real-headings`). Each route sets its own `<title>`, updated on client navigation (`defaults-page-title`). The root carries `lang` (`defaults-page-lang`). Navigation is `<a href>` (`defaults-links-are-links`). Pinch zoom stays on (`defaults-allow-zoom`).

Product names, code and identifiers take `translate="no"` (`defaults-no-translate-names`).

Video with speech carries `<track kind="captions">`, and audio alone has a transcript (`defaults-caption-media`). Autoplaying video is `muted` with a visible pause, and nothing plays sound on its own past 3 seconds (`defaults-autoplay-controls`).

## Links read as links

A link in running text is underlined, while navigation bars and lists of links may drop it (`defaults-underline-prose-links`). Underlines set `text-underline-position: from-font` and `text-decoration-skip-ink: auto` (`defaults-underline-from-font`).

## State lives in the URL

Filters, tabs, pagination and open panels write to the URL, so refresh, share and Back keep them (`defaults-state-in-url`). Back into a long list restores its scroll position and loaded pages (`defaults-restore-list-position`).

Changing a filter never scrolls the results while focus stays in the panel. On phones filters wait for Apply, and results dim as a whole while they refetch (`defaults-filters-hold-scroll`).

## Navigation shows where you are

The last breadcrumb is plain text with `aria-current="page"`, crumbs show hierarchy rather than history and phones show only the parent (`defaults-breadcrumb-current-plain`). Help, contact and chat links keep one relative order on every page (`defaults-help-in-one-place`).

The selected item takes a background fill, with colour or a reserved bold weight. A thin side bar alone is easy to miss and flips sides once mirrored (`defaults-selected-not-left-bar`).

## Phones get native touch

Set `-webkit-tap-highlight-color: transparent` on the root and give each tappable element an `:active` state (`defaults-no-tap-highlight`). Buttons and links set `touch-action: manipulation`, so a quick second tap never zooms (`defaults-fast-tap`).

Buttons, tabs, chips and drag handles set `user-select: none` (`defaults-controls-not-selectable`). Links and images that act as app controls also set `-webkit-touch-callout: none`, while prose and its links keep both (`defaults-no-touch-callout`). See [recipes.md](recipes.md#mobile-baseline).

Hover-only styles sit inside `@media (hover: hover) and (pointer: fine)`, or a tap leaves them stuck (`defaults-hover-capable-only`). Tailwind v4 already gates `hover:`, and v3 needs `future.hoverOnlyWhenSupported: true`.

An app shell or a bottom-pinned bar uses `100dvh`, and a first screen uses `min-height: 100svh` (`defaults-dynamic-viewport`).

The viewport tag carries `interactive-widget=resizes-content`, so layouts follow the on-screen keyboard (`defaults-keyboard-resizes`). Safari before 27.3 ignores it, so a bottom-pinned composer follows `visualViewport` resize events there. See [recipes.md](recipes.md#keyboard-inset).

Add `viewport-fit=cover`, then pad fixed bars, toasts and sheets with `max(12px, env(safe-area-inset-bottom))` and its siblings (`defaults-safe-areas`). In landscape the notch sits at the side, so full-width bars pad their inline ends.

## Hotkeys stay out of the way

Hotkeys do not fire while an input, a textarea or an editable element has focus (`defaults-keys-ignore-inputs`). See [recipes.md](recipes.md#hotkey-guard). A shortcut on a lone letter, number or symbol can be turned off or remapped, or works only while its component has focus (`defaults-single-key-off-switch`).

## Waits show feedback and keep focus

An action responds within 400ms or shows feedback at once, as an optimistic value, a skeleton or a progress bar (`defaults-instant-feedback`). Hold a skeleton back 150–300ms, then keep it up at least 300–500ms, matching the layout it stands in for (`defaults-no-flicker-loading`). See [recipes.md](recipes.md#loading-delay).

A busy button keeps its label with an indicator beside it (`defaults-loading-button`). It sets `aria-disabled="true"` and `aria-busy="true"` and ignores clicks, because `disabled` drops focus to the body (`defaults-busy-keeps-focus`).

Toasts, result counts and inline validation update a `role="status"` region rendered empty beforehand (`defaults-announce-updates`). `role="alert"` interrupts, so it is kept for failures that block the task, such as a failed payment (`defaults-alert-for-urgent`).

## Destructive actions can be undone

Offer undo after a destructive action, or confirm in place with a menu or a popover where undo is impossible (`defaults-undo-destructive`). An undo that changes something off screen scrolls to it, highlights it and names the action, such as Undo Delete Row (`defaults-undo-shows-result`).

## Tables read by column

Prices, counts, timers and table columns use `font-variant-numeric: tabular-nums` (`defaults-tabular-numbers`).

Tabular data is a `<table>` with `<th scope>` headers, or a full `role="grid"` with arrow keys (`defaults-real-table`). Numbers and dates align right, text left and each header with its column, and only single-glyph columns centre (`defaults-align-columns`).

Rows take a 1px translucent divider and columns none, except between two numeric columns that could be confused (`defaults-row-dividers`).

A table taller than the screen keeps its header sticky and opaque (`defaults-sticky-table-header`). One that scrolls sideways keeps its row-naming column sticky at `inset-inline-start: 0`, opaque (`defaults-sticky-first-column`).

A long table pages or virtualises and shows its position, such as `1–50 of 1,240` (`defaults-paginate-tables`). The row count that forces it belongs to `frames`.

The whole header cell is the sort button, showing its direction through `aria-sort` (`defaults-sortable-header`). Checkbox and row action columns keep their width, and hover changes only their opacity (`defaults-reserved-row-controls`).

## Type sets steady and readable

Headings take `text-wrap: balance` and paragraphs `text-wrap: pretty` (`defaults-balanced-wrap`). Running text is never justified (`defaults-no-justify`) and stops at `max-width: 65ch`, with controls and table cells exempt (`defaults-line-length`).

Sizes come from the type scale, the nearest step beating a new value (`defaults-type-from-scale`). The scale is in `rem` and the root sets no `px` size, so the browser's text-size setting still applies (`defaults-rem-sizes`).

Line height is unitless: 1.5 for body text, 1.1–1.3 for headings and at least 1.4 past three lines (`defaults-leading-by-size`). Type above 32px tightens to about `-0.02em`, and uppercase labels open to `0.05em` through `text-transform` (`defaults-tracking-by-size`).

Load every weight and italic the design uses, so the browser never fakes one (`defaults-real-faces`). No text goes under weight 400, and colour carries the hierarchy (`defaults-no-light-weights`).

Weight never changes on hover, focus or selection, because wider glyphs shift every sibling (`defaults-steady-weight`). See [recipes.md](recipes.md#steady-weight).

`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` are set once, on the root (`defaults-antialiased-root`). Monospace inside running text drops to `0.9em` (`defaults-inline-mono`).

## Layouts survive real data

Truncated text the user needs opens in full through a tooltip, an expander or a detail view (`defaults-truncate-with-way-back`). File names truncate in the middle, and numbers never truncate.

Text columns take `min-width: 0`, fixed boxes `flex-shrink: 0` and emails and URLs `overflow-wrap: anywhere` (`defaults-survives-long-content`). The longest real value belongs to `stress`. A missing optional field drops its line rather than showing a dash (`defaults-omit-empty-fields`).

Numbers, dates and plurals go through `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.PluralRules` (`defaults-locale-format`). Relative times say "Just now" under a minute, never go negative and switch to a date such as 12 Dec 2025 after 7 days (`defaults-relative-time-edges`).

Meters clamp to 0–100, shown numbers round and large counts go compact, such as `1M` (`defaults-clamp-meters`).

## Sound confirms, never alone

Sound fits confirmations and errors that must not be missed, and every cue has a visible twin (`defaults-sound-has-a-twin`). Typing, hover, scroll and keyboard navigation make no sound (`defaults-no-sound-on-repeat`). Sound can be turned off and starts at volume `0.3` (`defaults-sound-optional`). See [recipes.md](recipes.md#sound).

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `defaults-fade-not-cut` | `overflow: auto` with a hard cut | A `mask-image` fade at both ends | `HIGH` |
| `defaults-no-clipped-shadow` | A card shadow cut by `overflow: hidden` | `padding: 8px` on the scroller | `HIGH` |
| `defaults-scroll-not-wrap` | A code line wrapping to two lines | `white-space: pre` and `overflow-x: auto` on the `<pre>`, and a wide table in an `overflow-x: auto` wrapper | `LOW` |
| `defaults-scrollbar-gutter` | A centred layout jumping 15px as a route grows past the window | `html { scrollbar-gutter: stable }` | `LOW` |
| `defaults-contain-overscroll` | A drawer list that scrolls the page at its end | `overscroll-behavior: contain` on the drawer | `MEDIUM` |
| `defaults-no-page-overscroll` | Pull-to-refresh firing while a sheet is dragged | `html, body { overscroll-behavior: none }` | `MEDIUM` |
| `defaults-sticky-border` | A sticky header with no edge | `border-bottom: 1px solid var(--gray-a4)` | `LOW` |
| `defaults-clear-sticky-chrome` | A focused field under a 56px sticky header | `scroll-padding-block-start: 56px` | `MEDIUM` |
| `defaults-z-index-scale` | `z-index: 9999` on a sticky header | `z-index: var(--z-sticky)` | `LOW` |
| `defaults-ring-not-border` | `border: 1px solid #e5e5e5` plus `box-shadow` on a popover | `0 0 0 1px var(--gray-a4)` first in the shadow, over a transparent border | `LOW` |
| `defaults-layered-shadows` | `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2)` | Three downward layers, blur growing and opacity falling | `LOW` |
| `defaults-fade-the-shadow` | `transition: box-shadow 200ms` | `opacity` on a `::after` that holds the raised shadow | `LOW` |
| `defaults-image-outline` | A photo with no edge on a white card | `outline: 1px solid rgba(0, 0, 0, 0.1)` at `outline-offset: -1px` | `LOW` |
| `defaults-cover-any-ratio` | A 4000×200 panorama stretched into a square box | `object-fit: cover` with `aspect-ratio: 1` | `MEDIUM` |
| `defaults-no-nested-cards` | A card holding a heading and another card | The heading above one card | `MEDIUM` |
| `defaults-rounded-not-pill` | `border-radius: 9999px` on a button | `border-radius: var(--radius-2)` | `MEDIUM` |
| `defaults-reduced-transparency` | `backdrop-filter: blur(20px)` over `rgba(255, 255, 255, 0.6)` in every mode | An opaque surface under `prefers-reduced-transparency: reduce` | `MEDIUM` |
| `defaults-theme-follows-system` | A theme switch with only Light and Dark | System, Light and Dark, with System as the default | `MEDIUM` |
| `defaults-color-scheme` | A white flash and light scrollbars on a dark page | `color-scheme: light dark` on the root and in the meta tag, a saved choice applied before paint | `LOW` |
| `defaults-theme-one-source` | `@media (prefers-color-scheme: dark)` tokens beside a System, Light and Dark switch | `--surface: light-dark(#ffffff, #0a0a0a)`, the switch setting `data-theme` on the root | `MEDIUM` |
| `defaults-quiet-theme-switch` | Every colour transition firing on a theme switch | Transitions off for one frame, an unscoped `theme-color` tag added for a picked theme | `LOW` |
| `defaults-focus-keyboard-only` | `.button:focus { box-shadow: 0 0 0 2px var(--accent) }` | `.button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` | `MEDIUM` |
| `defaults-focus-outline` | `className="focus:outline-none"` and no other ring | `focus-visible:outline-2 focus-visible:outline-offset-2` | `HIGH` |
| `defaults-forced-colors` | A selected tab marked only by `background: var(--gray-a3)` | The same fill plus `outline: 2px solid Highlight` under `forced-colors: active` | `MEDIUM` |
| `defaults-hit-area` | A 16px icon button with a 16px hit box | `inset: -12px` on its `::before`, a 40px target | `HIGH` |
| `defaults-target-spacing` | Two 16px icon buttons 4px apart | 24px between their visible edges | `MEDIUM` |
| `defaults-act-on-release` | `onPointerDown={deleteRow}` | `onClick={deleteRow}` with the pressed style on `:active` | `HIGH` |
| `defaults-name-icon-buttons` | `<button><TrashIcon /></button>` | `<button aria-label="Delete">` | `HIGH` |
| `defaults-label-in-name` | `<button aria-label="Submit form">Send</button>` | No `aria-label`, or `aria-label="Send message"` | `HIGH` |
| `defaults-expose-state` | `<button onClick={toggle}>Filters</button>` | `<button aria-expanded={open} aria-controls="filters">Filters</button>` | `HIGH` |
| `defaults-not-color-alone` | A red dot as the only error cue | The dot with an icon or the word `Failed` | `HIGH` |
| `defaults-no-hidden-focusable` | `aria-hidden="true"` on a marquee's duplicate row of links | `inert` on the duplicate row | `HIGH` |
| `defaults-findable-collapsed` | An FAQ answer toggled with `display: none` | `<details>` around the answer, or `hidden="until-found"` on the panel | `MEDIUM` |
| `defaults-alt-by-purpose` | `<img alt="logo.png">` inside the home link, or no `alt` at all | `<img alt="Home">`, and `alt=""` on decoration | `HIGH` |
| `defaults-real-headings` | `<div class="title-lg">Billing</div>` | `<h2>Billing</h2>`, one `h1` per page | `MEDIUM` |
| `defaults-page-title` | `<title>App</title>` on every route | `<title>Invoices · Acme</title>`, updated on navigation | `MEDIUM` |
| `defaults-page-lang` | `<html>` | `<html lang="en">` and `<span lang="fr">Français</span>` | `MEDIUM` |
| `defaults-links-are-links` | `<button onClick={() => router.push("/settings")}>` in the nav | `<a href="/settings">`, or the router's link component | `HIGH` |
| `defaults-allow-zoom` | `maximum-scale=1, user-scalable=no` | `width=device-width, initial-scale=1` | `HIGH` |
| `defaults-no-translate-names` | `<span class="logo">Acme</span>` open to page translation | `<span class="logo" translate="no">` and `<pre translate="no">` | `LOW` |
| `defaults-caption-media` | A talking-head video with no captions | `<track kind="captions" src="talk.vtt">` | `HIGH` |
| `defaults-autoplay-controls` | `<video autoplay loop>` with sound and no pause | `<video autoplay muted loop>` with a visible `Pause` button | `HIGH` |
| `defaults-underline-prose-links` | A paragraph link shown by `color: var(--accent)` alone | `text-decoration: underline` on links inside running text | `MEDIUM` |
| `defaults-underline-from-font` | `text-decoration: underline` cutting through descenders | `text-underline-position: from-font; text-decoration-skip-ink: auto` | `LOW` |
| `defaults-state-in-url` | A filter held only in `useState` | `?status=open` in the URL | `MEDIUM` |
| `defaults-restore-list-position` | Back from item 140 landing at the top of the list | The scroll position and loaded pages restored | `MEDIUM` |
| `defaults-filters-hold-scroll` | Results jumping to the top on each filter checkbox | Scroll held, the results dimmed while they refetch | `MEDIUM` |
| `defaults-breadcrumb-current-plain` | The last crumb as a link to the current page | Plain text with `aria-current="page"` | `LOW` |
| `defaults-help-in-one-place` | Help in the header on one page and the footer on the next | Help in the same place on every page | `LOW` |
| `defaults-selected-not-left-bar` | `border-left: 2px solid var(--accent)` as the only mark on the current nav item | `background: var(--gray-a3)` with `color: var(--text-primary)` | `LOW` |
| `defaults-no-tap-highlight` | The browser's grey flash on every tap | `-webkit-tap-highlight-color: transparent` and an `:active` style | `MEDIUM` |
| `defaults-fast-tap` | Two quick taps on a `+` stepper zooming the page | `touch-action: manipulation` on the stepper's buttons | `MEDIUM` |
| `defaults-controls-not-selectable` | A long press selecting a tab's label | `user-select: none` on the tab | `MEDIUM` |
| `defaults-no-touch-callout` | A link preview popping on a long-pressed tile | `-webkit-touch-callout: none` on the tile | `LOW` |
| `defaults-hover-capable-only` | `.card:hover { transform: translateY(-2px) }` | The same rule inside `@media (hover: hover) and (pointer: fine)` | `MEDIUM` |
| `defaults-dynamic-viewport` | `height: 100vh` on the app shell | `height: 100dvh` | `HIGH` |
| `defaults-keyboard-resizes` | A composer hidden behind the on-screen keyboard | `interactive-widget=resizes-content`, and the composer following `visualViewport` on iOS | `HIGH` |
| `defaults-safe-areas` | `padding-bottom: env(safe-area-inset-bottom)`, 0px on phones without a home indicator | `padding-bottom: max(12px, env(safe-area-inset-bottom))` with `viewport-fit=cover` | `HIGH` |
| `defaults-keys-ignore-inputs` | `J` moves the selection while typing in search | Hotkeys skip `input`, `textarea` and `[contenteditable]` | `HIGH` |
| `defaults-single-key-off-switch` | `J` and `K` bound on `window` | Scoped to the focused list, or a `Keyboard Shortcuts` toggle | `HIGH` |
| `defaults-instant-feedback` | `if (isLoading) return null` | `if (isLoading) return <Skeleton />` | `HIGH` |
| `defaults-no-flicker-loading` | A spinner shown for a 40ms response | Shown after 200ms, held for at least 400ms | `MEDIUM` |
| `defaults-loading-button` | The label swapped for a spinner | Label kept, spinner beside it | `MEDIUM` |
| `defaults-busy-keeps-focus` | `disabled={isSaving}` on the submit button | `aria-disabled="true" aria-busy="true"`, clicks ignored while busy | `HIGH` |
| `defaults-announce-updates` | A toast mounted with its text and no role | An empty `role="status"` region whose text updates | `MEDIUM` |
| `defaults-alert-for-urgent` | `role="alert"` on a Saved toast | `role="status"`, with `role="alert"` kept for "Payment failed" | `MEDIUM` |
| `defaults-undo-destructive` | A delete that happens at once with no way back | A toast with `Undo` | `HIGH` |
| `defaults-undo-shows-result` | `Undo` restoring a row off screen | `Undo Delete Row`, scrolling to the row and highlighting it | `MEDIUM` |
| `defaults-tabular-numbers` | A ticking timer that shifts width | `font-variant-numeric: tabular-nums` | `MEDIUM` |
| `defaults-real-table` | `<div class="row">` holding `<div class="cell">` for each value | `<table>` with `<th scope="col">` headers | `HIGH` |
| `defaults-align-columns` | A centred price column | `text-align: right` on the cells and the header | `MEDIUM` |
| `defaults-row-dividers` | A border on every cell | `border-bottom: 1px solid var(--gray-a3)` on rows only | `LOW` |
| `defaults-sticky-table-header` | A header that scrolls away over 200 rows | `position: sticky; top: 0` with `background: var(--surface)` | `MEDIUM` |
| `defaults-sticky-first-column` | A wide table whose name column scrolls away | `position: sticky; inset-inline-start: 0` on the first column, opaque | `MEDIUM` |
| `defaults-paginate-tables` | 1,240 rows under a pager reading only `Next` | `1–50 of 1,240` beside the pager, the page in the URL | `MEDIUM` |
| `defaults-sortable-header` | A sort dropdown above the table | The header cell as a button, with `aria-sort="ascending"` | `MEDIUM` |
| `defaults-reserved-row-controls` | A checkbox column that appears on row hover | The column always there, its opacity rising on hover | `MEDIUM` |
| `defaults-balanced-wrap` | One word alone on a heading's last line | `h1 { text-wrap: balance }` and `p { text-wrap: pretty }` | `LOW` |
| `defaults-no-justify` | `text-align: justify` on a paragraph | `text-align: start` | `LOW` |
| `defaults-line-length` | A paragraph across a 1440px window | `max-width: 65ch` | `MEDIUM` |
| `defaults-type-from-scale` | `font-size: 13.5px` on a label | `font-size: var(--text-sm)` | `LOW` |
| `defaults-rem-sizes` | `html { font-size: 14px }` | No root size, and `--text-sm: 0.875rem` | `MEDIUM` |
| `defaults-leading-by-size` | `line-height: 1` on a three-line description | `line-height: 1.4` | `MEDIUM` |
| `defaults-tracking-by-size` | A 48px heading at the font's default tracking | `letter-spacing: -0.02em` | `LOW` |
| `defaults-real-faces` | `font-weight: 600` with only the 400 face loaded | The 600 face in `@font-face` | `MEDIUM` |
| `defaults-no-light-weights` | `font-weight: 300` on 13px secondary text | `font-weight: 400`, with colour carrying the hierarchy | `MEDIUM` |
| `defaults-steady-weight` | `.tab[aria-selected="true"] { font-weight: 600 }` shifting the row | Colour for the selected tab, or a hidden bold `::after` reserving its width | `MEDIUM` |
| `defaults-antialiased-root` | Default subpixel smoothing on light text | `-webkit-font-smoothing: antialiased` on the root | `LOW` |
| `defaults-inline-mono` | `<code>` at the size of its sentence | `font-size: 0.9em` | `LOW` |
| `defaults-truncate-with-way-back` | A truncated file name and nothing else | A tooltip with the full name | `HIGH` |
| `defaults-survives-long-content` | A long email pushing the row menu off screen | `min-width: 0` on the text, `flex-shrink: 0` on the menu | `HIGH` |
| `defaults-omit-empty-fields` | A dash where a missing role would be | The role line left out | `LOW` |
| `defaults-locale-format` | `{count} members` with `count` at `1` | `Intl.PluralRules` choosing `member` or `members` | `MEDIUM` |
| `defaults-relative-time-edges` | `340 days ago` | `12 Dec 2025` | `MEDIUM` |
| `defaults-clamp-meters` | `width: ${pct}%` | `width: ${Math.min(100, Math.max(0, pct))}%` | `MEDIUM` |
| `defaults-sound-has-a-twin` | `playSound("success")` with no status change | `setStatus("success")` beside the sound | `HIGH` |
| `defaults-no-sound-on-repeat` | `playSound("keystroke")` inside `onChange` | No sound on typing | `MEDIUM` |
| `defaults-sound-optional` | `audio.volume = 1` and no off switch | A sound setting, volume `0.3` by default | `HIGH` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Open the screen when a check depends on layout, and mark every check you could not run as `Not verified`.
