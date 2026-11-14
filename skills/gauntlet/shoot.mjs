// Usage: node shoot.mjs <url> <folder>
// Writes desktop.png, mobile.png and dark.png, each a full page. CHROME_PATH picks a browser binary.
import fs from "node:fs";

let playwright;
try {
  playwright = await import("playwright");
} catch {
  playwright = await import("playwright-core");
}

const [, , url, folder] = process.argv;
if (!url || !folder) {
  console.error("Usage: node shoot.mjs <url> <folder>");
  process.exit(1);
}
fs.mkdirSync(folder, { recursive: true });

const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
let browser;
try {
  browser = await playwright.chromium.launch(launch);
} catch {
  browser = await playwright.chromium.launch({ channel: "chrome" });
}

const views = {
  desktop: { viewport: { width: 1440, height: 900 }, colorScheme: "light" },
  mobile: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: "light" },
  dark: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" },
};

for (const [name, options] of Object.entries(views)) {
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${folder}/${name}.png`, fullPage: true });
  await context.close();
}
await browser.close();
