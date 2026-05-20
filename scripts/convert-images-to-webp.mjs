// Converts every public/images/**/*.png to a sibling .webp (quality 80).
//
// next.config.mjs sets `images.unoptimized: true` (runtime sharp is too heavy
// for the 2 GB VPS), so the browser downloads the raw source file as-is —
// shipping WebP instead of multi-MB PNG is a large, direct win.
//
// Skips any PNG that already has a .webp sibling. Does not delete PNGs.
import { readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const imagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const pngs = (await walk(imagesDir)).filter((f) => f.toLowerCase().endsWith(".png"));
let converted = 0;
let skipped = 0;

for (const png of pngs) {
  const webp = `${png.slice(0, -4)}.webp`;
  try {
    await stat(webp);
    skipped += 1;
    continue;
  } catch {
    // no .webp sibling yet — convert
  }
  const { size } = await sharp(png).webp({ quality: 80 }).toFile(webp);
  const before = (await stat(png)).size;
  const rel = png.split(/public[\\/]/)[1];
  console.log(`${rel}  ${(before / 1024).toFixed(0)}KB -> ${(size / 1024).toFixed(0)}KB`);
  converted += 1;
}

console.log(`\nConverted ${converted}, skipped ${skipped} (already had .webp).`);
