// Read share tags from a page URL or an HTML file and print the preview report.
// node check.mjs <url-or-file> --image og.png --video og.mp4 --board .preview/<page>/board.js
// --image and --video measure those files when the tagged URL cannot be fetched.
// --board writes board.js and copies the still and the loop beside it.

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

const STILL = { width: 1200, height: 630 };
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_HTML = 1024 * 1024;
const MAX_TOGETHER = 10 * 1024 * 1024;
const MAX_LOOP = 6;

const args = process.argv.slice(2);
const flags = {};
const position = [];
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg.startsWith("--")) {
    flags[arg.slice(2)] = args[i + 1];
    i += 1;
  } else position.push(arg);
}

const input = position[0];
if (!input) {
  console.error("Pass a page URL or an HTML file.");
  process.exit(1);
}

const list = (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

function meta(html) {
  const tags = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "");
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (!key) continue;
    const value = attrs.content ?? attrs.value ?? "";
    const last = key === "og:type" || key === "twitter:card" || key.startsWith("og:image:") || key.startsWith("og:video");
    if (last || !(key in tags)) tags[key] = value;
  }
  return tags;
}

function lineOf(html, prop) {
  const lines = html.split(/\n/);
  const needle = prop.toLowerCase();
  const index = lines.findIndex((line) => line.toLowerCase().includes(needle));
  return index === -1 ? 1 : index + 1;
}

function classify(value) {
  if (!value) return "missing";
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return "https";
    if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return "local";
    if (url.protocol === "http:") return "http";
  } catch {
    return "relative";
  }
  return "relative";
}

function dimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), type: "png" };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5), type: "jpeg" };
      }
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
        offset += 2;
        continue;
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X" && buf.length >= 30) {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
        type: "webp",
      };
    }
    if (chunk === "VP8 " && buf.length >= 30) {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, type: "webp" };
    }
    if (chunk === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, type: "webp" };
    }
  }
  const head = buf.toString("utf8", 0, 120).trimStart().toLowerCase();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return { width: 0, height: 0, type: "svg" };
  return null;
}

function flat(buf) {
  const result = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", "pipe:0", "-frames:v", "1", "-vf", "scale=8:8", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"],
    { input: buf, maxBuffer: 1024 * 1024 },
  );
  if (result.status !== 0 || result.stdout.length < 8 * 8 * 3) return null;
  let min = 255;
  let max = 0;
  for (let i = 0; i < result.stdout.length; i += 3) {
    const luma = 0.2126 * result.stdout[i] + 0.7152 * result.stdout[i + 1] + 0.0722 * result.stdout[i + 2];
    min = Math.min(min, luma);
    max = Math.max(max, luma);
  }
  return max - min < 12;
}

function probe(path) {
  const result = spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", path], { encoding: "utf8" });
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

async function loadHtml(target) {
  if (/^https?:\/\//.test(target)) {
    const response = await fetch(target);
    if (!response.ok) throw new Error(`page returned ${response.status}`);
    return { html: await response.text(), base: target };
  }
  return { html: readFileSync(target, "utf8"), base: target };
}

async function loadBytes(target) {
  if (!target) return null;
  if (/^https?:\/\//.test(target)) {
    const response = await fetch(target);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }
  try {
    return readFileSync(target);
  } catch {
    return null;
  }
}

function resolveTarget(value, base) {
  if (!value) return null;
  if (/^https?:\/\//.test(base)) {
    try {
      return new URL(value, base).href;
    } catch {
      return null;
    }
  }
  if (/^https?:\/\//.test(value)) return value;
  return join(dirname(base), value);
}

const mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

const { html, base } = await loadHtml(input);
const tags = meta(html);
const pageFile = /^https?:\/\//.test(input) ? "index.html" : basename(input);
const cite = (prop) => `${pageFile}:${lineOf(html, prop)}`;
const findings = [];
const notVerified = [];

let pageUrl;
try {
  pageUrl = /^https?:\/\//.test(input) ? new URL(input) : null;
} catch {
  pageUrl = null;
}
const localPage = pageUrl ? pageUrl.hostname === "localhost" || pageUrl.hostname === "127.0.0.1" : true;
if (localPage) notVerified.push("public https URL, the page is on localhost");

const videoMode = Boolean(tags["og:video"] || flags.video);
const stillKeys = ["og:title", "og:description", "og:site_name", "og:type", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt", "twitter:card"];
const videoKeys = ["og:video", "og:video:secure_url", "og:video:type", "og:video:width", "og:video:height"];
const missing = stillKeys.filter((key) => !tags[key]);
if (videoMode) missing.push(...videoKeys.filter((key) => !tags[key]));
const wrong = [];
if (tags["twitter:card"] && tags["twitter:card"] !== "summary_large_image") wrong.push(`twitter:card is ${tags["twitter:card"]}`);
if (!videoMode && tags["og:type"] && tags["og:type"] !== "website" && tags["og:type"] !== "article") wrong.push(`og:type is ${tags["og:type"]}`);
if (videoMode && tags["og:type"] && tags["og:type"] !== "video.other") wrong.push("og:type is not video.other");
if (missing.length || wrong.length) {
  const parts = [];
  if (missing.length) parts.push(`missing ${list(missing)}`);
  parts.push(...wrong);
  const high = missing.includes("og:title") || missing.includes("og:image");
  findings.push({
    rule: "preview-required-tags",
    severity: high ? "HIGH" : "MEDIUM",
    file: missing.includes("og:image") || missing.includes("og:title") ? `${pageFile}:1` : cite(missing[0] || "og:type"),
    note: parts.join(", "),
  });
}

const urlNotes = [];
for (const key of ["og:image", "og:video", "og:video:secure_url"]) {
  if (!tags[key]) continue;
  const kind = classify(tags[key]);
  if (kind === "relative") urlNotes.push(`${key} is relative`);
  else if (kind === "http") urlNotes.push(`${key} is not https`);
}
if (urlNotes.length) {
  findings.push({ rule: "preview-absolute-url", severity: "MEDIUM", file: cite("og:image"), note: list(urlNotes) });
}

let imageBuf = null;
let imageName = "";
if (tags["og:image"]) imageBuf = await loadBytes(resolveTarget(tags["og:image"], base));
if (!imageBuf && flags.image) {
  imageBuf = await loadBytes(flags.image);
  if (!tags["og:image"]) notVerified.push("the still file was passed with --image and is not tagged yet");
}
if (!imageBuf && tags["og:image"]) {
  findings.push({ rule: "preview-no-blank-card", severity: "HIGH", file: cite("og:image"), note: "og:image did not load, so the cards are blank" });
}

const sizeNotes = [];
let imageDim = null;
if (Buffer.byteLength(html) > MAX_HTML) sizeNotes.push(`HTML is ${mb(Buffer.byteLength(html))}, the limit is 1MB`);
if (imageBuf) {
  imageDim = dimensions(imageBuf);
  if (!imageDim) sizeNotes.push("the image could not be measured");
  else if (imageDim.type === "svg" || !["png", "jpeg", "webp"].includes(imageDim.type)) sizeNotes.push(`${imageDim.type} is not png, jpeg or webp`);
  else if (imageDim.width !== STILL.width || imageDim.height !== STILL.height) {
    const floor = imageDim.width < 150 || imageDim.height < 150 ? ", under the 150px floor" : imageDim.width < 900 ? ", under the 900px width" : "";
    sizeNotes.push(`${imageDim.width}×${imageDim.height}${floor}, the frame is 1200×630`);
  }
  if (imageBuf.length > MAX_IMAGE) sizeNotes.push(`the still is ${mb(imageBuf.length)}, the limit is 5MB`);
  const declaredW = tags["og:image:width"];
  const declaredH = tags["og:image:height"];
  if (imageDim && declaredW && declaredH && (declaredW !== String(imageDim.width) || declaredH !== String(imageDim.height))) {
    sizeNotes.push(`declared ${declaredW}×${declaredH} but the file is ${imageDim.width}×${imageDim.height}`);
  }
  if (imageDim && ["png", "jpeg", "webp"].includes(imageDim.type)) {
    const blank = flat(imageBuf);
    if (blank === null) notVerified.push("blank-card sample, ffmpeg could not read the still");
    else if (blank) findings.push({ rule: "preview-no-blank-card", severity: "HIGH", file: cite("og:image"), note: "the still is one flat colour" });
  }
  imageName = imageDim?.type === "jpeg" ? "og.jpg" : imageDim?.type === "webp" ? "og.webp" : "og.png";
}
if (sizeNotes.length) findings.push({ rule: "preview-image-size", severity: "MEDIUM", file: cite("og:image"), note: list(sizeNotes) });

if (tags["og:title"]) {
  const title = tags["og:title"];
  const bytes = Buffer.byteLength(title);
  const notes = [];
  if (title.length > 70) notes.push(`${title.length} characters, the limit is 70`);
  if (bytes > 70) notes.push(`${bytes} bytes, the limit is 70`);
  if (notes.length) findings.push({ rule: "preview-title-fits", severity: "MEDIUM", file: cite("og:title"), note: list(notes) });
  notVerified.push("iMessage title at 2 lines, measured on the board");
}

if (tags["og:description"]) {
  const description = tags["og:description"];
  const bytes = Buffer.byteLength(description);
  const notes = [];
  if (description.length > 200) notes.push(`${description.length} characters, the limit is 200`);
  if (bytes > 350) notes.push(`${bytes} bytes, the limit is 350`);
  if (notes.length) findings.push({ rule: "preview-description-fits", severity: "MEDIUM", file: cite("og:description"), note: list(notes) });
}

let videoPath = null;
let videoNote = videoMode ? "" : "Video: skipped, no og:video";
if (videoMode) {
  let videoBuf = null;
  if (tags["og:video"]) videoBuf = await loadBytes(resolveTarget(tags["og:video"], base));
  if (!videoBuf && flags.video) videoBuf = await loadBytes(flags.video);
  const loopNotes = [];
  if (tags["og:video:type"] && tags["og:video:type"] !== "video/mp4") loopNotes.push(`og:video:type is ${tags["og:video:type"]}`);
  if (tags["og:video:width"] && tags["og:video:width"] !== "1200") loopNotes.push(`og:video:width is ${tags["og:video:width"]}`);
  if (tags["og:video:height"] && tags["og:video:height"] !== "630") loopNotes.push(`og:video:height is ${tags["og:video:height"]}`);
  if (!videoBuf) {
    if (tags["og:video"]) loopNotes.push("the video file did not load");
    else notVerified.push("the loop file");
  } else {
    videoPath = join(tmpdir(), `preview-loop-${process.pid}.mp4`);
    writeFileSync(videoPath, videoBuf);
    const info = probe(videoPath);
    const stream = info?.streams?.find((item) => item.codec_type === "video");
    const audio = info?.streams?.some((item) => item.codec_type === "audio");
    if (!stream) loopNotes.push("the file has no video stream");
    else {
      if (stream.codec_name !== "h264") loopNotes.push(`codec is ${stream.codec_name}, the file is H.264`);
      if (stream.pix_fmt && stream.pix_fmt !== "yuv420p") loopNotes.push(`pixels are ${stream.pix_fmt}`);
      if (Number(stream.width) !== 1200 || Number(stream.height) !== 630) loopNotes.push(`${stream.width}×${stream.height}, the frame is 1200×630`);
      const duration = Number(info.format?.duration ?? stream.duration);
      if (Number.isFinite(duration) && duration > MAX_LOOP + 0.05) loopNotes.push(`${duration.toFixed(1)}s, the limit is 6s`);
    }
    if (audio) loopNotes.push("the file has a soundtrack");
    const together = (imageBuf?.length ?? 0) + videoBuf.length;
    if (together > MAX_TOGETHER) loopNotes.push(`still and video are ${mb(together)}, the limit is 10MB`);
  }
  if (loopNotes.length) findings.push({ rule: "preview-video-loops", severity: "MEDIUM", file: cite("og:video"), note: list(loopNotes) });
}

const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);
const high = findings.filter((finding) => finding.severity === "HIGH").length;
const verdict = high ? "Block" : "Approve";
const counts = new Map();
for (const finding of findings) {
  const key = `${finding.rule}|${finding.severity}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const uniqueNotes = [...new Set(notVerified)];
const lines = [`Scope: ${input}`, `Verdict: ${verdict}${high ? `, ${high} HIGH` : ""}`, "", "Findings"];
if (!findings.length) lines.push("None");
findings.forEach((finding, index) => lines.push(`${index + 1}. ${finding.severity}  ${finding.file} - [${finding.rule}] ${finding.note}`));
lines.push("", "Summary", "| Rule | Count | Severity |", "| --- | --- | --- |");
if (!counts.size) lines.push("| | 0 | |");
for (const [key, count] of counts) {
  const [rule, severity] = key.split("|");
  lines.push(`| ${rule} | ${count} | ${severity} |`);
}
if (videoNote) lines.push("", videoNote);
if (uniqueNotes.length) lines.push("", `Not verified: ${uniqueNotes.join("; ")}`);
console.log(lines.join("\n"));

if (flags.board) {
  mkdirSync(dirname(flags.board), { recursive: true });
  if (imageBuf && imageName) writeFileSync(join(dirname(flags.board), imageName), imageBuf);
  if (videoPath) copyFileSync(videoPath, join(dirname(flags.board), "og.mp4"));
  const host = pageUrl?.host ?? "";
  const data = {
    url: pageUrl?.href ?? input,
    host,
    title: tags["og:title"] ?? "",
    description: tags["og:description"] ?? "",
    site: tags["og:site_name"] ?? "",
    image: imageBuf ? imageName : "",
    video: videoPath ? "og.mp4" : "",
    alt: tags["og:image:alt"] ?? "",
    accent: /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(tags["theme-color"] ?? "") ? tags["theme-color"] : "",
    verdict,
    findings,
    notVerified: uniqueNotes,
  };
  writeFileSync(flags.board, `window.preview = ${JSON.stringify(data, null, 2)};\n`);
}

process.exit(verdict === "Block" ? 1 : 0);
