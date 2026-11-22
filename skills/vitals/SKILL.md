---
name: vitals
description: Records a cold page load on a throttled network and CPU, names what delays the largest paint or shifts the layout, then proves the fix with a second recording.
disable-model-invocation: true
---

# Vitals

This skill measures how a page loads. It records a cold load on a throttled network and CPU, traces each slow paint and shift to its cause and proves the fix.

## A cold recording, never a warm guess

The budgets are exact and measured at the throttle on a cold load. The largest contentful paint (LCP) lands at or under 2.5s and cumulative layout shift (CLS) stays at or under 0.1. Interaction to next paint (INP) stays at or under 200ms. Field data judges the same numbers at the 75th percentile of real visits, so report that beside the lab medians when the project has it. "Loads fast for me" with no numbers is a finding. Run it on any page a visitor lands on, after any change to what that page loads first.

Frame budgets during motion and the response to each interaction belong to `frames`. Skeletons and loading delays belong to `defaults`. What a missing image shows belongs to `states`. Opening the running result belongs to `verify`.

## 1. Throttle a cold load

Load a production build or a preview deployment, never the development server, whose unbundled modules and overlays inflate every number. [vitals.js](vitals.js) returns `devServer: true` when it finds development scripts. A recording from the development server is `vitals-production-build`.

Name the route and the viewport, 375×812 with touch unless the user names another. Throttle the CPU with `Emulation.setCPUThrottlingRate` at `{ rate: 4 }`. When DevTools holds a calibrated mid-tier mobile preset, use its CPU rate instead and name it.

Throttle the network with `Network.emulateNetworkConditions` at 562.5ms latency, 1474.56kbps down and 675kbps up. Those are the DevTools equivalent of the 150ms, 1.6Mbps simulated profile, because DevTools adds its latency to every request. The call takes bytes per second, so pass `downloadThroughput: 188744` and `uploadThroughput: 86400`.

Open each load in a fresh browser context, such as Playwright's `browser.newContext()`, with `Network.setCacheDisabled` on. The browser tool can refuse to clear storage or unregister service workers, and a new context needs neither. A load on a warm cache or an unthrottled connection is `vitals-cold-load`.

## 2. Record three loads

Load the page, touch nothing and wait 5s after the load event. Pass the contents of [vitals.js](vitals.js) to `page.evaluate`, or to `Runtime.evaluate` with `awaitPromise: true`. Repeat for three cold loads and report the median of each number. When a long task names no script, record a full performance profile of one load too. Reporting load speed without a recording is `vitals-recording-not-feel`.

## 3. Read the budget

Compare the medians against the budgets. An LCP over 2.5s, or a CLS over 0.1, is `vitals-hold-the-budget`. Name where the LCP time went: time to first byte, load delay, load duration or render delay.

Load delay and render delay each stay under 10% of the LCP, because the image should start loading at once and paint as it arrives. An LCP of 2.3s with 900ms of render delay is `vitals-lcp-breakdown`. The script lists interactions only when one happened, and tracing a slow one belongs to `frames`.

## 4. Find the cause

Read the LCP element, the sources of each shift and the scripts of each long task, then the code they point to.

The LCP image loads first. It takes `fetchpriority="high"` and never `loading="lazy"`. At most two images on a page take high priority. A hero with `loading="lazy"`, or high priority on every card, is `vitals-lcp-priority`. An LCP image set as a CSS background is found late, so move it into an `<img>`.

The script's `renderBlocking` lists every script and stylesheet the first paint waited for, from each resource's `renderBlockingStatus`. A `<script src>` in the `<head>` without `defer`, `async` or `type="module"` stops the parser. A synchronous analytics tag above the stylesheet is `vitals-no-render-blocking`. A stylesheet there is a finding only when the first screen does not need it.

An image file is no wider than 1.5 times its drawn width times the device pixel ratio. Serve it from `srcset` with `sizes`, as AVIF or WebP, and find the rest under `media.oversized`. A 2400px JPEG drawn 400px wide on a 2x phone is `vitals-right-size-images`.

Every image and video sets `width` and `height`, an `aspect-ratio` or a CSS size that holds without the file. A bare `<video>` lays out at 300 by 150 until its metadata arrives. An `<img>` or `<video>` that `media.unsized` names is `vitals-size-media`. The script skips one that CSS sizes, such as an `<Image fill>` in a sized parent.

An animated demo is a `<video autoplay muted loop playsinline poster="demo.jpg">`, never an animated GIF. A GIF screen recording as the hero is `vitals-video-not-gif`.

Nothing above content arrives late and pushes it down. Fonts, banners, cookie notices, embeds and ads reserve their space before they load. A web font swaps over a fallback face whose `size-adjust`, `ascent-override` and `descent-override` match it, or uses `font-display: optional`. A banner inserted above the header after load is `vitals-no-shift`.

Web fonts ship as `.woff2` only, subset to the characters the content uses and split by `unicode-range`. The script's `fonts` includes preloaded ones, as `next/font` serves them. A `.ttf` or `.otf` file in `@font-face` is `vitals-woff2-subset`.

Below the fold, each section of a long page skips rendering until it nears the screen. Give it `content-visibility: auto` with `contain-intrinsic-size: auto none auto 150px`. Never set it above the fold, where the placeholder size shifts the first paint. A long feed rendered in full at load, or `content-visibility` on the hero, is `vitals-offscreen-visibility`.

A task over 200ms during load holds a tap until it ends, which alone misses the INP budget. A 400ms hydration task before the hero paints is `vitals-split-long-tasks`. The script's `longTasks.blocking` sums each frame's blocking time and is not Total Blocking Time.

## 5. Go back

Open a second page from this one, press Back and run [vitals.js](vitals.js) again. A page restored from the back/forward cache still reads `navigation: "navigate"`. A `back_forward` reading means it reloaded, and `notRestoredReasons` says why. An `unload` listener, or `Cache-Control: no-store` on a page with nothing private, is `vitals-bfcache`.

## 6. Record the fix

Load again three times with the same route, viewport and throttle. Report both sets of medians side by side. "Should load faster now" is `vitals-before-and-after`. Clear the throttles when done.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement | Severity |
| --- | --- | --- | --- |
| `vitals-production-build` | LCP 6.2s read from the development server | The same route on a preview deployment, `devServer: false` | `MEDIUM` |
| `vitals-cold-load` | Measured on a warm cache over office wifi | A fresh context, cache off, 4× CPU and 562.5ms latency at 1474.56kbps | `MEDIUM` |
| `vitals-recording-not-feel` | "The page loads fast" | "LCP 1.9s, CLS 0.02, longest task 140ms, median of three cold loads" | `HIGH` |
| `vitals-hold-the-budget` | LCP 3.8s on the hero image | LCP 2.1s | `HIGH` |
| `vitals-lcp-breakdown` | LCP 2.3s, 900ms of it render delay behind a hydration task | Render delay 120ms, under 10% of the LCP | `LOW` |
| `vitals-lcp-priority` | `<img loading="lazy">` on the hero | `<img fetchpriority="high">` on the hero alone | `MEDIUM` |
| `vitals-no-render-blocking` | `<script src="/analytics.js">` in the `<head>` | `<script src="/analytics.js" defer>` | `MEDIUM` |
| `vitals-right-size-images` | A 2400px JPEG drawn 400px wide on a 2x phone | `srcset="hero-800.avif 800w, hero-1600.avif 1600w" sizes="100vw"` | `MEDIUM` |
| `vitals-size-media` | `<video src="demo.mp4">` | `<video src="demo.mp4" width="1280" height="720">` | `MEDIUM` |
| `vitals-video-not-gif` | `<img src="demo.gif">` | `<video src="demo.mp4" autoplay muted loop playsinline poster="demo.jpg">` | `MEDIUM` |
| `vitals-no-shift` | A promo banner inserted above the header after load | Its 48px reserved from the first paint | `MEDIUM` |
| `vitals-woff2-subset` | `src: url("brand.ttf")` | `src: url("brand-latin.woff2") format("woff2")` with `unicode-range: U+0000-00FF` | `MEDIUM` |
| `vitals-offscreen-visibility` | A 200-item feed rendered in full below the fold | `content-visibility: auto; contain-intrinsic-size: auto none auto 150px` on each feed section | `LOW` |
| `vitals-split-long-tasks` | A 400ms hydration task before the hero paints | The below-the-fold widgets loaded after the largest paint | `MEDIUM` |
| `vitals-bfcache` | `window.addEventListener("unload", save)` | `window.addEventListener("pagehide", save)` | `MEDIUM` |
| `vitals-before-and-after` | "Should load faster now" | Before LCP 3.8s, after 2.1s, same throttle, three loads each | `LOW` |

## Reporting

**Severity.** Each rule's level is in its pair row. `HIGH` breaks behaviour or loses work, `MEDIUM` is visible and inconsistent and `LOW` is polish. When two levels fit, take the higher one and say why. More than two high-priority images, with the LCP image still loading first, is `LOW`.

**Format.** One finding per root cause, with the measured numbers:

```
1. file:line - [rule-id] what is wrong (LCP, CLS, longest task, the element)
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Layout shift and long animation frame entries exist only in Chromium. Mark a recording from another engine `Not verified` for CLS and script attribution.
