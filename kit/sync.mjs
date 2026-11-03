// Writes the kit into every marked region under skills/ and kit/.
// node kit/sync.mjs rewrites the regions. node kit/sync.mjs --check exits 1 when any region differs from the kit.
//
// A region opens and closes on its own lines, at one indentation:
//   /* kit:select */ ... /* kit:select end */   fills from kit/select.css
//   // kit:overlays ... // kit:overlays end      fills from kit/overlays.js
// Add prefix=<name> to the opening marker to rename every custom property, so --accent becomes --<name>-accent.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const kit = dirname(fileURLToPath(import.meta.url));
const root = dirname(kit);
const check = process.argv.includes("--check");

const markers = [
  { extension: "css", pattern: /^([ \t]*)\/\* kit:([a-z-]+)((?: [a-z]+=[\w-]+)*) \*\/\n([\s\S]*?)^\1\/\* kit:\2 end \*\/$/gm, open: (name, options) => `/* kit:${name}${options} */`, close: (name) => `/* kit:${name} end */` },
  { extension: "js", pattern: /^([ \t]*)\/\/ kit:([a-z-]+)((?: [a-z]+=[\w-]+)*)\n([\s\S]*?)^\1\/\/ kit:\2 end$/gm, open: (name, options) => `// kit:${name}${options}`, close: (name) => `// kit:${name} end` },
];

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(html|js|mjs)$/.test(name) && path !== fileURLToPath(import.meta.url) ? [path] : [];
  });
}

function part(name, extension, options) {
  const path = join(kit, `${name}.${extension}`);
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new Error(`kit/${name}.${extension} does not exist`);
  }
  const prefix = /prefix=([\w-]+)/.exec(options)?.[1];
  if (prefix) text = text.replace(/--([a-z][\w-]*)/g, `--${prefix}-$1`);
  return text.trimEnd();
}

const indent = (text, by) => text.replace(/^(?=.)/gm, by);

const stale = [];
let regions = 0;

for (const path of [...files(join(root, "skills")), ...files(kit)]) {
  const before = readFileSync(path, "utf8");
  let after = before;
  for (const marker of markers) {
    after = after.replace(marker.pattern, (match, space, name, options) => {
      regions += 1;
      const body = indent(part(name, marker.extension, options), space);
      const next = `${space}${marker.open(name, options)}\n${body}\n${space}${marker.close(name)}`;
      if (next !== match) stale.push(`${relative(root, path)} kit:${name}`);
      return next;
    });
  }
  if (!check && after !== before) writeFileSync(path, after);
}

if (check && stale.length) {
  console.error(`${stale.length} of ${regions} kit regions differ from the kit:\n${stale.map((line) => `  ${line}`).join("\n")}\nRun node kit/sync.mjs to rewrite them.`);
  process.exit(1);
}

console.log(check ? `${regions} kit regions match the kit.` : `${regions} kit regions written, ${stale.length} changed.`);
