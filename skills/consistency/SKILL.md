---
name: consistency
description: Compares peer controls within a screen and across related screens, then flags a size, radius, spacing or placement that left its family.
disable-model-invocation: true
---

# Consistency

This skill compares controls that share a role and flags the ones that left their family. It grades each finding as observed, inferred or confirmed in the DOM.

## Families, not a single size

Peers share one component and one variant. A primary button is not a peer of a ghost button, and a page title is not a peer of a row title. Height, padding, gap, radius, font size, font weight and icon box are the metrics. A difference of 1px or less is ignored. A shared edge or an ink miss of 1–4px stays with `alignment`.

Pixel edges, ink centring, optical glyphs and stroke weight belong to `alignment`. The primitive and the sibling sweep belong to `reuse`. Contrast belongs to `color`. Labels belong to `copy`. Widths belong to `viewports`. The key walk belongs to `keyboard`. Opening the result belongs to `verify`.

## 1. Name the screens

Name the screen in view and each related screen that uses the same families. A single crop is still in scope. Leaving out a named related screen is `consistency-related-screens`.

## 2. Read the family

Read the project's components, variants and tokens before judging. Record each family with its variant and the token for each metric. Starting from taste while the tokens sit unread is `consistency-read-the-family`. With only a screenshot, the dominant peer stands in for the token and that value is inferred.

## 3. Grade the evidence

Mark each finding Observed, Inferred or DOM-confirmed. Observed means the pixels show it. Inferred means the family was guessed. DOM-confirmed means a computed style or a token in source. A screenshot finding marked DOM-confirmed is `consistency-grade-the-evidence`.

## 4. Measure the peers

When the page runs, set `window.__consistencyOptions` and run [peers.js](peers.js) through the browser's evaluate call. Pass `families` from step 2. The script groups each selector, compares the metrics with the token or the majority and returns candidates. Confirm each candidate in the screenshot before reporting it.

A named variant grouped with another variant is `consistency-variant-is-not-a-peer`. A peer whose height, padding, gap, radius, type or icon box leaves the family is `consistency-peer-metric`.

Sibling pane headers and the body under them that miss a shared edge by more than 4px are `consistency-pane-edge`. A repeated control that sits on the other side of its row is `consistency-misplaced-slot`.

## 5. Compare the related screens

Pass the first screen's `families` back as `baseline` on the next screen. The same variant with a different family value on that screen is `consistency-across-screens`. Members that agree with each other but not with the baseline are one cross-screen finding, not a local outlier.

## 6. Number the findings

One number per root cause. Metrics that come from one override share a number. State the family value, the outlier and the grade. A note with no number and no grade is `consistency-numbered-findings`.

When the input is a screenshot, stop at the annotated diagnosis. Do not invent a source line, and do not claim the DOM confirmed it.

## 7. Fix the family when asked

The report is the deliverable. When the user asks for a fix, change the shared component or the token the family already uses. A local override on the odd control is `consistency-fix-the-family`. A new scale, chosen while the project has one, is `consistency-use-the-scale`.

Rerun the script and the screenshot. Hand any remaining 1–4px miss to `alignment`, contrast to `color`, the key walk to `keyboard` and the widths to `viewports`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `consistency-related-screens` | The settings screen left out of the pass | Library and Settings, same Button family |
| `consistency-read-the-family` | "These buttons feel inconsistent" | Button radius token is 8px and primary is its own variant |
| `consistency-grade-the-evidence` | A screenshot finding marked DOM-confirmed | Graded Observed, with no source line claimed |
| `consistency-variant-is-not-a-peer` | A 40px primary flagged beside a 32px ghost | Primary compared with primary only |
| `consistency-peer-metric` | One Button at radius 0 beside three at 8px | That Button uses the 8px radius token |
| `consistency-pane-edge` | Header text 12px right of the rows under it | Header and rows share one content edge |
| `consistency-misplaced-slot` | One row action on the left, the rest on the right | The action in the same slot on every row |
| `consistency-across-screens` | Settings Button radius 12px and Library 8px | Both screens use the 8px radius token |
| `consistency-numbered-findings` | "Spacing looks off" | Finding 2, padding 20px against 12px, DOM-confirmed |
| `consistency-fix-the-family` | `style="border-radius: 8px"` on the odd button | The radius edited on Button |
| `consistency-use-the-scale` | A new 10px radius written for one screen | The project's 8px radius token |

## Reporting

**Severity.** `HIGH` is a radius or a size that disagrees on a primary control, or a pane edge that misses by more than 4px on a primary column. `MEDIUM` is padding, gap, type, an icon box or a misplaced slot. `LOW` is drift on a secondary screen, or a finding graded only Inferred.

**Format.** One finding per root cause, numbered:

```
1. file:line - [rule-id] what is wrong (measured values) [DOM-confirmed]
1. screenshot - [rule-id] what is wrong (measured values) [Observed]
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every screen you could not open as `Not verified`.
