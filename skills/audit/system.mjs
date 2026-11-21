// Reports what a project already decided: tokens, scales, colour notation, breakpoints and motion values.
// node system.mjs [path ...] reads the current directory when no path is given.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const roots = process.argv.length > 2 ? process.argv.slice(2) : ["."];
const skipped = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor"]);
const extensions = new Set([".css", ".scss", ".less", ".js", ".jsx", ".mjs", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".html", ".mdx"]);

const tally = () => new Map();
const found = {
  families: tally(),
  radius: tally(),
  spacing: tally(),
  fontSize: tally(),
  breakpoints: tally(),
  durations: tally(),
  easing: tally(),
  notation: tally(),
  utilities: tally(),
};
const flags = { ":focus-visible": false, "prefers-reduced-motion": false, "tabular-nums": false };
const tokenFiles = new Set();
let tokens = 0;
let files = 0;

const count = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
const lengths = (value) => value.match(/-?\d*\.?\d+(px|rem|em)\b/g) ?? [];
const each = (text, pattern, fn) => {
  for (const match of text.matchAll(pattern)) fn(match);
};

function walk(path) {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return console.error(`Skipped ${path}: not found`);
  }
  if (stats.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (!name.startsWith(".") && !skipped.has(name)) walk(join(path, name));
    }
  } else if (extensions.has(extname(path)) && !path.includes(".min.")) {
    read(path, readFileSync(path, "utf8"));
  }
}

function read(path, text) {
  files += 1;

  each(text, /(?<![\w-])--([a-z][a-z0-9]*)[\w-]*\s*:/gi, (match) => {
    tokens += 1;
    tokenFiles.add(path);
    count(found.families, match[1].toLowerCase());
  });

  each(text, /border(?:-[a-z]+)*-radius\s*:\s*([^;}\n]+)/g, (match) => lengths(match[1]).forEach((value) => count(found.radius, value)));
  each(text, /(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*([^;}\n]+)/g, (match) => lengths(match[1]).forEach((value) => count(found.spacing, value)));
  each(text, /font-size\s*:\s*([^;}\n]+)/g, (match) => lengths(match[1]).forEach((value) => count(found.fontSize, value)));
  each(text, /@media[^{]*?\((?:min|max)-width\s*:\s*([\d.]+(?:px|rem|em))/g, (match) => count(found.breakpoints, match[1]));

  each(text, /(?:transition|animation)(?:-duration)?\s*:\s*([^;}\n]+)/g, (match) => {
    (match[1].match(/\b\d*\.?\d+m?s\b/g) ?? []).forEach((value) => count(found.durations, value));
    (match[1].match(/cubic-bezier\([^)]*\)|var\(--[\w-]*ease[\w-]*\)|\bease(?:-in-out|-in|-out)?\b|\blinear\b/g) ?? []).forEach((value) => count(found.easing, value));
  });

  each(text, /#[0-9a-fA-F]{3,8}\b(?![\w-])/g, () => count(found.notation, "hex"));
  each(text, /\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/g, (match) => count(found.notation, match[1].replace(/a$/, "")));

  each(text, /\bclass(?:Name)?=\{?["'`]([^"'`]+)["'`]/g, (attribute) =>
    each(attribute[1], /(?<![\w:-])(?:[a-z]+:)*(rounded(?:-[trbl]{1,2})?|p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|text)-(\[[^\]]+\]|xs|sm|base|lg|[2-9]?xl|full|none|px|\d+(?:\.\d+)?)(?![\w-])/g, (match) => count(found.utilities, `${match[1]}-${match[2]}`)),
  );

  for (const flag of Object.keys(flags)) if (text.includes(flag)) flags[flag] = true;
}

for (const root of roots) walk(root);

const top = (map, limit = 8) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, n]) => (n > 1 ? `${key} (${n})` : key)).join(", ") || "none found";

const notationTotal = [...found.notation.values()].reduce((sum, n) => sum + n, 0);
const notation = [...found.notation.entries()].sort((a, b) => b[1] - a[1]).map(([key, n]) => `${key} ${Math.round((n / notationTotal) * 100)}%`).join(", ");
const utilityCount = [...found.utilities.values()].reduce((sum, n) => sum + n, 0);

console.log(`Read ${files} files.

Tokens       ${tokens} custom properties across ${tokenFiles.size} files
  families   ${top(found.families)}

Scales
  radius     ${top(found.radius)}
  spacing    ${top(found.spacing, 10)}
  font size  ${top(found.fontSize)}
  breakpoint ${top(found.breakpoints)}

Motion
  durations  ${top(found.durations)}
  easing     ${top(found.easing, 5)}

Colour       ${notation || "none found"}
Utilities    ${utilityCount ? `${utilityCount} spacing, radius and type classes: ${top(found.utilities)}` : "none found"}

Flags        ${Object.entries(flags).map(([flag, on]) => `${on ? "yes" : "no "} ${flag}`).join("   ")}`);
