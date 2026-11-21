// Lists every line that matches a known break, each with the id of the rule it breaks.
// node scan.mjs [path ...] scans the current directory when no path is given.
// Every hit is a candidate. Open the line before reporting it.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const roots = process.argv.length > 2 ? process.argv.slice(2) : ["."];
const skipped = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor"]);
const extensions = new Set([".css", ".scss", ".less", ".js", ".jsx", ".mjs", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".html", ".mdx"]);
const tokenFile = /(token|theme|palette|colou?r|variable)s?\./i;

// [rule, pattern, test?]. A test receives the match and the line, and returns false to drop the hit.
const lineCues = [
  ["motion-name-the-properties", /transition:\s*all\b|\btransition-all\b/],
  ["motion-no-scale-from-zero", /scale\(0\)|\bscale:\s*0\s*[,}]|\bscale-0\b/],
  ["motion-ease-by-direction", /(?<![\w-])ease-in(?![\w-])|ease:\s*["']easeIn["']/],
  ["motion-strong-ease-out", /(?<![\w-])ease-out(?![\w-])|ease:\s*["']easeOut["']/],
  ["motion-no-scroll-reveals", /whileInView|data-aos|\banimate-fade/],
  ["motion-no-idle-loops", /animation:[^;\n]*\binfinite\b|\banimate-(pulse|ping|bounce)\b/, (match, line) => !/spin|load(ing|er)|skeleton/i.test(line)],
  ["motion-short-stagger", /staggerChildren:\s*(0?\.[1-9]|[1-9])/],
  ["motion-press-scale", /whileTap=\{\{\s*scale:\s*([\d.]+)/, (match) => Number(match[1]) < 0.95],
  ["motion-press-scale", /\bactive:scale-(\d+)\b/, (match) => Number(match[1]) < 95],
  ["motion-under-300ms", /duration:\s*(0?\.[5-9]\d*|[1-9](\.\d+)?)\s*[,}]|transition(?!-delay)[^;\n]*\b([5-9]\d{2}|\d{4,})ms|\bduration-([5-9]\d{2}|\d{4,})\b/],
  ["motion-instant-hover-color", /transition(-property)?:[^;\n]*\b(background|background-color|color|border-color)\b|\btransition-colors\b/],
  ["defaults-fade-the-shadow", /transition(-property)?:[^;\n]*box-shadow|\btransition-shadow\b/],
  ["overlays-stable-gutter", /(body|documentElement)\.style\.(overflow|position)\s*=\s*["'](hidden|fixed)["']|^\s*(html|body)\s*(,\s*(html|body)\s*)?\{[^}]*\b(overflow:\s*hidden|position:\s*fixed)/],
  ["frames-brief-will-change", /will-change:\s*(?!auto\b)[a-z]|\bwill-change-(transform|opacity|scroll|contents)\b/],
  ["frames-no-inherited-variable", /setProperty\(\s*["'`]--|["']--[\w-]+["']\s*:\s*(?!(true|false|null|undefined)\b)[`A-Za-z_$(]/],
  ["defaults-allow-zoom", /maximum-scale\s*=\s*1(?![.\d])|user-scalable\s*=\s*no/],
  ["defaults-dynamic-viewport", /\b100vh\b|\bh-screen\b/],
  ["defaults-focus-keyboard-only", /:focus(?![-\w])|outline:\s*(none|0)\b|\boutline-none\b|(?<![\w-])focus:(ring|outline|border|shadow)/],
  ["defaults-rounded-not-pill", /border-radius:\s*9{3,}px|\brounded-full\b/],
  ["forms-validate-on-submit", /disabled=\{\s*!\s*[\w.]*(valid|canSubmit)/i],
  ["forms-user-invalid", /(?<!user-):invalid\b|(?<![\w-])invalid:(?=[a-z[])/],
  ["defaults-instant-feedback", /if\s*\(\s*[\w.]*(isLoading|loading|isPending|pending|isFetching)\s*\)\s*return\s+(null|<><\/>)/],
  ["defaults-sound-optional", /\.volume\s*=\s*1(\.0)?\b/],
  ["states-list-every-state", /if\s*\(\s*!\s*[\w.]*(data|items|rows|results|list)\s*\)\s*return\s+(null|<><\/>)/],
  ["keyboard-reach-every-control", /<(div|span|li)\b[^>]*\sonClick=/],
  ["copy-no-ellipsis", /[A-Za-z](\.\.\.|\u2026)(?=["'`<\s]|$)/, (match, line) => !/placeholder/i.test(line)],
  ["copy-no-em-dash", /\u2014|&mdash;/],
  ["color-role-tokens", /(?<![\w-])(color|background|background-color|border-color|fill|stroke):\s*#[0-9a-fA-F]{3,8}\b|\b(text|bg|border|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]|var\(--(gray|grey|neutral|slate|zinc|red|blue|green)-\d+\)/, (match, line, file) => !tokenFile.test(basename(file)) && !/^\s*--[\w-]+:/.test(line)],
  ["verify-no-weakened-checks", /\b(it|test|describe)\.(skip|only)\(|\bx(it|test|describe)\(|@ts-ignore\b|eslint-disable/],
  ["restraint-no-leftover-debug", /\bconsole\.(log|debug)\(|^\s*debugger;?\s*$/, (match, line, file) => !/\.(mjs|cjs)$/.test(file) && !/(^|\/)(scripts?|bin)\//.test(file)],
  ["audit-content-is-data", /\b(ignore|disregard)\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+instructions\b|\b(ai|llm|agent|assistant|reviewer)s?\b[^.\n]{0,40}\b(skip this file|do not (review|report|flag))\b/i],
];

// Tags span several lines in JSX, so these read the whole tag.
const inputTag = /<[Ii]nput\b(?:=>|[^>])*>/g;
const imageTag = /<img\b(?:=>|[^>])*>/g;
const priorityTag = /<(?:img|Image)\b(?:=>|[^>])*>/g;
const mediaTag = /<(?:img|video)\b(?:=>|[^>])*>/g;
const tagCues = [
  ["forms-input-types", inputTag, (tag) => /\b(name|id|type)=["'{]?[^"'}\s]*(email|phone|tel|address|postal|zip|first.?name|last.?name|full.?name)/i.test(tag) && !/autocomplete/i.test(tag)],
  ["forms-label-hit-area", inputTag, (tag) => /placeholder=/.test(tag) && !/aria-label|aria-labelledby|\bid=/.test(tag) && !/type=["'](hidden|submit|button|checkbox|radio)["']/.test(tag)],
  ["forms-consent-unchecked", inputTag, (tag) => /type=["']checkbox["']/.test(tag) && /\b(defaultChecked|checked)\b(?!=\{false\})/.test(tag) && /newsletter|marketing|offer|promo|subscribe|consent|updates|share/i.test(tag)],
  ["defaults-alt-by-purpose", imageTag, (tag) => !/\balt=/.test(tag) || /\balt=["']([^"']*\.(png|jpe?g|gif|webp|svg|avif)|image|img|photo|picture|icon)["']/i.test(tag)],
  ["vitals-lcp-priority", priorityTag, (tag) => /\bloading=\{?["']lazy["']/.test(tag) && (/\bfetchpriority=\{?["']high["']/i.test(tag) || /\spriority(?![\w-])(?!=\{false\})/.test(tag))],
  ["vitals-size-media", mediaTag, (tag) => !/\b(width|height|fill)\b|aspect-ratio|(?<![\w-])(aspect|size|[wh])-(\d|\[|full|screen|square|video|px)/.test(tag)],
];

// Packages that do the same job. Two from one group in a manifest is a second library for one job.
const sameJob = [
  ["moment", "dayjs", "date-fns", "luxon"],
  ["axios", "ky", "got", "superagent", "node-fetch"],
  ["lodash", "lodash-es", "underscore", "ramda"],
  ["uuid", "nanoid", "cuid", "@paralleldrive/cuid2"],
  ["classnames", "clsx"],
];
const iconPackages = ["lucide-react", "@heroicons/react", "react-icons", "@tabler/icons-react", "@phosphor-icons/react", "phosphor-react", "@radix-ui/react-icons", "react-feather", "@iconify/react", "@mui/icons-material", "@fortawesome/react-fontawesome"];

const hits = [];
const project = { hover: 0, active: 0, animates: null, reducedMotion: false, scrollLock: null, gutter: false };
let scanned = 0;

const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const snippet = (line) => line.trim().replace(/\s+/g, " ").slice(0, 100);
const shown = (file) => {
  const path = relative(".", file);
  return path && !path.startsWith("..") ? path : file;
};
const add = (rule, file, line, text) => hits.push({ rule, where: `${shown(file)}:${line}`, text });

function walk(path) {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (name.startsWith(".") || skipped.has(name)) continue;
      walk(join(path, name));
    }
    return;
  }
  if (basename(path) === "package.json") return readPackage(path);
  if (!extensions.has(extname(path)) || path.includes(".min.") || stats.size > 1_000_000) return;
  scan(path, readFileSync(path, "utf8"));
}

function readPackage(path) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const names = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
  const icons = iconPackages.filter((name) => names.includes(name));
  if (icons.length > 1) add("reuse-one-standard", path, 1, `${icons.length} icon packages: ${icons.join(", ")}`);
  for (const group of sameJob) {
    const present = group.filter((name) => names.includes(name));
    if (present.length > 1) add("reuse-one-library-per-job", path, 1, `${present.length} packages for one job: ${present.join(", ")}`);
  }
}

function scan(file, text) {
  scanned += 1;
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    for (const [rule, pattern, test] of lineCues) {
      const match = pattern.exec(line);
      if (match && (!test || test(match, line, file))) add(rule, file, index + 1, snippet(line));
    }
  });

  for (const [rule, pattern, test] of tagCues) {
    for (const match of text.matchAll(pattern)) {
      if (test(match[0])) add(rule, file, lineOf(text, match.index), snippet(match[0]));
    }
  }

  const loading = /const\s*\[\s*(isLoading|loading)\b/.exec(text);
  if (loading && /const\s*\[\s*(isError|error|hasError)\b/.test(text)) {
    add("invariants-one-status", file, lineOf(text, loading.index), "Separate loading and error flags in one component");
  }

  const keydown = /(window|document)\.addEventListener\(\s*["']keydown["']/.exec(text);
  if (keydown && !/isContentEditable|tagName|closest\(|matches\(/.test(text)) {
    add("defaults-keys-ignore-inputs", file, lineOf(text, keydown.index), "A global keydown listener with no input guard");
  }

  if (!/isComposing/.test(text)) {
    lines.forEach((line, index) => {
      if (/\bkey\s*===?\s*["']Enter["']|["']Enter["']\s*===?\s*[\w.]*\bkey\b/.test(line)) add("forms-ime-safe-enter", file, index + 1, snippet(line));
    });
  }

  project.hover += (text.match(/:hover\b|(?<![\w-])hover:/g) ?? []).length;
  project.active += (text.match(/:active\b|(?<![\w-])active:/g) ?? []).length;

  const animation = /@keyframes|animation:|<motion\.|from ["'](framer-motion|motion\/react)["']|\banimate-/.exec(text);
  if (animation && !project.animates) project.animates = { file, line: lineOf(text, animation.index) };
  if (/prefers-reduced-motion|useReducedMotion|reducedMotion|motion-reduce:|motion-safe:/.test(text)) project.reducedMotion = true;

  const lock = /react-remove-scroll|@radix-ui\/react-dialog|from ["']vaul["']/.exec(text);
  if (lock && !project.scrollLock) project.scrollLock = { file, line: lineOf(text, lock.index) };
  if (/scrollbar-gutter/.test(text)) project.gutter = true;
}

for (const root of roots) walk(root);

if (project.hover && !project.active) add("defaults-no-tap-highlight", roots.join(" "), 1, `Hover styles: ${project.hover}, :active styles: 0`);
if (project.animates && !project.reducedMotion) add("motion-reduced-motion", project.animates.file, project.animates.line, "Animation in the project and no reduced-motion query anywhere");
if (project.scrollLock && !project.gutter) add("overlays-stable-gutter", project.scrollLock.file, project.scrollLock.line, "A library locks scroll and no scrollbar-gutter is set");

const order = [...new Set([...lineCues, ...tagCues].map(([rule]) => rule))];
const rank = (rule) => (order.includes(rule) ? order.indexOf(rule) : order.length);
hits.sort((a, b) => rank(a.rule) - rank(b.rule) || a.where.localeCompare(b.where, undefined, { numeric: true }));

for (const hit of hits) console.log(`${hit.where} - [${hit.rule}] ${hit.text}`);
const rules = new Set(hits.map((hit) => hit.rule)).size;
const files = `${scanned} ${scanned === 1 ? "file" : "files"}`;
console.log(hits.length
  ? `\n${hits.length} ${hits.length === 1 ? "candidate" : "candidates"} for ${rules} ${rules === 1 ? "rule" : "rules"} in ${files}. Open each line before reporting it.`
  : `No candidates in ${files}.`);
