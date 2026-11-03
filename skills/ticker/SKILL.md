---
name: ticker
description: Gives changing prices, counts, stats, totals and timers direction-aware rolling digits, and leaves static numbers still.
---

# Ticker

This skill puts direction-aware rolling digits on every number that changes. It keeps the locale's formatting and leaves static numbers as text.

## Only a changing number rolls

The three classes, the cutoff at 4 times a second and the part split are exact. Duration and easing come from `motion`. Tabular figures come from `defaults`.

Use it when the user wants numbers, prices, counters, stats, totals or timers to animate, roll or tick, or a pricing toggle or a dashboard to feel alive.

Which numbers the screen should show belongs to `scope`. Whether a number should move at all belongs to `restraint`. Labels belong to `copy`. The slowed recording belongs to `clip`.

## 1. Find numbers rendered from state

Search the render output for numbers that come from state, props, `toFixed`, a currency string, a timer, a chart label or a badge. A literal in the markup is static. Wrapping a literal is `ticker-skip-static`.

## 2. Classify each one

Roll a value the user changes or watches, such as a cart total, a price toggle or a live count.

Count once, and only then, when a stat is revealed on scroll and the count is the point of that moment. It rolls from 0 to its final digits once, on the small-state duration in `motion`, and does not replay. A page of counting stats, or a replay on the way back up, is `ticker-count-once`.

Leave an id, a date or any value that updates more than 4 times a second. A rolling order id or a 10Hz meter is `ticker-leave-still`.

## 3. Use the installed package, or parts

If `@number-flow/react` is already installed, render `NumberFlow` with the value, the locale and the `Intl` options. Set `spinTiming`, `transformTiming` and `opacityTiming` to the small-state duration and ease-out curve in `motion`, 200ms and `cubic-bezier(0.23, 1, 0.32, 1)`. Installing the package for this pass is `ticker-already-installed`.

Otherwise build the component in [recipes.md](recipes.md#digit-columns). Split the value with `Intl.NumberFormat.formatToParts`.

## 4. Roll with the value

A rising value rolls every column up, and a falling value rolls every column down, including a 9 that continues to 0 on the way up. A column that travels against the value is `ticker-with-the-value`.

Grouping marks, decimal marks, currency symbols and signs stay fixed. They do not sit in a rolling column. A formatted string animated as one piece, or a comma sitting in a digit column, is `ticker-affixes-fixed`.

Digits use tabular figures. A column whose width jitters cites `defaults-tabular-numbers`.

Cache one `Intl.NumberFormat` per locale and option set. Building one on each change is `ticker-one-formatter`. The format itself cites `defaults-locale-format`.

## 5. Retarget, then match the width

A value that arrives mid-roll retargets the columns. A queue that plays the old target first cites `motion-transitions-for-state`.

Name `transform` and the width property, and nothing else. `transition: all` cites `motion-name-the-properties`.

A roll longer than the small-state duration cites `motion-under-300ms`. A bare `ease-out` cites `motion-strong-ease-out`.

When the digit count changes, the row width animates on that same duration and curve. A jump from `€12` to `€120` is `ticker-ease-width`. When an outer box has to follow that width, measure the inner element the way `motion-measure-inner` describes.

## 6. Announce the final value

The columns are `aria-hidden`. Mount a polite `role="status"` region empty before its text changes, as `defaults-announce-updates` requires, then set the final formatted value. A live region on the rolling columns is `ticker-announce-final`.

## 7. Swap instantly when motion is reduced

When `prefers-reduced-motion: reduce` matches, the columns show the final digits with no travel. A roll that still runs is `ticker-instant-reduced`. The preference itself is `motion-reduced-motion`.

## 8. Hand back the wiring and the clip

Leave the component in the project, wired at each roll and count-once site. List every skipped number with the reason.

Record each change through `clip` at 0.25×. A full-speed glance as the only proof is `ticker-slow-each`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `ticker-skip-static` | `<Ticker value={24} />` around a literal day count | The literal `24` left as text |
| `ticker-count-once` | Every stat counting up again on scroll up | One revealed stat rolling from 0 once |
| `ticker-leave-still` | `<Ticker value={order.id} />` | The id as plain text |
| `ticker-already-installed` | `npm install @number-flow/react` when it is absent | The parts component in `recipes.md` |
| `ticker-with-the-value` | The ones digit rolling down as the total rises | The column rolling up, 8 through 0 to 6 |
| `ticker-affixes-fixed` | The string `€1,248` sliding as one piece | `€` and `,` fixed, each digit its own column |
| `ticker-one-formatter` | `new Intl.NumberFormat("en-IE")` inside render | One cached formatter for that locale and options |
| `ticker-ease-width` | `€120` replacing `€12` and jumping wider | The new column's width animating open |
| `ticker-announce-final` | `aria-live="polite"` on the rolling columns | `role="status"` set to the final `€120` |
| `ticker-instant-reduced` | Digits travelling under `prefers-reduced-motion` | The final digits with no transition |
| `ticker-slow-each` | One full-speed glance | Each change recorded through `clip` at 0.25× |

## Reporting

**Severity.** `HIGH` is a changing number whose final value is never exposed, so a screen reader hears nothing.

`MEDIUM` is a static literal, an id, a date or a value faster than 4 times a second inside the ticker. It is also a count-up that replays or spreads across the page. It is also a rolling affix, a column travelling against the value, a formatter built on each change or a width that jumps. It is also installing the package when it was absent, or a roll that still runs under reduced motion.

`LOW` is a change with no slowed recording.

**Format.** One finding per root cause:

```
file:line - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a file you did not read. Play each roll when a check depends on direction. Mark every number you could not classify as `Not verified`.
