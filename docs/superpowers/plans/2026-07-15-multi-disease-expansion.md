# Multi-Disease Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand riimshospitals.com from kidney-only (49 pages) to four disease categories — Kidney, Liver, Heart, General — adding ~36 compliance-safe, evidence-cited condition pages without touching the kidney pages that currently rank.

**Architecture:** The site is a zero-dependency Node ESM static generator (`build/*.mjs` → `site/`). Kidney conditions live in `CONDITIONS` in `build/data.mjs` and render through `conditionPage(base, slug)` in `build/pages.mjs`. We add three sibling data maps (`LIVER`, `HEART`, `GENERAL`) behind a `CONDITION_SETS` registry, teach `conditionPage` to take a category, and nest the new pages one directory deeper (`/conditions/<cat>/<slug>.html`). Kidney's flat URLs, data and output stay byte-identical. Two optional per-condition fields (`redFlags`, `sources`) render only when present, so kidney pages are unchanged by construction.

**Tech Stack:** Node 20+ ESM, no runtime deps. `npm test` = `node build/generate.mjs && node build/check.mjs`. Lucide icons (self-hosted, pinned subset — verify any new icon exists before use). Design tokens in `site/css/tokens/`.

**Spec:** `docs/superpowers/specs/2026-07-15-multi-disease-expansion-design.md` — read §3 (law), §6 (page list), §7 (content model), §8 (rulebook) before writing any copy.

## Global Constraints

- **CLAUDE.md Rule 1:** update `RIIMS.md` in the same change as any behaviour change.
- **CLAUDE.md Rule 2:** edit generators under `build/`, never hand-edit `site/*.html`.
- **CLAUDE.md Rule 4:** `npm test` must exit **0** before every push. Never push a broken build.
- **CLAUDE.md Rule 3:** commit + push to `origin/main` after each task completes.
- **Kidney is untouched.** Do not modify `CONDITIONS`, kidney slugs, kidney output, the home `<title>` ("Kidney Specialist in Delhi-NCR"), or the home `<h1>`. Any diff under `site/conditions/*.html` (flat, non-nested) is a regression — revert it.
- **Compliance (spec §8.1) — these strings must never appear in new copy:** `cure`, `100%`, `guaranteed`, `permanent cure`, `reverse cirrhosis`, `regenerate the liver`, `avoid transplant`, `clear blockage`, `reverse blockage`, `without surgery`, `stop your medicine`, `stop your medicines`, `no side effects`, `root cause` *(as an anti-allopathy jab)*, `detox`, `cleanse`, `rejuvenate`. **Exception:** hepatitis C — WHO's own word "curable" is permitted **only** in the exact sanctioned sentence in Task 3.
- **No drug or formulation names** on any Schedule condition page (diabetes, obesity, BP, goitre/thyroid, heart, rheumatism, liver/hepatitis/jaundice). No brand names, no proprietary Ayurvedic product names.
- **Never** advise stopping, reducing or skipping prescribed medication.
- **Every new condition page carries:** `redFlags` (emergency box), `sources` (≥2 authoritative links), reviewer + date line, disclaimer.
- **humanizer skill** must be applied to every prose field before commit. No AI tells: inflated symbolism, rule of three, em-dash overuse, "not just X, but Y", "it's worth noting", promotional adjectives, superficial `-ing` clauses.
- **Facts only from the spec §8.3 verified set or the sources cited in the page.** If a number isn't verified, omit it. Never invent statistics.
- **Icons:** only use Lucide names already present in `site/assets/vendor/lucide.min.js`. Verify with:
  `python -c "d=open('site/assets/vendor/lucide.min.js',encoding='utf-8',errors='ignore').read(); print('Droplet' in d)"` (PascalCase key).

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `build/data.mjs` | Content source of truth | **Modify** — add `CATEGORIES`, `LIVER`, `HEART`, `GENERAL`, `CONDITION_SETS`; fix `HEALTH_DB` |
| `build/pages.mjs` | Page bodies | **Modify** — `conditionPage(base, slug, cat)`, `categoryHubPage(base, cat)`, red-flag + sources blocks, `servicesPage` grid |
| `build/generate.mjs` | Page manifest, JSON-LD, writer | **Modify** — loop `CONDITION_SETS`, `mkdirSync` new dirs, hub + condition registration |
| `build/chrome.mjs` | Header/footer/nav | **Modify** — footer category links, nav chips |
| `site/css/site.css` | Component CSS | **Modify** — `.riims-redflags`, `.riims-sources` |
| `RIIMS.md` | Docs (Rule 1) | **Modify** — every task |

`data.mjs` will grow large. Keep each category map contiguous and clearly banner-commented; do not interleave.

---

### Task 1: Category plumbing (no content yet)

Deliverable: the generator supports categories and renders the two new blocks, while output stays **byte-identical** at 50 pages. This proves zero kidney regression before any content lands.

**Files:**
- Modify: `build/data.mjs` (after the `CONDITIONS` map closes)
- Modify: `build/pages.mjs:53` (`conditionPage`)
- Modify: `build/generate.mjs:15` (import), `~339` (condition loop), `~479` (mkdirSync block)
- Modify: `site/css/site.css`
- Modify: `RIIMS.md`

**Interfaces:**
- Produces: `CATEGORIES` — `Record<'kidney'|'liver'|'heart'|'general', {label, icon, blurb, hubTitle, hubIntro, dir}>`; `CONDITION_SETS` — `Record<catKey, Record<slug, Condition>>`; `conditionPage(base, slug, cat = 'kidney')`.
- Condition shape (existing + 2 optional): `{ icon, title, crumb, intro, aboutTitle, about, symptoms: string[], approach: string[], when, related: [label, slug][], redFlags?: { emergency: string[], soon: string[] }, sources?: [label, url][] }`
- `related` slugs resolve **within the same category** for non-kidney; kidney keeps its existing behaviour.

- [ ] **Step 1: Add the category registry + empty maps to `build/data.mjs`**

Append after the `CONDITIONS` map's closing `};`:

```js
/* ---------------- Disease categories (4) ----------------
   Kidney keeps the flat /conditions/<slug>.html URLs it already ranks for.
   New categories nest one level deeper: /conditions/<dir>/<slug>.html.
   Do not move kidney. See docs/superpowers/specs/2026-07-15-multi-disease-expansion-design.md §5. */
export const CATEGORIES = {
  kidney: {
    label: 'Kidney', icon: 'droplet', dir: '',
    blurb: 'High creatinine, CKD, kidney failure, dialysis guidance, stones and protein in urine.',
    hubTitle: 'Kidney Diseases', hubIntro: '',
  },
  liver: {
    label: 'Liver', icon: 'activity', dir: 'liver',
    blurb: 'Fatty liver, raised SGPT/SGOT, jaundice, hepatitis and cirrhosis — explained from your reports.',
    hubTitle: 'Liver Diseases & Treatment',
    hubIntro: 'Fatty liver, a raised SGPT on a health check, jaundice, hepatitis — most liver problems are found on a report long before they are felt. These pages explain what those reports mean and what to do next.',
  },
  heart: {
    label: 'Heart', icon: 'heart-pulse', dir: 'heart',
    blurb: 'Blood pressure, cholesterol and heart risk — plus the warning signs that need a hospital, not a clinic.',
    hubTitle: 'Heart & Blood Pressure Care',
    hubIntro: 'Blood pressure and cholesterol damage the heart and the kidneys together, usually without symptoms. These pages cover what the numbers mean, how risk is managed, and the warning signs that need emergency care immediately.',
  },
  general: {
    label: 'General Diseases', icon: 'stethoscope', dir: 'general',
    blurb: 'Diabetes, thyroid, obesity, uric acid and vitamin deficiencies — the conditions behind most kidney and liver disease.',
    hubTitle: 'General & Lifestyle Diseases',
    hubIntro: 'Diabetes, thyroid problems, obesity, high uric acid and vitamin deficiencies are common, treatable, and sit behind a large share of kidney and liver disease. These pages explain each one honestly.',
  },
};

/* Liver / Heart / General conditions. Same shape as CONDITIONS, plus optional
   `redFlags` (emergency box) and `sources` (citations). Populated in later tasks. */
export const LIVER = {};
export const HEART = {};
export const GENERAL = {};

/* Category key -> condition map. conditionPage()/generate.mjs resolve through this. */
export const CONDITION_SETS = { kidney: CONDITIONS, liver: LIVER, heart: HEART, general: GENERAL };
```

- [ ] **Step 2: Teach `conditionPage` about categories + render the new blocks**

In `build/pages.mjs`, add `CATEGORIES, CONDITION_SETS` to the existing `from './data.mjs'` import.

Add above `conditionPage`:

```js
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
```

Change the `conditionPage` signature and lookup:

```js
export function conditionPage(base, slug, cat = 'kidney') {
  const set = CONDITION_SETS[cat] || CONDITIONS;
  const c = set[slug] || CONDITIONS['high-creatinine'];
  const dir = (CATEGORIES[cat] && CATEGORIES[cat].dir) ? `${CATEGORIES[cat].dir}/` : '';
```

Update the `related` link builder inside `conditionPage` to stay within the category:

```js
  const related = c.related.map(([l, target]) => {
    const href = target.startsWith('blog') ? `${base}blog.html` : `${base}conditions/${dir}${target}.html`;
    return `<li><a href="${href}" style="display:flex;align-items:center;gap:.5rem;color:var(--text-link);text-decoration:none;font-weight:600;font-size:var(--fs-sm)">${icon('arrow-right', { size: 15 })} ${l}</a></li>`;
  }).join('') + blogLinks;
```

Insert the two blocks into `main`, immediately **after** the `reviewedLine` (red flags go high — a patient must not scroll past a heart-attack warning) and **before** `disclaimer()` for sources:

```js
  const main = `<div style="display:flex;flex-direction:column;gap:var(--space-8)">`
    + reviewedLine
    + redFlagBox(c.redFlags)
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">${c.aboutTitle}</h2><p style="color:var(--text-body)">${c.about}</p></div>`
```

…and before the closing `</div>` of `main`:

```js
    + `<div><h2 style="font-size:var(--fs-2xl);margin:0 0 .6rem">When to consult a doctor</h2><p style="color:var(--text-body)">${c.when}</p></div>`
    + sourcesBlock(c.sources)
    + disclaimer()
    + `</div>`;
```

> Kidney conditions define neither `redFlags` nor `sources`, so both helpers return `''` and kidney output is unchanged. The existing kidney heading text "When to consult a kidney doctor" must be preserved — if the current string differs from the line above, keep the current one and instead read the heading from the category (`cat === 'kidney' ? 'When to consult a kidney doctor' : 'When to consult a doctor'`).

- [ ] **Step 3: Add the two component styles to `site/css/site.css`**

Append near the other component blocks:

```css
/* Emergency red-flag box (condition pages) — deliberately loud. */
.riims-redflags { background: var(--danger-soft); border: 1px solid var(--danger); border-left-width: 5px; border-radius: var(--radius-lg); padding: var(--space-5); }
.riims-sources { border-top: 1px solid var(--border-subtle); padding-top: var(--space-4); }
```

- [ ] **Step 4: Wire the generator (no new pages yet)**

In `build/generate.mjs`, extend the `from './data.mjs'` import with `CATEGORIES, CONDITION_SETS`.

Add after the existing kidney condition loop:

```js
/* Liver / Heart / General condition pages (nested one level; kidney stays flat) */
for (const cat of ['liver', 'heart', 'general']) {
  const dir = CATEGORIES[cat].dir;
  for (const slug of Object.keys(CONDITION_SETS[cat])) {
    const c = CONDITION_SETS[cat][slug];
    const path = `/conditions/${dir}/${slug}.html`;
    pages.push({
      out: `conditions/${dir}/${slug}.html`, base: '../../', path, nav: 'conditions/index.html', mobile: '',
      title: `${c.title} — Symptoms, Tests & Care | RIIMS`,
      desc: `${c.intro} Doctor-led, report-based care at RIIMS, Baraut, UP.`,
      body: conditionPage('../../', slug, cat),
      ld: [{
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
          { '@type': 'ListItem', position: 2, name: CATEGORIES[cat].hubTitle, item: `${SITE.origin}/conditions/${dir}/` },
          { '@type': 'ListItem', position: 3, name: c.title, item: `${SITE.origin}${path}` },
        ],
      }, {
        '@type': 'MedicalWebPage', name: c.title, description: c.intro, url: `${SITE.origin}${path}`,
        about: { '@type': 'MedicalCondition', name: c.title }, inLanguage: 'en-IN',
        isPartOf: { '@id': `${SITE.origin}/#website` },
      }],
    });
  }
}
```

Add to the `mkdirSync` block:

```js
for (const d of ['liver', 'heart', 'general']) mkdirSync(join(OUT, 'conditions', d), { recursive: true });
```

> `base` is `'../../'` because these pages sit two levels below root. Getting this wrong breaks every asset and link on the page; `check.mjs` will catch it.

- [ ] **Step 5: Verify zero regression**

```bash
npm test
```
Expected: `Generated 50 pages … 0 problem(s).` — **50, not more** (maps are empty).

```bash
git diff --stat site/
```
Expected: **no changes to any `site/conditions/*.html`**. If kidney pages changed, stop and fix before continuing.

- [ ] **Step 6: Update `RIIMS.md` + commit**

Add to the pages section: the 4-category model, the nested-URL rule, that kidney deliberately stays flat, and the optional `redFlags`/`sources` fields.

```bash
git add -A && git commit -m "feat(conditions): category plumbing for liver/heart/general (no content yet)" && git push origin main
```

---

### Task 2: Liver — 3 flagship pages + hub

Deliverable: the liver silo is live with its three highest-value pages. These are the beachhead (spec §4): `raised-sgpt-sgot` is the liver equivalent of "high creatinine" — a scared patient holding a lab report, a query hospital sites do not serve.

**Files:**
- Modify: `build/data.mjs` (`LIVER`)
- Modify: `build/pages.mjs` (add `categoryHubPage`)
- Modify: `build/generate.mjs` (register hubs)
- Modify: `RIIMS.md`

**Interfaces:**
- Consumes: `CATEGORIES`, `CONDITION_SETS`, `conditionPage(base, slug, cat)` from Task 1.
- Produces: `categoryHubPage(base, cat)` — used by Tasks 3–5 hubs.

- [ ] **Step 1: Write `categoryHubPage` in `build/pages.mjs`**

```js
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
```

- [ ] **Step 2: Register the hubs in `build/generate.mjs`**

Add `categoryHubPage` to the `./pages.mjs` import, then before the condition loop from Task 1:

```js
/* Category hubs (liver/heart/general) */
for (const cat of ['liver', 'heart', 'general']) {
  const dir = CATEGORIES[cat].dir;
  const path = `/conditions/${dir}/`;
  pages.push({
    out: `conditions/${dir}/index.html`, base: '../../', path, nav: 'conditions/index.html', mobile: '',
    title: `${CATEGORIES[cat].hubTitle} | RIIMS Baraut`,
    desc: CATEGORIES[cat].hubIntro,
    body: categoryHubPage('../../', cat),
    ld: [{
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
        { '@type': 'ListItem', position: 2, name: CATEGORIES[cat].hubTitle, item: `${SITE.origin}${path}` },
      ],
    }, {
      '@type': 'CollectionPage', name: CATEGORIES[cat].hubTitle, description: CATEGORIES[cat].hubIntro,
      url: `${SITE.origin}${path}`, inLanguage: 'en-IN', isPartOf: { '@id': `${SITE.origin}/#website` },
    }],
  });
}
```

- [ ] **Step 3: Write the 3 flagship LIVER conditions**

Add to `LIVER` in `build/data.mjs`. **Apply the humanizer skill to every prose field before committing.** Facts are fixed by the research; the wording is yours to make human.

```js
export const LIVER = {
  'raised-sgpt-sgot': {
    icon: 'beaker', title: 'Raised SGPT / SGOT', crumb: 'Liver · Raised SGPT / SGOT',
    intro: 'A raised SGPT on a health check is a clue, not a diagnosis. It tells you the liver is irritated — the job is finding out why.',
    aboutTitle: 'What does a raised SGPT or SGOT mean?',
    about: 'SGPT (ALT) and SGOT (AST) are enzymes that leak into the blood when liver cells are irritated or damaged. A mildly raised value is extremely common and, on its own, says nothing about which problem caused it. In India the usual reasons are fatty liver, alcohol, medicines, herbal or Ayurvedic products, and viral hepatitis. SGPT sits mostly in the liver, so it is the more specific of the two; SGOT also comes from muscle, and can rise after heavy exercise. A doctor reads the pattern, the ratio between them, and your history — not the number alone. Typical reference ranges are roughly 7–55 U/L for SGPT and 8–48 U/L for SGOT, but every laboratory prints its own range, so read your report against that.',
    symptoms: ['Often none at all', 'Tiredness', 'Dull ache under the right ribs', 'Nausea or poor appetite', 'Found by chance on a health package', 'Dark urine (if jaundice is developing)'],
    approach: ['Repeat the test and read SGPT with SGOT, GGT, bilirubin and albumin — not one value alone', 'Hunt the cause: ultrasound, hepatitis B and C markers, sugar and lipids, alcohol history', 'Review every medicine, supplement and herbal product you take, with dates — this is a common and missed cause', 'FIB-4 score from age, AST, ALT and platelets to check whether scarring needs assessment', 'Treat what is found, then recheck — a falling SGPT is the answer, not a tonic'],
    when: 'See a doctor soon if the value stays raised on a repeat test, or is more than five times the upper limit. Yellow eyes, confusion, or bleeding need same-day care.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion, drowsiness or disturbed sleep', 'Vomiting blood, or black tarry stools', 'Jaundice during pregnancy'],
      soon: ['SGPT more than five times the upper limit of normal', 'A raised value that has not settled on repeat testing', 'Any jaundice, even if you feel well'],
    },
    sources: [
      ['Liver function tests — Cleveland Clinic', 'https://my.clevelandclinic.org/health/diagnostics/17662-liver-function-tests'],
      ['Interpreting liver function tests — AAFP', 'https://www.aafp.org/afp/1999/0415/p2223'],
    ],
    related: [['Fatty Liver', 'fatty-liver'], ['Liver function test report', 'liver-function-test-report'], ['Drug & herb induced liver injury', 'drug-herb-induced-liver-injury']],
  },
  // 'fatty-liver' and 'drug-herb-induced-liver-injury' — Steps 4 and 5.
};
```

- [ ] **Step 4: Write `fatty-liver`**

Required, non-negotiable content points (each is a verified research finding, spec §7.1/§8.3):
1. **Ultrasound grades measure fat, not scarring.** Grade 3 with no fibrosis is less worrying than grade 1 with F3 fibrosis. Every patient gets this wrong; correcting it is the point of the page.
2. **Lean/thin-fat NAFLD:** Indians develop it below BMI 25 because of visceral fat. "But I'm not fat" is the archetypal Indian fatty liver patient. Waist matters more than weight.
3. **Reversibility, stated precisely:** with ≥10% body-weight loss, NASH resolved in 90% **but fibrosis regressed in only 45%** — and only about 10% of patients achieved that much loss. Never quote "90%" bare.
4. **Prevalence:** pooled 38.6% of Indian adults (systematic review, *J Clin Exp Hepatol* 2022).
5. **Cirrhosis is not reversed by weight loss.**
6. NAFLD raises **cardiovascular** risk — the commonest cause of death in these patients is the heart, not the liver.

`redFlags.emergency`: jaundice, abdominal/leg swelling, vomiting blood or black stools, confusion.
`sources`: NIDDK NAFLD/NASH (`https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/definition-facts`); India prevalence (`https://pubmed.ncbi.nlm.nih.gov/35677499/`); Vilar-Gomez weight-loss trial (`https://pubmed.ncbi.nlm.nih.gov/25865049/`).
`related`: `raised-sgpt-sgot`, `fatty-liver-grade-2`, `fatty-liver-diet`.

- [ ] **Step 5: Write `drug-herb-induced-liver-injury`**

This page is the site's credibility play (spec §7.1). An Ayurveda hospital that names herb risk out loud is more trustworthy than one that stays silent — and a DILI workup genuinely requires a full supplement history.

Required content points:
1. **Anti-TB drugs are the commonest cause in India (46%); traditional and alternative medicines are second (14%)** — INDILI network, n=1,288.
2. **Giloy (*Tinospora cordifolia*) is the highest reported cause of herb-induced liver injury in India.** A 43-patient multicentre study found **no contamination** — the herb itself, not an adulterant. In one series 4 of 6 patients had silent autoimmune liver disease that giloy unmasked.
3. Also documented: **Ashwagandha** (cholestatic hepatitis), **concentrated turmeric extracts** (not turmeric as a cooking spice — say this explicitly or you frighten people needlessly), **Bakuchi**.
4. **Most cases recover fully once the product is stopped.** The danger is continuing, and not knowing.
5. **Never stop anti-TB treatment on your own** — contact your doctor the same day.
6. The honest ask: *bring every product you are taking, including ours.*

`sources`: DILI unique to India (`https://pmc.ncbi.nlm.nih.gov/articles/PMC8518348/`); giloy multicentre study (`https://pmc.ncbi.nlm.nih.gov/articles/PMC9134809/`); LiverTox Tinospora (`https://www.ncbi.nlm.nih.gov/books/NBK608429/`).

- [ ] **Step 6: Verify**

```bash
npm test
```
Expected: `Generated 54 pages … 0 problem(s).` (50 + 3 hubs + … recount after Step 5; assert **0 problems** and that the count rose by exactly hubs + conditions added.)

```bash
git diff --stat site/conditions/*.html
```
Expected: empty — kidney untouched.

Compliance grep (must print nothing):
```bash
grep -riE "\bcure[sd]?\b|100%|guaranteed|reverse cirrhosis|without surgery|stop your medicine|detox|cleanse" site/conditions/liver/ | grep -v "curable in more than 95"
```

- [ ] **Step 7: `RIIMS.md` + commit**

```bash
git add -A && git commit -m "feat(liver): flagship pages (raised SGPT/SGOT, fatty liver, DILI) + liver hub" && git push origin main
```

---

### Task 3: Liver — remaining 9 conditions

**Files:** Modify `build/data.mjs` (`LIVER`), `RIIMS.md`.

Slugs, in build order: `fatty-liver-grade-2`, `fatty-liver-diet`, `liver-function-test-report`, `jaundice`, `hepatitis-b`, `hepatitis-c`, `liver-cirrhosis`, `alcoholic-liver-disease`, `liver-abscess`.

Each needs the full shape from Task 1, humanizer applied, ≥2 sources, and `redFlags`.

**Condition-specific requirements — these are the facts that must not be softened:**

- **`fatty-liver-grade-2`** — mirrors the winning `stage-3-ckd` long-tail pattern. Grade 2 = moderate fat on ultrasound with impaired vessel visualisation. Repeat: the grade measures **fat, not scarring**; ask about FIB-4/FibroScan.
- **`fatty-liver-diet`** — extend the existing **RiiMS Renal Plate** framing. Diet content is the safest possible YMYL content for this clinic and squarely within scope of practice. No product names.
- **`liver-function-test-report`** — the "reports made easy" format that already works on the kidney side. **State plainly that "LFT" is a misnomer:** most components measure *damage*; only albumin, bilirubin and INR measure *function*. **Normal LFTs do not mean a normal liver** — cirrhosis with bleeding varices can have normal LFTs. Table: SGPT 7–55, SGOT 8–48, bilirubin 0.1–1.2 mg/dL, albumin 3.5–5.0 g/dL, ALP 45–115, GGT 0–50, INR 0.8–1.1. Every range carries "laboratories differ — read your own report's range".
- **`jaundice`** — jaundice is a **sign, not a disease**; finding the cause is the whole job. **Hepatitis E in pregnancy: reported mortality as high as 20–30%** — *any pregnant woman with jaundice needs immediate hospital assessment.* Handle local jhaad-phoonk remedies gently: most A/E hepatitis recovers on its own in weeks, which is why every remedy appears to work — attack the delay, not the family.
- **`hepatitis-b`** — ❌ **never the word "cure".** WHO: *"Most people who start hepatitis B treatment must continue it for life."* Antivirals suppress the virus and cut cirrhosis/cancer risk; HBsAg loss occurs in only 3–5% after 10 years. **Not everyone needs treatment — many need only monitoring** (reassuring and true). India ~29 million (WHO 2024) — use WHO's figure and attribute it; do **not** use "40 million" or the "69% of global deaths" claim (unsubstantiated). Birth-dose vaccine within 24 hours; third-dose coverage 86% but birth-dose only ~45% — the honest public-health gap worth writing about.
- **`hepatitis-c`** — ✅ **the one sanctioned use of "curable"**, in this exact framing: *"Hepatitis C is curable in more than 95% of people with a 12–24 week course of tablets (WHO). Treatment is free under India's National Viral Hepatitis Control Programme."* No vaccine exists. The bottleneck is diagnosis, not cure. Name no drug.
- **`liver-cirrhosis`** — ❌ never "reverse". Use: *"Cirrhosis cannot be undone — but at every stage, treating the cause changes what happens next."* Explain **compensated vs decompensated**. Decompensation red flags as a distinct box: vomiting blood/black stools; confusion, drowsiness, sleep-cycle reversal (**address the family — they notice before the patient does**); fever or abdominal pain with ascites; very little urine. Surveillance: **ultrasound + AFP every 6 months** — an honest, serious service message.
- **`alcoholic-liver-disease`** — early stages improve substantially on stopping alcohol; **established cirrhosis does not reverse, but stopping still improves survival at every stage**. AST:ALT ratio >2 favours alcohol. Emergency: vomiting blood, confusion, deep sudden jaundice.
- **`liver-abscess`** — amoebic, strongly associated with alcohol, typically men 18–50; treatable with medicines and drainage. Emergency: high fever with severe right-upper pain, breathlessness, sudden worsening (rupture).

- [ ] **Step 1: Write all 9 conditions into `LIVER`** (humanizer on every prose field)
- [ ] **Step 2: `npm test`** → 0 problems; page count +9
- [ ] **Step 3: Compliance grep** (Task 2 Step 6 command) → prints nothing but the sanctioned hepatitis-C line
- [ ] **Step 4: `git diff --stat site/conditions/*.html`** → empty
- [ ] **Step 5: `RIIMS.md` + commit + push** — `feat(liver): complete the liver silo (12 conditions)`

---

### Task 4: General / Metabolic — 12 conditions + hub

**Files:** Modify `build/data.mjs` (`GENERAL`), `RIIMS.md`.

Slugs: `type-2-diabetes`, `prediabetes`, `diabetes-and-kidney-disease` ⭐, `uric-acid-gout` ⭐, `hypothyroidism`, `hyperthyroidism`, `obesity`, `metabolic-syndrome`, `insulin-resistance`, `vitamin-d-deficiency`, `vitamin-b12-deficiency`, `thyroid-in-pregnancy`.

⭐ = kidney-bridged. **Build these two first** — they raise topical coherence rather than dilute it, and they link to the existing `diabetic-kidney-disease` / `hypertensive-kidney-disease` pages.

**Condition-specific requirements:**

- **`type-2-diabetes`** — Schedule #9. ❌ never "cure"/"reverse"/"get off insulin". ✅ the ADA/EASD consensus is the strongest shield: **remission = HbA1c <6.5% sustained ≥3 months after stopping all glucose-lowering medication**; the panel **explicitly rejected "cure"** because it wrongly implies no follow-up is needed. Even in remission, retinal screening, renal tests, foot checks and yearly HbA1c continue. **DiRECT: 46% at 1 year → 36% at 2 years → 13% at 5 years** — quoting only 46% misrepresents the trial. DiRECT enrolled people with diabetes ≤6 years, not on insulin, BMI 27–45, in Scotland; generalisability to Asian Indians is **not established** — say so.
- **`prediabetes`** — usually **no symptoms**. Use the **Indian** trial, not the American one: **IDPP-1**, 3-year incidence 55.0% (control) → 39.3% (lifestyle); combining lifestyle + metformin added nothing. Even in the best arm **~4 in 10 still developed diabetes**. ICMR-INDIAB: prediabetes **15.3%**. **UP has India's lowest measured diabetes (4.8%) but a large prediabetes pool** — the honest framing is that prevention matters *most* here, never "UP is safe".
- **`diabetes-and-kidney-disease`** ⭐ — the bridge. Protein in urine appears before creatinine rises. Cross-link the existing `/conditions/diabetic-kidney-disease.html`.
- **`uric-acid-gout`** ⭐ — links gout ↔ kidney stones ↔ CKD. **ACR 2020 conditionally recommends *against* urate-lowering drugs for asymptomatic hyperuricaemia** — a high number on a health panel is not automatically a disease. Serum urate can be **normal during an acute attack**. 🚨 **Fever with a hot swollen joint = septic arthritis until proven otherwise — emergency.**
- **`hypothyroidism`** — Schedule #25 (Goitre). Levothyroxine **replaces** hormone the gland can no longer make; it does not repair the gland. **But do not overclaim "lifelong for everyone":** a 2019 BMJ Rapid Recommendations panel issued a **strong recommendation against** thyroid hormones in **subclinical** hypothyroidism, and a meta-analysis of 21 RCTs (n=2,192) found no quality-of-life benefit. Exceptions where treatment is standard: pregnancy/planning, TSH >10, anti-TPO positive with symptoms, children. The differentiated, honest position: *we will review whether you actually need this tablet — with TSH testing, not by stopping it to see what happens.* India prevalence 10.95% (8-city study).
- **`hyperthyroidism`** — Graves' is 50–80% of cases. 🚨 On anti-thyroid drugs, **fever or sore throat needs an urgent white-cell count** (agranulocytosis). Thyroid storm = emergency.
- **`obesity`** — Schedule #38. **Lead with waist circumference (≥90 cm men / ≥80 cm women)** — it is stable across all three Indian frameworks and measurable with a tape. BMI is secondary and **conflicted**: the 2009 consensus says obesity ≥25, the 2025 revision says >23. State which you use; do not mix. ❌ no "guaranteed X kg". Realistic: 3–5% loss improves triglycerides and glucose; 5–10% improves BP and lipids.
- **`metabolic-syndrome`** — IDF South Asian: waist ≥90/≥80 **mandatory**, plus any two of TG ≥150, HDL <40/<50, BP ≥130/85, FBS ≥100.
- **`insulin-resistance`** — ⚠️ **HOMA-IR and fasting insulin are research tools**, not routine diagnostics, with no validated Indian cut-offs — and they are widely used to sell packages. **Do not market this testing.** Assess consequences instead (waist, HbA1c, lipids, BP, liver).
- **`vitamin-d-deficiency`** — ⚠️ **over-tested and over-treated in India.** Routine screening of asymptomatic adults is **not** recommended. Do not imply everyone should be tested. Mega-dose shots without monitoring cause real toxicity.
- **`vitamin-b12-deficiency`** — 🚨 the safety point: **folic acid alone corrects the anaemia while nerve damage silently progresses** — always check B12 first. Metformin lowers B12; screen long-term users. Neurological damage may not fully reverse.
- **`thyroid-in-pregnancy`** — **not on any Schedule** — lowest legal risk. Any woman on levothyroxine who becomes pregnant needs **immediate** TSH testing and a dose review. Trimester-specific ranges, not standard adult ranges. The natural, honest place to explain why stopping thyroid medication on "natural cure" advice is dangerous.

Yoga, where mentioned anywhere in this task: *"added to standard treatment, yoga modestly improved blood sugar in trials (about 0.4–0.6% HbA1c)"* — **adjunct, never substitute**; trials are small, unblinded and at high risk of bias. **Look-AHEAD was null for cardiovascular events** (HR 0.95, stopped for futility) — never claim lifestyle prevents heart attacks in established diabetes.

- [ ] **Step 1: Write `diabetes-and-kidney-disease` + `uric-acid-gout` first** (the bridges)
- [ ] **Step 2: `npm test`** → 0 problems
- [ ] **Step 3: Write the remaining 10**
- [ ] **Step 4: `npm test`** → 0 problems; compliance grep on `site/conditions/general/` → nothing
- [ ] **Step 5: `git diff --stat site/conditions/*.html`** → empty
- [ ] **Step 6: `RIIMS.md` + commit + push** — `feat(general): metabolic silo (12 conditions)`

---

### Task 5: Heart — 8 conditions + hub

**Files:** Modify `build/data.mjs` (`HEART`), `RIIMS.md`.

Slugs: `high-blood-pressure`, `high-cholesterol`, `triglycerides`, `bp-and-kidney-disease` ⭐, `heart-failure`, `atrial-fibrillation`, `rheumatic-heart-disease`, `heart-attack-warning-signs`.

**This is the highest-stakes category on the site. A wrong move here can kill someone.**

- ❌ **Never** "reverse blockage", "avoid bypass/angioplasty", "heart blockage ka ilaj without surgery". Schedule #26 + these claims are exactly what triggered the Patanjali litigation. The traffic behind those keywords is not worth having.
- ✅ Frame as: what the numbers mean, how risk is managed, when to get emergency care, and the cardiorenal link (BP damages kidneys — the story that is genuinely RIIMS's).

**Condition-specific requirements:**

- **`heart-attack-warning-signs`** — a pure emergency page. AHA verbatim: chest discomfort lasting more than a few minutes or that goes away and comes back; discomfort in one or both arms, back, neck, jaw or stomach; shortness of breath; cold sweat, nausea, lightheadedness. **"Call an ambulance. Do not drive yourself. Minutes matter."** Add the **heart attack vs cardiac arrest** distinction — AHA's own framing: heart attack = a **circulation** problem (the person is usually awake and talking); cardiac arrest = an **electrical** problem (unresponsive, not breathing normally). Use "circulation", not "plumbing" — that is AHA's word. Cardiac arrest signs: unresponsive, not breathing or only **gasping** (agonal gasping is the reason bystanders fail to act). **Hands-Only CPR can be as effective as CPR with breaths** — this matters enormously for an Indian lay audience. India: bystander CPR 1.3–9.8%, AED use ~1%; the bystander is very often the only realistic chance. ⚠️ Do **not** publish a "10% per minute" survival figure — unverified. Verify the local emergency number before publishing (108/112 vary by state).
- **`high-blood-pressure`** — Schedule #27. **Usually no symptoms.** Diagnosed by repeated measurement, not one reading. 🚨 Emergency: BP ≥180/120 **with** chest pain, breathlessness, severe headache, vision change, weakness or slurred speech. **Stroke = F.A.S.T.** (Face, Arm, Speech, Time) — *"call emergency services even if the symptoms go away."* ICMR-INDIAB: 35.5%.
- **`bp-and-kidney-disease`** ⭐ — the bridge. Cross-link the existing `/conditions/hypertensive-kidney-disease.html`.
- **`high-cholesterol` / `triglycerides`** — **no symptoms in almost all cases.** Indians tend toward high triglycerides + low HDL. Treat overall risk, not the LDL number alone. 🚨 Triglycerides >500 with severe abdominal pain = pancreatitis, emergency. Family history of heart attack before 55 (men)/65 (women) suggests familial hypercholesterolaemia.
- **`heart-failure`** — the heart is still beating but too weak or stiff to pump well; **managed, not cured**. India: patients are about **10 years younger** than in the West; ischaemic cause ~72%; only ~25% receive guideline-directed therapy. 🚨 Severe breathlessness at rest or waking gasping; pink frothy sputum; chest pain; fainting. Routine: weight gain of a few kg over days, new swelling, needing more pillows. ⚠️ Do **not** publish the "22.7 million India prevalence" figure — it is a US-rate extrapolation.
- **`atrial-fibrillation`** — **often no symptoms at all.** AFib is linked with roughly a **fivefold** increased stroke risk. 🚨 Cleveland Clinic verbatim triggers: chest pain, severe shortness of breath, fainting — plus any stroke sign. **India's difference: patients are more than a decade younger and rheumatic valve disease is a major cause** — echo finds it. ⚠️ Do not publish the 0.196% Nagpur prevalence (8 cases, young sample, pilot).
- **`rheumatic-heart-disease`** — genuinely important in India and under-written. Valve damage follows rheumatic fever after an untreated strep throat, often **20–30 years later**. ✅ The one legitimate prevention claim, and it is WHO's: **treating strep throat with appropriate antibiotics prevents rheumatic fever.** That is prevention of the fever — **not** reversal of established valve damage; do not let it drift. India: ~3.6 million (estimated **from the 2011 census** — say so); ~44,000 added yearly; prevalence has fallen from 1–11/1000 in the 1970s–90s to <1/1000 after 2000. ⚠️ **Echo screening finds ~10× more than a stethoscope** (7.6/1000 vs 0.7/1000, Andhra Pradesh) — these two numbers measure different things and must never sit side by side without that explanation. Access gap: benzathine penicillin availability is a real problem in many Indian states. WHO global: 55 million affected, ~360,000 deaths — attribute to WHO by name (Cleveland Clinic's numbers differ; pick WHO).

- [ ] **Step 1: Write `heart-attack-warning-signs` first** — the page most likely to matter
- [ ] **Step 2: `npm test`** → 0 problems
- [ ] **Step 3: Write the remaining 7**
- [ ] **Step 4: `npm test`** → 0; compliance grep on `site/conditions/heart/` → nothing
- [ ] **Step 5: `git diff --stat site/conditions/*.html`** → empty
- [ ] **Step 6: `RIIMS.md` + commit + push** — `feat(heart): heart silo (8 conditions, education + emergency)`

---

### Task 6: Wire the 4 categories into the site + fix the referral contradiction

Deliverable: the owner's original ask — **Treatments shows 4 diseases** — plus every discovery path, plus the removal of the site's now-false "we only refer" claim.

**Files:** `build/pages.mjs` (`servicesPage`), `build/chrome.mjs` (footer, nav chips), `build/data.mjs` (`HEALTH_DB`, `WHY`), `build/generate.mjs` (Organization description), `RIIMS.md`.

- [ ] **Step 1: 4-category grid on the Treatments page**

In `servicesPage`, insert before the services tiles section:

```js
  const catCards = Object.entries(CATEGORIES).map(([key, C]) =>
    `<a href="${base}conditions/${C.dir ? C.dir + '/' : ''}index.html" class="riims-card riims-card--hover" style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-6);display:flex;flex-direction:column;gap:.5rem;text-decoration:none;color:inherit">`
    + `<span style="display:inline-flex;width:52px;height:52px;border-radius:var(--radius-md);background:var(--surface-blue-soft);color:var(--icon-brand);align-items:center;justify-content:center">${icon(C.icon, { size: 24 })}</span>`
    + `<h2 style="font-size:var(--fs-xl);margin:.2rem 0 0;font-family:var(--font-display)">${C.label}</h2>`
    + `<p style="margin:0;color:var(--text-muted);font-size:var(--fs-sm)">${C.blurb}</p></a>`).join('');
```

Render it in a `grid-4` above the tiles, under an `eyebrow('What we treat')` + an `<h2>`. Kidney's card points at `conditions/index.html` (its existing hub); the others at their new hubs.

- [ ] **Step 2: Fix `HEALTH_DB` — the site currently contradicts the clinic**

`build/data.mjs` currently says Liver/Heart/Diabetes are `doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support' }`. RIIMS treats these in-house. Change those titles to `'Integrated care at RIIMS'` and point their `blogs`/links at the new pages. **Leave Cancer as guided referral & support — that is accurate and it is the legally safe position (spec §6.4).**

- [ ] **Step 3: Footer + mobile nav chips**

`chrome.mjs`: add a footer column (or extend "Conditions") with the four hub links. Add the 3 new hubs to the nav-chips icon map. Verify each icon exists in the pinned Lucide bundle first.

- [ ] **Step 4: Soften "kidney-focused" where it is now inaccurate — carefully**

`WHY` card "Kidney-focused institute" and the Organization JSON-LD description say kidney-only. Reword to lead with kidney and acknowledge integrated care of liver, heart and lifestyle disease. **Do not touch the home `<title>` or home `<h1>`** — kidney stays the site's SEO anchor (spec §5.1).

- [ ] **Step 5: Full verification**

```bash
npm test
```
Expected: **0 problems**, ~86 pages (50 + 3 hubs + 32 conditions + 1 recount).

```bash
git diff --stat site/conditions/*.html   # kidney: expect empty
grep -riE "\bcure[sd]?\b|100%|guaranteed|reverse cirrhosis|reverse blockage|without surgery|stop your medicine|no side effects|\bdetox\b|cleanse" site/conditions/liver/ site/conditions/heart/ site/conditions/general/ | grep -v "curable in more than 95"
```
Expected: the grep prints **nothing**.

Verify every new page has a red-flag box:
```bash
for f in site/conditions/liver/*.html site/conditions/heart/*.html site/conditions/general/*.html; do
  case "$f" in *index.html) continue;; esac
  grep -q "riims-redflags" "$f" || echo "MISSING RED FLAGS: $f"
done
```
Expected: no output.

- [ ] **Step 6: `RIIMS.md` — full update (Rule 1)**

Page inventory (49 → ~85 indexable), the 4-category model, nested-URL rationale, `redFlags`/`sources` fields, `CONDITION_SETS`, the compliance rulebook pointer, and the spec link.

- [ ] **Step 7: Commit + push**

```bash
git add -A && git commit -m "feat(site): 4 disease categories on Treatments, nav, footer; drop stale referral-only claim" && git push origin main
```

---

## Self-Review

**Spec coverage:** §3 law → Global Constraints + per-task requirements. §4 SEO → Task 2 (SGPT beachhead), Tasks 4–5 (⭐ bridges first). §5 architecture → Task 1. §6 page list → Tasks 2–5 (12 + 8 + 12 + 3 hubs = 35 + Treatments = 36 ✓); §6.4 exclusions → Task 6 Step 2 keeps Cancer as referral, and no cancer/PCOS/generic-pain slug appears anywhere. §7 content model → Task 1 Steps 2–3 (blocks) + humanizer in Global Constraints; §7.1 both differentiators → Task 2 Step 5 (giloy) and Step 4 (grade ≠ scarring). §8 rulebook → Global Constraints + the grep gates. §9 verification → every task's verify step. **No gaps.**

**Placeholder scan:** no TBD/TODO. Task 1 ships complete code. Tasks 3–5 specify each condition's non-negotiable facts, sources and red flags rather than full prose — deliberate: prose must be authored through the humanizer skill, and 32 pages of medical copy inside a plan document would be unreadable and would go stale. Task 2 provides one complete worked example (`raised-sgpt-sgot`) as the pattern.

**Type consistency:** `conditionPage(base, slug, cat = 'kidney')` and `categoryHubPage(base, cat)` are used with those exact signatures in `generate.mjs`. `CATEGORIES[cat].dir` is `''` for kidney and the folder name otherwise — the one place kidney's flat URL is preserved; `conditionPage` and both generator loops all read it. `redFlags` / `sources` are optional everywhere and both helpers early-return `''`.

**One risk flagged:** Task 2 Step 6's expected page count is written as an assertion to recount rather than a fixed number, because the exact total depends on how many conditions land per task.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-15-multi-disease-expansion.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
