/* RIIMS static-site generator — entry point.
   Composes <head> (SEO + JSON-LD) + chrome (header/footer/mobile/modal) around
   each page body, then writes static HTML + sitemap.xml + robots.txt into /site.
   Run: node build/generate.mjs  (or `npm run build`). */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { header, footer, mobileBar, bookingModal } from './chrome.mjs';
import { homePage, conditionPage, aboutPage, doctorsPage, blogPage, contactPage } from './pages.mjs';
import { CONDITIONS, SITE } from './data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'site');

/* ---------- JSON-LD ---------- */
function clinicGraph() {
  return {
    '@type': 'MedicalClinic',
    '@id': `${SITE.origin}/#clinic`,
    name: 'RIIMS — Rashtriya Institute of Integrated Medical Sciences',
    alternateName: 'RIIMS Baraut',
    description: 'Kidney-focused integrated medical institute offering ethical, doctor-led care for high creatinine, CKD, kidney failure, dialysis guidance, kidney diet and Ayurveda-supported lifestyle care.',
    url: `${SITE.origin}/`,
    logo: `${SITE.origin}/assets/riims-logo.png`,
    image: `${SITE.origin}/assets/riims-logo.png`,
    telephone: '+91-85120-40000',
    medicalSpecialty: ['Nephrology', 'Internal Medicine'],
    priceRange: '₹₹',
    areaServed: { '@type': 'Country', name: 'India' },
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
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}" />
  ${p.keywords ? `<meta name="keywords" content="${p.keywords}" />` : ''}
  <meta name="author" content="RIIMS — Rashtriya Institute of Integrated Medical Sciences" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#0a6168" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/png" href="${p.base}assets/riims-logo-sm.png" />
  <meta property="og:type" content="${p.path === '/' ? 'website' : 'article'}" />
  <meta property="og:site_name" content="RIIMS — Integrated Kidney Care" />
  <meta property="og:title" content="${p.title}" />
  <meta property="og:description" content="${p.desc}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImg}" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${p.title}" />
  <meta name="twitter:description" content="${p.desc}" />
  <meta name="twitter:image" content="${ogImg}" />
  ${ldScript(graph)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${p.base}css/styles.css" />
  <link rel="stylesheet" href="${p.base}css/site.css" />
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>
  <script src="${p.base}js/site.js" defer></script>
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
    desc: 'RIIMS — Rashtriya Institute of Integrated Medical Sciences, Baraut (UP). Ethical, doctor-led kidney care for high creatinine, CKD, kidney failure, dialysis guidance, kidney diet and report review, with Ayurveda-supported integrated lifestyle care.',
    keywords: 'kidney care, high creatinine treatment, CKD, chronic kidney disease, kidney failure, dialysis guidance, kidney diet chart, ayurvedic kidney care, integrated kidney treatment, nephrologist Baraut, kidney specialist Uttar Pradesh, protein in urine, creatinine reduce, second opinion kidney, RIIMS',
    body: homePage(''), ld: [FAQ_GRAPH],
  },
  {
    out: 'about.html', base: '', path: '/about.html', nav: 'about.html', mobile: '',
    title: 'About RIIMS | Ethical Integrated Kidney Care in Baraut, UP',
    desc: 'About RIIMS — a kidney-focused institute for ethical, evidence-aware, report-based care, combining nephrology with Ayurveda-supported lifestyle guidance in Baraut, Uttar Pradesh.',
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
    desc: 'Honest, doctor-aligned articles on high creatinine, CKD, dialysis guidance, kidney diet and Ayurveda-supported integrated care — plain-language education for patients across India.',
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
    title: `${c.title} | Causes, Symptoms & Care — RIIMS Baraut`,
    desc: `${c.intro} Doctor-led, report-based guidance at RIIMS, Baraut (UP).`,
    keywords: `${c.title.toLowerCase()}, kidney care, nephrologist Baraut, ${slug.replace(/-/g, ' ')}, integrated kidney treatment`,
    body: conditionPage('../', slug),
    ld: [breadcrumb(c.crumb, `${SITE.origin}${path}`), {
      '@type': 'MedicalWebPage', name: c.title, description: c.intro, url: `${SITE.origin}${path}`,
      about: { '@type': 'MedicalCondition', name: c.title }, inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE.origin}/#website` },
    }],
  });
}

/* ---------- Write ---------- */
mkdirSync(join(OUT, 'conditions'), { recursive: true });
for (const p of pages) {
  writeFileSync(join(OUT, p.out), render(p), 'utf8');
}

/* sitemap + robots */
const urls = pages.map((p) => {
  const priority = p.path === '/' ? '1.0' : p.path.startsWith('/conditions') ? '0.8' : '0.7';
  return `  <url><loc>${SITE.origin}${p.path}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
writeFileSync(join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`, 'utf8');

console.log(`Generated ${pages.length} pages + sitemap.xml + robots.txt into /site`);
