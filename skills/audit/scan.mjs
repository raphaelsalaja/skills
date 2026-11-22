// Lists every line that matches a known break, each with the id of the rule it breaks.
// node scan.mjs [--repo dir] [path ...] scans the paths, or the current directory when no path is given.
// Project-wide checks, such as a reduced-motion query anywhere, read --repo (the current directory by default) and report only what the paths trigger.
// Every hit is a candidate. Open the line before reporting it.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const args = process.argv.slice(2);
const repoAt = args.indexOf("--repo");
const repo = repoAt === -1 ? "." : args[repoAt + 1] ?? ".";
const roots = args.filter((arg, index) => repoAt === -1 || (index !== repoAt && index !== repoAt + 1));
if (!roots.length) roots.push(".");
const skipped = new Set(["node_modules", "dist", "build", "out", "coverage", "vendor"]);
const extensions = new Set([".css", ".scss", ".less", ".js", ".jsx", ".mjs", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".html", ".mdx"]);
const tokenFile = /(token|theme|palette|colou?r|variable)s?\./i;
const toolingFile = /(^|[\\/])(scripts?|bin|config)[\\/]|\.config\.[cm]?[jt]s$|(^|[\\/])\.?[\w-]*rc\.[cm]?js$/;

const toMs = (time) => (time.endsWith("ms") ? parseFloat(time) : parseFloat(time) * 1000);

// The longest duration a line sets: motion seconds, Web Animations milliseconds, CSS transitions and Tailwind classes.
function longestDuration(line) {
  const found = [];
  for (const [, value] of line.matchAll(/\bduration:\s*(\d*\.?\d+)\s*[,}]/g)) {
    const n = Number(value);
    found.push(n <= 10 ? n * 1000 : /\.animate\(/.test(line) ? n : 0);
  }
  for (const [, longhand, value] of line.matchAll(/transition(-duration)?\s*:\s*([^;}\n]+)/g)) {
    for (const item of value.split(/,(?![^(]*\))/)) {
      const times = item.match(/(?<![\w.-])\d*\.?\d+m?s\b/g) ?? [];
      (longhand ? times : times.slice(0, 1)).forEach((time) => found.push(toMs(time)));
    }
  }
  for (const [, steps, time] of line.matchAll(/(?<![\w-])duration-(\d+|\[(\d*\.?\d+m?s)\])(?![\w-])/g)) found.push(time ? toMs(time) : Number(steps));
  return Math.max(0, ...found);
}

// A focus-visible outline in the same rule or the lines after it replaces a removed outline. A ring is a box-shadow, which forced colours erase.
const ringNearby = (lines, index) =>
  /:focus-visible[^{;]*\{[^}]*outline(?:-style)?:(?!\s*(?:none|0\b))|focus-visible:outline-(?!none|hidden)/.test(lines.slice(Math.max(0, index - 3), index + 13).join("\n"));

// [rule, pattern, test?]. A test receives the match, the line, the file, every line and the line's index, and returns false to drop the hit.
const lineCues = [
  ["motion-name-the-properties", /transition:\s*all\b|\btransition-all\b/],
  ["motion-no-scale-from-zero", /scale\(0\)|\bscale:\s*0\s*[,}]|\bscale-0\b/],
  ["motion-ease-by-direction", /(?<![\w-])ease-in(?![\w-])|ease:\s*["']easeIn["']/],
  ["motion-strong-ease-out", /(?<![\w-])ease-out(?![\w-])|ease:\s*["']easeOut["']/],
  ["motion-no-scroll-reveals", /whileInView|data-aos|animation-timeline:\s*view\(/],
  ["motion-no-idle-loops", /animation:[^;\n]*\binfinite\b|\banimate-(pulse|ping|bounce)\b/, (match, line) => !/spin|load(ing|er)|skeleton/i.test(line)],
  ["motion-short-stagger", /(?:staggerChildren:\s*|\bstagger\(\s*)(\d*\.?\d+)/, (match) => (Number(match[1]) <= 10 ? Number(match[1]) * 1000 : Number(match[1])) >= 50],
  ["motion-press-scale", /whileTap=\{\{\s*scale:\s*([\d.]+)/, (match) => Number(match[1]) < 0.95],
  ["motion-press-scale", /\bactive:scale-(?:(\d+)|\[(0?\.\d+)\])(?![\w-])/, (match) => (match[1] ? Number(match[1]) / 100 : Number(match[2])) < 0.95],
  ["motion-under-300ms", /duration|transition/, (match, line) => longestDuration(line) > 300],
  ["motion-instant-hover-color", /transition(-property)?:[^;\n]*\b(background|background-color|color|border-color)\b|\btransition-colors\b/],
  ["defaults-fade-the-shadow", /transition(-property)?:[^;\n]*box-shadow|\btransition-shadow\b/],
  ["overlays-stable-gutter", /(body|documentElement)\.style\.(overflow|position)\s*=\s*["'](hidden|fixed)["']/],
  ["frames-brief-will-change", /will-change:\s*(?!auto\b)[a-z]|\bwill-change-(transform|opacity|scroll|contents)\b/],
  ["frames-no-inherited-variable", /setProperty\(\s*["'`]--|["']--[\w-]+["']\s*:\s*(?!(true|false|null|undefined)\b)[`A-Za-z_$(]/],
  ["defaults-allow-zoom", /maximum-?scale\s*[=:]\s*["']?1(?:\.0*)?(?![.\d])|user-?scalable\s*[=:]\s*["']?(?:no|0|false)\b/i],
  ["defaults-dynamic-viewport", /\b100vh\b|\bh-screen\b/],
  ["defaults-focus-keyboard-only", /:focus(?![-\w])|(?<![\w-])focus:(ring|border|shadow|outline(?!-none|-hidden))/, (match, line) => !/:focus:not\(:focus-visible\)/.test(line)],
  ["defaults-focus-outline", /outline:\s*(none|0)(?![.\w])|\boutline-none\b/, (match, line, file, lines, index) => !/:not\(:focus-visible\)/.test(line) && !ringNearby(lines, index)],
  ["defaults-rounded-not-pill", /border-radius:\s*9{3,}px|\brounded-full\b/],
  ["forms-validate-on-submit", /disabled=\{\s*!\s*[\w.]*(valid|canSubmit)/i],
  ["forms-user-invalid", /(?<!user-):invalid\b|(?<![\w-])invalid:(?=[a-z[])/],
  ["defaults-instant-feedback", /if\s*\(\s*[\w.]*(isLoading|loading|isPending|pending|isFetching)\s*\)\s*return\s+(null|<><\/>)/],
  ["defaults-sound-optional", /\.volume\s*=\s*1(\.0)?\b/],
  ["states-list-every-state", /if\s*\(\s*!\s*[\w.]*(data|items|rows|results|list)\s*\)\s*return\s+(null|<><\/>)/],
  ["copy-no-ellipsis", /[A-Za-z]\.\.\.(?=["'`<\s]|$)|\b[A-Za-z]+ing\u2026/],
  ["copy-no-em-dash", /\u2014|&mdash;/],
  ["color-role-tokens", /(?<![\w-])(color|background|background-color|border-color|fill|stroke|backgroundColor|borderColor):\s*["'`]?#[0-9a-fA-F]{3,8}\b|\b(text|bg|border|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]|var\(--(gray|grey|neutral|slate|zinc|red|blue|green)-\d+\)/, (match, line, file) => !tokenFile.test(basename(file)) && !/^\s*--[\w-]+:/.test(line)],
  ["verify-no-weakened-checks", /\b(it|test|describe)\.(skip|only)\(|\bx(it|test|describe)\(|@ts-ignore\b|eslint-disable/],
  ["restraint-no-leftover-debug", /\bconsole\.(log|debug)\(|^\s*debugger;?\s*$/, (match, line, file) => !toolingFile.test(file)],
  ["audit-content-is-data", /\b(ignore|disregard)\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+instructions\b|\b(ai|llm|agent|assistant|reviewer)s?\b[^.\n]{0,40}\b(skip this file|do not (review|report|flag))\b/i],
];

// Tags span several lines in JSX, so these read the whole tag.
const inputTag = /<[Ii]nput\b(?:=>|[^>])*>/g;
const imageTag = /<img\b(?:=>|[^>])*>/g;
const priorityTag = /<(?:img|Image)\b(?:=>|[^>])*>/g;
const mediaTag = /<(?:img|video)\b(?:=>|[^>])*>/g;
const clickTag = /<(?:div|span|li)\b(?:=>|[^>])*>/g;
const insideLabel = (text, index) => {
  const before = text.slice(0, index);
  return before.lastIndexOf("<label") > before.lastIndexOf("</label>");
};
// A test receives the whole tag, the file's text and the tag's index.
const tagCues = [
  ["keyboard-reach-every-control", clickTag, (tag) => /\sonClick=/.test(tag) && !(/\srole=/.test(tag) && /\stabindex=/i.test(tag))],
  ["forms-input-types", inputTag, (tag) => /\b(name|id|type)=["'{]?[^"'}\s]*(email|phone|tel|address|postal|zip|first.?name|last.?name|full.?name)/i.test(tag) && !/autocomplete/i.test(tag)],
  ["forms-label-hit-area", inputTag, (tag, text, index) => /placeholder=/.test(tag) && !/aria-label|aria-labelledby|\bid=/.test(tag) && !/type=["'](hidden|submit|button|checkbox|radio)["']/.test(tag) && !insideLabel(text, index)],
  ["forms-consent-unchecked", inputTag, (tag) => /type=["']checkbox["']/.test(tag) && /\bdefaultChecked\b(?!=\{false\})|\bchecked(?=[\s/>]|=\{true\}|=["'])/.test(tag) && /newsletter|marketing|offer|promo|subscribe|consent|updates|share/i.test(tag)],
  ["defaults-alt-by-purpose", imageTag, (tag) => !/\balt=/.test(tag) || /\balt=["']([^"']*\.(png|jpe?g|gif|webp|svg|avif)|image|img|photo|picture|icon)["']/i.test(tag)],
  ["vitals-lcp-priority", priorityTag, (tag) => /\bloading=\{?["']lazy["']/.test(tag) && (/\bfetchpriority=\{?["']high["']/i.test(tag) || /\spriority(?![\w-])(?!=\{false\})/.test(tag))],
  ["vitals-size-media", mediaTag, (tag) => !/\s(width|height)=|aspect-ratio|height:|(?<![\w-])(aspect|size|h)-(\d|\[|full|screen|dvh|svh|lvh|square|video|px)/.test(tag)],
];

// Packages that do the same job. Two from one group in a manifest is a second library for one job.
const sameJob = [
  ["moment", "dayjs", "date-fns", "luxon"],
  ["axios", "ky", "got", "superagent", "node-fetch"],
  ["lodash", "lodash-es", "underscore", "ramda"],
  ["uuid", "nanoid", "cuid", "@paralleldrive/cuid2"],
  ["classnames", "clsx"],
  ["framer-motion", "motion", "react-spring", "@react-spring/web", "gsap", "animejs"],
];
const iconPackages = ["lucide-react", "@heroicons/react", "react-icons", "@tabler/icons-react", "@phosphor-icons/react", "phosphor-react", "@radix-ui/react-icons", "react-feather", "@iconify/react", "@mui/icons-material", "@fortawesome/react-fontawesome"];

const hits = [];
// What the whole repository sets, and the first place the scanned paths need it.
const project = { active: false, reducedMotion: false, gutter: false, tapHighlight: false };
const needs = { hover: 0, firstHover: null, animates: null, scrollLock: null };
let scanned = 0;

const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const snippet = (line) => line.trim().replace(/\s+/g, " ").slice(0, 100);
const shown = (file) => {
  const path = relative(".", file);
  return path && !path.startsWith("..") ? path : file;
};
const add = (rule, file, line, text) => hits.push({ rule, where: `${shown(file)}:${line}`, text });
const readable = (path, stats) => extensions.has(extname(path)) && !path.includes(".min.") && stats.size <= 1_000_000;

function walk(path, visit) {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return console.error(`Skipped ${path}: not found`);
  }
  if (stats.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (name.startsWith(".") || skipped.has(name)) continue;
      walk(join(path, name), visit);
    }
    return;
  }
  visit(path, stats);
}

function readPackage(path) {
  const text = readFileSync(path, "utf8");
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch {
    return console.error(`Skipped ${path}: not valid JSON`);
  }
  const names = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
  const lineOfName = (name) => Math.max(1, lineOf(text, text.indexOf(`"${name}"`)));
  const icons = iconPackages.filter((name) => names.includes(name));
  if (icons.length > 1) add("reuse-one-library-per-job", path, lineOfName(icons[1]), `${icons.length} icon packages: ${icons.join(", ")}`);
  for (const group of sameJob) {
    const present = group.filter((name) => names.includes(name));
    if (present.length > 1) add("reuse-one-library-per-job", path, lineOfName(present[1]), `${present.length} packages for one job: ${present.join(", ")}`);
  }
}

function survey(text) {
  if (/:active\b|(?<![\w-])active:/.test(text)) project.active = true;
  if (/prefers-reduced-motion|useReducedMotion|reducedMotion|motion-reduce:|motion-safe:/.test(text)) project.reducedMotion = true;
  if (/scrollbar-gutter/.test(text)) project.gutter = true;
  if (/-webkit-tap-highlight-color|WebkitTapHighlightColor/.test(text)) project.tapHighlight = true;
}

function scan(file, text) {
  scanned += 1;
  survey(text);
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    for (const [rule, pattern, test] of lineCues) {
      const match = pattern.exec(line);
      if (match && (!test || test(match, line, file, lines, index))) add(rule, file, index + 1, snippet(line));
    }
  });

  for (const [rule, pattern, test] of tagCues) {
    for (const match of text.matchAll(pattern)) {
      if (test(match[0], text, match.index)) add(rule, file, lineOf(text, match.index), snippet(match[0]));
    }
  }

  for (const block of text.matchAll(/(?:^|[\n}])\s*(?:html|body)(?:\s*,\s*(?:html|body))?\s*\{[^}]*/g)) {
    const lock = /\b(overflow(-y)?:\s*hidden|position:\s*fixed)\b/.exec(block[0]);
    if (lock) add("overlays-stable-gutter", file, lineOf(text, block.index + lock.index), snippet(block[0].replace(/^[\s}]+/, "")));
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
      if (/\bkey\s*===?\s*["']Enter["']|["']Enter["']\s*===?\s*[\w.]*\bkey\b|\bcase\s*["']Enter["']\s*:/.test(line)) add("forms-ime-safe-enter", file, index + 1, snippet(line));
    });
  }

  const hover = /:hover\b|(?<![\w-])hover:/.exec(text);
  if (hover && !needs.firstHover) needs.firstHover = { file, line: lineOf(text, hover.index) };
  needs.hover += (text.match(/:hover\b|(?<![\w-])hover:/g) ?? []).length;

  const animation = /@keyframes|animation:|<motion\.|from ["'](framer-motion|motion\/react)["']|\banimate-/.exec(text);
  if (animation && !needs.animates) needs.animates = { file, line: lineOf(text, animation.index) };

  const lock = /react-remove-scroll|@radix-ui\/react-dialog|from ["']vaul["']/.exec(text);
  if (lock && !needs.scrollLock) needs.scrollLock = { file, line: lineOf(text, lock.index) };
}

walk(repo, (path, stats) => readable(path, stats) && survey(readFileSync(path, "utf8")));
for (const root of roots) {
  walk(root, (path, stats) => {
    if (basename(path) === "package.json") return readPackage(path);
    if (readable(path, stats)) scan(path, readFileSync(path, "utf8"));
  });
}

if (needs.hover && !(project.tapHighlight && project.active)) {
  const missing = [!project.tapHighlight && "no -webkit-tap-highlight-color", !project.active && "no :active style"].filter(Boolean).join(" and ");
  add("defaults-no-tap-highlight", needs.firstHover.file, needs.firstHover.line, `Hover styles here: ${needs.hover}, ${missing} anywhere in the project`);
}
if (needs.animates && !project.reducedMotion) add("motion-reduced-motion", needs.animates.file, needs.animates.line, "Animation here and no reduced-motion query anywhere in the project");
if (needs.scrollLock && !project.gutter) add("defaults-scrollbar-gutter", needs.scrollLock.file, needs.scrollLock.line, "A library locks scroll here and no scrollbar-gutter is set anywhere in the project");

const order = [...new Set([...lineCues, ...tagCues].map(([rule]) => rule))];
const rank = (rule) => (order.includes(rule) ? order.indexOf(rule) : order.length);
hits.sort((a, b) => rank(a.rule) - rank(b.rule) || a.where.localeCompare(b.where, undefined, { numeric: true }));

for (const hit of hits) console.log(`${hit.where} - [${hit.rule}] ${hit.text}`);
const rules = new Set(hits.map((hit) => hit.rule)).size;
const files = `${scanned} ${scanned === 1 ? "file" : "files"}`;
console.log(hits.length
  ? `\n${hits.length} ${hits.length === 1 ? "candidate" : "candidates"} for ${rules} ${rules === 1 ? "rule" : "rules"} in ${files}. Open each line before reporting it.`
  : `No candidates in ${files}.`);
