/* ============================================================================
   RIIMS Admin Server — zero-dependency Node HTTP server.

   - Stores + manages appointment LEADS (public POST /api/lead from the site)
   - Edits site content (doctors, reels, stories, FAQs, blogs, phone numbers)
     by writing data/content.local.json, then rebuilding the static site
   - Serves the admin UI at /admin/ (password login, signed session cookie)
   - Image uploads (base64 JSON) -> site/assets/uploads/

   Run:    node admin/server.mjs            (PORT env, default 5500)
   Setup:  node admin/set-password.mjs <password>   (creates data/admin-config.json)
   On the VPS it runs in Docker (docker-compose.admin.yml) behind nginx, which
   proxies /api/ and /admin/ to 127.0.0.1:5500.
   ============================================================================ */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const UI = join(__dirname, 'ui');
const UPLOADS = join(ROOT, 'site', 'assets', 'uploads');
const LEADS_PATH = join(DATA, 'leads.json');
const CONTENT_PATH = join(DATA, 'content.json');
const LOCAL_PATH = join(DATA, 'content.local.json');
const CONFIG_PATH = join(DATA, 'admin-config.json');
const PORT = process.env.PORT || 5500;

const SECTIONS = ['site', 'tracking', 'doctors', 'reels', 'testimonials', 'faqs', 'posts'];
const LEAD_STATUSES = ['new', 'contacted', 'booked', 'closed'];
const MAX_BODY = 8 * 1024 * 1024; // 8MB (base64 image uploads)

/* ---------------- tiny helpers ---------------- */
function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}
function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2), 'utf8');
}
function send(res, code, body, headers = {}) {
  const isObj = typeof body === 'object' && body !== null && !Buffer.isBuffer(body);
  const data = isObj ? JSON.stringify(body) : body;
  res.writeHead(code, { 'Content-Type': isObj ? 'application/json' : 'text/plain; charset=utf-8', ...headers });
  res.end(data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJsonBody(req) {
  const buf = await readBody(req);
  try { return JSON.parse(buf.toString('utf8') || '{}'); } catch { return null; }
}
const newId = () => Date.now().toString(36) + randomBytes(4).toString('hex');

/* ---------------- auth ---------------- */
function getConfig() { return readJson(CONFIG_PATH, null); }
function verifyPassword(cfg, password) {
  const hash = scryptSync(String(password), Buffer.from(cfg.salt, 'hex'), 32);
  const stored = Buffer.from(cfg.passHash, 'hex');
  return hash.length === stored.length && timingSafeEqual(hash, stored);
}
function makeToken(cfg) {
  const exp = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
  const sig = createHmac('sha256', cfg.secret).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}
function checkToken(cfg, token) {
  if (!cfg || !token) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = createHmac('sha256', cfg.secret).update(exp).digest('hex');
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}
function isAuthed(req) { return checkToken(getConfig(), getCookie(req, 'riims_admin')); }

/* ---------------- rate limit (public lead endpoint) ---------------- */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 10;
}

/* ---------------- rebuild (queued) ---------------- */
let building = false, pending = false;
function rebuild() {
  if (building) { pending = true; return; }
  building = true;
  const child = spawn(process.execPath, [join(ROOT, 'build', 'generate.mjs')], { cwd: ROOT });
  let out = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { out += d; });
  child.on('close', (code) => {
    console.log(`[rebuild] exit ${code}: ${out.trim()}`);
    building = false;
    if (pending) { pending = false; rebuild(); }
  });
}

/* ---------------- content ---------------- */
function mergedContent() {
  const base = readJson(CONTENT_PATH, {});
  const local = readJson(LOCAL_PATH, {});
  return { ...base, ...local };
}
function saveSection(section, value) {
  const local = readJson(LOCAL_PATH, {});
  local[section] = value;
  writeJson(LOCAL_PATH, local);
  rebuild();
}

/* ---------------- leads ---------------- */
function getLeads() { return readJson(LEADS_PATH, []); }
function saveLeads(leads) { writeJson(LEADS_PATH, leads); }

/* ---------------- static (admin UI) ---------------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
function serveUi(res, file) {
  const safe = normalize(file).replace(/^(\.\.[/\\])+/, '');
  const path = join(UI, safe || 'index.html');
  if (!existsSync(path)) return send(res, 404, 'Not found');
  res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(readFileSync(path));
}

/* ---------------- server ---------------- */
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '?';

  try {
    /* ---- PUBLIC: lead intake from the website form ---- */
    if (p === '/api/lead' && req.method === 'POST') {
      if (rateLimited(ip)) return send(res, 429, { error: 'too many requests' });
      const b = await readJsonBody(req);
      if (!b) return send(res, 400, { error: 'bad json' });
      if (b.website) return send(res, 200, { ok: true, id: 'x' });           // honeypot bot
      const clean = (v, n = 200) => String(v || '').slice(0, n).trim();
      const leads = getLeads();
      let lead = b.id ? leads.find((l) => l.id === b.id) : null;
      if (!lead) {
        lead = { id: newId(), ts: new Date().toISOString(), status: 'new', notes: '' };
        leads.unshift(lead);
      }
      Object.assign(lead, {
        stage: clean(b.stage, 20) || 'partial',
        name: clean(b.name, 100), phone: clean(b.phone, 20), problem: clean(b.problem, 100),
        city: clean(b.city, 50) || lead.city || '', creatinine: clean(b.creatinine, 30) || lead.creatinine || '',
        mode: clean(b.mode, 40) || lead.mode || '', page: clean(b.page, 200),
        updated: new Date().toISOString(),
      });
      saveLeads(leads);
      return send(res, 200, { ok: true, id: lead.id });
    }

    /* ---- AUTH ---- */
    if (p === '/api/admin/login' && req.method === 'POST') {
      const cfg = getConfig();
      if (!cfg) return send(res, 500, { error: 'Admin not set up. Run: node admin/set-password.mjs <password>' });
      const b = await readJsonBody(req);
      if (!b || !verifyPassword(cfg, b.password || '')) return send(res, 401, { error: 'Wrong password' });
      const secure = (req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : '';
      return send(res, 200, { ok: true }, { 'Set-Cookie': `riims_admin=${makeToken(cfg)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}${secure}` });
    }
    if (p === '/api/admin/logout' && req.method === 'POST') {
      return send(res, 200, { ok: true }, { 'Set-Cookie': 'riims_admin=; HttpOnly; Path=/; Max-Age=0' });
    }
    if (p === '/api/admin/me') {
      return send(res, isAuthed(req) ? 200 : 401, { authed: isAuthed(req) });
    }

    /* ---- ADMIN UI (static; data behind auth) ---- */
    if (p === '/admin' || p === '/admin/') return serveUi(res, 'index.html');
    if (p.startsWith('/admin/')) return serveUi(res, p.slice('/admin/'.length));

    /* ---- Everything below requires auth ---- */
    if (p.startsWith('/api/admin/')) {
      if (!isAuthed(req)) return send(res, 401, { error: 'unauthorized' });

      if (p === '/api/admin/content' && req.method === 'GET') {
        return send(res, 200, mergedContent());
      }
      const secMatch = p.match(/^\/api\/admin\/content\/([a-z]+)$/);
      if (secMatch && req.method === 'PUT') {
        const section = secMatch[1];
        if (!SECTIONS.includes(section)) return send(res, 400, { error: 'unknown section' });
        const b = await readJsonBody(req);
        if (b === null) return send(res, 400, { error: 'bad json' });
        saveSection(section, b);
        return send(res, 200, { ok: true, rebuilding: true });
      }

      if (p === '/api/admin/leads' && req.method === 'GET') {
        return send(res, 200, getLeads());
      }
      const leadMatch = p.match(/^\/api\/admin\/leads\/([a-z0-9]+)$/);
      if (leadMatch && req.method === 'PATCH') {
        const b = await readJsonBody(req);
        const leads = getLeads();
        const lead = leads.find((l) => l.id === leadMatch[1]);
        if (!lead) return send(res, 404, { error: 'not found' });
        if (b.status && LEAD_STATUSES.includes(b.status)) lead.status = b.status;
        if (typeof b.notes === 'string') lead.notes = b.notes.slice(0, 2000);
        saveLeads(leads);
        return send(res, 200, { ok: true });
      }
      if (leadMatch && req.method === 'DELETE') {
        const leads = getLeads().filter((l) => l.id !== leadMatch[1]);
        saveLeads(leads);
        return send(res, 200, { ok: true });
      }

      if (p === '/api/admin/upload' && req.method === 'POST') {
        const b = await readJsonBody(req);
        if (!b || !b.data || !b.name) return send(res, 400, { error: 'need {name, data}' });
        const ext = (extname(b.name) || '.png').toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) return send(res, 400, { error: 'images only' });
        const file = `${Date.now().toString(36)}-${b.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 60)}`;
        mkdirSync(UPLOADS, { recursive: true });
        writeFileSync(join(UPLOADS, file), Buffer.from(b.data.replace(/^data:[^,]+,/, ''), 'base64'));
        return send(res, 200, { ok: true, path: `assets/uploads/${file}` });
      }

      if (p === '/api/admin/rebuild' && req.method === 'POST') {
        rebuild();
        return send(res, 200, { ok: true });
      }
      return send(res, 404, { error: 'unknown endpoint' });
    }

    send(res, 404, 'Not found');
  } catch (err) {
    console.error(`[error] ${req.method} ${p}:`, err.message);
    send(res, 500, { error: 'server error' });
  }
}).listen(PORT, () => console.log(`RIIMS admin server → http://127.0.0.1:${PORT}/admin/`));
