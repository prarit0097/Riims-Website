/* RIIMS static-site generator — content sections.
   Ported from ui_kits/website sections-b/-c/-e + pages.jsx. */

import { icon, button, badge, card, eyebrow, sectionHead, starRow } from './components.mjs';
import { appointmentForm } from './chrome.mjs';
import {
  SITE, PROBLEMS, WHY, STEPS, DOCTORS, DOCTORS_FULL, EXPERTS, POSTS,
  TESTIMONIALS, FAQS, REELS, SERVICES, POPULAR,
} from './data.mjs';

const TONE = {
  blue: { bg: 'var(--surface-blue-soft)', fg: 'var(--icon-brand)' },
  green: { bg: 'var(--surface-green-soft)', fg: 'var(--icon-accent)' },
  cream: { bg: 'var(--surface-cream-deep)', fg: 'var(--sand-500)' },
};

/* ---------- Search banner (home) ---------- */
export function searchBanner() {
  const chips = POPULAR.map((p) =>
    `<button type="button" data-search-term="${p}" style="font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:600;cursor:pointer;padding:.35rem .8rem;border-radius:var(--radius-pill);border:1px solid var(--border-brand);background:var(--white);color:var(--text-brand)">${p}</button>`
  ).join('');

  return `<section style="position:relative;background:linear-gradient(180deg, var(--surface-blue-soft) 0%, var(--surface-page) 100%);border-bottom:1px solid var(--border-subtle)">`
    + `<div class="riims-container" style="padding-block:var(--section-pad-y);position:relative">`
    + `<div style="max-width:780px;margin:0 auto;text-align:center">`
    + eyebrow(`${icon('heart-pulse', { size: 15 })} Rashtriya Institute of Integrated Medical Sciences`)
    + `<h2 style="font-size:var(--fs-3xl);margin:0 0 .6rem">Search any disease, symptom or report</h2>`
    + `<p class="riims-lead" style="margin:0 auto 1.5rem;max-width:56ch">Type a condition to see related articles, the right specialist, and a helpful video — for kidney, liver, diabetes, heart and more.</p>`
    + `<form data-search style="display:flex;gap:.6rem;background:var(--white);border:1.5px solid var(--border-default);border-radius:var(--radius-pill);padding:.4rem .4rem .4rem 1.1rem;box-shadow:var(--shadow-lg);align-items:center">`
    + icon('search', { size: 20, style: 'color:var(--icon-default);flex:0 0 auto' })
    + `<input data-search-input placeholder="Search disease, symptom or treatment…" aria-label="Search" style="flex:1;border:none;outline:none;background:transparent;font-family:var(--font-sans);font-size:var(--fs-md);color:var(--text-strong);min-width:0">`
    + button('Search', { variant: 'primary', type: 'submit', iconLeft: icon('search', { size: 18 }) })
    + `</form>`
    + `<div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:1.1rem">`
    + `<span style="font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-muted);font-weight:600">Popular:</span>${chips}</div>`
    + `</div>`
    + `<div data-search-results></div>`
    + `</div></section>`;
}

/* ---------- Health reels ---------- */
function reelCard(r) {
  const badgeTone = r.tone === 'blue' ? 'blue' : r.tone === 'green' ? 'green' : 'cream';
  return `<div class="reel riims-card--hover" style="flex:0 0 auto;width:190px;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-sm);border:1px solid var(--border-subtle);scroll-snap-align:start">`
    + `<div style="aspect-ratio:3/4;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:.7rem;background:linear-gradient(160deg, var(--teal-600), var(--teal-900))">`
    + `<span aria-hidden="true" class="reel-bg img-cover ${r.img || ''}" style="position:absolute;inset:0"></span>`
    + badge(r.tag, { tone: badgeTone, style: { alignSelf: 'flex-start', position: 'relative' } })
    + `<span class="reel-play" style="position:absolute;inset:0;margin:auto;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.9);color:var(--brand-primary);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-md)">${icon('play', { size: 20 })}</span>`
    + `<div style="color:#fff;position:relative;text-shadow:0 1px 8px rgba(0,0,0,.45)">`
    + `<p style="margin:0 0 .25rem;font-family:var(--font-sans);font-weight:700;font-size:var(--fs-sm);line-height:1.25">${r.title}</p>`
    + `<span style="font-family:var(--font-sans);font-size:var(--fs-xs);color:rgba(255,255,255,.8)">${r.views}</span>`
    + `</div></div></div>`;
}
export function healthReels() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:var(--space-6)">`
    + `<div>${eyebrow(`${icon('clapperboard', { size: 15 })} Health Reels`)}<h2 style="font-size:var(--fs-3xl);margin:0">Short videos by our experts</h2></div>`
    + button('View all reels', { variant: 'ghost', iconRight: icon('arrow-right', { size: 16 }), href: SITE.instagram, extraAttrs: { target: '_blank', rel: 'noopener' } })
    + `</div>`
    + `<div class="reel-track" style="display:flex;gap:var(--space-4);overflow-x:auto;padding-bottom:.6rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">`
    + REELS.map(reelCard).join('')
    + `</div></div></section>`;
}

/* ---------- Conditions grid ---------- */
function problemCard(base, p) {
  const t = TONE[p.tone];
  return `<a href="${base}conditions/${p.slug}.html" class="riims-card riims-card--hover" style="display:flex;flex-direction:column;gap:.7rem;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-5);text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:var(--radius-md);background:${t.bg};color:${t.fg}">${icon(p.icon, { size: 24 })}</span>`
    + `<h3 style="font-size:var(--fs-xl);margin:0">${p.title}</h3>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${p.desc}</p>`
    + `<span style="margin-top:auto;padding-top:.4rem;display:inline-flex;align-items:center;gap:.35rem;color:var(--text-link);font-weight:700;font-size:var(--fs-sm);font-family:var(--font-sans)">Learn more ${icon('arrow-right', { size: 16 })}</span></a>`;
}
export function problemsSection(base) {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-subtle)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('search-check', { size: 15 })} Conditions we help with`, title: 'Kidney problems, explained simply', intro: 'Clear, doctor-aligned guidance on the concerns that bring most patients to RIIMS.' })
    + `<div class="grid-auto" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-5)">`
    + PROBLEMS.map((p) => problemCard(base, p)).join('')
    + `</div></div></section>`;
}

/* ---------- Stats strip (Google rating + count-up) ---------- */
export function statsStrip() {
  const stats = [
    { icon: 'star', countup: { to: 4.8, decimals: 1 }, label: 'Google rating' },
    { icon: 'users', countup: { to: 12000, indian: true, suffix: '+' }, label: 'Patients guided' },
    { icon: 'stethoscope', countup: { to: 6 }, label: 'Kidney specialists' },
    { icon: 'message-circle', countup: { to: 310, suffix: '+' }, label: 'Google reviews' },
  ];
  const cu = (c) => `<span data-countup="${c.to}"${c.decimals ? ` data-decimals="${c.decimals}"` : ''}${c.indian ? ' data-indian="1"' : ''}${c.suffix ? ` data-suffix="${c.suffix}"` : ''}>0</span>`;
  return `<section style="background:var(--surface-cream);border-block:1px solid var(--cream-200)">`
    + `<div class="riims-container" style="padding-block:var(--space-10)">`
    + `<div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin-bottom:var(--space-6);font-family:var(--font-sans);font-weight:700;color:var(--text-strong)">`
    + starRow(5, 18) + `<span>4.8 on Google</span>`
    + `<span style="color:var(--text-muted);font-weight:600">· based on 310+ reviews</span></div>`
    + `<div class="grid-4" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-5);text-align:center">`
    + stats.map((sx) =>
      `<div><span style="display:inline-flex;width:44px;height:44px;border-radius:50%;background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center;margin-bottom:.5rem">${icon(sx.icon, { size: 20 })}</span>`
      + `<div style="font-family:var(--font-display);font-weight:800;font-size:var(--fs-3xl);color:var(--text-brand);line-height:1.1">${cu(sx.countup)}</div>`
      + `<div style="font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:600;color:var(--text-muted);margin-top:.2rem">${sx.label}</div></div>`
    ).join('')
    + `</div>`
    + `<p style="margin:var(--space-6) 0 0;text-align:center;font-family:var(--font-sans);font-size:var(--fs-xs);color:var(--text-faint)">Demo figures — replace with live Google Business numbers before launch.</p>`
    + `</div></section>`;
}

/* ---------- Complete care ---------- */
export function completeCare() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-subtle)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('layout-grid', { size: 15 })} Complete Care`, title: 'All your kidney care, in one place', intro: 'Integrated, doctor-led services — from first consultation to long-term lifestyle support.' })
    + `<div class="services-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-4)">`
    + SERVICES.map((sv, i) =>
      `<div class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem">`
      + `<span style="display:inline-flex;width:46px;height:46px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center">${icon(sv.icon, { size: 22 })}</span>`
      + `<h3 style="font-size:var(--fs-lg);margin:.1rem 0 0">${i + 1}. ${sv.t}</h3>`
      + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${sv.d}</p></div>`
    ).join('')
    + `</div></div></section>`;
}

/* ---------- Why RIIMS ---------- */
export function whyRiims() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('badge-check', { size: 15 })} Why choose RIIMS`, title: 'Care you can understand and trust', intro: 'Premium, kidney-focused care that stays honest about what is and isn’t possible.' })
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-5)">`
    + WHY.map((w) =>
      `<div style="display:flex;gap:1rem"><span style="flex:0 0 auto;display:inline-flex;width:48px;height:48px;border-radius:var(--radius-md);background:var(--surface-blue-soft);color:var(--icon-brand);align-items:center;justify-content:center">${icon(w.icon, { size: 22 })}</span>`
      + `<div><h3 style="font-size:var(--fs-lg);margin:0 0 .25rem">${w.title}</h3><p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${w.desc}</p></div></div>`
    ).join('')
    + `</div></div></section>`;
}

/* ---------- How it works ---------- */
export function howItWorks() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-cream)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('route', { size: 15 })} How consultation works`, title: 'Four simple, transparent steps', intro: 'From first message to a follow-up plan — you always know what happens next.' })
    + `<div class="grid-4" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-5);position:relative">`
    + STEPS.map((s) =>
      `<div style="background:var(--surface-card);border:1px solid var(--cream-200);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem">`
      + `<div style="display:flex;align-items:center;gap:.7rem"><span style="display:inline-flex;width:44px;height:44px;border-radius:50%;background:var(--brand-primary);color:#fff;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:1.15rem;flex:0 0 auto">${s.n}</span>${icon(s.icon, { size: 22, style: 'color:var(--icon-accent)' })}</div>`
      + `<h3 style="font-size:var(--fs-lg);margin:.2rem 0 0">${s.title}</h3><p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${s.desc}</p></div>`
    ).join('')
    + `</div>`
    + `<div style="text-align:center;margin-top:var(--space-8)">`
    + button('Start your consultation', { variant: 'primary', size: 'lg', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
    + `</div></div></section>`;
}

/* ---------- Doctor card + sections ---------- */
export function doctorCard(d) {
  const specs = d.specialties ? d.specialties.map((sp) => `<span style="font-family:var(--font-sans);font-size:var(--fs-xs);font-weight:600;color:var(--text-brand);background:var(--surface-blue-soft);padding:.25rem .6rem;border-radius:var(--radius-pill)">${sp}</span>`).join('') : '';
  return `<div class="riims-card riims-card--hover" style="display:flex;flex-direction:column;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);overflow:hidden">`
    + `<div class="img-cover ${d.photo}" style="height:190px;display:flex;align-items:center;justify-content:center"></div>`
    + `<div style="padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem">`
    + `<div><h3 style="font-size:var(--fs-xl);margin:0">${d.name}</h3><p style="margin:.15rem 0 0;color:var(--text-accent);font-weight:600;font-size:var(--fs-sm)">${d.title}</p></div>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${d.quals}</p>`
    + `<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.2rem">${specs}</div>`
    + button('Book consultation', { variant: 'outline', size: 'sm', style: { marginTop: '.6rem' }, iconLeft: icon('calendar-check', { size: 16 }), extraAttrs: { 'data-book': true } })
    + `</div></div>`;
}
export function doctorsSection() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('stethoscope', { size: 15 })} Meet the team`, title: 'Doctors & integrated care specialists', intro: 'A kidney-focused team combining nephrology with safe, evidence-aware lifestyle support.' })
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-5)">`
    + DOCTORS.map(doctorCard).join('')
    + `</div></div></section>`;
}

/* ---------- Meet our experts (horizontal) ---------- */
function expertCard(d) {
  const rows = [['award', d.quals], ['stethoscope', d.title], ['languages', 'Hindi, English']]
    .map(([ic, tx]) => `<span style="display:inline-flex;align-items:center;gap:.45rem;color:var(--text-muted);font-size:var(--fs-sm);font-family:var(--font-sans)">${icon(ic, { size: 15, style: 'color:var(--icon-accent);flex:0 0 auto' })} ${tx}</span>`)
    .join('');
  return `<div class="expert riims-card--hover" style="flex:0 0 auto;width:248px;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);overflow:hidden;scroll-snap-align:start">`
    + `<div class="img-cover ${d.photo}" style="height:170px;display:flex;align-items:center;justify-content:center"></div>`
    + `<div style="padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:.45rem">`
    + `<strong style="font-size:var(--fs-lg);font-family:var(--font-display)">${d.name}</strong>${rows}`
    + button('View profile', { variant: 'primary', size: 'sm', fullWidth: true, style: { marginTop: '.5rem' }, extraAttrs: { 'data-book': true } })
    + `</div></div>`;
}
export function meetExperts(base) {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:var(--space-6)">`
    + `<div>${eyebrow(`${icon('stethoscope', { size: 15 })} Meet our experts`)}<h2 style="font-size:var(--fs-3xl);margin:0">Qualified, caring kidney specialists</h2></div>`
    + button('View all doctors', { variant: 'ghost', iconRight: icon('arrow-right', { size: 16 }), href: `${base}doctors.html` })
    + `</div>`
    + `<div class="reel-track" style="display:flex;gap:var(--space-5);overflow-x:auto;padding-bottom:.6rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">`
    + EXPERTS.map(expertCard).join('')
    + `</div></div></section>`;
}

/* ---------- Blog card + education ---------- */
export function blogCard(base, p) {
  const g = { blue: 'linear-gradient(135deg,var(--surface-blue-soft),var(--surface-green-soft))', green: 'linear-gradient(135deg,var(--surface-green-soft),var(--cream-100))', cream: 'linear-gradient(135deg,var(--surface-cream-deep),var(--surface-blue-soft))' }[p.tone];
  const cover = p.img
    ? `<div class="img-cover ${p.img}" style="aspect-ratio:16 / 9"></div>`
    : `<div style="aspect-ratio:16 / 9;background:${g};display:flex;align-items:center;justify-content:center">${icon('image', { size: 28, style: 'color:var(--teal-300)' })}</div>`;
  return `<a href="${base}blog.html" class="riims-card riims-card--hover" style="display:flex;flex-direction:column;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);overflow:hidden;text-decoration:none;color:inherit">`
    + cover
    + `<div style="padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem">`
    + `<span style="align-self:flex-start;font-family:var(--font-sans);font-size:var(--fs-xs);font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-accent)">${p.cat}</span>`
    + `<h3 style="font-size:var(--fs-lg);margin:0;line-height:var(--leading-snug)">${p.title}</h3>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${p.excerpt}</p>`
    + `<span style="margin-top:.2rem;display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap;color:var(--text-faint);font-size:var(--fs-sm);font-family:var(--font-sans)">`
    + (p.author ? `<span style="color:var(--text-muted);font-weight:600">${p.author}</span>` : '')
    + `<span style="display:inline-flex;align-items:center;gap:.35rem">${icon('clock', { size: 14 })} ${p.date ? p.date + ' · ' : ''}${p.time}</span></span>`
    + `</div></a>`;
}
export function educationSection(base) {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-subtle)">`
    + `<div class="riims-container">`
    + `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:var(--space-8)">`
    + `<div>${eyebrow(`${icon('book-open', { size: 15 })} Patient education`)}<h2 style="font-size:var(--fs-3xl);margin:0">Learn about your kidneys</h2></div>`
    + button('View all articles', { variant: 'ghost', iconRight: icon('arrow-right', { size: 16 }), href: `${base}blog.html` })
    + `</div>`
    + `<div class="blog-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-5)">`
    + POSTS.slice(0, 3).map((p) => blogCard(base, p)).join('')
    + `</div></div></section>`;
}

/* ---------- Testimonials ---------- */
function testimonialCard(t) {
  const initials = t.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<figure class="riims-card" style="margin:0;display:flex;flex-direction:column;gap:.9rem;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:var(--space-6)">`
    + starRow(t.rating, 18)
    + `<blockquote style="margin:0;font-family:var(--font-display);font-size:var(--fs-lg);color:var(--text-strong);line-height:var(--leading-snug)">&ldquo;${t.quote}&rdquo;</blockquote>`
    + `<figcaption style="display:flex;align-items:center;gap:.7rem;margin-top:auto">`
    + `<span style="display:inline-flex;width:44px;height:44px;border-radius:50%;background:var(--surface-green-soft);color:var(--text-accent);align-items:center;justify-content:center;font-family:var(--font-sans);font-weight:700;flex:0 0 auto">${initials}</span>`
    + `<span><strong style="display:block;font-size:var(--fs-base)">${t.name}</strong><span style="font-size:var(--fs-sm);color:var(--text-muted)">${t.loc}</span></span></figcaption>`
    + `<p style="margin:0;font-size:var(--fs-xs);color:var(--text-faint);font-style:italic">Individual experience. Results vary by patient and depend on doctor evaluation.</p></figure>`;
}
export function testimonials() {
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-inverse)">`
    + `<div class="riims-container">`
    + sectionHead({ onDark: true, eyebrow: `${icon('quote', { size: 15 })} Patient stories`, title: 'Care that patients remember', intro: 'Real experiences shared with consent. We never promise guaranteed outcomes.' })
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-5)">`
    + TESTIMONIALS.map(testimonialCard).join('')
    + `</div>`
    + `<div style="margin-top:var(--space-8);display:flex;justify-content:center">`
    + `<a href="${SITE.instagram}" class="riims-card--hover img-cover img-video" style="position:relative;display:block;width:100%;max-width:560px;aspect-ratio:16/10;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg);border:1px solid rgba(255,255,255,.14)">`
    + `<span style="position:absolute;left:16px;bottom:14px;color:#fff;font-family:var(--font-sans);font-weight:700;text-shadow:0 1px 8px rgba(0,0,0,.5)">Watch patient video stories</span></a>`
    + `</div></div></section>`;
}

/* ---------- FAQ ---------- */
export function faqSection() {
  const items = FAQS.map((f, i) => {
    const open = i === 0;
    return `<div class="faq-item" data-faq${open ? ' data-open' : ''} style="background:var(--surface-card);border:1px solid ${open ? 'var(--border-brand)' : 'var(--border-subtle)'};border-radius:var(--radius-md);box-shadow:${open ? 'var(--shadow-sm)' : 'none'};overflow:hidden;transition:border-color .22s">`
      + `<button type="button" class="faq-q" aria-expanded="${open}" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;background:transparent;border:none;cursor:pointer;text-align:left;padding:var(--space-4) var(--space-5);font-family:var(--font-sans);font-weight:600;font-size:var(--fs-md);color:var(--text-strong)">`
      + `<span>${f.q}</span>`
      + `<span class="faq-chevron" style="flex:0 0 auto;display:inline-flex;color:var(--icon-brand);transition:transform .22s var(--ease-out);transform:${open ? 'rotate(180deg)' : 'none'}">${icon('chevron-down')}</span></button>`
      + `<div class="faq-panel" style="display:grid;grid-template-rows:${open ? '1fr' : '0fr'};transition:grid-template-rows .22s var(--ease-out)">`
      + `<div style="overflow:hidden"><div style="padding:0 var(--space-5) var(--space-5);color:var(--text-muted);font-size:var(--fs-base);line-height:var(--leading-relaxed)">${f.a}</div></div></div></div>`;
  }).join('');
  return `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container" style="max-width:820px">`
    + sectionHead({ eyebrow: `${icon('help-circle', { size: 15 })} Frequently asked`, title: 'Questions patients ask us' })
    + `<div style="display:flex;flex-direction:column;gap:.7rem">${items}</div>`
    + `</div></section>`;
}

/* ---------- CTA band ---------- */
export function ctaBand() {
  return `<section style="padding-block:var(--space-12);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + `<div style="position:relative;overflow:hidden;border-radius:var(--radius-2xl);background:linear-gradient(135deg, var(--teal-700), var(--teal-900));color:#fff;text-align:center;padding:clamp(2rem,1.4rem + 3vw,3.5rem)">`
    + eyebrow(`${icon('heart-handshake', { size: 15 })} Take the first step`, { onDark: true })
    + `<h2 style="font-size:var(--fs-3xl);margin:0 auto .6rem;max-width:20ch;color:#fff">Talk to a kidney care expert today</h2>`
    + `<p style="margin:0 auto 1.6rem;max-width:54ch;font-size:var(--fs-lg);color:rgba(255,255,255,.85)">Share your reports and get doctor-guided, evidence-aware guidance — no false promises, just honest help.</p>`
    + `<div style="display:flex;flex-wrap:wrap;gap:.8rem;justify-content:center">`
    + button('Book Consultation', { variant: 'white', size: 'lg', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
    + button('WhatsApp Now', { variant: 'whatsapp', size: 'lg', iconLeft: icon('message-circle', { size: 18 }), href: SITE.whatsapp })
    + `</div></div></div></section>`;
}

/* ---------- Contact ---------- */
export function contactSection() {
  const contacts = [
    { icon: 'phone', label: 'Call us', value: SITE.phone, sub: SITE.hours },
    { icon: 'message-circle', label: 'WhatsApp', value: SITE.phone, sub: 'Share reports & queries' },
    { icon: 'map-pin', label: 'Clinic address', value: SITE.addressLine, sub: SITE.addressSub },
  ];
  const contactCards = contacts.map((c) =>
    `<div style="display:flex;align-items:center;gap:1rem;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-4) var(--space-5)">`
    + `<span style="flex:0 0 auto;display:inline-flex;width:46px;height:46px;border-radius:50%;background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center">${icon(c.icon, { size: 20 })}</span>`
    + `<div><span style="font-family:var(--font-sans);font-size:var(--fs-xs);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted)">${c.label}</span>`
    + `<strong style="display:block;font-size:var(--fs-lg);color:var(--text-strong)">${c.value}</strong>`
    + `<span style="font-size:var(--fs-sm);color:var(--text-muted)">${c.sub}</span></div></div>`
  ).join('');
  return `<section id="contact" style="padding-block:var(--section-pad-y);background:var(--surface-subtle)">`
    + `<div class="riims-container">`
    + sectionHead({ eyebrow: `${icon('map-pin', { size: 15 })} Visit or reach us`, title: 'Book an appointment', intro: 'Send your details and our care team will get back to you. Reports can be shared securely.' })
    + `<div class="contact-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-8);align-items:start">`
    + card(appointmentForm(), { pad: 'xl', accent: true, style: { boxShadow: 'var(--shadow-lg)' } })
    + `<div style="display:flex;flex-direction:column;gap:var(--space-4)">`
    + `<div style="aspect-ratio:16 / 10;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border-default);background:repeating-linear-gradient(45deg,var(--surface-blue-soft),var(--surface-blue-soft) 14px,var(--surface-muted) 14px,var(--surface-muted) 28px);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-family:var(--font-sans);font-weight:600;gap:.5rem">${icon('map', { size: 22 })} Map — Baraut, Uttar Pradesh (embed location)</div>`
    + contactCards
    + `</div></div></div></section>`;
}
