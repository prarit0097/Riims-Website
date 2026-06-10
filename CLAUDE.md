# CLAUDE.md — Project Rules for the RIIMS Website

These rules are **mandatory** for any AI agent or developer working in this repository.
They override default behavior. Read them before doing anything.

> **First, always read [RIIMS.md](RIIMS.md).** It is the single source of truth describing
> what this project is, why it exists, and how every part works (design, build, wiring, SEO).

---

## The 4 Rules

### Rule 1 — Keep `RIIMS.md` in sync with every change
If **anything** in this project changes (code, content, structure, data, styles, build,
deploy, config), you **must update [RIIMS.md](RIIMS.md)** in the same change so it always
reflects reality. No change is "too small" to document — phone numbers, a new page, a
renamed function, a new CSS token: all of it goes into RIIMS.md.

### Rule 2 — Read before you change
Before making **any** change, first **read `CLAUDE.md` and `RIIMS.md`**. Understand the
existing structure, conventions, and the source-of-truth files. Then make the change in the
right place (the generator under `build/`, **not** the generated output under `site/`), and
update `RIIMS.md`.

### Rule 3 — Always push to git after a change
After any change is complete and verified, **commit and push to git** (`origin/main` →
https://github.com/prarit0097/Riims-Website). Do not leave finished work uncommitted.

### Rule 4 — Always test before pushing; fix every bug first
**Before every push, run all tests.** If anything fails — a bug, a broken link, invalid
markup, a missing asset — **fix it first**. Never push a broken build.

```bash
npm test     # = build the site + run all integrity checks (links, assets, JSON-LD, <h1>, meta, dead anchors)
```

`npm test` must exit **0** (zero problems) before you push. If it fails, fix the cause and
re-run until it is clean.

---

## The required workflow for EVERY change

```
1. READ            → CLAUDE.md + RIIMS.md (Rule 2)
2. CHANGE          → edit the GENERATOR (build/*.mjs), CSS (site/css/*), or JS (site/js/site.js)
                     — never hand-edit generated HTML in site/ (it is overwritten by the build)
3. DOCUMENT        → update RIIMS.md to match the change (Rule 1)
4. BUILD + TEST    → npm test   → must be 0 problems; fix every bug (Rule 4)
5. PUSH            → git add -A && git commit && git push origin main (Rule 3)
```

## Hard constraints (do not break)

- **Source of truth is `build/`**, not `site/`. The `site/` folder is generated output. Edit
  generators; run `npm run build`; commit the regenerated `site/` too.
- **Content lives in `build/data.mjs`** (phone, address, social, conditions, doctors, posts,
  FAQs). Change copy there, not in HTML.
- **Medical compliance:** never add "100% cure", "guaranteed recovery", "stop dialysis
  permanently", or similar claims. Keep copy hopeful but honest. Disclaimers must stay.
- **Every page** must have exactly one `<h1>`, a `<title>`, a meta description, a canonical,
  and valid JSON-LD. `npm test` enforces this.
- **No dead links.** No `href="#"`. Every internal link must resolve (enforced by the test).
- Keep files focused and small; prefer many small modules over large ones.

If a rule here ever conflicts with an explicit user instruction in the current conversation,
the user's instruction wins — but still run the tests and keep RIIMS.md in sync.
