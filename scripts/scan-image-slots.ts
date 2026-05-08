#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const IMAGES_MD = join(ROOT, "картинки.md");

// Sections in картинки.md that document non-<ImageSlot> assets (e.g. brand
// favicons / OG images referenced from `metadata`, demo seed). Headings under
// these sections are excluded from src-md sync checks.
const NON_SLOT_SECTIONS = new Set(["Brand assets"]);

// File globs (substrings) within src/ that contain dev-only showcase slots
// allowed to live without picture-spec entries. Currently `_kitchen` (atoms
// showcase served only on /_kitchen in dev).
const SRC_DEVONLY_PATH_PARTS = ["views\\kitchen", "views/kitchen"];

function* walkSrc(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walkSrc(full);
    else if (/\.(ts|tsx)$/.test(entry)) yield full;
  }
}

function getSlotsInSrc(): { literal: Set<string>; templated: Set<string> } {
  const literal = new Set<string>();
  const templated = new Set<string>();

  // Two regexes: simple slot="..." and templated slot={`...${expr}...`}
  const literalRe = /slot="([^"]+)"/g;
  const templateRe = /slot=\{`([^`]+)`\}/g;

  for (const file of walkSrc(SRC_DIR)) {
    if (SRC_DEVONLY_PATH_PARTS.some((p) => file.includes(p))) continue;
    const content = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    literalRe.lastIndex = 0;
    while ((m = literalRe.exec(content))) {
      const v = m[1];
      if (v) literal.add(v);
    }
    templateRe.lastIndex = 0;
    while ((m = templateRe.exec(content))) {
      // Convert ${expr} into a placeholder marker so we can compare against
      // md template entries (which use {slug}, {id}, {1..N}).
      const v = m[1];
      if (!v) continue;
      const normalized = v.replace(/\$\{[^}]+\}/g, "{$}");
      templated.add(normalized);
    }
  }
  return { literal, templated };
}

function stripFencedCodeBlocks(md: string): string {
  // Replace ```...``` fenced blocks with empty lines (preserve line numbers).
  return md.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, ""));
}

function getSlotsInImagesMd(): Set<string> {
  const raw = readFileSync(IMAGES_MD, "utf8");
  const md = stripFencedCodeBlocks(raw);
  const slots = new Set<string>();
  // Track current H2 section title to skip non-slot sections.
  let currentH2: string | null = null;
  const lines = md.split(/\r?\n/);
  const headingRe = /^#{2,6}\s+`([^`]+)`\s+·/;
  const h2Re = /^##\s+(.+?)(?:\s+<a\s.*?>.*?<\/a>)?\s*$/;

  for (const line of lines) {
    const h2 = h2Re.exec(line);
    if (h2 && !line.startsWith("###")) {
      currentH2 = (h2[1] ?? "").trim();
      continue;
    }
    if (currentH2 && NON_SLOT_SECTIONS.has(currentH2)) continue;
    const m = headingRe.exec(line);
    if (m && m[1]) slots.add(m[1]);
  }
  return slots;
}

function mdEntryToRegex(entry: string): RegExp {
  // Replace {anything} or {1..N} with a path-segment matcher.
  // Step 1: replace placeholders FIRST with a sentinel that survives escaping.
  const SENTINEL = "\x00PH\x00";
  const withSentinels = entry.replace(/\{[^}]+\}/g, SENTINEL);
  // Step 2: escape regex specials in the rest of the string.
  const escaped = withSentinels.replace(/[.+?^$()|[\]\\{}]/g, "\\$&");
  // Step 3: substitute sentinels with path-segment matcher.
  const withPlaceholders = escaped.split(SENTINEL).join("[^/]+");
  return new RegExp("^" + withPlaceholders + "$");
}

function main() {
  const { literal, templated } = getSlotsInSrc();
  const inMd = getSlotsInImagesMd();

  const mdLiteral = new Set<string>();
  const mdPatterns: { raw: string; re: RegExp }[] = [];
  for (const entry of inMd) {
    if (entry.includes("{")) {
      mdPatterns.push({ raw: entry, re: mdEntryToRegex(entry) });
    } else {
      mdLiteral.add(entry);
    }
  }

  const orphansInSrc: string[] = [];
  for (const slot of literal) {
    if (mdLiteral.has(slot)) continue;
    if (mdPatterns.some(({ re }) => re.test(slot))) continue;
    orphansInSrc.push(slot);
  }
  for (const slot of templated) {
    // Templated src entry: must match at least one md pattern.
    const matchableSlot = slot.replace(/\{\$\}/g, "x");
    const ok = mdPatterns.some(({ re }) => re.test(matchableSlot));
    if (!ok) orphansInSrc.push("(templated) " + slot);
  }

  const orphansInMd: string[] = [];
  for (const entry of mdLiteral) {
    if (literal.has(entry)) continue;
    orphansInMd.push(entry);
  }
  // Templated md entries are pattern-only — not required to be referenced literally.

  let bad = 0;
  if (orphansInSrc.length) {
    console.error("Slot IDs у src без запису в картинки.md:");
    for (const s of orphansInSrc) console.error("  -", s);
    bad++;
  }
  if (orphansInMd.length) {
    console.error("Slot IDs у картинки.md без використання в src (orphan):");
    for (const s of orphansInMd) console.error("  -", s);
    bad++;
  }
  if (bad === 0) {
    const total = literal.size + templated.size;
    console.log(`OK — ${total} slots aligned with картинки.md`);
  }
  process.exit(bad ? 1 : 0);
}

main();
