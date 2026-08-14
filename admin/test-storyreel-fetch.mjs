/* ============================================================================
   Test for fetchReelByUrl() — Admin → Story Reels "Video laao".

   Runs against a FAKE Graph API (via _setGraphBase) because the real one needs
   a live token and would download real media. Covers what actually breaks:
   link parsing, paging past the first page, self-hosting the mp4 under the
   `story-` prefix (NOT `ig-`, which the reel sync prunes), and every failure
   path returning a message the owner can act on.

   Run:  node admin/test-storyreel-fetch.mjs        (exit 0 = all passed)
   Not part of `npm test` — that covers the static site, not admin/.
   ============================================================================ */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { _setGraphBase, fetchReelByUrl, shortcodeFrom } from './instagram-sync.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STATE_PATH = join(ROOT, 'data', 'instagram.json');
const UPLOADS = join(ROOT, 'site', 'assets', 'uploads');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`); }
};
async function throws(name, fn, match) {
  try { await fn(); ok(name, false, 'expected it to throw'); }
  catch (e) { ok(name, e.message.includes(match), `got: ${e.message}`); }
}

/* ---- fake Instagram: page 1 has other posts, the target sits on page 2 ---- */
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmp42'), Buffer.alloc(20000, 7)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(5000, 3)]);
let PORT = 0;
const srv = createServer((req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (u.pathname === '/me/media') {
    const after = u.searchParams.get('after');
    if (!after) return json(res, {
      data: [{ id: '111', permalink: 'https://www.instagram.com/reel/OTHER111/', media_type: 'VIDEO', media_product_type: 'REELS', caption: 'not the one', media_url: `http://127.0.0.1:${PORT}/v.mp4`, thumbnail_url: `http://127.0.0.1:${PORT}/t.jpg` }],
      paging: { next: `http://127.0.0.1:${PORT}/me/media?after=p2` },
    });
    if (after === 'p2') return json(res, {
      data: [
        { id: '999', permalink: 'https://www.instagram.com/reel/TARGET999/', media_type: 'VIDEO', media_product_type: 'REELS', caption: 'Meri report 6 mahine baad #kidney @riims', media_url: `http://127.0.0.1:${PORT}/v.mp4`, thumbnail_url: `http://127.0.0.1:${PORT}/t.jpg` },
        { id: '777', permalink: 'https://www.instagram.com/p/PHOTO777/', media_type: 'IMAGE', caption: 'a photo post', media_url: `http://127.0.0.1:${PORT}/t.jpg` },
        { id: '888', permalink: 'https://www.instagram.com/reel/CURE888/', media_type: 'VIDEO', media_product_type: 'REELS', caption: 'permanent cure for kidney failure!', media_url: `http://127.0.0.1:${PORT}/v.mp4`, thumbnail_url: `http://127.0.0.1:${PORT}/t.jpg` },
      ],
      paging: {},
    });
    return json(res, { data: [], paging: {} });
  }
  if (u.pathname === '/v.mp4') { res.writeHead(200, { 'Content-Type': 'video/mp4' }); return res.end(MP4); }
  if (u.pathname === '/t.jpg') { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); return res.end(JPG); }
  res.writeHead(404); res.end('{}');
});
const json = (res, o) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };

/* ---- state handling: never clobber a real token on a dev machine ---- */
const hadState = existsSync(STATE_PATH);
const savedState = hadState ? readFileSync(STATE_PATH, 'utf8') : null;
const madeUploads = !existsSync(UPLOADS);
const before = new Set(existsSync(UPLOADS) ? readdirSync(UPLOADS) : []);

function cleanup() {
  if (savedState !== null) writeFileSync(STATE_PATH, savedState);
  else if (existsSync(STATE_PATH)) rmSync(STATE_PATH);
  // remove only the files this test created
  if (existsSync(UPLOADS)) {
    for (const f of readdirSync(UPLOADS)) if (!before.has(f)) rmSync(join(UPLOADS, f));
    if (madeUploads) { try { rmSync(UPLOADS, { recursive: true }); } catch { /* not empty */ } }
  }
}

await new Promise((r) => srv.listen(0, '127.0.0.1', r));
PORT = srv.address().port;
_setGraphBase(`http://127.0.0.1:${PORT}`);

try {
  console.log('\nshortcodeFrom()');
  ok('reel URL', shortcodeFrom('https://www.instagram.com/reel/ABC_123/') === 'ABC_123');
  ok('/p/ post URL', shortcodeFrom('https://instagram.com/p/XyZ9/') === 'XyZ9');
  ok('with query string', shortcodeFrom('https://www.instagram.com/reel/QQ11/?igsh=abc') === 'QQ11');
  ok('non-instagram URL', shortcodeFrom('https://youtube.com/watch?v=abc') === '');
  ok('empty', shortcodeFrom('') === '');

  console.log('\nfailure paths');
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify({}));
  await throws('no token connected', () => fetchReelByUrl('https://www.instagram.com/reel/TARGET999/'), 'Instagram is not connected');
  writeFileSync(STATE_PATH, JSON.stringify({ token: 'T', tokenSavedAt: new Date().toISOString() }));
  await throws('bad link', () => fetchReelByUrl('https://example.com/video'), 'does not look like an Instagram reel link');
  await throws('reel on another account', () => fetchReelByUrl('https://www.instagram.com/reel/NOTMINE/'), 'Could not find that reel');

  console.log('\nhappy path (target is on page 2 — paging must work)');
  const r = await fetchReelByUrl('https://www.instagram.com/reel/TARGET999/?igsh=xyz');
  ok('video self-hosted', r.video === 'assets/uploads/story-999.mp4', r.video);
  ok('thumbnail self-hosted', r.img === 'assets/uploads/story-999.jpg', r.img);
  ok('permalink returned', r.url === 'https://www.instagram.com/reel/TARGET999/', r.url);
  ok('caption -> title, tags stripped', r.title === 'Meri report 6 mahine baad', r.title);
  ok('mp4 actually written', existsSync(join(UPLOADS, 'story-999.mp4')));
  ok('jpg actually written', existsSync(join(UPLOADS, 'story-999.jpg')));

  console.log('\nprefix safety (the reel sync prunes ig-*, so story media must NOT be ig-*)');
  const created = readdirSync(UPLOADS).filter((f) => !before.has(f));
  ok('nothing written with an ig- prefix', created.every((f) => !f.startsWith('ig-')), created.join(', '));
  ok('all written files use story-', created.every((f) => f.startsWith('story-')), created.join(', '));

  console.log('\ncompliance: a cure-claim caption must not become the card title');
  const c = await fetchReelByUrl('https://www.instagram.com/reel/CURE888/');
  ok('banned caption replaced with neutral title', c.title === 'Health reel', c.title);

  console.log('\nimage-only post (no video) still works');
  const ph = await fetchReelByUrl('https://www.instagram.com/p/PHOTO777/');
  ok('img set, video empty', ph.img === 'assets/uploads/story-777.jpg' && ph.video === '', `${ph.img} / "${ph.video}"`);
} finally {
  // Await the close: exiting while the handle is still tearing down trips a
  // libuv assertion on Windows, which looks like a failure even at exit 0.
  await new Promise((r) => srv.close(r));
  cleanup();
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exitCode = fail ? 1 : 0;
