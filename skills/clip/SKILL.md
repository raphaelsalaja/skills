---
name: clip
description: Records a real interaction in the running app as a looping clip with a smooth cursor and click zoom, with modes for before and after, variants, states, slow motion and themes, exported at X's sizes.
disable-model-invocation: true
---

# Clip

This skill records an interaction in the user's own running app as a short, seamless loop ready to post on X. It scripts a smooth cursor or records the user's own take from a studio bar in the page, then zooms lightly on each press and exports every size.

## Real pixels at exact sizes

Every frame comes from the real app running the real code. A mock-up, a rebuilt screen or an edited component standing in for the app is `clip-real-app`. When a moment cannot be recorded live, say so and leave it out. A staged stand-in is `clip-live-or-named`.

The sizes, rates, curves and limits here are exact. It runs on `/clip <target>` with at most one mode: `--compare`, `--variants`, `--states`, `--slow`, `--themes` or `--live`.

Cursor and zoom curves come from `motion`, and labels follow `copy`. Building the variants belongs to `prototype`. Reading timing values belongs to `deconstruct`. Opening the result belongs to `verify`, and keeping `clips/` out of commits belongs to `ship`.

## 1. Write the path

Name the route and write the interaction as one `path` function of clicks, hovers, typing and waits. Every recording of the clip runs that function unchanged. A path edited for one version, variant or theme is `clip-same-path`.

Wait with fixed durations only, so each step lands at the same moment in every tile. A path that waits on a selector or a response, letting one side drift, is `clip-shared-clock`.

End where the path started: close what it opened and undo what it changed. The recorder then returns the cursor to its start.

For `--live`, the user performs the path. Hand it to them as numbered steps, ending with the undo.

## 2. Open the real app

Find the running dev server from the terminals, the open ports or the `dev` script, and start it when none runs. Open the target route once and confirm it renders with real data.

An error overlay means the app is broken. The recorder stops when it sees one. Hiding it to record anyway is `clip-stop-on-errors`.

## 3. Load the shipped recorder

Copy [record.mjs](record.mjs), [cursor.js](cursor.js), [stage.html](stage.html) and [studio.js](studio.js) into `clips/.work/` at the project root. Write `clips/.work/scene.mjs` in the shape the header of `record.mjs` shows, then run it from the root with `node`.

The recorder imports the project's Playwright and names the install command when there is none. The cursor, the stage, the studio and the export ship with the skill, so write the scene only. A recorder, cursor or grid written from scratch is `clip-shipped-recorder`.

## 4. Frame the shot

With no frame, the clip fills the viewport. Set `frame` in the scene to a selector and its padding when the target is one element, such as `{ target: "#filters", padding: 48 }`.

When the user wants to choose the shot, load Studio: `cursor.js` then `studio.js`, in development only, as the header of `studio.js` shows. A Studio import that could reach production, or one left in once the clip is done, is `clip-studio-dev-only`.

The user frames the page, an element or a drawn area, then sets the ratio, padding, margin and style. Copy puts one `Clip frame: {...}` line on the clipboard. Paste its `frame` and `style` into the scene unchanged. Crop numbers guessed from a screenshot are `clip-copied-frame`.

`style` sets the white margin around the clip, the corner radius, the shadow, the cursor size, the click zoom and the page zoom. Its defaults fill the frame edge to edge at a `1.15` zoom.

## 5. Record at 2× with a smooth cursor

The recorder runs Chromium at `deviceScaleFactor: 2` with `--force-device-scale-factor=2`, because the screencast drops to 1× without the flag. A 1× capture is `clip-record-at-2x`. Each size records at its own viewport, such as 1280 by 720 for 16:9.

The drawn cursor follows the real pointer, so every hover and press on screen is the app's own. Move only through the cursor API. Playwright's own `click()` jumps the pointer, which is `clip-no-teleport`.

Each move takes `400ms` plus `0.5ms` per pixel, up to `900ms`, on the curve `motion` sets for movement on screen. A linear or guessed curve for the cursor or the zoom is `clip-motion-curve`.

Each press zooms to `1.15` over `450ms`, holds `600ms` and eases back over `450ms`. Presses closer together hold the zoom and pan between them. A zoom past `1.25`, or one that pumps between close presses, is `clip-zoom-lightly`. Modes hold the camera still so tiles line up.

The helper hides scrollbars, framework dev badges and the prototype switcher bar. A clip fills its frame with the app, or sits in a plain tile on the stage. A scrollbar, a dev badge or drawn browser chrome in frame is `clip-clean-frame`.

## 6. Cut a seamless loop

The recorder keeps `400ms` before the first move and cuts at the first frame matching the start. Both that frame and the one before it must match, to 1 in 10,000 pixels past 10 of 255 levels. A loop that jumps at the seam, or a cross-fade covering the jump, is `clip-seamless-loop`.

When no frame matches, the path left something open or the cursor away from home. Fix the path and record again. A live take needs only the app put back, since its cursor is drawn afterwards. Spinners and other ambient motion must complete whole cycles, which the recorder's `2.5s` tail allows for.

## 7. Run the mode

With no mode, record one tile in `single` mode.

**`--compare`** records the base and the working tree. The base is `HEAD` for uncommitted work, or the merge base with `main` on a branch. Check it out with `git worktree add` in a temporary directory, install from the lockfile and serve it on its own port. Export a `grid` labelled "Before" and "After", or a `split` for a wipe with its `divider` across the changed element. Remove the worktree afterwards.

**`--variants`** records each variant of a `prototype` page through its `?variant=` link, such as `?variant=inline-filters`, in the order the page lists them. Each tile takes its `data-variant` label, such as "Inline Filters".

**`--states`** records one component as Default, Hover, Loading, Empty, Error and Success. Reach each state through real input or a network route in the tile's `setup`: hold a request open, answer it empty or fail it. Set `frame` to the component. Each tile may take its own `path`. Never edit the component to force a state.

**`--slow`** plays the path in `sequence` mode at 1× and then at 0.25×, badged "1×" and "0.25×". The slow pass runs the app's own clocks at quarter speed, so every frame is real. Stretching the 1× capture instead is `clip-slow-live`.

Pin each animated property in the slow pass as a note: its Title Case name, from, to, duration and curve. Read them from the source. An estimated value is `clip-values-from-source`. Keep the 1× pass under 3 seconds, one interaction, so both passes fit in 15.

**`--themes`** records the path in light and dark, through `colorScheme` or the app's own theme setting in `setup`. Export a `grid` labelled "Light" and "Dark", or a `split` with `sweep: true`. The divider then sweeps across mid-loop and back before the seam.

**`--live`** records the user's own take, for input a script cannot reach: a real drag, a signed-in session or the feel of their hand. Load Studio as in step 4 and frame the shot.

Start the receiver with `node clips/.work/record.mjs receive --name <name>`. The user presses Record or `⌥⇧R`, shares this tab, performs the path and stops. Each take exports as it arrives.

Studio captures the tab cropped to the frame, with no browser chrome or system cursor. A screen recording of the whole display is `clip-live-tab-capture`. On a 1× display the take records at 1×, so record on a Retina screen. A 16:9 frame under 960 pixels wide upscales to reach 1920.

Studio logs the pointer instead of drawing it. The recorder draws the cursor afterwards along that path, smoothed by a spring and eased home before the seam. The user never has to steady their hand or return the pointer.

Reloading the tab ends the capture. For a take that opens on the first paint, set Start to On Reload in Studio's settings. The page then loads fresh in a frame over itself, and the take exports without a loop.

When no receiver runs, the take and its JSON download. Export them with `node clips/.work/record.mjs take <file>`. Add `--no-loop` only when the user accepts a clip that does not loop.

A live take is one tile, because two hands never run the same path. Compare, variants, states and themes use the scripted path.

## 8. Export at X's sizes

The recorder writes H.264 High MP4 at 60fps to `clips/`, at 1920 by 1080, 1080 by 1080 and 1080 by 1350 by default. Set `aspects` for 1080 by 1920 or 1440 by 1080, or `"free"` for the frame's own shape.

Beside each it writes a GIF within X's limits: 1280 by 1080, 350 frames, 300 million pixels and 15MB. GIFs export at up to 30fps, such as 1280 by 720 and 864 by 1080.

A file past a limit is `clip-x-sizes`. A loop longer than 15 seconds is `clip-under-15s`.

Tile labels are one or two words in Title Case, set by `copy`. "before" or "Variant 1" is `clip-label-tiles`. The stage is pure white `#FFFFFF`, with tiles set off by a hairline and a soft shadow. A cream, tinted or brand-grey stage is `clip-white-stage`.

## 9. Report the files

List every exported file with its size, then the loop length and anything not recorded. End with one suggested caption for the post: one plain line, no em dash, no hashtags. "Saved to clips/" alone is `clip-report-files`.

Once the user is done with the clip, delete `clips/.work/` and remove the Studio import.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `clip-real-app` | A Figma frame animated to look like the app | The running app at `localhost:3000/inbox` |
| `clip-live-or-named` | An error state painted onto a screenshot | "Not recorded: Error, the form has no failing path" |
| `clip-stop-on-errors` | The Next.js error overlay hidden to finish the take | Recording stopped and the error reported |
| `clip-same-path` | The After path skipping the slow menu | One `path` run unchanged on both |
| `clip-shared-clock` | `await page.waitForSelector(".menu")` in the path | `await cursor.wait(900)` |
| `clip-shipped-recorder` | A screen recorder written from scratch | `record.mjs` copied, only `scene.mjs` written |
| `clip-studio-dev-only` | `import "./studio.js"` left in the root layout | Imported behind `NODE_ENV === "development"`, removed after |
| `clip-copied-frame` | `crop=900:500:200:120` read off a screenshot | `frame` and `style` pasted from Studio's Copy |
| `clip-live-tab-capture` | A QuickTime recording of the whole display | Studio's Record on this tab, cropped to the frame |
| `clip-record-at-2x` | Frames captured at 1280 by 720 | 2560 by 1440 with `--force-device-scale-factor=2` |
| `clip-no-teleport` | `page.locator("button").click()` | `cursor.click("button")` |
| `clip-motion-curve` | The cursor gliding on `linear` | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `clip-zoom-lightly` | A `2×` punch-in on every press | `1.15`, held across close presses |
| `clip-clean-frame` | The Next.js dev badge in the corner | Badges and scrollbars hidden by `cursor.js` |
| `clip-seamless-loop` | The menu snapping shut at the seam | The path closes it, last frame matches the first |
| `clip-slow-live` | `setpts=4*PTS` on the 1× capture | The page played at `rate: 0.25` |
| `clip-values-from-source` | "Scale about 0.9, roughly 300ms" | "Scale 0.95 to 1, 200ms, Ease Out" from the source |
| `clip-x-sizes` | A 1920 by 1080 GIF at 41MB | 1280 by 720 at 30fps, under 15MB |
| `clip-under-15s` | A 34-second walkthrough | One interaction in 6 seconds |
| `clip-label-tiles` | `variant_a` and `before` | `Inline Filters` and `Before` |
| `clip-white-stage` | Tiles on the brand's `#F5F3EE` | Tiles on `#FFFFFF` with a hairline |
| `clip-report-files` | "Saved to clips/" | Each file with its size and a caption |

## Reporting

**Severity.** `HIGH` is a mock-up or staged state in place of the real app, a hidden error overlay or a comparison whose sides ran different paths. `MEDIUM` is a teleporting cursor, a visible seam, a 1× capture or a dev badge or scrollbar in frame. It is also a stretched slow pass, an estimated value, tiles off the shared clock, a file past X's limits or a hand-written recorder. So are a Studio import that could ship and a whole-display recording. `LOW` is a deep or pumping zoom, an off-curve cursor, a guessed crop or a loop over 15 seconds. It is also a label breaking `copy`, a tinted stage or a report without sizes or caption.

**Format.** One finding per root cause, citing the clip or the request when no source line applies:

```
clips/menu-16x9.mp4 - [rule-id] what is wrong
request 1 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Never `Approve` a clip you did not play. Mark every state or version you could not record as `Not verified`.
