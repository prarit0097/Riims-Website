/* RIIMS static-site generator — entry point.
   Composes <head> (SEO + JSON-LD) + chrome (header/footer/mobile/modal) around
   each page body, then writes static HTML + sitemap.xml + robots.txt into /site.
   Run: node build/generate.mjs  (or `npm run build`). */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { header, footer, mobileBar, bookingModal } from './chrome.mjs';
import { homePage, conditionPage, aboutPage, doctorsPage, blogPage, contactPage, blogPostPage, legalPage, notFoundPage, LEGAL_KEYS } from './pages.mjs';
import { esc } from './components.mjs';
import { CONDITIONS, POSTS, SITE } from './data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'site');

/* Asset version: content hash of all CSS/JS. Appended as ?v= to asset URLs so
   browsers (30-day cache) pick up changes immediately after a deploy. */
const ASSET_FILES = [
  'css/tokens/fonts.css', 'css/tokens/colors.css', 'css/tokens/typography.css',
  'css/tokens/spacing.css', 'css/tokens/base.css', 'css/site.css', 'js/site.js',
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
    sameAs: [SITE.facebook, SITE.instagram],
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

/* ---------- <head> ---------- */
function head(p) {
  const url = `${SITE.origin}${p.path}`;
  const graph = [clinicGraph(), websiteGraph(), ...(p.ld || [])];
  const ogImg = `${SITE.origin}/assets/riims-logo.png`;
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}" />
  ${p.keywords ? `<meta name="keywords" content="${esc(p.keywords)}" />` : ''}
  <meta name="author" content="RIIMS — Rashtriya Institute of Integrated Medical Sciences" />
  <meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
  <meta name="theme-color" content="#0a6168" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/png" href="${p.base}assets/riims-logo-sm.png" />
  <link rel="apple-touch-icon" href="${p.base}assets/riims-logo-sm.png" />
  <link rel="manifest" href="${p.base}site.webmanifest" />
  <meta property="og:type" content="${p.path === '/' ? 'website' : 'article'}" />
  <meta property="og:site_name" content="RIIMS — Integrated Kidney Care" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImg}" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)}" />
  <meta name="twitter:description" content="${esc(p.desc)}" />
  <meta name="twitter:image" content="${ogImg}" />
  ${ldScript(graph)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${p.base}css/tokens/fonts.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/colors.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/typography.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/spacing.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/tokens/base.css?v=${V}" />
  <link rel="stylesheet" href="${p.base}css/site.css?v=${V}" />
  <script src="${p.base}assets/vendor/lucide.min.js" defer></script>
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
    out: 'index.html', base: '', path: '/', nav: 'home', mobile: 'home',
    title: 'RIIMS Baraut | Kidney Care, High Creatinine, CKD & Dialysis Guidance',
    desc: 'Ethical, doctor-led kidney care in Baraut, UP — high creatinine, CKD, dialysis guidance, kidney diet & report review, with integrated Ayurveda support.',
    keywords: 'kidney care, high creatinine treatment, CKD, chronic kidney disease, kidney failure, dialysis guidance, kidney diet chart, ayurvedic kidney care, integrated kidney treatment, nephrologist Baraut, kidney specialist Uttar Pradesh, protein in urine, creatinine reduce, second opinion kidney, RIIMS',
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
    keywords: 'kidney blog, high creatinine, CKD diet chart, dialysis myths, ayurvedic kidney care, kidney diet hindi, proteinuria, diabetic kidney disease',
    body: blogPage(''),
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
    title: `${c.title} — Symptoms & Care | RIIMS Baraut`,
    desc: `${c.intro} Doctor-led, report-based kidney care at RIIMS, Baraut, UP.`,
    keywords: `${c.title.toLowerCase()}, kidney care, nephrologist Baraut, ${slug.replace(/-/g, ' ')}, integrated kidney treatment`,
    body: conditionPage('../', slug),
    ld: [breadcrumb(c.crumb, `${SITE.origin}${path}`), {
      '@type': 'MedicalWebPage', name: c.title, description: c.intro, url: `${SITE.origin}${path}`,
      about: { '@type': 'MedicalCondition', name: c.title }, inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE.origin}/#website` },
    }],
  });
}

/* Blog article pages (one per post) */
for (const p of POSTS) {
  const path = `/blog/${p.slug}.html`;
  pages.push({
    out: `blog/${p.slug}.html`, base: '../', path, nav: 'blog.html', mobile: '',
    title: `${p.title} | RIIMS Kidney Care Blog`,
    desc: `${p.excerpt} A plain-language RIIMS kidney-care guide (Baraut, UP).`,
    keywords: `${p.cat.toLowerCase()}, kidney care, ${p.title.toLowerCase()}, RIIMS Baraut`,
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
        inLanguage: 'en-IN', articleSection: p.cat,
      },
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
