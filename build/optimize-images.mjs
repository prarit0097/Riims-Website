// build/optimize-images.mjs — one-shot raster image optimizer (build tooling only).
// Requires `sharp` (a build-time-only dev dependency; NOT shipped to the static site).
// Run: node build/optimize-images.mjs
//
// It (re)generates the optimized brand/content rasters under site/assets from the
// same folder in place: heavy PNGs → WebP (universally supported), the social/schema
// logo stays PNG (shrunk), and the OG/LCP hero keeps a JPG (for social crawlers) plus
// a smaller WebP (for the on-page <img>). Old, now-unreferenced PNGs are removed.
import sharp from 'sharp';
import { statSync, existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const A = path.resolve('site/assets');
const kb = (f) => (existsSync(f) ? (statSync(f).size / 1024).toFixed(0) : '0');

// [source, op] — op describes the transform.
const jobs = [
  // Social/schema Organization logo: keep PNG (transparency), shrink 1254→512.
  { src: 'riims-logo.png', to: 'riims-logo.png', fmt: 'png', width: 512 },
  // Header/footer logo mark + favicon/apple-touch/manifest icon: one optimized PNG
  // (kept PNG — Safari/apple-touch icons don't reliably support WebP). Derived 320px.
  { src: 'riims-logo.png', to: 'riims-logo-sm.png', fmt: 'png', width: 320 },
  // OG/LCP hero: keep a shrunk JPG (og:image) + a lighter WebP (the on-page <img>).
  { src: 'hometop.jpg', to: 'hometop.jpg', fmt: 'jpeg', q: 78 },
  { src: 'hometop.jpg', to: 'hometop.webp', fmt: 'webp', q: 78 },
  // Testimonial video tile + hospital tile.
  { src: 'video-testimonial.png', to: 'video-testimonial.webp', fmt: 'webp', q: 78, del: true },
  { src: 'hospital.png', to: 'hospital.webp', fmt: 'webp', q: 80, del: true },
  // Health reels (6).
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ src: `reels/reel-${n}.png`, to: `reels/reel-${n}.webp`, fmt: 'webp', q: 80, del: true })),
  // Doctor default portraits (6). Live site uses admin uploads; these are repo defaults.
  ...['AS', 'RV', 'SI', 'MK', 'PN', 'TR'].map((c) => ({ src: `doctors/doc-${c}.png`, to: `doctors/doc-${c}.webp`, fmt: 'webp', q: 82, del: true })),
];

let before = 0, after = 0;
for (const j of jobs) {
  const src = path.join(A, j.src);
  const to = path.join(A, j.to);
  if (!existsSync(src)) { console.log('  skip (missing):', j.src); continue; }
  const srcKb = +kb(src);
  // Read source into a Buffer first so no file handle stays open on the source —
  // this lets us safely overwrite the source in place on Windows.
  let img = sharp(readFileSync(src));
  if (j.width) img = img.resize({ width: j.width, withoutEnlargement: true });
  if (j.fmt === 'webp') img = img.webp({ quality: j.q, effort: 6 });
  else if (j.fmt === 'jpeg') img = img.jpeg({ quality: j.q, mozjpeg: true });
  else if (j.fmt === 'png') img = img.png({ compressionLevel: 9, palette: true });
  const buf = await img.toBuffer();
  writeFileSync(to, buf);
  const outKb = (buf.length / 1024).toFixed(0);
  console.log(`  ${j.src.padEnd(26)} ${String(srcKb).padStart(5)}KB → ${String(outKb).padStart(5)}KB  ${j.to}`);
  before += srcKb; after += +outKb;
  // Remove the now-unreferenced source PNG (only when it differs from the output).
  if (j.del && j.src !== j.to && existsSync(src)) rmSync(src);
}
console.log(`\n  TOTAL: ${before}KB → ${after}KB  (saved ${(before - after)}KB, ${(100 * (before - after) / before).toFixed(0)}%)`);
