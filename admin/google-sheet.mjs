/* ============================================================================
   RIIMS — appointment leads -> Google Sheet (zero-dependency).

   Every lead the website form produces is already stored in data/leads.json and
   shown in Admin -> Leads. This module additionally pushes it into the owner's
   Google Sheet through an Apps Script web app (admin/apps-script/riims-leads.gs).

   Apps Script, not the Sheets API, on purpose: the Sheets API needs an OAuth
   service account and a signed JWT, which means a real dependency and a key file
   on the VPS. A web app is a single URL plus a shared secret, and it keeps this
   project's "no runtime dependencies" rule intact.

   FAILURE POLICY — the lead is never lost or delayed:
     · leads.json is written FIRST; the push happens after, fire-and-forget
     · a lead is marked `sheetSynced` only once the script confirms the row
     · unsynced leads are retried every 10 minutes and on demand, so an outage,
       a revoked deployment or a wrong URL self-heals once it is fixed
     · the public /api/lead response never waits on Google
   State (url, secret, last status) lives in data/sheets.json — gitignored, like
   the Instagram token, and survives deploy/update.sh.
   ============================================================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STATE_PATH = join(ROOT, 'data', 'sheets.json');

const RETRY_EVERY = 10 * 60 * 1000; // sweep unsynced leads every 10 minutes
const BATCH = 100;                  // rows per request (backfill of an old list)
const TIMEOUT = 20000;

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}
function writeJson(path, value) { writeFileSync(path, JSON.stringify(value, null, 2)); }

export function getState() { return readJson(STATE_PATH, {}); }
function setState(patch) { const s = getState(); Object.assign(s, patch); writeJson(STATE_PATH, s); return s; }

export function isEnabled() { const s = getState(); return !!(s.url && s.secret); }
export function newSecret() { return randomBytes(24).toString('hex'); }
export function disable() { writeJson(STATE_PATH, {}); }

/** A lead as the sheet's columns want it (header names, see the .gs file). */
function toRow(lead) {
  return {
    lead_id: lead.id,
    created_time: lead.ts,
    full_name: lead.name || '',
    phone_number: lead.phone || '',
    city: lead.city || '',
    problem: lead.problem || '',
    source: 'website',
  };
}

async function post(url, payload) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    /* Apps Script answers a 302 to googleusercontent.com and serves the JSON
       there; fetch follows it by default. A deleted/never-deployed URL returns
       Google's HTML login page instead, which is why the JSON parse below is
       guarded and reported as a plain-language error. */
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl.signal,
      redirect: 'follow',
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch {
      throw new Error(res.ok
        ? 'The URL did not return JSON. Check that the deployment is a Web app with access "Anyone", and that you copied the /exec URL.'
        : `HTTP ${res.status} from Google`);
    }
    if (!data.ok) throw new Error(data.error || 'the script refused the request');
    return data;
  } finally { clearTimeout(t); }
}

/** Validate a pasted URL + secret before saving them. Throws on failure. */
export async function connect(url, secret) {
  const clean = String(url || '').trim();
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(clean)) {
    throw new Error('That is not an Apps Script web-app URL. It must look like https://script.google.com/macros/s/…/exec');
  }
  const key = String(secret || '').trim();
  if (!key) throw new Error('Paste the same secret you put in the Apps Script');
  const r = await post(clean, { type: 'ping', secret: key });
  setState({ url: clean, secret: key, sheetName: r.sheet || '', connectedAt: new Date().toISOString(), lastError: '' });
  return r;
}

/**
 * Push any lead that has not reached the sheet yet, then mark it synced.
 * Reads and writes leads through the callbacks so leads.json stays the single
 * source of truth (and a lead added mid-push is not clobbered).
 */
export async function flush(getLeads, saveLeads) {
  if (!isEnabled()) return { skipped: 'not configured' };
  const { url, secret } = getState();
  const pending = getLeads().filter((l) => !l.sheetSynced);
  if (!pending.length) { setState({ lastError: '', lastCheck: new Date().toISOString() }); return { sent: 0 }; }

  let sent = 0;
  try {
    /* Oldest first, so the sheet reads in the order the patients called in
       (leads.json keeps newest-first for the panel). */
    const queue = pending.slice().reverse();
    for (let i = 0; i < queue.length; i += BATCH) {
      const chunk = queue.slice(i, i + BATCH);
      await post(url, { type: 'leads', secret, rows: chunk.map(toRow) });

      /* Re-read before marking: the push was awaited, so another lead may have
         arrived in the meantime and that write must not be lost. */
      const ids = new Set(chunk.map((l) => l.id));
      const fresh = getLeads();
      for (const l of fresh) if (ids.has(l.id)) l.sheetSynced = true;
      saveLeads(fresh);
      sent += chunk.length;
    }
    setState({ lastPush: new Date().toISOString(), lastError: '', lastCount: sent, lastCheck: new Date().toISOString() });
    return { sent };
  } catch (err) {
    /* Whatever was not marked stays pending and goes again next sweep. */
    setState({ lastError: err.message, lastCheck: new Date().toISOString() });
    throw err;
  }
}

/** Fire-and-forget hook for /api/lead — must never reject into the request. */
export function pushSoon(getLeads, saveLeads) {
  if (!isEnabled()) return;
  setTimeout(() => { flush(getLeads, saveLeads).catch(() => { /* recorded in lastError; retried by the sweep */ }); }, 0);
}

/** Boot the retry sweep: catches anything the live push could not deliver. */
export function startSheetSync(getLeads, saveLeads) {
  const run = () => { if (isEnabled()) flush(getLeads, saveLeads).catch(() => {}); };
  setTimeout(run, 45 * 1000);
  setInterval(run, RETRY_EVERY).unref?.();
}
