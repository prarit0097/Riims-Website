/* RIIMS static site — interactivity.
   Booking modal, 2-step appointment form, FAQ accordion, multi-disease search,
   blog category filter, newsletter, select state, and count-up stats.
   No build step, no dependencies (Lucide is self-hosted, loaded separately). */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* Lightweight conversion analytics — fires GA4 events only if a Google Tag is
     configured (Admin → Tracking). Safe no-op otherwise. */
  function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) { /* ignore */ } }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) track('click_whatsapp', { page: location.pathname });
    else if (/^tel:/i.test(href)) track('click_call', { page: location.pathname });
  }, true);

  /* ---------------- Booking modal ---------------- */
  const modal = $('#booking-modal');
  function openModal() {
    if (!modal) return;
    modal.removeAttribute('hidden');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    refreshIcons();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    const book = e.target.closest('[data-book]');
    if (book) { e.preventDefault(); track('click_book', { page: location.pathname }); openModal(); return; }
    if (e.target.closest('[data-modal-close]')) { closeModal(); return; }
    if (modal && modal.classList.contains('is-open') && e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });

  /* ---------------- Appointment form (2 steps) ---------------- */
  function showStep(form, n) {
    $$('.appt-step', form).forEach((el) => {
      const match = el.getAttribute('data-step') === String(n);
      if (match) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
    refreshIcons();
  }
  function formValues(form) {
    const v = (n) => { const el = form.querySelector(`[name="${n}"]`); return el ? el.value.trim() : ''; };
    return {
      name: v('name'), phone: v('phone'), problem: v('problem'),
      website: v('website'), // honeypot — must stay empty
      page: location.pathname,
      stage: 'complete',
    };
  }

  /* Store the lead via the admin API — it appears in the /admin/ Leads tab. */
  function postLead(form) {
    return fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues(form)),
    }).catch(() => {});
  }

  $$('[data-apptform]').forEach((form) => {
    const f = $('[data-step="0"]', form);
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); track('form_submit', { page: location.pathname }); postLead(form); showStep(form, 2); });
    const reset = $('[data-appt-reset]', form);
    if (reset) reset.addEventListener('click', () => { if (f) f.reset(); showStep(form, 0); });
  });

  /* ---------------- Select placeholder colour ---------------- */
  $$('.riims-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      sel.classList.toggle('has-value', !!sel.value);
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  $$('[data-faq] .faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq]');
      const isOpen = item.hasAttribute('data-open');
      // accordion: close siblings
      $$('[data-faq]').forEach((other) => {
        if (other === item) return;
        setFaq(other, false);
      });
      setFaq(item, !isOpen);
    });
  });
  function setFaq(item, open) {
    const btn = $('.faq-q', item);
    const chev = $('.faq-chevron', item);
    const panel = $('.faq-panel', item);
    if (open) item.setAttribute('data-open', ''); else item.removeAttribute('data-open');
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (chev) chev.style.transform = open ? 'rotate(180deg)' : 'none';
    if (panel) panel.style.gridTemplateRows = open ? '1fr' : '0fr';
    item.style.borderColor = open ? 'var(--border-brand)' : 'var(--border-subtle)';
    item.style.boxShadow = open ? 'var(--shadow-sm)' : 'none';
  }

  /* ---------------- Disease search (admin-driven) ----------------
     Topics + their blogs/specialist/video come from window.__RIIMS_SEARCH__
     (generated js/search-data.js, built from the admin "Search" config). A tiny
     fallback keeps the widget working if that file didn't load. */
  const TONE = {
    green: { bg: 'var(--surface-green-soft)', fg: 'var(--icon-accent)', badgeBg: 'var(--surface-green-soft)', badgeFg: 'var(--text-accent)' },
    blue: { bg: 'var(--surface-blue-soft)', fg: 'var(--icon-brand)', badgeBg: 'var(--surface-blue-soft)', badgeFg: 'var(--text-brand)' },
    cream: { bg: 'var(--surface-cream-deep)', fg: 'var(--sand-500)', badgeBg: 'var(--surface-cream-deep)', badgeFg: 'var(--text-on-cream)' },
  };
  const FALLBACK_TOPICS = [{
    label: 'Kidney', keys: ['kidney', 'creat', 'ckd', 'dialys', 'nephro', 'urine', 'gfr'],
    blogs: [{ title: 'High creatinine: symptoms & causes', href: 'blog.html' }, { title: 'CKD diet chart (Indian, veg)', href: 'blog.html' }, { title: 'Dialysis myths vs facts', href: 'blog.html' }],
    doctor: { name: 'RIIMS Nephrology Team', title: 'Kidney specialists', init: 'RN' }, video: null,
  }];
  function searchTopics() {
    const S = window.__RIIMS_SEARCH__;
    return (S && Array.isArray(S.topics) && S.topics.length) ? S.topics : FALLBACK_TOPICS;
  }
  function resolveTopic(q) {
    if (!q) return null;
    const s = q.toLowerCase();
    for (const t of searchTopics()) {
      const keys = (t.keys && t.keys.length) ? t.keys : [String(t.label || '').toLowerCase()];
      if (keys.some((k) => k && s.indexOf(k) !== -1)) return t;
    }
    return null;
  }
  function ic(n, size, style) { return `<i data-lucide="${n}" aria-hidden="true" style="width:${size}px;height:${size}px;${style || ''}"></i>`; }

  function renderSearch(container, q) {
    if (!q) { container.innerHTML = ''; return; }
    const topic = resolveTopic(q);
    if (!topic) {
      container.innerHTML = `<p style="text-align:center;margin-top:1.6rem;color:var(--text-muted);font-family:var(--font-sans)">No direct match — <a href="#" data-book style="color:var(--text-link);font-weight:700">talk to our care team</a> and we’ll guide you.</p>`;
      refreshIcons();
      return;
    }
    const t = TONE[topic.tone] || TONE.green;
    const cardCss = 'position:relative;border-radius:var(--radius-lg);box-shadow:var(--shadow-md);background:var(--surface-card);border:1px solid var(--border-subtle);overflow:hidden';
    const blogItems = (topic.blogs && topic.blogs.length) ? topic.blogs : [];
    const blogsHtml = blogItems.length
      ? blogItems.map((b) => `<li><a href="${b.href}" style="display:flex;gap:.5rem;align-items:flex-start;color:var(--text-body);text-decoration:none;font-size:var(--fs-base)">${ic('arrow-right', 15, 'margin-top:3px;color:var(--icon-accent);flex:0 0 auto')} ${b.title}</a></li>`).join('')
      : `<li style="list-style:none;color:var(--text-muted);font-size:var(--fs-base)">More articles coming soon.</li>`;
    const doctor = topic.doctor || { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' };
    const video = topic.video || null;
    const videoHref = video ? (video.href || '') : '';
    const cards = [];
    cards.push(`<div style="${cardCss};padding:var(--space-6)"><span style="display:inline-flex;align-items:center;gap:.5rem;font-weight:700;font-family:var(--font-sans);color:var(--text-strong);margin-bottom:.6rem">${ic('book-open', 18, 'color:var(--icon-brand)')} Related articles</span><ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.55rem">${blogsHtml}</ul></div>`);
    cards.push(`<div style="${cardCss};padding:var(--space-6)"><span style="display:inline-flex;align-items:center;gap:.5rem;font-weight:700;font-family:var(--font-sans);color:var(--text-strong);margin-bottom:.6rem">${ic('user-round', 18, 'color:var(--icon-brand)')} Specialist for you</span><div style="display:flex;align-items:center;gap:.8rem"><span style="flex:0 0 auto;display:inline-flex;width:52px;height:52px;border-radius:50%;background:${t.bg};color:${t.fg};align-items:center;justify-content:center;font-family:var(--font-sans);font-weight:800">${doctor.init}</span><div><strong style="display:block">${doctor.name}</strong><span style="font-size:var(--fs-sm);color:var(--text-muted)">${doctor.title}</span></div></div><button type="button" data-book class="riims-btn riims-btn--outline" style="display:flex;width:100%;align-items:center;justify-content:center;gap:.5rem;font-family:var(--font-sans);font-weight:800;line-height:1;white-space:nowrap;border-radius:var(--radius-pill);border:1.5px solid var(--border-strong);cursor:pointer;background:var(--white);color:var(--text-brand);font-size:.875rem;padding:.5rem .9rem;min-height:38px;margin-top:.9rem">${ic('calendar-check', 16)}<span>Book consultation</span></button></div>`);
    if (video) cards.push(`<${videoHref ? 'a' : 'div'} ${videoHref ? `href="${videoHref}" target="_blank" rel="noopener"` : ''} style="${cardCss};display:block;text-decoration:none;color:inherit"><div style="aspect-ratio:16/9;background:linear-gradient(135deg, var(--teal-700), var(--teal-900));display:flex;align-items:center;justify-content:center;position:relative"><span style="display:inline-flex;width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.92);color:var(--brand-primary);align-items:center;justify-content:center">${ic('play', 24)}</span></div><div style="padding:var(--space-4) var(--space-5)"><span style="display:inline-flex;align-items:center;gap:.5rem;font-weight:700;font-family:var(--font-sans);color:var(--text-strong)">${ic('video', 16, 'color:var(--icon-accent)')} ${video.title}</span></div></${videoHref ? 'a' : 'div'}>`);
    container.innerHTML = `<div style="margin-top:var(--space-8)">`
      + `<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;justify-content:center">`
      + `<span style="display:inline-flex;align-items:center;gap:.34rem;background:${t.badgeBg};color:${t.badgeFg};font-family:var(--font-sans);font-weight:700;font-size:var(--fs-sm);line-height:1;padding:.38rem .7rem;border-radius:var(--radius-pill)">${topic.label}</span>`
      + `<span style="font-family:var(--font-sans);color:var(--text-muted)">Here’s what we found for you</span></div>`
      + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(${cards.length},1fr);gap:var(--space-5)">`
      + cards.join('')
      + `</div></div>`;
    refreshIcons();
  }
  const searchForm = $('[data-search]');
  if (searchForm) {
    const inputEl = $('[data-search-input]', searchForm);
    const results = $('[data-search-results]');
    searchForm.addEventListener('submit', (e) => { e.preventDefault(); renderSearch(results, inputEl.value.trim()); });
    // Clear the results as soon as the box is emptied (typing, backspace, or the X).
    inputEl.addEventListener('input', () => { if (!inputEl.value.trim()) renderSearch(results, ''); });
    $$('[data-search-term]').forEach((chip) => {
      chip.addEventListener('click', () => { inputEl.value = chip.getAttribute('data-search-term'); renderSearch(results, inputEl.value.trim()); });
    });
  }

  /* ---------------- Blog category filter ---------------- */
  const blogGrid = $('[data-blog-grid]');
  if (blogGrid) {
    const featured = $('[data-featured]');
    const cards = $$('[data-blog-card]', blogGrid);
    $$('[data-blog-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-blog-cat');
        $$('[data-blog-cat]').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.style.background = on ? 'var(--brand-primary)' : 'var(--white)';
          b.style.color = on ? '#fff' : 'var(--text-body)';
          b.style.borderColor = on ? 'var(--brand-primary)' : 'var(--border-default)';
        });
        const all = cat === 'All';
        if (featured) featured.style.display = all ? '' : 'none';
        cards.forEach((c) => {
          if (all) c.style.display = c.hasAttribute('data-first') ? 'none' : '';
          else c.style.display = c.getAttribute('data-cat') === cat ? '' : 'none';
        });
      });
    });
    // initial state: hide the first card (it is the featured duplicate)
    cards.forEach((c) => { if (c.hasAttribute('data-first')) c.style.display = 'none'; });
  }

  /* ---------------- Newsletter ---------------- */
  const news = $('[data-newsletter]');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      news.style.display = 'none';
      const done = $('[data-newsletter-done]');
      if (done) { done.removeAttribute('hidden'); refreshIcons(); }
    });
  }

  /* ---------------- Count-up stats ---------------- */
  function animateCount(el) {
    const to = parseFloat(el.getAttribute('data-countup'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const indian = el.hasAttribute('data-indian');
    const suffix = el.getAttribute('data-suffix') || '';
    const t0 = performance.now(), dur = 1500;
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = to * eased;
      const shown = decimals > 0 ? val.toFixed(decimals) : (indian ? Math.round(val).toLocaleString('en-IN') : Math.round(val));
      el.textContent = shown + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$('[data-countup]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------------- Hero banner slider (auto-rotate + dots) ---------------- */
  (function heroSlider() {
    const root = $('[data-hero-slider]');
    if (!root) return;
    const slides = $$('.hero-slide', root);
    const dots = $$('.hero-dot', root);
    if (slides.length < 2) return;
    let idx = 0, timer = null;
    const AUTO = Math.max(1500, Number(root.getAttribute('data-interval')) || 3000);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (reduce) return; stop(); timer = setInterval(() => show(idx + 1), AUTO); }
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
    const prev = $('[data-slide-prev]', root), next = $('[data-slide-next]', root);
    if (prev) prev.addEventListener('click', () => { show(idx - 1); start(); });
    if (next) next.addEventListener('click', () => { show(idx + 1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    start();
  })();

  /* ---------------- Icons ---------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshIcons);
  } else {
    refreshIcons();
  }
  window.addEventListener('load', refreshIcons);
})();
