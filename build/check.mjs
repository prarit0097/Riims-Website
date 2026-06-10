/* Integrity check: every local href/src in the generated site resolves to a
   real file, and key assets exist. Run: node build/check.mjs */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'site');

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

const skip = (u) => !u || u.startsWith('http') || u.startsWith('#') || u.startsWith('tel:')
  || u.startsWith('mailto:') || u.startsWith('data:') || u.startsWith('//');

let errors = 0, checked = 0;
for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  const dir = dirname(file);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (skip(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    checked++;
    const target = resolve(dir, clean);
    if (!existsSync(target)) {
      errors++;
      console.error(`MISSING: ${file.replace(ROOT, 'site')} -> ${ref}`);
    }
  }
}

// CSS background images referenced from site.css
const css = readFileSync(join(ROOT, 'css', 'site.css'), 'utf8');
for (const m of css.matchAll(/url\('([^']+)'\)/g)) {
  const target = resolve(join(ROOT, 'css'), m[1]);
  checked++;
  if (!existsSync(target)) { errors++; console.error(`MISSING CSS asset: ${m[1]}`); }
}

console.log(`Checked ${checked} local references across ${walk(ROOT).length} pages. ${errors} missing.`);
process.exit(errors ? 1 : 0);
