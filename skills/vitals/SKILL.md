---
name: vitals
description: Records a cold page load on a throttled network and CPU, names what delays the largest paint or shifts the layout, then proves the fix with a second recording.
disable-model-invocation: true
---

# Vitals

This skill measures how a page loads. It records a cold load on a throttled network and CPU, traces each slow paint and shift to its cause and proves the fix.

## A cold recording, never a warm guess

The budgets are exact and measured at the throttle on a cold load. The largest contentful paint (LCP) lands under 2.5s and cumulative layout shift (CLS) stays under 0.1. Interaction to next paint (INP) stays under 200ms. "Loads fast for me" with no numbers is a finding. Run it on any page a visitor lands on, after any change to what that page loads first.

Frame budgets during motion and the response to each interaction belong to `frames`. Skeletons and loading delays belong to `defaults`. What a missing image shows belongs to `states`. Opening the running result belongs to `verify`.

## 1. Throttle a cold load

Name the route and the viewport, 375×812 with touch unless the user names another. Through the browser's emulation calls, throttle the CPU 4× and the network to a 150ms round trip, 1.6Mbps down and 750kbps up. Disable the cache, unregister service workers and clear storage before each load. A load on a warm cache or an unthrottled connection is `vitals-cold-load`.

## 2. Record three loads

Load the page, touch nothing and wait 5s after the load event. Run [vitals.js](vitals.js) through the browser's evaluate call and await its result. Repeat for three cold loads and report the median of each number. When a long task names no script, record a full performance profile of one load too. Reporting load speed without a recording is `vitals-recording-not-feel`.

## 3. Read the budget

Compare the medians against the budgets. An LCP at or over 2.5s, or a CLS at or over 0.1, is `vitals-hold-the-budget`. Name where the LCP time went: time to first byte, load delay, load duration or render delay. The script lists interactions only when one happened, and tracing a slow one belongs to `frames`.

## 4. Find the cause

Read the LCP element, the sources of each shift and the scripts of each long task, then the code they point to.

The LCP image loads first. It takes `fetchpriority="high"` and never `loading="lazy"`. At most two images on a page take high priority. A hero with `loading="lazy"`, or high priority on every card, is `vitals-lcp-priority`. An LCP image set as a CSS background is found late, so move it into an `<img>`.

Every image and video sets `width` and `height`, or an `aspect-ratio`, so its box exists before it loads. A bare `<video>` lays out at 300 by 150 until its metadata arrives. An `<img>` or `<video>` with neither is `vitals-size-media`.

An animated demo is a `<video autoplay muted loop playsinline poster="demo.jpg">`, never an animated GIF. A GIF screen recording as the hero is `vitals-video-not-gif`.

Nothing above content arrives late and pushes it down. Fonts, banners, cookie notices, embeds and ads reserve their space before they load. A web font swaps over a fallback face whose `size-adjust`, `ascent-override` and `descent-override` match it, or uses `font-display: optional`. A banner inserted above the header after load is `vitals-no-shift`.

Web fonts ship as `.woff2` only, subset to the characters the content uses and split by `unicode-range`. A `.ttf` or `.otf` file in `@font-face` is `vitals-woff2-subset`.

Below the fold, each section of a long page skips rendering until it nears the screen. Give it `content-visibility: auto` with `contain-intrinsic-size: auto none auto 150px`. Never set it above the fold, where the placeholder size shifts the first paint. A long feed rendered in full at load, or `content-visibility` on the hero, is `vitals-offscreen-visibility`.

A task over 200ms during load holds a tap until it ends, which alone misses the INP budget. Split it, defer it past the largest paint or load that code on demand. A 400ms hydration task before the hero paints is `vitals-split-long-tasks`.

## 5. Record the fix

Load again three times with the same route, viewport and throttle. Report both sets of medians side by side. "Should load faster now" is `vitals-before-and-after`. Clear the throttles when done.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `vitals-cold-load` | Measured on a warm cache over office wifi | Cold, cache off, 4× CPU and a 150ms round trip at 1.6Mbps |
| `vitals-recording-not-feel` | "The page loads fast" | "LCP 1.9s, CLS 0.02, longest task 140ms, median of three cold loads" |
| `vitals-hold-the-budget` | LCP 3.8s on the hero image | LCP 2.1s |
| `vitals-lcp-priority` | `<img loading="lazy">` on the hero | `<img fetchpriority="high">` on the hero alone |
| `vitals-size-media` | `<video src="demo.mp4">` | `<video src="demo.mp4" width="1280" height="720">` |
| `vitals-video-not-gif` | `<img src="demo.gif">` | `<video src="demo.mp4" autoplay muted loop playsinline poster="demo.jpg">` |
| `vitals-no-shift` | A promo banner inserted above the header after load | Its 48px reserved from the first paint |
| `vitals-woff2-subset` | `src: url("brand.ttf")` | `src: url("brand-latin.woff2") format("woff2")` with `unicode-range: U+0000-00FF` |
| `vitals-offscreen-visibility` | A 200-item feed rendered in full below the fold | `content-visibility: auto; contain-intrinsic-size: auto none auto 150px` on each feed section |
| `vitals-split-long-tasks` | A 400ms hydration task before the hero paints | The below-the-fold widgets loaded after the largest paint |
| `vitals-before-and-after` | "Should load faster now" | Before LCP 3.8s, after 2.1s, same throttle, three loads each |

## Reporting

**Severity.** `HIGH` is a budget missed at the throttle, or a report of load speed with no recording. `MEDIUM` is a lazy or late LCP image, unsized media, a late element that shifts content or a load task over 200ms. It is also a load recorded warm or unthrottled, an animated GIF or a font shipped as `.ttf`, `.otf` or unsubset. `LOW` is a long section rendered in full below the fold, `content-visibility` above it or more than two high-priority images. It is also a fix reported without a second recording.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (LCP, CLS, longest task, the element)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark a browser that reports no largest paint or layout shift entries as `Not verified` for those budgets.
