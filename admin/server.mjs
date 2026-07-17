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
import { checkPayload, reservedMetaName } from '../build/compliance.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const UI = join(__dirname, 'ui');
const UPLOADS = join(ROOT, 'site', 'assets', 'uploads');
const LEADS_PATH = join(DATA, 'leads.json');
const CONTENT_PATH = join(DATA, 'content.json');
const LOCAL_PATH = join(DATA, 'content.local.json');
const CONFIG_PATH = join(DATA, 'admin-config.json');
const MANIFEST_PATH = join(DATA, 'pages-manifest.json');
const PORT = process.env.PORT || 5500;

const SECTIONS = ['site', 'tracking', 'stats', 'storyVideo', 'doctors', 'reels', 'testimonials', 'faqs', 'posts', 'search', 'cta', 'protocol', 'services', 'why', 'steps', 'about', 'legal', 'banners', 'pagesSeo', 'conditionEdits'];
const LEAD_STATUSES = ['new', 'contacted', 'booked', 'closed'];
const ROLES = ['owner', 'seo'];
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

/* Magic-byte sniff so a renamed non-image (e.g. .php as .png) is rejected. */
function isRealImage(buf) {
  if (!buf || buf.length < 12) return false;
  const h = [...buf.slice(0, 12)];
  const starts = (sig) => sig.every((b, i) => b === null || h[i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return true;                       // PNG
  if (starts([0xff, 0xd8, 0xff])) return true;                             // JPEG
  if (starts([0x47, 0x49, 0x46, 0x38])) return true;                       // GIF
  if (starts([0x52, 0x49, 0x46, 0x46]) && h[8] === 0x57 && h[9] === 0x45) return true; // WEBP (RIFF....WE)
  const head = buf.slice(0, 256).toString('utf8').trim().toLowerCase();
  if (head.startsWith('<?xml') || head.startsWith('<svg')) return true;    // SVG
  return false;
}

/* ---------------- auth (two roles: owner | seo) ----------------
   owner = the hospital owner: full panel, including patient Leads.
   seo   = the SEO contractor: everything EXCEPT Leads (patient data).
   The role is signed into the session token, so it cannot be forged client-side,
   and Leads are refused server-side (403) — never merely hidden in the UI. */
function getConfig() { return readJson(CONFIG_PATH, null); }
function verifyHash(password, saltHex, hashHex) {
  if (!saltHex || !hashHex) return false; // role not configured (e.g. no SEO password set yet)
  const hash = scryptSync(String(password), Buffer.from(saltHex, 'hex'), 32);
  const stored = Buffer.from(hashHex, 'hex');
  return hash.length === stored.length && timingSafeEqual(hash, stored);
}
function loginRole(cfg, password) {
  if (verifyHash(password, cfg.salt, cfg.passHash)) return 'owner';
  if (verifyHash(password, cfg.seoSalt, cfg.seoPassHash)) return 'seo';
  return null;
}
function makeToken(cfg, role) {
  const exp = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
  const sig = createHmac('sha256', cfg.secret).update(`${exp}.${role}`).digest('hex');
  return `${exp}.${role}.${sig}`;
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}
function getRole(req) { // -> 'owner' | 'seo' | null
  const cfg = getConfig();
  const token = getCookie(req, 'riims_admin');
  if (!cfg || !token) return null;
  const [exp, role, sig] = String(token).split('.');
  const expNum = Number(exp);
  if (!exp || !sig || !ROLES.includes(role) || !Number.isFinite(expNum) || expNum < Date.now()) return null;
  const want = createHmac('sha256', cfg.secret).update(`${exp}.${role}`).digest('hex');
  return (sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want))) ? role : null;
}

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

/* ---------------- section shape validation (the two SEO-editable sections) ----
   pagesSeo:        { "<page path>": {title?, desc?, h1?, noindex?} }
   conditionEdits:  { "<cat>/<slug>": {intro?, aboutTitle?, about?, when?, symptoms?[], approach?[]} }
   Condition fields are injected into HTML unescaped (build/pages.mjs), so "<" is
   refused. redFlags/sources stay code-only: emergency advice and citations must not
   be editable from a browser. Returns an error string, or null when the shape is ok. */
const SEO_FIELDS = ['title', 'desc', 'h1'];
const MAX_FIELD = 4000;  // a condition paragraph; also bounds the compliance scan
const MAX_LIST = 40;     // symptoms / approach bullets
const COND_STR_FIELDS = ['intro', 'aboutTitle', 'about', 'when'];
const COND_ARR_FIELDS = ['symptoms', 'approach'];
const LOCKED_FIELDS = ['redFlags', 'sources'];

/* An AYUSH practitioner may not be presented as an allopathic specialist — in India
   that misrepresents a qualification, and the whole site is written to avoid it (see
   the rule above SPECIALISTS in build/pages.mjs). This caught a real, live case: the
   founder, a B.A.M.S., was titled "Senior Nephrologist" on the doctors page while a
   new page told patients plainly he is not one. A title is one careless word; this
   makes that word impossible to save. */
const AYUSH_QUAL = /B\.?A\.?M\.?S|B\.?H\.?M\.?S|B\.?U\.?M\.?S|B\.?N\.?Y\.?S|ayurved|homeopath|unani|siddha/i;
const ALLOPATHIC_TITLE = /\b(nephrolog|cardiolog|hepatolog|endocrinolog|urolog|oncolog|neurolog|gastroenterolog|surgeon|MBBS|\bMD\b|\bDM\b|\bMS\b|\bDNB\b)/i;

function checkDoctors(list) {
  if (!Array.isArray(list)) return null;
  for (const d of list) {
    if (!d || typeof d !== 'object') continue;
    const name = String(d.name || 'A doctor').trim();
    const quals = String(d.quals || '');
    const title = String(d.title || '');
    if (AYUSH_QUAL.test(quals) && ALLOPATHIC_TITLE.test(title)) {
      const word = (title.match(ALLOPATHIC_TITLE) || [''])[0];
      return `${name}: the qualification says "${quals.trim()}" but the title says "${title.trim()}". An Ayurveda/AYUSH doctor cannot be titled "${word}" — in India that misrepresents a qualification, and it contradicts what the rest of the site tells patients. Use a title like "Founder & Senior Kidney-Care Physician" or "Senior Ayurveda Acharya". If this doctor really does hold MBBS/MD/DM, put that in the qualifications field.`;
    }
    if (ALLOPATHIC_TITLE.test(title) && !quals.trim()) {
      return `${name}: the title claims a medical specialty but the qualifications field is empty. Add the real degree — an unbacked specialty claim on a medical site is exactly what Google and the law penalise.`;
    }
  }
  return null;
}

function validateSection(section, b) {
  // Doctors: a specialty title must be backed by the degree that grants it.
  if (section === 'doctors') return checkDoctors(b);
  /* The Tracking tab is for site-verification tags. The generator emits the page's own
     description/og/twitter/robots tags, so accepting those here would ship a duplicate
     (an SEO fault by itself) AND put uncontrolled ad copy in every page's <head>. */
  if (section === 'tracking') {
    const lines = String((b && b.metaTags) || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const reserved = reservedMetaName(line);
      if (reserved) return `metaTags: "${reserved}" is set by the site itself — remove that line. This box is only for verification tags (Search Console, Bing, Facebook). Page titles and descriptions are edited in the Pages / SEO tab.`;
    }
    return null;
  }
  if (section !== 'pagesSeo' && section !== 'conditionEdits') return null;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return `${section} must be an object`;

  for (const [key, v] of Object.entries(b)) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return `${key}: must be an object`;
    const locked = LOCKED_FIELDS.find((f) => f in v);
    if (locked) return `${key}: "${locked}" is locked for medical safety and can only be changed in code`;

    if (section === 'pagesSeo') {
      if (!/^\/[a-z0-9./-]*$/i.test(key)) return `${key}: not a valid page path`;
      for (const [f, val] of Object.entries(v)) {
        if (f === 'noindex') { if (typeof val !== 'boolean') return `${key}: noindex must be true/false`; continue; }
        if (!SEO_FIELDS.includes(f)) return `${key}: unknown field "${f}"`;
        if (typeof val !== 'string') return `${key}.${f}: must be text`;
        if (val.length > 300) return `${key}.${f}: too long (max 300 characters)`;
        if (val.includes('<')) return `${key}.${f}: HTML tags are not allowed`;
      }
    } else {
      if (!/^(kidney|liver|heart|general)\/[a-z0-9-]+$/.test(key)) return `${key}: not a valid condition key`;
      for (const [f, val] of Object.entries(v)) {
        if (COND_STR_FIELDS.includes(f)) {
          if (typeof val !== 'string') return `${key}.${f}: must be text`;
          if (val.length > MAX_FIELD) return `${key}.${f}: too long (max ${MAX_FIELD} characters)`;
          if (val.includes('<')) return `${key}.${f}: HTML tags are not allowed`;
        } else if (COND_ARR_FIELDS.includes(f)) {
          if (!Array.isArray(val)) return `${key}.${f}: must be a list`;
          if (val.length > MAX_LIST) return `${key}.${f}: too many items (max ${MAX_LIST})`;
          if (val.some((s) => typeof s !== 'string')) return `${key}.${f}: list items must be text`;
          if (val.some((s) => s.length > MAX_FIELD)) return `${key}.${f}: an item is too long (max ${MAX_FIELD} characters)`;
          if (val.some((s) => s.includes('<'))) return `${key}.${f}: HTML tags are not allowed`;
        } else return `${key}: unknown field "${f}"`;
      }
    }
  }
  return null;
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
      const role = b ? loginRole(cfg, b.password || '') : null;
      if (!role) return send(res, 401, { error: 'Wrong password' });
      const secure = (req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : '';
      return send(res, 200, { ok: true, role }, { 'Set-Cookie': `riims_admin=${makeToken(cfg, role)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}${secure}` });
    }
    if (p === '/api/admin/logout' && req.method === 'POST') {
      return send(res, 200, { ok: true }, { 'Set-Cookie': 'riims_admin=; HttpOnly; Path=/; Max-Age=0' });
    }
    if (p === '/api/admin/me') {
      const role = getRole(req);
      return send(res, role ? 200 : 401, { authed: !!role, role });
    }

    /* ---- ADMIN UI (static; data behind auth) ---- */
    if (p === '/admin' || p === '/admin/') return serveUi(res, 'index.html');
    if (p.startsWith('/admin/')) return serveUi(res, p.slice('/admin/'.length));

    /* ---- Everything below requires auth ---- */
    if (p.startsWith('/api/admin/')) {
      const role = getRole(req);
      if (!role) return send(res, 401, { error: 'unauthorized' });
      // Patient data is owner-only. Prefix match covers /leads, /leads/:id and any future subroute.
      if (p.startsWith('/api/admin/leads') && role !== 'owner') return send(res, 403, { error: 'Leads are owner-only' });

      if (p === '/api/admin/content' && req.method === 'GET') {
        return send(res, 200, mergedContent());
      }
      const secMatch = p.match(/^\/api\/admin\/content\/([a-zA-Z]+)$/);
      if (secMatch && req.method === 'PUT') {
        const section = secMatch[1];
        if (!SECTIONS.includes(section)) return send(res, 400, { error: 'unknown section' });
        const b = await readJsonBody(req);
        if (b === null) return send(res, 400, { error: 'bad json' });
        const shapeErr = validateSection(section, b);
        if (shapeErr) return send(res, 400, { error: shapeErr });
        const hit = checkPayload(b);
        if (hit) return send(res, 400, { error: `Blocked: "${hit.phrase}" (${hit.label}) cannot go on a medical site. Rephrase honestly — say what RIIMS does NOT promise. Field: ${hit.path || section}` });
        saveSection(section, b);
        return send(res, 200, { ok: true, rebuilding: true });
      }

      /* Page list for the "Pages / SEO" tab — regenerated by every build, so new
         pages appear without any wiring. Absent only before the first build. */
      if (p === '/api/admin/pages' && req.method === 'GET') {
        const manifest = readJson(MANIFEST_PATH, null);
        return send(res, 200, manifest ? { pages: manifest } : { pages: [], needsBuild: true });
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
        const buf = Buffer.from(String(b.data).replace(/^data:[^,]+,/, ''), 'base64');
        if (!isRealImage(buf)) return send(res, 400, { error: 'file is not a valid image' });
        const file = `${Date.now().toString(36)}-${b.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 60)}`;
        mkdirSync(UPLOADS, { recursive: true });
        writeFileSync(join(UPLOADS, file), buf);
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
