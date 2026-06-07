// Give the moon a transparent background by deriving alpha from luminance:
// the black sky + shadowed side (dark) -> transparent, the lit face -> opaque,
// with a soft ramp across the terminator. (Moon is the only bright thing, so a
// simple luminance key is enough - no flood-fill needed.)

import sharp from "sharp";

const IN = process.argv[2] ?? "public/moon.webp";
const OUT = process.argv[3] ?? "public/moon.webp";
const lo = 16; // below this luminance -> fully transparent
const hi = 50; // above this -> fully opaque

const { data, info } = await sharp(IN)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

for (let p = 0; p < w * h; p++) {
  const i = p * 4;
  const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  let a = (lum - lo) / (hi - lo);
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  data[i + 3] = Math.round(a * 255);
}

await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(OUT);

console.log(`moon cutout written: ${OUT} (${w}x${h})`);
