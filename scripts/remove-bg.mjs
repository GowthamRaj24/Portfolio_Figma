// Remove a (near-)black background from an image and write a transparent PNG.
//
// Strategy (handles soft 3D-render edges cleanly):
//   1. Flood-fill from the four edges through near-black pixels -> background
//      mask. This keeps interior dark areas (visor, crevices) OPAQUE because
//      they are not connected to the outer background.
//   2. Binary alpha (bg = 0, subject = 255), then a 1px feather (box blur) so
//      the silhouette is anti-aliased.
//   3. Edge "decontamination": for partial-alpha pixels, unpremultiply the
//      colour (divide by alpha) to strip the black bleed -> no dark halo.
//   4. Optional area-average downscale (premultiplied) for a lean file.
//
// Usage: node scripts/remove-bg.mjs <input> <output> [maxWidth] [threshold]

import fs from "node:fs";
import { PNG } from "pngjs";

const [inPath, outPath, maxWArg, tArg] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("Usage: node scripts/remove-bg.mjs <input> <output> [maxWidth] [threshold]");
  process.exit(1);
}
const maxW = Number(maxWArg ?? 900);
const T = Number(tArg ?? 64); // luminance threshold for "background black"
const FEATHER = 1;

const src = PNG.sync.read(fs.readFileSync(inPath));
const w = src.width;
const h = src.height;
const data = src.data; // RGBA buffer
console.log(`source: ${w}x${h}, ${(fs.statSync(inPath).size / 1024).toFixed(1)}KB`);

const lumAt = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

// 1. Flood-fill background from the edges through near-black pixels.
const bg = new Uint8Array(w * h);
const stack = [];
const seed = (x, y) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const p = y * w + x;
  if (bg[p]) return;
  if (lumAt(p * 4) < T) {
    bg[p] = 1;
    stack.push(p);
  }
};
for (let x = 0; x < w; x++) {
  seed(x, 0);
  seed(x, h - 1);
}
for (let y = 0; y < h; y++) {
  seed(0, y);
  seed(w - 1, y);
}
while (stack.length) {
  const p = stack.pop();
  const x = p % w;
  const y = (p - x) / w;
  seed(x + 1, y);
  seed(x - 1, y);
  seed(x, y + 1);
  seed(x, y - 1);
}
let bgCount = 0;
for (let p = 0; p < w * h; p++) bgCount += bg[p];
console.log(`background: ${((100 * bgCount) / (w * h)).toFixed(1)}%`);

// 2. Base alpha + feather.
const alpha = new Float32Array(w * h);
for (let p = 0; p < w * h; p++) alpha[p] = bg[p] ? 0 : 255;

function boxBlur(s, r) {
  const win = 2 * r + 1;
  const t = new Float32Array(w * h);
  const o = new Float32Array(w * h);
  const cl = (v, m) => (v < 0 ? 0 : v > m ? m : v);
  for (let y = 0; y < h; y++) {
    let a = 0;
    for (let k = -r; k <= r; k++) a += s[y * w + cl(k, w - 1)];
    for (let x = 0; x < w; x++) {
      t[y * w + x] = a / win;
      a -= s[y * w + cl(x - r, w - 1)];
      a += s[y * w + cl(x + r + 1, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let a = 0;
    for (let k = -r; k <= r; k++) a += t[cl(k, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      o[y * w + x] = a / win;
      a -= t[cl(y - r, h - 1) * w + x];
      a += t[cl(y + r + 1, h - 1) * w + x];
    }
  }
  return o;
}
const aF = FEATHER > 0 ? boxBlur(alpha, FEATHER) : alpha;

// 3. Write alpha + decontaminate edge colour (unpremultiply).
for (let p = 0; p < w * h; p++) {
  const i = p * 4;
  let a = aF[p];
  a = a < 0 ? 0 : a > 255 ? 255 : a;
  if (a > 0 && a < 255) {
    const f = 255 / a;
    data[i] = Math.min(255, data[i] * f);
    data[i + 1] = Math.min(255, data[i + 1] * f);
    data[i + 2] = Math.min(255, data[i + 2] * f);
  }
  data[i + 3] = Math.round(a);
}

// 4. Optional premultiplied area-average downscale.
function downscale(nw) {
  const nh = Math.round((h * nw) / w);
  const out = Buffer.alloc(nw * nh * 4);
  const sx = w / nw;
  const sy = h / nh;
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.min(w, Math.ceil((x + 1) * sx));
      const y0 = Math.floor(y * sy);
      const y1 = Math.min(h, Math.ceil((y + 1) * sy));
      let r = 0;
      let g = 0;
      let b = 0;
      let aSum = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * w + xx) * 4;
          const av = data[i + 3] / 255;
          r += data[i] * av;
          g += data[i + 1] * av;
          b += data[i + 2] * av;
          aSum += data[i + 3];
          n++;
        }
      }
      const o = (y * nw + x) * 4;
      const aMean = aSum / n;
      const norm = aMean / 255 || 1;
      out[o] = Math.min(255, Math.round(r / n / norm));
      out[o + 1] = Math.min(255, Math.round(g / n / norm));
      out[o + 2] = Math.min(255, Math.round(b / n / norm));
      out[o + 3] = Math.round(aMean);
    }
  }
  return { data: out, width: nw, height: nh };
}

const result = w > maxW ? downscale(maxW) : { data, width: w, height: h };

const png = new PNG({ width: result.width, height: result.height });
png.data = Buffer.from(result.data);
fs.writeFileSync(outPath, PNG.sync.write(png));
console.log(
  `wrote ${outPath}: ${result.width}x${result.height}, ${(
    fs.statSync(outPath).size / 1024
  ).toFixed(1)}KB`,
);
