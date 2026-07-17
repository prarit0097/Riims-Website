/* RIIMS static-site generator — site chrome: header, footer, mobile bar,
   floating contact, booking modal, appointment form, page hero.
   Ported from ui_kits/website sections-a/-d + pages.jsx. */

import { icon, logo, button, iconButton, input, select, checkbox } from './components.mjs';
import { NAV, SITE, CATEGORIES } from './data.mjs';

/* attributes for off-site links (social, WhatsApp) */
const OFFSITE = { target: '_blank', rel: 'noopener noreferrer' };

/* ---------- Appointment form (single step) ----------
   Name + Phone + Problem/Disease only. On submit the lead POSTs to /api/lead
   (stored by the admin server; managed in the /admin/ Leads tab). */
export function appointmentForm() {
  // Kidney-first — RIIMS is a kidney specialist brand; the list stays focused on
  // kidney concerns (broad non-kidney options dilute the brand + SEO signal).
  const PROBLEM_OPTIONS = [
    'High creatinine', 'CKD (chronic kidney disease)', 'Dialysis guidance', 'Kidney failure',
    'Protein in urine', 'Swelling (edema)', 'Diabetes + kidney', 'BP + kidney',
    'Kidney stone / UTI', 'Other',
  ];

  const form = `<form data-step="0" class="appt-step" style="display:flex;flex-direction:column;gap:.9rem">`
    + input({ label: 'Full name', required: true, icon: icon('user'), placeholder: 'Your name', name: 'name' })
    + input({ label: 'Phone / WhatsApp', type: 'tel', required: true, icon: icon('phone'), placeholder: '10-digit mobile', name: 'phone' })
    + select({ label: 'Problem / Disease', name: 'problem', icon: icon('activity'), options: PROBLEM_OPTIONS, placeholder: 'Select your problem' })
    + `<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;height:1px;width:1px;opacity:0">`
    + checkbox({ label: 'I agree to be contacted by RIIMS about my query.', name: 'agree', checked: true })
    + button('Request a callback', { variant: 'primary', size: 'lg', fullWidth: true, type: 'submit', iconRight: icon('arrow-right', { size: 18 }) })
    + `<p style="margin:0;text-align:center;font-family:var(--font-sans);font-size:var(--fs-xs);color:var(--text-faint)">Takes ~20 seconds · our care team will call you back</p>`
    + `</form>`;

  const success = `<div data-step="2" class="appt-step" hidden style="text-align:center;padding:1rem .5rem">`
    + `<span style="display:inline-flex;width:56px;height:56px;border-radius:50%;background:var(--surface-green-soft);color:var(--icon-accent);align-items:center;justify-content:center;margin-bottom:.8rem">${icon('check', { size: 28 })}</span>`
    + `<h3 style="margin:0 0 .3rem;font-size:var(--fs-xl)">Request received</h3>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-base)">Our care team will call you back shortly. This is not an emergency service.</p>`
    + `<div><button type="button" data-appt-reset style="margin-top:1rem;background:none;border:none;color:var(--text-link);font-weight:700;cursor:pointer;font-family:var(--font-sans)">Send another request</button></div>`
    + `</div>`;

  return `<div data-apptform>${form}${success}</div>`;
}

/* ---------- Header ---------- */
export function header(base, current) {
  const tel = `tel:${SITE.phoneTel}`;
  const utility = `<div style="background:var(--surface-inverse);color:rgba(255,255,255,.85)">`
    + `<div class="riims-container" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:40px;font-family:var(--font-sans);font-size:.82rem">`
    + `<div style="display:flex;align-items:center;gap:1.2rem">`
    + `<a href="${tel}" style="color:inherit;display:inline-flex;align-items:center;gap:.4rem;text-decoration:none">${icon('phone', { size: 14 })} ${SITE.phone}</a>`
    + `<span class="util-hide" style="display:inline-flex;align-items:center;gap:.4rem">${icon('map-pin', { size: 14 })} ${SITE.city}</span>`
    + `<span class="util-hide" style="display:inline-flex;align-items:center;gap:.4rem">${icon('clock', { size: 14 })} ${SITE.hours}</span>`
    + `</div>`
    + `<div style="display:flex;align-items:center;gap:.5rem">`
    + `<a href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" style="color:var(--whatsapp);display:inline-flex;align-items:center;gap:.35rem;font-weight:700;text-decoration:none">${icon('message-circle', { size: 14 })} WhatsApp</a>`
    + `<span style="opacity:.3">|</span>`
    + (SITE.facebook ? `<a href="${SITE.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="color:inherit;display:inline-flex">${icon('facebook', { size: 15 })}</a>` : '')
    + (SITE.instagram ? `<a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color:inherit;display:inline-flex">${icon('instagram', { size: 15 })}</a>` : '')
    + (SITE.youtube ? `<a href="${SITE.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube" style="color:inherit;display:inline-flex">${icon('youtube', { size: 16 })}</a>` : '')
    + `</div></div></div>`;

  const onCondition = current && current.startsWith('conditions/');
  const links = NAV.map((n) => {
    const active = onCondition ? (n.label === 'Kidney Diseases') : (current && n.href === current);
    return `<a href="${base}${n.href}" style="font-family:var(--font-sans);font-size:.95rem;font-weight:600;text-decoration:none;color:${active ? 'var(--text-brand)' : 'var(--text-body)'}">${n.label}</a>`;
  }).join('');

  // Mobile: an always-visible horizontal scroll of nav "chips" (icon + label) replaces the
  // hamburger — every section is one tap away with no menu to open (Mobile Homepage v2 design).
  const CHIP_ICON = { About: 'building-2', 'Kidney Diseases': 'activity', Treatments: 'stethoscope', Guides: 'book-open', Doctors: 'users', Blog: 'newspaper', Contact: 'phone' };
  const chips = NAV.map((n) => {
    const active = onCondition ? (n.label === 'Kidney Diseases') : (current && n.href === current);
    return `<a href="${base}${n.href}" class="nav-chip${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${icon(CHIP_ICON[n.label] || 'circle-dot', { size: 15, style: 'color:var(--icon-accent)' })}<span>${n.label}</span></a>`;
  }).join('');

  const main = `<div style="background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--border-subtle)">`
    + `<div class="riims-container header-row" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:80px">`
    + logo(base, { size: 68 })
    + `<nav class="nav-links" aria-label="Main navigation" style="display:flex;align-items:center;gap:1.4rem">${links}</nav>`
    + `<div class="nav-cta" style="display:flex;align-items:center;gap:.6rem">`
    + iconButton(icon('phone', { size: 18 }), { label: 'Call now', variant: 'solid', href: tel })
    + button('WhatsApp Now', { variant: 'whatsapp', size: 'sm', iconLeft: icon('message-circle', { size: 16 }), href: SITE.whatsapp, extraAttrs: OFFSITE })
    + button('Book Consultation', { variant: 'primary', size: 'sm', iconLeft: icon('calendar-check', { size: 16 }), extraAttrs: { 'data-book': true } })
    + `</div>`
    + `<div class="nav-mobile-cta">`
    + iconButton(icon('phone', { size: 18 }), { label: 'Call now', variant: 'solid', href: tel })
    + button('Book', { variant: 'primary', size: 'sm', iconLeft: icon('calendar-check', { size: 16 }), extraAttrs: { 'data-book': true } })
    + `</div>`
    + `</div>`
    + `<nav class="nav-chips" aria-label="Sections">${chips}</nav>`
    + `</div>`;

  return `<header style="position:sticky;top:0;z-index:100">${utility}${main}</header>`;
}

/* ---------- Footer ---------- */
export function footer(base) {
  // The 3 new disease-category hubs (liver/heart/general), sitewide-reachable
  // alongside the existing kidney condition links. Kidney's own hub already
  // has a home in NAV ("Kidney Diseases"), so it is not repeated here.
  const categoryLinks = ['liver', 'heart', 'general'].map((cat) => {
    const C = CATEGORIES[cat];
    return [C.hubTitle, `conditions/${C.dir}/index.html`];
  });
  const cols = [
    { h: 'Conditions', links: [['High Creatinine', 'conditions/high-creatinine.html'], ['CKD', 'conditions/ckd.html'], ['Kidney Failure', 'conditions/kidney-failure.html'], ['Dialysis Guidance', 'conditions/dialysis.html'], ['Protein in Urine', 'conditions/proteinuria.html'], ['Kidney Swelling', 'conditions/kidney-swelling-treatment.html'], ['Kidney Stone Treatment', 'conditions/kidney-stone-treatment.html'], ...categoryLinks] },
    // The Delhi-NCR landing pages live only here in the sitewide nav — without a link
    // in from somewhere, a page is an orphan and Google has little reason to rank it.
    { h: 'Care', links: [['DNA Kayakalp Protocol', 'dna-kayakalp-protocol.html'], ['Patient Guides', 'guides.html'], ['Understand Your Reports', 'understand-kidney-reports.html'], ['Kidney Diet & Renal Plate', 'kidney-diet-renal-plate.html'], ['Treatments & Services', 'services.html'], ['Affordable Kidney Treatment', 'affordable-kidney-treatment-delhi-ncr.html']] },
    { h: 'Institute', links: [['About RIIMS', 'about.html'], ['Our Doctors', 'doctors.html'], ['Kidney Doctor (Delhi-NCR)', 'doctors/best-kidney-doctor-delhi-ncr.html'], ['High Creatinine Specialist', 'doctors/high-creatinine-specialist.html'], ['CKD Hospital (Delhi-NCR)', 'chronic-kidney-disease-hospital-delhi-ncr.html'], ['Kidney Failure Hospital (Delhi-NCR)', 'best-kidney-failure-hospital-in-delhi-ncr.html'], ['Blog', 'blog.html'], ['Contact', 'contact.html']] },
  ];
  const colHtml = cols.map((c) =>
    `<div><h4 style="font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;margin:0 0 .9rem">${c.h}</h4>`
    + `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6rem">`
    + c.links.map(([l, href]) => `<li><a href="${base}${href}" style="color:rgba(255,255,255,.72);text-decoration:none;font-size:var(--fs-sm)">${l}</a></li>`).join('')
    + `</ul></div>`
  ).join('');

  const social = `<div style="display:flex;gap:.5rem">`
    + iconButton(icon('phone', { size: 18 }), { variant: 'ghost', label: 'Call', href: `tel:${SITE.phoneTel}` })
    + iconButton(icon('message-circle', { size: 18 }), { variant: 'whatsapp', label: 'WhatsApp', href: SITE.whatsapp, extraAttrs: OFFSITE })
    + (SITE.facebook ? iconButton(icon('facebook', { size: 18 }), { variant: 'ghost', label: 'Facebook', href: SITE.facebook, extraAttrs: OFFSITE }) : '')
    + (SITE.instagram ? iconButton(icon('instagram', { size: 18 }), { variant: 'ghost', label: 'Instagram', href: SITE.instagram, extraAttrs: OFFSITE }) : '')
    + (SITE.youtube ? iconButton(icon('youtube', { size: 18 }), { variant: 'ghost', label: 'YouTube', href: SITE.youtube, extraAttrs: OFFSITE }) : '')
    + `</div>`;

  return `<footer style="background:var(--surface-inverse);color:rgba(255,255,255,.72)">`
    + `<div class="riims-container" style="padding-block:var(--space-12)">`
    + `<div class="footer-grid" style="display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:var(--space-8)">`
    + `<div>${logo(base, { light: true })}`
    + `<p style="margin:1rem 0 1.2rem;font-size:var(--fs-sm);max-width:34ch">Rashtriya Institute of Integrated Medical Sciences: ethical, kidney-focused integrated care, patient education and report-based consultation.</p>`
    + social + `</div>` + colHtml + `</div>`
    + `<div style="margin-top:var(--space-10)">${disclaimerDark()}</div>`
    + `<div style="margin-top:var(--space-8);padding-top:var(--space-6);border-top:1px solid rgba(255,255,255,.12);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center;font-size:var(--fs-sm)">`
    + `<span>© ${SITE.year} RIIMS. All rights reserved.</span>`
    + `<div style="display:flex;gap:1.2rem">`
    + `<a href="${base}privacy.html" style="color:rgba(255,255,255,.72);text-decoration:none">Privacy Policy</a>`
    + `<a href="${base}terms.html" style="color:rgba(255,255,255,.72);text-decoration:none">Terms</a>`
    + `<a href="${base}disclaimer.html" style="color:rgba(255,255,255,.72);text-decoration:none">Disclaimer</a>`
    + `</div></div></div></footer>`;
}

function disclaimerDark() {
  const base = 'display:flex;gap:.7rem;align-items:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:var(--radius-md);padding:var(--space-4) var(--space-5);color:rgba(255,255,255,.8);font-family:var(--font-sans);font-size:var(--fs-sm);line-height:var(--leading-relaxed)';
  return `<div style="${base}">${icon('info', { size: 18, style: 'flex:0 0 auto;margin-top:2px;color:var(--green-300)' })}`
    + `<span><strong style="color:#fff">Medical disclaimer:</strong> Information on this site is for awareness only and does not replace medical consultation. Treatment depends on doctor evaluation and patient reports. RIIMS does not promise guaranteed cure or recovery.</span></div>`;
}

/* ---------- Mobile bottom nav ---------- */
export function mobileBar(base, current) {
  const tab = (active) => `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.12rem;border:none;background:transparent;cursor:pointer;padding:.55rem .2rem;font-family:var(--font-sans);font-weight:700;font-size:10px;color:${active ? 'var(--text-brand)' : 'var(--text-muted)'};text-decoration:none`;
  return `<nav class="riims-mobilebar" aria-label="Mobile" style="position:fixed;left:0;right:0;bottom:0;z-index:110;display:none;align-items:flex-end;min-height:62px;background:#fff;border-top:1px solid var(--border-default);box-shadow:0 -8px 24px rgba(4,45,49,.12)">`
    + `<a href="${base}index.html" style="${tab(current === 'home')}">${icon('home', { size: 20 })} Home</a>`
    + `<a href="${base}doctors.html" style="${tab(current === 'doctors.html')}">${icon('stethoscope', { size: 20 })} Doctors</a>`
    + `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative">`
    + `<button type="button" data-book aria-label="Book consultation" style="position:absolute;top:-24px;width:56px;height:56px;border-radius:50%;border:4px solid #fff;background:var(--brand-primary);color:#fff;box-shadow:var(--shadow-brand);cursor:pointer;display:flex;align-items:center;justify-content:center">${icon('calendar-check', { size: 24 })}</button>`
    + `<span style="padding-bottom:.55rem;font-family:var(--font-sans);font-weight:700;font-size:10px;color:var(--text-brand)">Book</span></div>`
    + `<a href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" style="${tab(false)}">${icon('message-circle', { size: 20, style: 'color:var(--whatsapp-dark)' })} WhatsApp</a>`
    + `<a href="tel:${SITE.phoneTel}" style="${tab(false)}">${icon('phone', { size: 20 })} Call</a>`
    + `</nav>`;
}

/* ---------- Floating contact ---------- */
export function floatingContact() {
  return `<div class="riims-fab" style="position:fixed;right:clamp(1rem,2vw,1.5rem);bottom:clamp(1rem,2vw,1.5rem);z-index:90;display:flex;flex-direction:column;gap:.7rem">`
    + `<a href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp us" style="display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;background:var(--whatsapp);color:#06351c;box-shadow:0 10px 24px rgba(37,211,102,.4)">${icon('message-circle', { size: 26 })}</a>`
    + `<a href="tel:${SITE.phoneTel}" aria-label="Call us" style="display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;background:var(--brand-primary);color:#fff;box-shadow:var(--shadow-brand)">${icon('phone', { size: 24 })}</a>`
    + `</div>`;
}

/* ---------- Booking modal ---------- */
export function bookingModal() {
  return `<div id="booking-modal" role="dialog" aria-modal="true" aria-label="Book a consultation" hidden style="position:fixed;inset:0;z-index:300;background:var(--surface-overlay);backdrop-filter:blur(4px);align-items:flex-start;justify-content:center;padding:clamp(1rem,4vh,4rem) 1rem;overflow-y:auto">`
    + `<div data-modal-panel style="width:100%;max-width:640px;background:var(--surface-card);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);overflow:hidden">`
    + `<div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-5) var(--space-6);border-bottom:1px solid var(--border-subtle);background:var(--surface-blue-soft)">`
    + `<div style="display:flex;align-items:center;gap:.6rem">${icon('calendar-clock', { size: 22, style: 'color:var(--icon-brand)' })}<h3 style="margin:0;font-size:var(--fs-xl)">Book a consultation</h3></div>`
    + iconButton(icon('x', { size: 18 }), { variant: 'outline', label: 'Close', extraAttrs: { 'data-modal-close': true } })
    + `</div>`
    + `<div style="padding:var(--space-6)">${appointmentForm()}</div>`
    + `</div></div>`;
}

/* ---------- Page hero (inner pages) ---------- */
export function pageHero(base, { crumb, title, intro, icon: ic } = {}) {
  return `<section style="background:linear-gradient(180deg, var(--surface-blue-soft), var(--surface-page));border-bottom:1px solid var(--border-subtle)">`
    + `<div class="riims-container" style="padding-block:clamp(2rem,1.4rem + 3vw,3.5rem)">`
    + `<nav aria-label="Breadcrumb" style="display:flex;align-items:center;gap:.5rem;font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-muted);margin-bottom:1rem">`
    + `<a href="${base}index.html" style="color:var(--text-link);text-decoration:none">Home</a>${icon('chevron-right', { size: 14 })}<span>${crumb}</span></nav>`
    + `<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">`
    + (ic ? `<span style="display:inline-flex;width:60px;height:60px;border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-sm);color:var(--icon-brand);align-items:center;justify-content:center">${icon(ic, { size: 28 })}</span>` : '')
    + `<h1 style="font-size:var(--fs-4xl);margin:0">${title}</h1></div>`
    + (intro ? `<p class="riims-lead" style="margin:1rem 0 0;max-width:60ch">${intro}</p>` : '')
    + `</div></section>`;
}
