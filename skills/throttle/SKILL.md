---
name: throttle
description: Runs the real app on slow 3G, a flaky connection and offline, then fixes pending states, double submits, layout shift, font swaps and dead-end errors with a before and after for each.
---

# Throttle

This skill runs the real app on a bad network and fixes what breaks. It measures each flow under three profiles, repairs the cause and proves each repair with a second run.

## Three profiles, never the office wifi

The profiles are exact: slow 3G, a flaky connection and offline. Run it after any form, data fetch or route change, and whenever the user mentions slow, flaky or offline. A fast connection hides every bug here.

Widths belong to `viewports`. A slow CPU belongs to `frames`. Skeleton boxes and their cross-fade belong to `bones`. The busy button, the feedback delay and the skeleton delay belong to `defaults`. Opening the result belongs to `verify`.

## 1. Name the flows

List the first load and every trigger that waits on the network: each form, data fetch, upload and route change. Test the flows the user named and every sibling that shares their component. A flow left out is `throttle-name-the-flows`.

## 2. Set the profile

Set the profile through the browser's network emulation call, with the cache disabled. Clear it when the run ends. A run on the machine's own connection is `throttle-use-the-profiles`.

| Profile | Download | Upload | Latency | Also |
| --- | --- | --- | --- | --- |
| Slow 3G | 400 kbit/s | 400 kbit/s | 400ms | |
| Flaky | 1.6 Mbit/s | 750 kbit/s | 150ms | Abort one API request in three with a connection reset |
| Offline | none | none | none | The offline flag set |

Run [probe.js](probe.js) as an init script, so it is in place before the page loads. Call `window.__throttle.start()` before each flow and `window.__throttle.stop()` after it. A verdict with no probe output is `throttle-read-the-probe`.

## 3. Load the page cold

Load the route on slow 3G, take a screenshot at 1s and again as content arrives, then read `shifts` and `fontFaces`.

Content that arrives and pushes visible content moves the page under the reader. Total shift stays under 0.1 and no single shift passes 0.02. An image with no `width` and `height` that moves the footer by 80px is `throttle-reserve-the-space`. The skeleton itself belongs to `bones`.

Text never disappears while a font loads. A face with `font-display: block`, `auto` or no value hides the heading for up to 3s. That is `throttle-no-invisible-text`. Use `swap`, and preload the face used above the fold.

A swap that moves text needs a fallback with the same metrics. A face with no `size-adjust` or `ascent-override` that re-wraps the heading when it lands is `throttle-match-the-fallback`. Take the values from the font file's width and `hhea` metrics.

## 4. Press every trigger

Press each trigger on slow 3G, then read `presses` and `duplicates`.

A press changes something visible within 100ms. A button that shows nothing for 1.2s while its request runs is `throttle-acknowledge-the-press`. The label, spinner and disabled look belong to `defaults-loading-button`.

An action sends one request. Press twice, 250ms apart, and count. Two `POST /api/notes` for one note is `throttle-one-request-per-action`. Disable the control while the request runs and send an idempotency key the server honours.

## 5. Fail it

Run the flows on the flaky profile, then offline. Read `deadEnds` and the screen.

A failure says what happened. "Something went wrong" for a lost connection is `throttle-name-the-failure`. Offline, server error and timeout are three messages.

A failure offers a way out. A message with no button, link or automatic retry is `throttle-offer-a-way-out`. Repeat the request when the connection returns.

Work the user typed survives a failure. A field cleared before the request finished is `throttle-keep-the-work`.

## 6. Fix and prove it

Fix the shared component or fetch helper the flows use. Run the same steps on the same profile again and put each screenshot beside its before. "Should hold up now" is `throttle-before-and-after`. Clear the profile when done.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `throttle-name-the-flows` | Only the contact form tested | Contact form, feed, upload and the route change |
| `throttle-use-the-profiles` | Checked on the office connection | Slow 3G, flaky and offline, cache off |
| `throttle-read-the-probe` | "It copes with a slow network" | 2 duplicates, 0.10 shift, 1 dead end from the probe |
| `throttle-reserve-the-space` | `<img src="a.jpg">` that moves the footer by 80px | `<img src="a.jpg" width="640" height="420">` with `height: auto` |
| `throttle-no-invisible-text` | `font-display: block` | `font-display: swap` and a preload |
| `throttle-match-the-fallback` | Heading re-wraps when the font lands | A fallback face with `size-adjust` and `ascent-override` |
| `throttle-acknowledge-the-press` | Nothing changes for 1.2s after Send | Disabled with a spinner within 100ms |
| `throttle-one-request-per-action` | Two clicks, two `POST` requests | Disabled while pending, one request |
| `throttle-name-the-failure` | "Something went wrong" while offline | "You're offline. Your note is kept." |
| `throttle-offer-a-way-out` | An error with no control | An error with `Retry`, and a retry on reconnect |
| `throttle-keep-the-work` | Input cleared when Send is pressed | Input cleared when the server confirms |
| `throttle-before-and-after` | "Should hold up now" | Two screenshots per fix, same profile and steps |

## Reporting

**Severity.** `HIGH` is a duplicate request, a failure with no way out, typed work lost or a press with no response for over 1s. It is also text hidden while a font loads. `MEDIUM` is shift over the budget, a press that answers in 100ms to 1s, a fallback that moves text or a failure that names no cause. `LOW` is a fix with no second run or a profile left on.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (profile, measured value)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a flow you could not run on a profile as `Not verified`.
