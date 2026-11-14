---
name: babel
description: Renders the running app in a pseudo-locale, German, Arabic and Japanese, then fixes clipped text, unmirrored icons, physical CSS properties and broken line breaks.
---

# Babel

This skill renders each screen in four locales and measures what breaks. It fixes the cause in the shared styles and proves each fix with a second render and the same measurements.

## Four locales rendered, none imagined

The locales are exact: the pseudo-locale, German, Arabic and Japanese. Run it after any new screen or string, and whenever the user mentions translating, right to left, German, Arabic, Japanese or i18n. A layout judged from English alone is `babel-use-the-four-locales`.

Widths belong to `viewports`. Number, date and plural formats belong to `defaults`, and a failure there cites `defaults-locale-format`. The English wording of a label belongs to `copy`. Opening the result belongs to `verify`.

## 1. Name the screens

List each screen and the strings it shows. Test the screens the user named and every screen that shares their components. A screen left out is `babel-name-the-screens`.

## 2. Set the four locales

Switch locale through the project's own switch, with the app's real translations. Where a locale has none, translate the screen's strings for the check and mark the wording `Not verified`.

| Locale | Tag | Direction | What it finds |
| --- | --- | --- | --- |
| Pseudo | `en-XA` | left to right | Each string accented, 40% longer and in brackets. Clipping, and any string with no brackets |
| German | `de` | left to right | Long compound words and long labels |
| Arabic | `ar` | right to left | Mirroring, wrong-side spacing and icons |
| Japanese | `ja` | left to right | No spaces between words, so the line breaks come from the rules |

`pseudo()` in [probe.js](probe.js) returns the pseudo form of a string. Add it to the project's switch only in development.

Set `lang` and `dir` on `<html>` from the locale. A page flipped with `transform: scaleX(-1)`, or `dir` on one container, is `babel-set-lang-and-dir`.

Text in the pseudo-locale with no brackets never went through the catalogue. A string written into the markup is `babel-no-hardcoded-strings`.

## 3. Render and read the probe

Render each screen in each locale at the screen's usual width and take a screenshot. Run [probe.js](probe.js) through the browser's evaluate call after the page settles, then call `window.__babel.scan()`. Call `window.__babel.highlight()` before the screenshot, so the findings are outlined.

The scan returns `overflow`, `physical`, `icons`, `lines` and `hardCoded`, each with a count. Treat each result as a candidate until a screenshot shows it. A verdict with no scan is not finished.

## 4. Text grows

Text is never cut by its box and never spills out of it. The overflow count is 0 in every locale. A button label cut in half in German is `babel-no-clipped-text`, and so is a name ended with an ellipsis that hides the meaning.

The cause is a size the text did not set. A `width: 64px` button, a `height: 40px` field or `white-space: nowrap` on a label is `babel-let-text-grow`. Use `min-inline-size` and `min-block-size` with `padding-inline`, and `flex: none` so the button is not squeezed.

## 5. Mirror the direction

The page reads from the other side in Arabic. Spacing, borders, positions, alignment and floats follow the writing direction, so they use logical properties. `margin-left`, `padding-right`, `left`, `text-align: left` and `float: right` are `babel-logical-properties`. The scan lists each rule.

A four-value `margin` or `padding` whose left and right differ is physical too. Write `margin-inline` and `margin-block`. A `translateX` that slides a knob or a drawer needs the sign flipped, or a logical inset instead.

Icons that point somewhere face the other way: arrows, chevrons, back and forward, undo, reply and progress. A back arrow that still points left in Arabic is `babel-mirror-directional-icons`. Mirror it with `:dir(rtl)` and `scaleX(-1)`.

Icons that show a real thing or a mark do not mirror: check marks, locks, clocks, logos and media controls. A check mark that flips is `babel-keep-real-things-unmirrored`.

## 6. Break the lines

Japanese has no spaces, so the browser breaks by rule. Set `line-break: strict`, and on `:lang(ja)` set `word-break: auto-phrase`, so lines break between phrases. A line that opens on `、`, `。`, a closing bracket or a small kana is `babel-cjk-line-breaks`. The scan names the character.

A Latin word or brand inside a sentence stays whole. `word-break: break-all` cuts `Harbour` into `Harb` and `our`. Use `overflow-wrap: break-word`, and that is `babel-keep-words-whole`.

## 7. Fix and prove it

Fix the shared component or style the screens use. Render the same screens in the same four locales again and run the same scan. Return a grid of two rows by four columns, one tile per screen and locale, with the overflow count on each tile. A fix reported without the second render is `babel-before-and-after`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `babel-use-the-four-locales` | "It is only a few words, so German will fit" | Pseudo, German, Arabic and Japanese rendered and scanned |
| `babel-name-the-screens` | Checkout tested, settings skipped | Every screen that shares the component, in all four |
| `babel-set-lang-and-dir` | `<html>` with no `dir`, or `scaleX(-1)` on `body` | `<html lang="ar" dir="rtl">` from the locale |
| `babel-no-hardcoded-strings` | `<p>Free returns</p>` with no brackets in the pseudo-locale | `t("returns")` |
| `babel-no-clipped-text` | `Änderungen speichern` cut to `Änderungen sp` | The full label, overflow count 0 |
| `babel-let-text-grow` | `width: 104px; white-space: nowrap` | `min-inline-size: 104px; padding-inline: 16px; flex: none` |
| `babel-logical-properties` | `margin-left: 6px; text-align: left` | `margin-inline-start: 6px; text-align: start` |
| `babel-mirror-directional-icons` | A back arrow pointing left in Arabic | `:dir(rtl) .icon-back { transform: scaleX(-1) }` |
| `babel-keep-real-things-unmirrored` | `scaleX(-1)` on every icon in `dir="rtl"` | The check mark and the lock left as drawn |
| `babel-cjk-line-breaks` | A Japanese line opening on `、` with `line-break: anywhere` | `line-break: strict` and `word-break: auto-phrase` on `:lang(ja)` |
| `babel-keep-words-whole` | `word-break: break-all` cutting `Harbour` | `overflow-wrap: break-word` |
| `babel-before-and-after` | "Should hold up in German now" | The 2 by 4 grid before and after, with overflow counts |

## Reporting

**Severity.** `HIGH` is text cut or hidden in a locale, a control that cannot be read or pressed, or a screen that reads in the wrong direction. It is also a string that never reached the catalogue. `MEDIUM` is spacing on the wrong side, an unmirrored arrow, a mirrored mark, a line that opens on closing punctuation or a word cut in half. `LOW` is a fix with no second render.

**Format.** One finding per root cause, with the locale and the measured value:

```
1. file:line - [rule-id] locale, screen, what is wrong (measured value)
```

Cite the element's selector when the source line is not found. Then a `Rule | Count | Severity` summary and the overflow count per locale before and after. `Block` when any `HIGH` remains, `Approve` otherwise. Mark wording you translated yourself as `Not verified`.
