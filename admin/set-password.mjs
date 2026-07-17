/* Set / change admin passwords. Usage:
     node admin/set-password.mjs "YourStrongPassword"          -> sets the OWNER password
     node admin/set-password.mjs --seo "SeoPassword"           -> sets the SEO-role password
   Writes data/admin-config.json (gitignored): scrypt hash(es) + session secret.
   Owner mode rewrites the file (fresh session secret). SEO mode requires an existing
   config and only adds/replaces seoSalt+seoPassHash, preserving owner login + secret. */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const isSeo = process.argv[2] === '--seo';
const password = isSeo ? process.argv[3] : process.argv[2];
if (!password || password.length < 8) {
  console.error(isSeo
    ? 'Usage: node admin/set-password.mjs --seo "<password with 8+ characters>"'
    : 'Usage: node admin/set-password.mjs "<password with 8+ characters>"');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');
const CONFIG_PATH = join(DATA, 'admin-config.json');

mkdirSync(DATA, { recursive: true });

if (isSeo) {
  if (!existsSync(CONFIG_PATH)) {
    console.error('Set the owner password first: node admin/set-password.mjs "<password>"');
    process.exit(1);
  }
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const seoSalt = randomBytes(16);
  cfg.seoSalt = seoSalt.toString('hex');
  cfg.seoPassHash = scryptSync(password, seoSalt, 32).toString('hex');
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  console.log('SEO-role password set. It works immediately — no restart needed.');
} else {
  const salt = randomBytes(16);
  const cfg = { salt: salt.toString('hex'), passHash: scryptSync(password, salt, 32).toString('hex'), secret: randomBytes(32).toString('hex') };
  // Preserve an existing SEO credential when the owner rotates their own password.
  if (existsSync(CONFIG_PATH)) {
    try {
      const old = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      if (old.seoSalt && old.seoPassHash) { cfg.seoSalt = old.seoSalt; cfg.seoPassHash = old.seoPassHash; }
    } catch { /* ignore malformed old config */ }
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  console.log('Admin (owner) password set. It works immediately — no restart needed.');
  console.log('Note: this signs everyone out (new session secret). The SEO password still works.');
}
