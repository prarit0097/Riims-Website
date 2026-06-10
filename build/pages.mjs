/* RIIMS static-site generator — full page bodies (composed from sections).
   Ported from ui_kits/website pages.jsx. */

import { icon, button, badge, card, eyebrow, infoList, disclaimer } from './components.mjs';
import { pageHero, floatingContact } from './chrome.mjs';
import * as S from './sections.mjs';
import {
  SITE, CONDITIONS, DOCTORS_FULL, POSTS, POPULAR_TOPICS,
} from './data.mjs';

/* ---------- Home ---------- */
export function homePage(base) {
  return S.searchBanner()
    + S.healthReels(base)
    + S.problemsSection(base)
    + S.statsStrip()
    + S.completeCare()
    + S.whyRiims()
    + S.howItWorks()
    + S.meetExperts(base)
    + S.educationSection(base)
    + S.testimonials()
    + S.faqSection()
    + S.ctaBand()
    + S.contactSection()
    + floatingContact();
}

/* ---------- Condition (per-slug) ---------- */
export function conditionPage(base, slug) {
  const c = CONDITIONS[slug] || CONDITIONS['high-creatinine'];
  const half = Math.ceil(c.symptoms.length / 2);
  const related = c.related.map(([l, target]) => {
    const href = target.startsWith('blog') ? `${base}blog.html` : `${base}conditions/${target}.html`;
    return `<li><a href="${href}" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('arrow-right', { size: 15 })} ${l}</a></li>`;
  }).join('');

  const main = `<div style="display:flex;flex-direction:column;gap:var(--space-8)">`
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">${c.aboutTitle}</h2><p style="color:var(--text-body)">${c.about}</p></div>`
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">Symptoms to watch for</h2>`
    + `<div class="g2" style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem 2rem">`
    + infoList(c.symptoms.slice(0, half), { icon: 'dot', color: 'var(--icon-brand)' })
    + infoList(c.symptoms.slice(half), { icon: 'dot', color: 'var(--icon-brand)' })
    + `</div></div>`
    + card(
      `<h3 style="font-size:var(--fs-xl);margin:0 0 .8rem;display:flex;align-items:center;gap:.5rem">${icon('route', { size: 20, style: 'color:var(--icon-brand)' })} How RIIMS approaches it</h3>`
      + infoList(c.approach),
      { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } })
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">When to consult a kidney doctor</h2><p style="color:var(--text-body)">${c.when}</p></div>`
    + disclaimer()
    + `</div>`;

  const aside = `<aside style="position:sticky;top:120px;display:flex;flex-direction:column;gap:var(--space-5)">`
    + card(
      `<h3 style="font-size:var(--fs-xl);margin:0 0 .3rem">Get your reports reviewed</h3>`
      + `<p style="margin:0 0 1rem;color:var(--text-muted);font-size:var(--fs-sm)">Share your kidney reports for a doctor-guided opinion.</p>`
      + `<div style="display:flex;flex-direction:column;gap:.6rem">`
      + button('Book Consultation', { variant: 'primary', fullWidth: true, iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
      + button('WhatsApp Now', { variant: 'whatsapp', fullWidth: true, iconLeft: icon('message-circle', { size: 18 }), href: SITE.whatsapp })
      + button('Call Now', { variant: 'outline', fullWidth: true, iconLeft: icon('phone', { size: 18 }), href: `tel:${SITE.phoneTel}` })
      + `</div>`,
      { accent: true, pad: 'lg', style: { boxShadow: 'var(--shadow-lg)' } })
    + card(
      `<h4 style="font-family:var(--font-sans);margin:0 0 .7rem;font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-brand)">Related topics</h4>`
      + `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem">${related}</ul>`,
      { tone: 'blue', pad: 'lg' })
    + `</aside>`;

  return pageHero(base, { crumb: c.crumb, icon: c.icon, title: c.title, intro: c.intro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container condition-grid" style="display:grid;grid-template-columns:1.4fr .9fr;gap:var(--space-12);align-items:start">`
    + main + aside + `</div></section>`
    + S.ctaBand();
}

/* ---------- About ---------- */
export function aboutPage(base) {
  const values = [
    { icon: 'shield-check', t: 'Ethical first', d: 'No false cure claims. We say what is and isn’t possible, honestly.' },
    { icon: 'git-merge', t: 'Truly integrated', d: 'Nephrology-led care supported by safe lifestyle and diet guidance.' },
    { icon: 'heart-handshake', t: 'Patient-centred', d: 'Plain-language guidance in Hindi, Hinglish and English.' },
  ];
  const valueCards = values.map((v) =>
    card(
      `<span style="display:inline-flex;width:48px;height:48px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center;margin-bottom:.7rem">${icon(v.icon, { size: 22 })}</span>`
      + `<h3 style="font-size:var(--fs-lg);margin:0 0 .3rem">${v.t}</h3>`
      + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${v.d}</p>`,
      { pad: 'lg', hover: true })
  ).join('');

  return pageHero(base, { crumb: 'About RIIMS', icon: 'building-2', title: 'About RIIMS', intro: 'Rashtriya Institute of Integrated Medical Sciences is a kidney-focused institute for ethical, evidence-aware, report-based care.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container about-grid" style="display:grid;grid-template-columns:1.2fr .8fr;gap:var(--space-12);align-items:center">`
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .8rem">Kidney care that respects your intelligence</h2>`
    + `<p style="color:var(--text-body)">RIIMS focuses on early diagnosis, doctor consultation, personalized care plans and clear patient education. We combine evidence-aware medical guidance with Ayurveda-supported lifestyle care — always alongside, never instead of, proper medical treatment.</p>`
    + `<p style="color:var(--text-body)">Every plan starts from your actual reports. We believe hopeful care and honesty belong together.</p>`
    + `<div style="margin-top:1.4rem">${button('Book a consultation', { variant: 'primary', size: 'lg', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })}</div></div>`
    + `<div class="img-cover img-hospital" role="img" aria-label="RIIMS institute building, Baraut" style="aspect-ratio:4 / 5;border-radius:var(--radius-xl);overflow:hidden;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg)"></div>`
    + `</div>`
    + `<div class="riims-container" style="margin-top:var(--space-16)">`
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${valueCards}</div>`
    + `</div></section>`
    + S.doctorsSection(base)
    + S.ctaBand();
}

/* ---------- Doctors ---------- */
export function doctorsPage(base) {
  return pageHero(base, { crumb: 'Doctors', icon: 'stethoscope', title: 'Our doctors & care team', intro: 'A kidney-focused team combining nephrology with safe, evidence-aware lifestyle support.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container"><div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">`
    + DOCTORS_FULL.map((d) => S.doctorCard(base, d)).join('')
    + `</div></div></section>`
    + S.ctaBand();
}

/* ---------- Blog ---------- */
function featuredPost(base, p) {
  const g = { blue: 'linear-gradient(135deg,var(--surface-blue-soft),var(--surface-green-soft))', green: 'linear-gradient(135deg,var(--surface-green-soft),var(--cream-100))', cream: 'linear-gradient(135deg,var(--surface-cream-deep),var(--surface-blue-soft))' }[p.tone];
  const cover = p.img
    ? `<div class="img-cover" role="img" aria-label="${p.title}" style="min-height:260px;background-image:url('${base}${p.img}')"></div>`
    : `<div style="min-height:260px;background:${g};display:flex;align-items:center;justify-content:center">${icon('image', { size: 40, style: 'color:var(--teal-300)' })}</div>`;
  return `<a href="${base}blog/${p.slug}.html" data-featured class="about-grid riims-card riims-card--hover" style="display:grid;grid-template-columns:1.05fr 1fr;gap:0;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);box-shadow:var(--shadow-md);overflow:hidden;text-decoration:none;color:inherit;margin-bottom:var(--space-8)">`
    + cover
    + `<div style="padding:clamp(1.4rem, 1rem + 2vw, 2.4rem);display:flex;flex-direction:column;gap:.7rem;justify-content:center">`
    + `<span style="display:inline-flex;align-items:center;gap:.5rem">${badge('Featured', { tone: 'green' })}<span style="font-family:var(--font-sans);font-size:var(--fs-xs);font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-accent)">${p.cat}</span></span>`
    + `<h2 style="font-size:var(--fs-2xl);margin:0">${p.title}</h2>`
    + `<p style="margin:0;color:var(--text-muted)">${p.excerpt}</p>`
    + `<span style="display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap;color:var(--text-faint);font-size:var(--fs-sm);font-family:var(--font-sans)"><span style="color:var(--text-muted);font-weight:600">${p.author}</span><span style="display:inline-flex;align-items:center;gap:.35rem">${icon('clock', { size: 14 })} ${p.date} · ${p.time}</span></span>`
    + `<span style="margin-top:.3rem;display:inline-flex;align-items:center;gap:.4rem;color:var(--text-link);font-weight:700;font-family:var(--font-sans)">Read article ${icon('arrow-right', { size: 16 })}</span>`
    + `</div></a>`;
}

export function blogPage(base) {
  const cats = ['All', ...Array.from(new Set(POSTS.map((p) => p.cat)))];
  const filterBtns = cats.map((c, i) => {
    const on = i === 0;
    return `<button type="button" data-blog-cat="${c}" class="blog-filter${on ? ' is-active' : ''}" style="font-family:var(--font-sans);font-weight:700;font-size:var(--fs-sm);cursor:pointer;padding:.5rem 1rem;border-radius:var(--radius-pill);border:1.5px solid ${on ? 'var(--brand-primary)' : 'var(--border-default)'};background:${on ? 'var(--brand-primary)' : 'var(--white)'};color:${on ? '#fff' : 'var(--text-body)'};transition:all var(--dur-fast)">${c}</button>`;
  }).join('');

  // Grid contains ALL posts; first card duplicates the featured (hidden under "All").
  const cards = POSTS.map((p, i) =>
    `<div data-blog-card data-cat="${p.cat}"${i === 0 ? ' data-first' : ''}>${S.blogCard(base, p)}</div>`
  ).join('');

  const topics = POPULAR_TOPICS.map((t) =>
    `<span style="font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:600;color:var(--text-brand);background:var(--surface-blue-soft);border:1px solid var(--border-brand);padding:.5rem .9rem;border-radius:var(--radius-pill)">${t}</span>`
  ).join('');

  const newsletter = `<div style="margin-top:var(--space-12);border-radius:var(--radius-xl);background:var(--surface-cream);border:1px solid var(--cream-200);padding:clamp(1.6rem,1.2rem + 2vw,2.6rem);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-6)">`
    + `<div style="max-width:42ch"><h2 style="font-size:var(--fs-2xl);margin:0 0 .4rem">Kidney health tips, simply explained</h2><p style="margin:0;color:var(--text-muted)">Get our doctor-reviewed kidney diet and lifestyle guides. No spam, no scary promises — unsubscribe anytime.</p></div>`
    + `<form data-newsletter style="display:flex;gap:.6rem;flex:1 1 280px;max-width:420px">`
    + `<input type="email" required placeholder="Your email" class="riims-input" style="flex:1;font-family:var(--font-sans);font-size:var(--fs-md);background:var(--white);border:1.5px solid var(--border-default);border-radius:var(--radius-md);padding:.72rem .95rem;min-height:48px;outline:none">`
    + button('Subscribe', { variant: 'primary', type: 'submit', iconRight: icon('arrow-right', { size: 16 }) })
    + `</form>`
    + `<span data-newsletter-done hidden style="display:inline-flex;align-items:center;gap:.5rem;color:var(--text-accent);font-weight:700;font-family:var(--font-sans)">${icon('check', { size: 20 })} Subscribed — thank you!</span>`
    + `</div>`;

  return pageHero(base, { crumb: 'Blog', icon: 'book-open', title: 'Kidney Health Blog & Patient Education', intro: 'Honest, doctor-aligned articles on high creatinine, CKD, dialysis guidance, kidney diet and Ayurveda-supported integrated care — written in plain language for patients and families across India.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container">`
    + `<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:var(--space-8)">${filterBtns}</div>`
    + featuredPost(base, POSTS[0])
    + `<div class="blog-grid" data-blog-grid style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${cards}</div>`
    + `<div style="margin-top:var(--space-16)">${eyebrow(`${icon('search', { size: 15 })} Popular kidney & Ayurveda topics`)}<h2 style="font-size:var(--fs-2xl);margin:0 0 1rem">What patients across India search for</h2><div style="display:flex;flex-wrap:wrap;gap:.6rem">${topics}</div></div>`
    + newsletter
    + `</div></section>`
    + S.ctaBand();
}

/* ---------- Contact ---------- */
export function contactPage(base) {
  return pageHero(base, { crumb: 'Contact / Book Appointment', icon: 'calendar-check', title: 'Book an appointment', intro: 'Send your details and our care team will reach out. Reports can be shared securely.' })
    + S.contactSection()
    + S.faqSection();
}

/* ---------- Blog article (one page per post) ---------- */

/* Markdown-lite for admin-written bodies: blank-line paragraphs, "## " => h2. */
function renderBody(body) {
  return String(body).split(/\n\s*\n/).map((block) => {
    const t = block.trim();
    if (!t) return '';
    if (t.startsWith('## ')) return `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">${t.slice(3)}</h2>`;
    return `<p style="color:var(--text-body)">${t.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

export function blogPostPage(base, p) {
  const rc = p.related ? CONDITIONS[p.related] : null;
  const related = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const half = rc ? Math.ceil(rc.symptoms.length / 2) : 0;
  const hasCustomBody = p.body && p.body.trim().length > 0;

  let depth = '';
  if (hasCustomBody) {
    depth = renderBody(p.body);
  } else if (rc) {
    depth = `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">${rc.aboutTitle}</h2><p style="color:var(--text-body)">${rc.about}</p>`
      + `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">Signs to discuss with your doctor</h2>`
      + `<div class="g2" style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem 2rem">`
      + infoList(rc.symptoms.slice(0, half), { icon: 'dot', color: 'var(--icon-brand)' })
      + infoList(rc.symptoms.slice(half), { icon: 'dot', color: 'var(--icon-brand)' })
      + `</div>`
      + card(
        `<h3 style="font-size:var(--fs-xl);margin:0 0 .8rem;display:flex;align-items:center;gap:.5rem">${icon('route', { size: 20, style: 'color:var(--icon-brand)' })} How RIIMS approaches it</h3>`
        + infoList(rc.approach),
        { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)', marginTop: 'var(--space-6)' } })
      + `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">When to consult a kidney doctor</h2><p style="color:var(--text-body)">${rc.when}</p>`;
  }

  const cta = card(
    `<h3 style="font-size:var(--fs-xl);margin:0 0 .3rem">Talk to a kidney care expert</h3>`
    + `<p style="margin:0 0 1rem;color:var(--text-muted);font-size:var(--fs-sm)">Share your reports for doctor-guided, evidence-aware guidance — no false promises.</p>`
    + `<div style="display:flex;flex-wrap:wrap;gap:.6rem">`
    + button('Book Consultation', { variant: 'primary', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
    + button('WhatsApp Now', { variant: 'whatsapp', iconLeft: icon('message-circle', { size: 18 }), href: SITE.whatsapp })
    + (rc ? button('Full condition guide', { variant: 'outline', iconRight: icon('arrow-right', { size: 16 }), href: `${base}conditions/${p.related}.html` }) : '')
    + `</div>`,
    { accent: true, pad: 'lg', style: { boxShadow: 'var(--shadow-md)', margin: 'var(--space-10) 0' } });

  const article = `<article style="max-width:760px;margin:0 auto">`
    + `<span style="display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap;color:var(--text-faint);font-size:var(--fs-sm);font-family:var(--font-sans);margin-bottom:var(--space-5)">`
    + `<span style="color:var(--text-muted);font-weight:600">${p.author}</span>`
    + `<span style="display:inline-flex;align-items:center;gap:.35rem">${icon('clock', { size: 14 })} ${p.date} · ${p.time}</span></span>`
    + `<p class="riims-lead" style="margin:0 0 1rem">${p.excerpt}</p>`
    + `<p style="color:var(--text-body)">This guide is written for patients and families in plain language. It explains the essentials, what to watch for, and how RIIMS supports you with ethical, report-based, doctor-led care — always alongside, never instead of, your treating doctor.</p>`
    + depth
    + disclaimer()
    + cta
    + `<h2 style="font-size:var(--fs-2xl);margin:0 0 var(--space-5)">Related reading</h2>`
    + `<div class="blog-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">`
    + related.map((x) => S.blogCard(base, x)).join('')
    + `</div></article>`;

  return pageHero(base, { crumb: `Blog · ${p.cat}`, icon: 'book-open', title: p.title, intro: p.excerpt })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container">${article}</div></section>`
    + S.ctaBand();
}

/* ---------- Legal / disclaimer pages ---------- */
const LEGAL = {
  privacy: {
    title: 'Privacy Policy', crumb: 'Privacy Policy', icon: 'shield-check',
    intro: 'How RIIMS handles the information you share with us.',
    sections: [
      ['What we collect', 'When you submit the appointment form, call, or message us on WhatsApp, we may collect your name, phone number, city, health concern and any reports you choose to share. We only collect what is needed to respond to your query and guide your care.'],
      ['How we use it', 'Your information is used solely to contact you, review your reports, and provide doctor-guided guidance. We do not sell your data or share it with advertisers. Reports are handled confidentially by our care team.'],
      ['Data security', 'We take reasonable steps to protect the information you share. Please avoid sending sensitive information over unsecured channels where possible; you can share reports securely with our team on request.'],
      ['Your choices', 'You may ask us to update or delete your details at any time by calling or messaging us on +91 85120 40000. Submitting the form means you agree to be contacted by RIIMS about your query.'],
      ['Contact', 'For any privacy question, contact RIIMS, Near Baraut Medicity Hospital, Kotana Rd, Baraut, Uttar Pradesh 250611, or call +91 85120 40000.'],
    ],
  },
  terms: {
    title: 'Terms of Use', crumb: 'Terms of Use', icon: 'file-text',
    intro: 'The terms that apply when you use the RIIMS website.',
    sections: [
      ['Educational information only', 'The content on this website is for awareness and patient education. It is not medical advice and does not create a doctor–patient relationship. Always consult a qualified doctor for diagnosis and treatment.'],
      ['No guarantees', 'RIIMS does not promise guaranteed cure or recovery, and never claims that dialysis can be stopped permanently. Outcomes depend on each patient’s reports, condition and doctor evaluation.'],
      ['Use of the site', 'You agree to use this website lawfully and not to misuse the forms, contact channels or content. Information may be updated or changed at any time without notice.'],
      ['External links', 'This site may link to third-party services (such as WhatsApp, Facebook, Instagram and maps). RIIMS is not responsible for the content or practices of those external services.'],
      ['Contact', 'Questions about these terms? Call +91 85120 40000 or visit RIIMS, Baraut, Uttar Pradesh 250611.'],
    ],
  },
  disclaimer: {
    title: 'Medical Disclaimer', crumb: 'Medical Disclaimer', icon: 'info',
    intro: 'Please read this important note about the information on this site.',
    sections: [
      ['For awareness only', 'Information on this site is for awareness only and does not replace medical consultation. Treatment depends on doctor evaluation and patient reports. Never delay seeking medical advice because of something you read here.'],
      ['No false claims', 'RIIMS provides ethical, evidence-aware, integrated kidney care. We do not make claims of “100% cure”, “guaranteed kidney recovery”, or “permanently stopping dialysis”. Ayurveda-supported lifestyle care is offered alongside, and in coordination with, medical treatment — never as a replacement for it.'],
      ['Individual results vary', 'Patient stories and examples reflect individual experiences. Results vary from person to person and depend on the underlying cause, stage, and doctor-led care plan.'],
      ['Not an emergency service', 'This website and its contact channels are not for medical emergencies. If you have a medical emergency, contact your nearest hospital immediately.'],
    ],
  },
};

/* ---------- 404 (served with absolute /base so it works at any depth) ---------- */
export function notFoundPage(base) {
  return pageHero(base, { crumb: 'Page not found', icon: 'compass', title: 'Page not found (404)', intro: 'The page you were looking for could not be found. It may have moved. Try one of these instead — or reach our care team directly.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container" style="max-width:820px">`
    + `<div style="display:flex;flex-wrap:wrap;gap:.7rem;margin-bottom:var(--space-8)">`
    + button('Go to homepage', { variant: 'primary', href: `${base}index.html`, iconLeft: icon('home', { size: 18 }) })
    + button('Kidney conditions', { variant: 'outline', href: `${base}conditions/high-creatinine.html`, iconLeft: icon('activity', { size: 18 }) })
    + button('Book Consultation', { variant: 'secondary', extraAttrs: { 'data-book': true }, iconLeft: icon('calendar-check', { size: 18 }) })
    + button('WhatsApp Now', { variant: 'whatsapp', href: SITE.whatsapp, iconLeft: icon('message-circle', { size: 18 }) })
    + `</div>`
    + `<h2 style="font-size:var(--fs-xl);margin:0 0 var(--space-4)">Popular pages</h2>`
    + `<ul style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.6rem">`
    + [['High Creatinine', 'conditions/high-creatinine.html'], ['CKD', 'conditions/ckd.html'], ['Dialysis Guidance', 'conditions/dialysis.html'], ['Kidney Diet & Blog', 'blog.html'], ['Our Doctors', 'doctors.html'], ['Contact / Book', 'contact.html']]
      .map(([l, h]) => `<li><a href="${base}${h}" style="display:inline-flex;align-items:center;gap:.5rem;color:var(--text-link);font-weight:600;text-decoration:none">${icon('arrow-right', { size: 15 })} ${l}</a></li>`).join('')
    + `</ul></div></section>`;
}

export function legalPage(base, key) {
  const L = LEGAL[key];
  const body = L.sections.map((s) =>
    `<h2 style="font-size:var(--fs-xl);margin:var(--space-6) 0 .5rem">${s[0]}</h2><p style="color:var(--text-body)">${s[1]}</p>`
  ).join('');
  return pageHero(base, { crumb: L.crumb, icon: L.icon, title: L.title, intro: L.intro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container" style="max-width:820px">${body}`
    + `<div style="margin-top:var(--space-8)">${disclaimer()}</div>`
    + `</div></section>`;
}
export const LEGAL_KEYS = Object.keys(LEGAL);
