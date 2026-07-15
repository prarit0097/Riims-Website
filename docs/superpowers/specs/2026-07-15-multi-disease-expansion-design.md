# RIIMS multi-disease expansion — design

**Date:** 2026-07-15
**Status:** approved (owner), pending implementation plan
**Scope:** expand the kidney-only site to four disease categories — Kidney, Liver, Heart, General

---

## 1. Goal

RIIMS treats liver, heart and general/metabolic disease **in-house** (owner-confirmed), but the
website says otherwise: it calls itself "kidney-focused" everywhere, and its search widget lists
Liver/Heart/Diabetes/Cancer as *"RIIMS Care Team — Guided referral & support"*. The site
contradicts the clinic's own banner ("गंभीर बीमारियों के लिए एडवांस केयर हॉस्पिटल").

This project makes the site reflect reality: **Treatments → 4 categories (Kidney, Liver, Heart,
General)**, each with real condition pages at the depth kidney already has.

**Non-goal:** rebranding RIIMS away from kidney. Kidney remains the site's core and its SEO anchor.

---

## 2. Decisions (owner-confirmed)

| Question | Decision |
|---|---|
| Does RIIMS treat these in-house? | **Yes** — all of liver, heart, general |
| What is "General"? | Lifestyle/metabolic + Cancer + Pain & Joints + Fertility *(scoped down — see §6)* |
| Doctor mapping | **Team approach** — all three doctors, no category-specific specialist |
| Scope | Owner initially chose full parity (~110 pages); **revised to ~36 pages after research** (§6) |

---

## 3. The binding constraint: Indian advertising law

This is the finding that shapes everything. It is **not** theoretical — the Supreme Court's
Patanjali proceedings led to 14 product licences being suspended in Uttarakhand, and ASCI
referred 233 health advertisements to the Ministry of AYUSH in 2025.

### 3.1 Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954

**Section 3** — no advertisement **referring to any drug** suggesting its use for
*"the diagnosis, cure, mitigation, treatment or prevention"* of any Schedule condition.
Note the breadth: **mitigation and prevention are caught too**, not just "cure".

**Section 3(c)** independently bans drug ads for *"the correction of menstrual disorder in women"*
— a direct hit on PCOS content.

**Schedule (54 conditions) — our categories are almost entirely on it:**

| # | Condition | Category |
|---|---|---|
| 6, 51 | Cancer, Tumours | General |
| 9 | Diabetes | General |
| 25 | Goitre (thyroid) | General |
| **26** | **Heart diseases** | **Heart** |
| 27 | High or low blood pressure | Heart / General |
| 38 | Obesity | General |
| 43 | Rheumatism | Pain & Joints |
| 22 | Gall/kidney/bladder stones | *(kidney — already live)* |
| 2 | Arteriosclerosis | Heart |
| 12, 13, 18, 48 | Uterus, menstrual flow, female diseases, sterility in women | Fertility |

**Schedule J (Drugs & Cosmetics Rules 1945, Rule 106)** entry **33 = "Jaundice/Hepatitis/Liver
disorders"**; entry 8 = cancer; entry 50 = stones. It applies **expressly to Ayurvedic, Siddha,
Unani and Homeopathic** preparations.

**Penalty (s.7):** up to 6 months' imprisonment on first conviction; up to 1 year on repeat.
Company officers are deemed guilty.

### 3.2 The way through — and why the existing kidney pages are already safe

Section 3 bites only on an advertisement **referring to a drug**. **Section 14(b)** exempts
*"any treatise or book dealing with any of the matters specified in Section 3 from a bona fide
scientific or social standpoint."*

> **Write about the disease. Never advertise a drug for the disease.**

A page that explains what a condition is, its symptoms, its tests and its red flags — cited,
honest about limits, naming no formulation — does not refer to a drug and sits largely outside
Section 3. The moment it says *"our Ayurvedic formulation controls your sugar"*, it is inside it.

**RIIMS's existing kidney pages already follow this model.** This project extends that model; it
does not invent a new one.

**Caveats (flagged, not resolved):** whether a *website* qualifies under 14(a) ("signboard on his
premises") is doubtful and untested; 14(b) is stronger but also untested for websites; whether
B.A.M.S. practitioners are "registered medical practitioners" under s.14 depends on UP state law.
**None of this is legal advice.** The Cancer and PCOS pages are excluded partly for this reason.

### 3.3 Also in scope
Consumer Protection Act 2019 / CCPA Guidelines 2022 (penalty up to ₹10 lakh; ₹50 lakh repeat;
**a disclaimer cannot contradict the main claim**); ASCI code; Google YMYL/E-E-A-T (cure claims
suppress rankings — compliance and SEO point the same way).

---

## 4. SEO strategy

Research (SERP analysis, competitor teardown) produced three load-bearing conclusions:

1. **The winnable niche is Ayurveda-intent + Hindi/Hinglish + report-number queries.** A user
   searching *"ayurvedic treatment for fatty liver"* wants a B.A.M.S. doctor. A user searching
   *"liver specialist"* wants a hepatologist. Intent-match is an E-E-A-T asset — and the honest
   position.
2. **"SGPT badha hua hai kya kare" is the liver equivalent of "high creatinine"** — the exact
   query pattern RIIMS already wins. A scared patient holding a lab report, under-served by
   hospital sites. This is the beachhead.
3. **Enter each new category through its kidney-adjacent door.** `diabetes-and-kidney-disease`,
   `bp-and-kidney-disease`, `uric-acid` *raise* topical coherence rather than dilute it.

**Unwinnable — do not chase:** `best <specialty> in Delhi NCR`, generic `<disease> treatment`,
generic knee/joint pain (Practo/Apollo/ILBS/Zandu/myUpchar own these).

**Topical dilution:** real but secondary. The dominant risk is *quality* dilution — shipping thin
YMYL pages on topics we lack credentials for. Mitigations: nested silos (§5), kidney stays
structurally dominant, no thin pages.

---

## 5. Architecture

### 5.1 URL structure — kidney does not move

```
/conditions/<slug>.html            ← Kidney, 15 pages — UNCHANGED (they rank; do not risk them)
/conditions/liver/index.html       ← Liver hub
/conditions/liver/<slug>.html      ← Liver conditions
/conditions/heart/index.html       ← Heart hub
/conditions/heart/<slug>.html      ← Heart conditions
/conditions/general/index.html     ← General hub
/conditions/general/<slug>.html    ← General conditions
```

Kidney stays at the root of `/conditions/`; new categories are **nested one level deeper**. That
is a deliberate signal about what this site is. The home `<title>` ("Kidney Specialist in
Delhi-NCR") and home `<h1>` are **unchanged**.

### 5.2 Generator changes (`build/`)

- **`data.mjs`** — new `CATEGORIES` map (kidney/liver/heart/general: label, icon, blurb, hub copy)
  and new condition maps `LIVER`, `HEART`, `GENERAL`. Existing `CONDITIONS` (kidney) untouched.
- **`pages.mjs`** — `categoryHubPage(base, cat)`; extend `conditionPage()` to accept a category +
  render the new blocks (§7). `servicesPage` gains the 4-category grid (the "Treatments" ask).
- **`generate.mjs`** — loop the three new maps; `mkdirSync` for `conditions/{liver,heart,general}`;
  per-page BreadcrumbList + MedicalWebPage + MedicalCondition JSON-LD; sitemap auto-includes.
- **`chrome.mjs`** — footer gains category links; mobile nav chips gain the 4 categories.
- **`site.css`** — styles for the emergency red-flag box and the sources block.

### 5.3 Reuse, not reinvention
`conditionPage()` already renders hero → about → symptoms → approach → when-to-consult →
disclaimer → CTA, and is compliance-safe. We extend it rather than fork it.

---

## 6. Page inventory (~36) and what is excluded

### 6.1 Liver — 12 + hub *(highest opportunity)*
`raised-sgpt-sgot` ⭐ · `fatty-liver` ⭐ · `fatty-liver-grade-2` ⭐ · `fatty-liver-diet` ·
`liver-function-test-report` · `jaundice` · `hepatitis-b` · `hepatitis-c` · `liver-cirrhosis` ·
`alcoholic-liver-disease` · `liver-abscess` · `drug-herb-induced-liver-injury` ⭐

### 6.2 Heart — 8 + hub *(educational; BP/cholesterol/risk focus)*
`high-blood-pressure` · `high-cholesterol` · `triglycerides` · `bp-and-kidney-disease` ⭐ ·
`heart-failure` · `atrial-fibrillation` · `rheumatic-heart-disease` · `heart-attack-warning-signs`

### 6.3 General / metabolic — 12 + hub
`type-2-diabetes` · `prediabetes` · `diabetes-and-kidney-disease` ⭐ · `uric-acid-gout` ⭐ ·
`hypothyroidism` · `hyperthyroidism` · `obesity` · `metabolic-syndrome` · `insulin-resistance` ·
`vitamin-d-deficiency` · `vitamin-b12-deficiency` · `thyroid-in-pregnancy`

⭐ = kidney-bridged or under-served — build first.

### 6.4 Explicitly OUT of scope (and why)

| Excluded | Reason |
|---|---|
| **Cancer** | Schedule #6/#51 + Schedule J #8. Highest-liability content on the Indian web for an Ayurveda-adjacent clinic. No safe version exists that also ranks. |
| **Fertility / PCOS** | **Section 3(c) direct hit** + Schedule #12/#13/#18/#48. Needs a lawyer before any page ships. |
| **Generic pain & joints** | SERP owned by product brands (Zandu/Patanjali/myUpchar/Karma). No credential, no bridge back to kidney. Uric acid/gout covers the defensible part. |
| **`<disease> in <city>` doormat pages** | Scaled thin content; serious YMYL risk. |
| **Specialist/doctor pages for liver & heart** | Deferred. "Liver Specialist" with a B.A.M.S. doctor is an E-E-A-T mismatch (searcher wants a hepatologist). Revisit after conditions ship. |

Heart is built **because the owner wants the 4th category and RIIMS does manage BP/cholesterol/
risk** — but framed as education + risk management + emergency guidance, never
"blockage reversal".

---

## 7. Content model (per condition page)

Existing structure **plus**:

1. **🚨 Emergency red-flags box** — visually distinct, above the fold on heart/liver pages.
   Load-bearing for safety. Heart: chest pain/breathlessness → hospital now, not an OPD.
   Liver: vomiting blood, black stools, confusion, jaundice in pregnancy.
2. **Sources block** — WHO / ICMR / NHLBI / AHA / Cochrane links. Serves both E-E-A-T and the
   s.14(b) *bona fide scientific standpoint* argument.
3. **Reviewer + review date** (already present; keep).
4. **humanizer skill applied to every page** — no AI tells (inflated symbolism, rule of three,
   em-dash overuse, "it's not just X, it's Y", promotional adjectives).

### 7.1 Two truths that differentiate RIIMS

- **Herb safety, said out loud.** India's own hepatology literature (INDILI, n=1,288) finds
  traditional/alternative medicines are the **2nd commonest cause of drug-induced liver injury
  (14%)**, and **Giloy is the highest reported cause of herb-induced liver injury in India**.
  An Ayurveda hospital that says this — *"we practise Ayurveda, and precisely because we do, we
  take herb safety seriously — bring us everything you're taking, including ours"* — is more
  credible than one that is silent. It is also correct clinical practice (DILI workup requires a
  full supplement history).
- **"Grade 3 fatty liver" ≠ severe liver damage.** Ultrasound grades measure **fat**, not
  **scarring**. Grade 3 with no fibrosis is less concerning than grade 1 with F3. Every patient
  gets this wrong. Correcting it is genuinely useful content nobody else writes.

---

## 8. Compliance rulebook (applies to every page)

### 8.1 Never
- "cure" / "100%" / "guaranteed" / "permanent" / "no side effects" / "assured results"
- "reverse cirrhosis" / "regenerate the liver" / "avoid transplant"
- "clear blockages without surgery" / "reverse heart blockage"
- "cure diabetes" / "get off insulin" / "stop your BP or thyroid tablets"
- "regularise periods with our medicine" (s.3(c)) / "conceive naturally — guaranteed" (#48)
- "dissolve gallstones without surgery" (#22 + Schedule J #50)
- "liver detox" / "flush out toxins" / "rejuvenate the liver" (Schedule J #43 is literally
  "Power to rejuvinate")
- **any advice to stop/reduce/skip prescribed medication** — the most dangerous copy possible
- naming any formulation or drug on a Schedule-condition page
- patient testimonials implying cure (endorser is separately liable under CCPA)
- "root cause vs allopathy only suppresses symptoms" framing; denigrating modern medicine
  (this is exactly what triggered the Patanjali litigation)

### 8.2 Safe, and true
| Instead of | Write |
|---|---|
| "We cure diabetes" | "We treat diabetes at RIIMS." |
| "Reverse your diabetes" | "Some people achieve **remission** — HbA1c <6.5% for 3+ months off medication (ADA/EASD consensus). Remission is not a cure; monitoring continues." |
| "Cure hepatitis C" | ✅ "Hepatitis C is **curable in more than 95%** of people with a 12–24 week course of tablets (WHO). Free under India's NVHCP." *(true, and WHO's own word)* |
| "Cure hepatitis B" | "Hepatitis B cannot yet be cleared from the body, but it is controlled very effectively — treatment greatly reduces cirrhosis and cancer risk. Many people need only monitoring." |
| "Reverse cirrhosis" | "Cirrhosis cannot be undone — but at every stage, treating the cause changes what happens next." |
| "Yoga cures diabetes" | "Added to standard treatment, yoga modestly improved blood sugar in trials (~0.4–0.6% HbA1c). It is not a replacement for medication." |

### 8.3 Honest numbers (verified in research; use these, not marketing versions)
- **DiRECT remission: 46% (1yr) → 36% (2yr) → 13% (5yr).** Quoting only 46% misrepresents the trial.
- **IDPP-1 (Asian Indians):** lifestyle cut 3-yr diabetes incidence 55% → 39.3%. Even in the best
  arm **~4 in 10 still developed diabetes.** Use the Indian trial, not the US DPP's 58%.
- **Look-AHEAD was NULL** for cardiovascular events (HR 0.95, stopped for futility). Do not claim
  lifestyle prevents heart attacks in established diabetes.
- **Fatty liver:** ≥10% weight loss → NASH resolved in 90%, but **fibrosis regressed in only 45%**,
  and only ~10% of patients achieved ≥10% loss. Do not quote "90%" bare.
- **ICMR-INDIAB:** diabetes 11.4%, prediabetes 15.3%, hypertension 35.5%. **UP has India's lowest
  measured diabetes (4.8%) but a large prediabetes pool** — the honest local framing is that
  prevention matters *most* here, not that UP is safe.

---

## 9. Verification

- `npm test` = 0 (build + links + JSON-LD + one `<h1>` + meta + canonical) before every push.
- Manual: every page has the emergency box, sources, reviewer, disclaimer.
- Grep gate: no banned phrase from §8.1 appears in `site/`.
- Mobile check: nav chips still fit; category hubs readable.
- **RIIMS.md updated in the same change** (Rule 1).

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Kidney rankings dip from expansion | Kidney URLs untouched; new silos nested; kidney-bridged pages first; watch GSC |
| Legal exposure | Educational model only; no drug names; no cure claims; cancer/PCOS excluded; §8 grep gate |
| Medical error | Every fact traced to WHO/ICMR/NHLBI/AHA/Cochrane; uncertainty flagged, not smoothed over |
| Content reads AI-generated | humanizer skill on every page |
| Thin content | 36 solid pages, not 110 templated ones |

**Open items for the owner:** a lawyer should review before launch, given Schedule J entry 33
targets liver directly. Doctor registration numbers still need entering in the admin panel.

---

## 11. Next

`writing-plans` → phased implementation plan (Liver first — the beachhead), then build.
