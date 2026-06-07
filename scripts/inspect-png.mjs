import fs from "node:fs";
import { PNG } from "pngjs";

const p = process.argv[2];
const png = PNG.sync.read(fs.readFileSync(p));
const { width: w, height: h, data } = png;
const px = (x, y) => {
  const i = (y * w + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
console.log("dims", w, "x", h, `${(fs.statSync(p).size / 1024).toFixed(1)}KB`);
console.log("TL", px(0, 0), "TR", px(w - 1, 0));
console.log("BL", px(0, h - 1), "BR", px(w - 1, h - 1));
console.log("center", px(w >> 1, h >> 1));
let transp = 0;
let white = 0;
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] < 10) transp++;
  if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245 && data[i + 3] > 245)
    white++;
}
const n = w * h;
console.log("fully-transparent %", ((100 * transp) / n).toFixed(1));
console.log("near-white-opaque %", ((100 * white) / n).toFixed(1));
