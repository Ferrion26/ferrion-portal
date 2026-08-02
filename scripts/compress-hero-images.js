#!/usr/bin/env node
// Converts all PNGs in public/images/Hero Visual to compressed WebP.
// Usage: node scripts/compress-hero-images.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "images", "Hero Visual");

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const inPath = path.join(DIR, file);
    const outPath = path.join(DIR, file.replace(/\.png$/i, ".webp"));
    const before = fs.statSync(inPath).size;

    await sharp(inPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    const after = fs.statSync(outPath).size;
    totalBefore += before;
    totalAfter += after;
    console.log(
      `${file} -> ${path.basename(outPath)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${(100 - (after / before) * 100).toFixed(0)}% smaller)`
    );
  }

  console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
