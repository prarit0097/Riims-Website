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
    // Absolute (/foo) resolve from the site root; relative from the file's dir.
    const target = clean.startsWith('/') ? join(ROOT, clean.slice(1)) : resolve(dir, clean);
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

// JSON-LD: every structured-data block must be valid JSON
let ldOk = 0;
for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); ldOk++; }
    catch (e) { errors++; console.error(`INVALID JSON-LD: ${file.replace(ROOT, 'site')} -> ${e.message}`); }
  }
}

// Every page must have exactly one <h1> and a <title>/description
for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) { errors++; console.error(`H1 COUNT ${h1} (want 1): ${file.replace(ROOT, 'site')}`); }
  if (!/<title>[^<]+<\/title>/.test(html)) { errors++; console.error(`MISSING <title>: ${file.replace(ROOT, 'site')}`); }
  if (!/<meta name="description" content="[^"]+"/.test(html)) { errors++; console.error(`MISSING description: ${file.replace(ROOT, 'site')}`); }
}

// No dead anchors
for (const file of walk(ROOT)) {
  if (/href="#"/.test(readFileSync(file, 'utf8'))) { errors++; console.error(`DEAD ANCHOR href="#": ${file.replace(ROOT, 'site')}`); }
}

// Stale domain guard — the old placeholder domain must never appear in output
for (const file of walk(ROOT)) {
  if (/www\.riims\.in/.test(readFileSync(file, 'utf8'))) { errors++; console.error(`STALE DOMAIN www.riims.in: ${file.replace(ROOT, 'site')}`); }
}

const pageCount = walk(ROOT).length;
console.log(`Checked ${checked} local refs + ${ldOk} JSON-LD blocks across ${pageCount} pages. ${errors} problem(s).`);
process.exit(errors ? 1 : 0);
