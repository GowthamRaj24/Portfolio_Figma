// Resize + re-encode an image to a lean WebP.
// Usage: node scripts/resize-image.mjs <input> <output> [width] [quality]

import fs from "node:fs";
import sharp from "sharp";

const [inPath, outPath, widthArg, qArg, trimArg] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error(
    "Usage: node scripts/resize-image.mjs <input> <output> [width] [quality] [trim]",
  );
  process.exit(1);
}
const width = Number(widthArg ?? 2000);
const quality = Number(qArg ?? 82);

let pipeline = sharp(inPath);
if (trimArg === "trim") pipeline = pipeline.trim(); // drop transparent border
const info = await pipeline
  .resize({ width, withoutEnlargement: true })
  .webp({ quality })
  .toFile(outPath);

console.log(
  `wrote ${outPath}: ${info.width}x${info.height}, ${(
    fs.statSync(outPath).size / 1024
  ).toFixed(1)}KB (from ${(fs.statSync(inPath).size / 1024 / 1024).toFixed(1)}MB)`,
);
