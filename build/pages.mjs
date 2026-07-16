/* RIIMS static-site generator — full page bodies (composed from sections).
   Ported from ui_kits/website pages.jsx. */

import { icon, button, badge, card, eyebrow, infoList, disclaimer, esc } from './components.mjs';
import { pageHero, floatingContact } from './chrome.mjs';
import * as S from './sections.mjs';
import {
  SITE, CONDITIONS, DOCTORS_FULL, POSTS, POPULAR_TOPICS, SERVICES, REVIEW_DATE, PROTOCOL,
  ABOUT_ADMIN, LEGAL_ADMIN, CATEGORIES, CONDITION_SETS,
} from './data.mjs';
import { GUIDES, GUIDE_ORDER, CONDITION_GUIDES } from './guides.mjs';

/* A disease-category card (Treatments page — one per CATEGORIES entry). Kidney
   links to its existing flat hub (conditions/index.html); the others to their
   nested hub (conditions/<dir>/index.html). */
function categoryCard(base, C) {
  const href = `${base}conditions/${C.dir ? `${C.dir}/` : ''}index.html`;
  return `<a href="${href}" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-6);display:flex;flex-direction:column;gap:.5rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:52px;height:52px;border-radius:var(--radius-md);background:var(--surface-blue-soft);color:var(--icon-brand);align-items:center;justify-content:center">${icon(C.icon, { size: 24 })}</span>`
    + `<h2 style="font-size:var(--fs-xl);margin:.2rem 0 0;font-family:var(--font-display)">${C.label}</h2>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${C.blurb}</p></a>`;
}

/* A guide card (used on the home Patient Guides section and the guides hub). */
function guideCard(base, k) {
  const g = GUIDES[k];
  return `<a href="${base}${k}.html" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:46px;height:46px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center">${icon(g.icon, { size: 22 })}</span>`
    + `<h3 style="font-size:var(--fs-lg);margin:.1rem 0 0;font-family:var(--font-display)">${g.title}</h3>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${g.blurb}</p>`
    + `<span style="margin-top:.2rem;display:inline-flex;align-items:center;gap:.4rem;color:var(--text-link);font-weight:700;font-family:var(--font-sans);font-size:var(--fs-sm)">Read guide ${icon('arrow-right', { size: 15 })}</span></a>`;
}

function guidesHomeSection(base) {
  return `<section style="padding-block:var(--section-pad-y);background:var(--white)"><div class="riims-container">`
    + eyebrow('Patient Guides')
    + `<h2 style="font-size:var(--fs-2xl);margin:.3rem 0 .4rem">Understand your kidneys, one clear step at a time</h2>`
    + `<p style="max-width:62ch;color:var(--text-muted);margin:0 0 var(--space-6)">Plain-language guides from our clinical team, grounded in Dr. Abhishek Gupta's book <em>Kidney Kavach</em> — learn what your reports mean, what to eat, and what to do next.</p>`
    + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-4)">${GUIDE_ORDER.map((k) => guideCard(base, k)).join('')}</div>`
    + `<div style="margin-top:var(--space-6)">${button('See all patient guides', { variant: 'outline', href: `${base}guides.html`, iconRight: icon('arrow-right', { size: 16 }) })}</div>`
    + `</div></section>`;
}

/* ---------- Home ---------- */
export function homePage(base) {
  return S.searchBanner(base)
    + S.healthReels(base)
    + S.problemsSection(base)
    + S.statsStrip()
    + S.completeCare()
    + S.whyRiims()
    + S.howItWorks()
    + S.meetExperts(base)
    + S.educationSection(base)
    + guidesHomeSection(base)
    + S.testimonials(base)
    + S.faqSection()
    + S.ctaBand()
    + S.contactSection()
    + floatingContact();
}

/* Emergency red-flag box. Rendered only when a condition defines `redFlags`.
   This is the highest-stakes block on the site — on heart and liver pages it is
   what tells a patient to go to hospital instead of booking an OPD slot. */
function redFlagBox(rf) {
  if (!rf || !Array.isArray(rf.emergency) || !rf.emergency.length) return '';
  const li = (items, color) => items.map((t) =>
    `<li style="display:flex;gap:.5rem;align-items:flex-start;margin:0 0 .35rem"><span style="flex:0 0 auto;margin-top:.35rem;width:6px;height:6px;border-radius:50%;background:${color}"></span><span>${t}</span></li>`).join('');
  const soon = (Array.isArray(rf.soon) && rf.soon.length)
    ? `<p style="margin:.9rem 0 .35rem;font-family:var(--font-sans);font-weight:700;font-size:var(--fs-sm);color:var(--text-body)">See a doctor soon (not an emergency)</p>`
      + `<ul style="list-style:none;margin:0;padding:0;color:var(--text-body);font-size:var(--fs-sm)">${li(rf.soon, 'var(--text-faint)')}</ul>`
    : '';
  return `<div class="riims-redflags">`
    + `<h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .6rem;font-size:var(--fs-lg);color:var(--danger)">${icon('triangle-alert', { size: 20 })} Go to hospital now</h3>`
    + `<ul style="list-style:none;margin:0;padding:0;color:var(--text-body);font-size:var(--fs-sm)">${li(rf.emergency, 'var(--danger)')}</ul>`
    + soon
    + `</div>`;
}

/* Citations. Serve E-E-A-T and the s.14(b) "bona fide scientific standpoint"
   argument (spec §3.2) — both need the sources to be real and visible. */
function sourcesBlock(sources) {
  if (!Array.isArray(sources) || !sources.length) return '';
  const items = sources.map(([label, url]) =>
    `<li style="margin:0 0 .3rem"><a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--text-link);text-decoration:none;font-size:var(--fs-sm)">${esc(label)}</a></li>`).join('');
  return `<div class="riims-sources"><h4 style="font-family:var(--font-sans);margin:0 0 .5rem;font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-brand)">Sources</h4>`
    + `<ul style="list-style:none;margin:0;padding:0">${items}</ul></div>`;
}

/* ---------- Condition (per-slug) ---------- */
export function conditionPage(base, slug, cat = 'kidney') {
  const set = CONDITION_SETS[cat] || CONDITIONS;
  const c = set[slug] || CONDITIONS['high-creatinine'];
  const dir = (CATEGORIES[cat] && CATEGORIES[cat].dir) ? `${CATEGORIES[cat].dir}/` : '';
  const half = Math.ceil(c.symptoms.length / 2);
  // Cross-link the blog articles written for this condition (topical authority).
  const blogLinks = POSTS.filter((p) => p.related === slug).map((p) =>
    `<li><a href="${base}blog/${p.slug}.html" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('book-open', { size: 15 })} ${p.title}</a></li>`
  ).join('');
  const related = c.related.map(([l, target]) => {
    const href = target.startsWith('blog') ? `${base}blog.html` : `${base}conditions/${dir}${target}.html`;
    return `<li><a href="${href}" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('arrow-right', { size: 15 })} ${l}</a></li>`;
  }).join('') + blogLinks;

  const reviewedLine = `<p style="margin:0;font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-muted);display:flex;align-items:center;gap:.45rem">${icon('badge-check', { size: 16, style: 'color:var(--icon-accent)' })} Medically reviewed by the RIIMS nephrology team · Last updated: ${REVIEW_DATE}</p>`;

  const whenHeading = cat === 'kidney' ? 'When to consult a kidney doctor' : 'When to consult a doctor';

  const main = `<div style="display:flex;flex-direction:column;gap:var(--space-8)">`
    + reviewedLine
    + redFlagBox(c.redFlags)
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
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">${whenHeading}</h2><p style="color:var(--text-body)">${c.when}</p></div>`
    + sourcesBlock(c.sources)
    + disclaimer()
    + `</div>`;

  const aside = `<aside style="position:sticky;top:128px;display:flex;flex-direction:column;gap:var(--space-5)">`
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
    + ((CONDITION_GUIDES[slug] || []).filter((k) => GUIDES[k]).length ? card(
      `<h4 style="font-family:var(--font-sans);margin:0 0 .7rem;font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-brand)">Helpful guides</h4>`
      + `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem">`
      + (CONDITION_GUIDES[slug] || []).filter((k) => GUIDES[k]).map((k) => `<li><a href="${base}${k}.html" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon(GUIDES[k].icon, { size: 15 })} ${GUIDES[k].title}</a></li>`).join('')
      + `</ul>`,
      { tone: 'cream', pad: 'lg' }) : '')
    + `</aside>`;

  return pageHero(base, { crumb: c.crumb, icon: c.icon, title: c.title, intro: c.intro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container condition-grid" style="display:grid;grid-template-columns:1.4fr .9fr;gap:var(--space-12);align-items:start">`
    + main + aside + `</div></section>`
    + S.ctaBand();
}

/* ---------- About ---------- */
/* Default About-page content (Admin → About can override any field). */
export const DEFAULT_ABOUT = {
  hero: { title: 'About RIIMS', intro: 'Rashtriya Institute of Integrated Medical Sciences is a kidney-focused institute for ethical, doctor-led, report-based and integrated kidney care.' },
  storyHeading: 'Kidney care built on reports, not guesswork',
  story: [
    'RIIMS is a doctor-led, report-based institute founded on a simple belief: kidney disease is rarely sudden, and the people living with it deserve honest information, calm guidance and a plan made for them. Every plan begins with your actual reports — creatinine, eGFR and your wider health picture — read alongside your history and daily life. We don’t compare one patient to another, because two people with the same creatinine can have very different causes and needs.',
    'Our approach is integrated. We bring together the useful strengths of modern medical science and Ayurveda, working alongside your medical treatment rather than in place of it. This is the thinking behind our care backbone, the <strong>DNA Kayakalp Protocol™</strong> — a structured framework combining scientific understanding, nutrition, lifestyle and Ayurveda to support kidney health responsibly.',
    'We also believe medicine alone is not enough — diet, routine, mental well-being, family support and regular follow-up matter too. Above all we stay honest: no false promises and no shortcuts, just the right information, discipline and steady medical guidance. Kidney disease can be serious, but with the right care and a positive outlook, many people live fuller, better-quality lives.',
  ],
  imageAlt: 'RIIMS institute building, Baraut',
  ckdNote: '<strong>Roughly 1 in 6–7 people in India</strong> may be affected by Chronic Kidney Disease (CKD) at some stage — a general awareness estimate from published studies, not a RIIMS performance measure. CKD is often called a “silent disease” because it can progress with few early symptoms, which is why timely testing and regular check-ups matter.',
  values: [
    { icon: 'file-check-2', t: 'Report-based care', d: 'Every plan starts from your actual reports and full picture — never guesswork.' },
    { icon: 'git-merge', t: 'Truly integrated', d: 'Modern nephrology with safe Ayurveda-supported lifestyle care — alongside, never instead of, treatment.' },
    { icon: 'heart-handshake', t: 'Personalised & honest', d: 'Two people with the same creatinine can need different care. Plain-language guidance, no false promises.' },
  ],
};

export function aboutPage(base) {
  const A = { ...DEFAULT_ABOUT, ...ABOUT_ADMIN, hero: { ...DEFAULT_ABOUT.hero, ...(ABOUT_ADMIN.hero || {}) } };
  const story = (Array.isArray(A.story) && A.story.length) ? A.story : DEFAULT_ABOUT.story;
  const values = (Array.isArray(A.values) && A.values.length) ? A.values : DEFAULT_ABOUT.values;
  const valueCards = values.map((v) =>
    card(
      `<span style="display:inline-flex;width:48px;height:48px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center;margin-bottom:.7rem">${icon(v.icon || 'file-check-2', { size: 22 })}</span>`
      + `<h3 style="font-size:var(--fs-lg);margin:0 0 .3rem">${esc(v.t)}</h3>`
      + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">${esc(v.d)}</p>`,
      { pad: 'lg', hover: true })
  ).join('');

  return pageHero(base, { crumb: 'About RIIMS', icon: 'building-2', title: esc(A.hero.title), intro: esc(A.hero.intro) })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container about-grid" style="display:grid;grid-template-columns:1.2fr .8fr;gap:var(--space-12);align-items:center">`
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .8rem">${esc(A.storyHeading)}</h2>`
    + story.map((p) => `<p style="color:var(--text-body)">${p}</p>`).join('')
    + `<div style="margin-top:1.4rem">${button('Book a consultation', { variant: 'primary', size: 'lg', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })}</div></div>`
    + `<img src="${base}assets/hospital.webp" alt="${esc(A.imageAlt)}" loading="lazy" decoding="async" style="display:block;width:100%;aspect-ratio:4 / 5;object-fit:cover;border-radius:var(--radius-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg)">`
    + `</div>`
    + (A.ckdNote ? `<div class="riims-container" style="margin-top:var(--space-16)">`
      + card(`<p style="margin:0;color:var(--text-body)">${A.ckdNote}</p>`, { pad: 'lg', style: { boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--space-8)' } })
      + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${valueCards}</div></div>`
      : `<div class="riims-container" style="margin-top:var(--space-16)"><div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${valueCards}</div></div>`)
    + `</section>`
    + S.doctorsSection(base)
    + S.ctaBand();
}

/* ---------- Doctors ---------- */
/* ---------- Doctor / specialist landing pages (SEO) ----------
   Each page targets a "… specialist / kidney doctor" keyword and features RIIMS
   founder Dr. Abhishek Gupta. Copy stays honest and compliance-safe: he is an
   Ayurvedacharya (B.A.M.S.) kidney-care physician — never described as an MD/DM
   nephrologist — and RIIMS coordinates with nephrologists for medical/dialysis
   needs. No "best"/cure/guarantee claims. */
export const SPECIALIST_DOCTOR = {
  name: 'Dr. Abhishek Gupta',
  cred: 'B.A.M.S. · Ayurvedacharya',
  role: 'Founder & Senior Kidney-Care Physician, RIIMS',
  reg: 'DBCP A/7368',
  note: 'Creator of the DNA Kayakalp Protocol™ and author of the patient book <em>Kidney Kavach</em> — an integrated, report-based approach that brings modern medical understanding together with Ayurveda and lifestyle care. Always alongside your medical treatment, never instead of it.',
  init: 'AG',
};

export const SPECIALISTS = {
  'best-kidney-doctor-delhi-ncr': {
    icon: 'stethoscope', h1: 'Kidney Doctor in Delhi-NCR & Baraut',
    metaTitle: 'Kidney Doctor in Delhi-NCR & Baraut — Dr. Abhishek Gupta | RIIMS',
    crumb: 'Doctors · Kidney Doctor (Delhi-NCR)',
    intro: 'Looking for an experienced, ethical kidney doctor near Delhi-NCR? Dr. Abhishek Gupta leads integrated, report-based kidney care at RIIMS in Baraut — within the NCR region and easily reached from Delhi, Ghaziabad, Meerut and Baghpat.',
    lead: 'Kidney problems deserve calm, honest guidance — not fear or false promises. At RIIMS, Dr. Abhishek Gupta and the care team read your actual reports (creatinine, eGFR, urine protein and your wider health picture) before advising, and build a plan made for you. Care is integrated: modern medical understanding works alongside Ayurveda and lifestyle support, and we coordinate with nephrologists for medical or dialysis needs — never replacing them.',
    helps: [
      'High creatinine, CKD (all stages), kidney failure and dialysis guidance',
      'Protein in urine, kidney swelling, stones and urinary infections',
      'Diabetic and hypertensive kidney disease — protecting remaining function',
      'Personalised kidney diet (RiiMS Renal Plate) and lifestyle coaching',
      'Report-based Kidney Mapping and clear, jargon-free explanations',
    ],
    when: 'If you have a raised creatinine, falling eGFR, protein in urine, swelling, or diabetes/BP with abnormal kidney tests, an early kidney-care consultation gives you the most options. Video, phone or in-clinic visits are available.',
    related: [['High Creatinine', 'high-creatinine'], ['Chronic Kidney Disease', 'ckd'], ['Kidney Failure', 'kidney-failure'], ['Kidney Disease Treatment', 'kidney-disease-treatment']],
  },
  'high-creatinine-specialist': {
    icon: 'droplet', h1: 'High Creatinine Specialist',
    metaTitle: 'High Creatinine Specialist — Dr. Abhishek Gupta | RIIMS Baraut',
    crumb: 'Doctors · High Creatinine Specialist',
    intro: 'A raised creatinine is a signal to investigate calmly, not a diagnosis on its own. Dr. Abhishek Gupta helps you understand why it is high and what to do next — honestly, and without panic.',
    lead: 'Creatinine is a marker, not the disease. Dr. Abhishek Gupta reads it alongside eGFR, urine protein, potassium and your history, then looks for the real cause — dehydration, certain medicines, infection, diabetes or blood pressure. The goal is not to chase a single number, but to protect your kidney function with a personalised diet, lifestyle changes and treating the underlying cause.',
    helps: [
      'Root-cause review of a raised creatinine — reversible causes treated first',
      'Reading creatinine with eGFR, urine protein and your full history',
      'A personalised kidney diet (RiiMS Renal Plate) and nephrotoxin avoidance',
      'Coordinating blood-pressure and sugar control with your treating doctors',
      'Regular monitoring so any change is caught early',
    ],
    when: 'If creatinine stays high across repeat reports or eGFR is falling — or you have diabetes, BP or swelling — see a kidney-care doctor early. A sudden drop in urine, breathlessness or very high potassium needs prompt medical care.',
    related: [['High Creatinine', 'high-creatinine'], ['High Creatinine Without Dialysis', 'high-creatinine-without-dialysis'], ['CKD', 'ckd'], ['Protein in Urine', 'proteinuria']],
  },
  'kidney-failure-specialist': {
    icon: 'heart-pulse', h1: 'Kidney Failure Specialist',
    metaTitle: 'Kidney Failure Specialist — Dr. Abhishek Gupta | RIIMS Baraut',
    crumb: 'Doctors · Kidney Failure Specialist',
    intro: 'A kidney-failure diagnosis is frightening, but the right information changes everything. Dr. Abhishek Gupta helps you understand your stage and the realistic options — with honesty and support.',
    lead: 'Kidney failure means the kidneys are working at a very low level. Care depends on your stage, symptoms and reports. Dr. Abhishek Gupta and the RIIMS team focus on protecting remaining function, managing symptoms and quality of life, and preparing you for the right decisions — coordinating closely with nephrologists for dialysis or advanced medical care when needed. We stay honest: we never promise cure, or that dialysis can always be avoided or stopped.',
    helps: [
      'Understanding your stage and the realistic options, in plain language',
      'Protecting remaining kidney function and managing symptoms',
      'Personalised renal diet and fluid guidance for your stage',
      'Dialysis-preparation guidance, coordinated with your nephrologist',
      'Family support and steady, honest follow-up',
    ],
    when: 'Very low eGFR, breathlessness, severe swelling, drowsiness or a big fall in urine need urgent medical care. For ongoing kidney failure, early, coordinated care planning gives the best quality of life.',
    related: [['Kidney Failure', 'kidney-failure'], ['Dialysis Guidance', 'dialysis'], ['Stage 4 CKD', 'stage-4-ckd'], ['CKD', 'ckd']],
  },
  'kidney-stone-specialist': {
    icon: 'circle-dot', h1: 'Kidney Stone Specialist',
    metaTitle: 'Kidney Stone Specialist — Dr. Abhishek Gupta | RIIMS Baraut',
    crumb: 'Doctors · Kidney Stone Specialist',
    intro: 'Kidney stones cause severe pain and can come back. Dr. Abhishek Gupta helps with evaluation, safe treatment guidance and — importantly — preventing the next stone.',
    lead: 'Most stones are diagnosed with an ultrasound or CT and simple tests. Small stones often pass with fluids, pain control and medical support; larger stones or a blockage may need a urologist procedure (such as laser/RIRS), which RIIMS helps coordinate and refer for. Just as important is prevention — Dr. Abhishek Gupta reviews your diet, fluids and metabolic factors to lower the risk of recurrence.',
    helps: [
      'Evaluation of stone size, position and any obstruction',
      'Guidance on when a stone can pass vs when a procedure is needed',
      'Coordination and referral for laser/RIRS with a urologist',
      'Diet, fluid and metabolic review to help prevent new stones',
      'Care for linked urinary infections',
    ],
    when: 'Severe loin pain, fever with urinary symptoms, blood in urine, vomiting or reduced urine need prompt medical assessment. For recurrent stones, a prevention review is worthwhile.',
    related: [['Kidney Stone Treatment', 'kidney-stone-treatment'], ['Laser Kidney Stone Treatment', 'laser-kidney-stone-treatment'], ['UTI Treatment', 'uti-treatment']],
  },
  'uti-specialist': {
    icon: 'shield-check', h1: 'UTI Specialist',
    metaTitle: 'UTI Specialist — Urinary Infection Care | Dr. Abhishek Gupta, RIIMS',
    crumb: 'Doctors · UTI Specialist',
    intro: 'Burning urination and frequent infections are common — and treatable. Dr. Abhishek Gupta helps diagnose, treat and prevent urinary tract infections, and spot when they involve the kidneys.',
    lead: 'Most UTIs are straightforward, but repeated infections — or infection reaching the kidney (pyelonephritis) — need proper evaluation. Dr. Abhishek Gupta reviews your symptoms and reports (urine routine/culture), guides appropriate treatment, and looks for causes behind recurrent UTIs, such as stones, diabetes or incomplete bladder emptying, with prevention advice to break the cycle.',
    helps: [
      'Telling simple UTIs apart from recurrent or kidney-involving infection',
      'Report-based guidance (urine routine and culture)',
      'Finding causes of recurrent UTIs — stones, diabetes and more',
      'Prevention advice: hydration, hygiene and habits',
      'Coordination for any specialist treatment needed',
    ],
    when: 'Fever with back/flank pain, vomiting, blood in urine, or symptoms during pregnancy or diabetes need prompt medical care, as the infection may involve the kidney.',
    related: [['UTI Treatment', 'uti-treatment'], ['Kidney Stone Treatment', 'kidney-stone-treatment'], ['Kidney Swelling', 'kidney-swelling-treatment']],
  },
  'kidney-doctor-for-diabetic-patients': {
    icon: 'gauge', h1: 'Kidney Doctor for Diabetic Patients',
    metaTitle: 'Kidney Doctor for Diabetic Patients — Dr. Abhishek Gupta | RIIMS',
    crumb: 'Doctors · Kidney Doctor for Diabetic Patients',
    intro: 'Diabetes is a leading cause of kidney disease — but early, coordinated care can protect your kidneys. Dr. Abhishek Gupta helps diabetic patients screen for and slow diabetic kidney disease.',
    lead: 'In diabetes, high sugar can quietly damage the kidney\'s filters over years, often showing first as protein in the urine before creatinine rises. Dr. Abhishek Gupta focuses on early screening (urine albumin, eGFR), tight coordination of sugar and blood-pressure control with your treating doctors, and a practical diabetic-kidney diet — to protect remaining function. Care is honest and integrated, alongside your medical treatment.',
    helps: [
      'Early screening for diabetic kidney disease (urine albumin, eGFR)',
      'Coordinating sugar and blood-pressure control with your treating doctors',
      'A practical diet for diabetes + kidney (portion- and potassium-aware)',
      'Protecting remaining kidney function and slowing progression',
      'Clear monitoring so changes are caught early',
    ],
    when: 'If you have diabetes — especially for several years, or with protein in urine, swelling or a rising creatinine — get your kidneys screened. Early care offers the most protection.',
    related: [['Diabetic Kidney Disease', 'diabetic-kidney-disease'], ['Hypertensive Kidney Disease', 'hypertensive-kidney-disease'], ['High Creatinine', 'high-creatinine'], ['Protein in Urine', 'proteinuria']],
  },
};

function doctorFeature(base) {
  const D = SPECIALIST_DOCTOR;
  return card(
    `<div style="display:flex;gap:1rem;align-items:flex-start">`
    + `<span style="flex:0 0 auto;display:inline-flex;width:68px;height:68px;border-radius:50%;background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:1.5rem">${D.init}</span>`
    + `<div><h3 style="margin:0 0 .15rem;font-size:var(--fs-xl)">${D.name}</h3>`
    + `<div style="font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:700;color:var(--text-accent);text-transform:uppercase;letter-spacing:.04em">${D.cred}</div>`
    + `<div style="color:var(--text-muted);font-size:var(--fs-sm);margin-top:.15rem">${D.role}</div>`
    + (D.reg ? `<div style="margin-top:.3rem;display:inline-flex;align-items:center;gap:.35rem;color:var(--text-accent);font-family:var(--font-sans);font-size:var(--fs-xs);font-weight:700">${icon('badge-check', { size: 14 })} Reg. No.: ${D.reg}</div>` : '')
    + `</div></div>`
    + `<p style="margin:.9rem 0 0;color:var(--text-body);font-size:var(--fs-base)">${D.note}</p>`,
    { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } });
}

export function specialistPage(base, slug) {
  const sp = SPECIALISTS[slug] || SPECIALISTS['high-creatinine-specialist'];
  const reviewedLine = `<p style="margin:0;font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-muted);display:flex;align-items:center;gap:.45rem">${icon('badge-check', { size: 16, style: 'color:var(--icon-accent)' })} Medically reviewed by the RIIMS kidney-care team · Last updated: ${REVIEW_DATE}</p>`;
  const related = sp.related.map(([l, target]) =>
    `<li><a href="${base}conditions/${target}.html" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('arrow-right', { size: 15 })} ${l}</a></li>`).join('');

  const main = `<div style="display:flex;flex-direction:column;gap:var(--space-8)">`
    + reviewedLine
    + doctorFeature(base)
    + `<div><p style="color:var(--text-body);font-size:var(--fs-lg)">${sp.lead}</p></div>`
    + card(
      `<h3 style="font-size:var(--fs-xl);margin:0 0 .8rem;display:flex;align-items:center;gap:.5rem">${icon('route', { size: 20, style: 'color:var(--icon-brand)' })} How Dr. Abhishek &amp; the RIIMS team help</h3>`
      + infoList(sp.helps),
      { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } })
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">When to see a kidney doctor</h2><p style="color:var(--text-body)">${sp.when}</p></div>`
    + disclaimer()
    + `</div>`;

  const aside = `<aside style="position:sticky;top:128px;display:flex;flex-direction:column;gap:var(--space-5)">`
    + card(
      `<h3 style="font-size:var(--fs-xl);margin:0 0 .3rem">Consult ${SPECIALIST_DOCTOR.name}</h3>`
      + `<p style="margin:0 0 1rem;color:var(--text-muted);font-size:var(--fs-sm)">Share your kidney reports for a doctor-guided opinion — video, phone or in-clinic.</p>`
      + `<div style="display:flex;flex-direction:column;gap:.6rem">`
      + button('Book Consultation', { variant: 'primary', fullWidth: true, iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
      + button('WhatsApp Now', { variant: 'whatsapp', fullWidth: true, iconLeft: icon('message-circle', { size: 18 }), href: SITE.whatsapp })
      + button('Call Now', { variant: 'outline', fullWidth: true, iconLeft: icon('phone', { size: 18 }), href: `tel:${SITE.phoneTel}` })
      + `</div>`,
      { accent: true, pad: 'lg', style: { boxShadow: 'var(--shadow-lg)' } })
    + card(
      `<h4 style="font-family:var(--font-sans);margin:0 0 .7rem;font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-brand)">Related conditions</h4>`
      + `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem">${related}</ul>`,
      { tone: 'blue', pad: 'lg' })
    + `</aside>`;

  return pageHero(base, { crumb: sp.crumb, icon: sp.icon, title: sp.h1, intro: sp.intro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container condition-grid" style="display:grid;grid-template-columns:1.4fr .9fr;gap:var(--space-12);align-items:start">`
    + main + aside + `</div></section>`
    + S.ctaBand();
}

export function doctorsPage(base) {
  const specialistCards = Object.entries(SPECIALISTS).map(([slug, sp]) =>
    `<a href="${base}doctors/${slug}.html" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.4rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:44px;height:44px;border-radius:var(--radius-md);background:var(--surface-blue-soft);color:var(--icon-brand);align-items:center;justify-content:center">${icon(sp.icon, { size: 20 })}</span>`
    + `<h3 style="font-size:var(--fs-lg);margin:.2rem 0 0">${sp.h1}</h3>`
    + `<span style="margin-top:.1rem;display:inline-flex;align-items:center;gap:.4rem;color:var(--text-link);font-weight:700;font-family:var(--font-sans);font-size:var(--fs-sm)">Learn more ${icon('arrow-right', { size: 15 })}</span></a>`).join('');

  return pageHero(base, { crumb: 'Doctors', icon: 'stethoscope', title: 'Our doctors & care team', intro: 'A kidney-focused team led by Dr. Abhishek Gupta, combining integrated kidney care with safe, evidence-aware lifestyle support.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)">`
    + `<div class="riims-container"><div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">`
    + DOCTORS_FULL.map((d) => S.doctorCard(base, d)).join('')
    + `</div></div></section>`
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-subtle)"><div class="riims-container">`
    + eyebrow('Specialist kidney care')
    + `<h2 style="font-size:var(--fs-2xl);margin:.3rem 0 .3rem">Care for your specific concern</h2>`
    + `<p style="max-width:60ch;color:var(--text-muted);margin:0 0 var(--space-6)">Led by Dr. Abhishek Gupta — choose the area closest to your need.</p>`
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${specialistCards}</div>`
    + `</div></section>`
    + S.ctaBand();
}

/* ---------- Blog ---------- */
function featuredPost(base, p) {
  const g = { blue: 'linear-gradient(135deg,var(--surface-blue-soft),var(--surface-green-soft))', green: 'linear-gradient(135deg,var(--surface-green-soft),var(--cream-100))', cream: 'linear-gradient(135deg,var(--surface-cream-deep),var(--surface-blue-soft))' }[p.tone];
  const cover = p.img
    ? `<img class="img-cover" src="${base}${p.img}" alt="${esc(p.title)}" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;min-height:260px;object-fit:cover">`
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

/* Markdown-lite for admin-written / guide bodies:
   blank-line paragraphs; "## " => h2; "### " => h3; "- " block => <ul>; "1." block => <ol>;
   "> " block => blockquote; a GitHub-style "| a | b |" table (with a --- row) => <table>.
   Inline: **bold**, *italic*, `code`. */
function renderBody(body) {
  const inline = (s) => String(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" style="color:var(--text-link);font-weight:600">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  // Normalise: force every "## "/"### " heading onto its own block (blank lines around it),
  // so a heading directly followed by list/paragraph lines is not swallowed into the heading.
  const norm = String(body).replace(/\r\n/g, '\n').replace(/^(#{2,3} .+)$/gm, '\n$1\n');
  return norm.split(/\n\s*\n/).map((block) => {
    const t = block.trim();
    if (!t) return '';
    if (t.startsWith('### ')) return `<h3 style="font-size:var(--fs-lg);margin:var(--space-6) 0 .4rem">${inline(t.slice(4))}</h3>`;
    if (t.startsWith('## ')) return `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">${inline(t.slice(3))}</h2>`;
    const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => l.startsWith('>'))) {
      return `<blockquote style="margin:.6rem 0 1.1rem;padding:.7rem 1rem;border-left:3px solid var(--brand-primary);background:var(--surface-green-soft);border-radius:var(--radius-sm);color:var(--text-body)">`
        + lines.map((l) => inline(l.replace(/^>\s?/, ''))).join('<br>') + `</blockquote>`;
    }
    if (lines.length >= 2 && lines[0].includes('|') && /^\|?[\s:|-]+$/.test(lines[1]) && lines[1].includes('-')) {
      const cells = (row) => row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
      const head = cells(lines[0]);
      const rows = lines.slice(2).map(cells);
      const th = 'text-align:left;padding:.5rem .7rem;border-bottom:2px solid var(--border-default);font-family:var(--font-sans);font-size:var(--fs-sm)';
      const td = 'padding:.5rem .7rem;border-bottom:1px solid var(--border-subtle);color:var(--text-body);font-size:var(--fs-sm);vertical-align:top';
      return `<div style="overflow-x:auto;margin:.4rem 0 1.1rem"><table style="width:100%;border-collapse:collapse">`
        + `<thead><tr>${head.map((h) => `<th style="${th}">${inline(h)}</th>`).join('')}</tr></thead>`
        + `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="${td}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
        + `</table></div>`;
    }
    if (lines.length && lines.every((l) => l.startsWith('- '))) {
      return `<ul style="margin:.4rem 0 1rem;padding-left:1.3rem;color:var(--text-body);display:grid;gap:.35rem">`
        + lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('') + `</ul>`;
    }
    if (lines.length && lines.every((l) => /^\d+\.\s/.test(l))) {
      return `<ol style="margin:.4rem 0 1rem;padding-left:1.4rem;color:var(--text-body);display:grid;gap:.35rem">`
        + lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s/, ''))}</li>`).join('') + `</ol>`;
    }
    return `<p style="color:var(--text-body)">${inline(t.replace(/\n/g, '<br>'))}</p>`;
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

  // FAQ + Sources sections from the post data (added for depth, trust & rich results).
  const postFaqs = Array.isArray(p.faqs) ? p.faqs : [];
  const faqHtml = postFaqs.length
    ? `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">Frequently asked questions</h2>`
      + postFaqs.map(([q, a]) => `<div style="margin-bottom:var(--space-5)"><h3 style="font-size:var(--fs-lg);margin:0 0 .3rem">${q}</h3><p style="margin:0;color:var(--text-body)">${a}</p></div>`).join('')
    : '';
  const postRefs = Array.isArray(p.refs) ? p.refs : [];
  const refsHtml = postRefs.length
    ? `<h2 style="font-size:var(--fs-xl);margin:var(--space-8) 0 .4rem">Sources & further reading</h2>`
      + `<ul style="margin:.2rem 0 0;padding-left:1.2rem;color:var(--text-muted);font-size:var(--fs-sm);display:grid;gap:.3rem">`
      + postRefs.map((r) => `<li>${r}</li>`).join('') + `</ul>`
      + `<p style="margin:.6rem 0 0;color:var(--text-faint);font-size:var(--fs-xs)">Reference and guideline names are listed for transparency; RIIMS is not affiliated with or endorsed by these organisations.</p>`
    : '';
  // Topic-specific related reading (falls back to recent posts if fewer than 3).
  const relatedList = [];
  for (const s of (Array.isArray(p.relatedPosts) ? p.relatedPosts : [])) {
    const m = POSTS.find((x) => x.slug === s && x.slug !== p.slug);
    if (m && !relatedList.includes(m)) relatedList.push(m);
  }
  for (const x of POSTS) { if (relatedList.length >= 3) break; if (x.slug !== p.slug && !relatedList.includes(x)) relatedList.push(x); }

  const article = `<article style="max-width:760px;margin:0 auto">`
    + `<span style="display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap;color:var(--text-faint);font-size:var(--fs-sm);font-family:var(--font-sans);margin-bottom:.5rem">`
    + `<span style="color:var(--text-muted);font-weight:600">${p.author}</span>`
    + `<span style="display:inline-flex;align-items:center;gap:.35rem">${icon('clock', { size: 14 })} ${p.date} · ${p.time}</span></span>`
    + `<p style="margin:0 0 var(--space-5);font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-muted);display:flex;align-items:center;gap:.45rem">${icon('badge-check', { size: 16, style: 'color:var(--icon-accent)' })} Medically reviewed by the RIIMS nephrology team · Last reviewed: ${REVIEW_DATE}</p>`
    + `<p class="riims-lead" style="margin:0 0 1rem">${p.excerpt}</p>`
    + depth
    + faqHtml
    + disclaimer()
    + refsHtml
    + cta
    + `<h2 style="font-size:var(--fs-2xl);margin:0 0 var(--space-5)">Related reading</h2>`
    + `<div class="blog-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">`
    + relatedList.slice(0, 3).map((x) => S.blogCard(base, x)).join('')
    + `</div></article>`;

  return pageHero(base, { crumb: `Blog · ${p.cat}`, icon: 'book-open', title: p.title, intro: p.excerpt })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container">${article}</div></section>`
    + S.ctaBand();
}

/* ---------- Legal / disclaimer pages ---------- */
export const DEFAULT_LEGAL = {
  privacy: {
    title: 'Privacy Policy', crumb: 'Privacy Policy', icon: 'shield-check',
    intro: 'How RIIMS handles the information you share with us.',
    sections: [
      ['What we collect', 'When you submit the appointment form, call, or message us on WhatsApp, we may collect your name, phone number, city, health concern and any reports you choose to share. We only collect what is needed to respond to your query and guide your care.'],
      ['How we use it', 'Your information is used solely to contact you, review your reports, and provide doctor-guided guidance. We do not sell your data or share it with advertisers. Reports are handled confidentially by our care team.'],
      ['Data security', 'We take reasonable steps to protect the information you share. Please avoid sending sensitive information over unsecured channels where possible; you can share reports securely with our team on request.'],
      ['Your choices', `You may ask us to update or delete your details at any time by calling or messaging us on ${SITE.phone}. Submitting the form means you agree to be contacted by RIIMS about your query.`],
      ['Contact', `For any privacy question, contact RIIMS, ${SITE.addressLine}, ${SITE.city}, or call ${SITE.phone}.`],
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
      ['Contact', `Questions about these terms? Call ${SITE.phone} or visit RIIMS, ${SITE.city}.`],
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

/* Merge admin overrides (Admin → Legal) over the defaults; icon/crumb stay from code.
   Empty admin sections fall back so required legal copy can never be blanked out. */
const LEGAL = Object.fromEntries(Object.entries(DEFAULT_LEGAL).map(([k, def]) => {
  const adm = LEGAL_ADMIN[k] || {};
  return [k, {
    ...def,
    title: adm.title || def.title,
    intro: adm.intro || def.intro,
    sections: (Array.isArray(adm.sections) && adm.sections.filter((s) => Array.isArray(s) && s[0]).length) ? adm.sections : def.sections,
  }];
}));

/* ---------- Kidney Diseases hub (/conditions/) ---------- */
export function conditionsHubPage(base) {
  return pageHero(base, { crumb: 'Kidney Diseases', icon: 'activity', title: 'Kidney Diseases We Treat', intro: 'Clear, doctor-aligned guidance on high creatinine, CKD, kidney failure, dialysis, protein in urine, swelling, diabetes/BP kidney risk and stones — explained simply, for patients and families.' })
    + S.problemsSection(base)
    + S.faqSection()
    + S.ctaBand();
}

/* ---------- Disease-category hub (/conditions/<dir>/index.html) ---------- */
export function categoryHubPage(base, cat) {
  const C = CATEGORIES[cat];
  const set = CONDITION_SETS[cat] || {};
  const cards = Object.entries(set).map(([slug, c]) =>
    `<a href="${base}conditions/${C.dir}/${slug}.html" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.4rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:44px;height:44px;border-radius:var(--radius-md);background:var(--surface-blue-soft);color:var(--icon-brand);align-items:center;justify-content:center">${icon(c.icon, { size: 20 })}</span>`
    + `<h2 style="font-size:var(--fs-lg);margin:.2rem 0 0;font-family:var(--font-display)">${c.title}</h2>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${esc(c.intro).slice(0, 110)}…</p>`
    + `<span style="margin-top:.1rem;display:inline-flex;align-items:center;gap:.4rem;color:var(--text-link);font-weight:700;font-family:var(--font-sans);font-size:var(--fs-sm)">Read more ${icon('arrow-right', { size: 15 })}</span></a>`).join('');
  return pageHero(base, { crumb: `Diseases · ${C.label}`, icon: C.icon, title: C.hubTitle, intro: C.hubIntro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container">`
    + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-5)">${cards}</div>`
    + `</div></section>`
    + disclaimer()
    + S.ctaBand();
}

/* ---------- Treatments & Services hub (/services.html) ---------- */
export function servicesPage(base) {
  const catCards = Object.values(CATEGORIES).map((C) => categoryCard(base, C)).join('');
  const tiles = SERVICES.map((sv) =>
    `<div class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem">`
    + `<span style="display:inline-flex;width:46px;height:46px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center">${icon(sv.icon, { size: 22 })}</span>`
    + `<h2 style="font-size:var(--fs-lg);margin:.1rem 0 0;font-family:var(--font-display)">${sv.t}</h2>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${sv.d}</p></div>`
  ).join('');
  return pageHero(base, { crumb: 'Treatments & Services', icon: 'stethoscope', title: 'Kidney Treatments & Services at RIIMS', intro: 'Integrated, doctor-led kidney care — consultations (clinic, video, phone), report review, dialysis guidance, personalized kidney diet, Ayurveda-supported lifestyle care, and long-term follow-up. Ethical, report-based, no false promises.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container">`
    + eyebrow('What we treat')
    + `<h2 style="font-size:var(--fs-2xl);margin:.3rem 0 1rem">One doctor-led approach, four areas of care</h2>`
    + `<p style="max-width:70ch;color:var(--text-muted);margin:0 0 var(--space-6)">RIIMS is a kidney-focused institute that also treats liver, heart and general/metabolic conditions in-house, working alongside your medical treatment rather than replacing it. Pick an area below to see what we cover.</p>`
    + `<div class="grid-4" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-4);margin-bottom:var(--space-10)">${catCards}</div>`
    + `<div class="services-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-4)">${tiles}</div>`
    + `<p style="margin:var(--space-8) auto 0;max-width:70ch;text-align:center;color:var(--text-body)">Every service starts from your actual reports. Share your creatinine/eGFR reports for a doctor-guided opinion, get a clear plan in plain language, and follow up with diet and lifestyle support that fits Indian routines — at the clinic in Baraut or from home via video consultation.</p>`
    + `<div style="text-align:center;margin-top:var(--space-6)">${button('Book Consultation', { variant: 'primary', size: 'lg', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })}</div>`
    + `</div></section>`
    + `<div style="margin-top:var(--space-8)">` + card(
      `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem">`
      + `<div style="max-width:60ch"><h2 style="font-size:var(--fs-xl);margin:0 0 .3rem">Care built on the DNA Kayakalp Protocol™</h2><p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">Our doctor-led framework — Diagnosis, Nutrition and Ayurveda-led activation — mapped to your reports and adapted over time. Supportive, honest, never a promise of cure.</p></div>`
      + button('Explore the protocol', { variant: 'primary', href: `${base}dna-kayakalp-protocol.html`, iconRight: icon('arrow-right', { size: 16 }) })
      + `</div>`,
      { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } }) + `</div>`
    + S.howItWorks()
    + S.ctaBand();
}

/* ---------- DNA Kayakalp Protocol (/dna-kayakalp-protocol.html) ---------- */
const DEFAULT_PROTOCOL_FAQS = [
  ['Does the DNA Kayakalp Protocol™ cure kidney disease or reverse damage?', 'No — and we will always be honest about this. It does not claim to cure kidney disease, reverse damage or promise any fixed outcome. Its purpose is safe, personalised, well-managed kidney care that supports your health journey — alongside your medical treatment, never replacing it.'],
  ['Can this protocol replace my medicines or dialysis?', 'No. It is designed to work alongside and in coordination with your medical care. Please continue your prescribed medicines and any dialysis exactly as your treating doctors advise. Never stop or change medical treatment on your own.'],
  ['Is Panchakarma safe for every kidney patient?', 'Not automatically. Not every patient needs it, and not every therapy suits every CKD stage — dialysis patients need special caution. Any supportive therapy is chosen individually and carried out only under a qualified Ayurveda physician’s supervision.'],
  ['Is there one diet chart that fits everyone?', 'No. The RiiMS Renal Plate is a visual guide, not a fixed chart. Your plate depends on your stage, potassium, proteinuria, diabetes, blood pressure, dialysis status, weight and appetite — always personalised and reviewed with your care team.'],
  ['Do detox, kadhas and lots of water clean the kidneys?', 'Be very careful with this idea. In kidney disease, water may be restricted and unsupervised fasting, strong kadhas or excess water can be harmful. Here, detox means safe, controlled support for the body’s own systems, under medical guidance — nothing aggressive or self-directed.'],
];

/* Admin (Admin → Protocol) can override the protocol FAQs; stored as {q,a} objects,
   normalised to [q,a] pairs here. Empty = the vetted defaults above. */
export const PROTOCOL_FAQS = (PROTOCOL.faqs && PROTOCOL.faqs.length)
  ? PROTOCOL.faqs.map((f) => (Array.isArray(f) ? f : [f.q || '', f.a || ''])).filter(([q]) => q)
  : DEFAULT_PROTOCOL_FAQS;

export function protocolPage(base) {
  const section = (inner, alt) => `<section style="padding-block:var(--section-pad-y);background:${alt ? 'var(--surface-page)' : 'var(--white)'}"><div class="riims-container" style="max-width:900px">${inner}</div></section>`;
  const h2 = (t) => `<h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">${t}</h2>`;
  const h3 = (t) => `<h3 style="font-size:var(--fs-lg);margin:1rem 0 .3rem">${t}</h3>`;
  const p = (t) => `<p style="color:var(--text-body);margin:0 0 1rem">${t}</p>`;
  const pillar = (tag, title, tagline, bodyHtml) => card(
    `<div style="display:flex;align-items:center;gap:.7rem;margin:0 0 .6rem"><span style="display:inline-flex;width:46px;height:46px;border-radius:var(--radius-md);background:var(--brand-primary);color:#fff;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:1.4rem">${tag}</span><div><h2 style="font-size:var(--fs-2xl);margin:0">${title}</h2><span style="color:var(--text-muted);font-size:var(--fs-sm)">${tagline}</span></div></div>` + bodyHtml,
    { pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } });

  const domains = [
    'Kidney Function — creatinine, eGFR, urea/BUN',
    'Kidney Damage Markers — urine protein, albuminuria, urine routine',
    'Fluid & Electrolytes — potassium, sodium, calcium, phosphorus, swelling, urine output',
    'Metabolic Status — diabetes, HbA1c, lipid profile, fatty liver, obesity',
    'Blood & Energy — haemoglobin, iron profile, weakness, fatigue',
    'Structural Status — ultrasound KUB, kidney size, stones/obstruction',
    'Lifestyle & Risk — painkillers, self-medication, supplements, sleep, stress, activity',
  ];
  const nephrotoxins = [
    'Painkillers taken without advice', 'Self-medication or borrowed prescriptions',
    'Unneeded supplements, protein powders, fat burners', 'Herbal products without quality assurance',
    'Contrast dye (always tell the doctor about your kidneys)', 'Heavily processed food',
    'Excess salt and hidden sodium', 'Smoking and tobacco', 'Excess alcohol', 'Repeated dehydration',
  ];
  const therapies = [
    'HTS — Healing Therapeutic Sweating Therapy', 'MMT — Mind Massage Therapy',
    'CCS — Colon Care Support', 'KTL — Kidney Thermal Lep',
    'PRS — Planter Reflex Stimulation', 'LCS — Lymphatic Circulation Support',
    'Other supportive therapies — targeted sweat, herbal heat compress, nasal wellness, yoga & guided relaxation',
  ];
  const activation = [
    'Sleep (Nidra) — adequate, timely rest and recovery',
    'Brahmacharya & appropriate yoga — steadiness of body and mind',
    'Movement as Medicine — gentle, capacity-appropriate activity, not the gym',
    'Laughter as Medicine — a lighter, more positive frame of mind',
    'Breath & oxygen support — calming, medically-appropriate breathing',
    'Gravity Treatment — nature, sunlight and circulation support',
    'Adaptive Lifestyle Planning — a personalised daily plan that changes with you',
  ];
  const steps = [
    ['Understand fully', 'We map your complete kidney and body picture across the 7 Kidney Mapping domains — not one number.'],
    ['Find the real causes', 'We identify the root cause(s) straining your kidneys and reduce unnecessary metabolic load, safely.'],
    ['Organise nutrition', 'We build your personalised RiiMS Renal Plate and LDP routine, matched to your reports and life.'],
    ['Reduce harm', 'We help you avoid nephrotoxins, using any supportive Ayurvedic therapy only under qualified supervision.'],
    ['Activate gently', 'We support sleep, movement, breath, mind and routine so your body can return to balance.'],
    ['Review & adapt', 'We revisit your plan at every follow-up and change it as your reports and needs change.'],
  ];

  return pageHero(base, { crumb: 'Treatments · DNA Kayakalp Protocol', icon: 'git-merge', title: 'The DNA Kayakalp Protocol™', intro: 'The integrated, doctor-guided kidney-care framework developed by our founder, Dr. Abhishek Gupta — combining modern medical science with Ayurveda to support safe, personalised kidney management. Always alongside your treating doctors, never in place of them.' })
    + section(
      h2('What is the DNA Kayakalp Protocol™?')
      + p('For most people living with kidney disease, one question sits at the centre of everything: “What should I actually do now?” Reports are read and medicines are taken, but daily life often stays confusing. The DNA Kayakalp Protocol™ was built to answer that question in an organised way — a structured Kidney Health Management Framework shaped over years of clinical work with thousands of patients.')
      + p('It is important to be honest about what this protocol is — and is not. It does <strong>not</strong> promise to cure kidney disease, reverse damage, or replace medical treatment or dialysis. Instead, it gives you correct information, the right nutrition, and the right lifestyle — under qualified medical and Ayurvedic supervision, tailored to each individual.')
      + `<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);margin-top:var(--space-4)">`
      + [['D', 'Diagnosis & Detox Support', 'the right information'], ['N', 'Nutrition & Nephrotoxin Reduction', 'the right nutrition'], ['A', 'Ayurveda-led Activation & Adaptive Care', 'the right lifestyle']].map(([t, ti, ta]) => card(`<span style="font-family:var(--font-display);font-weight:800;font-size:1.7rem;color:var(--brand-primary)">${t}</span><h3 style="font-size:var(--fs-lg);margin:.2rem 0">${ti}</h3><p style="margin:0;color:var(--text-body);font-weight:600;font-size:var(--fs-sm)">${ta}</p>`, { tone: 'cream', pad: 'md' })).join('')
      + `</div>`)
    + section(
      pillar('D', 'Diagnosis & Detox Support', 'the right information',
        p('One of the biggest mistakes in kidney disease is judging the whole illness by a single number. The better question is not “What is my creatinine?” but “What is the complete condition of my kidneys?” So the protocol begins by looking at the full picture — calmly, and together.')
        + h3('Kidney Mapping — the 7 domains')
        + infoList(domains, { icon: 'dot', color: 'var(--icon-brand)' })
        + h3('Root cause, metabolic load & safe detox')
        + p('We identify the real reasons straining the kidney — often several together — and reduce unnecessary “metabolic load” (this does <strong>not</strong> mean starving or weakening the body). Crucially, “detox” here means gently supporting the body’s own systems — not aggressive kadhas, fasting or excess water, which can be dangerous in kidney disease and are avoided.')),
      true)
    + section(
      pillar('N', 'Nutrition & Nephrotoxin Reduction', 'the right nutrition',
        p('Medicines alone are not enough. The <strong>LDP Protocol™ (Life of Disciplined People)</strong> — Lifestyle, Discipline and People (family support) — turns Ayurveda’s Ahara–Nidra–Brahmacharya into a practical daily routine.')
        + h3('The RiiMS Renal Plate Model')
        + p('A visual nutrition guide, not a fixed chart: <strong>½ plate vegetables</strong> (mostly low-potassium, lightly cooked) + <strong>¼ plate grains</strong> (controlled) + <strong>¼ plate protein</strong> (moong/masoor dal, small paneer, tofu, egg if suitable). Five principles — fresh, seasonal, local, personalised and mindful eating. The plate changes with your stage, potassium, diabetes, dialysis status and weight.')
        + h3('Nephrotoxins to avoid')
        + p('“Natural” does not always mean “safe.” Be careful of:')
        + infoList(nephrotoxins, { icon: 'dot', color: 'var(--icon-brand)' })
        + h3('Panchakarma Support Framework — supervised only')
        + p('Supportive therapies chosen per patient, offered alongside medical care and carried out only under a qualified Ayurveda physician’s supervision — never a “miraculous cure,” with special caution for dialysis patients:')
        + infoList(therapies, { icon: 'dot', color: 'var(--icon-brand)' })))
    + section(
      pillar('A', 'Ayurveda-led Activation & Adaptive Care', 'the right lifestyle',
        p('Once diagnosis and nutrition are in place, this pillar gently helps the body become active again — safely and under medical guidance. The care plan is <strong>adaptive</strong>: it is not fixed, and changes with your reports, stage, strength, age, dialysis status, sleep and mental state.')
        + infoList(activation, { icon: 'dot', color: 'var(--icon-brand)' })),
      true)
    + section(
      h2('How the protocol works for you')
      + `<ol style="margin:0;padding-left:1.2rem;color:var(--text-body);display:grid;gap:.6rem">`
      + steps.map(([t, d]) => `<li><strong>${t}.</strong> ${d}</li>`).join('')
      + `</ol>`)
    + section(
      h2('Frequently asked questions')
      + PROTOCOL_FAQS.map(([q, a]) => `<div style="margin-bottom:var(--space-5)"><h3 style="font-size:var(--fs-lg);margin:0 0 .3rem">${q}</h3><p style="margin:0;color:var(--text-body)">${a}</p></div>`).join(''),
      true)
    + section(
      card(
        `<p style="margin:0;color:var(--text-body)"><strong>Important:</strong> The DNA Kayakalp Protocol™ is an integrative, doctor-guided approach that combines modern medical science with Ayurvedic principles. It is intended to support — and always work alongside — your ongoing medical treatment, and is never a substitute for the advice, medicines or dialysis prescribed by your treating doctors. Ayurvedic therapies, Panchakarma and herbal support are supportive measures only, provided per patient and under qualified supervision. This protocol does not cure kidney disease, reverse damage or guarantee any outcome. Always consult your nephrologist and qualified RIIMS practitioners before making any decision about your care.</p>`,
        { tone: 'cream', pad: 'lg', style: { boxShadow: 'var(--shadow-sm)' } }))
    + S.ctaBand();
}

/* ---------- Patient Guides hub (/guides.html) ---------- */
export function guidesHubPage(base) {
  const cards = GUIDE_ORDER.map((k) => guideCard(base, k)).join('')
    + `<a href="${base}dna-kayakalp-protocol.html" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);padding:var(--space-5);display:flex;flex-direction:column;gap:.5rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:46px;height:46px;border-radius:var(--radius-md);background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center">${icon('git-merge', { size: 22 })}</span>`
    + `<h3 style="font-size:var(--fs-lg);margin:.1rem 0 0;font-family:var(--font-display)">The DNA Kayakalp Protocol™</h3>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">How RIIMS integrates modern medicine and Ayurveda into one honest, doctor-led care plan.</p>`
    + `<span style="margin-top:.2rem;display:inline-flex;align-items:center;gap:.4rem;color:var(--text-link);font-weight:700;font-family:var(--font-sans);font-size:var(--fs-sm)">Explore the protocol ${icon('arrow-right', { size: 15 })}</span></a>`;
  return pageHero(base, { crumb: 'Patient Guides', icon: 'book-open', title: 'Patient Guides: Understand and Care for Your Kidneys', intro: 'Plain-language kidney guides from our clinical team, grounded in founder Dr. Abhishek Gupta’s book Kidney Kavach. They help you understand your reports and support your care at home — always alongside, never instead of, your doctor’s advice.' })
    + `<section style="padding-block:var(--section-pad-y);background:var(--surface-page)"><div class="riims-container">`
    + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-4)">${cards}</div>`
    + `</div></section>`
    + S.ctaBand();
}

/* ---------- Patient Guide page (/<slug>.html) ---------- */
export function guidePage(base, key) {
  const g = GUIDES[key];
  const linkList = (items) => `<ul style="list-style:none;margin:.3rem 0 0;padding:0;display:flex;flex-direction:column;gap:.5rem">${items}</ul>`;
  const heading = (t) => `<h4 style="font-family:var(--font-sans);margin:var(--space-6) 0 0;font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-brand)">${t}</h4>`;
  const relCond = (g.related || []).filter((s) => CONDITIONS[s]).map((s) =>
    `<li><a href="${base}conditions/${s}.html" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('arrow-right', { size: 15 })} ${CONDITIONS[s].title}</a></li>`).join('');
  const otherGuides = GUIDE_ORDER.filter((k) => k !== key).slice(0, 3).map((k) =>
    `<li><a href="${base}${k}.html" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon(GUIDES[k].icon, { size: 15 })} ${GUIDES[k].title}</a></li>`).join('');
  const faqHtml = (g.faqs || []).map(([q, a]) => `<div style="margin-bottom:var(--space-5)"><h3 style="font-size:var(--fs-lg);margin:0 0 .3rem">${q}</h3><p style="margin:0;color:var(--text-body)">${a}</p></div>`).join('');
  return pageHero(base, { crumb: g.crumb, icon: g.icon, title: g.title, intro: g.intro })
    + `<section style="padding-block:var(--section-pad-y);background:var(--white)"><div class="riims-container" style="max-width:900px">`
    + renderBody(g.body)
    + (faqHtml ? `<h2 style="font-size:var(--fs-2xl);margin:var(--space-8) 0 .6rem">Frequently asked questions</h2>` + faqHtml : '')
    + card(
      `<h3 style="font-size:var(--fs-xl);margin:0 0 .3rem">Talk to a kidney care expert</h3>`
      + `<p style="margin:0 0 1rem;color:var(--text-muted);font-size:var(--fs-sm)">Share your reports for doctor-guided, evidence-aware guidance — no false promises.</p>`
      + `<div style="display:flex;flex-wrap:wrap;gap:.6rem">`
      + button('Book Consultation', { variant: 'primary', iconLeft: icon('calendar-check', { size: 18 }), extraAttrs: { 'data-book': true } })
      + button('WhatsApp Now', { variant: 'whatsapp', iconLeft: icon('message-circle', { size: 18 }), href: SITE.whatsapp })
      + `</div>`,
      { accent: true, pad: 'lg', style: { boxShadow: 'var(--shadow-md)', marginTop: 'var(--space-8)' } })
    + (relCond ? heading('Related conditions') + linkList(relCond) : '')
    + heading('More patient guides') + linkList(otherGuides)
    + `<p style="margin-top:var(--space-8);font-size:var(--fs-sm);color:var(--text-muted)">This guide is for general awareness and education, and is not a substitute for personal medical advice. Please consult your doctor about your own condition and reports.</p>`
    + `</div></section>`
    + S.ctaBand();
}

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
