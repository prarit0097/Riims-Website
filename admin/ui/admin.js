/* RIIMS Admin UI — single-page panel. Talks to admin/server.mjs via /api/admin/*. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let content = null;   // merged content (site, doctors, reels, testimonials, faqs, posts)
  let leads = [];
  let view = 'leads';

  /* ---------------- api ---------------- */
  async function api(path, opts = {}) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...opts });
    if (res.status === 401) { showLogin(); throw new Error('unauthorized'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }
  function toast(msg, isErr) {
    const t = $('#toast');
    t.textContent = msg; t.classList.toggle('error', !!isErr); t.classList.remove('hidden');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 2600);
  }
  async function saveSection(section, value, label) {
    try { await api(`/api/admin/content/${section}`, { method: 'PUT', body: JSON.stringify(value) }); toast(`${label} saved — site rebuilding…`); }
    catch (e) { toast(`Save failed: ${e.message}`, true); }
  }
  function uploadImage(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => api('/api/admin/upload', { method: 'POST', body: JSON.stringify({ name: file.name, data: r.result }) })
        .then((d) => resolve(d.path)).catch(reject);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  /* attach an image picker to a button; sets item[key] and refreshes view */
  function pickImage(item, key) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      if (!inp.files[0]) return;
      try { item[key] = await uploadImage(inp.files[0]); toast('Image uploaded — remember to Save'); render(); }
      catch (e) { toast(`Upload failed: ${e.message}`, true); }
    };
    inp.click();
  }
  const imgSrc = (p) => (p ? `/${p}` : '');

  /* ---------------- login ---------------- */
  function showLogin() { $('#login').classList.remove('hidden'); $('#app').classList.add('hidden'); }
  function showApp() { $('#login').classList.add('hidden'); $('#app').classList.remove('hidden'); }
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('#login-pass').value }) });
      $('#login-err').textContent = ''; await boot();
    } catch (err) { $('#login-err').textContent = err.message; }
  });
  $('#logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }).catch(() => {}); showLogin(); });
  $('#rebuild').addEventListener('click', async () => { try { await api('/api/admin/rebuild', { method: 'POST' }); toast('Site rebuilding…'); } catch (e) { toast(e.message, true); } });

  /* ---------------- nav ---------------- */
  $('#nav').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-view]'); if (!btn) return;
    view = btn.dataset.view;
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });

  /* ---------------- generic helpers ---------------- */
  function bindFields(root, list) {
    root.querySelectorAll('[data-bind]').forEach((el) => {
      el.addEventListener('input', () => {
        const [idx, key] = el.dataset.bind.split('|');
        const item = list[Number(idx)];
        if (key === 'specialties') item[key] = el.value.split(',').map((s) => s.trim()).filter(Boolean);
        else if (key === 'rating') item[key] = Math.max(1, Math.min(5, Number(el.value) || 5));
        else item[key] = el.value;
      });
    });
  }
  const newId = () => 'x' + Date.now().toString(36);

  /* Up/down reordering shared by every list tab. */
  function moveRow(list, i, dir) { const j = i + dir; if (j < 0 || j >= list.length) return; const t = list[i]; list[i] = list[j]; list[j] = t; render(); }
  function reorderBtns(i) { return `<button class="btn light small" data-up="${i}" title="Move up">↑</button><button class="btn light small" data-down="${i}" title="Move down">↓</button>`; }
  function wireReorder(v, list) {
    v.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => moveRow(list, Number(b.dataset.up), -1));
    v.querySelectorAll('[data-down]').forEach((b) => b.onclick = () => moveRow(list, Number(b.dataset.down), 1));
  }
  // Common Lucide icon names available (self-hosted set) — offered as a datalist hint.
  const ICONS = 'video building-2 map clipboard-list salad leaf activity waves heart-pulse user-round repeat target git-merge shield-check file-text stethoscope calendar-check phone message-circle beaker droplets gauge circle-dot search-check book-open';
  const iconField = (i, val) => `<label class="f">Icon<input data-bind="${i}|icon" list="iconlist" value="${esc(val || '')}" placeholder="e.g. salad"></label>`;
  const ICON_DATALIST = `<datalist id="iconlist">${ICONS.split(' ').map((n) => `<option value="${n}">`).join('')}</datalist>`;
  const fval = (id) => ($(id) ? $(id).value.trim() : '');

  /* ---------------- views ---------------- */
  function render() {
    const v = $('#view');
    if (view === 'leads') return renderLeads(v);
    if (view === 'doctors') return renderDoctors(v);
    if (view === 'reels') return renderReels(v);
    if (view === 'stories') return renderStories(v);
    if (view === 'faqs') return renderFaqs(v);
    if (view === 'blogs') return renderBlogs(v);
    if (view === 'search') return renderSearch(v);
    if (view === 'protocol') return renderProtocol(v);
    if (view === 'banners') return renderBanners(v);
    if (view === 'services') return renderServices(v);
    if (view === 'why') return renderWhy(v);
    if (view === 'steps') return renderSteps(v);
    if (view === 'about') return renderAbout(v);
    if (view === 'legal') return renderLegal(v);
    if (view === 'tracking') return renderTracking(v);
    if (view === 'settings') return renderSettings(v);
  }

  /* ---- Leads ---- */
  function renderLeads(v) {
    const count = (s) => leads.filter((l) => l.status === s).length;
    const rows = leads.map((l, i) => `
      <tr data-id="${l.id}">
        <td><b>${leads.length - i}</b></td>
        <td>${new Date(l.ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
        <td><b>${esc(l.name)}</b><br><a href="tel:+91${esc(l.phone)}">${esc(l.phone)}</a></td>
        <td>${esc(l.problem || '—')}${l.city ? `<br><span class="muted">${esc(l.city)} ${esc(l.mode || '')}</span>` : ''}</td>
        <td><select data-act="status">${['new', 'contacted', 'booked', 'closed'].map((s) => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
        <td><input data-act="notes" value="${esc(l.notes)}" placeholder="Notes…"></td>
        <td class="row">
          <a class="btn light small" target="_blank" rel="noopener" href="https://wa.me/91${esc(l.phone)}?text=${encodeURIComponent('Namaste ' + (l.name || '') + ', RIIMS se. Aapki appointment request mili hai.')}">WA</a>
          <button class="btn danger small" data-act="del">✕</button>
        </td>
      </tr>`).join('');

    v.innerHTML = `
      <div class="head"><h2>Appointment Leads</h2>
        <div class="row">
          <button id="csv" class="btn light small">⬇ Export CSV</button>
          <button id="refresh" class="btn light small">↻ Refresh</button>
        </div></div>
      <div class="row" style="margin-bottom:14px">
        <div class="stat"><b>${leads.length}</b><span>Total</span></div>
        <div class="stat"><b>${count('new')}</b><span>New</span></div>
        <div class="stat"><b>${count('contacted')}</b><span>Contacted</span></div>
        <div class="stat"><b>${count('booked')}</b><span>Booked</span></div>
      </div>
      ${leads.length ? `<div style="overflow-x:auto"><table>
        <tr><th>#</th><th>When</th><th>Patient</th><th>Problem</th><th>Status</th><th>Notes</th><th></th></tr>
        ${rows}</table></div>` : `<div class="card muted">No leads yet. They appear here the moment someone submits the website form.</div>`}`;

    $('#refresh').onclick = async () => { leads = await api('/api/admin/leads'); render(); };
    const csvBtn = $('#csv');
    if (csvBtn) csvBtn.onclick = () => {
      const head = ['sno', 'date', 'name', 'phone', 'problem', 'status', 'notes'];
      const lines = [head.join(',')].concat(leads.map((l, i) =>
        [leads.length - i, l.ts, l.name, l.phone, l.problem, l.status, l.notes]
          .map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
      a.download = 'riims-leads.csv'; a.click();
    };
    v.querySelectorAll('tr[data-id]').forEach((tr) => {
      const id = tr.dataset.id;
      tr.querySelector('[data-act="status"]').onchange = (e) => api(`/api/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }).then(() => { leads.find((l) => l.id === id).status = e.target.value; render(); });
      tr.querySelector('[data-act="notes"]').onchange = (e) => api(`/api/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ notes: e.target.value }) }).then(() => toast('Note saved'));
      tr.querySelector('[data-act="del"]').onclick = () => { if (confirm('Delete this lead?')) api(`/api/admin/leads/${id}`, { method: 'DELETE' }).then(() => { leads = leads.filter((l) => l.id !== id); render(); }); };
    });
  }

  /* ---- Doctors ---- */
  function renderDoctors(v) {
    const list = content.doctors;
    v.innerHTML = `
      <div class="head"><h2>Doctors (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add doctor</button>
        <button id="save" class="btn primary">Save doctors</button></div></div>
      ${list.map((d, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <img class="thumb" src="${imgSrc(d.photo)}" alt="">
            <button class="btn light small" data-img="${i}">📷 Change photo</button>
            <span style="flex:1"></span>${reorderBtns(i)}
            <button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid3">
            <label class="f">Name<input data-bind="${i}|name" value="${esc(d.name)}"></label>
            <label class="f">Title<input data-bind="${i}|title" value="${esc(d.title)}"></label>
            <label class="f">Qualifications<input data-bind="${i}|quals" value="${esc(d.quals)}"></label>
            <label class="f">Registration No.<input data-bind="${i}|reg" value="${esc(d.reg || '')}" placeholder="e.g. DBCP A/7368"></label>
            <label class="f">Specialties (comma separated)<input data-bind="${i}|specialties" value="${esc((d.specialties || []).join(', '))}"></label>
            <label class="f">Languages<input data-bind="${i}|languages" value="${esc(d.languages || 'Hindi, English')}"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list); wireReorder(v, list);
    v.querySelectorAll('[data-img]').forEach((b) => b.onclick = () => pickImage(list[Number(b.dataset.img)], 'photo'));
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this doctor?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), name: 'Dr. ', title: '', quals: '', reg: '', specialties: [], languages: 'Hindi, English', photo: '' }); render(); };
    $('#save').onclick = () => saveSection('doctors', list, 'Doctors');
  }

  /* ---- Reels ---- */
  function renderReels(v) {
    const list = content.reels;
    v.innerHTML = `
      <div class="head"><h2>Health Reels (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add reel</button>
        <button id="save" class="btn primary">Save reels</button></div></div>
      ${list.map((r, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <img class="thumb" src="${imgSrc(r.img)}" alt="">
            <button class="btn light small" data-img="${i}">📷 Thumbnail</button>
            <span style="flex:1"></span>
            <button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid3">
            <label class="f">Title<input data-bind="${i}|title" value="${esc(r.title)}"></label>
            <label class="f">Tag<input data-bind="${i}|tag" value="${esc(r.tag)}"></label>
            <label class="f">Views label<input data-bind="${i}|views" value="${esc(r.views)}"></label>
            <label class="f">Tone<select data-bind="${i}|tone">${['green', 'blue', 'cream'].map((t) => `<option ${r.tone === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="f">Reel link (Instagram URL — blank = profile)<input data-bind="${i}|url" value="${esc(r.url || '')}" placeholder="https://www.instagram.com/reel/…"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-img]').forEach((b) => b.onclick = () => pickImage(list[Number(b.dataset.img)], 'img'));
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this reel?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), tag: '', tone: 'green', title: '', views: '', img: '', url: '' }); render(); };
    $('#save').onclick = () => saveSection('reels', list, 'Reels');
  }

  /* ---- Patient stories ---- */
  function renderStories(v) {
    const list = content.testimonials;
    const sv = content.storyVideo || { enabled: true, title: 'Watch patient video stories', img: '', url: '' };
    v.innerHTML = `
      <div class="head"><h2>Patient Stories (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add story</button>
        <button id="save" class="btn primary">Save stories</button></div></div>
      <div class="card">
        <h3 style="margin:0 0 10px">🎥 Patient video tile (stories ke neeche wala video box)</h3>
        <div class="row" style="margin-bottom:10px">
          <img class="thumb wide" src="${imgSrc(sv.img)}" alt="">
          <button class="btn light small" id="sv-img">📷 Thumbnail badlo</button>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-left:8px">
            <input type="checkbox" id="sv-on" ${sv.enabled ? 'checked' : ''}> Website par dikhao
          </label>
        </div>
        <div class="grid2">
          <label class="f">Title<input id="sv-title" value="${esc(sv.title || '')}"></label>
          <label class="f">Video link (YouTube/Instagram URL — blank = Instagram profile)<input id="sv-url" value="${esc(sv.url || '')}" placeholder="https://youtube.com/watch?v=… ya reel link"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">Click karne par visitor isi link par jaata hai. "Save stories" dabane par yeh bhi save ho jaata hai.</p>
      </div>
      ${list.map((t, i) => `
        <div class="card">
          <div class="grid3">
            <label class="f">Name<input data-bind="${i}|name" value="${esc(t.name)}"></label>
            <label class="f">Location<input data-bind="${i}|loc" value="${esc(t.loc)}"></label>
            <label class="f">Rating (1–5)<input type="number" min="1" max="5" data-bind="${i}|rating" value="${t.rating || 5}"></label>
          </div>
          <label class="f" style="margin-top:10px">Quote<textarea data-bind="${i}|quote">${esc(t.quote)}</textarea></label>
          <div class="row" style="margin-top:8px;justify-content:flex-end"><button class="btn danger small" data-del="${i}">Remove</button></div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this story?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), rating: 5, name: '', loc: '', quote: '' }); render(); };
    $('#sv-img').onclick = () => {
      content.storyVideo = content.storyVideo || { ...sv };
      pickImage(content.storyVideo, 'img');
    };
    $('#save').onclick = () => {
      content.storyVideo = {
        enabled: $('#sv-on').checked,
        title: $('#sv-title').value.trim() || 'Watch patient video stories',
        img: (content.storyVideo && content.storyVideo.img) || sv.img,
        url: $('#sv-url').value.trim(),
      };
      saveSection('testimonials', list, 'Patient stories');
      saveSection('storyVideo', content.storyVideo, 'Patient video');
    };
  }

  /* ---- FAQs ---- */
  function renderFaqs(v) {
    const list = content.faqs;
    v.innerHTML = `
      <div class="head"><h2>FAQs (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add FAQ</button>
        <button id="save" class="btn primary">Save FAQs</button></div></div>
      ${list.map((f, i) => `
        <div class="card">
          <label class="f">Question<input data-bind="${i}|q" value="${esc(f.q)}"></label>
          <label class="f" style="margin-top:10px">Answer<textarea data-bind="${i}|a">${esc(f.a)}</textarea></label>
          <div class="row" style="margin-top:8px;justify-content:flex-end"><button class="btn danger small" data-del="${i}">Remove</button></div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this FAQ?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), q: '', a: '' }); render(); };
    $('#save').onclick = () => saveSection('faqs', list, 'FAQs');
  }

  /* ---- Blogs ---- */
  function renderBlogs(v) {
    const list = content.posts;
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    v.innerHTML = `
      <div class="head"><h2>Blogs (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add blog</button>
        <button id="save" class="btn primary">Save blogs</button></div></div>
      <div class="card muted" style="font-size:13px">Each blog gets its own page at <b>/blog/&lt;slug&gt;.html</b>. "Body" supports plain paragraphs (blank line = new paragraph) and headings ("## Heading"). If Body is empty, the page auto-fills from the related condition.</div>
      ${list.map((p, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <img class="thumb wide" src="${imgSrc(p.img)}" alt="">
            <button class="btn light small" data-img="${i}">📷 Cover image</button>
            <a class="btn light small" target="_blank" rel="noopener" href="/blog/${esc(p.slug)}.html">View page ↗</a>
            <span style="flex:1"></span>
            <button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid2">
            <label class="f">Title<input data-bind="${i}|title" value="${esc(p.title)}"></label>
            <label class="f">Slug (URL)<input data-bind="${i}|slug" value="${esc(p.slug)}"></label>
            <label class="f">Category<input data-bind="${i}|cat" value="${esc(p.cat)}"></label>
            <label class="f">Author<input data-bind="${i}|author" value="${esc(p.author)}"></label>
            <label class="f">Date label<input data-bind="${i}|date" value="${esc(p.date)}" placeholder="Jun 2026"></label>
            <label class="f">Read time<input data-bind="${i}|time" value="${esc(p.time)}" placeholder="6 min read"></label>
            <label class="f">Related condition<select data-bind="${i}|related">${['', 'high-creatinine', 'ckd', 'kidney-failure', 'dialysis', 'proteinuria', 'swelling', 'diabetes-bp', 'stone-uti'].map((c) => `<option value="${c}" ${p.related === c ? 'selected' : ''}>${c || '(none)'}</option>`).join('')}</select></label>
            <label class="f">Tone<select data-bind="${i}|tone">${['blue', 'green', 'cream'].map((t) => `<option ${p.tone === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          </div>
          <label class="f" style="margin-top:10px">Excerpt (short summary, used in cards + SEO)<textarea data-bind="${i}|excerpt">${esc(p.excerpt)}</textarea></label>
          <label class="f" style="margin-top:10px">Body (article content)<textarea data-bind="${i}|body" style="min-height:140px" placeholder="## Heading\n\nParagraph text…">${esc(p.body || '')}</textarea></label>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-img]').forEach((b) => b.onclick = () => pickImage(list[Number(b.dataset.img)], 'img'));
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this blog? Its page will be deleted on rebuild.')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => {
      const title = prompt('Blog title?') || 'New article';
      list.unshift({ id: newId(), slug: slugify(title), related: '', cat: 'Kidney Health', title, excerpt: '', time: '5 min read', tone: 'green', date: new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }), author: 'RIIMS Nephrology Team', img: '', body: '' });
      render();
    };
    $('#save').onclick = () => {
      const slugs = new Set();
      for (const p of list) {
        if (!p.slug) { toast('Every blog needs a slug', true); return; }
        p.slug = slugify(p.slug);
        if (slugs.has(p.slug)) { toast(`Duplicate slug "${p.slug}" — each blog needs a unique URL`, true); return; }
        slugs.add(p.slug);
      }
      saveSection('posts', list, 'Blogs');
    };
  }

  /* ---- Search widget (Popular chips + per-topic blog/doctor/video) ---- */
  function renderSearch(v) {
    const cfg = (content.search && Array.isArray(content.search.topics)) ? content.search : { topics: [] };
    content.search = cfg;                 // keep the reference we save
    const list = cfg.topics;
    const posts = content.posts || [];
    const doctors = content.doctors || [];
    const reels = content.reels || [];
    const docOptions = (sel) => `<option value="" ${!sel ? 'selected' : ''}>Auto (nephrologist)</option>`
      + `<option value="RIIMS Care Team" ${sel === 'RIIMS Care Team' ? 'selected' : ''}>RIIMS Care Team</option>`
      + doctors.map((d) => `<option value="${esc(d.name)}" ${sel === d.name ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
    const reelOptions = (sel) => `<option value="" ${!sel ? 'selected' : ''}>Auto (first reel)</option>`
      + reels.map((r) => `<option value="${esc(r.title)}" ${sel === r.title ? 'selected' : ''}>${esc(r.title)}</option>`).join('');
    const blogChecks = (i, slugs) => (posts.length
      ? posts.map((p) => `<label style="display:flex;gap:6px;align-items:center;font-size:13px;font-weight:500"><input type="checkbox" data-blog="${i}" value="${esc(p.slug)}" ${slugs.includes(p.slug) ? 'checked' : ''}> ${esc(p.title)}</label>`).join('')
      : '<span class="muted" style="font-size:13px">No blogs yet — add some in the Blogs tab.</span>');
    v.innerHTML = `
      <div class="head"><h2>Search widget (${list.length} topics)</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add topic</button>
        <button id="save" class="btn primary">Save search</button></div></div>
      <div class="card muted" style="font-size:13px">Home page ke search me: <b>Popular</b> chips wahi topics dikhte hain jinpar "Popular chip" tick hai. Jab koi topic ke <b>keywords</b> me se kuch search kare, to uske liye niche chune gaye <b>blogs</b>, <b>doctor</b> aur <b>video</b> dikhte hain. Doctor/Video "Auto" chhodo to system khud (nephrologist / pehli reel) bhar dega.</div>
      ${list.map((tp, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <b style="font-size:15px">${esc(tp.label || 'Topic')}</b>
            <label style="display:flex;align-items:center;gap:6px;font-size:14px;margin-left:8px"><input type="checkbox" data-pop="${i}" ${tp.popular ? 'checked' : ''}> Popular chip</label>
            <span style="flex:1"></span>
            <button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid2">
            <label class="f">Chip / topic label<input data-bind="${i}|label" value="${esc(tp.label || '')}"></label>
            <label class="f">Match keywords (comma-separated)<input data-bind="${i}|keywords" value="${esc(tp.keywords || '')}" placeholder="creatinine, creat"></label>
            <label class="f">Doctor<select data-bind="${i}|doctor">${docOptions(tp.doctor || '')}</select></label>
            <label class="f">Video / reel<select data-bind="${i}|reel">${reelOptions(tp.reel || '')}</select></label>
          </div>
          <div class="f" style="margin-top:10px"><span style="font-size:13px;font-weight:600">Related articles (tick the blogs to show)</span>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:4px 14px;margin-top:6px">${blogChecks(i, tp.blogSlugs || [])}</div>
          </div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-pop]').forEach((c) => c.onchange = () => { list[Number(c.dataset.pop)].popular = c.checked; });
    v.querySelectorAll('[data-blog]').forEach((c) => c.onchange = () => {
      const tp = list[Number(c.dataset.blog)];
      const set = new Set(tp.blogSlugs || []);
      if (c.checked) set.add(c.value); else set.delete(c.value);
      tp.blogSlugs = [...set];
    });
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this search topic?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), label: 'New topic', keywords: '', popular: false, blogSlugs: [], doctor: '', reel: '' }); render(); };
    $('#save').onclick = () => saveSection('search', { topics: list }, 'Search');
  }

  /* ---- About page ---- */
  function renderAbout(v) {
    const a = content.about || (content.about = {});
    a.hero = a.hero || {};
    const values = a.values || (a.values = []);
    v.innerHTML = `${ICON_DATALIST}
      <div class="head"><h2>About page</h2><button id="save" class="btn primary">Save About</button></div>
      <div class="card">
        <div class="grid2">
          <label class="f">Hero title<input id="a-htitle" value="${esc(a.hero.title || '')}"></label>
          <label class="f">Image alt text<input id="a-alt" value="${esc(a.imageAlt || '')}"></label>
        </div>
        <label class="f" style="margin-top:10px">Hero intro<textarea id="a-hintro">${esc(a.hero.intro || '')}</textarea></label>
      </div>
      <div class="card">
        <label class="f">Story heading<input id="a-sheading" value="${esc(a.storyHeading || '')}"></label>
        <label class="f" style="margin-top:10px">Story paragraphs (ek khali line = naya paragraph; &lt;strong&gt; allowed)<textarea id="a-story" style="min-height:180px">${esc((a.story || []).join('\n\n'))}</textarea></label>
      </div>
      <div class="card">
        <label class="f">CKD awareness note (khali = hide; &lt;strong&gt; allowed)<textarea id="a-ckd">${esc(a.ckdNote || '')}</textarea></label>
        <p class="muted" style="font-size:13px;margin:6px 0 0">⚠️ Compliance: koi cure/guarantee dava nahi.</p>
      </div>
      <div class="card">
        <div class="head" style="margin:0 0 8px"><h3 style="margin:0">Value cards (${values.length})</h3><button id="addval" class="btn light small">＋ Add card</button></div>
        ${values.map((x, i) => `<div class="card"><div class="row" style="margin-bottom:8px"><b>#${i + 1}</b><span style="flex:1"></span>${reorderBtns(i)}<button class="btn danger small" data-del="${i}">Remove</button></div><div class="grid3">${iconField(i, x.icon)}<label class="f">Title<input data-bind="${i}|t" value="${esc(x.t)}"></label><label class="f">Description<input data-bind="${i}|d" value="${esc(x.d)}"></label></div></div>`).join('')}
      </div>`;
    bindFields(v, values); wireReorder(v, values);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { values.splice(Number(b.dataset.del), 1); render(); });
    $('#addval').onclick = () => { values.push({ icon: 'file-check-2', t: '', d: '' }); render(); };
    $('#save').onclick = () => {
      content.about = {
        hero: { title: fval('#a-htitle'), intro: fval('#a-hintro') },
        storyHeading: fval('#a-sheading'),
        story: fval('#a-story').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
        imageAlt: fval('#a-alt'),
        ckdNote: fval('#a-ckd'),
        values,
      };
      saveSection('about', content.about, 'About page');
    };
  }

  /* ---- Legal pages (Privacy / Terms / Disclaimer) ---- */
  function renderLegal(v) {
    const L = content.legal || (content.legal = {});
    ['privacy', 'terms', 'disclaimer'].forEach((k) => { L[k] = L[k] || { title: '', intro: '', sections: [] }; if (!Array.isArray(L[k].sections)) L[k].sections = []; });
    const panel = (k, label) => {
      const p = L[k];
      return `<div class="card">
        <h3 style="margin:0 0 10px">${label}</h3>
        <label class="f">Page title<input data-leg="${k}|title" value="${esc(p.title)}"></label>
        <label class="f" style="margin-top:10px">Intro<textarea data-leg="${k}|intro">${esc(p.intro)}</textarea></label>
        <div style="margin:12px 0 4px;font-size:13px;font-weight:600">Sections</div>
        ${p.sections.map((s, i) => `<div class="card" style="margin-top:8px"><div class="row" style="margin-bottom:6px"><b>#${i + 1}</b><span style="flex:1"></span><button class="btn danger small" data-legdel="${k}|${i}">Remove</button></div><label class="f">Heading<input data-legsec="${k}|${i}|0" value="${esc(s[0] || '')}"></label><label class="f" style="margin-top:8px">Body<textarea data-legsec="${k}|${i}|1">${esc(s[1] || '')}</textarea></label></div>`).join('')}
        <button class="btn light small" data-legadd="${k}" style="margin-top:8px">＋ Add section</button>
      </div>`;
    };
    v.innerHTML = `<div class="head"><h2>Legal pages</h2><button id="save" class="btn primary">Save legal</button></div>
      <div class="card muted" style="font-size:13px">⚠️ Medical/legal compliance: disclaimers ko honest rakho (no cure/guarantee). Kisi page ko poora khali chhoda to built-in default wapas aa jayega — required legal copy delete nahi hoti.</div>
      ${panel('privacy', 'Privacy Policy')}${panel('terms', 'Terms of Use')}${panel('disclaimer', 'Medical Disclaimer')}`;
    v.querySelectorAll('[data-leg]').forEach((el) => el.addEventListener('input', () => { const [k, f] = el.dataset.leg.split('|'); L[k][f] = el.value; }));
    v.querySelectorAll('[data-legsec]').forEach((el) => el.addEventListener('input', () => { const [k, i, f] = el.dataset.legsec.split('|'); L[k].sections[Number(i)][Number(f)] = el.value; }));
    v.querySelectorAll('[data-legdel]').forEach((b) => b.onclick = () => { const [k, i] = b.dataset.legdel.split('|'); L[k].sections.splice(Number(i), 1); render(); });
    v.querySelectorAll('[data-legadd]').forEach((b) => b.onclick = () => { L[b.dataset.legadd].sections.push(['', '']); render(); });
    $('#save').onclick = () => saveSection('legal', L, 'Legal pages');
  }

  /* ---- Tracking / Tags (gtag + verification meta tags) ---- */
  function renderTracking(v) {
    const t = content.tracking || { gtagId: '', metaTags: '' };
    v.innerHTML = `
      <div class="head"><h2>Tracking / Tags</h2><button id="save" class="btn primary">Save & apply to whole site</button></div>
      <div class="card">
        <label class="f">Google Tag ID (gtag)<input id="gtagid" value="${esc(t.gtagId || '')}" placeholder="G-XXXXXXXXXX  ya  AW-XXXXXXXXX"></label>
        <p class="muted" style="font-size:13px">Google Analytics 4 ya Google Ads ka tag ID. Milega: <b>analytics.google.com</b> → Admin → Data Streams → apni site → "Measurement ID" (G- se shuru). Save karte hi har page par Google tracking lag jaayegi.</p>
      </div>
      <div class="card">
        <label class="f">Meta tags (verification)<textarea id="metatags" style="min-height:110px" placeholder='&lt;meta name="google-site-verification" content="..." /&gt;\n&lt;meta name="msvalidate.01" content="..." /&gt;'>${esc(t.metaTags || '')}</textarea></label>
        <p class="muted" style="font-size:13px">Yahan verification tags paste karo — jaise <b>Google Search Console</b>, Bing, ya Facebook domain verification ka <b>&lt;meta&gt;</b> tag (ek per line). Sirf <b>&lt;meta&gt;</b> / <b>&lt;link&gt;</b> tags lagenge (script yahan nahi chalega — gtag upar wale box se lagta hai). Har page ke &lt;head&gt; mein add ho jaayenge.</p>
      </div>`;
    $('#save').onclick = () => {
      content.tracking = { gtagId: $('#gtagid').value.trim(), metaTags: $('#metatags').value };
      saveSection('tracking', content.tracking, 'Tracking tags');
    };
  }

  /* ---- Settings ---- */
  function renderSettings(v) {
    const s = content.site || {};
    const geo = s.geo || {};
    const cta = content.cta || {};
    const st = content.stats || { enabled: false, rating: '', reviews: '', patients: '', specialists: '' };
    v.innerHTML = `
      <div class="head"><h2>Settings</h2><button id="save" class="btn primary">Save settings</button></div>
      <div class="card">
        <h3 style="margin:0 0 10px">📞 Contact numbers</h3>
        <div class="grid2">
          <label class="f">Call number (10 digits)<input id="callnum" maxlength="10" value="${esc(s.callNumber || '')}"></label>
          <label class="f">WhatsApp number (10 digits)<input id="wanum" maxlength="10" value="${esc(s.whatsappNumber || '')}"></label>
          <label class="f">Email (optional)<input id="s-email" value="${esc(s.email || '')}" placeholder="care@riimshospitals.com"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">Har Call/WhatsApp button, header, footer, contact page aur schema in numbers se chalte hain.</p>
      </div>
      <div class="card">
        <h3 style="margin:0 0 10px">📍 Business info (address, hours, map)</h3>
        <div class="grid2">
          <label class="f">City line (utility bar + footer)<input id="s-city" value="${esc(s.city || '')}" placeholder="Baraut, Uttar Pradesh 250611"></label>
          <label class="f">Opening hours<input id="s-hours" value="${esc(s.hours || '')}" placeholder="Mon–Sat, 9am–7pm"></label>
          <label class="f">Address line 1<input id="s-addr1" value="${esc(s.addressLine || '')}" placeholder="Near Baraut Medicity Hospital"></label>
          <label class="f">Address line 2<input id="s-addr2" value="${esc(s.addressSub || '')}" placeholder="Kotana Rd, Baraut, UP 250611"></label>
          <label class="f">Google Maps link<input id="s-maps" value="${esc(s.mapsLink || '')}" placeholder="https://maps.google.com/…"></label>
          <label class="f">Service cities (comma-separated, for SEO)<input id="s-cities" value="${esc((s.serviceCities || []).join(', '))}" placeholder="Baraut, Baghpat, Meerut, Shamli"></label>
          <label class="f">Map latitude<input id="s-lat" value="${esc(geo.lat != null ? geo.lat : '')}" placeholder="29.1066"></label>
          <label class="f">Map longitude<input id="s-lng" value="${esc(geo.lng != null ? geo.lng : '')}" placeholder="77.2637"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">Ye footer, contact page aur Google ke liye business-location (LocalBusiness) schema ko update karte hain. Lat/Lng ko Google Business Profile se verify karo.</p>
      </div>
      <div class="card">
        <h3 style="margin:0 0 10px">🔗 Social links (blank = us icon ko hide kar do)</h3>
        <div class="grid2">
          <label class="f">Facebook URL<input id="s-fb" value="${esc(s.facebook || '')}" placeholder="https://facebook.com/…"></label>
          <label class="f">Instagram URL<input id="s-ig" value="${esc(s.instagram || '')}" placeholder="https://instagram.com/…"></label>
          <label class="f">YouTube URL<input id="s-yt" value="${esc(s.youtube || '')}" placeholder="https://youtube.com/@…"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">Header + footer icons aur JSON-LD "sameAs" yahan se aate hain. Jo box khali karoge wo icon site se hat jayega.</p>
      </div>
      <div class="card">
        <h3 style="margin:0 0 10px">📣 Call-to-action band (har page ke neeche wala teal box)</h3>
        <div class="grid2">
          <label class="f">Eyebrow (chhota label)<input id="c-eyebrow" value="${esc(cta.eyebrow || '')}"></label>
          <label class="f">Title (badi heading)<input id="c-title" value="${esc(cta.title || '')}"></label>
        </div>
        <label class="f" style="margin-top:10px">Intro line<textarea id="c-intro">${esc(cta.intro || '')}</textarea></label>
        <div class="grid2" style="margin-top:10px">
          <label class="f">Book button label<input id="c-book" value="${esc(cta.bookLabel || '')}"></label>
          <label class="f">WhatsApp button label<input id="c-wa" value="${esc(cta.whatsappLabel || '')}"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">⚠️ Compliance: koi "100% cure / guaranteed / dialysis band" jaisa dava mat likho.</p>
      </div>
      <div class="card">
        <h3 style="margin:0 0 10px">Homepage stats strip (Google rating &amp; numbers)</h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:12px">
          <input type="checkbox" id="st-on" ${st.enabled ? 'checked' : ''}> Show the stats strip on the homepage
        </label>
        <div class="grid2">
          <label class="f">Google rating (e.g. 4.8)<input id="st-rating" value="${esc(st.rating || '')}" placeholder="4.8"></label>
          <label class="f">Google reviews count<input id="st-reviews" value="${esc(st.reviews || '')}" placeholder="310"></label>
          <label class="f">Patients guided<input id="st-patients" value="${esc(st.patients || '')}" placeholder="12000"></label>
          <label class="f">Kidney specialists<input id="st-specialists" value="${esc(st.specialists || '')}" placeholder="6"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">⚠️ Sirf <b>REAL numbers</b> daalo (Google Business Profile se). Medical site par fake rating/reviews Google ranking ko nuksan pahunchate hain. Jo box khali hoga wo stat website par nahi dikhega; checkbox off = poori strip hidden.</p>
      </div>`;
    const val = (id) => ($(id) ? $(id).value.trim() : '');
    $('#save').onclick = () => {
      const call = $('#callnum').value.replace(/\D/g, ''), wa = $('#wanum').value.replace(/\D/g, '');
      if (call.length !== 10 || wa.length !== 10) { toast('Both numbers must be exactly 10 digits', true); return; }
      content.site = {
        callNumber: call, whatsappNumber: wa, email: val('#s-email'),
        facebook: val('#s-fb'), instagram: val('#s-ig'), youtube: val('#s-yt'),
        city: val('#s-city'), addressLine: val('#s-addr1'), addressSub: val('#s-addr2'), hours: val('#s-hours'),
        mapsLink: val('#s-maps'),
        serviceCities: val('#s-cities').split(',').map((x) => x.trim()).filter(Boolean),
        geo: { lat: Number(val('#s-lat')) || 0, lng: Number(val('#s-lng')) || 0 },
      };
      content.cta = {
        eyebrow: val('#c-eyebrow'), title: val('#c-title'), intro: val('#c-intro'),
        bookLabel: val('#c-book'), whatsappLabel: val('#c-wa'),
      };
      content.stats = {
        enabled: $('#st-on').checked,
        rating: val('#st-rating'), reviews: val('#st-reviews'),
        patients: val('#st-patients'), specialists: val('#st-specialists'),
      };
      saveSection('site', content.site, 'Business info');
      saveSection('cta', content.cta, 'CTA band');
      saveSection('stats', content.stats, 'Stats strip');
    };
  }

  /* ---- Protocol FAQs (DNA Kayakalp Protocol page) ---- */
  function renderProtocol(v) {
    const cfg = (content.protocol && Array.isArray(content.protocol.faqs)) ? content.protocol : { faqs: [] };
    content.protocol = cfg;
    const list = cfg.faqs;
    v.innerHTML = `
      <div class="head"><h2>Protocol FAQs (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add FAQ</button>
        <button id="save" class="btn primary">Save protocol FAQs</button></div></div>
      <div class="card muted" style="font-size:13px">Ye FAQs <b>/dna-kayakalp-protocol.html</b> page par + uske Google rich-result (FAQPage) schema me dikhte hain. ⚠️ Compliance: honest raho — koi cure/guarantee/"dialysis band" dava nahi. List khali chhodi to built-in default FAQs dikhenge.</div>
      ${list.map((f, i) => `
        <div class="card">
          <label class="f">Question<input data-bind="${i}|q" value="${esc(f.q)}"></label>
          <label class="f" style="margin-top:10px">Answer<textarea data-bind="${i}|a" style="min-height:90px">${esc(f.a)}</textarea></label>
          <div class="row" style="margin-top:8px;justify-content:flex-end"><button class="btn danger small" data-del="${i}">Remove</button></div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this FAQ?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), q: '', a: '' }); render(); };
    $('#save').onclick = () => saveSection('protocol', { faqs: list }, 'Protocol FAQs');
  }

  /* ---- Services (Complete Care tiles) ---- */
  function renderServices(v) {
    const list = content.services || (content.services = []);
    v.innerHTML = `${ICON_DATALIST}
      <div class="head"><h2>Services — Complete Care (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add service</button>
        <button id="save" class="btn primary">Save services</button></div></div>
      <div class="card muted" style="font-size:13px">Ye tiles home "Complete Care" grid + <b>/services.html</b> par dikhte hain. Icon = Lucide naam (list se choose karo).</div>
      ${list.map((s, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px"><b style="font-size:14px">#${i + 1}</b><span style="flex:1"></span>${reorderBtns(i)}<button class="btn danger small" data-del="${i}">Remove</button></div>
          <div class="grid3">${iconField(i, s.icon)}
            <label class="f">Title<input data-bind="${i}|t" value="${esc(s.t)}"></label>
            <label class="f">Description<input data-bind="${i}|d" value="${esc(s.d)}"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list); wireReorder(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this service?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ icon: 'stethoscope', t: '', d: '' }); render(); };
    $('#save').onclick = () => saveSection('services', list, 'Services');
  }

  /* ---- Why RIIMS cards ---- */
  function renderWhy(v) {
    const list = content.why || (content.why = []);
    v.innerHTML = `${ICON_DATALIST}
      <div class="head"><h2>Why RIIMS (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add card</button>
        <button id="save" class="btn primary">Save Why RIIMS</button></div></div>
      <div class="card muted" style="font-size:13px">Home "Why RIIMS" cards. ⚠️ Koi cure/guarantee dava nahi.</div>
      ${list.map((s, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px"><b style="font-size:14px">#${i + 1}</b><span style="flex:1"></span>${reorderBtns(i)}<button class="btn danger small" data-del="${i}">Remove</button></div>
          <div class="grid3">${iconField(i, s.icon)}
            <label class="f">Title<input data-bind="${i}|title" value="${esc(s.title)}"></label>
            <label class="f">Description<input data-bind="${i}|desc" value="${esc(s.desc)}"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list); wireReorder(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this card?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ icon: 'shield-check', title: '', desc: '' }); render(); };
    $('#save').onclick = () => saveSection('why', list, 'Why RIIMS');
  }

  /* ---- How-it-works steps ---- */
  function renderSteps(v) {
    const list = content.steps || (content.steps = []);
    v.innerHTML = `${ICON_DATALIST}
      <div class="head"><h2>How it works — steps (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add step</button>
        <button id="save" class="btn primary">Save steps</button></div></div>
      <div class="card muted" style="font-size:13px">"How consultation works" steps (home + services page). Step number order se auto lagta hai.</div>
      ${list.map((s, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px"><b style="font-size:14px">Step ${i + 1}</b><span style="flex:1"></span>${reorderBtns(i)}<button class="btn danger small" data-del="${i}">Remove</button></div>
          <div class="grid3">${iconField(i, s.icon)}
            <label class="f">Title<input data-bind="${i}|title" value="${esc(s.title)}"></label>
            <label class="f">Description<input data-bind="${i}|desc" value="${esc(s.desc)}"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list); wireReorder(v, list);
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this step?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ icon: 'file-text', title: '', desc: '' }); render(); };
    $('#save').onclick = () => saveSection('steps', list, 'Steps');
  }

  /* ---- Banners (home hero slider) ---- */
  function renderBanners(v) {
    const cfg = (content.banners && Array.isArray(content.banners.slides)) ? content.banners : { speed: 3, slides: [] };
    content.banners = cfg;
    if (typeof cfg.speed !== 'number') cfg.speed = Number(cfg.speed) || 3;
    const list = cfg.slides;
    v.innerHTML = `
      <div class="head"><h2>Home banners (${list.length})</h2>
        <div class="row"><button id="add" class="btn light small">＋ Add banner</button>
        <button id="save" class="btn primary">Save banners</button></div></div>
      <div class="card">
        <label class="f" style="max-width:260px">Auto-slide speed (seconds each)<input id="b-speed" type="number" min="1" max="30" value="${esc(cfg.speed)}"></label>
        <p class="muted" style="font-size:13px;margin:8px 0 0">📐 Best banner size: <b>1920 × 400 px</b>. Koi bhi size upload karo — image apne aap fit ho jaayegi (side pe gap/toot nahi aayegi). Sirf <b>1</b> banner ho to slider auto nahi chalega (ek hi image dikhegi). Bade images optimize karke daalo (fast loading ke liye).</p>
      </div>
      ${list.map((b, i) => `
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <img class="thumb wide" src="${imgSrc(b.img)}" alt="" style="aspect-ratio:1920/400;object-fit:cover;background:#eef2f4">
            <button class="btn light small" data-img="${i}">📷 Banner image</button>
            <span style="flex:1"></span>${reorderBtns(i)}<button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid2">
            <label class="f">Alt text (SEO / accessibility)<input data-bind="${i}|alt" value="${esc(b.alt || '')}" placeholder="RIIMS — sarkari rates par kidney care"></label>
            <label class="f">Click link (optional — blank = no link)<input data-bind="${i}|url" value="${esc(b.url || '')}" placeholder="https://…  ya  contact.html"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list); wireReorder(v, list);
    v.querySelectorAll('[data-img]').forEach((btn) => btn.onclick = () => pickImage(list[Number(btn.dataset.img)], 'img'));
    v.querySelectorAll('[data-del]').forEach((btn) => btn.onclick = () => { if (confirm('Remove this banner?')) { list.splice(Number(btn.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), img: '', alt: '', url: '' }); render(); };
    $('#save').onclick = () => {
      const speed = Math.min(30, Math.max(1, Number($('#b-speed').value) || 3));
      const slides = list.filter((b) => b.img);   // drop empty (no image) slides
      if (!slides.length) { toast('Kam se kam ek banner image add karo', true); return; }
      saveSection('banners', { speed, slides }, 'Banners');
    };
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    try {
      await api('/api/admin/me');
      [content, leads] = await Promise.all([api('/api/admin/content'), api('/api/admin/leads')]);
      showApp(); render();
    } catch { /* showLogin already called on 401 */ }
  }
  boot();
})();
