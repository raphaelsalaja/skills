// Checks every skill against the conventions in AGENTS.md, then runs the kit drift check.
// node scripts/check.mjs exits 1 and lists each problem when anything fails.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// Names that share a skill's prefix but are not rule ids: a CSS property and the lab's custom elements.
const notIds = new Set(["color-scheme", "lab-entry", "lab-tune"]);
const read = (path) => readFileSync(join(root, path), "utf8");
const problems = [];
const fail = (where, message) => problems.push(`${where} - ${message}`);

const readme = read("README.md");
const agents = read("AGENTS.md");
const section = (text, heading) => text.split(`\n## ${heading}\n`)[1]?.split("\n## ")[0] ?? "";
const kinds = section(agents, "Two kinds of skill");
const listed = (label) => [...(kinds.split(`**${label}**`)[1]?.split("\n")[0] ?? "").matchAll(/`([a-z-]+)`/g)].map((match) => match[1]);
const principles = listed("Principle");
const procedures = listed("Procedure");
const ownership = section(agents, "Rule ownership");

// GitHub's heading anchors: lowercase, punctuation dropped, spaces to hyphens.
const slug = (heading) => heading.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
const anchors = (text) => new Set([...text.matchAll(/^#+ (.+)$/gm)].map((match) => slug(match[1])));
const withoutFences = (text) => text.replace(/^```[\s\S]*?^```$/gm, (block) => block.replace(/[^\n]/g, ""));

const skills = readdirSync(join(root, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const owners = new Map();

for (const name of skills) {
  const dir = `skills/${name}`;
  const path = `${dir}/SKILL.md`;
  if (!existsSync(join(root, path))) {
    fail(dir, "no SKILL.md");
    continue;
  }
  const text = read(path);
  const [, front = "", body = ""] = text.split(/^---$/m);
  const field = (key) => new RegExp(`^${key}: (.+)$`, "m").exec(front)?.[1].trim();
  const userInvoked = field("disable-model-invocation") === "true";
  const description = field("description");

  if (field("name") !== name) fail(path, `frontmatter name is ${field("name")}, directory is ${name}`);
  if (!description) fail(path, "no description");
  if (!/^# .+$/m.test(body)) fail(path, "no H1");
  for (const heading of ["The pair", "Reporting"]) {
    if (!body.includes(`\n## ${heading}\n`)) fail(path, `no ## ${heading}`);
  }

  const numbered = /^## 1\. /m.test(body);
  if (principles.includes(name) && numbered) fail(path, "a principle skill with numbered steps");
  if (procedures.includes(name) && !numbered) fail(path, "a procedure skill with no ## 1. step");
  if (!principles.includes(name) && !procedures.includes(name)) fail("AGENTS.md", `${name} is in neither kind list`);
  if (!ownership.includes(`| \`${name}\` |`)) fail("AGENTS.md", `${name} has no row in the ownership table`);

  const yamlPath = `${dir}/agents/openai.yaml`;
  if (existsSync(join(root, yamlPath))) {
    const yaml = read(yamlPath);
    if (!/display_name: ".+"/.test(yaml)) fail(yamlPath, "no display_name");
    if (!/short_description: ".+"/.test(yaml)) fail(yamlPath, "no short_description");
    if (/allow_implicit_invocation: false/.test(yaml) !== userInvoked) fail(yamlPath, "allow_implicit_invocation does not match disable-model-invocation");
  } else {
    fail(dir, "no agents/openai.yaml");
  }

  const line = new RegExp(`^- \\[\\*\\*${name}\\*\\*\\]\\(skills/${name}/SKILL\\.md\\): (.+)$`, "m").exec(readme)?.[1];
  const expected = `${description}${userInvoked ? " User-invoked." : ""}`;
  if (!line) fail("README.md", `no line for ${name}`);
  else if (line.replaceAll("**", "") !== expected) fail("README.md", `${name} does not match its description: "${expected}"`);

  // Rule ids: every pair row once in the prose, every own-prefix id in the prose also in the pair.
  const [prose, rest = ""] = body.split("\n## The pair\n");
  const pair = rest.split("\n## ")[0];
  const ids = [...pair.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((match) => match[1]);
  if (!pair.includes("| Rule | Broken | Replacement | Severity |")) fail(path, "the pair header is not | Rule | Broken | Replacement | Severity |");
  for (const [row, id] of pair.matchAll(/^\| `([a-z0-9-]+)` \|.*$/gm)) {
    if (!/\| `(HIGH|MEDIUM|LOW)` \|$/.test(row)) fail(path, `${id} has no HIGH, MEDIUM or LOW in its last column`);
  }
  const severity = /^\*\*Severity\.\*\* (.+)$/m.exec(rest.split("\n## Reporting\n")[1] ?? "")?.[1];
  if (!severity) fail(path, "no **Severity.** paragraph under ## Reporting");
  else if (severity.split(/\s+/).length > 60) fail(path, `a ${severity.split(/\s+/).length}-word Severity paragraph`);
  for (const id of ids) {
    if (!id.startsWith(`${name}-`)) fail(path, `${id} does not start with ${name}-`);
    if (owners.has(id)) fail(path, `${id} is also in ${owners.get(id)}`);
    owners.set(id, path);
    const count = prose.split(`\`${id}\``).length - 1;
    if (count !== 1) fail(path, `${id} appears ${count} times in the prose`);
  }
  for (const [, id] of prose.matchAll(new RegExp(`\`(${name}-[a-z0-9-]+)\``, "g"))) {
    if (!ids.includes(id) && !notIds.has(id)) fail(path, `${id} is in the prose but not the pair`);
  }

  // Sentences stay at or under 30 words, a code span counting as one.
  const offset = text.slice(0, text.indexOf(body)).split("\n").length - 1;
  withoutFences(body).split("\n").forEach((raw, index) => {
    if (!raw.trim() || /^\s*(\||#)/.test(raw)) return;
    const plain = raw.replace(/`[^`]*`/g, "CODE").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replaceAll("**", "");
    for (const sentence of plain.split(/(?<=[.!?])\s+(?=[A-Z"(\d])/)) {
      const words = sentence.split(/\s+/).filter(Boolean).length;
      if (words > 30) fail(`${path}:${offset + index + 1}`, `a ${words}-word sentence`);
    }
  });

  // Links resolve inside the skill, never into a sibling.
  for (const file of readdirSync(join(root, dir)).filter((entry) => entry.endsWith(".md"))) {
    const source = read(`${dir}/${file}`);
    for (const [, target] of withoutFences(source).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^https?:/.test(target)) continue;
      const [linkedFile, anchor] = target.split("#");
      if (linkedFile.startsWith("../")) {
        fail(`${dir}/${file}`, `links into a sibling skill: ${target}`);
        continue;
      }
      const linked = linkedFile ? `${dir}/${linkedFile}` : `${dir}/${file}`;
      if (!existsSync(join(root, linked))) fail(`${dir}/${file}`, `links to a missing file: ${target}`);
      else if (anchor && linked.endsWith(".md") && !anchors(read(linked)).has(anchor)) fail(`${dir}/${file}`, `links to a missing heading: ${target}`);
    }
  }
}

// Punctuation in every markdown file: straight quotes, no em dashes, en dashes for numeric ranges only.
const markdown = ["README.md", "AGENTS.md", "CLAUDE.md", ...skills.flatMap((name) => readdirSync(join(root, "skills", name)).filter((file) => file.endsWith(".md")).map((file) => `skills/${name}/${file}`))];
for (const path of markdown) {
  withoutFences(read(path)).split("\n").forEach((line, index) => {
    const where = `${path}:${index + 1}`;
    if (line.includes("\u2014")) fail(where, "an em dash");
    if (/[\u201c\u201d\u2018\u2019]/.test(line)) fail(where, "a curly quote");
    if (/(?<![\d.%])\u2013|\u2013(?![\d.])/.test(line)) fail(where, "an en dash outside a numeric range");
  });
}

const kit = spawnSync("node", [join(root, "kit/sync.mjs"), "--check"], { encoding: "utf8" });
if (kit.status !== 0) fail("kit", kit.stderr.trim());

if (problems.length) {
  console.error(`${problems.length} problems:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  process.exit(1);
}

console.log(`${skills.length} skills match AGENTS.md. ${kit.stdout.trim()}`);
