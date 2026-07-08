/* RIIMS static-site generator — entry point.
   Composes <head> (SEO + JSON-LD) + chrome (header/footer/mobile/modal) around
   each page body, then writes static HTML + sitemap.xml + robots.txt into /site.
   Run: node build/generate.mjs  (or `npm run build`). */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { header, footer, mobileBar, bookingModal } from './chrome.mjs';
import { homePage, conditionPage, aboutPage, doctorsPage, blogPage, contactPage, blogPostPage, legalPage, notFoundPage, conditionsHubPage, servicesPage, protocolPage, PROTOCOL_FAQS, guidePage, guidesHubPage, LEGAL_KEYS } from './pages.mjs';
import { GUIDES, GUIDE_ORDER } from './guides.mjs';
import { esc } from './components.mjs';
import { CONDITIONS, POSTS, SITE, TRACKING, DOCTORS_FULL, REELS } from './data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'site');

/* Google tag (admin "Tracking" tab): write js/gtag.js with the configured id.
   External file (not inline) so CSP script-src 'self' covers the config call. */
const GTAG_ID = String(TRACKING.gtagId || '').trim();
if (GTAG_ID) {
  writeFileSync(join(OUT, 'js', 'gtag.js'),
    `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${GTAG_ID.replace(/[^A-Za-z0-9_-]/g, '')}');\n`, 'utf8');
}

/* Disease-search data (admin-driven): the home search widget's "Specialist for you"
   + "Related articles" + video come from REAL merged content (DOCTORS/POSTS/REELS),
   not a hardcoded list — so adding/removing a doctor, blog or reel in /admin/ flows
   straight into search on the next rebuild. External file (CSP script-src 'self'). */
const SEARCH_CARE = { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' };
// Featured specialist for a KIDNEY search: prefer a doctor whose title/specialty mentions
// "nephro" (a nephrologist best fits a kidney query); else fall back to the first doctor
// in Admin → Doctors. Names/titles are trimmed (admin fields can carry stray spaces).
const _isNephro = (d) => /nephro/i.test(`${d.title || ''} ${(d.specialties || []).join(' ')}`);
const _kidneyDoc = DOCTORS_FULL.find(_isNephro) || DOCTORS_FULL[0];
const _featuredDoc = _kidneyDoc
  ? { name: String(_kidneyDoc.name || '').trim(), title: String(_kidneyDoc.title || '').trim(), init: _kidneyDoc.init || 'RC' }
  : SEARCH_CARE;
const SEARCH_DATA = {
  doctor: _featuredDoc,               // featured specialist = your FIRST doctor in Admin → Doctors
  care: SEARCH_CARE,                  // shown for non-kidney topics
  posts: POSTS.map((p) => ({ title: p.title, href: `blog/${p.slug}.html`, cat: p.cat || '', related: p.related || '' })),
  reel: REELS[0] ? { title: REELS[0].title, href: REELS[0].url || SITE.instagram } : null,
};
writeFileSync(join(OUT, 'js', 'search-data.js'),
  `window.__RIIMS_SEARCH__=${JSON.stringify(SEARCH_DATA)};\n`, 'utf8');

/* Verification/meta tags (admin "Tracking" tab): only <meta>/<link> lines pass. */
const META_TAGS = String(TRACKING.metaTags || '')
  .split(/\r?\n/).map((l) => l.trim())
  .filter((l) => /^<(meta|link)\s[^>]*\/?>$/i.test(l))
  .join('\n  ');

/* Asset version: content hash of all CSS/JS. Appended as ?v= to asset URLs so
   browsers (30-day cache) pick up changes immediately after a deploy. */
const ASSET_FILES = [
  'css/tokens/fonts.css', 'css/tokens/colors.css', 'css/tokens/typography.css',
  'css/tokens/spacing.css', 'css/tokens/base.css', 'css/site.css', 'js/site.js',
  'js/search-data.js',
  ...(GTAG_ID ? ['js/gtag.js'] : []),
];
const _h = createHash('md5');
for (const f of ASSET_FILES) { try { _h.update(readFileSync(join(OUT, f))); } catch { /* missing in fresh checkout */ } }
const V = _h.digest('hex').slice(0, 10);

/* ---------- JSON-LD ---------- */
function clinicGraph() {
  return {
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': `${SITE.origin}/#clinic`,
    name: 'RIIMS — Rashtriya Institute of Integrated Medical Sciences',
    alternateName: 'RIIMS Baraut',
    description: 'Kidney-focused integrated medical institute offering ethical, doctor-led care for high creatinine, CKD, kidney failure, dialysis guidance, kidney diet and Ayurveda-supported lifestyle care.',
    url: `${SITE.origin}/`,
    logo: `${SITE.origin}/assets/riims-logo.png`,
    image: `${SITE.origin}/assets/riims-logo.png`,
    telephone: SITE.phoneTel,
    medicalSpecialty: ['Nephrology', 'Internal Medicine'],
    priceRange: '₹₹',
    areaServed: SITE.serviceCities.map((c) => ({ '@type': 'City', name: c })),
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    hasMap: SITE.mapsLink,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Baraut Medicity Hospital, 36VW+JHV, Kotana Road',
      addressLocality: 'Baraut', addressRegion: 'Uttar Pradesh', postalCode: '250611', addressCountry: 'IN',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00', closes: '19:00',
    }],
    sameAs: [SITE.facebook, SITE.instagram, SITE.youtube],
  };
}

/* 'Jun 2026' -> ISO 'YYYY-MM-01' for Article dates */
const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
function isoDate(label) {
  const [m, y] = String(label || '').split(' ');
  return MONTHS[m] && y ? `${y}-${MONTHS[m]}-01` : undefined;
}
function websiteGraph() {
  return {
    '@type': 'WebSite', '@id': `${SITE.origin}/#website`, url: `${SITE.origin}/`,
    name: 'RIIMS — Integrated Kidney Care', publisher: { '@id': `${SITE.origin}/#clinic` }, inLanguage: 'en-IN',
  };
}
const FAQ_GRAPH = {
  '@type': 'FAQPage', '@id': `${SITE.origin}/#faq`,
  mainEntity: [
    ['Can high creatinine always be reduced?', 'It depends on the underlying cause. A doctor reviews your reports, history and medications to plan care. RIIMS does not promise guaranteed outcomes.'],
    ['Do you guarantee that dialysis can be stopped?', 'No. We never make such claims. Dialysis decisions are strictly doctor- and report-led, based on your kidney function.'],
    ['Is the first consultation online or in clinic?', 'You can choose video, phone, or an in-clinic visit at Baraut, Uttar Pradesh. Reports can be shared securely before your appointment.'],
    ['Is Ayurveda support safe with my medicines?', 'Lifestyle and dietary support is given alongside, and in coordination with, your medical treatment — never as a replacement for it.'],
  ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};
function breadcrumb(crumb, url) {
  const parts = crumb.split(' · ');
  const items = [{ name: 'Home', url: `${SITE.origin}/` }];
  parts.forEach((p, i) => items.push({ name: p, url: i === parts.length - 1 ? url : `${SITE.origin}/conditions/high-creatinine.html` }));
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
function ldScript(graph) {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

/* Clamp a meta description to a SERP-safe length on a word boundary (Google
   truncates ~155–160 chars). JSON-LD descriptions keep the full text. */
function clampDesc(s, max = 155) {
  s = String(s).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  let cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  if (sp > 60) cut = cut.slice(0, sp);
  return `${cut.replace(/[\s,;:.–—-]+$/, '')}…`;
}

/* ---------- <head> ---------- */
function head(p) {
  const url = `${SITE.origin}${p.path}`;
  const graph = [clinicGraph(), websiteGraph(), ...(p.ld || [])];
  // Social share image: the brand hero banner (1600x800 JPEG, ~180KB).
  const ogImg = `${SITE.origin}/assets/hometop.jpg`;
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(clampDesc(p.desc))}" />
  <meta name="author" content="RIIMS — Rashtriya Institute of Integrated Medical Sciences" />
  <meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
  <meta name="theme-color" content="#0a6168" />
  <link rel="canonical" href="${url}" />
  ${p.preload ? `<link rel="preload" as="image" href="${p.base}${p.preload}"${p.preload.endsWith('.webp') ? ' type="image/webp"' : ''} fetchpriority="high" />\n  ` : ''}<link rel="icon" type="image/png" href="${p.base}assets/riims-logo-sm.png" />
  <link rel="apple-touch-icon" href="${p.base}assets/riims-logo-sm.png" />
  <link rel="manifest" href="${p.base}site.webmanifest" />
  <meta property="og:type" content="${p.path === '/' ? 'website' : 'article'}" />
  <meta property="og:site_name" content="RIIMS — Integrated Kidney Care" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImg}" />
  <meta property="og:image:width" content="1600" />
  <meta property="og:image:height" content="800" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)}" />
  <meta name="twitter:description" content="${esc(p.desc)}" />
  <meta name="twitter:image" content="${ogImg}" />
  ${ldScript(graph)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${META_TAGS ? META_TAGS + '\n  ' : ''}${GTAG_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GTAG_ID)}"></script>\n  <script src="${p.base}js/gtag.js?v=${V}"></script>\n  ` : ''}<link rel="stylesheet" href="${p.base}css/tokens/fonts.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/colors.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/typography.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/spacing.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/base.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/site.css?v=${V}" />
  <script src="${p.base}assets/vendor/lucide.min.js" defer></script>
  <script src="${p.base}js/search-data.js?v=${V}" defer></script>
  <script src="${p.base}js/site.js?v=${V}" defer></script>
</head>`;
}

function render(p) {
  const body = `<body>`
    + header(p.base, p.nav)
    + `<main>${p.body}</main>`
    + footer(p.base)
    + mobileBar(p.base, p.mobile)
    + bookingModal()
    + `</body></html>`;
  return head(p) + '\n' + body;
}

/* ---------- Page manifest ---------- */
const pages = [
  {
    out: 'index.html', base: '', path: '/', nav: 'home', mobile: 'home', preload: 'assets/hometop.webp',
    title: 'RIIMS Baraut | Kidney Care: High Creatinine, CKD, Dialysis',
    desc: 'Ethical, doctor-led kidney care in Baraut, UP — high creatinine, CKD, dialysis guidance, kidney diet & report review, with integrated Ayurveda support.',
    body: homePage(''), ld: [FAQ_GRAPH],
  },
  {
    out: 'about.html', base: '', path: '/about.html', nav: 'about.html', mobile: '',
    title: 'About RIIMS | Ethical Integrated Kidney Care in Baraut, UP',
    desc: 'A kidney-focused institute in Baraut, UP for ethical, evidence-aware, report-based care — nephrology with Ayurveda-supported lifestyle guidance.',
    body: aboutPage(''),
  },
  {
    out: 'doctors.html', base: '', path: '/doctors.html', nav: 'doctors.html', mobile: 'doctors.html',
    title: 'Our Doctors & Kidney Care Team | RIIMS Baraut',
    desc: 'Meet the RIIMS nephrology and integrated-care team — kidney specialists, physicians and renal dietitians providing ethical, doctor-led care in Baraut, Uttar Pradesh.',
    body: doctorsPage(''),
  },
  {
    out: 'blog.html', base: '', path: '/blog.html', nav: 'blog.html', mobile: '',
    title: 'Kidney Health Blog & Patient Education | RIIMS',
    desc: 'Doctor-aligned articles on high creatinine, CKD, dialysis, kidney diet and Ayurveda-supported integrated care — plain-language kidney education.',
    body: blogPage(''),
  },
  {
    out: 'conditions/index.html', base: '../', path: '/conditions/', nav: 'conditions/index.html', mobile: '',
    title: 'Kidney Diseases We Treat | RIIMS Baraut',
    desc: 'High creatinine, CKD, kidney failure, dialysis guidance, protein in urine, swelling, diabetes/BP kidney risk and stones — doctor-led care at RIIMS, Baraut.',
    body: conditionsHubPage('../'),
    ld: [FAQ_GRAPH, {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Kidney Diseases', item: `${SITE.origin}/conditions/` },
      ],
    }],
  },
  {
    out: 'services.html', base: '', path: '/services.html', nav: 'services.html', mobile: '',
    title: 'Kidney Treatments & Services | RIIMS Baraut',
    desc: 'Consultations (clinic, video, phone), report review, dialysis guidance, kidney diet plans, Ayurveda-supported lifestyle care and follow-up — at RIIMS, Baraut, UP.',
    body: servicesPage(''),
    ld: [{
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Treatments & Services', item: `${SITE.origin}/services.html` },
      ],
    }],
  },
  {
    out: 'dna-kayakalp-protocol.html', base: '', path: '/dna-kayakalp-protocol.html', nav: 'services.html', mobile: '',
    title: 'DNA Kayakalp Protocol™ — Integrated Kidney Care | RIIMS',
    desc: 'The DNA Kayakalp Protocol™ — RIIMS’s doctor-guided, integrated kidney-care framework (Diagnosis, Nutrition, Ayurveda-led activation) combining modern science with Ayurveda. Supportive, honest, never a promise of cure.',
    body: protocolPage(''),
    ld: [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Treatments & Services', item: `${SITE.origin}/services.html` },
          { '@type': 'ListItem', position: 3, name: 'DNA Kayakalp Protocol', item: `${SITE.origin}/dna-kayakalp-protocol.html` },
        ],
      },
      {
        '@type': 'MedicalWebPage', name: 'The DNA Kayakalp Protocol™',
        description: 'An integrative, doctor-guided kidney-health management framework combining modern medical science with Ayurvedic principles — supportive, personalised, never a substitute for medical treatment.',
        url: `${SITE.origin}/dna-kayakalp-protocol.html`, inLanguage: 'en-IN', isPartOf: { '@id': `${SITE.origin}/#website` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: PROTOCOL_FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  },
  {
    out: 'guides.html', base: '', path: '/guides.html', nav: 'guides.html', mobile: '',
    title: 'Kidney Care Patient Guides | RIIMS',
    desc: 'Plain-language kidney guides from RIIMS — understand your reports, kidney diet & the RiiMS Renal Plate, Ayurvedic herbs, everyday symptom care, myths vs facts and a 30-day plan.',
    body: guidesHubPage(''),
    ld: [{
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Patient Guides', item: `${SITE.origin}/guides.html` },
      ],
    }],
  },
  {
    out: 'contact.html', base: '', path: '/contact.html', nav: 'contact.html', mobile: '',
    title: 'Contact & Book Appointment | RIIMS Baraut, UP',
    desc: 'Book a kidney consultation at RIIMS, Baraut. Call or WhatsApp +91 85120 40000, share reports securely, and choose video, phone or in-clinic care.',
    body: contactPage(''), ld: [FAQ_GRAPH],
  },
];

for (const slug of Object.keys(CONDITIONS)) {
  const c = CONDITIONS[slug];
  const path = `/conditions/${slug}.html`;
  pages.push({
    out: `conditions/${slug}.html`, base: '../', path, nav: `conditions/${slug}.html`, mobile: '',
    title: `${c.title} — Symptoms & Care | RIIMS`,
    desc: `${c.intro} Doctor-led, report-based kidney care at RIIMS, Baraut, UP.`,
    body: conditionPage('../', slug),
    ld: [breadcrumb(c.crumb, `${SITE.origin}${path}`), {
      '@type': 'MedicalWebPage', name: c.title, description: c.intro, url: `${SITE.origin}${path}`,
      about: { '@type': 'MedicalCondition', name: c.title }, inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE.origin}/#website` },
    }, {
      // FAQ rich-result eligibility: mirrors the Q&A-style content visible on the page.
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: c.aboutTitle, acceptedAnswer: { '@type': 'Answer', text: c.about } },
        { '@type': 'Question', name: `When should I consult a kidney doctor about ${c.title.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: c.when } },
        { '@type': 'Question', name: `How does RIIMS approach ${c.title.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: c.approach.join('. ') + '.' } },
      ],
    }],
  });
}

/* Blog article pages (one per post) */
for (const p of POSTS) {
  const path = `/blog/${p.slug}.html`;
  pages.push({
    out: `blog/${p.slug}.html`, base: '../', path, nav: 'blog.html', mobile: '',
    title: `${p.title} | RIIMS Blog`,
    desc: `${p.excerpt} A plain-language RIIMS kidney-care guide (Baraut, UP).`,
    body: blogPostPage('../', p),
    ld: [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.origin}/blog.html` },
          { '@type': 'ListItem', position: 3, name: p.title, item: `${SITE.origin}${path}` },
        ],
      },
      {
        '@type': 'Article', headline: p.title, description: p.excerpt,
        author: { '@type': 'Organization', name: p.author }, image: `${SITE.origin}/assets/riims-logo.png`,
        publisher: { '@id': `${SITE.origin}/#clinic` }, mainEntityOfPage: `${SITE.origin}${path}`,
        datePublished: isoDate(p.date), dateModified: isoDate(p.date),
        reviewedBy: { '@type': 'Organization', name: 'RIIMS Nephrology Team' },
        inLanguage: 'en-IN', articleSection: p.cat,
      },
      ...(Array.isArray(p.faqs) && p.faqs.length ? [{
        '@type': 'FAQPage',
        mainEntity: p.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }] : []),
    ],
  });
}

/* Patient guide pages (one per guide) */
for (const key of GUIDE_ORDER) {
  const g = GUIDES[key];
  const path = `/${key}.html`;
  pages.push({
    out: `${key}.html`, base: '', path, nav: 'guides.html', mobile: '',
    title: `${g.title} | RIIMS`,
    desc: g.desc,
    body: guidePage('', key),
    ld: [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Patient Guides', item: `${SITE.origin}/guides.html` },
          { '@type': 'ListItem', position: 3, name: g.title, item: `${SITE.origin}${path}` },
        ],
      },
      {
        '@type': 'MedicalWebPage', name: g.title, description: g.desc,
        url: `${SITE.origin}${path}`, inLanguage: 'en-IN', isPartOf: { '@id': `${SITE.origin}/#website` },
      },
      ...(g.faqs && g.faqs.length ? [{
        '@type': 'FAQPage',
        mainEntity: g.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }] : []),
    ],
  });
}

/* Legal / disclaimer pages */
const LEGAL_META = {
  privacy: ['Privacy Policy | RIIMS', 'How RIIMS handles the information you share when you book a consultation or contact us.'],
  terms: ['Terms of Use | RIIMS', 'The terms that apply when you use the RIIMS website and its contact channels.'],
  disclaimer: ['Medical Disclaimer | RIIMS', 'Information on this site is for awareness only and does not replace medical consultation.'],
};
for (const key of LEGAL_KEYS) {
  pages.push({
    out: `${key}.html`, base: '', path: `/${key}.html`, nav: '', mobile: '',
    title: LEGAL_META[key][0], desc: LEGAL_META[key][1], body: legalPage('', key),
  });
}

/* 404 — uses absolute '/' base so its CSS/JS/links work no matter which URL the
   server serves it for. noindex + excluded from the sitemap. */
pages.push({
  out: '404.html', base: '/', path: '/404.html', nav: '', mobile: '', noindex: true,
  title: 'Page not found (404) | RIIMS',
  desc: 'The page could not be found. Browse kidney conditions, the blog, or contact RIIMS, Baraut.',
  body: notFoundPage('/'),
});

/* ---------- Write ---------- */
mkdirSync(join(OUT, 'conditions'), { recursive: true });
mkdirSync(join(OUT, 'blog'), { recursive: true });
for (const p of pages) {
  writeFileSync(join(OUT, p.out), render(p), 'utf8');
}

/* sitemap + robots */
const today = new Date().toISOString().slice(0, 10);
const legalPaths = new Set(['/privacy.html', '/terms.html', '/disclaimer.html']);
const urls = pages.filter((p) => !p.noindex).map((p) => {
  const priority = p.path === '/' ? '1.0'
    : p.path.startsWith('/conditions') ? '0.8'
    : p.path.startsWith('/blog/') ? '0.6'
    : legalPaths.has(p.path) ? '0.3'
    : '0.7';
  return `  <url><loc>${SITE.origin}${p.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
writeFileSync(join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`, 'utf8');

console.log(`Generated ${pages.length} pages + sitemap.xml + robots.txt into /site`);
