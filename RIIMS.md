# RIIMS.md — The Complete Guide to This Project

This file explains **everything** about the RIIMS website: what it is, why it exists, and
exactly how it works — design, build system, data, wiring, interactivity, SEO and deployment.
If you are new here, read this top to bottom and you will understand the whole project.

> Maintenance rule: per [CLAUDE.md](CLAUDE.md), **every change to this project must be
> reflected here**, down to the smallest detail.

---

## 1. What is this project?

A **website for RIIMS — Rashtriya Institute of Integrated Medical Sciences**, a kidney-focused
medical institute in **Baraut, Uttar Pradesh, India**. RIIMS provides ethical, doctor-led,
report-based kidney care: high creatinine, CKD (chronic kidney disease), kidney failure,
dialysis guidance, kidney diet, and Ayurveda-supported integrated lifestyle care.

The website is a **marketing + patient-education + lead-generation site**. Its jobs:
1. Help patients/families understand kidney conditions in plain language.
2. Build trust (ethical, no false promises, real doctors, local clinic).
3. Convert visitors into consultations (Book / WhatsApp / Call / Upload reports).
4. **Rank on Google across India** for kidney/Ayurveda searches (SEO is a top priority).

## 2. Why does it exist / where did it come from?

The owner designed the look-and-feel using **Claude Design** (claude.ai/design) and exported a
**handoff bundle** (`RIIMS Design System-handoff.zip`, kept locally, git-ignored). That bundle
was a React/Babel prototype. This repository is the **real, production implementation** of that
approved design.

## 3. Tech choice and why

**Static multi-page site — plain HTML/CSS/JS, no framework, no runtime dependencies.**

Why this stack (the owner's #1 goal is national SEO ranking + easy, cheap hosting):
- **Real URL per page** (`/conditions/ckd.html`, `/blog/<slug>.html`) → strongest SEO base.
- **Per-page metadata + JSON-LD + sitemap/robots** → rich results, local pack, crawlability.
- **No JS framework** → fast loads, great Core Web Vitals, hostable on any cheap static host.
- **No build dependencies** → only Node's standard library; `npm install` installs nothing.

The HTML is produced by a small **Node generator** (in `build/`) and written to `site/`.
`site/` is the deployable website. The generator exists so the pages stay DRY (shared
header/footer/chrome never drift) while the deployed output is 100% static.

## 4. High-level architecture

```
   build/*.mjs  (Node generator: data + components + page templates)
        │  node build/generate.mjs   (a.k.a. npm run build)
        ▼
   site/        (generated, deployable static website — HTML/CSS/JS/assets)
        │  upload anywhere (Netlify, Vercel, GitHub Pages, Hostinger, any web server)
        ▼
   live site
```

- **Edit the generator** (`build/`), never the generated HTML in `site/`.
- Run `npm run build` to regenerate `site/`. Commit both `build/` and the regenerated `site/`.
- `npm test` = build + integrity checks (must pass before pushing — see [CLAUDE.md](CLAUDE.md)).

## 5. Directory structure

```
RiimS/
├── CLAUDE.md                 # project rules (read first)
├── RIIMS.md                  # this file — full documentation
├── README.md                 # short readme / quick start / deploy
├── package.json              # scripts: build, serve, dev, check, test  (type: module, no deps)
├── .gitignore                # ignores node_modules, the handoff zip, tooling artifacts
│
├── build/                    # ── THE GENERATOR (source of truth) ──
│   ├── generate.mjs          # entry: builds <head> (SEO+JSON-LD) + chrome around each page,
│   │                         #   defines the page manifest, writes site/, sitemap, robots
│   ├── data.mjs              # ALL content: SITE info, NAV, conditions, doctors, posts, FAQs,
│   │                         #   services, reels, testimonials, search DB
│   ├── components.mjs        # low-level UI primitives → HTML strings (button, card, badge,
│   │                         #   icon, form fields, eyebrow, sectionHead, infoList, disclaimer)
│   │                         #   + s() style serializer + esc() HTML escaper
│   ├── chrome.mjs            # header, footer, mobile bottom bar, floating contact, booking
│   │                         #   modal, page hero, single-step appointment form
│   ├── sections.mjs          # page sections (search banner, reels, conditions grid, stats,
│   │                         #   complete care, why, how, doctors, experts, blog cards,
│   │                         #   testimonials, FAQ, CTA band, contact)
│   ├── pages.mjs             # full page bodies (home, condition, about, doctors, blog,
│   │                         #   contact, blog-article, legal)
│   ├── serve.mjs             # zero-dependency local preview server (port 5173)
│   ├── check.mjs             # integrity tests: links, assets, JSON-LD, <h1>, meta, dead anchors, stale domain
│   └── optimize-images.mjs   # one-shot raster optimizer (WebP + shrunk logo/hero); needs dev-only `sharp`
│
├── admin/                    # ── ADMIN PANEL (see §23) ──
│   ├── server.mjs            # zero-dep Node server: leads API, content CRUD, uploads, rebuild
│   ├── set-password.mjs      # one-time: set admin password (writes data/admin-config.json)
│   └── ui/                   # the /admin/ panel (index.html + admin.js + admin.css)
├── data/                     # ── CONTENT + RUNTIME DATA ──
│   ├── content.json          # admin-editable content defaults (in git)
│   ├── content.local.json    # VPS admin edits — overrides content.json (GITIGNORED)
│   ├── leads.json            # stored appointment leads (GITIGNORED)
│   └── admin-config.json     # admin password hash + session secret (GITIGNORED)
├── docker-compose.admin.yml  # runs the admin server in Docker on 127.0.0.1:5500
├── docker-compose.yml        # alt: site as a container behind Traefik (not used)
├── deploy/                   # ── DEPLOYMENT (see DEPLOY.md) ──
│   ├── docker/nginx.conf     # in-container nginx (gzip, cache, headers, CSP, clean URLs, 404)
│   ├── nginx-riimshospitals.conf   # alt: system nginx server block (if not using Docker)
│   ├── apache-riimshospitals.conf  # alt: Apache vhost
│   └── update.sh             # VPS update helper (git pull, isolated)
├── DEPLOY.md                 # step-by-step VPS runbook (Hostinger Docker+Traefik; GoDaddy DNS)
│
└── site/                     # ── GENERATED OUTPUT (the deployable website) ──
    ├── index.html            # home
    ├── about.html  doctors.html  blog.html  contact.html
    ├── privacy.html  terms.html  disclaimer.html
    ├── conditions/           # 15 condition/SEO pages
    │   ├── high-creatinine.html  high-creatinine-without-dialysis.html  ckd.html  stage-3-ckd.html
    │   │   stage-4-ckd.html  kidney-failure.html  kidney-disease-treatment.html  dialysis.html
    │   ├── proteinuria.html  kidney-swelling-treatment.html  diabetic-kidney-disease.html
    │   └── hypertensive-kidney-disease.html  kidney-stone-treatment.html  uti-treatment.html  laser-kidney-stone-treatment.html
    ├── blog/                 # 9 blog-article pages (one per post)
    │   └── <slug>.html × 9
    ├── css/
    │   ├── styles.css        # entry: @imports all tokens + base layer
    │   ├── site.css          # layout, responsive rules, background imagery, component states
    │   └── tokens/           # design tokens (verbatim from the design handoff)
    │       ├── fonts.css     # @import Google Fonts (Spectral, Plus Jakarta Sans, Mukta)
    │       ├── colors.css    # color palette + semantic aliases
    │       ├── typography.css# font families, fluid type scale, weights, tracking
    │       ├── spacing.css   # spacing/radius/shadow/layout/motion/z-index tokens
    │       └── base.css      # element resets + shared primitives + button/card hover states
    ├── js/site.js            # all client interactivity (no dependencies)
    │   └── (generated) search-data.js (admin-driven search dataset), gtag.js (if Tag ID set)
    ├── assets/               # logo (PNG for social/favicon), + WebP: hero banners
    │   │                     #   (banner-1..4.webp + banner-1.jpg for og/LCP), doctor
    │   │                     #   portraits, reels, hospital, video — optimized by build/optimize-images.mjs
    │   └── vendor/lucide.min.js   # self-hosted, pinned Lucide (no CDN)
    ├── 404.html              # branded not-found page (absolute paths; served by web server)
    ├── site.webmanifest      # PWA manifest (name, icons, theme color)
    ├── .htaccess             # Apache caching/gzip/headers/clean-URLs/404 (ignored by nginx)
    ├── sitemap.xml           # all 43 indexable URLs with lastmod/priority (404 excluded)
    └── robots.txt            # allows all, points to sitemap
```

## 6. How the build works (`build/generate.mjs`)

`generate.mjs` is the orchestrator:

1. **Imports** content (`data.mjs`), the chrome (`chrome.mjs`), and page bodies (`pages.mjs`).
2. Defines `head(p)` → returns the full `<head>`: title, description, keywords, canonical,
   Open Graph + Twitter tags, favicon, theme-color, **JSON-LD**, font preconnects, the six
   CSS files (linked directly, each with a `?v=<content-hash>` cache-buster so deployed
   asset changes bypass the 30-day browser cache), the self-hosted Lucide script, and
   `js/site.js?v=<hash>`. All text values are run
   through `esc()` so characters like `&` are valid in attributes. The **meta description**
   is passed through `clampDesc()` → trimmed to ≤155 chars on a word boundary (+`…`) so it
   never overflows the SERP snippet; the fuller text still lives in the JSON-LD `description`.
   The home page **preloads `assets/banner-1.webp`** (`type="image/webp"`, via the `preload`
   manifest field) for a fast LCP; the favicon/apple-touch/manifest icon stays PNG
   (`riims-logo-sm.png`).
3. Defines `render(p)` → `head(p)` + `<body>` = `header` + `<main>{page body}</main>` +
   `footer` + `mobileBar` + `bookingModal`.
4. Builds a **page manifest** (`pages[]`). Each entry has: `out` (output path), `base` (relative
   prefix: `''` for root pages, `'../'` for pages in `conditions/` and `blog/`), `path` (URL),
   `nav`/`mobile` (active-state hints), `title`, `desc`, optional `keywords`, `body` (HTML), and
   optional `ld` (extra JSON-LD).
   - 9 core pages (home, kidney-diseases hub, treatments/services, **DNA Kayakalp Protocol**, **Patient Guides hub**, about, doctors, blog, contact)
   - 15 condition pages (looped over `CONDITIONS`)
   - 9 blog-article pages (looped over `POSTS`)
   - **7 patient-guide pages** (looped over `GUIDE_ORDER` in `build/guides.mjs`)
   - 3 legal pages (privacy, terms, disclaimer)
   → **43 indexable pages** (+ a branded 404 = **44 files written**).
5. Writes every page to `site/`, then writes `sitemap.xml` (with `<lastmod>` = build date and
   per-type `<priority>`) and `robots.txt`. It also emits **`site/js/search-data.js`**
   (`window.__RIIMS_SEARCH__`) — the admin-driven dataset (real doctor/posts/reel) that powers
   the home disease-search results (see §8) — and `js/gtag.js` if a Google Tag ID is set.

Run it: `npm run build`. It logs `Generated 44 pages + sitemap.xml + robots.txt into /site`.

### The `base` prefix system (how relative paths stay correct)
Root pages link assets as `css/styles.css`, `assets/...`, `about.html`. Pages inside a
subfolder (`conditions/`, `blog/`) use `../css/styles.css`, `../assets/...`,
`../conditions/ckd.html`. The generator threads a `base` string (`''` or `'../'`) into every
component that emits a link or asset reference, so the same code produces correct paths at any
depth. The single `site.css` references images as `url('../assets/...')` (relative to
`site/css/`), which resolves correctly for every page regardless of depth.

## 7. The component layer (`build/components.mjs`)

Pure functions that return HTML strings. Key helpers:

- **`s(styleObject)`** — serializes a React-style style object (camelCase keys) into a CSS
  string (kebab-case), appending `px` to unitless numbers except known unitless props
  (`fontWeight`, `lineHeight`, `opacity`, `zIndex`, `order`, `flex…`, `strokeWidth`) and `0`.
  This let us port the prototype's inline styles **verbatim** → pixel-faithful output.
- **`esc(str)`** — escapes `& < > "` for safe HTML/attribute output.
- **`icon(name, {size, style})`** — renders a Lucide icon as `<i data-lucide aria-hidden>`
  (turned into SVG by `site.js`). Facebook/Instagram/YouTube are inline SVG (not in the pinned Lucide).
- **`star()/starRow()`** — inline gold star SVGs (used for ratings; reliable fill).
- **`logo(base, {light})`** — the brand mark (CSS background image `riims-logo-sm.png`),
  links to home; `light` = white chip for the dark footer.
- **`button(children, {variant, size, iconLeft/Right, fullWidth, href, extraAttrs})`** —
  variants: `primary, secondary, whatsapp, outline, ghost, white`. `extraAttrs:{ 'data-book': true }`
  makes a button open the booking modal.
- **`iconButton`, `badge`, `card`** — `card` supports `tone`, `pad`, `hover`, `accent`.
- **Form fields:** `input`, `select`, `checkbox` (styled), used by the appointment form.
- **`eyebrow`, `sectionHead`, `infoList`, `disclaimer`** — section building blocks.

## 8. The data layer (`build/data.mjs` + `data/content.json`)

**Admin-editable content** lives in **`data/content.json`**; on the VPS the admin panel writes
overrides to `data/content.local.json` (gitignored; the admin file **replaces each section wholesale**,
so admin edits, additions, deletions and re-orders all apply — admin is fully authoritative. **One
narrow exception:** for `posts`, an empty `body`/`faqs`/`refs`/`relatedPosts` is filled from the
matching repo post, so repo-authored blog content is never wiped when the admin copy leaves those
fields blank). `build/data.mjs` reads/merges both and derives the phone formats.

The **17 admin sections** (mirror of `SECTIONS` in `admin/server.mjs`) are: `site` (numbers + business
info + social), `tracking`, `stats`, `storyVideo`, `doctors`, `reels`, `testimonials`, `faqs`, `posts`,
`search`, `cta`, `protocol`, `services`, `why`, `steps`, `about`, `legal`. Each has a `/admin/` tab
(see §23). For sections with a code default (`cta`, `services`, `why`, `steps`, `protocol`, `about`,
`legal`, `search`), an absent/empty value falls back to the default baked into `data.mjs`/`pages.mjs`,
so the site always renders.

**Still code-only** (owner chose to keep these in code for SEO/medical quality — see §19): the 8
condition pages (`CONDITIONS`), the 7 patient guides (`build/guides.mjs` + `build/guides/*.md`), the
`NAV` links, footer link columns, and the medical disclaimers. Edit content via `/admin/` on the live
site, or via `data/content.json` in the repo.

- **`SITE`** — name, fullName, `origin` (**`https://riimshospitals.com`** — the production
  domain; non-www is canonical, the server 301-redirects www → apex), `phone`
  `+91 85120 40000`, `phoneTel` `+918512040000`, `waNumber` (`918512040000`, for wa.me deep
  links), `whatsapp`, `facebook`, `instagram`, `youtube`, `city` (`Baraut, Uttar Pradesh 250611`),
  `addressLine`, `addressSub`, `hours` (`Mon–Sat, 9am–7pm`), `geo` ({lat,lng} — Baraut clinic,
  **verify against the Google Business Profile**), `mapsQuery`/`mapsLink` (contact-page map +
  schema `hasMap`), `serviceCities` (Baraut/Baghpat/Meerut/Shamli → schema `areaServed`), `year`
  (auto = current year). **Most of `SITE` is now admin-editable** (Admin → Settings): email, social
  (blank = hide the icon + drops from JSON-LD `sameAs`), city, address lines, hours, maps link, service
  cities and geo lat/lng — read from `content.json → site.*` with the values above as fallbacks.
- **`CTA`** (admin `content.json → cta`, Admin → Settings) — the site-wide call-to-action band copy
  (`eyebrow`, `title`, `intro`, `bookLabel`, `whatsappLabel`); **`PROTOCOL.faqs`** (admin
  `content.json → protocol.faqs`, Admin → Protocol FAQs) — the DNA Kayakalp Protocol page FAQs
  (`[{q,a}]`; empty = built-in defaults), driving both the visible block and the FAQPage schema.
- **`NAV`** — the 7 header links (About, Kidney Diseases, Treatments, Guides, Doctors, Blog, Contact).
- **`CONDITIONS`** — the 15 condition pages, each with: `icon`, `title`, `crumb`, `intro`,
  `aboutTitle`, `about`, `symptoms[]`, `approach[]`, `when`, `related[]`. Slugs:
  `high-creatinine, ckd, kidney-failure, dialysis, proteinuria, swelling, diabetes-bp, stone-uti`.
- **`PROBLEMS`** — the home "conditions we help with" grid (links to the main condition pages).
- **`WHY`, `STEPS`** — "Why RIIMS" cards + "How consultation works" steps. **Admin-editable**
  (Admin → Why RIIMS / How it works; `content.json → why` / `steps`; empty = code defaults; `STEPS`
  numbering `n` is auto by order). **`SERVICES`** likewise (Admin → Services; `content.json → services`).
- **`DOCTORS`** (3), **`DOCTORS_FULL`** (6, doctors page), **`EXPERTS`** (5, home carousel).
- **`POSTS`** — the 9 blog posts. Each has `slug` (→ `/blog/<slug>.html`), `related` (a
  condition slug used to build the article body), `cat`, `title`, `excerpt`, `time`, `tone`,
  `date`, `author`, optional `img`.
- **`POPULAR_TOPICS`** — SEO keyword chips on the blog page.
- **`TESTIMONIALS`** (Baraut/Baghpat/Meerut), **`FAQS`** (5), **`REELS`** (6),
  **`SERVICES`** (11, "Complete Care").
- **`SEARCH`** (`data/content.json` → `search.topics`, admin-editable) — **fully controls the home
  disease-search widget** (Admin → **Search widget** tab, see §23). Each topic has: `label` (the
  Popular chip + result badge text), `keywords` (comma-separated match terms), `popular` (show as a
  Popular chip), `blogSlugs` (which posts appear as "Related articles"), `doctor` (a specific doctor
  **name**, `"RIIMS Care Team"`, or `''` = auto-pick the nephrologist / first doctor) and `reel` (a
  specific reel **title**, or `''` = first reel). The generator resolves these against the REAL merged
  content and writes **`site/js/search-data.js`** (`window.__RIIMS_SEARCH__` = `{popular, care, topics[]}`),
  and renders the Popular chips (`searchBanner`) from the `popular` topics. `site.js` matches a query
  to a topic via its `keys` and shows that topic's blogs/specialist/video. So editing the Search tab —
  or adding/removing a doctor, blog or reel — flows into search on the next rebuild; removed items drop
  out. A tiny `FALLBACK_TOPICS` in `site.js` covers the case where `search-data.js` didn't load (HTML
  opened from disk). *(The old `HEALTH_DB`/`POPULAR` in `data.mjs`/`site.js` are now legacy fallbacks.)*

## 9. Chrome (`build/chrome.mjs`)

Global UI wrapped around every page by the generator:

- **`header(base, current)`** — sticky top. A dark utility bar (phone, address, hours,
  WhatsApp, Facebook, Instagram, YouTube) + the main nav (logo, 7 links, Call icon, WhatsApp Now +
  Book Consultation buttons — "Upload Reports" was removed sitewide by owner request). On
  tablet/mobile the text nav collapses (CSS) and a mobile group
  shows Call + WhatsApp icons. Active nav state: the matching link is highlighted; on any
  condition page the "Kidney Diseases" link is highlighted.
- **`footer(base)`** — dark footer: brand + social, three link columns (Conditions = all 8,
  Care, Institute), a medical disclaimer, copyright, and **Privacy / Terms / Disclaimer** links
  (→ the real legal pages).
- **`mobileBar(base, current)`** — fixed bottom nav on phones: Home · Doctors · (raised) Book ·
  WhatsApp · Call (Apollo-style).
- **`floatingContact()`** — fixed WhatsApp + Call FAB (desktop/tablet; hidden on phones where
  the bottom bar covers it). Rendered on the home page.
- **`bookingModal()`** — hidden dialog containing the appointment form; opened by any
  `[data-book]` control, closed by the ✕, overlay click, or Esc.
- **`pageHero(base, {crumb, title, intro, icon})`** — the breadcrumb + H1 hero for inner pages.
- **`appointmentForm()`** — single-step form: Name + Phone + Problem/Disease (**kidney-first**
  `PROBLEM_OPTIONS`: high creatinine, CKD, dialysis, kidney failure, proteinuria, swelling, diabetes+kidney,
  BP+kidney, stone/UTI, Other — no off-brand non-kidney options) + consent →
  success state. Toggled by `site.js` via the `hidden` attribute (CSS
  `[hidden]{display:none!important}` guarantees only the active view shows).

## 10. Sections (`build/sections.mjs`)

Reusable content sections (composed into pages): `searchBanner` (the **full-width hero banner slider** —
**admin-managed** `BANNERS` slides (Admin → Home Banners; image + alt + optional link) auto-rotating at the
admin `BANNER_SPEED` (via `data-interval`), cross-fade + prev/next arrows + dots (arrows/dots only with >1
slide), driven by `site.js`; first slide is LCP-priority, rest lazy; any image size cover-fills the fixed 1920×400
frame — followed by the search box + Popular chips from admin `SEARCH`),
`healthReels` (horizontal video-thumbnail cards, each links to Instagram), `problemsSection`
(8 condition cards), `statsStrip` (Google rating + 4 count-up stats, admin `STATS`), `completeCare` (11
services, admin `SERVICES`), `whyRiims` (admin `WHY`), `howItWorks` (admin `STEPS`), `doctorsSection`
+ `doctorCard`, `meetExperts` + `expertCard` (horizontal), `educationSection` + `blogCard` (cards link
to `/blog/<slug>.html`), `testimonials` (+ video), `faqSection` (accordion, first item open),
`ctaBand` (teal gradient, copy from admin `CTA`), `contactSection` (form + map placeholder + contact
cards). Sections marked "admin X" read their content/copy from the admin-editable data (see §8/§23).

## 11. Pages (`build/pages.mjs`)

Each function returns a full page body:
- **`homePage`** — order: Search → Health Reels → Conditions grid → Stats strip → Complete Care
  → Why RIIMS → How it works → Meet Experts → Education (blog preview) → Testimonials → FAQ →
  CTA band → Contact → floating contact. (This exact order is the owner's approved final layout.)
- **`conditionPage(base, slug)`** — page hero + two-column layout: main (about, symptoms split
  into two lists, "How RIIMS approaches it" card, when-to-consult, disclaimer) + sticky aside
  (Book/WhatsApp/Upload card + Related topics) + CTA band.
- **`aboutPage`** — hero + story + values + doctors section + CTA. **Admin-editable** (Admin → About;
  `DEFAULT_ABOUT` in `pages.mjs` merged with `content.json → about`).
- **`doctorsPage`** — hero + 6 doctor cards + CTA.
- **`blogPage`** — hero + category filter + featured post + 9 cards (filtered client-side) +
  popular-topic chips + newsletter + CTA.
- **`blogPostPage(base, p)`** — one per post: hero, article meta, lead, then the **full article body**
  from `POSTS[].body` (rendered by `renderBody`: blank-line paragraphs; `## `/`### ` headings; `- ` → `<ul>`;
  `1.` → `<ol>`; `> ` → blockquote; markdown `| a | b |` tables → `<table>`; inline `**bold**`/`*italic*`/`` `code` ``/
  `[text](url)` links). If a post has no body it falls back to the related condition's vetted copy. After the
  body it renders **per-post FAQs** (`POSTS[].faqs`), the disclaimer, a **Sources & further reading** block
  (`POSTS[].refs`), a CTA card, and **topic-specific "Related reading"** (`POSTS[].relatedPosts`, falling back
  to recent posts). All 9 bodies are deep, audit-driven *Kidney Kavach* articles (report tables, level/ACR/HD-vs-PD
  tables, myth-vs-fact tables, diet charts, FAQs, references). Each blog page also carries `Article` (with
  `reviewedBy`) + `FAQPage` JSON-LD.
- **`protocolPage(base)`** — the **DNA Kayakalp Protocol™** page: hero + "What is it" (D-N-A pillar cards)
  + the three pillars (D: Kidney Mapping 7 domains, root cause, safe detox; N: LDP Protocol™, RiiMS Renal
  Plate ½+¼+¼, 10 nephrotoxins, 7-therapy Panchakarma Support Framework; A: activation & adaptive care) +
  how-it-works + `PROTOCOL_FAQS` + disclaimer + CTA. Exported `PROTOCOL_FAQS` also drives the page's
  FAQPage JSON-LD in `generate.mjs`. The **FAQs are admin-editable** (Admin → Protocol FAQs;
  `content.json → protocol.faqs`, empty = the vetted defaults). The pillar prose stays code-only.
- **`guidesHubPage(base)` / `guidePage(base, key)`** — the Patient Guides library (see §25). One page per
  entry in `GUIDES` (`build/guides.mjs`), body loaded from `build/guides/<key>.md` and rendered by
  `renderBody`, plus per-guide FAQs, related conditions and cross-links. The hub (`/guides.html`) lists all
  7 guides + the DNA Kayakalp Protocol.
- **`contactPage`** — hero + contact section + FAQ.
- **`legalPage(base, key)`** — privacy / terms / disclaimer. `DEFAULT_LEGAL` in `pages.mjs` merged with
  **admin edits** (`content.json → legal`, Admin → Legal pages); a fully-empty page falls back to its
  default so required legal copy can't be blanked. Legal contact lines are templated from `SITE` (phone/
  address stay in sync when the admin changes the number).

## 12. CSS system

Loaded per page as two stylesheets: `css/styles.css` then `css/site.css`.

- **`tokens/`** (design tokens, unchanged from the handoff):
  - `colors.css` — palette (deep blue, kidney green, **Apollo-style teal = brand primary
    `--brand-primary: var(--teal-600) #0a6168`**, cream) + semantic aliases
    (`--surface-*`, `--text-*`, `--border-*`, `--icon-*`).
  - `typography.css` — families (`--font-display: Spectral`, `--font-sans: Plus Jakarta Sans`,
    `--font-hindi: Mukta`), fluid `--fs-*` scale, weights, tracking.
  - `spacing.css` — `--space-*`, section rhythm, **radii** (soft/rounded), **shadows** (soft,
    medical-clean), layout (`--container-max: 1200px`, `--header-h`), motion easings, z-index.
  - `fonts.css` — `@import` Google Fonts.
  - `base.css` — resets, headings use the display serif, `.riims-container`, `.riims-eyebrow`,
    `.riims-btn`/`.riims-card--hover` interaction states, reduced-motion handling.
- **`styles.css`** — just `@import`s the five token files (the single CSS entry point).
- **`site.css`** — page-level concerns: smooth scroll, input/checkbox/select states,
  `[hidden]{display:none!important}` (makes the form steps + newsletter success toggle
  correctly), `.riims-btn--white:hover`, booking-modal `.is-open`, the `.riims-logo-mark`
  logo background + `.img-cover` helper (content images — reels, doctor portraits, hospital,
  video, blog covers — are now real `<img>` tags with `alt`/`loading="lazy"`), reel hover animation,
  the **responsive breakpoints** (≤1024 tablet: collapse grids + switch to mobile nav; ≤760
  phone: single column, show bottom bar, hide FAB; ≤480 small phone: tighter rhythm).

Styling approach: components emit inline styles (ported faithfully from the prototype via
`s()`); CSS files handle only what inline styles can't (hover/focus, media queries, background
images, the `[hidden]` rule).

## 13. JavaScript interactivity (`site/js/site.js`)

One dependency-free IIFE. Lucide is loaded from the **self-hosted** `assets/vendor/lucide.min.js`
(no CDN); `site.js` calls `lucide.createIcons()` on load and after injecting dynamic markup. Features:

- **Booking modal** — `[data-book]` opens it (delegated click), `[data-modal-close]`/overlay/
  Esc close it; body scroll locked while open.
- **Appointment form (single step)** — `[data-apptform]`: **Name + Phone + Problem/Disease
  select** + consent (+ hidden honeypot). On submit, `postLead()` POSTs to `/api/lead` →
  stored by the admin server, managed in the `/admin/` Leads tab (see §23) — **no WhatsApp
  redirect** (owner request: leads go only to the admin panel). Success screen confirms a
  call-back. In local dev (no admin server) the POST fails silently; the form still shows
  the confirmation.
- **Select placeholder color** — adds `has-value` when a real option is chosen.
- **FAQ accordion** — `[data-faq]` items; clicking a question opens it (and closes siblings),
  rotates the chevron, animates `grid-template-rows: 0fr→1fr`.
- **Disease search** — `resolveTopic()` maps the query to a topic; the "Specialist / Related
  articles / video" cards are populated from **`window.__RIIMS_SEARCH__`** (generated
  `js/search-data.js`, admin-driven — real doctor/posts/reel), falling back to the embedded
  `HEALTH_DB` defaults if absent. The search form / popular chips
  render a results block (related articles + a specialist card + a video card) into
  `[data-search-results]`. "No match" offers to contact the care team.
- **Blog category filter** — `[data-blog-cat]` buttons show/hide the featured post + filter
  cards by `data-cat` (the first card is the featured duplicate, hidden under "All").
- **Newsletter** — on submit, swaps the form for a "Subscribed — thank you!" state.
- **Count-up stats** — `[data-countup]` animate from 0 when scrolled into view
  (IntersectionObserver; supports decimals, Indian grouping, suffix).

## 14. Page inventory (43 indexable URLs + a 404)

| URL | Page | Notes |
|-----|------|-------|
| `/` | Home | search-first, FAQ + clinic JSON-LD |
| `/conditions/` | Kidney Diseases hub | conditions grid + FAQ + breadcrumb schema (nav "Kidney Diseases") |
| `/services.html` | Treatments & Services hub | 11 service tiles + how-it-works + DNA Kayakalp banner (nav "Treatments") |
| `/dna-kayakalp-protocol.html` | DNA Kayakalp Protocol™ | Full D-N-A framework (Kidney Kavach book); breadcrumb + MedicalWebPage + FAQPage schema (nav "Treatments") |
| `/guides.html` | Patient Guides hub | Cards linking the 7 guides + the protocol (nav "Guides") |
| `/{7 guide slugs}.html` | Patient Guides | how-kidneys-work, understand-kidney-reports, kidney-diet-renal-plate, ayurvedic-kidney-herbs, kidney-myths-facts, everyday-symptom-care, 30-day-kidney-plan — each breadcrumb + MedicalWebPage + FAQPage schema (Kidney Kavach) |
| `/about.html` | About | story, values, doctors |
| `/doctors.html` | Doctors | 6 doctors |
| `/blog.html` | Blog index | filter, featured, 9 cards, newsletter |
| `/contact.html` | Contact | form, map placeholder, FAQ |
| `/privacy.html` `/terms.html` `/disclaimer.html` | Legal | real content pages |
| `/conditions/{15 slugs}.html` | Conditions / SEO landing pages | breadcrumb + MedicalWebPage + per-condition FAQPage JSON-LD. Incl. high-creatinine(+without-dialysis), ckd(+stage-3/4), kidney-failure, kidney-disease-treatment, dialysis, proteinuria, kidney-swelling-treatment, diabetic-/hypertensive-kidney-disease, kidney-stone-/uti-/laser-kidney-stone-treatment. **3 old slugs 301-redirect** to new ones (diabetes-bp→diabetic-kidney-disease, stone-uti→kidney-stone-treatment, swelling→kidney-swelling-treatment) via `deploy/nginx-riims-bootstrap.conf`. |
| `/blog/{9 slugs}.html` | Blog articles | breadcrumb + Article JSON-LD |

## 15. SEO implementation

- Per page: unique `<title>`, meta description (**auto-clamped to ≤155 chars** by `clampDesc()`),
  canonical (`https://riimshospitals.com`...),
  OG + Twitter (share image = `assets/banner-1.jpg` 1920x400 brand banner with width/height meta; no meta-keywords tag). Home page preloads the first WebP banner (`preload: assets/banner-1.webp` in the page manifest).
  `<html lang="en-IN">`.
- **Performance / Core Web Vitals:** all rasters are optimized (see `build/optimize-images.mjs`) —
  content images (reels, doctor portraits, hospital, blog covers, patient-video tile) ship as
  **WebP** and render as **real `<img>`** with `alt`, `width`/`height` and `loading="lazy"`
  (indexable by Google Images, low CLS). The LCP hero is a `<picture>` (WebP + JPG fallback,
  `fetchpriority="high"`). Total `site/assets` dropped from ~3.5 MB to ~0.9 MB (the brand logo
  alone went 1.43 MB → 112 KB). The favicon/apple-touch/PWA icon stays PNG.
- **JSON-LD** (`<script type="application/ld+json">`): `["MedicalClinic","LocalBusiness"]` +
  `WebSite` on every page, with **local signals** — `geo` (GeoCoordinates), `hasMap`,
  `areaServed` = the real service cities (Baraut/Baghpat/Meerut/Shamli), E.164 `telephone`,
  opening hours. Plus `FAQPage` on home + contact; `BreadcrumbList` + `MedicalWebPage` + a per-condition `FAQPage` (mirrors the visible Q&A-style sections) on each condition; `BreadcrumbList` + `Article` (with `datePublished`/`dateModified`) on each blog post; and a **`Physician`** node per doctor on the doctors page (`physiciansGraph()`, from the admin roster — for doctor rich results + E-E-A-T).
- `sitemap.xml` (36 indexable URLs, `lastmod`, priority; 404 excluded) + `robots.txt`.
- One `<h1>` per page (home H1 is keyword+local: "Kidney Care in Baraut — High Creatinine, CKD,
  Dialysis & Diet Guidance"), semantic landmarks, `aria-hidden` on decorative icons, `role="img"`
  + `aria-label` on image tiles. Lucide is **self-hosted** (pinned) — no CDN dependency.
- Branded **404 page**, real **Google Maps embed** on contact, all off-site links `rel="noopener"`.
- **Already set for go-live:** `SITE.origin = https://riimshospitals.com`. Off-site actions that
  remain (only you can do): verify the domain + submit `sitemap.xml` in Google Search Console,
  create/verify the Google Business Profile (Baraut), and update `SITE.geo`/`mapsQuery` to the
  exact clinic coordinates. See DEPLOY.md §6.
- **Blog articles are deep, audit-driven long-form content** derived from the *Kidney Kavach* book
  (founder Dr. Abhishek Gupta). Each `POSTS[]` in `data/content.json` holds a complete, compliance-safe
  `body` (with report/ACR/HD-vs-PD/myth-vs-fact tables, a CKD diet chart, etc.) plus `faqs`, `refs` and
  topic-specific `relatedPosts` (high creatinine, reduce creatinine, CKD diet, dialysis myths, proteinuria,
  diabetes, swelling, stones/UTI, integrated Ayurveda) — no longer thin/templated. **Deployment note:** these
  bodies now survive the admin `content.local.json` because `build/data.mjs` fills an empty post
  `body`/`faqs`/`refs` from the repo, while leaving the admin fully authoritative for everything else (see §8).

## 16. Wiring / data flow (how a click works)

- **Book buttons** (anywhere) carry `data-book` → `site.js` delegated handler opens
  `#booking-modal` → the modal contains `appointmentForm()` → submit POSTs to `/api/lead`.
- **WhatsApp/Call** links → `SITE.whatsapp` / `tel:SITE.phoneTel` (real `wa.me`/`tel:` URLs).
- **Nav / footer / cards / related links** → real `.html` files (correct via the `base` prefix);
  enforced to all-resolve by `npm test`.
- **Search** → `site.js` matches the query against the admin-driven `window.__RIIMS_SEARCH__` topics
  (`js/search-data.js`) and renders a results block (see §8).
- **Reels / testimonial video** → link to the Instagram profile (`SITE.instagram`).

## 17. Build, run, test commands

```bash
npm run build    # generate site/ from build/
npm run serve    # preview at http://localhost:5173 (zero-dep server)
npm run dev      # build + serve
npm run check    # run integrity checks on the current site/
npm test         # build + check  (MUST be 0 problems before pushing — see CLAUDE.md)
```

`npm test` checks: every internal href/src resolves, CSS background assets exist, every JSON-LD
block parses, every page has exactly one `<h1>` + a `<title>` + a description, and there are no
`href="#"` dead anchors. Exit code 0 = clean.

## 18. Deployment — LIVE (as actually deployed)

**Live site: https://riimshospitals.com (+ www).** Deployed and verified on **2026-06-10**.
This section is the source of truth for the running production setup.

### 18.1 Where it runs (facts)

| Thing | Value |
|-------|-------|
| Domain | `riimshospitals.com` (non-www canonical; `www` also serves; `http`→`https` 301) |
| Registrar / DNS | GoDaddy — `A @` and `A www` → `187.127.132.106` |
| Host | Hostinger VPS, Ubuntu 24.04 LTS, `ssh root@187.127.132.106` |
| Web server | **host nginx 1.24.0** (systemd) on ports 80/443 — it reverse-proxies all the box's sites. (A `traefik-*` Docker project exists but is **dormant/not used**; other apps run as Docker containers with their own nginx — do not touch them.) |
| **Project location on VPS** | **`/opt/riims`** (a `git clone` of this repo) |
| **Web root** | **`/opt/riims/site`** (the generated static files) |
| nginx site config | `/etc/nginx/sites-available/riimshospitals` → symlinked to `/etc/nginx/sites-enabled/riimshospitals` (a copy of `deploy/nginx-riims-bootstrap.conf`, then upgraded to HTTPS by certbot) |
| SSL | Let's Encrypt via **certbot** (`/etc/letsencrypt/live/riimshospitals.com/`), auto-renew enabled |
| Repo | https://github.com/prarit0097/Riims-Website (`main`) |

### 18.2 How it was deployed (the exact commands that were run)

```bash
# 1) DNS: GoDaddy A @ + A www -> 187.127.132.106  (then `getent hosts riimshospitals.com` confirms)

# 2) Clone the repo into a new, isolated folder
mkdir -p /opt/riims && cd /opt/riims
git clone https://github.com/prarit0097/Riims-Website.git .
chmod -R a+rX /opt/riims

# 3) Install the RIIMS server block into the existing host nginx (sites-enabled)
cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals
ln -sf /etc/nginx/sites-available/riimshospitals /etc/nginx/sites-enabled/riimshospitals
nginx -t && systemctl reload nginx          # nginx -t MUST pass (protects the other ~13 sites)

# 4) SSL — certbot adds the 443 block + http->https redirect to THIS site only
certbot --nginx -d riimshospitals.com -d www.riimshospitals.com \
        --agree-tos -m praritsidana786@gmail.com --redirect --non-interactive
nginx -t && systemctl reload nginx
```

### 18.3 Updating the live site (after any push to GitHub)

```bash
cd /opt/riims && git pull        # static files served instantly — no reload needed
```
Helper: `/opt/riims/deploy/update.sh` does the same (`git fetch` + `reset --hard origin/main`).

### 18.4 Re-applying the nginx config (only if `deploy/nginx-riims-bootstrap.conf` changes)

The live nginx file is a **copy** in `/etc/nginx/` (not the repo file), and certbot edited it to add
HTTPS. So a plain `git pull` does NOT change nginx config. To re-apply a changed config:

```bash
cd /opt/riims && git pull
cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals
certbot --nginx -d riimshospitals.com -d www.riimshospitals.com --redirect --non-interactive --reinstall
nginx -t && systemctl reload nginx
```

> **nginx gotcha (already handled):** a `location` block that has its own `add_header` *drops* all
> server-level `add_header` directives for that location. So caching locations use **only `expires`**
> (which sets `Cache-Control`) — never `add_header Cache-Control` — otherwise the security headers
> (CSP/HSTS/…) get stripped from pages. Keep it that way.

### 18.5 Verify (run locally or on the VPS)

```bash
D=https://riimshospitals.com
curl -sI $D/ | head -1                                   # HTTP/.. 200
curl -sI http://riimshospitals.com/ | grep -i location   # 301 -> https://riimshospitals.com/
curl -sI $D/ | grep -iE "content-security|strict-transport|x-frame|permissions-policy"   # 6 headers
for p in / conditions/ckd.html blog/ckd-diet-chart-indian-veg.html contact.html 404.html; do
  printf "%-40s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' $D/$p)"; done
```
Confirmed at launch: all pages 200, SSL valid (Let's Encrypt, expires 2026-09-08, auto-renew), all
6 security headers present, gzip on, `http`→`https` 301, canonical/sitemap on `riimshospitals.com`.

### 18.6 Scale / 1000+ concurrent

Fully static behind host nginx → served from cache/RAM, thousands of req/s per core. The config adds
**gzip** (text) + **30-day asset caching** + security headers. No backend, DB, or per-request compute
for the public pages. Leads POST to the admin server's `/api/lead` (a lightweight, rate-limited
Node endpoint); Call/WhatsApp are plain `tel:`/`wa.me` links that never touch the server.

### 18.7 Alternatives (not used here)

`DEPLOY.md` also documents: a Docker container behind Traefik (`docker-compose.yml`), a standalone
**Caddy** auto-HTTPS container (`docker-compose.caddy.yml` + `deploy/docker/Caddyfile`), a full
system-nginx vhost (`deploy/nginx-riimshospitals.conf`), and Apache (`deploy/apache-riimshospitals.conf`
+ `site/.htaccess`). Any static host (Netlify/Vercel/GitHub Pages) also works.

### 18.8 Post-launch SEO actions (off-site; not in code)

1. **Google Search Console** → verify `riimshospitals.com` → submit `https://riimshospitals.com/sitemap.xml`.
2. **Google Business Profile** (Baraut clinic) — #1 lever for local/"near me" searches; then set
   `SITE.geo`/`mapsQuery` in `build/data.mjs` to the exact verified place and rebuild.
3. Real doctor names/photos + Google reviews; replace the 9 templated blog articles with full originals.

## 19. How to make common changes

- **Change phone / WhatsApp / address / hours / social / maps / geo / CTA copy** → **Admin → Settings**
  (no code). Only the `domain`/`origin` and business/legal *name* stay in `build/data.mjs` (`SITE`).
- **Edit copy that has an admin tab** (doctors, blogs, reels, testimonials, FAQs, services, why, steps,
  about, legal, protocol FAQs, search) → **use `/admin/`** (see §23) — it rebuilds automatically.
  Code defaults live in `build/data.mjs` / `build/pages.mjs`.
- **Edit code-only copy** (the 8 condition pages `CONDITIONS`, the 7 guides, `NAV`, footer columns,
  disclaimers) → `build/data.mjs` / `build/guides/*` → `npm test` → push.
- **Add a condition page** → add an entry to `CONDITIONS` (and to `PROBLEMS` for the home grid).
  The generator auto-creates the page, sitemap entry, and JSON-LD.
- **Add a blog post** → add an entry to `POSTS` (with `slug` + `related`). The article page,
  links, and JSON-LD are generated automatically.
- **Change what search shows** → use **Admin → Search widget** (§23): add/remove topics, set the
  Popular chips, and pick the blogs/doctor/video per keyword. It regenerates `js/search-data.js` on
  rebuild — no code edit needed. (Seed defaults live in `data/content.json` → `search.topics`.)
- **Change styling** → tokens in `site/css/tokens/*`, layout/responsive in `site/css/site.css`,
  or the relevant component's inline styles in `build/*.mjs`.
- After ANY change: update this file, run `npm test` (fix any failure), then commit + push.

## 20. Conventions & constraints

- **Generator is source of truth** (`build/`); `site/` is generated — don't hand-edit it.
- **Immutability / small modules** preferred; medical compliance (no cure/guarantee claims);
  disclaimers must remain.
- Icons: Lucide **self-hosted** (`assets/vendor/lucide.min.js`, `<i data-lucide>`), plus inline SVG for Facebook/Instagram/stars.
- Fonts: Spectral (display), Plus Jakarta Sans (body), Mukta (Hindi) via Google Fonts.

## 21. Known placeholders / next steps

- **Doctor names & photos** are mock (illustrated portraits in `site/assets/doctors/`). Swap
  real names/credentials/photos in `build/data.mjs` + the asset files.
- **Google rating / review counts / patient numbers** in the stats strip are **demo figures** —
  replace with live Google Business numbers before launch (`build/sections.mjs` → `statsStrip`).
- **Reels & testimonial video** are thumbnails linking to Instagram — embed real videos later.
- **Blog article bodies are now full original articles** written from the *Kidney Kavach* book content
  (stored in `data/content.json` → `posts[].body`). See §24.
- **Contact map** is now a live Google Maps embed using a generic "RIIMS Baraut" query —
  refine `SITE.geo`/`mapsQuery` to the exact verified Business-Profile place after launch.
- **Home hero** is an **admin-managed auto-rotating banner slider** (`searchBanner` in
  `build/sections.mjs`, data from `BANNERS`/`BANNER_SPEED` in `data.mjs`). **Primary way to change it:
  Admin → Home Banners** (upload/remove/reorder slides, set per-slide alt + optional click link, set the
  auto-slide speed). Any image size is safe — each slide cover-fills a fixed **1920×400** frame, so
  add/remove never breaks the layout; 1 slide = static (no auto-rotate/arrows/dots). Cross-fade with
  pause-on-hover / hidden-tab, respects reduced-motion; left/right arrows + dots for manual nav.
  **Repo defaults** (`content.json → banners`, shown until the admin overrides): owner-supplied source
  PNGs live in the gitignored repo-root `/assets/1..4.png`, **centre-cropped to 1920×400 (~4.8:1)** and
  optimised to `site/assets/banner-1..4.webp` (~81–101 KB) + `banner-1.jpg` (og/LCP fallback) by
  `build/optimize-images.mjs` (`BANNER_W/H/POS`). To change the *code defaults*: replace `/assets/N.png`,
  run `node build/optimize-images.mjs`, then `npm test` + push.
- **Images are now optimized** — all rasters compressed via `build/optimize-images.mjs` (WebP for
  content images; the social/schema logo shrunk 1.43 MB → 112 KB PNG). `sharp` is a **dev-only,
  build-time** dependency (installed with `npm install sharp` when re-optimizing) and is **not**
  shipped to the static site. Re-run `node build/optimize-images.mjs` after adding new source
  images, then update the reference paths. AVIF could shave a little more later.
- **Fonts** load from Google Fonts (trimmed weights) — self-host woff2 later for full privacy/speed.
- Phone/WhatsApp (`+91 85120 40000`) and the Baraut address are the **real** supplied values.

## 22. Git

- Remote: **https://github.com/prarit0097/Riims-Website** (`main`).
- Per [CLAUDE.md](CLAUDE.md): every change → update this file → `npm test` (0 problems) →
  commit → push.

## 23. Admin Panel (website control)

**URL:** `https://riimshospitals.com/admin/` (password login). Runs as the `riims-admin`
Docker container (`docker-compose.admin.yml`, Node 24 alpine, bound to `127.0.0.1:5500`);
host nginx proxies `/admin/` and `/api/` to it. Code: `admin/server.mjs` (zero-dependency)
+ `admin/ui/` (vanilla JS SPA).

### What it controls
| Tab | What you can do |
|-----|-----------------|
| **Leads** | Every appointment-form submission lands here (Name, Phone, Problem/Disease). Status pipeline (new → contacted → booked → closed), notes, one-click WhatsApp reply to the patient, delete, CSV export. Stored in `data/leads.json`. |
| **Doctors** | Add/remove/edit doctors — name, title, qualifications, specialties, languages, photo upload, **↑/↓ reorder** (order matters: first 3 drive the about-page trio, and the first nephrologist is the search "Specialist for you"). Drives the doctors page, home experts carousel, and the about-page trio. |
| **Health Reels** | Add/remove/edit reels — title, tag, views label, tone, thumbnail upload, per-reel Instagram URL. |
| **Patient Stories** | Add/update/remove testimonials (name, location, rating, quote), plus the **patient video tile** below them — show/hide, title, thumbnail upload, and the video link (YouTube/Instagram URL; blank = Instagram profile). |
| **FAQs** | Add/update/remove the FAQ accordion items (home + contact). |
| **Blogs** | Add/remove/edit blog posts — title, slug (own URL `/blog/<slug>.html`), category, author, date, read-time, cover image upload, excerpt, and full **body** (blank-line paragraphs, `## ` headings). Empty body = auto-filled from the related condition. |
| **About page** | Edit the About page: hero title/intro, story heading + story paragraphs (blank line = new paragraph; `<strong>` allowed), image alt, CKD awareness note, and the value cards (icon+title+desc, reorder). Saved to `content.json → about`; defaults live in `pages.mjs` (`DEFAULT_ABOUT`). |
| **Legal pages** | Edit Privacy / Terms / Disclaimer — per page: title, intro, and sections (`[heading, body]`, add/remove). Saved to `content.json → legal`; a page left fully empty falls back to the built-in default so required legal copy can't be blanked. Compliance-guarded. |
| **Home Banners** | Manage the home hero **slider**: add/remove/**reorder** (↑/↓) banner slides (image upload + alt text + optional click link), and set the **auto-slide speed** (seconds). Any image size is safe — it cover-fills the fixed 1920×400 frame, so upload/remove never breaks the layout; 1 slide = no auto-rotate/arrows/dots. Saved to `content.json → banners` (`{speed, slides[]}`); empty = the 4 default banners. |
| **Services** / **Why RIIMS** / **How it works** | Edit the home "Complete Care" service tiles (also on `/services.html`), the "Why RIIMS" cards, and the consultation steps — icon (Lucide name via datalist) + title + description, add/remove/**reorder** (↑/↓). Saved to `content.json → services` / `why` / `steps`; step numbers auto by order. |
| **Protocol FAQs** | Add/edit/remove the FAQs on the **DNA Kayakalp Protocol** page (`/dna-kayakalp-protocol.html`). Feeds the visible FAQ block **and** the page's FAQPage rich-result schema. Empty list = built-in default FAQs. Saved to `protocol.faqs` (`[{q,a}]`); compliance-guarded copy. |
| **Search widget** | Control the home "Search any disease" widget. Add/remove **topics**; per topic set the **label** (Popular-chip + result badge text), **keywords** (comma-separated match terms), a **Popular chip** toggle (which chips show under the search box), the **Related-articles** blogs (tick from your posts), the **Doctor** (Auto = nephrologist, a specific doctor, or RIIMS Care Team) and the **Video/reel** (Auto = first reel, or a specific one). Saved to `search.topics`; drives `site/js/search-data.js` + the Popular chips (see §8). |
| **Tracking / Tags** | Set the **Google Tag ID** (`G-…` GA4 / `AW-…` Ads) → gtag.js loads on every page (generator writes `site/js/gtag.js`, external file so CSP `script-src 'self'` covers the config; the loader comes from `googletagmanager.com`, allowed in CSP). Once a tag is set, `site.js` fires **GA4 conversion events**: `click_whatsapp`, `click_call`, `click_book`, `form_submit` (safe no-op if no tag). Paste **verification meta tags** (Search Console, Bing, FB) — one per line; only `<meta>`/`<link>` lines are accepted (scripts are stripped), injected into every page's `<head>`. |
| **Settings** | **Contact numbers** (Call + WhatsApp, 10 digits, sitewide) + email; **Business info** (city line, opening hours, address lines, Google Maps link, service cities, map lat/lng) → drives footer, contact page and the LocalBusiness JSON-LD (`address`, `openingHours`, `geo`, `areaServed`, `hasMap`); **Social links** (Facebook / Instagram / YouTube — blank hides that icon site-wide, also feeds JSON-LD `sameAs`); the **CTA band** copy (eyebrow/title/intro/button labels) shown on nearly every page; and the **homepage stats strip** — show/hide toggle + Google rating / reviews / patients / specialists values. Stats are **hidden by default** and must only carry REAL Google Business numbers (fake stats on a YMYL medical site suppress rankings). Empty fields are skipped; real values render in the HTML (crawler-visible) with JS count-up as enhancement. |

### How it works
- Content edits are written to **`data/content.local.json`** (gitignored) which overrides
  `data/content.json` section-by-section (admin is authoritative — edits/deletions/order all apply); only an
  empty blog `body`/`faqs`/`refs` is filled from the repo post (see §8), then the server **auto-runs the
  generator** — the
  static site updates within seconds. Git pulls never clobber admin edits.
- Image uploads go to `site/assets/uploads/` (gitignored) via base64 JSON (10MB nginx cap).
- The public form (`site/js/site.js`) POSTs to **`/api/lead`** on submit (single step:
  name/phone/problem). Honeypot field + 10/min/IP rate limit. Leads go ONLY to the admin
  panel (no WhatsApp redirect, per owner request).
- Auth: scrypt password hash + HMAC-signed 7-day session cookie (`data/admin-config.json`,
  created by `node admin/set-password.mjs '<password>'`). UI is `noindex`.

### VPS setup (one-time)
```bash
cd /opt/riims && git pull
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node admin/set-password.mjs 'STRONG-PASSWORD'
docker compose -f docker-compose.admin.yml up -d
cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals   # adds /admin + /api proxy
certbot --nginx -d riimshospitals.com -d www.riimshospitals.com --redirect --non-interactive --reinstall
nginx -t && systemctl reload nginx
```
Update flow note: `deploy/update.sh` now rebuilds after `git reset` so admin content survives
code updates (it uses host node, or the node:24-alpine image if node isn't installed).

## 24. Kidney Kavach book integration (content source of truth)

The site's medical content is grounded in **_Kidney Kavach_ (किडनी कवच™)** by RIIMS founder
**Ayurvedacharya Dr. Abhishek Gupta (B.A.M.S.)** — a 159-page book based on the **DNA Kayakalp
Protocol™**. The book was deep-scanned page-by-page and its vetted content mapped into the site.
All copy stays compliance-safe (no cure/guarantee/"reverse"/"stop dialysis" claims; Ayurveda &
Panchakarma framed as **supportive, supervised, alongside — never instead of — medical care**),
mirroring the book's own honest tone.

What was integrated (all via the generator + `data/content.json`, then `npm test` = 0):

- **New page — `/dna-kayakalp-protocol.html`** (`protocolPage` in `build/pages.mjs`; manifest +
  JSON-LD in `build/generate.mjs`). Covers the full **D-N-A** framework:
  - **D — Diagnosis & Detox Support:** Kidney Mapping (7 domains), Root Cause Identification,
    Metabolic Load Reduction, safe/supervised Detox, Agni/Ama/Gut-Kidney Axis.
  - **N — Nutrition & Nephrotoxin Reduction:** **LDP Protocol™** (Life of Disciplined People),
    **RiiMS Renal Plate Model** (½ veg + ¼ grains + ¼ protein; 5 principles), 6 tastes, the
    10 nephrotoxins, and the **Panchakarma Support Framework** (7 named therapies: HTS, MMT,
    CCS, KTL, PRS, LCS + others — supervised only).
  - **A — Ayurveda-led Activation & Adaptive Care:** sleep, Brahmacharya/yoga, Movement as
    Medicine, Laughter as Medicine, breath/oxygen, Gravity Treatment, Adaptive Lifestyle Planning.
  - Linked from `servicesPage` (a banner), the footer "Care" column, and the About page; nav
    highlights "Treatments". Exported `PROTOCOL_FAQS` drives both the visible FAQ and the FAQPage
    JSON-LD.
- **9 blog articles rewritten as full original long-form content** — `posts[].body` in
  `data/content.json` (high creatinine; reduce creatinine safely; CKD Indian-veg diet chart;
  dialysis myths vs facts; protein in urine; diabetes & kidney; swelling; stones/UTI; integrated
  Ayurveda). Rendered by `renderBody`, which now also turns a block of `- ` lines into a `<ul>`.
- **8 condition pages enriched** (`CONDITIONS` in `build/data.mjs`) — book-accurate `about`,
  `symptoms`, `approach`, `when` (creatinine-as-marker, eGFR/CKD staging, Kidney Alert System red
  flags, Kidney Mapping / Root Cause / RiiMS Renal Plate woven into the approach).
- **FAQs expanded** — 15 new book-grounded Q&As (`f6`–`f20`) in `data/content.json` `faqs`
  (surface on home + contact via `FAQS`).
- **`SERVICES`, `WHY`, `STEPS`** (`build/data.mjs`) re-aligned to the protocol (Kidney Mapping,
  DNA Kayakalp Protocol Care, RiiMS Renal Plate, supervised Panchakarma, Lifestyle & Activation).
- **About page** (`aboutPage`) — richer integrated-care story, refreshed values, and an awareness stat
  ("~1 in 6–7 people in India may have CKD" — cited as a general estimate, not a RIIMS metric).
  (A "founder note" card was added then removed on owner request.)

- **Verification pass (2026-07-10)** — the site's content was re-checked page-by-page against the
  actual PDF (rendered via PyMuPDF). Everything matched: the **D-N-A** framework wording, the 7
  Kidney Mapping domains, LDP Protocol, RiiMS Renal Plate, the Panchakarma therapies, the five herb
  monographs (botanicals/phytochemicals/karma), the world diet models, and the full normal-lab-value
  chart + CKD Stage (G1–G5) table (Appendix, book p.154). The one book topic not yet on the site was
  **Part 6 — modern science (HIF pathway)**; it was added:
  - `build/guides/how-kidneys-work.md` — new section **"The kidney's oxygen sensor: the HIF pathway"**
    (HIF = Hypoxia-Inducible Factor; body's oxygen sensor; **2019 Nobel Prize in Physiology/Medicine**;
    ties EPO → kidney disease → anaemia) + a 4th guide FAQ ("Why does kidney disease cause anaemia?").
  - `build/guides/understand-kidney-reports.md` — one sentence in the Hemoglobin section linking EPO
    to the HIF pathway / 2019 Nobel Prize. All compliance-safe (education, no treatment claims).

Source-of-truth note: the book PDF (`kidney kavach book-1.pdf`) is kept locally / not required by
the build. To extend content, edit the generator/`data/content.json` as above and keep this file in
sync (Rule 1). Doctor rosters/photos remain owner-managed (see §21) — the book's real founder bio is
reflected only on the About page, not fabricated into the doctor cards.

## 25. Patient Guides library (`build/guides.mjs` + `build/guides/*.md`)

A library of in-depth, plain-language patient guides derived from _Kidney Kavach_. This is the site's
main educational depth and a major SEO asset — each guide is a full, original, compliance-safe article.

- **Data:** `build/guides.mjs` exports `GUIDES` (metadata: `icon`, `title`, `crumb`, `desc`, `intro`,
  `blurb`, `related` condition slugs, `faqs` `[q,a][]`, and `body` loaded from `build/guides/<key>.md`),
  `GUIDE_ORDER` (display order), and `CONDITION_GUIDES` (which guides surface on each condition page).
- **Bodies:** markdown-lite files in `build/guides/*.md`, rendered by `renderBody` (now supports
  `### ` h3, `> ` blockquotes, `1.` ordered lists, `| a | b |` tables, and inline `**bold**`/`*italic*`).
- **Rendering:** `guidePage(base, key)` (hero + body + FAQ + CTA + related conditions + more-guides +
  disclaimer) and `guidesHubPage(base)` (`/guides.html`, cards for all 7 guides + the protocol).
- **The 7 guides:** `how-kidneys-work` (7 kidney jobs, how CKD begins, AKI vs CKD, and the **HIF
  oxygen-sensing pathway / 2019 Nobel Prize** link to EPO & anaemia), `understand-kidney-reports` (creatinine/eGFR/CKD-stage tables,
  the Kidney Alert System, a normal-lab-value chart), `kidney-diet-renal-plate` (the definitive diet
  reference: RiiMS Renal Plate, 6 tastes, protein/sodium/potassium/phosphorus/fluids, world diet models),
  `ayurvedic-kidney-herbs` (honest herb monographs — Punarnava/Gokshura/Varuna/Guduchi/Amalaki + others,
  supportive-only, no doses, evidence caveats), `kidney-myths-facts` (25 myths→facts + 25 mistakes),
  `everyday-symptom-care` (9 symptoms with gentle measures + red flags), `30-day-kidney-plan` (habits +
  checklist).
- **Discoverability:** `Guides` in `NAV`; a "Patient Guides" section on the home page; a footer "Care"
  column; a "Helpful guides" card on every condition page (via `CONDITION_GUIDES`); each guide carries
  `BreadcrumbList` + `MedicalWebPage` + `FAQPage` JSON-LD.
- **To add a guide:** create `build/guides/<slug>.md`, add an entry to `GUIDES` + `GUIDE_ORDER` (and
  optionally `CONDITION_GUIDES`); the generator auto-creates the page, sitemap entry and JSON-LD. Then
  `npm test` and update this file.
