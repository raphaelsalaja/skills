---
name: reuse
description: Reaches for the project's own components, then a maintained library, then a native feature, before writing new code.
---

# Reuse

This skill sets the order for building anything new. The project's own parts come first, then a maintained library or a platform feature. Custom code comes last.

## A duplicate is a finding

A new component, style or icon that duplicates one the project already has is a finding. Adding a primitive to the shared package and then using it is not. A project with no shared package is judged on the libraries it already depends on.

Cutting what nobody asked for, including a helper with one caller, belongs to `restraint`. Copying an outside app belongs to `match`.

## The project's parts come first

Search the shared component package, the icon set and the tokens before writing UI. Name what you found. A raw `<input>` beside the project's `Input` is `reuse-house-component-first`.

Spacing and radius come from the project's tokens. A raw `16px` where `--space-4` holds the same value is `reuse-tokens-not-values`. Colour tokens belong to `color`, and the z-index and type scales to `defaults`.

## Shipped components stay as shipped

Use a component's variants and `data-*` attributes. A local `className` may place it: margin, width and grid or flex placement are fine. Overriding how it looks, such as its colour, radius, border or inner padding, is `reuse-no-local-restyle`.

## One style per kind of thing

Keep one menu, one table and one dialog shell. A second dropdown style is `reuse-one-standard`.

## Fix it once, in the primitive

When a fix applies to every instance, make it inside the shared component. Patching five call sites is `reuse-fix-in-the-primitive`. Then search for every sibling carrying its own local fix. List the hits with file and line and ask once before editing files outside the change. Leaving the siblings unlisted is `reuse-sweep-siblings`.

## Then a library or the platform

When the project has nothing, use a maintained library or a platform feature before custom code. `Intl` formats dates and numbers. The native context menu handles right-click. A hand-written formatter is `reuse-library-before-custom`.

The platform often removes the install. `crypto.randomUUID()` replaces an id package, `structuredClone()` a deep-copy helper and `URLSearchParams` a query-string parser.

Read `package.json` before installing. A library for a job an installed one already does, such as a second date library, is `reuse-one-library-per-job`.

## A dependency is checked before it lands

Take the package name from the library's own documentation, never from memory. A remembered name may not exist, or may be a look-alike someone published to catch that guess. Installing a name nobody checked is `reuse-confirm-the-package`.

Then run `npm view <name> deprecated dist-tags.latest repository.url`. That version's key in `npm view <name> time --json` is its publish date. Never read `time.modified`, which moves on any metadata edit. `gh repo view <owner/repo> --json isArchived` shows whether the repository is archived. Install it only when it is not deprecated or archived and its latest version shipped within 12 months. A small finished utility may stay quiet longer when its issues get answers. When it fails, port the pattern instead of installing it. That is `reuse-no-stale-dependency`.

## Read the docs before the props

Read the installed version in `package.json` or the lockfile, then the documentation for that major version. Use its current APIs, not ones remembered from an older release. A guessed prop is `reuse-read-the-docs`.

## Icons from the set, at native size

Use the project's icon set at the size it was drawn for. A generated SVG, or an `18px` icon scaled to `12px`, is `reuse-icon-set-native-size`. A glyph the set lacks, drawn by `icons` and added to the shared icon package or folder, is not a finding.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `reuse-house-component-first` | `<input className={styles.search} />` | The project's `<Input />` | `HIGH` |
| `reuse-tokens-not-values` | `padding: 16px` in a project with `--space-4: 16px` | `padding: var(--space-4)` | `MEDIUM` |
| `reuse-no-local-restyle` | `.menu { border-radius: 6px }` beside the shared `Menu` | `Menu` as shipped, with `margin-top` only where the layout needs it | `MEDIUM` |
| `reuse-one-standard` | Three dropdown styles on three screens | One `Menu` | `MEDIUM` |
| `reuse-fix-in-the-primitive` | A scroll fade added at five call sites | The fade inside `ScrollArea` | `MEDIUM` |
| `reuse-sweep-siblings` | The fade moved into `ScrollArea`, four local copies left unmentioned | "Four call sites still add their own fade, listed below. Remove them?" | `MEDIUM` |
| `reuse-library-before-custom` | A hand-written relative date formatter | `Intl.RelativeTimeFormat` | `MEDIUM` |
| `reuse-one-library-per-job` | `dayjs` installed beside `date-fns` | The formatter `date-fns` already ships | `MEDIUM` |
| `reuse-confirm-the-package` | `npm install` of a name typed from memory | The name copied from the library's docs, `npm view` showing its repository | `HIGH` |
| `reuse-no-stale-dependency` | A package installed whose repository is archived | Its pattern ported into the project | `LOW` |
| `reuse-read-the-docs` | `render={<button />}` on a trigger that is already a button | The prop the docs for the installed version describe, or none | `MEDIUM` |
| `reuse-icon-set-native-size` | An `18px` icon at `width: 12px` | The `12px` icon from the set | `MEDIUM` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Mark every check you could not run as `Not verified`.
