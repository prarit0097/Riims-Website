# RIIMS.md — The Complete Guide to This Project

This file explains **everything** about the RIIMS website: what it is, why it exists, and
exactly how it works — design, build system, data, wiring, interactivity, SEO and deployment.
If you are new here, read this top to bottom and you will understand the whole project.

> Maintenance rule: per [CLAUDE.md](CLAUDE.md), **every change to this project must be
> reflected here**, down to the smallest detail.

---

## 1. What is this project?

A **website for RIIMS — Rashtriya Institute of Integrated Medical Sciences**, a kidney-led
integrated medical institute in **Baraut, Uttar Pradesh, India**. RIIMS provides ethical,
doctor-led, report-based kidney care: high creatinine, CKD (chronic kidney disease), kidney
failure, dialysis guidance, kidney diet, and Ayurveda-supported integrated lifestyle care. As of
the multi-disease expansion (see §26), RIIMS also treats **liver, heart and general/metabolic
disease in-house** — kidney remains the site's SEO anchor (home `<title>`/`<h1>` unchanged), but
the Treatments page, footer and condition silos now surface all 4 categories.

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
│   │                         #   contact, blog-article, legal, landing)
│   ├── landing.mjs           # LANDING registry — the Delhi-NCR "where do I get treated" pages (§27)
│   ├── serve.mjs             # zero-dependency local preview server (port 5173)
│   ├── check.mjs             # integrity tests: links, assets, JSON-LD, <h1>, meta, dead anchors, stale domain
│   ├── compliance.mjs        # banned medical claims guard — admin refuses any save that hits it (§23)
│   └── optimize-images.mjs   # one-shot raster optimizer (WebP + shrunk logo/hero); needs dev-only `sharp`
│
├── admin/                    # ── ADMIN PANEL (see §23) ──
│   ├── server.mjs            # zero-dep Node server: leads API, content CRUD, uploads, rebuild; owner/seo roles
│   ├── set-password.mjs      # set owner password; --seo sets the SEO-role password (data/admin-config.json)
│   └── ui/                   # the /admin/ panel (index.html + admin.js + admin.css)
├── data/                     # ── CONTENT + RUNTIME DATA ──
│   ├── content.json          # admin-editable content defaults (in git)
│   ├── content.local.json    # VPS admin edits — overrides content.json (GITIGNORED)
│   ├── pages-manifest.json   # build artifact: page list for the Pages/SEO tab (GITIGNORED)
│   ├── leads.json            # stored appointment leads (GITIGNORED)
│   └── admin-config.json     # owner + SEO password hashes & session secret (GITIGNORED)
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
    ├── assets/               # official RIIMS logo (teal/petrol emblem + RiiMS badge, transparent
    │                         #   PNG — riims-logo.png 393x512 + riims-logo-sm.png 246x320, from the
    │                         #   gitignored master assets/logo.png), + WebP: hero banners
    │   │                     #   (banner-1..4.webp + banner-1.jpg for og/LCP), doctor
    │   │                     #   portraits, reels, hospital, video — optimized by build/optimize-images.mjs
    │   └── vendor/lucide.min.js   # self-hosted, pinned Lucide (no CDN)
    ├── 404.html              # branded not-found page (absolute paths; served by web server)
    ├── site.webmanifest      # PWA manifest (name, icons, theme color)
    ├── .htaccess             # Apache caching/gzip/headers/clean-URLs/404 (ignored by nginx)
    ├── sitemap.xml           # all 84 indexable URLs with lastmod/priority (404 excluded)
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
   → **64 indexable pages** (+ a branded 404 = **65 files written**).
   - Plus a loop over `['liver', 'heart', 'general']` that writes one **category hub**
     (`conditions/<dir>/index.html`, via `categoryHubPage(base, cat)` in `pages.mjs`) per
     category, and a second loop over `CONDITION_SETS['liver'|'heart'|'general']` (see §26)
     that writes `conditions/<dir>/<slug>.html` pages. As of Task 5, **all three categories are
     complete silos**: liver and general at 12 conditions each, heart at 8 (hub + all condition
     pages, every category).
5. Writes every page to `site/`, then writes `sitemap.xml` (with `<lastmod>` = build date and
   per-type `<priority>`) and `robots.txt`. It also emits **`site/js/search-data.js`**
   (`window.__RIIMS_SEARCH__`) — the admin-driven dataset (real doctor/posts/reel) that powers
   the home disease-search results (see §8) — and `js/gtag.js` if a Google Tag ID is set.

Run it: `npm run build`. It logs `Generated 91 pages + sitemap.xml + robots.txt into /site`.

### The `base` prefix system (how relative paths stay correct)
Root pages link assets as `css/styles.css`, `assets/...`, `about.html`. Pages inside a
subfolder (`conditions/`, `blog/`) use `../css/styles.css`, `../assets/...`,
`../conditions/ckd.html`. The generator threads a `base` string (`''` or `'../'`) into every
component that emits a link or asset reference, so the same code produces correct paths at any
depth. The single `site.css` references images as `url('../assets/...')` (relative to
`site/css/`), which resolves correctly for every page regardless of depth. Non-kidney condition
pages sit **two** levels deep (`conditions/<dir>/<slug>.html`), so they use `base = '../../'`
(see §26).

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
- **`logo(base, {light, size, mark})`** — the brand mark (CSS background image
  `riims-logo-sm.png` = full logo: emblem + RiiMS wordmark), links to home; `light` = white chip
  for the dark footer; `size` sets the square box (default 54); `mark` = optional inline
  `background-image` override. The **header** uses the full logo at **`size: 68`** in an **80px**
  header (main header `min-height:80px`; the conditions-page sticky aside `top` is **128px** to
  match) so it reads clearly. Footer uses the default (full logo, size 54). Favicon/apple-touch/
  manifest use `riims-logo-sm.png`; social/JSON-LD use `riims-logo.png`. (A compact circular emblem
  `site/assets/riims-emblem.png` — from the gitignored master `assets/logo1.png` — is kept for
  optional use via `mark`.)
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

If `content.local.json` is ever **unparseable** (a stray hand-edit on the VPS), the build logs
`[data] IGNORING data/content.local.json — invalid JSON …` and carries on with the repo content
instead of throwing. That matters: an exception here would stop *every* rebuild and freeze the
live site. `content.json` is in git and still fails loudly — `npm test` is what guards it.

The **20 admin sections** (mirror of `SECTIONS` in `admin/server.mjs`) are: `site` (numbers + business
info + social), `tracking`, `stats`, `storyVideo`, `doctors`, `reels`, `testimonials`, `faqs`, `posts`,
`search`, `cta`, `protocol`, `services`, `why`, `steps`, `about`, `legal`, `banners`, `pagesSeo`,
`conditionEdits`. Most have their own `/admin/` tab (see §23); the exceptions: `site`/`stats`/`cta`
share **Settings**, `storyVideo` sits in **Patient Stories**, and `pagesSeo`/`conditionEdits` are both
driven by **Pages / SEO** — 17 tabs for 20 sections. For sections with a code default (`cta`, `services`, `why`, `steps`, `protocol`, `about`,
`legal`, `search`), an absent/empty value falls back to the default baked into `data.mjs`/`pages.mjs`,
so the site always renders.

**Condition pages are partly admin-editable** (since the Pages / SEO tab): title, meta description, H1
and the six text fields (`intro`, `aboutTitle`, `about`, `when`, `symptoms`, `approach`) of all 47
conditions can be edited from `/admin/`, stored as `pagesSeo`/`conditionEdits` overrides. The condition
copy itself still *lives* in `build/data.mjs` — the overrides layer on top, and an empty override means
the code value wins.

**Still code-only** (owner chose to keep these in code for SEO/medical quality — see §19): every
condition's `redFlags` (emergency box) and `sources` (citations) — locked as safety content, refused by
the admin server — plus the 7 patient guides (`build/guides.mjs` + `build/guides/*.md`), the `NAV`
links, footer link columns, and the medical disclaimers. Edit content via `/admin/` on the live site,
or via `data/content.json` / `build/data.mjs` in the repo.

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
- **`CONDITIONS`** — the 15 kidney condition pages, each with: `icon`, `title`, `crumb`, `intro`,
  `aboutTitle`, `about`, `symptoms[]`, `approach[]`, `when`, `related[]`, plus two **optional**
  fields shared with the other categories: `redFlags: {emergency: string[], soon?: string[]}`
  (renders an emergency red-flag box) and `sources: [label, url][]` (renders a citations block).
  Kidney conditions currently define neither, so both blocks render empty on kidney pages. Slugs:
  `high-creatinine, ckd, kidney-failure, dialysis, proteinuria, swelling, diabetes-bp, stone-uti`.
- **`CATEGORIES`, `LIVER`, `HEART`, `GENERAL`, `CONDITION_SETS`** — the 4-category model (see §26
  for the full architecture). `LIVER`/`HEART`/`GENERAL` are condition maps in the same shape as
  `CONDITIONS`. As of Task 3, **`LIVER` is complete at 12 conditions**: the 3 Task 2 flagship
  pages (`raised-sgpt-sgot`, `fatty-liver`, `drug-herb-induced-liver-injury`) plus the 9 Task 3
  pages (`fatty-liver-grade-2`, `fatty-liver-diet`, `liver-function-test-report`, `jaundice`,
  `hepatitis-b`, `hepatitis-c`, `liver-cirrhosis`, `alcoholic-liver-disease`, `liver-abscess`).
  As of Task 4, **`GENERAL` is also complete at 12 conditions**: `diabetes-and-kidney-disease` and
  `uric-acid-gout` (the two kidney-bridge pages), plus `type-2-diabetes`, `prediabetes`,
  `hypothyroidism`, `hyperthyroidism`, `obesity`, `metabolic-syndrome`, `insulin-resistance`,
  `vitamin-d-deficiency`, `vitamin-b12-deficiency`, `thyroid-in-pregnancy`. As of Task 5,
  **`HEART` is complete at 8 conditions** — the highest-stakes category on the site:
  `heart-attack-warning-signs` (a pure emergency page, built first), `high-blood-pressure`,
  `bp-and-kidney-disease` (the kidney-bridge page), `high-cholesterol`, `triglycerides`,
  `heart-failure`, `atrial-fibrillation`, `rheumatic-heart-disease`. All 4 categories are now
  fully populated. `CONDITION_SETS` maps a category key
  to its condition map (`{kidney: CONDITIONS, liver: LIVER, heart: HEART, general: GENERAL}`) and
  is what `conditionPage()`/`generate.mjs` resolve a slug through. `conditionPage()` is
  **category-aware**: the "Medically reviewed by the RIIMS … team" line reads *nephrology* for
  kidney and *medical* for liver/heart/general, and the booking-aside CTA says "Share your kidney
  reports" only on kidney pages ("Share your reports" elsewhere) — so no kidney-specific wording
  leaks onto the other silos. (The `breadcrumb()` helper's intermediate JSON-LD segment now points
  at `/conditions/index.html`, not a hardcoded condition URL.)
- **`PROBLEMS`** — the home "conditions we help with" grid (links to the main condition pages).
- **`WHY`, `STEPS`** — "Why RIIMS" cards + "How consultation works" steps. **Admin-editable**
  (Admin → Why RIIMS / How it works; `content.json → why` / `steps`; empty = code defaults; `STEPS`
  numbering `n` is auto by order). **`SERVICES`** likewise (Admin → Services; `content.json → services`).
  As of Task 6, the first `WHY` default card reads **"Kidney-led, integrated institute"** (was
  "Kidney-focused institute") — same kidney-first framing, now honest about the other 3 categories.
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
  opened from disk). *(The old `HEALTH_DB`/`POPULAR` in `data.mjs`/`site.js` are now legacy
  fallbacks — unreachable from the generated site today, since the real `search.topics` in
  `data/content.json` only defines kidney-labelled topics. Task 6 still corrected `HEALTH_DB`'s
  Liver/Diabetes/Heart entries from `doctor.title: 'Guided referral & support'` to `'Integrated
  care at RIIMS'`, since RIIMS treats those in-house; Cancer correctly stays "Guided referral &
  support" — that condition is genuinely referral-only.)*

## 9. Chrome (`build/chrome.mjs`)

Global UI wrapped around every page by the generator:

- **`header(base, current)`** — sticky top. A dark utility bar (phone, address, hours,
  WhatsApp, Facebook, Instagram, YouTube) + the main nav (logo, 7 links, Call icon, WhatsApp Now +
  Book Consultation buttons — "Upload Reports" was removed sitewide by owner request). On
  tablet/mobile (≤1024px) the text nav + desktop CTAs collapse (CSS); the brand row instead shows a
  compact `.nav-mobile-cta` (Call icon + Book button), and an **always-visible horizontal-scroll
  nav-chips bar** (`.nav-chips` / `.nav-chip` — one icon+label pill per nav item, icon map in
  `header()`) sits below it, so every section is one tap away with **no hamburger/menu** (per the
  claude.ai "Mobile Homepage v2" design). On mobile the logo shrinks to 50px and the brand row
  (`.header-row`) to 60px. Active nav state via `aria-current`: the matching link (desktop) / chip
  (mobile) is highlighted; on any condition page the "Kidney Diseases" one is highlighted.
- **`footer(base)`** — dark footer: brand + social, three link columns (Conditions = the 7 kidney
  condition links **plus the 3 new disease-category hubs** — Liver Diseases & Treatment, Heart &
  Blood Pressure Care, General & Lifestyle Diseases, from `CATEGORIES` — added in Task 6 so all 4
  silos are reachable sitewide; Care, Institute), a medical disclaimer, copyright, and
  **Privacy / Terms / Disclaimer** links (→ the real legal pages).
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
`healthReels` (header is a single enlarged green **"🎬 Health Reels"** heading — clapperboard icon +
`--text-accent`, `--fs-3xl`; the earlier "Short videos…/Top Reels" subheading was removed — plus a
"View all reels" link and a `--space-8` gap down to the horizontal video-thumbnail cards, each linking
to Instagram), `problemsSection`
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
- **`conditionPage(base, slug, cat = 'kidney')`** — page hero + two-column layout: main
  (reviewed line, optional **red-flag box** (`redFlagBox`, only if `c.redFlags` is set), about,
  symptoms split into two lists, "How RIIMS approaches it" card, when-to-consult, optional
  **sources block** (`sourcesBlock`, only if `c.sources` is set), disclaimer) + sticky aside
  (Book/WhatsApp/Upload card + Related topics). `cat` selects the condition map via
  `CONDITION_SETS[cat]` (see §26) and scopes `related` links to the same category (kidney links
  stay flat `conditions/<slug>.html`; other categories link `conditions/<dir>/<slug>.html`). The
  when-to-consult heading stays "When to consult a kidney doctor" for kidney (the existing,
  already-ranking string) and "When to consult a doctor" for every other category.
- **`categoryHubPage(base, cat)`** — the disease-category hub (`/conditions/<dir>/`, see §26):
  page hero (from `CATEGORIES[cat]`) + a 3-column grid of cards (one per entry in
  `CONDITION_SETS[cat]`, linking to `conditions/<dir>/<slug>.html`) + disclaimer + CTA band. An
  empty condition map would render the hero and an empty grid rather than an error, but this is
  moot now — all 4 categories are fully populated as of Task 5.
- **`servicesPage(base)`** — the Treatments & Services hub (`/services.html`, nav "Treatments"). As
  of Task 6: page hero + an `eyebrow('What we treat')` + h2 + intro paragraph + a **4-category
  grid** (`categoryCard()`, one card per `CATEGORIES` entry — icon, label, blurb — linking to that
  category's hub; kidney → `conditions/index.html`, liver/heart/general → `conditions/<dir>/
  index.html`) + the original 11-tile `SERVICES` grid + DNA Kayakalp Protocol banner + how-it-works
  + CTA band. This is the page that makes all 4 disease categories discoverable from the main nav —
  the owner's original ask for this expansion.
- **`aboutPage`** — hero + story + values + doctors section + CTA. **Admin-editable** (Admin → About;
  `DEFAULT_ABOUT` in `pages.mjs` merged with `content.json → about`).
- **`doctorsPage`** — hero + 6 doctor cards + a **"Specialist kidney care"** grid linking the 6
  specialist landing pages + CTA.
- **`specialistPage(base, slug)` + `SPECIALISTS` (exported)** — 6 SEO doctor/keyword landing pages
  under `/doctors/<slug>.html`, each featuring founder **Dr. Abhishek Gupta** (a `doctorFeature`
  card) + a "How we help" list + "when to see a doctor" + related-condition links + booking aside.
  Slugs: `best-kidney-doctor-delhi-ncr`, `high-creatinine-specialist`, `kidney-failure-specialist`,
  `kidney-stone-specialist`, `uti-specialist`, `kidney-doctor-for-diabetic-patients`. **Compliance:**
  Dr. Abhishek is presented honestly as a **B.A.M.S. (Ayurvedacharya) kidney-care physician** — never
  an MD/DM nephrologist — with RIIMS coordinating with nephrologists for medical/dialysis needs; no
  "best"/cure/guarantee claims. His registration number (**DBCP A/7368**, from `SPECIALIST_DOCTOR`)
  shows on the feature card and as a `Physician.identifier`. Each page emits BreadcrumbList +
  MedicalWebPage + **Physician** JSON-LD. Registered in `generate.mjs` (needs `mkdirSync(site/doctors)`);
  linked from `doctorsPage` + the footer Institute column.
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
  `.riims-redflags` / `.riims-sources` (condition-page emergency red-flag box + citations block,
  see §26), the **responsive breakpoints** (≤1024 tablet: collapse grids + switch to mobile nav; ≤760
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

## 14. Page inventory (90 indexable URLs + a 404)

| URL | Page | Notes |
|-----|------|-------|
| `/` | Home | search-first, FAQ + clinic JSON-LD |
| `/conditions/` | Kidney Diseases hub | conditions grid + FAQ + breadcrumb schema (nav "Kidney Diseases") |
| `/services.html` | Treatments & Services hub | **4-category grid (Kidney/Liver/Heart/General, Task 6)** + 11 service tiles + how-it-works + DNA Kayakalp banner (nav "Treatments") |
| `/dna-kayakalp-protocol.html` | DNA Kayakalp Protocol™ | Full D-N-A framework (Kidney Kavach book); breadcrumb + MedicalWebPage + FAQPage schema (nav "Treatments") |
| `/guides.html` | Patient Guides hub | Cards linking the 7 guides + the protocol (nav "Guides") |
| `/{7 guide slugs}.html` | Patient Guides | how-kidneys-work, understand-kidney-reports, kidney-diet-renal-plate, ayurvedic-kidney-herbs, kidney-myths-facts, everyday-symptom-care, 30-day-kidney-plan — each breadcrumb + MedicalWebPage + FAQPage schema (Kidney Kavach) |
| `/about.html` | About | story, values, doctors |
| `/doctors.html` | Doctors | 6 doctors + Specialist-care grid linking every `/doctors/` page — the 7 SPECIALISTS entries **and** any LANDING entry with `dir:'doctors'` (so a new one is never orphaned) |
| `/doctors/{7 specialist slugs}.html` | Doctor/Specialist SEO pages | best-kidney-doctor-delhi-ncr, kidney-specialist-delhi-ncr, high-creatinine-specialist, kidney-failure-specialist, kidney-stone-specialist, uti-specialist, kidney-doctor-for-diabetic-patients — each features Dr. Abhishek Gupta; breadcrumb + MedicalWebPage + Physician schema |
| `/doctors/best-nephrologist-delhi-ncr.html` + 3 root landing pages | Delhi-NCR landing pages (§27) | chronic-kidney-disease-hospital-delhi-ncr, affordable-kidney-treatment-delhi-ncr, best-kidney-failure-hospital-in-delhi-ncr — breadcrumb + MedicalWebPage + FAQPage schema |
| `/blog.html` | Blog index | filter, featured, 9 cards, newsletter |
| `/contact.html` | Contact | form, map placeholder, FAQ |
| `/privacy.html` `/terms.html` `/disclaimer.html` | Legal | real content pages |
| `/conditions/{16 slugs}.html` | Conditions / SEO landing pages | breadcrumb + MedicalWebPage + per-condition FAQPage JSON-LD. Incl. high-creatinine(+without-dialysis), ckd(+stage-3/4), kidney-failure, kidney-disease-treatment, dialysis, proteinuria, kidney-swelling-treatment, diabetic-/hypertensive-kidney-disease, kidney-stone-/uti-/laser-kidney-stone-treatment, high-bp-kidney-disease (§27). **3 old slugs 301-redirect** to new ones (diabetes-bp→diabetic-kidney-disease, stone-uti→kidney-stone-treatment, swelling→kidney-swelling-treatment) via `deploy/nginx-riims-bootstrap.conf`. |
| `/blog/{9 slugs}.html` | Blog articles | breadcrumb + Article JSON-LD |
| `/conditions/liver/` | Liver Diseases hub | 12 condition cards via `categoryHubPage` + disclaimer + CTA; breadcrumb + CollectionPage schema (see §26) |
| `/conditions/liver/{12 slugs}.html` | Liver condition pages | raised-sgpt-sgot, fatty-liver, drug-herb-induced-liver-injury (Task 2); fatty-liver-grade-2, fatty-liver-diet, liver-function-test-report, jaundice, hepatitis-b, hepatitis-c, liver-cirrhosis, alcoholic-liver-disease, liver-abscess (Task 3) — each breadcrumb + MedicalWebPage + FAQPage JSON-LD (see §26). The liver silo is now complete (12/12). |
| `/conditions/general/` | General & Lifestyle Diseases hub | 12 condition cards via `categoryHubPage` + disclaimer + CTA; breadcrumb + CollectionPage schema (see §26) |
| `/conditions/general/{12 slugs}.html` | General condition pages | diabetes-and-kidney-disease, uric-acid-gout (kidney bridges), type-2-diabetes, prediabetes, hypothyroidism, hyperthyroidism, obesity, metabolic-syndrome, insulin-resistance, vitamin-d-deficiency, vitamin-b12-deficiency, thyroid-in-pregnancy — each breadcrumb + MedicalWebPage + FAQPage JSON-LD. The general silo is now complete (12/12). |
| `/conditions/heart/` | Heart hub | 8 condition cards via `categoryHubPage` + disclaimer + CTA; breadcrumb + CollectionPage schema (see §26) |
| `/conditions/heart/{8 slugs}.html` | Heart condition pages | heart-attack-warning-signs (pure emergency page, built first), high-blood-pressure, bp-and-kidney-disease (kidney bridge), high-cholesterol, triglycerides, heart-failure, atrial-fibrillation, rheumatic-heart-disease — each breadcrumb + MedicalWebPage + FAQPage JSON-LD (see §26). The heart silo is now complete (8/8); all 4 disease categories are fully populated. |

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
  opening hours. `clinicGraph()`'s `description` (in `generate.mjs`) is **kidney-led but honest
  about the other 3 categories** as of Task 6 ("...care for high creatinine, CKD, kidney failure
  and dialysis guidance, plus in-house liver, heart and metabolic disease care, alongside
  Ayurveda-supported lifestyle care"), and `medicalSpecialty` now lists `['Nephrology', 'Internal
  Medicine', 'Hepatology', 'Cardiology', 'Endocrinology']` (was Nephrology + Internal Medicine
  only). Plus `FAQPage` on home + contact; `BreadcrumbList` + `MedicalWebPage` + a per-condition `FAQPage` (mirrors the visible Q&A-style sections) on each condition; `BreadcrumbList` + `Article` (with `datePublished`/`dateModified`) on each blog post; and a **`Physician`** node per doctor on the doctors page (`physiciansGraph()`, from the admin roster — for doctor rich results + E-E-A-T).
- `sitemap.xml` (84 indexable URLs, `lastmod`, priority; 404 excluded) + `robots.txt`.
- One `<h1>` per page (home H1 is keyword+local: "Kidney Care in Delhi-NCR & Baraut — High
  Creatinine, CKD, Dialysis & Diet Guidance"; home `<title>` targets "Kidney Specialist in
  Delhi-NCR"), semantic landmarks, `aria-hidden` on decorative icons, `role="img"`
  + `aria-label` on image tiles. Lucide is **self-hosted** (pinned) — no CDN dependency.
- Branded **404 page**, real **Google Maps embed** on contact, all off-site links `rel="noopener"`.
- **NAP matches the Google Business Profile** (synced 2026-07-17 from the owner's GBP —
  "RIIMS – Rashtriya Institute of Integrated Medical Sciences", kgmid `/g/11nq2qr_sq`, category
  Hospital, 5.0 from 8 reviews). Address `Medicity Hospital, Kotana Rd, Baraut, Bohla, Uttar
  Pradesh 250611`; **Open 24 hours** (schema says all 7 days 00:00–23:59). Google cross-checks
  the LocalBusiness schema against the GBP, so **if the GBP changes, change `data/content.json →
  site` (or Admin → Settings) in the same breath** — the site previously advertised "Mon–Sat,
  9am–7pm" against a 24-hour profile, which both contradicted Google and told a night-time
  emergency patient the door was shut.
- **Already set for go-live:** `SITE.origin = https://riimshospitals.com`. Off-site actions that
  remain (only you can do): verify the domain + submit `sitemap.xml` in Google Search Console,
  finish GBP verification ("Get verified" is still pending on the profile), and give
  `SITE.geo` the exact clinic coordinates — those are still the pre-GBP estimate
  (29.1066, 77.2637) and are **not** confirmed against the profile. The contact map embed keys
  off `mapsQuery` (the exact GBP name), so the visible pin is right either way; `geo` only feeds
  schema. See DEPLOY.md §6.
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
| Domain | `riimshospitals.com` (non-www canonical; `http`→`https` 301; `www`→apex 301 — added to `deploy/nginx-riims-bootstrap.conf` 2026-07-17 after an SEO audit found `www` serving the full site as a 200 duplicate. **Needs the §18.4 re-apply on the VPS to go live.**) |
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
bash /opt/riims/deploy/update.sh   # git fetch + reset --hard origin/main, then rebuilds
```
Static files are served straight from disk — no nginx reload. Use the helper rather than a bare
`git pull`: it also re-runs the generator, so admin edits in `content.local.json` are re-applied
on top of the new code (a plain pull would leave `site/` showing the repo's content until the
next rebuild) and `data/pages-manifest.json` is refreshed for the Pages / SEO tab.

> **If the change touched `admin/` (server or UI), that is NOT enough.** The admin runs as a
> long-lived container that already has `server.mjs` loaded, so add:
> ```bash
> docker compose -f /opt/riims/docker-compose.admin.yml restart
> ```
> `docker-compose.admin.yml` bind-mounts the repo into a stock `node:24-alpine`, so a restart
> is sufficient — nothing to rebuild. UI-only changes (`admin/ui/*.js|css`) need no restart, but
> hard-refresh the browser (Ctrl+Shift+R) to get past its cache. Passwords never need a restart
> (`getConfig()` re-reads the file every request).

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

### 18.7b Semrush audit (2026-07-17) — what was fixed and what was deliberately not

An external Semrush Site Audit (health 96%, top-10% benchmark 92%) prompted these changes:
- **`medicalSpecialty` was invalid markup on every page** — schema.org defines
  MedicalSpecialty as a *closed enumeration* and we were sending free text. Now enum values:
  clinic = `Renal, PrimaryCare, Gastroenterologic, Cardiovascular, Endocrine`; doctors via
  `specialtyOf()` → `Renal`/`DietNutrition`/`PrimaryCare`, and **AYUSH doctors get no
  `medicalSpecialty` at all** (no Ayurveda enum exists; omitting is honest and valid).
- **`/llms.txt`** now generated every build from the `pages` array (AI-search convention;
  Semrush flagged its absence). Curated markdown map, ~81 links, auto-includes new pages.
- **Legacy GoDaddy-shop URLs** still requested by crawlers (`/shop`, `/ols/*`,
  `/privacy-policy`, `/terms-and-conditions`) now 301 to real pages in the nginx config
  (needs the §18.4 re-apply to go live).
- **Backlink profile is the real problem Semrush surfaced**: Authority Score 2, 17 backlinks
  almost all from PBN/Fiverr-promo link farms ("Dangerous — direct link farms"). Disavow
  starter file: `docs/disavow-riimshospitals.txt` — export the full referring-domain list from
  Semrush, complete the file, upload at https://search.google.com/search-console/disavow-links.
  **Nobody should ever buy links for this site.**
- **Deliberately NOT done:** "Low text-to-HTML ratio" (49 pages) — an artifact of the inline-style
  design system; Google does not use that ratio and a rewrite risks the ranking pages for zero
  gain. "Unminified JS/CSS" — gzip already compresses 8×; a hand-rolled minifier risks breaking
  the site to save ~3-4KB per asset. Revisit only with a real build-tool decision.

### 18.8 Post-launch SEO actions (off-site; not in code)

1. **Google Search Console** → verify `riimshospitals.com` → submit `https://riimshospitals.com/sitemap.xml`.
2. **Google Business Profile** (Baraut clinic) — #1 lever for local/"near me" searches. The
   profile exists and its NAP/hours are now mirrored on the site (§16 note). Still open: click
   **Get verified** on the profile (unverified edits do not show), and set `SITE.geo` to the exact
   coordinates — right-click the pin in Google Maps and copy the two numbers, then paste them in
   Admin → Settings.
3. Real doctor names/photos + Google reviews; replace the 9 templated blog articles with full originals.

## 19. How to make common changes

- **Change phone / WhatsApp / address / hours / social / maps / geo / CTA copy** → **Admin → Settings**
  (no code). Only the `domain`/`origin` and business/legal *name* stay in `build/data.mjs` (`SITE`).
- **Edit copy that has an admin tab** (doctors, blogs, reels, testimonials, FAQs, services, why, steps,
  about, legal, protocol FAQs, search) → **use `/admin/`** (see §23) — it rebuilds automatically.
  Code defaults live in `build/data.mjs` / `build/pages.mjs`.
- **Edit a condition page's title / meta / H1 / text** (any of the 47) → **use `/admin/` →
  Pages / SEO** (§23). Its `redFlags` + `sources` are locked as safety content — those stay code.
- **Edit code-only copy** (condition `redFlags`/`sources`, the 6 specialist pages `SPECIALISTS`,
  the 7 guides, `NAV`, footer columns, disclaimers) → `build/data.mjs` / `build/pages.mjs` /
  `build/guides/*` → `npm test` → push.
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

- 🔴 **Dr. Abhishek Gupta is titled "Senior Nephrologist" in Admin → Doctors while his
  qualification field says B.A.M.S. Change that title.** Live as of 2026-07-17 on
  `/doctors.html` and the homepage. A B.A.M.S. practitioner presented as a nephrologist
  misrepresents a qualification under Indian law, and it directly contradicts
  `/doctors/best-nephrologist-delhi-ncr.html`, which tells patients plainly that he is not one —
  a patient sees both, one click apart. Use the wording the rest of the site already uses:
  **"Founder & Senior Kidney-Care Physician"** (`SPECIALIST_DOCTOR.role` in `build/pages.mjs`).
  The admin now **refuses** to save an AYUSH qualification under an allopathic-specialty title
  (`checkDoctors()` in `admin/server.mjs`), so this cannot recur — but the value already saved
  stays live until someone edits it.
  *Note for future readers:* `data/content.json → doctors` still holds the old six mock names
  (Dr. A. Sharma etc.). That is the **repo default only** — the VPS `content.local.json` overrides
  it with the three real doctors, who carry real Reg. Nos. Do not diagnose the live roster from
  the repo; check the live page or Admin → Doctors.
- **Review what the SEO contractor publishes — this is a standing owner task, not a one-off.**
  The `seo` role can rewrite the title, meta description, H1 and body text of all 47 disease
  pages. `build/compliance.mjs` refuses the obvious illegal claim, but **a denylist cannot catch
  a fluent promise that avoids the banned words** ("your reports will be normal again", "you
  won't need dialysis"). On a YMYL medical site under the Drugs & Magic Remedies Act the
  liability is the hospital's, so read their edits — Admin → Pages / SEO marks every changed
  page with an **edited** badge, which is the review queue. See §23.
- **Doctors for the new categories.** Liver/heart/metabolic pages are live, but the Doctors list
  is still nephrology-led. The owner has confirmed in-house specialists exist for these — adding
  them (with Reg. No.) in Admin → Doctors is what makes the E-E-A-T claim on those pages true.
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

### Two logins: owner and SEO

| Role | Password | Sees |
|------|----------|------|
| **owner** | `node admin/set-password.mjs '<pass>'` | Everything, including **Leads** (patient names/phones) |
| **seo** | `node admin/set-password.mjs --seo '<pass>'` | Everything **except Leads** — for an outside SEO contractor |

Both hashes live in `data/admin-config.json` (gitignored): `{salt, passHash, secret, seoSalt?, seoPassHash?}`.
Owner mode rewrites the file but preserves an existing SEO credential; `--seo` requires the
owner password to exist first and never touches it.

**The Leads block is server-side, not cosmetic.** The role is signed into the session token
(`makeToken` → `<exp>.<role>.<hmac>`, verified by `getRole`), so it cannot be forged in the
browser, and `admin/server.mjs` refuses `/api/admin/leads*` with **403** for the seo role
before any handler runs. The UI also hides the Leads tab and boots the seo role straight to
Pages / SEO — but that is only so the button isn't there to click; the 403 is the real guard.
The seo role never *requests* leads on boot (a 403 inside the boot `Promise.all` would blank
the panel).

A password change needs **no restart** — `getConfig()` re-reads `admin-config.json` on every
request. (The container restart in the setup block below is for the `server.mjs` **code**, not
the password.)

> **Rotating the OWNER password logs the SEO contractor out.** Owner mode mints a fresh session
> `secret`, which invalidates every signed cookie — both roles. The SEO *credential* survives
> (see the table), so they just log in again with the same password; nothing is broken.
> **Token format changed** when this landed (`exp.sig` → `exp.role.sig`). Old cookies are
> invalid, so everyone logs in once more after deploy. If `seoSalt`/`seoPassHash` are absent,
> the SEO login simply fails with "Wrong password" — nothing crashes.

### What it controls
| Tab | What you can do |
|-----|-----------------|
| **Pages / SEO** | **Owner + SEO role.** Every page on the site, listed from `data/pages-manifest.json`, grouped (Main pages / Category hubs / Kidney·Liver·Heart·General conditions / Specialists / Blogs / Guides / Legal / System) with a find-a-page filter. Each row carries a **serial number** (1…91), numbered once over the full list in display order — so a page keeps its number while you filter (searching "fatty liver" shows its real numbers, not 1/2/3) and "page 47" means the same page to everyone. Per page: **Google title** (60-char counter), **meta description** (155-char counter — the build clamps at 155 anyway via `clampDesc`), **H1**, and a **noindex** toggle (also drops it from `sitemap.xml`; hiding a page asks for confirmation first). Condition pages additionally expose their six text fields — `intro` (which also feeds the meta description and the MedicalWebPage JSON-LD; `aboutTitle`/`about`/`when`/`approach` feed the FAQPage schema), `aboutTitle`, `about`, `when`, `symptoms[]`, `approach[]` (one per line). **An empty box means "use the built-in default"**, so clearing a field always restores the original page — and "Reset to default" drops the override entirely. 🔒 `redFlags` (emergency box) and `sources` (citations) are **not** editable here: they are safety content and the server rejects them outright. Saves to `pagesSeo` / `conditionEdits`. |
| **Leads** | **Owner only** (the seo role gets 403). Every appointment-form submission lands here (Name, Phone, Problem/Disease). Status pipeline (new → contacted → booked → closed), notes, one-click WhatsApp reply to the patient, delete, CSV export. Stored in `data/leads.json`. |
| **Doctors** | Add/remove/edit doctors — name, title, qualifications, **Registration No.** (`reg`, e.g. `DBCP A/7368` — shows as a "Reg. No." line with a verified badge on each doctor card + a `Physician.identifier` in JSON-LD for E-E-A-T), specialties, languages, photo upload, **↑/↓ reorder** (order matters: first 3 drive the about-page trio, and the first nephrologist is the search "Specialist for you"). Drives the doctors page, home experts carousel, and the about-page trio. |
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
- **Compliance guard (`build/compliance.mjs`).** **Every** content save is scanned by
  `checkPayload()`; a hit is refused with **400** naming the phrase and the field, and the
  panel shows it in a red toast. The `BANNED` rules cover: 100% cure (incl. "100 percent",
  "１００％"), guaranteed cure/recovery **in either order** ("cure guaranteed"), permanent
  cure, stop dialysis, no more dialysis, reverse kidney/renal/liver/heart failure **or
  damage**, free-from-X-forever, goodbye-to-dialysis, money-back (strict — no exemption),
  miracle cure, and Hindi/Hinglish forms (पक्का इलाज, गारंटी से इलाज, जड़ से खत्म, chutkara,
  "thik ho jayega", "ilaj ki guarantee"). Input is NFKC-normalised and zero-width characters
  are stripped first, so fullwidth/padded spellings cannot slip past.
  **Exemptions** (so honest copy keeps saving) — a match is allowed only when it is negated
  **within its own sentence**, before or after ("No *100% cure* … promises, ever." / "A
  miracle cure does not exist."), or sits in a sentence that both ends in "?" **and** opens
  with a question word ("Can Ayurveda give a 100% cure for CKD?" — an FAQ heading answered
  "No."). Negation deliberately does **not** cross a sentence boundary: allowing that let
  real claims through ("We never make false claims. Our treatment is a permanent cure.").
  The cost is that a two-sentence denial ("Many clinics promise a permanent cure. RIIMS does
  not.") is refused — rewrite it as one sentence with a dash. Copy that warns about someone
  else's claim is exempt via "cautious/wary/beware of" and "claim(s)/promise(s) **of**".
  Verified: flags **zero** of the existing `content.json` / `CONDITION_SETS` / `GUIDES` /
  `POSTS` copy, blocks 19/19 realistic cure claims, and scans 2MB in ~48ms (the sentence
  scan is bounded to ±400 chars — an unbounded one was quadratic and could freeze the
  server, taking the public `/api/lead` booking endpoint down with it).
  > **A denylist cannot catch a fluent claim that avoids the words** ("your reports will be
  > normal again"). This is a tripwire, not sign-off: an outside contractor's edits to the
  > 47 disease pages still need a human to read them before they are trusted.
- **The Tracking tab cannot carry page copy.** `validateSection` refuses any `<meta>`/`<link>`
  line whose `name`/`property` is `description`, `robots`, `title`, `keywords`, `canonical`,
  `og:*` or `twitter:*` — the generator emits those itself, so accepting them would ship a
  duplicate tag **and** put unreviewed ad copy in every page's `<head>`. That box is only for
  verification tags (Search Console / Bing / Facebook).
- **Shape validation** (`validateSection`, owner and seo alike) for the two new sections:
  page keys must look like paths, condition keys must be `<cat>/<slug>`, only the whitelisted
  fields are accepted, `redFlags`/`sources` are refused, and **`<` is rejected** — condition
  text is injected into HTML unescaped by `build/pages.mjs`, so no tags may enter through it.
- Image uploads go to `site/assets/uploads/` (gitignored) via base64 JSON (10MB nginx cap).
- The public form (`site/js/site.js`) POSTs to **`/api/lead`** on submit (single step:
  name/phone/problem). Honeypot field + 10/min/IP rate limit. Leads go ONLY to the admin
  panel (no WhatsApp redirect, per owner request).
- Auth: scrypt password hash(es) + HMAC-signed 7-day session cookie carrying the role
  (`data/admin-config.json`, created by `node admin/set-password.mjs '<password>'`, plus
  `--seo` for the SEO role). UI is `noindex`.

### How Pages / SEO reaches the built site
- **`data/pages-manifest.json`** — a gitignored **build artifact** rewritten by *every*
  `node build/generate.mjs` (so also by `deploy/update.sh` and `npm test`; it self-heals and
  can never go stale). It is the `pages` array reduced to data — `{path, out, type, cat?,
  slug?, title, desc, h1, noindex, fields?}` — captured **before** overrides are applied, so
  it always carries the built-in defaults the panel shows as placeholders. `type` is derived
  from the URL shape by `classify()`, which is why **any page added later appears in the tab
  on its own, with nothing to register**. Served by `GET /api/admin/pages`; before the very
  first build the endpoint answers `{pages: [], needsBuild: true}` and the tab says so.
- **`pagesSeo`** → applied in `generate.mjs` after the manifest write: non-empty `title`/`desc`
  replace `p.title`/`p.desc`; a non-empty `h1` is swapped into the page body by regex
  (`check.mjs` guarantees exactly one `<h1>`), escaped through `esc()` and replaced with a
  **function-form** `.replace()` so a `$` in the heading stays literal; `noindex: true` adds the
  robots meta and drops the page from `sitemap.xml`.
- **`conditionEdits`** → applied in `data.mjs` right after `CONDITION_SETS`, mutating the
  condition objects in place. Because `conditionPage()`, the derived meta description and the
  JSON-LD all read those same objects, an edited `intro` updates the page, the `<meta>` and the
  schema together. `CONDITION_DEFAULTS` snapshots the six fields **before** any edit, so the
  panel's placeholders and "reset to default" stay truthful. Only non-empty values win — an
  empty string or empty array means "no override" (this is what stops an empty `symptoms: []`
  from rendering an empty grid).
- **Both default to `{}`, so with nothing saved every page is byte-for-byte what it was before
  this feature existed** — verified by diffing the whole `site/` tree. That is what protects
  the kidney pages' rankings.

### VPS setup (one-time)
```bash
cd /opt/riims && git pull
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node admin/set-password.mjs 'STRONG-PASSWORD'
docker compose -f docker-compose.admin.yml up -d
cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals   # adds /admin + /api proxy
certbot --nginx -d riimshospitals.com -d www.riimshospitals.com --redirect --non-interactive --reinstall
nginx -t && systemctl reload nginx
```

### Giving the SEO contractor access (on the VPS)
```bash
ssh root@187.127.132.106
bash /opt/riims/deploy/update.sh                     # pull the code + rebuild
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node admin/set-password.mjs --seo 'STRONG-SEO-PASSWORD'
docker compose -f /opt/riims/docker-compose.admin.yml restart   # server.mjs changed → restart needed
```
Hand over that password only — never the owner one. `update.sh` alone does **not** pick up
`admin/server.mjs` changes: the container must restart.
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
- **Condition pages enriched** (`CONDITIONS` in `build/data.mjs`; originally 8, later restructured to
  **15** for SEO — see §14) — book-accurate `about`,
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

## 26. Multi-disease category expansion (Kidney / Liver / Heart / General)

The site expanded from kidney-only to **4 disease categories** — Kidney, Liver, Heart,
General — across 6 tasks (see `docs/superpowers/plans/2026-07-15-multi-disease-expansion.md`
and `docs/superpowers/specs/2026-07-15-multi-disease-expansion-design.md`), **now complete**.
**Task 1 was pure plumbing** (the generator learned about categories, no content). **Task 2
shipped the first real content: the liver silo's 3 flagship pages.** **Task 3 completed the
liver silo** — all 12 conditions live under `/conditions/liver/`, plus its category hub. **Task 4
completed the general/metabolic silo** — all 12 conditions live under `/conditions/general/`, plus
its category hub. **Task 5 completed the heart silo** — the highest-stakes category on the site
(education, risk management and emergency guidance, never treatment marketing) — all 8 conditions
live under `/conditions/heart/`; its category hub renders 8 cards. **Task 6 wired all 4 categories
into site-wide discovery** (see below) and corrected the site's positioning, which still called
itself kidney-only after the other 3 silos had shipped. The build emits **85 files** in total;
every existing kidney page stays byte-identical (content-wise) to before. All 4 disease categories
(Kidney, Liver, Heart, General) are fully populated **and discoverable** from the main nav.

### The model
- **`CATEGORIES`** (`build/data.mjs`, after the `CONDITIONS` map) — one entry per category key
  (`kidney`, `liver`, `heart`, `general`), each `{label, icon, blurb, hubTitle, hubIntro, dir}`.
  `dir` is the URL path segment for that category's condition pages (`''` for kidney, `'liver'`/
  `'heart'`/`'general'` for the others).
- **`CONDITION_SETS`** (`build/data.mjs`) — `{kidney: CONDITIONS, liver: LIVER, heart: HEART,
  general: GENERAL}`. `LIVER`, `HEART`, `GENERAL` are condition maps in the exact same shape as
  `CONDITIONS` (see §8). `LIVER` holds all **12** conditions (Task 2's 3 flagship pages +
  Task 3's remaining 9, two contiguous banner-commented blocks in `data.mjs` right after
  `CATEGORIES`). `HEART` now holds all **8** conditions (Task 5, one banner-commented block in
  `data.mjs` right after `LIVER`, before `GENERAL`). `GENERAL` holds all **12** conditions
  (Task 4: the two kidney-bridge pages + the remaining 10, two contiguous banner-commented
  blocks in `data.mjs` right after `HEART`).
- **URL rule — kidney deliberately stays flat, new categories nest one level deeper.** Kidney
  keeps `/conditions/<slug>.html` (it already ranks on Google for these URLs — moving them would
  be real business risk). Liver/Heart/General use `/conditions/<dir>/<slug>.html` (e.g.
  `/conditions/liver/fatty-liver.html`). This is why liver/heart/general pages need `base =
  '../../'` (two levels deep) versus kidney's `'../'` (see the `base` prefix system above).
- **`conditionPage(base, slug, cat = 'kidney')`** (`build/pages.mjs`) — looks the condition up via
  `CONDITION_SETS[cat]`, builds the category's URL prefix from `CATEGORIES[cat].dir`, and scopes
  the "Related topics" links to the same category. Defaulting `cat` to `'kidney'` means every
  existing call site (which doesn't pass `cat`) is unaffected.
- **Optional condition fields** (`redFlags`, `sources`) — added to the condition shape in Task 1;
  no kidney entry uses them (kidney pages render both blocks empty, unchanged from before). All
  12 liver conditions (Task 2 + Task 3), all 8 heart conditions (Task 5) and all 12 general
  conditions (Task 4) set both fields:
  - `redFlags?: { emergency: string[], soon?: string[] }` → renders `.riims-redflags`, a loud
    "Go to hospital now" box (via `redFlagBox()` in `pages.mjs`), placed **immediately after the
    reviewed-by line and before the "about" section** — a patient must not have to scroll past it.
    This matters most for heart/liver pages, where an emergency sign (e.g. chest pain) needs to
    outrank "book a consultation."
  - `sources?: [label, url][]` → renders `.riims-sources`, a citations list (via
    `sourcesBlock()`), placed after "when to consult" and before the disclaimer. Supports E-E-A-T
    and the spec's "bona fide scientific standpoint" argument for medical claims.
  - Both helpers return `''` when the field is absent, so kidney pages (which set neither) render
    identically to before.
- **Heading wording:** the when-to-consult heading reads **"When to consult a kidney doctor"**
  for `cat === 'kidney'` (preserving the exact string the live kidney pages already rank with) and
  the generic **"When to consult a doctor"** for every other category.
- **`generate.mjs`** — after the existing kidney `CONDITIONS` loop, two more loops run:
  1. A **category-hub loop** over `['liver', 'heart', 'general']` that pushes one
     `conditions/<dir>/index.html` per category (`body: categoryHubPage('../../', cat)`;
     `BreadcrumbList` + `CollectionPage` JSON-LD).
  2. The **condition loop** over `['liver', 'heart', 'general']` × `Object.keys(CONDITION_SETS[cat])`,
     pushing a page per condition: `BreadcrumbList` + `MedicalWebPage` + **`FAQPage`** JSON-LD (the
     `FAQPage` block was added in Task 2 — it mirrors kidney's own condition-loop FAQPage exactly,
     built from `c.aboutTitle`/`c.about`, a "When should I consult a doctor about …" question from
     `c.when`, and a "How does RIIMS approach …" question from `c.approach`; kidney's loop keeps its
     own near-identical block with kidney-specific wording, so the two are not shared code, by
     design, to keep the kidney string frozen). As of Task 5, all three sets are populated: 12
     liver + 8 heart + 12 general conditions produce 32 condition pages, plus 3 category-hub
     pages = 35 pages from this part of the generator.

  `mkdirSync` pre-creates `site/conditions/{liver,heart,general}/` for all three categories.
- **CSS** (`site/css/site.css`) — `.riims-redflags` (danger-toned card, `var(--danger)`/
  `var(--danger-soft)` tokens, which already existed in `colors.css`) and `.riims-sources`
  (a plain top-border list block), added near the other component blocks (after
  `.services-grid`, before the responsive breakpoints).

### Liver silo content (Task 2 + Task 3, complete at 12 conditions)
Task 2 shipped the first 3 pages, chosen as the beachhead because `raised-sgpt-sgot` is the liver
equivalent of "high creatinine" (a scared patient holding a lab report — a query hospital sites
do not otherwise serve):
- **`raised-sgpt-sgot`** — reading SGPT/SGOT together (not in isolation), common Indian causes,
  reference ranges, FIB-4 as a next step.
- **`fatty-liver`** — the two facts patients get wrong most often: ultrasound grades measure fat,
  not scarring, and lean/thin-fat NAFLD means a normal BMI does not rule it out in the Indian
  population (waist matters more than weight). States the weight-loss reversibility figure
  precisely (NASH resolved in 90% but fibrosis regressed in only 45%, and only ~10% of patients
  achieved that much loss) and that cirrhosis itself is not undone by weight loss; also flags
  that cardiovascular disease, not liver disease, is the leading cause of death in these patients.
- **`drug-herb-induced-liver-injury`** — the site's honesty play: names anti-TB drugs as India's
  commonest DILI cause (46%, INDILI network) and giloy (*Tinospora cordifolia*) as the top
  herb-induced cause (a 43-patient multicentre study found no contamination — the herb itself, not
  an adulterant), while distinguishing concentrated turmeric extracts from turmeric as a cooking
  spice so it does not needlessly frighten people. Explicitly warns never to stop anti-TB
  treatment unsupervised, and asks patients to disclose every product they take, including RIIMS's.

Task 3 added the remaining 9, completing the silo:
- **`fatty-liver-grade-2`** — the "stage-3-ckd long-tail" pattern applied to liver: Grade 2 defined
  precisely (moderate echogenicity increase with reduced visibility of the portal vein wall and
  diaphragm), and the repeated point that the grade measures fat, not scarring — FIB-4/FibroScan
  is the actual next step for fibrosis risk.
- **`fatty-liver-diet`** — extends the RiiMS Renal Plate framing to the liver (same half-plate
  vegetables/grains/protein principle), with two liver-specific additions: added sugar as a direct
  driver of hepatic fat, and alcohol as a separate load on a liver that already carries fat.
- **`liver-function-test-report`** — states plainly that "LFT" is a misnomer (most components
  measure damage; only albumin, bilirubin and INR measure function), and that a cirrhotic liver
  with bleeding varices can still return a normal LFT. Full range table (SGPT 7–55, SGOT 8–48,
  bilirubin 0.1–1.2, albumin 3.5–5.0, ALP 45–115, GGT 0–50, INR 0.8–1.1) with a "labs differ, read
  your own report" caveat.
- **`jaundice`** — framed as a sign, not a disease; hepatitis E in pregnancy carries a reported
  mortality as high as 20–30%, so any pregnant woman with jaundice needs immediate hospital care.
  Handles local/folk remedies gently: most hepatitis A/E clears on its own within weeks regardless
  of what is taken, which is why home remedies appear to work — the real risk is the delay.
- **`hepatitis-b`** — never uses "cure": WHO's own line ("most people who start hepatitis B
  treatment must continue it for life") is used directly; HBsAg loss in only 3–5% after 10 years;
  not everyone needs treatment, many need only monitoring; India ~29 million (WHO 2024, attributed,
  not "40 million"); birth-dose vaccine within 24 hours vs. the honest coverage gap (86% third-dose,
  ~45% birth-dose).
- **`hepatitis-c`** — the one page on the whole site allowed to say "curable": the WHO framing
  ("curable in more than 95% ... 12–24 week course of tablets ... free under India's National Viral
  Hepatitis Control Programme") is used verbatim and appears nowhere else. No vaccine exists; the
  bottleneck is framed as diagnosis, not treatment.
- **`liver-cirrhosis`** — never "reverse"; uses the pinned line "Cirrhosis cannot be undone — but at
  every stage, treating the cause changes what happens next" (the one deliberate em dash in the new
  content, kept verbatim as instructed). Explains compensated vs. decompensated, and the
  encephalopathy red flag explicitly addresses the family ("often noticed first by family rather
  than the patient"). Surveillance message: ultrasound + AFP every 6 months for every cirrhosis
  patient.
- **`alcoholic-liver-disease`** — early stages (fatty liver, alcoholic hepatitis) improve
  substantially on stopping; established cirrhosis does not go back to normal, but survival still
  improves at every stage once drinking stops. AST:ALT ratio > 2 flagged as favoring an alcohol
  cause.
- **`liver-abscess`** — amoebic type, strongly linked to alcohol, typically men 18–50; treatable
  with medicine plus drainage when needed. Emergency framing centers on rupture risk (high fever
  with severe right-upper pain, breathlessness, sudden worsening).

All 12 carry `redFlags` and `sources` (2–3 real, linked citations each — WHO, NIDDK, AASLD,
Cleveland Clinic, AAFP, StatPearls/NCBI Bookshelf, PubMed, PMC, American Liver Foundation, India's
NVHCP). `related[]` links now form a fully-connected web across all 12 liver slugs (Task 2's 3
pages had their `related` lists widened in Task 3 to point at the new pages instead of only each
other, closing the gap Task 2 flagged). No dead links; verified by `npm test`.

### General/Metabolic silo content (Task 4, complete at 12 conditions)
The highest-value SEO category: diabetes, thyroid, obesity, uric acid and vitamin deficiencies sit
behind most of the site's kidney and liver traffic. Built with two "bridge" pages first, chosen
because they raise topical coherence with the existing kidney silo rather than dilute it:
- **`diabetes-and-kidney-disease`** ⭐ — the primary bridge. States that protein in urine
  (microalbuminuria) appears before creatinine rises, and inline-links (plain `<a>` tags inside
  `about`, not `related[]`) to the existing flat kidney pages `../diabetic-kidney-disease.html`
  and `../hypertensive-kidney-disease.html`.
- **`uric-acid-gout`** ⭐ — the second bridge, linking gout, kidney stones and CKD. States the ACR
  2020 conditional recommendation *against* urate-lowering drugs for asymptomatic hyperuricaemia (a
  high number alone is not a disease), that serum urate can be normal during an acute attack, and
  the septic-arthritis red flag (fever + hot swollen joint = emergency until proven otherwise).
  Inline-links to `../kidney-stone-treatment.html` and `../ckd.html`.
- **`type-2-diabetes`** — never "cure"/"reverse"/"get off insulin". Uses the ADA/EASD 2021 remission
  definition verbatim (HbA1c <6.5% sustained ≥3 months after stopping all glucose-lowering
  medication) without ever writing the word the panel deliberately avoided, and states why: implying
  the condition was gone for good would wrongly suggest follow-up can stop. Quotes DiRECT in full
  (46% at 1 year → 36% at 2 years → 13% at 5 years, never 46% alone) and flags that DiRECT enrolled a
  Scottish, non-insulin, ≤6-year-diabetes population, so generalisability to Asian Indians is not
  established. Notes Look-AHEAD found no cardiovascular benefit from lifestyle alone in established
  diabetes.
- **`prediabetes`** — uses the Indian IDPP-1 trial (3-year incidence 55.0% control → 39.3%
  lifestyle; metformin added nothing on top of lifestyle), not the US DPP. States ICMR-INDIAB
  prediabetes prevalence (15.3%) and that Uttar Pradesh has India's lowest measured diabetes
  (4.8%) but a low diabetes:prediabetes ratio (large unconverted pool) — framed as prevention
  mattering *most* here, never "UP is safe".
- **`hypothyroidism`** — does not overclaim lifelong treatment for everyone: states the 2019 BMJ
  Rapid Recommendations strong recommendation *against* treating subclinical hypothyroidism (21 RCTs,
  n=2,192, no quality-of-life benefit), the exceptions where treatment stays standard (pregnancy/
  planning, TSH >10, anti-TPO+ with symptoms, children), and India prevalence 10.95% (8-city study).
- **`hyperthyroidism`** — Graves' at 50–80% of cases. The agranulocytosis safety point (fever or sore
  throat on anti-thyroid drugs needs an urgent white-cell count) is stated in the about text, the
  approach list, the red-flag box and the "when" line, worded each time to direct the patient to
  urgent testing and their prescribing doctor rather than to self-directed stopping of medicine.
- **`obesity`** — leads with waist circumference (≥90 cm men / ≥80 cm women, stable across Indian
  frameworks) ahead of BMI; states which BMI threshold is used (the 2025 revision, >23) rather than
  mixing it with the 2009 consensus's ≥25. Realistic framing: 3–5% weight loss improves triglycerides/
  glucose, 5–10% improves BP/lipids; no promised kilogram figure.
- **`metabolic-syndrome`** — IDF South Asian criteria stated precisely: waist ≥90/≥80 mandatory, plus
  any two of TG ≥150, HDL <40/<50, BP ≥130/85, FBS ≥100.
- **`insulin-resistance`** — states plainly that HOMA-IR and fasting insulin are research tools with
  no validated Indian cut-off, not routine diagnostics, and that they are marketed in health-check
  packages beyond what the evidence supports; redirects to assessing consequences (waist, HbA1c,
  lipids, BP, liver) instead.
- **`vitamin-d-deficiency`** — states the Endocrine Society's 2024 guideline against routine screening
  of asymptomatic adults under 75, and cites a real Indian (Kashmir) case series where mega-dose,
  unmonitored intramuscular injections caused genuine toxicity.
- **`vitamin-b12-deficiency`** — the safety point stated directly: high-dose folic acid can correct the
  anaemia of B12 deficiency while nerve damage continues unrecognised, so B12 must be checked before
  folic acid is given for an unexplained anaemia. Flags metformin as a common, under-screened cause.
  Uses "may not fully recover" for long-standing nerve damage, never "reverse".
- **`thyroid-in-pregnancy`** — not on any Drugs & Magic Remedies Act Schedule (lowest legal risk of
  the 12). States that any woman on thyroid medication who becomes pregnant needs immediate TSH
  testing and a dose review against trimester-specific ranges, and is the page that explains directly
  why stopping thyroid medication on natural-remedy advice during pregnancy is dangerous.

All 12 carry `redFlags` and `sources` (2–3 real, linked citations each — NIDDK, KDIGO/Annals of
Internal Medicine, PMC, PubMed, Lancet Diabetes & Endocrinology, NEJM, Diabetologia, BMJ, StatPearls/
NCBI Bookshelf, IDF, Circulation, Endocrine Society, NIH Office of Dietary Supplements, the American
Thyroid Association). `related[]` forms a fully-connected web across all 12 general slugs; the two
kidney cross-links live as inline `<a>` text inside `about` (verified resolving, not via `related[]`,
since the related-link builder only ever targets the current category's own directory). No dead
links, no em dashes, no banned compliance words (`cure`, `guaranteed`, `permanent`, `reverse`, etc.);
verified by `npm test` and a source grep on the `GENERAL` block.

### Heart silo content (Task 5, complete at 8 conditions)
The highest-stakes category on the site: a wrong move on a heart page can get someone killed, so
these pages are framed strictly as education, risk management and emergency guidance, never
treatment marketing. RIIMS manages blood pressure, cholesterol and cardiovascular risk and
coordinates emergency/specialist care; it never claims to "reverse" a blockage or avoid
bypass/angioplasty — the Drugs & Magic Remedies Act 1954 Schedule lists heart disease (#26),
high/low blood pressure (#27) and arteriosclerosis (#2), and "reverse heart blockage without
surgery" is exactly the claim behind the Patanjali Supreme Court proceedings. Built with the
highest-risk page first:
- **`heart-attack-warning-signs`** ⚑ — built first, as instructed, because it is the page most
  likely to matter. A pure emergency page: the AHA warning signs verbatim (chest discomfort
  lasting more than a few minutes or that comes and goes; discomfort in one or both arms, back,
  neck, jaw or stomach; shortness of breath; cold sweat, nausea, lightheadedness), the exact
  instruction "Call an ambulance ... Do not drive yourself. Minutes matter," and the heart attack
  vs. cardiac arrest distinction in the AHA's own words — a circulation problem (person usually
  awake and talking) vs. an electrical problem (unresponsive, not breathing normally, or only
  gasping). States Hands-Only CPR can work as well as CPR with breaths, and gives India's
  bystander-CPR context (1.3–9.8%, AED use ~1%, PMC review) without ever publishing an unverified
  "10% per minute" survival figure. The local emergency number is hedged as "in most of India, 108
  or 112" throughout, never stated as a single fixed number.
- **`high-blood-pressure`** — Schedule #27. States plainly that it is usually symptomless and
  diagnosed only by repeated measurement. Cites the same ICMR-INDIAB Lancet paper already used for
  diabetes in `GENERAL` (35.5% prevalence, confirmed as the correct source for this exact figure).
  🚨 BP ≥180/120 with chest pain, breathlessness, severe headache, vision change, weakness or
  slurred speech; F.A.S.T. stroke guidance with "call emergency services even if the symptoms go
  away" stated verbatim.
- **`bp-and-kidney-disease`** ⭐ — the bridge. Cross-links the existing flat kidney page as a plain
  inline `<a href="../hypertensive-kidney-disease.html">` inside `about` (not via `related[]`,
  same pattern as the two `GENERAL` bridge pages), verified resolving by the check script and a
  direct `path.resolve` test.
- **`high-cholesterol` / `triglycerides`** — both state plainly that there are no symptoms in
  almost all cases, and that Indians tend toward high triglycerides with low HDL rather than the
  Western high-LDL pattern (cited to a PMC South Asian lipid review), so risk is read as a whole
  profile rather than the LDL number alone. `triglycerides` states the >500 mg/dL pancreatitis
  threshold from the Endocrine Society guideline. Family history of a heart attack before 55
  (men)/65 (women) is flagged as a familial hypercholesterolaemia signal (CDC-sourced).
- **`heart-failure`** — states plainly the heart is still beating but too weak or stiff to pump
  well, and that it is managed with ongoing care, not a one-time fix (the word "cured" is never
  used, even in negation). India context sourced to the National Heart Failure Registry (patients
  ~10 years younger than high-income-country registries) and the Trivandrum Heart Failure Registry
  (ischaemic cause 72%, only ~25% received guideline-directed therapy at discharge). Never
  publishes the US-rate-extrapolated "22.7 million India prevalence" figure. 🚨 severe
  breathlessness at rest or waking gasping, pink frothy sputum, chest pain, fainting.
- **`atrial-fibrillation`** — states plainly it is often symptomless, linked with roughly a
  fivefold stroke-risk increase (CDC-sourced). India's difference, sourced to the IHRS-AF
  registry: patients more than a decade younger, with rheumatic valve disease present in close to
  half of registry patients (vs. mostly older-age causes in the West) — echo, not just ECG, is
  what finds it. Never publishes the 0.196% Nagpur pilot-study prevalence figure. 🚨 chest pain,
  severe breathlessness, fainting, plus any stroke sign.
- **`rheumatic-heart-disease`** — the one page allowed a prevention claim, and it is WHO's own:
  treating strep throat with appropriate antibiotics prevents rheumatic fever — prevention of the
  fever, explicitly never framed as reversing established valve damage. Valve damage stated as
  following rheumatic fever 20–30 years later. India figures: ~3.6 million, explicitly sourced as
  a 2011-census-based estimate, ~44,000 added yearly, prevalence fallen from 1–11/1000 (1970s–90s)
  to <1/1000 after 2000 (all PMC-sourced). The Andhra Pradesh echo-vs-stethoscope figures (7.6/1000
  vs. 0.7/1000) are stated together with the explanation that they measure different things (echo
  detection vs. clinical detection), never left to imply the disease itself became ~10× more
  common. WHO global figures (55 million affected, ~360,000 deaths) attributed to WHO by name. The
  benzathine penicillin access gap in Indian states is named directly, not glossed over.

All 8 carry `redFlags` and `sources` (2–4 real, linked citations each — American Heart Association,
CDC, WHO, Cleveland Clinic, American Stroke Association, PMC, PubMed, Lancet Diabetes &
Endocrinology, NIDDK, Endocrine Society/Oxford Academic). `related[]` forms a fully-connected web
across all 8 heart slugs; the one kidney cross-link (`bp-and-kidney-disease` → the flat
`hypertensive-kidney-disease` page) lives as inline `<a>` text inside `about`, verified resolving.
No dead links, no em dashes, no banned compliance words (`cure`, `guaranteed`, `permanent`,
`reverse`, `detox`, `cleanse`, `rejuvenate`, `miracle`, etc.); verified by `npm test` and a source
grep on the `HEART` block.

### Task 6 — wiring the 4 categories into site-wide discovery (complete)

By Task 5, all 4 category silos existed and were live, but nothing pointed a visitor at the 3 new
ones — the Treatments page (the owner's original ask) still showed only the 11-tile services grid,
the footer only linked kidney conditions, and the home search widget's legacy fallback data
(`HEALTH_DB`) still labelled Liver/Heart/Diabetes "Guided referral & support" — true before the
expansion, false after it (RIIMS treats those in-house now). Task 6 closed both gaps without
touching kidney's SEO anchor (home `<title>`/`<h1>` untouched, kidney's URLs untouched):

- **`servicesPage` (`build/pages.mjs`)** — added a 4-category grid (`categoryCard()`, new helper)
  above the existing services tiles: an `eyebrow('What we treat')` + `<h2>` + intro paragraph +
  one card per `CATEGORIES` entry (icon, label, blurb), linking to that category's hub. Kidney
  links to its existing flat hub `conditions/index.html`; Liver/Heart/General link to their nested
  hubs `conditions/<dir>/index.html`. This is the page that makes all 4 categories discoverable
  from the main nav ("Treatments") — the deliverable the owner originally asked for.
- **`footer(base)` (`build/chrome.mjs`)** — the "Conditions" footer column now appends the 3 new
  category-hub links (from `CATEGORIES`, computed as `[hubTitle, 'conditions/<dir>/index.html']`)
  after the 7 existing kidney condition links, so all 4 silos are one click away from every page.
  Kidney's own hub isn't repeated in the footer since NAV's "Kidney Diseases" link already covers it.
- **Mobile nav chips — deliberately unchanged.** `NAV` (`build/data.mjs`) still has 7 items; "Kidney
  Diseases" points at the kidney hub and "Treatments" now surfaces all 4 categories via the grid
  above. Adding category-specific chips would either bloat the always-visible chip bar or require
  restructuring `NAV`'s shape — both unnecessary now that Treatments does the job. No `NAV` or
  `CHIP_ICON` changes were made.
- **`HEALTH_DB` (`build/data.mjs`)** — Liver/Diabetes/Heart entries changed `doctor.title` from
  `'Guided referral & support'` to `'Integrated care at RIIMS'`. Cancer intentionally kept as
  referral & support (accurate, and the legally safer position — RIIMS does not treat cancer).
  Note: this dataset is legacy/unreachable code (see §8) — the live search widget is driven by
  `SEARCH`/`search-data.js`, which currently only defines kidney-labelled topics, so this fix is a
  data-hygiene correction rather than a change in live widget behavior. Adding real Liver/Heart/
  General topics to `data/content.json → search.topics` (via Admin → Search widget) remains
  available as a future follow-up, out of scope for this task's explicit interfaces.
- **`WHY` (`build/data.mjs`)** — first default card retitled "Kidney-focused institute" →
  "Kidney-led, integrated institute", description reworded to name liver/heart/metabolic care
  explicitly rather than imply kidney-only.
- **`clinicGraph()` (`build/generate.mjs`, Organization JSON-LD)** — `description` reworded to lead
  with kidney and name liver/heart/metabolic care as in-house (was "Kidney-focused... kidney diet
  and Ayurveda-supported lifestyle care", silent on the other 3 categories). `medicalSpecialty`
  extended from `['Nephrology', 'Internal Medicine']` to add `'Hepatology'`, `'Cardiology'`,
  `'Endocrinology'` — judged accurate given the owner's confirmation that RIIMS treats these
  in-house.
- **Not touched, by design:** home `<title>` ("Kidney Specialist in Delhi-NCR"), home `<h1>`
  ("Kidney Care in Delhi-NCR & Baraut..."), kidney's flat URLs, and the Cancer entry in `HEALTH_DB`.

Verification: `npm test` → 0 problems, 85 pages (unchanged — this task adds links/cards, not
pages). All 4 category hub links resolve from `services.html` and sitewide from the footer.
No `cure`/`guaranteed`/`reverse`/`permanent` language introduced in the new copy.

## 26b. Sitewide humanization pass (2026-07-17)

A 10-agent sweep removed AI-writing tells (Wikipedia "Signs of AI writing" criteria) from every
prose surface: the 4 condition registries (`data.mjs`), SPECIALISTS + page copy (`pages.mjs`),
LANDING (`landing.mjs`), the 7 guides (`guides/*.md` + `guides.mjs`), all 9 blog bodies + FAQs +
about/why/steps/cta (`content.json`), and the small UI copy (`sections.mjs`/`chrome.mjs`).
~300 prose em-dashes went, plus "journey/Crucially/It is important to note"-class vocabulary,
-ing tails and negative parallelisms. Untouched by design: numbers/ranges/citations, `redFlags`,
`sources`, disclaimers, compliance negations (negation stays in the same sentence as the claim),
kidney `intro`s (feed ranking meta descriptions — byte-identical), all titles/canonicals, the
home sr-only h1, refs-list "Source — Title" separators (bibliographic style, not prose).

Verified after the pass: npm test 0 (91 pages); ALL titles + canonicals byte-identical to the
pre-pass snapshot; kidney + home meta descriptions byte-identical (a bulk regex briefly rewrote
13 kidney intros mid-pass; caught by the ranking-fields diff and restored from git HEAD);
12 other pages' descs changed deliberately (intro/excerpt smoothing, all ≤155); zero number
drift across every diff hunk; compliance scan clean on all six content sets; external links
76/76 alive; live render sweep 30 templates clean; rendered AI-vocab scan: only literal uses
("saves the journey" = the road trip, "Elevate your feet" = raise your feet).

Known, pre-existing, deliberately not "fixed": condition-page FAQPage schema paraphrases the
page (its third answer joins `approach[]` with ". "), so schema text is not a verbatim substring
of the page. That predates this pass (156 such entries before, same pattern after) and fixing it
means rebuilding schema on ranking pages — a separate decision, not a humanization regression.

## 27. Delhi-NCR landing pages (the "where do I get treated" silo)

Six pages added 2026-07-17 from the owner's brief (`Need to create few new pages - RIIMS.docx`),
targeting place/intent keywords. Site went **85 → 91 pages**.

| URL | Registry | Targets |
|-----|----------|---------|
| `/doctors/kidney-specialist-delhi-ncr.html` | `SPECIALISTS` (pages.mjs) | "kidney specialist in Delhi NCR" |
| `/doctors/best-nephrologist-delhi-ncr.html` | `LANDING` (`dir:'doctors'`) | "best nephrologist in Delhi NCR" |
| `/chronic-kidney-disease-hospital-delhi-ncr.html` | `LANDING` | "CKD hospital in Delhi NCR" |
| `/conditions/high-bp-kidney-disease.html` | `CONDITIONS` (data.mjs) | "high BP kidney treatment in Delhi NCR" |
| `/affordable-kidney-treatment-delhi-ncr.html` | `LANDING` | "affordable kidney treatment in Delhi NCR" |
| `/best-kidney-failure-hospital-in-delhi-ncr.html` | `LANDING` | "best kidney failure hospital in Delhi NCR" |

### The `LANDING` type (`build/landing.mjs` + `landingPage()` in `pages.mjs`)
Same furniture as `specialistPage()`; different job. `dir` decides `/slug.html` vs
`/doctors/slug.html`; `points`/`body`/`faqs`/`when`/`related` drive the sections; `faqs` is
rendered **and** emitted as FAQPage schema (the two must stay identical — Google requires it).
`doctor: false` suppresses the founder card — used only on the nephrology page, see below.
Registered by a loop in `generate.mjs`; `classify()` files the root ones as `static` and the
`/doctors/` one as `specialist`, so all six appear in Admin → Pages / SEO automatically.

### Three decisions worth not re-litigating
1. **Nobody is called a nephrologist.** The brief asked for "Best Nephrologist in Delhi NCR"
   featuring Dr. Abhishek. He is **B.A.M.S. (Ayurvedacharya)**; a nephrologist holds MBBS + MD +
   DM. In India that misrepresentation is illegal, and it is what `pages.mjs:207` already forbade.
   The owner chose: name no doctor as a nephrologist. So the page targets the keyword while
   stating plainly that Dr. Abhishek does not hold that qualification and that RIIMS refers to
   nephrologists. Its FAQ answers "Is Dr. Abhishek Gupta a nephrologist?" with "No." — which is
   what Google lifts into the rich result. **Claims are about the named individual, never about
   the institution's staff** (the owner has in-house doctors not yet listed on the site, so
   "RIIMS has no nephrologist" would be an unverifiable negative).
2. **No "Best" in any visible `<h1>`/`<title>`** — the keyword stays in the URL slug only,
   following `best-kidney-doctor-delhi-ncr` (title: "Kidney Doctor in Delhi-NCR & Baraut").
3. **Geo stays honest.** The brief supplied `geo.placename: Delhi NCR` and ICBM `28.6139,77.2090`
   — those are Connaught Place coordinates. RIIMS is in **Baraut (29.1066, 77.2637)**. The brief's
   meta block was not used: the generator emits its own consistent `<head>`, and a second
   `<meta name="description">` would have been a duplicate. Every page says Baraut plainly; the
   CKD and affordable pages answer "Is there a Delhi branch?" with "No."

### Cannibalisation guard
Each landing page has an existing condition page it could have competed with. The split is
deliberate: **condition pages explain the disease, landing pages answer "where do I get treated"**.
`/conditions/high-bp-kidney-disease.html` (treatment, month-to-month) and
`/conditions/hypertensive-kidney-disease.html` (the disease) now link to each other — first entry
in each `related` — so Google reads them as one topic, not two rivals. If a landing page ever
starts re-explaining CKD, that split is broken.
`metaTitle` (new, optional, on a CONDITIONS entry) opts a page out of the auto
`"— Symptoms & Care | RIIMS"` title suffix, which fights a treatment-intent page.

### Internal linking (they were all orphans on first build)
A page nothing links to does not rank, whatever its content. Fixed: `doctorsPage()` now lists
LANDING `dir:'doctors'` entries beside SPECIALISTS; the three root pages sit in the sitewide
footer (Care + Institute columns); the BP page is linked from its condition sibling.

### `medicalSpecialty` is now derived, not assumed (`generate.mjs`)
`physiciansGraph()` hardcoded `medicalSpecialty: 'Nephrology'` on **every** doctor — which told
Google the B.A.M.S. Ayurveda lead was a nephrologist. It is now derived from each doctor's own
`quals`/`title` (`specialtyOf()`), with Ayurveda winning over a bare "Medicine" match so a BAMS
is never labelled allopathic.

Verification: `npm test` → 0 problems, 91 pages.

What changed on the 85 pre-existing pages, measured against a pre-feature baseline:
**no page changed its `<title>`, meta description, canonical, robots or `<h1>`** — the ranking
assets are untouched. What did change: all 85 gained the **3 new sitewide footer links** (that
footer is what de-orphans the landing pages); 61 also shifted their auto-numbered form-field ids
(`fld-name-259` → `-277` — the counter in `input()` moves when pages are added; invisible);
`doctors.html` gained **two** cards (kidney-specialist + nephrologist); `hypertensive-kidney-disease.html`
gained a 5th related link; and `doctors.html`'s Physician schema corrected 3 specialties (see
below). Byte-identical: 0/85 — expected, since the footer is on every page.

Reviewed by two QA agents (legal/medical/factual + build/SEO/render). Their findings are applied:
credential wording scoped to the named individual, the dialysis-timing "second opinion" turned into
a referral, hyperkalaemia + low-urine added to the BP page's red flags, all six de-orphaned, the
kidney-failure `intro` trimmed under clampDesc's 155 (it was losing the word "upfront" from
"we never promise cure, and say so upfront"), and `landingPage()` guarded against a missing
`points`/`related`. The second QA pass also caught this very note claiming only 62 pages changed —
that measurement predated the footer links.

### Doctor credential guard (`checkDoctors()` in `admin/server.mjs`)
A save to **Admin → Doctors** is refused when a doctor's `quals` name an AYUSH degree
(B.A.M.S./B.H.M.S./B.U.M.S./B.N.Y.S., or "ayurved/homeopath/unani/siddha") while their `title`
claims an allopathic specialty (nephrolog/cardiolog/hepatolog/urolog/oncolog/…/MBBS/MD/DM/MS/DNB),
or when a specialty title carries no qualification at all. The error names the doctor, both
fields, and suggests honest wording.

Why it exists: the founder was live as "Senior Nephrologist" with `quals: Bams` — the exact
misrepresentation `build/pages.mjs`'s SPECIALISTS rule forbids, and the exact claim
`/doctors/best-nephrologist-delhi-ncr.html` denies. It is one word in one field, so a rule beats a
reminder. A genuine MBBS/MD/DM nephrologist saves fine — the guard reads the degree, not the title.
It pairs with `specialtyOf()` in `generate.mjs`, which derives schema `medicalSpecialty` from the
same `quals` rather than assuming Nephrology.
