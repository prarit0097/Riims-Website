/* Set / change the admin password. Usage:
     node admin/set-password.mjs "YourStrongPassword"
   Writes data/admin-config.json (gitignored): scrypt hash + session secret. */

import { writeFileSync, mkdirSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: node admin/set-password.mjs "<password with 8+ characters>"');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');
const salt = randomBytes(16);

mkdirSync(DATA, { recursive: true });
writeFileSync(join(DATA, 'admin-config.json'), JSON.stringify({
  salt: salt.toString('hex'),
  passHash: scryptSync(password, salt, 32).toString('hex'),
  secret: randomBytes(32).toString('hex'),
}, null, 2));

console.log('Admin password set. Restart the admin server if it is running.');
