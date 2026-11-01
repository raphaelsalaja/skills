/*
  Clip recorder. Copy this file, cursor.js, stage.html and studio.js into clips/.work/ at the project root, write the scene only
  and run it from the root.

    // clips/.work/scene.mjs
    import { clip } from "./record.mjs";

    await clip({
      name: "filter-menu",
      mode: "single",
      tiles: [{ url: "http://localhost:3000/inbox" }],
      path: async (cursor) => {
        await cursor.click("button:has-text('Filter')");
        await cursor.wait(900);
        await cursor.click("[role=menuitem]:has-text('Unread')");
        await cursor.wait(700);
        await cursor.press("Escape");
      },
    });

    node clips/.work/scene.mjs

  Modes:
    single     One tile, recorded once per size at that size's viewport, with the click zoom.
    grid       Two or more tiles on the white stage, each under its label. Every tile is recorded once at 1280 by 720.
    split      Two tiles in one frame with a divider, the first tile left of it. `divider` is its position from the left, 0.5 by default.
               Place it across the element that changed. With `sweep: true` it starts at the right edge, sweeps across mid-loop and back.
    sequence   Tiles played one after another, such as the 1× pass, then the 0.25× pass.

  Scene fields: { name, mode, tiles, path, aspects, frame, style, loop, sweep, divider }.
    aspects    Any of "16x9", "1x1", "4x5", "9x16" and "4x3". The first three by default. "free" keeps the frame's own shape.
    frame      { target, padding } frames one element: a selector, plus CSS pixels of page kept around it.
               { rect, padding, viewport } frames a drawn box instead. Studio's Copy writes either shape.
               Single and split expand the frame to each size's ratio. A grid measures it in the first tile and reuses it.
    style      { margin, radius, shadow, cursor, cursorScale, clickZoom, pageZoom }, the same fields Studio's bar and settings set.
               margin is white space around the clip at a 1080 short side: 0 fills the frame, 64 insets it on the stage.
               clickZoom 1 turns the zoom off. pageZoom scales the app itself, such as 1.25 for larger type.
    loop       false exports the take as recorded, with no seamless cut. True by default.

  Tile fields: { label, url, rate, colorScheme, setup, notes, badge, path }.
    label        Title Case, shown above the tile in a grid and as a corner chip in a split.
    rate         Plays the page at that speed through cursor.js. The path's durations stretch to match.
    colorScheme  "light" or "dark", for apps that follow the system theme.
    setup        async (context) => {} before the page loads, for network routes, storage or cookies.
                 Hold a request open with `context.route(url, () => {})`, which never answers. A timer in the handler keeps node running.
    notes        [{ target, lines }] pinned beside elements for the whole take.
    badge        One short corner badge, such as "0.25×".
    path         Replaces the scene's path for this tile. Only for states, where each tile reaches its own state.

  The cursor API inside `path`: glide(target), click(target), hover(target, ms), type(target, text), press(key),
  scroll(dy, ms), wait(ms) and mark(target). A target is a selector or { x, y } in CSS pixels. `cursor.page` is the
  Playwright page, for reading state only. Its own click() teleports the pointer, so press through the cursor API.

  Every tile runs the same `path` on the same timeline: fixed waits, never waits on the app. That is the shared clock.

  Live takes from Studio:
    node clips/.work/record.mjs receive --name filter-menu       Waits on port 4917 and exports each take as it arrives.
    node clips/.work/record.mjs take ~/Downloads/take-….mp4      Exports a downloaded take, with its .json beside it.
    Add --no-loop to either to keep a take that does not end where it started.

  Outputs land in clips/ as <name>-<aspect>.mp4 with a .gif beside each. Every run prints and returns each file with its size.
  Set CLIP_CHROMIUM to a Chromium path when the installed Playwright browser is missing.
*/

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve("clips");
const WORK = join(OUT, ".work");

const SIZES = {
  "16x9": { viewport: [1280, 720], video: [1920, 1080], gif: [1280, 720] },
  "1x1": { viewport: [720, 720], video: [1080, 1080], gif: [1080, 1080] },
  "4x5": { viewport: [720, 900], video: [1080, 1350], gif: [864, 1080] },
  "9x16": { viewport: [720, 1280], video: [1080, 1920], gif: [608, 1080] },
  "4x3": { viewport: [960, 720], video: [1440, 1080], gif: [1280, 960] },
};
const STYLE = { margin: 0, radius: 16, shadow: "soft", cursor: true, cursorScale: 1, clickZoom: 1.15, pageZoom: 1 };
const FPS = 60;
const LEAD = 0.4;
const REST = 600;
const TAIL = 2500;
const MATCH = 1e-4;
const LEVELS = 10;
const ZOOM = { in: 0.45, hold: 0.6, out: 0.45 };
const GIF = { frames: 350, pixels: 300e6, bytes: 15e6, fps: 30 };
const MOVE = [0.77, 0, 0.175, 1];
const CURSOR = { box: 32, tip: [5.5, 3.2], press: 0.95, pressTime: 0.12, stiffness: 26, home: 0.6 };

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const even = (value) => Math.round(value / 2) * 2;
const clamp = (value) => Math.min(1, Math.max(0, value));
const share = (fraction) => `${(fraction * 1e4).toFixed(1)} in 10,000`;

const bezier = ([x1, y1, x2, y2]) => (x) => {
  let low = 0;
  let high = 1;
  for (let step = 0; step < 32; step++) {
    const t = (low + high) / 2;
    const bx = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3;
    if (bx < x) low = t;
    else high = t;
  }
  const t = (low + high) / 2;
  return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3;
};
const ease = bezier(MOVE);
const easeOut = bezier([0.23, 1, 0.32, 1]);

const ffmpeg = (...args) =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const nearest = (aspect) =>
  Object.keys(SIZES).reduce((best, key) => {
    const [w, h] = SIZES[key].video;
    const [bw, bh] = SIZES[best].video;
    return Math.abs(Math.log(w / h / aspect)) < Math.abs(Math.log(bw / bh / aspect)) ? key : best;
  }, "16x9");

const launch = async () => {
  for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
    try {
      const { chromium } = await import(name);
      return chromium.launch({ executablePath: process.env.CLIP_CHROMIUM, args: ["--force-device-scale-factor=2"] });
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
    }
  }
  throw new Error("Playwright is not installed. Run `npm i --prefix clips/.work playwright && npx --prefix clips/.work playwright install chromium`.");
};

function frameRect(box, frame, [width, height], ratio) {
  const pad = frame.padding ?? 0;
  let w = box.width + pad * 2;
  let h = box.height + pad * 2;
  if (ratio) {
    if (w / h > ratio) h = w / ratio;
    else w = h * ratio;
  }
  const fit = Math.min(1, width / w, height / h);
  w *= fit;
  h *= fit;
  const x = Math.min(Math.max(0, box.x + box.width / 2 - w / 2), width - w);
  const y = Math.min(Math.max(0, box.y + box.height / 2 - h / 2), height - h);
  return { x: even(x * 2), y: even(y * 2), width: even(w * 2), height: even(h * 2) };
}

async function take(browser, tile, aspect, path, id, scene) {
  const { frame, style } = scene;
  const [width, height] = frame?.rect && frame.viewport ? frame.viewport : SIZES[aspect === "free" ? "16x9" : aspect].viewport;
  const rate = tile.rate ?? 1;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: tile.colorScheme ?? "light",
    reducedMotion: "no-preference",
  });
  await context.addInitScript({ path: join(here, "cursor.js") });
  if (tile.setup) await tile.setup(context);

  const page = await context.newPage();
  await page.goto(tile.url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  if (style.pageZoom !== 1) await page.evaluate((zoom) => (document.body.style.zoom = String(zoom)), style.pageZoom);
  const { errors } = await page.evaluate((options) => window.__clip.start(options), { cursor: style.cursor, scale: style.cursorScale });
  if (errors.length) throw new Error(`${tile.url} shows ${errors.join(" and ")}. Fix the app before recording.`);
  if (tile.badge) await page.evaluate((text) => window.__clip.badge(text), tile.badge);
  for (const note of tile.notes ?? []) {
    await page.evaluate(({ target, lines }) => void window.__clip.note(target, lines), note);
  }

  let rect = scene.rect ?? null;
  if (frame && !rect) {
    const box = frame.target ? await page.locator(frame.target).first().boundingBox() : frame.rect;
    if (!box) throw new Error(`Frame target ${frame.target} is not on the page.`);
    const ratio = scene.mode === "grid" || aspect === "free" ? 0 : SIZES[aspect].video[0] / SIZES[aspect].video[1];
    rect = frameRect(box, frame, [width, height], ratio);
  }

  const area = rect ? { x: rect.x / 2, y: rect.y / 2, width: rect.width / 2, height: rect.height / 2 } : { x: 0, y: 0, width, height };
  const home = { x: area.x + area.width * 0.62, y: area.y + area.height * 0.62 };
  let pointer = { ...home };
  await page.mouse.move(pointer.x, pointer.y);
  await sleep(300);

  const scale = 1 / rate;
  const locate = async (target) => {
    if (typeof target !== "string") return target;
    const box = await page.locator(target).first().boundingBox();
    if (!box) throw new Error(`Path target ${target} is not on the page in ${tile.label ?? tile.url}.`);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };
  const cursor = {
    page,
    async glide(target) {
      const to = await locate(target);
      const from = { ...pointer };
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const duration = Math.min(900, 400 + distance * 0.5) * scale;
      const start = Date.now();
      for (;;) {
        const progress = Math.min(1, (Date.now() - start) / duration);
        const eased = ease(progress);
        pointer = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
        await page.mouse.move(pointer.x, pointer.y);
        if (progress === 1) break;
        await sleep(8);
      }
    },
    async click(target) {
      await cursor.glide(target);
      await sleep(120 * scale);
      await page.mouse.down();
      await sleep(80 * scale);
      await page.mouse.up();
    },
    async hover(target, ms = 600) {
      await cursor.glide(target);
      await sleep(ms * scale);
    },
    async type(target, text) {
      await cursor.click(target);
      await page.keyboard.type(text, { delay: 70 * scale });
    },
    async press(key) {
      await page.keyboard.press(key);
    },
    async scroll(dy, ms = 600) {
      const duration = ms * scale;
      const start = Date.now();
      let sent = 0;
      for (;;) {
        const progress = Math.min(1, (Date.now() - start) / duration);
        const next = dy * ease(progress);
        await page.mouse.wheel(0, next - sent);
        sent = next;
        if (progress === 1) break;
        await sleep(16);
      }
    },
    async wait(ms) {
      await sleep(ms * scale);
    },
    async mark(target) {
      const point = await locate(target);
      await page.evaluate(({ x, y }) => window.__clip.mark(x, y), point);
    },
  };

  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = join(dir, `${String(frames.length).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: width * 2, maxHeight: height * 2 });
  await sleep(REST);

  if (rate !== 1) await page.evaluate((value) => window.__clip.rate(value), rate);
  const pathStart = await page.evaluate(() => window.__clip.now());
  await (tile.path ?? path)(cursor);
  await cursor.glide(home);
  const pathEnd = await page.evaluate(() => window.__clip.now());
  await sleep(TAIL * scale);

  await cdp.send("Page.stopScreencast");
  const events = await page.evaluate(() => window.__clip.events());
  await context.close();

  if (frames[0].t * 1000 > pathStart) throw new Error(`The screencast started late in ${id}.`);
  const lines = [];
  frames.forEach((frame, index) => {
    const next = frames[index + 1]?.t ?? frame.t + 1 / FPS;
    lines.push(`file '${frame.file}'`, `duration ${(next - frame.t).toFixed(6)}`);
  });
  lines.push(`file '${frames.at(-1).file}'`);
  writeFileSync(join(dir, "frames.txt"), lines.join("\n"));
  const file = join(WORK, `${id}.mp4`);
  ffmpeg("-f", "concat", "-safe", "0", "-i", join(dir, "frames.txt"), "-fps_mode", "cfr", "-r", `${FPS}`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-pix_fmt", "yuv420p", file);
  rmSync(dir, { recursive: true, force: true });

  const start = frames[0].t;
  return {
    id, file, aspect, width, height, pixelWidth: width * 2, pixelHeight: height * 2, rect, rate, start,
    pathStart: pathStart / 1000 - start, pathEnd: pathEnd / 1000 - start, events,
  };
}

function changedPixels(shot, frame) {
  const still = join(WORK, `${shot.id}-${frame}.png`);
  const crop = shot.rect ? `crop=${shot.rect.width}:${shot.rect.height}:${shot.rect.x}:${shot.rect.y},` : "";
  ffmpeg("-i", shot.file, "-vf", `select=eq(n\\,${frame}),${crop}format=gray`, "-frames:v", "1", still);
  const log = join(WORK, `${shot.id}-${frame}-diff.log`);
  ffmpeg("-i", shot.file, "-i", still, "-lavfi",
    `[0:v]${crop}format=gray[a];[1:v]format=gray[b];[a][b]blend=all_mode=difference,lut=y='if(gt(val,${LEVELS}),255,0)',signalstats,metadata=print:key=lavfi.signalstats.YAVG:file='${log}'`,
    "-f", "null", "-");
  return readFileSync(log, "utf8").match(/YAVG=[\d.]+/g).map((entry) => Number(entry.slice(5)) / 255);
}

function cut(shots, loop = true) {
  const prepared = shots.map((shot) => ({ ...shot, inFrame: Math.max(0, Math.round((shot.pathStart - LEAD) * FPS)) }));
  const changed = prepared.map((shot) => changedPixels(shot, shot.inFrame));
  const longest = Math.min(...prepared.map((shot, index) => changed[index].length - shot.inFrame - 1));
  if (!loop) return prepared.map((shot) => ({ ...shot, frames: longest, seam: null }));
  const shortest = Math.max(...prepared.map((shot) => Math.round(shot.pathEnd * FPS) - shot.inFrame));
  let best = { frames: 0, worst: Infinity };
  const before = prepared.map((shot, index) => (shot.inFrame > 0 ? changedPixels(shot, shot.inFrame - 1) : changed[index]));
  let last = longest;
  for (let frames = shortest; frames <= last; frames++) {
    const worst = Math.max(...prepared.map((shot, index) =>
      Math.max(changed[index][shot.inFrame + frames], before[index][shot.inFrame + frames - 1])));
    if (worst < best.worst) best = { frames, worst };
    if (worst < MATCH && last === longest) last = Math.min(longest, frames + Math.round(0.25 * FPS));
  }
  if (best.worst >= MATCH) {
    throw new Error(`No seamless loop: the best end frame still changes ${share(best.worst)} pixels. Return the app and the cursor to where they started, or pass loop: false, --no-loop for a live take.`);
  }
  return prepared.map((shot) => ({ ...shot, frames: best.frames, seam: best.worst }));
}

function zoomCommands(shot, [width, height], scale) {
  const offset = shot.inFrame / FPS;
  const duration = shot.frames / FPS;
  const ratio = shot.pixelWidth / shot.width;
  const area = shot.rect ?? { x: 0, y: 0, width: shot.pixelWidth, height: shot.pixelHeight };
  const points = shot.events
    .filter((event, index, all) => event.type === "down" || event.type === "mark" ||
      (event.type === "focus" && !all.some((other) => other.type === "down" && Math.abs(other.t - event.t) < 50)))
    .map((event) => ({
      t: event.t / 1000 - shot.start - offset,
      x: clamp((event.x * ratio - area.x) / area.width),
      y: clamp((event.y * ratio - area.y) / area.height),
    }))
    .filter((point) => point.t > ZOOM.in && point.t < duration - ZOOM.hold - ZOOM.out);

  const groups = [];
  for (const point of points) {
    const group = groups.at(-1);
    if (group && point.t - ZOOM.in < group.end + ZOOM.hold + ZOOM.out) {
      group.end = point.t;
      group.points.push(point);
    } else groups.push({ start: point.t, end: point.t, points: [point] });
  }

  const zoomAt = (t) => {
    let level = 0;
    for (const group of groups) {
      level += ease(clamp((t - group.start + ZOOM.in) / ZOOM.in)) - ease(clamp((t - group.end - ZOOM.hold) / ZOOM.out));
    }
    return 1 + (scale - 1) * level;
  };
  const focusAt = (t) => {
    let focus = points[0] ?? { x: 0.5, y: 0.5 };
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1];
      const to = points[index];
      const progress = ease(clamp((t - to.t + ZOOM.in) / ZOOM.in));
      if (progress === 0) break;
      focus = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
    }
    return focus;
  };

  const camera = [];
  for (let frame = 0; frame < shot.frames; frame++) {
    const t = frame / FPS;
    const level = scale > 1 ? zoomAt(t) : 1;
    const focus = focusAt(t);
    const w = even(width * level);
    const h = even(height * level);
    camera.push({ t, w, h, x: Math.round((w - width) * focus.x), y: Math.round((h - height) * focus.y) });
  }
  const file = join(WORK, `${shot.id}-zoom.cmd`);
  writeFileSync(file, camera.map(({ t, w, h, x, y }) =>
    `${t.toFixed(4)} scale@zoom w ${w}, scale@zoom h ${h}, crop@zoom x ${x}, crop@zoom y ${y};`).join("\n"));
  return { file, camera };
}

async function cursorPng(browser) {
  const file = join(WORK, "cursor.png");
  const arrow = readFileSync(join(here, "cursor.js"), "utf8").match(/const arrow = `([\s\S]*?)`;/)[1];
  const page = await browser.newPage({ viewport: { width: CURSOR.box, height: CURSOR.box }, deviceScaleFactor: 4 });
  await page.setContent(`<style>html, body { margin: 0; background: transparent; } svg { display: block; filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.3)); }</style>${arrow}`);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
  return file;
}

function cursorCommands(shot, camera, style) {
  const ratio = shot.pixelWidth / shot.width;
  const area = shot.rect ?? { x: 0, y: 0, width: shot.pixelWidth, height: shot.pixelHeight };
  const offset = shot.start + shot.inFrame / FPS;
  const moves = shot.events.filter((event) => event.type === "move").map((event) => ({ ...event, t: event.t / 1000 - offset }));
  const presses = shot.events.filter((event) => event.type === "down" || event.type === "up").map((event) => ({ ...event, t: event.t / 1000 - offset }));
  if (!moves.length) return null;

  const step = 1 / 240;
  let index = 0;
  let position = { x: moves[0].x, y: moves[0].y };
  let velocity = { x: 0, y: 0 };
  let clock = Math.min(moves[0].t, 0);
  const smoothed = [];
  for (let frame = 0; frame < shot.frames; frame++) {
    const t = frame / FPS;
    while (clock < t) {
      while (index < moves.length - 1 && moves[index + 1].t <= clock) index++;
      const goal = moves[index];
      const k = CURSOR.stiffness;
      for (const axis of ["x", "y"]) {
        velocity[axis] += (k * k * (goal[axis] - position[axis]) - 2 * k * velocity[axis]) * step;
        position[axis] += velocity[axis] * step;
      }
      clock += step;
    }
    smoothed.push({ ...position });
  }

  const seconds = shot.frames / FPS;
  const home = smoothed[0];
  const lines = [];
  smoothed.forEach((point, frame) => {
    const t = frame / FPS;
    const back = ease(clamp((t - (seconds - CURSOR.home)) / CURSOR.home));
    const x = point.x + (home.x - point.x) * back;
    const y = point.y + (home.y - point.y) * back;
    let pressed = 0;
    for (const press of presses) {
      if (press.t > t) break;
      const progress = easeOut(clamp((t - press.t) / CURSOR.pressTime));
      pressed = press.type === "down" ? progress : 1 - progress;
    }
    const view = camera[frame];
    const perPixel = (view.w / area.width) * ratio;
    const size = Math.max(2, even(CURSOR.box * perPixel * style.cursorScale * (1 - (1 - CURSOR.press) * pressed)));
    const k = size / CURSOR.box;
    const left = ((x * ratio - area.x) / area.width) * view.w - view.x - CURSOR.tip[0] * k;
    const top = ((y * ratio - area.y) / area.height) * view.h - view.y - CURSOR.tip[1] * k;
    lines.push(`${t.toFixed(4)} scale@cs w ${size}, scale@cs h ${size}, overlay@cur x ${Math.round(left)}, overlay@cur y ${Math.round(top)};`);
  });
  const file = join(WORK, `${shot.id}-cursor.cmd`);
  writeFileSync(file, lines.join("\n"));
  return file;
}

const trim = (shot, index) => {
  const crop = shot.rect ? `,crop=${shot.rect.width}:${shot.rect.height}:${shot.rect.x}:${shot.rect.y}` : "";
  return `[${index}:v]trim=start_frame=${shot.inFrame}:end_frame=${shot.inFrame + shot.frames},setpts=PTS-STARTPTS${crop}`;
};

const sourceAspect = (shot) => (shot.rect ? shot.rect.width / shot.rect.height : shot.pixelWidth / shot.pixelHeight);

async function stagePng(browser, layout, file) {
  const page = await browser.newPage({ viewport: { width: layout.width, height: layout.height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(here, "stage.html")).href);
  const rects = await page.evaluate((value) => window.__stage.render(value), layout);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
  return rects;
}

function encode(inputs, graph, name, aspect, seconds) {
  const video = join(OUT, `${name}-${aspect}.mp4`);
  ffmpeg(...inputs.flatMap((input) => (Array.isArray(input) ? input : ["-i", input])), "-filter_complex", graph, "-map", "[v]",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "18",
    "-r", `${FPS}`, "-g", `${FPS * 2}`, "-movflags", "+faststart", "-an", video);

  const files = [{ file: video, bytes: statSync(video).size, seconds }];
  let [width, height] = SIZES[aspect].gif;
  let fps = Math.min(GIF.fps, Math.floor(Math.min(GIF.frames, GIF.pixels / (width * height)) / seconds));
  const gif = join(OUT, `${name}-${aspect}.gif`);
  while (fps >= 10) {
    ffmpeg("-i", video, "-vf",
      `fps=${fps},scale=${width}:${height}:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      "-loop", "0", gif);
    if (statSync(gif).size <= GIF.bytes) {
      files.push({ file: gif, bytes: statSync(gif).size, note: `${fps}fps, ${width}x${height}` });
      return files;
    }
    if (fps > 15) fps -= 5;
    else {
      width = even(width * 0.8);
      height = even(height * 0.8);
    }
  }
  rmSync(gif, { force: true });
  files.push({ file: gif, bytes: 0, note: `Not exported: ${seconds.toFixed(1)}s does not fit X's GIF limits` });
  return files;
}

async function single(browser, shot, name, aspect, style) {
  const [width, height] = SIZES[aspect].video;
  const bleed = !style.margin && Math.abs(sourceAspect(shot) - width / height) < 0.01;
  let rect = { x: 0, y: 0, width, height };
  const png = join(WORK, `${name}-${aspect}-stage.png`);
  if (!bleed) {
    [rect] = await stagePng(browser, { width, height, aspect: sourceAspect(shot), tiles: [{}], margin: style.margin, radius: style.radius, shadow: style.shadow }, png);
  }
  const { file: zoom, camera } = zoomCommands(shot, [rect.width, rect.height], style.clickZoom);
  const inputs = [shot.file];
  let graph = `${trim(shot, 0)},sendcmd=f='${zoom}',scale@zoom=w=${rect.width}:h=${rect.height}:flags=lanczos,crop@zoom=w=${rect.width}:h=${rect.height}:x=0:y=0:exact=1`;
  const drawn = shot.drawCursor && style.cursor && cursorCommands(shot, camera, style);
  if (drawn) {
    inputs.push(["-framerate", `${FPS}`, "-loop", "1", "-i", await cursorPng(browser)]);
    graph += `[z];[1:v]format=rgba,sendcmd=f='${drawn}',scale@cs=w=${CURSOR.box}:h=${CURSOR.box}:flags=lanczos[c];[z][c]overlay@cur=x=-200:y=-200:shortest=1`;
  }
  const seconds = shot.frames / FPS;
  if (bleed) graph += `,format=yuv420p[v]`;
  else {
    inputs.push(png);
    graph = `color=#FFFFFF:s=${width}x${height}:r=${FPS}:d=${seconds}[bg];${graph}[t];[bg][t]overlay=${rect.x}:${rect.y}:shortest=1[s];[s][${inputs.length - 1}:v]overlay=0:0,format=yuv420p[v]`;
  }
  return encode(inputs, graph, name, aspect, seconds);
}

async function grid(browser, shots, tiles, name, aspect, style) {
  const [width, height] = SIZES[aspect].video;
  const png = join(WORK, `${name}-${aspect}-stage.png`);
  const rects = await stagePng(browser, {
    width,
    height,
    aspect: sourceAspect(shots[0]),
    tiles: tiles.map(({ label }) => ({ label })),
    margin: style.margin || 64,
    radius: style.radius,
    shadow: style.shadow,
  }, png);
  const seconds = shots[0].frames / FPS;
  let graph = `color=#FFFFFF:s=${width}x${height}:r=${FPS}:d=${seconds}[s0]`;
  shots.forEach((shot, index) => {
    const rect = rects[index];
    graph += `;${trim(shot, index)},scale=${rect.width}:${rect.height}:flags=lanczos[t${index}]`;
    graph += `;[s${index}][t${index}]overlay=${rect.x}:${rect.y}[s${index + 1}]`;
  });
  graph += `;[s${shots.length}][${shots.length}:v]overlay=0:0,format=yuv420p[v]`;
  return encode([...shots.map((shot) => shot.file), png], graph, name, aspect, seconds);
}

async function split(browser, shots, tiles, name, aspect, { sweep, divider }) {
  const [width, height] = SIZES[aspect].video;
  const png = join(WORK, `${name}-${aspect}-stage.png`);
  await stagePng(browser, {
    width,
    height,
    aspect: width / height,
    bleed: true,
    tiles: [{ chips: [{ text: tiles[0].label, corner: "bottom-left" }, { text: tiles[1].label, corner: "bottom-right" }] }],
  }, png);
  const seconds = shots[0].frames / FPS;
  const lines = [];
  for (let frame = 0; frame < shots[0].frames; frame++) {
    const t = frame / FPS;
    const across = ease(clamp((t - seconds / 2 + 0.3) / 0.6)) - ease(clamp((t - seconds + 0.6) / 0.6));
    const x = Math.round(width * (sweep ? 1 - across : divider));
    lines.push(`${t.toFixed(4)} overlay@mask x ${x}, overlay@line x ${x - 1};`);
  }
  const commands = join(WORK, `${name}-${aspect}-split.cmd`);
  writeFileSync(commands, lines.join("\n"));
  const graph = [
    `${trim(shots[0], 0)},scale=${width}:${height}:flags=lanczos[a]`,
    `${trim(shots[1], 1)},scale=${width}:${height}:flags=lanczos,format=yuva420p[b]`,
    `color=black:s=${width}x${height}:r=${FPS}:d=${seconds},format=gray[black]`,
    `color=white:s=${width}x${height}:r=${FPS}:d=${seconds},format=gray[white]`,
    `[black]sendcmd=f='${commands}'[timed]`,
    `[timed][white]overlay@mask=x=${width}:y=0:shortest=1[mask]`,
    `[b][mask]alphamerge[shown]`,
    `[a][shown]overlay=0:0:shortest=1[wiped]`,
    `color=c=black@0.16:s=2x${height}:r=${FPS}:d=${seconds},format=rgba[rule]`,
    `[wiped][rule]overlay@line=x=${width}:y=0:shortest=1[lined]`,
    `[lined][2:v]overlay=0:0,format=yuv420p[v]`,
  ].join(";");
  return encode([shots[0].file, shots[1].file, png], graph, name, aspect, seconds);
}

function sequence(shots, name, aspect) {
  const [width, height] = SIZES[aspect].video;
  const parts = shots.map((shot, index) => `${trim(shot, index)},scale=${width}:${height}:flags=lanczos,setsar=1[p${index}]`);
  const graph = `${parts.join(";")};${shots.map((_, index) => `[p${index}]`).join("")}concat=n=${shots.length}:v=1:a=0,format=yuv420p[v]`;
  const seconds = shots.reduce((total, shot) => total + shot.frames / FPS, 0);
  return encode(shots.map((shot) => shot.file), graph, name, aspect, seconds);
}

function summary(files, seams) {
  const length = Math.max(...files.map((entry) => entry.seconds ?? 0));
  const measured = seams.filter((shot) => shot.seam !== null);
  const seam = measured.length ? `seam ${share(Math.max(...measured.map((shot) => shot.seam)))} pixels changed` : "no seamless cut";
  console.log(`\nLoop: ${length.toFixed(2)}s, ${seam}`);
  if (length > 15) console.log("Over 15s. Shorten the path.");
  for (const { file, bytes, note } of files) {
    console.log(`${file.replace(`${process.cwd()}/`, "")}  ${(bytes / 1e6).toFixed(2)} MB${note ? `  ${note}` : ""}`);
  }
}

export async function clip({ name, mode = "single", tiles, path, aspects = ["16x9", "1x1", "4x5"], frame, style, loop = true, sweep = false, divider = 0.5 }) {
  const counts = { single: [1, 1], grid: [2, 12], split: [2, 2], sequence: [2, 4] }[mode];
  if (!counts) throw new Error(`Unknown mode ${mode}.`);
  if (tiles.length < counts[0] || tiles.length > counts[1]) throw new Error(`${mode} takes ${counts[0]}–${counts[1]} tiles.`);
  mkdirSync(WORK, { recursive: true });

  const scene = { mode, frame, style: { ...STYLE, ...style } };
  const browser = await launch();
  const files = [];
  const seams = [];
  try {
    if (mode === "grid") {
      const shots = [];
      for (const [index, tile] of tiles.entries()) {
        shots.push(await take(browser, tile, "16x9", path, `${name}-${index}`, { ...scene, rect: shots[0]?.rect }));
      }
      const cuts = cut(shots, loop);
      seams.push(cuts[0]);
      for (const aspect of aspects) files.push(...(await grid(browser, cuts, tiles, name, aspect, scene.style)));
    } else {
      for (const requested of aspects) {
        const shots = [];
        for (const [index, tile] of tiles.entries()) shots.push(await take(browser, tile, requested, path, `${name}-${index}-${requested}`, scene));
        const aspect = requested === "free" ? nearest(sourceAspect(shots[0])) : requested;
        const cuts = mode === "sequence" ? shots.map((shot) => cut([shot], loop)[0]) : cut(shots, loop);
        seams.push(...cuts);
        if (mode === "single") files.push(...(await single(browser, cuts[0], name, aspect, scene.style)));
        if (mode === "split") files.push(...(await split(browser, cuts, tiles, name, aspect, { sweep, divider })));
        if (mode === "sequence") files.push(...sequence(cuts, name, aspect));
      }
    }
  } finally {
    await browser.close();
  }
  summary(files, seams);
  return files;
}

export async function live(videoFile, { name, loop = true } = {}) {
  const meta = JSON.parse(readFileSync(videoFile.replace(/\.(mp4|webm)$/, ".json"), "utf8"));
  mkdirSync(WORK, { recursive: true });
  const file = join(WORK, `${meta.id}-cfr.mp4`);
  ffmpeg("-i", videoFile, "-vf", `fps=${FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2`, "-fps_mode", "cfr",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-pix_fmt", "yuv420p", file);
  const [pixelWidth, pixelHeight] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file], { encoding: "utf8" })
    .trim().split(",").map(Number);

  const start = meta.startedAt / 1000;
  const presses = meta.events.filter((event) => event.type === "up");
  const shot = {
    id: meta.id,
    file,
    width: meta.capture.width,
    height: meta.capture.height,
    pixelWidth,
    pixelHeight,
    rect: null,
    drawCursor: true,
    start,
    pathStart: meta.firstMove / 1000 - start,
    pathEnd: (presses.length ? presses.at(-1).t : meta.firstMove) / 1000 - start + 0.3,
    events: meta.events.map((event) => ({ ...event, x: event.x - meta.capture.x, y: event.y - meta.capture.y })),
  };
  const loops = loop && !meta.reload;
  const [cutShot] = cut([shot], loops);
  if (!loops) cutShot.frames = Math.max(1, cutShot.frames - Math.round(0.3 * FPS));
  const aspect = SIZES[meta.ratio] ? meta.ratio : nearest(pixelWidth / pixelHeight);
  const browser = await launch();
  try {
    const files = await single(browser, cutShot, name ?? meta.id, aspect, { ...STYLE, ...meta.style });
    summary(files, [cutShot]);
    return files;
  } finally {
    await browser.close();
  }
}

export function receive({ name = "live", port = 4917, loop = true } = {}) {
  mkdirSync(WORK, { recursive: true });
  let count = 0;
  const server = createServer(async (request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-headers", "content-type");
    response.setHeader("access-control-allow-private-network", "true");
    if (request.method === "OPTIONS") return response.writeHead(204).end();
    const match = request.url.match(/^\/take\/([\w-]+)\/(meta|video)$/);
    if (request.method !== "POST" || !match) return response.writeHead(404).end();
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const [, id, kind] = match;
    const metaFile = join(WORK, `${id}.json`);
    if (kind === "meta") {
      writeFileSync(metaFile, Buffer.concat(chunks));
      return response.writeHead(200).end();
    }
    if (!existsSync(metaFile)) return response.writeHead(409).end();
    const { extension } = JSON.parse(readFileSync(metaFile, "utf8"));
    const videoFile = join(WORK, `${id}.${extension}`);
    writeFileSync(videoFile, Buffer.concat(chunks));
    response.writeHead(200).end();
    count += 1;
    console.log(`\nTake ${count} received`);
    try {
      await live(videoFile, { name: count === 1 ? name : `${name}-${count}`, loop });
    } catch (error) {
      console.log(error.message);
    }
  });
  server.listen(port, "127.0.0.1", () => console.log(`Waiting for Studio takes on http://127.0.0.1:${port}`));
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  const flag = (key) => {
    const index = rest.indexOf(key);
    return index >= 0 ? rest[index + 1] : undefined;
  };
  const loop = !rest.includes("--no-loop");
  if (command === "receive") receive({ name: flag("--name"), loop, port: Number(flag("--port") ?? 4917) });
  else if (command === "take") await live(resolve(rest[0]), { name: flag("--name"), loop });
  else console.log("Usage: node record.mjs receive [--name clip] [--no-loop] | node record.mjs take <file> [--name clip] [--no-loop]");
}
