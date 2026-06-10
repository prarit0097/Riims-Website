# RIIMS — Kidney Care Website

Production implementation of the **RIIMS — Rashtriya Institute of Integrated Medical Sciences**
kidney-care marketing site, built from the Claude Design handoff
(`RIIMS Design System-handoff.zip`).

It is a **static, SEO-focused multi-page site** — plain HTML/CSS/JS, no framework, no
runtime dependencies. It builds to a `/site` folder you can host on any static host
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, Hostinger, or any web server).

## Why static + multi-page

The brief's top priority is ranking nationally for kidney / Ayurveda searches. A static
multi-page site gives the strongest, simplest SEO footing:

- A real, crawlable URL per page (`/conditions/ckd.html`, `/blog.html`, …)
- Per-page `<title>`, meta description, canonical, Open Graph / Twitter tags
- JSON-LD structured data: `MedicalClinic` + `WebSite` everywhere, `FAQPage` on
  home/contact, and `BreadcrumbList` + `MedicalWebPage` on every condition page
- `sitemap.xml` and `robots.txt`
- Fast loads (no JS framework), great Core Web Vitals

## Pages (25 total)

Home · About · Doctors · Blog · Contact · **8 condition pages**
(High Creatinine, CKD, Kidney Failure, Dialysis, Protein in Urine, Swelling,
Diabetes/BP Kidney Risk, Kidney Stone/UTI) · **9 blog-article pages**
(one URL per post, under `/blog/`) · and **Privacy Policy / Terms / Medical Disclaimer**.

Every link is active — no dead `#` anchors. Each page has its own URL, metadata and
JSON-LD; the sitemap lists all 25.

Interactive (vanilla JS): home disease search, Health Reels, count-up stat strip,
FAQ accordion, blog category filter, newsletter, sticky header, mobile bottom nav,
floating WhatsApp/Call, and a 2-step booking modal.

## Run it

```bash
npm run build     # generate /site from build/*
npm run serve     # preview at http://localhost:5173
npm run dev       # build + serve
```

No dependencies to install — everything uses Node's standard library.

## Deploy

🟢 **LIVE at https://riimshospitals.com** — Hostinger VPS `187.127.132.106`, project at
`/opt/riims`, served by host nginx with Let's Encrypt SSL.

- **Full deployment facts + exact commands:** [RIIMS.md §18](RIIMS.md) (source of truth).
- **Update the live site:** `cd /opt/riims && git pull`.
- Step-by-step runbook + alternatives (Docker/Caddy/Traefik/Apache): [DEPLOY.md](DEPLOY.md).

The site is static, so it serves **1000+ concurrent** from cache (gzip + long-cache). The live
domain is set in `build/data.mjs` → `SITE.origin` (`https://riimshospitals.com`).

## Project structure

```
build/                 # generator (run once; output is static)
  generate.mjs         # entry: composes <head> + chrome around each page, writes /site
  data.mjs             # ALL content (conditions, doctors, posts, FAQs, contact info)
  components.mjs       # low-level UI (button, card, badge, icon, form fields)
  chrome.mjs           # header, footer, mobile bar, booking modal, page hero
  sections.mjs         # page sections (search, reels, conditions, stats, …)
  pages.mjs            # full page bodies
  serve.mjs            # zero-dep local preview server
  check.mjs            # link/asset integrity check  (node build/check.mjs)
site/                  # ← deployable output
  index.html, about.html, doctors.html, blog.html, contact.html
  privacy.html, terms.html, disclaimer.html
  conditions/*.html    # 8 SEO pages
  blog/*.html          # 9 article pages (one per post)
  css/styles.css       # imports tokens + base layer
  css/site.css         # layout, responsive, imagery, component states
  css/tokens/*.css     # design tokens (verbatim from the handoff)
  js/site.js           # interactivity
  assets/              # logo, doctor portraits, reel thumbnails, hospital image
  sitemap.xml, robots.txt
```

## Editing content

All copy and data live in **`build/data.mjs`** — phone number, address, social links
(`SITE`), conditions, doctors, blog posts, FAQs, services, reels. Edit there, then
`npm run build`. Icons come from [Lucide](https://lucide.dev) via CDN; use any Lucide
icon name.

## Caveats / next steps (carried over from the design)

- **Doctor names & photos are mock** placeholders (illustrated portraits). Swap in real
  names, credentials and photos in `build/data.mjs` + `site/assets/doctors/`.
- **Google rating / review counts and patient figures are demo numbers** — replace with
  live Google Business numbers before launch (`build/sections.mjs` → `statsStrip`).
- **Reels and the patient-story video are thumbnails** linking to Instagram; embed real
  reels when available.
- **Blog article bodies are templated** — each post now has its own page (`/blog/<slug>.html`)
  built from the post excerpt plus the vetted, doctor-reviewed copy of its related condition.
  For maximum SEO, replace these with full, original long-form articles over time, then submit
  `sitemap.xml` in Google Search Console and set up a Google Business Profile.
- **Fonts** (Spectral / Plus Jakarta Sans / Mukta) load from Google Fonts — swap for
  licensed files if required.
- **Contact map** is a styled placeholder; drop in a Google Maps embed for the Baraut clinic.

Phone/WhatsApp (`+91 85120 40000`) and the Baraut address are the real values supplied
during design.
