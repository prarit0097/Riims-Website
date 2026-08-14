/* ============================================================================
   RIIMS — Instagram reels auto-sync (zero-dependency).

   Pulls the newest reels from the owner's Instagram (Graph API, "Instagram API
   with Instagram Login"), caches their thumbnails locally, writes them into
   data/content.local.json → reels (newest first) and triggers a site rebuild.
   The homepage's Health Reels strip shows the top 5 of that list, so a reel
   posted on Instagram appears on the site within one sync cycle — no admin step.

   One-time setup (owner): generate an access token (see RIIMS.md §23) and paste
   it in Admin → Health Reels. After that:
     · sync runs on boot (30s delay) and every 6 hours
     · the 60-day token refreshes itself weekly (refresh_access_token)
     · thumbnails download to site/assets/uploads/ (IG CDN URLs expire in days,
       so hotlinking would leave broken images — local copies never expire)

   FAILURE POLICY: never blank the section. Any error keeps the last synced
   list, records lastError for the admin UI, and retries next cycle.
   State lives in data/instagram.json (gitignored, survives update.sh).
   ============================================================================ */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkText } from '../build/compliance.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STATE_PATH = join(ROOT, 'data', 'instagram.json');
const LOCAL_PATH = join(ROOT, 'data', 'content.local.json');
const UPLOADS = join(ROOT, 'site', 'assets', 'uploads');

const KEEP = 10;            // reels kept in the list (homepage shows top 5; search widget can use the rest)
const SYNC_EVERY = 6 * 60 * 60 * 1000;
const REFRESH_AFTER = 7 * 24 * 60 * 60 * 1000; // refresh the 60-day token weekly
let GRAPH = 'https://graph.instagram.com';      // overridable for tests

export function _setGraphBase(url) { GRAPH = url; }

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}
function writeJson(path, value) { writeFileSync(path, JSON.stringify(value, null, 2)); }

export function getState() { return readJson(STATE_PATH, {}); }
function setState(patch) { const s = getState(); Object.assign(s, patch); writeJson(STATE_PATH, s); return s; }

async function api(path) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(GRAPH + path, { signal: ctl.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || `HTTP ${res.status}`);
    return data;
  } finally { clearTimeout(t); }
}

/* Validate a pasted token by asking who it belongs to. */
export async function verifyToken(token) {
  const me = await api(`/me?fields=id,username&access_token=${encodeURIComponent(token)}`);
  if (!me.id) throw new Error('Token accepted but no account id returned');
  setState({ token, username: me.username || '', tokenSavedAt: new Date().toISOString(), lastError: '' });
  return me;
}

export function disable() {
  writeJson(STATE_PATH, {});
}

async function refreshTokenIfDue(state) {
  const saved = Date.parse(state.tokenSavedAt || 0);
  if (!state.token || Date.now() - saved < REFRESH_AFTER) return state.token;
  try {
    const r = await api(`/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(state.token)}`);
    if (r.access_token) {
      setState({ token: r.access_token, tokenSavedAt: new Date().toISOString() });
      return r.access_token;
    }
  } catch (err) {
    // A refresh can fail transiently; the current token may still be valid.
    setState({ lastError: `token refresh: ${err.message}` });
  }
  return state.token;
}

/* Caption -> card title: first line, hashtags/mentions/urls stripped. If what
   remains would trip the medical-claims guard (a caption is free text from
   Instagram), fall back to a neutral title rather than publish it. */
function titleFrom(caption) {
  let t = String(caption || '').split('\n')[0]
    .replace(/https?:\S+/g, '')
    .replace(/[#@]\S+/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > 70) t = t.slice(0, 67).trimEnd() + '…';
  if (!t || checkText(t)) t = 'Health reel';
  return t;
}

const MAX_VIDEO = 30 * 1024 * 1024; // a reel beyond 30MB stays a thumbnail card

async function cacheMedia(file, url, { maxBytes = 0, minBytes = 100, timeout = 20000 } = {}) {
  mkdirSync(UPLOADS, { recursive: true });
  const full = join(UPLOADS, file);
  if (!existsSync(full)) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeout);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) throw new Error(`media HTTP ${res.status}`);
      const len = Number(res.headers.get('content-length') || 0);
      if (maxBytes && len && len > maxBytes) throw new Error(`too large (${len}B)`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < minBytes) throw new Error('media too small');
      if (maxBytes && buf.length > maxBytes) throw new Error(`too large (${buf.length}B)`);
      writeFileSync(full, buf);
    } finally { clearTimeout(t); }
  }
  return `assets/uploads/${file}`;
}

/* Remove cached thumbnails for reels that dropped out of the list.
   NOTE the `ig-` prefix test: patient story media is deliberately cached as
   `story-…` (see fetchReelByUrl) precisely so this prune never touches it. A
   story reel is curated by hand and is not in the synced list, so an `ig-` name
   would get it deleted on the very next sync cycle. */
function pruneThumbnails(keptFiles) {
  try {
    for (const f of readdirSync(UPLOADS)) {
      if (f.startsWith('ig-') && !keptFiles.has(f)) unlinkSync(join(UPLOADS, f));
    }
  } catch { /* uploads dir may not exist yet */ }
}

/* ---------------------------------------------------------------------------
   Fetch ONE reel by its Instagram URL — powers Admin → Story Reels.

   Why this exists: pasting an Instagram link alone can never autoplay on the
   site. A permalink serves no hotlinkable mp4 (the CDN URLs are signed and
   expire), and Instagram's embed script is blocked by the site's CSP. The
   Health Reels strip only plays because the sync DOWNLOADS each mp4. So a
   patient story has to go the same route: resolve the link to the media, then
   self-host the file.

   The token can only read the connected account's own media, which is exactly
   the case here — patient stories are posted on @riimshospital. A link to some
   other account's reel cannot be fetched, and says so plainly.
   --------------------------------------------------------------------------- */
export function shortcodeFrom(url) {
  const m = String(url || '').match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : '';
}

async function apiAbs(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || `HTTP ${res.status}`);
    return data;
  } finally { clearTimeout(t); }
}

/** Resolve an Instagram reel URL to self-hosted media. Returns {img, video, title, url}. */
export async function fetchReelByUrl(rawUrl) {
  const code = shortcodeFrom(rawUrl);
  if (!code) throw new Error('That does not look like an Instagram reel link. Expected something like https://www.instagram.com/reel/XXXXXXXXX/');
  const state = getState();
  if (!state.token) throw new Error('Instagram is not connected. Open Health Reels and paste an access token first — the video is downloaded through that same connection.');
  const token = await refreshTokenIfDue(state);

  /* Walk the account's media until the shortcode turns up. Bounded at 8 pages
     (~400 posts) so a mistyped link cannot spin through the whole account. */
  const fields = 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp';
  let next = `${GRAPH}/me/media?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`;
  let found = null;
  for (let page = 0; page < 8 && next && !found; page++) {
    const res = await apiAbs(next);
    found = (res.data || []).find((m) => String(m.permalink || '').includes(`/${code}`));
    next = res.paging && res.paging.next;
  }
  if (!found) throw new Error(`Could not find that reel on the connected Instagram account. It has to be posted on the same account the site syncs from — a link to someone else's reel cannot be downloaded.`);

  let img = '';
  const thumb = found.thumbnail_url || found.media_url;
  if (thumb) {
    try { img = await cacheMedia(`story-${found.id}.jpg`, thumb); }
    catch (e) { throw new Error(`Found the reel but could not save its thumbnail: ${e.message}`); }
  }
  let video = '';
  const isVideo = found.media_product_type === 'REELS' || found.media_type === 'VIDEO';
  if (isVideo && found.media_url) {
    try { video = await cacheMedia(`story-${found.id}.mp4`, found.media_url, { maxBytes: MAX_VIDEO, minBytes: 10000, timeout: 60000 }); }
    catch { /* over 30MB or a slow CDN: the thumbnail card still works, it just won't autoplay */ }
  }
  if (!img && !video) throw new Error('That post has no downloadable image or video.');
  return { img, video, title: titleFrom(found.caption), url: found.permalink || String(rawUrl).trim() };
}

const TONES = ['green', 'blue', 'cream'];

/** One sync pass. Returns {synced} or throws. `rebuild` is server.mjs's queued rebuild. */
export async function syncReels(rebuild) {
  const state = getState();
  if (!state.token) return { skipped: 'no token' };
  const token = await refreshTokenIfDue(state);

  const media = await api(`/me/media?fields=id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp&limit=25&access_token=${encodeURIComponent(token)}`);
  const reelsRaw = (media.data || [])
    .filter((m) => m.media_product_type === 'REELS' || m.media_type === 'VIDEO')
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, KEEP);
  if (!reelsRaw.length) { setState({ lastSync: new Date().toISOString(), lastError: 'no reels found on the account' }); return { synced: 0 }; }

  const reels = [];
  for (let i = 0; i < reelsRaw.length; i++) {
    const m = reelsRaw[i];
    const thumb = m.thumbnail_url || m.media_url;
    let img = '';
    try { if (thumb) img = await cacheMedia(`ig-${m.id}.jpg`, thumb); }
    catch { /* card renders its gradient background without an image */ }
    /* The reel's mp4 itself, self-hosted — the homepage cards autoplay it muted
       while in view. Videos only for the top 5 (the homepage set): downloading
       all 10 doubles disk/bandwidth for cards nobody renders. */
    let video = '';
    if (i < 5 && m.media_url) {
      try { video = await cacheMedia(`ig-${m.id}.mp4`, m.media_url, { maxBytes: MAX_VIDEO, minBytes: 10000, timeout: 60000 }); }
      catch { /* thumbnail card is the graceful fallback */ }
    }
    reels.push({
      id: `ig${m.id}`,
      tag: '',   // owner asked for clean thumbnails - no badge text on synced reels
      tone: TONES[i % TONES.length],
      title: titleFrom(m.caption),
      views: '',
      img,
      video,
      url: m.permalink || '',
    });
  }

  const local = readJson(LOCAL_PATH, {});
  local.reels = reels;
  writeJson(LOCAL_PATH, local);
  pruneThumbnails(new Set(reels.flatMap((r) => [r.img.split('/').pop(), (r.video || '').split('/').pop()]).filter(Boolean)));
  setState({ lastSync: new Date().toISOString(), lastError: '', lastCount: reels.length });
  if (typeof rebuild === 'function') rebuild();
  return { synced: reels.length };
}

/** Boot the scheduler: first pass ~30s after start, then every 6 hours. */
export function startInstagramSync(rebuild) {
  const run = () => syncReels(rebuild).catch((err) => setState({ lastError: err.message }));
  setTimeout(run, 30 * 1000);
  setInterval(run, SYNC_EVERY).unref?.();
}
