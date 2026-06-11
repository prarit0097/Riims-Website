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

  /* ---------------- views ---------------- */
  function render() {
    const v = $('#view');
    if (view === 'leads') return renderLeads(v);
    if (view === 'doctors') return renderDoctors(v);
    if (view === 'reels') return renderReels(v);
    if (view === 'stories') return renderStories(v);
    if (view === 'faqs') return renderFaqs(v);
    if (view === 'blogs') return renderBlogs(v);
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
            <span style="flex:1"></span>
            <button class="btn danger small" data-del="${i}">Remove</button>
          </div>
          <div class="grid3">
            <label class="f">Name<input data-bind="${i}|name" value="${esc(d.name)}"></label>
            <label class="f">Title<input data-bind="${i}|title" value="${esc(d.title)}"></label>
            <label class="f">Qualifications<input data-bind="${i}|quals" value="${esc(d.quals)}"></label>
            <label class="f">Specialties (comma separated)<input data-bind="${i}|specialties" value="${esc((d.specialties || []).join(', '))}"></label>
            <label class="f">Languages<input data-bind="${i}|languages" value="${esc(d.languages || 'Hindi, English')}"></label>
          </div>
        </div>`).join('')}`;
    bindFields(v, list);
    v.querySelectorAll('[data-img]').forEach((b) => b.onclick = () => pickImage(list[Number(b.dataset.img)], 'photo'));
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { if (confirm('Remove this doctor?')) { list.splice(Number(b.dataset.del), 1); render(); } });
    $('#add').onclick = () => { list.push({ id: newId(), name: 'Dr. ', title: '', quals: '', specialties: [], languages: 'Hindi, English', photo: '' }); render(); };
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
    const s = content.site;
    const st = content.stats || { enabled: false, rating: '', reviews: '', patients: '', specialists: '' };
    v.innerHTML = `
      <div class="head"><h2>Settings</h2><button id="save" class="btn primary">Save settings</button></div>
      <div class="card">
        <div class="grid2">
          <label class="f">Call number (10 digits)<input id="callnum" maxlength="10" value="${esc(s.callNumber)}"></label>
          <label class="f">WhatsApp number (10 digits)<input id="wanum" maxlength="10" value="${esc(s.whatsappNumber)}"></label>
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:0">These update every Call / WhatsApp button, the header, footer, contact page and schema across the whole website (after rebuild).</p>
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
    $('#save').onclick = () => {
      const call = $('#callnum').value.replace(/\D/g, ''), wa = $('#wanum').value.replace(/\D/g, '');
      if (call.length !== 10 || wa.length !== 10) { toast('Both numbers must be exactly 10 digits', true); return; }
      content.site = { callNumber: call, whatsappNumber: wa };
      content.stats = {
        enabled: $('#st-on').checked,
        rating: $('#st-rating').value.trim(), reviews: $('#st-reviews').value.trim(),
        patients: $('#st-patients').value.trim(), specialists: $('#st-specialists').value.trim(),
      };
      saveSection('site', content.site, 'Numbers');
      saveSection('stats', content.stats, 'Stats strip');
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
