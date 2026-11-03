// Export the blueprint still and the reveal.
// node export.mjs .blueprint/<subject>
// The folder holds index.html, sheet.js and screen.png, copied from this skill.
// Writes drawing.png and reveal.mp4 beside them. Uses the project's Playwright.

import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dir = resolve(process.argv[2] || ".");

function loadPlaywright() {
  const tries = [process.cwd(), dir];
  for (const base of tries) {
    for (const name of ["playwright", "playwright-core"]) {
      try {
        return createRequire(join(base, "package.json"))(name);
      } catch {
        // Try the next package.
      }
    }
  }
  console.error("Install Playwright in this project, then run again.\nnpm install -D playwright && npx playwright install chromium");
  process.exit(1);
}

const ease = bezier(0.77, 0, 0.175, 1);

function bezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= (sampleX(t) - x) / dx;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({
  executablePath: process.env.BLUEPRINT_CHROME || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(pathToFileURL(join(dir, "index.html")).href);
await page.waitForFunction(() => window.__blueprint);
await page.evaluate(() => window.__blueprint.ready());

const stage = page.locator("#stage");
await stage.scrollIntoViewIfNeeded();
await page.evaluate(() => window.__blueprint.seek(1));
await stage.screenshot({ path: join(dir, "drawing.png"), type: "png" });

const fps = 30;
const holdIn = 0.35;
const move = 2.4;
const holdOut = 0.45;
const total = holdIn + move + holdOut;
const count = Math.round(total * fps);
const frames = mkdtempSync(join(tmpdir(), "blueprint-"));

try {
  for (let i = 0; i < count; i += 1) {
    const time = i / fps;
    let t = 1;
    if (time < holdIn) t = 0;
    else if (time < holdIn + move) t = ease((time - holdIn) / move);
    await page.evaluate((value) => window.__blueprint.seek(value), t);
    const name = String(i).padStart(4, "0");
    await stage.screenshot({ path: join(frames, `frame-${name}.png`), type: "png" });
  }

  const mp4 = join(dir, "reveal.mp4");
  const encoded = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      join(frames, "frame-%04d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      mp4,
    ],
    { stdio: "inherit" },
  );
  if (encoded.status !== 0) process.exit(encoded.status ?? 1);
  console.log(mp4);
  console.log(join(dir, "drawing.png"));
} finally {
  rmSync(frames, { recursive: true, force: true });
  await browser.close();
}
