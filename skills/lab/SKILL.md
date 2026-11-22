---
name: lab
description: Builds a temporary page that shows every variant and state of real components at once, each linked to its source.
disable-model-invocation: true
---

# Lab

This skill builds a page for inspecting components. Every variant and every state of the real components sits open on one screen, so the user can tune them without clicking through the app.

## Every state open, nothing faked

The lab renders the real components, not copies. States that need a click, such as an open menu or a hover, are forced open. The lab is a development page and never ships.

Exploring new options for one idea belongs to `prototype`. Which states a screen needs belongs to `states`, and worst-case data inside an entry belongs to `stress`. The values on the page come from `defaults`, `motion`, `color` and the project's tokens.

## 1. Find the states

Read each component and list its variants, sizes and states: hover, pressed, focus, open, selected, checked, indeterminate, disabled, read-only, invalid, loading, empty and error. A lab that shows the resting state only is `lab-every-state`.

Read the list from the code, not from memory. Every value of a union prop and every boolean prop is an entry. So is every state selector in the component's styles, such as `:hover`, `:active`, `:focus-visible`, `:disabled`, `[data-state="open"]`, `[aria-expanded]`, `[aria-invalid]` and `[aria-busy]`.

Cross the variants with the states, so every variant shows every state it can enter. Sizes show at rest, plus any state whose layout changes with size, such as loading. Primary in six states beside Secondary at rest only is `lab-cross-the-axes`.

## 2. Build one route

Add one development-only route, such as `/lab`, that imports the real components. Copy [lab.js](lab.js) into the app and load it once on that route. A lab built from copied markup is `lab-real-components`.

Each entry renders from fixed props and fixture data, never a live request or the current time, so it looks the same on every load. A card entry that fetches its user and spins while the API is down is `lab-fixed-props`.

## 3. Force states open

Render menus, popovers, tooltips and submenus open with their controlled props or `data-*` attributes. Hold hover and focus with `force` on the entry, such as `force="hover"`. A menu that needs a click to see is `lab-states-open`. The theme follows `defaults`.

Forced overlays must not close or block each other. Opening a second `popover="auto"` closes the first, and a dialog opened with `showModal()` makes the rest of the lab inert. On the lab page only, open dialogs non-modally with `show()` and popovers as `popover="manual"`, through the component's own props where it has them. The component itself keeps the modal, `auto` and `hint` behaviour `overlays` sets. Render portals into their own entry. An open popover that lands outside its entry, such as one the browser centres, is moved under that entry's content by `lab.js`.

After load, count `document.querySelectorAll(":popover-open, dialog[open]")` against the overlays you forced. One menu open where six were forced, or a lab that ignores clicks behind a modal, is `lab-overlays-stay-open`.

`force` has three limits. It rewrites only same-origin style rules, so a browser default such as the built-in focus ring does not appear. It holds the state on the entry's direct child only, so a nested element needs its own entry.

A cross-origin stylesheet cannot be read, so `lab.js` skips it with a console warning. Mark an entry that hits any limit as `Not verified`, then check it with the real keyboard or pointer.

## 4. Link each entry to its source

Wrap each state in a `lab-entry` naming its component, state and source line, as the header comment in `lab.js` shows. An unlabelled grid is `lab-link-the-source`. When the user asked to tune values, add a `lab-tune` for each custom property with its range.

Source links resolve against `root` on `<lab-page>`, the absolute project root. Pass it at runtime where the framework can, such as `process.cwd()` from server code, never a path copied from another machine. Without it, relative sources show as plain labels. `editor` picks the app that opens them and is `cursor` when unset, so set it to the user's editor.

The grid, labels, filters and controls ship with the skill, so write entries only. A lab page with its own grid, labels or styles is `lab-shipped-frame`.

Open the lab once it is built, as `verify` asks.

## 5. Keep it out of the release

Gate the route and `lab.js` to development, or delete both before release. A lab reachable in production is `lab-not-in-production`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `lab-every-state` | The resting button only | Rest, hover, pressed, focus, disabled and loading | `MEDIUM` |
| `lab-cross-the-axes` | Primary in six states, Secondary and Ghost at rest only | Primary, Secondary and Ghost each in all six states | `MEDIUM` |
| `lab-real-components` | Copied markup for each state | The real `Button` imported | `HIGH` |
| `lab-fixed-props` | `<UserCard id="42" />` fetching from the live API | `<UserCard user={fixtures.user} />` | `LOW` |
| `lab-states-open` | A menu behind a trigger | `<Menu open>` with its submenu open | `MEDIUM` |
| `lab-overlays-stay-open` | Six `popover="auto"` menus forced open, one left showing | Each menu as `popover="manual"`, six counted open | `MEDIUM` |
| `lab-link-the-source` | An unlabelled grid | `Menu / Submenu Open` linked to `menu/index.tsx` | `LOW` |
| `lab-shipped-frame` | A lab grid and labels written from scratch | `lab.js` loaded, only `lab-entry` elements written | `MEDIUM` |
| `lab-not-in-production` | `/lab` live on the production site | The route gated to development | `HIGH` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every state you could not render as `Not verified`.
