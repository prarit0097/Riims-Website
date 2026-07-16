/* RIIMS static-site generator — content data.
   Copy is medically responsible: no cure / guarantee claims.

   ADMIN-EDITABLE content (doctors, reels, testimonials, faqs, posts, phone
   numbers) lives in data/content.json. On the VPS, the admin panel writes
   overrides to data/content.local.json (gitignored) — sections there replace
   the same section from content.json, so `git pull` never clobbers live edits. */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = join(__dirname, '..', 'data', 'content.json');
const LOCAL_PATH = join(__dirname, '..', 'data', 'content.local.json');

const baseContent = JSON.parse(readFileSync(CONTENT_PATH, 'utf8'));
const localContent = existsSync(LOCAL_PATH) ? JSON.parse(readFileSync(LOCAL_PATH, 'utf8')) : {};

/* Admin overrides (data/content.local.json) REPLACE the repo section wholesale — so the
   admin panel stays fully authoritative: every edit, addition, deletion and re-order the
   admin makes applies exactly as saved.
   ONE narrow exception: blog article bodies/FAQs/references/related links are authored in
   the repo (content.json), and the admin file usually stores them empty. So for posts ONLY,
   we fill those four fields from the matching repo post WHENEVER the admin copy leaves them
   blank. This keeps the repo blog content live without overriding anything the admin set
   (titles, categories, images, which posts exist, order — all still come from the admin). */
const CONTENT = { ...baseContent, ...localContent };
if (Array.isArray(localContent.posts) && Array.isArray(baseContent.posts)) {
  const isEmpty = (v) => v === '' || v == null || (Array.isArray(v) && v.length === 0);
  const baseBySlug = new Map(baseContent.posts.map((p) => [p.id || p.slug, p]));
  CONTENT.posts = CONTENT.posts.map((p) => {
    const b = baseBySlug.get(p.id || p.slug);
    if (!b) return p;
    const out = { ...p };
    for (const k of ['body', 'faqs', 'refs', 'relatedPosts']) {
      if (isEmpty(out[k]) && !isEmpty(b[k])) out[k] = b[k];
    }
    return out;
  });
}

/* Phone numbers come from the admin-editable content (10-digit inputs). */
const CALL = (CONTENT.site && CONTENT.site.callNumber) || '8512040000';
const WA = (CONTENT.site && CONTENT.site.whatsappNumber) || '8512040000';

/* Tracking tags (admin "Tracking" tab): Google tag id (G-/AW-/GTM-) + raw
   verification meta tags pasted into every page's <head>. */
export const TRACKING = {
  gtagId: '', metaTags: '',
  ...(CONTENT.tracking || {}),
};

/* Homepage stats strip (admin "Settings" tab). Hidden until `enabled` with
   REAL numbers — fabricated stats on a medical (YMYL) site hurt trust/rankings. */
export const STATS = {
  enabled: false, rating: '', reviews: '', patients: '', specialists: '',
  ...(CONTENT.stats || {}),
};

/* Shown in the "Medically reviewed / Last updated" line on condition + blog pages. */
export const REVIEW_DATE = 'June 2026';

/* Business info + social are admin-editable (Admin → Settings). Absent field = keep the
   default below; for social a field explicitly set to '' HIDES that icon site-wide. */
const S = (CONTENT.site && typeof CONTENT.site === 'object') ? CONTENT.site : {};
const str = (v, dflt) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : dflt);
const social = (k, dflt) => (k in S ? String(S[k] || '').trim() : dflt);   // '' = hide
const G = (S.geo && typeof S.geo === 'object') ? S.geo : {};

export const SITE = {
  name: 'RIIMS',
  fullName: 'Rashtriya Institute of Integrated Medical Sciences',
  // Production domain (non-www canonical; the server 301-redirects www -> apex).
  origin: 'https://riimshospitals.com',
  phone: `+91 ${CALL.slice(0, 5)} ${CALL.slice(5)}`,
  phoneTel: `+91${CALL}`,              // E.164 — used for tel: and schema
  waNumber: `91${WA}`,                 // bare digits for wa.me deep links
  whatsapp: `https://wa.me/91${WA}`,
  email: str(S.email, ''),
  facebook: social('facebook', 'https://www.facebook.com/profile.php?id=61590269039418'),
  instagram: social('instagram', 'https://www.instagram.com/riimshospital/'),
  youtube: social('youtube', 'https://youtube.com/@riimshospitals'),
  city: str(S.city, 'Baraut, Uttar Pradesh 250611'),
  addressLine: str(S.addressLine, 'Near Baraut Medicity Hospital'),
  addressSub: str(S.addressSub, '36VW+JHV, Kotana Rd, Baraut, Uttar Pradesh 250611'),
  hours: str(S.hours, 'Mon–Sat, 9am–7pm'),
  // Clinic coordinates — VERIFY against the Google Business Profile (Admin → Settings).
  geo: { lat: Number(G.lat) || 29.1066, lng: Number(G.lng) || 77.2637 },
  mapsQuery: 'RIIMS+Rashtriya+Institute+of+Integrated+Medical+Sciences+Baraut',
  mapsLink: str(S.mapsLink, 'https://www.google.com/maps/search/?api=1&query=RIIMS+Baraut'),
  serviceCities: (Array.isArray(S.serviceCities) && S.serviceCities.filter(Boolean).length)
    ? S.serviceCities.map((c) => String(c).trim()).filter(Boolean)
    : ['Baraut', 'Baghpat', 'Meerut', 'Shamli'],
  year: new Date().getFullYear(),      // auto — never goes stale
};

/* Site-wide call-to-action band copy (Admin → Settings). */
export const CTA = {
  eyebrow: 'Take the first step',
  title: 'Talk to a kidney care expert today',
  intro: 'Share your reports and get doctor-guided, evidence-aware guidance — no false promises, just honest help.',
  bookLabel: 'Book Consultation',
  whatsappLabel: 'WhatsApp Now',
  ...(CONTENT.cta && typeof CONTENT.cta === 'object' ? CONTENT.cta : {}),
};

/* DNA Kayakalp Protocol page FAQs (Admin → Protocol). Empty = use the page defaults. */
export const PROTOCOL = {
  faqs: Array.isArray(CONTENT.protocol && CONTENT.protocol.faqs) ? CONTENT.protocol.faqs : [],
};

/* About page + Legal pages admin overrides (Admin → About / Legal). The DEFAULT
   content lives in pages.mjs; these just carry the admin edits, merged there. */
export const ABOUT_ADMIN = (CONTENT.about && typeof CONTENT.about === 'object') ? CONTENT.about : {};
export const LEGAL_ADMIN = (CONTENT.legal && typeof CONTENT.legal === 'object') ? CONTENT.legal : {};

/* Home hero banner slider (Admin → Banners). Each slide: img (path, incl. admin uploads),
   alt (SEO/accessibility), url (optional click link). Any image size is fine — the slider
   cover-fills a fixed frame, so add/remove never breaks the layout. Empty = defaults.
   `speed` = seconds each slide is shown (auto-advance). */
const DEFAULT_BANNERS = [
  { img: 'assets/banner-1.webp', alt: 'RIIMS Baraut — integrated kidney care', url: '' },
  { img: 'assets/banner-2.webp', alt: 'RIIMS — doctor-led kidney care in Baraut, UP', url: '' },
  { img: 'assets/banner-3.webp', alt: 'RIIMS — kidney diagnosis, diet and Ayurveda-supported care', url: '' },
  { img: 'assets/banner-4.webp', alt: 'RIIMS — book a kidney consultation in Baraut', url: '' },
];
export const BANNERS = (CONTENT.banners && Array.isArray(CONTENT.banners.slides) && CONTENT.banners.slides.filter((s) => s && s.img).length)
  ? CONTENT.banners.slides.filter((s) => s && s.img)
  : DEFAULT_BANNERS;
export const BANNER_SPEED = Math.min(30, Math.max(1, Number(CONTENT.banners && CONTENT.banners.speed) || 3));

/* Header navigation (Kidney Diseases / Treatments point at the conditions hub). */
export const NAV = [
  { label: 'About', href: 'about.html' },
  { label: 'Kidney Diseases', href: 'conditions/index.html' },
  { label: 'Treatments', href: 'services.html' },
  { label: 'Guides', href: 'guides.html' },
  { label: 'Doctors', href: 'doctors.html' },
  { label: 'Blog', href: 'blog.html' },
  { label: 'Contact', href: 'contact.html' },
];

/* ---------------- Conditions (8 SEO pages) ---------------- */
export const CONDITIONS = {
  'high-creatinine': {
    icon: 'droplet', title: 'High Creatinine', crumb: 'Kidney Diseases · High Creatinine',
    intro: 'High creatinine is a signal that the kidneys may be under strain — a marker to investigate calmly, not a diagnosis on its own.',
    aboutTitle: 'What does high creatinine mean?',
    about: 'Creatinine is a natural waste product your muscles make, which healthy kidneys filter out through urine — it is a marker, not a disease. When kidney filtering slows, creatinine builds up in the blood, but dehydration, certain medicines, infection, urinary obstruction, diabetes, high blood pressure or even a muscular build can all raise it. Because two people with the same creatinine can have very different kidney function, it is read alongside eGFR, urine protein, potassium and your history — never the number alone.',
    symptoms: ['Tiredness and low energy', 'Swelling in feet or face', 'Foamy or reduced urine', 'Loss of appetite, nausea', 'Itching or dry skin', 'High blood pressure'],
    approach: ['Report-based Kidney Mapping — creatinine read with eGFR, urine protein, potassium and history', 'Root-cause identification: dehydration, medicines, infection, diabetes or BP behind the rise', 'Doctor-led plan with a personalized kidney diet (RiiMS Renal Plate) and lifestyle guidance', 'Ongoing monitoring, with changes explained in plain, jargon-free language'],
    when: 'If creatinine stays high across repeat reports or eGFR is falling — or you have diabetes, blood pressure or swelling — seek a nephrology opinion early. A sudden drop in urine, breathlessness or very high potassium needs prompt medical care.',
    related: [['CKD', 'ckd'], ['High creatinine without dialysis', 'high-creatinine-without-dialysis'], ['Protein in urine', 'proteinuria'], ['Kidney swelling', 'kidney-swelling-treatment']],
  },
  'high-creatinine-without-dialysis': {
    icon: 'droplet', title: 'High Creatinine Treatment Without Dialysis', crumb: 'Kidney Diseases · High Creatinine Without Dialysis',
    intro: 'A raised creatinine does not mean dialysis. For most people it is managed with diet, lifestyle and treating the cause — honestly, without false promises.',
    aboutTitle: 'Can high creatinine be managed without dialysis?',
    about: 'Dialysis is needed only in advanced kidney failure (very low kidney function with specific problems), not for a raised creatinine on its own. For most people with high or moderately high creatinine, care focuses on finding and treating the cause — dehydration, certain medicines, infection, diabetes or blood pressure — and on protecting the remaining kidney function with a personalized diet (the RiiMS Renal Plate), lifestyle changes and regular monitoring. We are honest about this: we never promise that dialysis can always be avoided or stopped, because whether it is ever needed depends on your reports, your stage and your treating nephrologist. What we can do is help you protect kidney function and understand your numbers clearly.',
    symptoms: ['Tiredness and low energy', 'Swelling in feet or face', 'Foamy or reduced urine', 'Loss of appetite, nausea', 'Itching or dry skin', 'High blood pressure'],
    approach: ['Root-cause identification behind the raised creatinine — reversible causes are treated first', 'A personalized Indian kidney diet (RiiMS Renal Plate) and avoidance of the common nephrotoxins', 'Blood pressure and sugar control coordinated with your treating doctor — supporting, never replacing it', 'Regular monitoring on a Kidney Alert System so any change is caught early'],
    when: 'If your creatinine is high but stable and you feel well, careful, report-based management with monitoring is usually the path — dialysis is not on the table. A sudden drop in urine, breathlessness, confusion or very high potassium needs urgent medical care.',
    related: [['High Creatinine', 'high-creatinine'], ['Stage 3 CKD', 'stage-3-ckd'], ['CKD', 'ckd'], ['Kidney disease treatment', 'kidney-disease-treatment']],
  },
  'kidney-disease-treatment': {
    icon: 'stethoscope', title: 'Kidney Disease Treatment', crumb: 'Kidney Diseases · Kidney Disease Treatment',
    intro: 'There is no single treatment for kidney disease — the right plan depends on the cause, the stage and your reports. Here is how RIIMS approaches it.',
    aboutTitle: 'How is kidney disease treated?',
    about: 'Kidney disease is an umbrella term covering many conditions — high creatinine, CKD, protein in urine, diabetic and hypertensive kidney disease, stones and infections. There is no single medicine or fixed treatment; care depends on the cause, the stage and each person\'s reports. RIIMS follows an integrated, report-based approach (the DNA Kayakalp Protocol): map the full kidney picture, identify and treat the root cause, protect the remaining function with a personalized diet (RiiMS Renal Plate) and lifestyle, and monitor closely — with Ayurveda used supportively alongside, and never instead of, your medical treatment. We stay honest: no promises of cure, guaranteed recovery, or permanently stopping dialysis.',
    symptoms: ['Rising creatinine or falling eGFR on reports', 'Swelling in feet, ankles or face', 'Foamy urine or a change in how much you pass', 'Tiredness, weakness, poor appetite', 'High blood pressure or low hemoglobin', 'Diabetes or BP with abnormal kidney tests'],
    approach: ['Report-based Kidney Mapping to understand the true stage and cause', 'Root-cause treatment — most often diabetes or blood pressure — to help slow progression', 'A personalized kidney diet (RiiMS Renal Plate) plus supervised lifestyle and Ayurveda support', 'Structured follow-up on a Kidney Alert System, coordinated with your treating doctors'],
    when: 'Any abnormal kidney report, persistent swelling or foamy urine, or diabetes/BP with kidney changes deserves a timely nephrology consultation. Early care offers the most options.',
    related: [['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Dialysis guidance', 'dialysis'], ['Diabetic kidney disease', 'diabetic-kidney-disease']],
  },
  'ckd': {
    icon: 'activity', title: 'Chronic Kidney Disease (CKD)', crumb: 'Kidney Diseases · CKD',
    intro: 'CKD means the kidneys have been working below normal for months. With monitoring, diet and doctor-led care, its progression can often be slowed.',
    aboutTitle: 'What is CKD?',
    about: 'Chronic Kidney Disease means the kidneys have worked below normal for months, and it is staged 1 to 5 using your eGFR — from Stage 1 (eGFR 90 or more) down to Stage 5 (below 15). Modern guidelines read eGFR together with albuminuria (urine protein), because someone at an early stage with heavy protein leak can carry more risk than the number alone suggests. The stage is not a final verdict — it can change — and finding the cause, most often diabetes or high blood pressure, while protecting remaining function is what matters most.',
    symptoms: ['Often no symptoms in early stages', 'Swelling around ankles or eyes', 'Foamy urine or a change in output', 'Tiredness, weakness, poor concentration', 'Rising creatinine / falling eGFR on reports', 'High blood pressure or low hemoglobin'],
    approach: ['Report-based staging via Kidney Mapping — eGFR and albuminuria read together, not eGFR alone', 'Root-cause identification, commonly diabetes or blood pressure, to help slow progression', 'Personalized Indian kidney diet (RiiMS Renal Plate) — protein, salt and potassium guidance', 'Scheduled follow-ups on a simple Kidney Alert System so changes are caught early'],
    when: 'If your eGFR is falling, urine shows protein, or you have diabetes or BP with abnormal kidney reports, consult early. Early-stage care offers the most options.',
    related: [['Stage 3 CKD', 'stage-3-ckd'], ['Stage 4 CKD', 'stage-4-ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetic kidney disease', 'diabetic-kidney-disease']],
  },
  'stage-3-ckd': {
    icon: 'activity', title: 'Stage 3 CKD Treatment', crumb: 'Kidney Diseases · Stage 3 CKD',
    intro: 'Stage 3 is often when CKD is first found — and, with good care, many people stay stable here for years. This is the stage to act calmly and protect your kidneys.',
    aboutTitle: 'What is Stage 3 CKD?',
    about: 'Stage 3 chronic kidney disease means an eGFR of 30 to 59 — split into Stage 3a (45–59) and Stage 3b (30–44). It is often the first stage at which CKD is actually diagnosed, because earlier stages have few clues. Reaching Stage 3 does not mean kidney failure or dialysis is near; many people remain stable at this stage for years when the cause is controlled. The priorities are clear: find and treat the driver (most often diabetes or blood pressure), protect the remaining function with diet and lifestyle, avoid things that harm the kidney, and monitor so any change is caught early.',
    symptoms: ['Often mild or no symptoms', 'Tiredness or reduced energy', 'Mild swelling in ankles or feet', 'High blood pressure', 'Rising creatinine / eGFR 30–59 on reports', 'Changes in urine frequency or foaming'],
    approach: ['Confirm the stage with eGFR and albuminuria (urine protein) read together', 'Control the cause — diabetes, blood pressure — to slow or stabilise progression', 'A personalized Indian kidney diet (RiiMS Renal Plate) and avoidance of the 10 common nephrotoxins', 'Regular follow-up on a Kidney Alert System so trends, not one-off numbers, guide care'],
    when: 'If your eGFR is 30–59, or any report shows CKD Stage 3, start regular nephrology follow-up — this is the stage where careful care makes the biggest difference.',
    related: [['CKD', 'ckd'], ['Stage 4 CKD', 'stage-4-ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetic kidney disease', 'diabetic-kidney-disease']],
  },
  'stage-4-ckd': {
    icon: 'activity', title: 'Stage 4 CKD Treatment', crumb: 'Kidney Diseases · Stage 4 CKD',
    intro: 'Stage 4 is advanced CKD — a time for careful, honest management to protect remaining function and plan ahead calmly, without panic.',
    aboutTitle: 'What is Stage 4 CKD?',
    about: 'Stage 4 chronic kidney disease means an eGFR of 15 to 29 — advanced, but still not dialysis by itself. The goals shift to protecting every bit of remaining function, managing complications (blood pressure, anemia, bone health, potassium and acid balance), following a more careful kidney diet, and planning ahead calmly so that, if kidney function does keep falling, you and your family understand the realistic options before any decision is needed. Reaching Stage 4 is serious, but honest, report-based care and close monitoring help you stay in control rather than in fear.',
    symptoms: ['Tiredness, weakness, poor concentration', 'Swelling in legs or around the eyes', 'Reduced appetite or nausea', 'Itching or dry skin', 'Low hemoglobin (anemia) on reports', 'eGFR 15–29 on reports'],
    approach: ['Close, report-based monitoring of function and complications', 'A stricter personalized diet (RiiMS Renal Plate) — protein, potassium, phosphorus and fluids as advised', 'Managing anemia, bone health, blood pressure and acid balance with your treating team', 'Honest, unhurried discussion of options and preparation, with family support'],
    when: 'If your eGFR is 15–29 or reports show CKD Stage 4, you need prompt, regular nephrology care. Breathlessness, very low urine, persistent vomiting or confusion needs emergency care.',
    related: [['CKD', 'ckd'], ['Stage 3 CKD', 'stage-3-ckd'], ['Kidney Failure', 'kidney-failure'], ['Dialysis guidance', 'dialysis']],
  },
  'kidney-failure': {
    icon: 'heart-crack', title: 'Kidney Failure', crumb: 'Kidney Diseases · Kidney Failure',
    intro: 'Kidney failure (advanced CKD / stage 5) is life-changing news — but understanding your stage and options calmly is the first step to taking control.',
    aboutTitle: 'What does kidney failure mean?',
    about: 'Kidney failure (advanced CKD, usually Stage 5 or ESKD with eGFR below 15) means the kidneys can no longer filter waste and fluid adequately on their own. Reaching Stage 5 does not automatically mean dialysis starts that day — that decision rests on the full clinical picture: your symptoms, potassium, fluid status, acid-base balance and overall health, not eGFR alone. Honest, report-based guidance helps you and your family understand where things stand and plan the realistic options calmly with your doctor.',
    symptoms: ['Severe tiredness and weakness', 'Marked swelling in legs or face', 'Very reduced urine output', 'Nausea, vomiting or loss of appetite', 'Breathlessness', 'Confusion or other uremic symptoms'],
    approach: ['A calm, report-based Kidney Mapping of your true stage — no panic, no false hope', 'Clear explanation of options: medical management, dialysis, or the transplant pathway', 'Symptom, diet, fluid and potassium guidance (RiiMS Renal Plate) to protect quality of life', 'Ongoing monitoring and preparation support for you and your family'],
    when: 'If you have been told your kidneys are failing, or eGFR is very low with worsening symptoms, seek a nephrology consultation promptly and bring all your reports. Sudden very low urine, breathlessness at rest, persistent vomiting or confusion needs emergency care.',
    related: [['Dialysis guidance', 'dialysis'], ['Stage 4 CKD', 'stage-4-ckd'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine']],
  },
  'dialysis': {
    icon: 'waves', title: 'Dialysis Support & Guidance', crumb: 'Kidney Diseases · Dialysis Guidance',
    intro: 'Dialysis raises many questions and fears. We help you understand what it involves, when it is truly needed, and how to prepare — guided strictly by your doctor and reports.',
    aboutTitle: 'What is dialysis and when is it needed?',
    about: 'Dialysis uses a machine (hemodialysis) or the abdomen\'s own lining (peritoneal dialysis) to filter waste and extra fluid when the kidneys can no longer do it adequately. It is not a cure and not a full replacement for the kidney — it partially takes over some kidney functions — and the decision to begin rests on the whole clinical picture: very low kidney function, high potassium, fluid overload or severe uremic symptoms, never on fear or eGFR alone. We never claim dialysis can be "stopped permanently"; instead we help you understand your reports, weigh HD versus PD, and prepare well if it is advised.',
    symptoms: ['Advanced CKD (usually Stage 5) on reports', 'Waste build-up — nausea, severe itching', 'Fluid overload or breathlessness', 'High potassium on reports', 'Doctor-advised access (fistula/catheter) planning', 'Anxiety and many unanswered questions'],
    approach: ['Plain-language explanation of both dialysis types (HD and PD) and how each is chosen', 'Report-based second opinion on timing — guided by the full clinical picture, not eGFR alone', 'Diet, fluid and nutrition guidance (RiiMS Renal Plate) between sessions', 'Ongoing monitoring plus emotional and family counselling support'],
    when: 'If dialysis has been advised and you feel unsure or scared, a calm second opinion with your reports can bring clarity. The final decision stays with your treating nephrologist; signs like irregular heartbeat, breathlessness or confusion need urgent care.',
    related: [['Kidney Failure', 'kidney-failure'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetic kidney disease', 'diabetic-kidney-disease']],
  },
  'proteinuria': {
    icon: 'beaker', title: 'Protein in Urine (Proteinuria)', crumb: 'Kidney Diseases · Protein in Urine',
    intro: 'Protein leaking into urine is an early, important signal from your kidneys. Caught early, the underlying cause can often be treated effectively.',
    aboutTitle: 'Why does protein appear in urine?',
    about: 'Healthy kidney filters are fine enough to keep protein in the blood; when they are inflamed or damaged — by diabetes, blood pressure, infections or a kidney-specific disease — albumin and other proteins leak into the urine. Albuminuria is often the earliest sign of kidney damage, appearing while creatinine still looks normal, so it should never be dismissed. Urine tests (ACR, 24-hour protein) read alongside eGFR show how significant the leak is and what is driving it.',
    symptoms: ['Foamy or frothy urine', 'Puffiness around the eyes, worse in mornings', 'Swelling in feet or ankles', 'Weight gain from fluid', 'Often none — found only on routine urine tests', 'Higher risk with diabetes or high BP'],
    approach: ['Confirm and quantify with proper urine and blood reports — eGFR plus albuminuria together', 'Root-cause identification, not just the number — diabetes, BP or a kidney-specific cause', 'Doctor-led plan with sugar/BP control and a personalized diet (RiiMS Renal Plate)', 'Regular re-testing to track real change over time'],
    when: 'Persistent foamy urine, morning facial puffiness, or protein flagged on any routine test deserves timely evaluation — especially if you have diabetes or hypertension.',
    related: [['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney swelling', 'kidney-swelling-treatment'], ['Diabetic kidney disease', 'diabetic-kidney-disease']],
  },
  'kidney-swelling-treatment': {
    icon: 'droplets', title: 'Kidney Swelling (Edema) Treatment', crumb: 'Kidney Diseases · Kidney Swelling',
    intro: 'Swelling in the feet, ankles or face can have many causes — the kidneys are an important one to check properly.',
    aboutTitle: 'When does swelling point to the kidneys?',
    about: 'When kidneys cannot clear enough salt and water, or when protein is leaking into urine, fluid collects in the tissues — typically the feet and ankles by evening, or around the eyes in the morning. But swelling is not always the kidneys: the heart, liver, veins and some medicines can cause it too, so the right tests matter. A proper work-up — creatinine, eGFR, urine protein and a careful history — reveals the true cause instead of guessing.',
    symptoms: ['Swollen feet or ankles, worse by evening', 'Puffiness around the eyes in the morning', 'Tight rings or shoes', 'Sudden weight gain from fluid', 'Reduced or foamy urine', 'Breathlessness lying flat — seek care promptly'],
    approach: ['Identify the true cause first — kidney, heart, liver or medication', 'Report-based Kidney Mapping — creatinine, eGFR and urine protein', 'Salt, fluid and diet guidance (RiiMS Renal Plate) that fits Indian meals', 'Treat the cause, with honest, ongoing monitoring'],
    when: 'Swelling that persists or recurs, or comes with foamy urine, high BP or breathlessness, should be evaluated without delay. Rapidly increasing swelling with breathlessness needs urgent care.',
    related: [['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney Failure', 'kidney-failure']],
  },
  'diabetic-kidney-disease': {
    icon: 'gauge', title: 'Diabetic Kidney Disease', crumb: 'Kidney Diseases · Diabetic Kidney Disease',
    intro: 'Diabetes is the single biggest cause of kidney disease in India. The damage is silent for years — but screening and good control can substantially lower the risk.',
    aboutTitle: 'How does diabetes damage the kidneys?',
    about: 'Diabetic kidney disease (diabetic nephropathy) develops when years of high blood sugar slowly damage the kidney\'s fine filters. It is the single biggest cause of kidney disease in India, and it is usually silent for a long time — the earliest clue is often microalbumin (a tiny amount of protein) in the urine, appearing long before creatinine rises. The encouraging truth is that not everyone with diabetes develops it, and tight sugar control, good blood-pressure control and regular screening can substantially lower the risk and slow it down. Care always works alongside your diabetes treatment, never instead of it.',
    symptoms: ['Usually silent for years — screening matters', 'Microalbumin in urine on testing', 'Gradually rising creatinine / falling eGFR', 'Swelling in feet as damage advances', 'Blood pressure becoming harder to control', 'Frequent night-time urination'],
    approach: ['Annual kidney screening — urine ACR, creatinine and eGFR read together', 'Coordination with your sugar treatment — supporting it, never replacing it', 'A kidney-protective diet (RiiMS Renal Plate) that works alongside diabetes care', 'Clear targets and ongoing follow-up so you can see your own progress'],
    when: 'Everyone with diabetes should have kidney tests (urine ACR + eGFR) at least once a year. If anything is abnormal — or sugar is hard to control — consult early.',
    related: [['Hypertensive kidney disease', 'hypertensive-kidney-disease'], ['Protein in urine', 'proteinuria'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine']],
  },
  'hypertensive-kidney-disease': {
    icon: 'gauge', title: 'Hypertensive Kidney Disease', crumb: 'Kidney Diseases · Hypertensive Kidney Disease',
    intro: 'High blood pressure both causes and results from kidney disease — a two-way link. Good BP and salt control is one of the strongest ways to protect the kidneys.',
    aboutTitle: 'How does high blood pressure affect the kidneys?',
    about: 'High blood pressure is the second-biggest cause of kidney disease in India — and, because damaged kidneys also raise blood pressure, the two feed each other in a two-way link. Years of high pressure strain the small blood vessels and filters in the kidney, usually silently, with protein in the urine often the first sign. The reassuring part is that controlling blood pressure well — with medication as prescribed and a lower-salt diet — is one of the most powerful ways to protect the kidneys and slow damage. RIIMS coordinates with your blood-pressure treatment rather than replacing it.',
    symptoms: ['Usually no symptoms — silent for years', 'High or hard-to-control blood pressure', 'Protein or foam in the urine', 'Gradually rising creatinine / falling eGFR', 'Headaches or swelling as it advances', 'Higher risk with diabetes alongside'],
    approach: ['Kidney screening for anyone with hypertension — urine ACR, creatinine and eGFR', 'Coordination with your BP medication and targets — supporting it, never replacing it', 'A lower-salt personalized diet (RiiMS Renal Plate) to protect the kidneys and the heart', 'Regular monitoring so blood pressure and kidney trends are tracked together'],
    when: 'Everyone with high blood pressure should have kidney tests at least yearly. If BP is hard to control, or reports show protein or a rising creatinine, consult early.',
    related: [['Diabetic kidney disease', 'diabetic-kidney-disease'], ['Protein in urine', 'proteinuria'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine']],
  },
  'kidney-stone-treatment': {
    icon: 'circle-dot', title: 'Kidney Stone Treatment', crumb: 'Kidney Diseases · Kidney Stone Treatment',
    intro: 'Kidney stones are common and painful — but with the right evaluation and habits, most are treatable and many are preventable. Repeated stones deserve proper work-up.',
    aboutTitle: 'When does a kidney stone need treatment?',
    about: 'Not every kidney stone harms the kidney — a stone becomes a real problem when it recurs, blocks the flow of urine, triggers infection, or is ignored for a long time. Small stones often pass on their own with hydration and time; larger or stuck stones, or those causing obstruction (which can silently injure the kidney as hydronephrosis), may need a procedure. The right first step is a proper evaluation — urine tests and an ultrasound KUB when advised — to judge the stone by its location, size and impact, not size alone, and then a hydration and stone-type-specific diet to break the repeat cycle.',
    symptoms: ['Severe flank or lower-abdomen pain', 'Blood in the urine', 'Nausea or vomiting with the pain', 'Difficulty passing urine', 'Fever with urinary symptoms — needs prompt care', 'Repeated stone episodes'],
    approach: ['Proper evaluation — urine tests and imaging (ultrasound KUB) when advised', 'Assess each stone by location, size and impact — not size alone', 'Hydration, diet and prevention plan tailored to your stone type', 'Doctor-led treatment, referral for a procedure (such as laser/RIRS) when a urologist advises, and follow-up'],
    when: 'Severe pain, fever with urinary symptoms, blood in urine, near-complete stoppage of urine, or a second stone episode all deserve timely evaluation.',
    related: [['UTI treatment', 'uti-treatment'], ['Laser stone treatment', 'laser-kidney-stone-treatment'], ['High Creatinine', 'high-creatinine'], ['Kidney swelling', 'kidney-swelling-treatment']],
  },
  'uti-treatment': {
    icon: 'circle-dot', title: 'Urinary Tract Infection (UTI) Treatment', crumb: 'Kidney Diseases · UTI Treatment',
    intro: 'UTIs are common and usually treatable — but a UTI with fever can involve the kidney, and repeated infections deserve a proper look at the cause.',
    aboutTitle: 'When does a UTI need attention?',
    about: 'A urinary tract infection is common, especially in women, and usually clears with a timely, complete course of the right antibiotic. The key is not to ignore it: an infection with fever and back pain may have reached the kidney (pyelonephritis) and needs deeper, prompt evaluation, while repeated or hard-to-clear UTIs can point to an underlying cause — a stone, an obstruction, an enlarged prostate, or uncontrolled diabetes — that should be investigated. Complete the full treatment your doctor advises, keep well hydrated, and get recurrent infections properly worked up rather than treated again and again in isolation.',
    symptoms: ['Burning or pain while passing urine', 'Frequent, urgent urination', 'Lower-abdomen or pelvic discomfort', 'Cloudy, strong-smelling or bloody urine', 'Fever with back/flank pain — kidney involvement, urgent', 'Repeated infections'],
    approach: ['Urine test and culture to confirm the infection and the right antibiotic', 'A complete, doctor-advised treatment course — not a half-finished one', 'Hydration and hygiene guidance to lower the chance of recurrence', 'Investigation of recurrent or complicated UTIs (stone, obstruction, diabetes) and follow-up'],
    when: 'Fever with urinary symptoms or back pain, blood in urine, repeated UTIs, or a UTI in pregnancy or with diabetes all deserve prompt medical attention.',
    related: [['Kidney Stone Treatment', 'kidney-stone-treatment'], ['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['Kidney swelling', 'kidney-swelling-treatment']],
  },
  'laser-kidney-stone-treatment': {
    icon: 'circle-dot', title: 'Laser Kidney Stone Treatment (RIRS)', crumb: 'Kidney Diseases · Laser Stone Treatment',
    intro: 'Laser (RIRS) stone treatment is one option for certain stones — but not every stone needs a procedure. Here is honest guidance on when it is truly needed.',
    aboutTitle: 'What is laser (RIRS) kidney stone treatment?',
    about: 'Laser stone treatment — including RIRS (retrograde intrarenal surgery) and laser lithotripsy — uses a laser passed through a thin scope to break a stone into tiny fragments that can pass out, usually for stones that are larger, stuck, or causing a blockage or infection. It is important to be honest: not every stone needs a procedure, and many pass with hydration and time. RIIMS gives report-based guidance on whether a procedure is genuinely needed, helps you understand the options, and coordinates referral to a urologist for laser/RIRS when it is advised — then supports you afterwards with hydration, diet and prevention so stones are less likely to return.',
    symptoms: ['A larger or stuck stone on imaging', 'Severe or recurring flank pain', 'Blockage of urine flow (hydronephrosis)', 'Blood in the urine', 'Fever with a known stone — urgent', 'Stones that keep coming back'],
    approach: ['Report-based assessment of whether a procedure is truly needed — many stones do not need one', 'Clear explanation of the options (natural passage, ESWL, laser/RIRS) in plain language', 'Coordination and referral to a urologist for laser/RIRS when advised', 'Post-procedure hydration, diet and prevention support to reduce recurrence'],
    when: 'A stone that is large, blocking urine, causing repeated pain, or associated with fever or infection needs prompt evaluation to decide if laser/RIRS is required.',
    related: [['Kidney Stone Treatment', 'kidney-stone-treatment'], ['UTI treatment', 'uti-treatment'], ['High Creatinine', 'high-creatinine'], ['Kidney disease treatment', 'kidney-disease-treatment']],
  },
};

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
   `redFlags` (emergency box) and `sources` (citations). HEART/GENERAL are
   populated in later tasks. */

/* ---------------- Liver conditions (3 flagship pages, Task 2) ----------------
   Only these 3 slugs exist so far, so `related` links only point at each other
   (linking to a not-yet-built liver slug would be a dead link and fail npm test). */
export const LIVER = {
  'raised-sgpt-sgot': {
    icon: 'beaker', title: 'Raised SGPT / SGOT', crumb: 'Liver · Raised SGPT / SGOT',
    intro: 'A raised SGPT on a health check is a clue, not a diagnosis. It means the liver is irritated, and the next step is finding out why.',
    aboutTitle: 'What does a raised SGPT or SGOT mean?',
    about: 'SGPT (ALT) and SGOT (AST) are enzymes that leak into the blood when liver cells are irritated or damaged. A mildly raised value is common, and on its own it says nothing about which problem caused it. In India the usual reasons are fatty liver, alcohol, certain medicines, herbal or Ayurvedic products, and viral hepatitis. SGPT sits mostly inside the liver, so it is the more specific of the two markers; SGOT also comes from muscle and can rise after hard exercise or a fall. A doctor reads the pattern between the two values, the ratio, and your history, not the number alone. Typical reference ranges are roughly 7–55 U/L for SGPT and 8–48 U/L for SGOT, but every laboratory prints its own range, so check your report against that.',
    symptoms: ['Often none at all', 'Tiredness', 'A dull ache under the right ribs', 'Nausea or poor appetite', 'Found by chance on a routine health check', 'Dark urine, if jaundice is developing'],
    approach: [
      'Repeat the test and read SGPT alongside SGOT, GGT, bilirubin and albumin, not one value on its own',
      'Look for the cause: an ultrasound, hepatitis B and C markers, sugar and lipid tests, and a frank alcohol history',
      'Go through every medicine, supplement and herbal product you take, with dates. This is a common cause that gets missed',
      'A FIB-4 score, calculated from your age, AST, ALT and platelet count, to check whether scarring needs a closer look',
      'Treat what is found, then recheck. A falling SGPT is the goal, not a tonic to bring it down',
    ],
    when: 'See a doctor soon if the value stays raised on a repeat test, or is more than five times the upper limit of normal. Yellow eyes, confusion or bleeding need same-day care.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion, drowsiness or a disturbed sleep pattern', 'Vomiting blood, or black tarry stools', 'Jaundice during pregnancy'],
      soon: ['SGPT more than five times the upper limit of normal', 'A raised value that has not settled on repeat testing', 'Any jaundice, even if you feel well'],
    },
    sources: [
      ['Liver function tests (Cleveland Clinic)', 'https://my.clevelandclinic.org/health/diagnostics/17662-liver-function-tests'],
      ['Interpreting liver function tests (AAFP)', 'https://www.aafp.org/afp/1999/0415/p2223'],
    ],
    related: [['Fatty liver', 'fatty-liver'], ['Liver function test report', 'liver-function-test-report'], ['Drug & herb-induced liver injury', 'drug-herb-induced-liver-injury'], ['Hepatitis B', 'hepatitis-b']],
  },
  'fatty-liver': {
    icon: 'gauge', title: 'Fatty Liver', crumb: 'Liver · Fatty Liver',
    intro: 'Fatty liver is common and usually silent. Your report needs two questions answered, not one: how much fat, and how much scarring, because they are not the same thing.',
    aboutTitle: 'What does a fatty liver report actually mean?',
    about: 'Fatty liver means fat has built up inside liver cells, and it is very common: a 2022 systematic review pooled data across India and estimated that 38.6% of Indian adults have some degree of it. An ultrasound report grades the fat as mild, moderate or severe, Grade 1 to Grade 3, but that grade measures fat only, not scarring. A Grade 3 report with no fibrosis is actually less worrying than a Grade 1 report with significant fibrosis, so the grade by itself does not tell you how serious things are; your doctor needs a separate look at fibrosis risk. Many Indians develop fatty liver well below a BMI of 25, because fat stored around the internal organs matters more here than total body weight. If someone has told you "you are not fat, so it cannot be your liver," that reasoning does not hold in the Indian population; your waist size is usually a better clue than the number on the scale. There is one more nuance that matters. In one study, patients who lost 10% or more of their body weight saw NASH, the inflamed form of fatty liver, resolve completely in 90% of cases. But the underlying scarring, fibrosis, regressed in only 45% of them, and only about 10% of patients in the study managed to lose that much weight in the first place. Once fibrosis has progressed to cirrhosis, weight loss does not undo it. What surprises most patients is that fatty liver works mainly as a marker of metabolic risk: the leading cause of death in people with fatty liver is heart disease, not liver disease.',
    symptoms: ['Often no symptoms at all', 'Mild tiredness or a dull ache under the right ribs', 'Found incidentally on a routine ultrasound', 'A normal weight does not rule it out, especially with a large waist', 'Raised SGPT or SGOT on a blood report', 'Symptoms usually appear only once cirrhosis has developed'],
    approach: [
      'Waist circumference and metabolic screening. BMI alone is not enough for the Indian body type',
      'A fibrosis risk score, such as FIB-4, rather than the ultrasound grade alone, to judge how serious the liver picture really is',
      'Sugar, lipid and blood pressure screening, because fatty liver usually travels with these and drives heart risk',
      'A realistic, gradual weight-loss target guided by your reports, generally 7 to 10%, with diet and activity support',
      'Regular re-testing to track fibrosis risk over time, not a one-off ultrasound',
    ],
    when: 'See a doctor if fatty liver is found on a scan, even if you feel completely well, so your fibrosis risk can be checked properly. Do not wait for symptoms; by the time they appear, the liver may already be more affected.',
    redFlags: {
      emergency: ['Yellow eyes or skin (jaundice)', 'Swelling in the abdomen or legs', 'Vomiting blood, or black tarry stools', 'Confusion or unusual drowsiness'],
    },
    sources: [
      ['Definition & facts of NAFLD/NASH (NIDDK)', 'https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/definition-facts'],
      ['NAFLD prevalence in India: a systematic review, J Clin Exp Hepatol 2022 (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/35677499/'],
      ['Weight loss and histologic outcomes in NASH, Vilar-Gomez et al. (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/25865049/'],
    ],
    related: [['Fatty liver Grade 2', 'fatty-liver-grade-2'], ['Fatty liver diet', 'fatty-liver-diet'], ['Raised SGPT / SGOT', 'raised-sgpt-sgot'], ['Drug & herb-induced liver injury', 'drug-herb-induced-liver-injury']],
  },
  'drug-herb-induced-liver-injury': {
    icon: 'shield-check', title: 'Drug & Herb-Induced Liver Injury', crumb: 'Liver · Drug & Herb-Induced Liver Injury',
    intro: 'Herbs and supplements are not automatically safe for the liver, and pretending otherwise would not serve you. If you take any product, including one of ours, your liver doctor needs to know.',
    aboutTitle: 'What is drug and herb induced liver injury?',
    about: 'Drug and herb induced liver injury, sometimes shortened to DILI, happens when a medicine, herb or supplement damages the liver, usually without warning. In India, the single biggest cause is anti-tuberculosis medication, responsible for 46% of cases in the INDILI network study of 1,288 patients. Traditional and alternative medicines are second, at 14%, ahead of most other drug classes. Giloy (Tinospora cordifolia) is the most frequently reported herbal cause of liver injury in the country. A multicentre study of 43 patients found no contamination in the giloy products tested; the injury came from the herb itself, not an adulterant. In one smaller series, 4 of the 6 patients who developed giloy-related liver injury turned out to have a silent autoimmune liver disease that the herb brought to the surface. Other products linked to liver injury include ashwagandha, which can cause a form of cholestatic hepatitis, concentrated turmeric extracts taken as capsules or supplements, and bakuchi. This is specifically about concentrated extracts, not turmeric used as a cooking spice in ordinary food quantities, which is a different exposure altogether. Most people recover fully once the product responsible is stopped. The real danger is not the herb itself so much as continuing to take it without realising it is the cause, because the injury is silent in its early stages.',
    symptoms: ['Often none in the early stages', 'Yellowing of the eyes or skin', 'Dark urine or pale stools', 'Loss of appetite or nausea', 'Unusual tiredness', 'Itching without a rash'],
    approach: [
      'A full medicine, supplement and herbal product history, with dates, brands and how long each was taken, including anything prescribed by us',
      'Blood tests to confirm the pattern of injury and rule out viral or other causes',
      'Stopping the product responsible, under medical guidance, while continuing every other treatment you actually need',
      'If autoimmune liver disease is suspected, the right blood tests and, if needed, a specialist referral',
      'Re-testing after the product is stopped to confirm the liver is recovering as expected',
    ],
    when: 'If you are on anti-TB treatment and notice yellow eyes, dark urine, nausea or unusual tiredness, contact your doctor the same day. Do not stop anti-TB treatment on your own, even if you suspect it is the cause; stopping it early carries its own serious risks, and your doctor needs to manage the change safely. For any other medicine, herb or supplement, tell your doctor about everything you are taking, at every visit, including products from us.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion or unusual drowsiness', 'Vomiting blood, or black tarry stools', 'Severe abdominal pain or swelling together with yellowing of the eyes'],
      soon: ['Yellow eyes, dark urine or pale stools after starting any new medicine, herb or supplement', 'Unusual tiredness or loss of appetite that does not improve within a few days of stopping a suspected product'],
    },
    sources: [
      ['Drug-induced liver injury in India (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8518348/'],
      ['Giloy (Tinospora cordifolia) induced liver injury: a multicentre study (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9134809/'],
      ['LiverTox: Tinospora cordifolia (NIH)', 'https://www.ncbi.nlm.nih.gov/books/NBK608429/'],
    ],
    related: [['Raised SGPT / SGOT', 'raised-sgpt-sgot'], ['Fatty liver', 'fatty-liver'], ['Liver function test report', 'liver-function-test-report'], ['Jaundice', 'jaundice']],
  },

  /* ---------------- Liver conditions (remaining 9, Task 3) ---------------- */
  'fatty-liver-grade-2': {
    icon: 'gauge', title: 'Fatty Liver Grade 2 Treatment', crumb: 'Liver · Fatty Liver Grade 2',
    intro: 'Grade 2 on an ultrasound report is a common finding, and on its own it is not a reason to panic. It tells you how much fat is in the liver, not how much scarring there is.',
    aboutTitle: 'What does Grade 2 fatty liver mean?',
    about: 'An ultrasound report grades fatty liver from Grade 1 to Grade 3 based on how bright, or echogenic, the liver tissue looks on the scan. Grade 2 means a moderate increase in that brightness, along with reduced visibility of the walls of the portal vein and the diaphragm, findings a radiologist reads directly off the images. This grading is a measure of fat content alone. It says nothing about scarring, or fibrosis, which is the change that actually predicts how the liver will do over the years. A patient with Grade 2 fat and no fibrosis is in a different position to a patient with Grade 1 fat and significant fibrosis, even though the second report reads as the milder one on paper. If your report says Grade 2, the useful next question is not how to get back to Grade 1, but what your fibrosis risk actually is, usually answered with a FIB-4 score calculated from routine blood tests, or a FibroScan if FIB-4 is borderline or your doctor wants a closer look.',
    symptoms: ['Usually no symptoms at all', 'Mild fatigue', 'A dull ache under the right ribs, occasionally', 'Found on a routine or incidental ultrasound', 'Raised SGPT or SGOT on a blood report', 'A normal weight does not rule it out'],
    approach: [
      'A FIB-4 score from routine blood tests (age, AST, ALT and platelet count) to screen for fibrosis risk, since the grade itself only measures fat',
      'FibroScan or a similar elastography test if FIB-4 is borderline or your doctor wants a closer look at scarring',
      'Waist circumference and metabolic screening (sugar, lipids, blood pressure), not BMI alone',
      'A realistic, gradual weight-loss target guided by your reports, generally 7 to 10%',
      'Repeat imaging at an appropriate interval to track change, not a one-off scan',
    ],
    when: 'See a doctor if your ultrasound report shows Grade 2 fatty liver, even if you feel completely well. Ask specifically about your fibrosis risk, since the grade printed on the report does not answer that question by itself.',
    redFlags: {
      emergency: ['Yellow eyes or skin (jaundice)', 'Swelling in the abdomen or legs', 'Vomiting blood, or black tarry stools', 'Confusion or unusual drowsiness'],
    },
    sources: [
      ['Definition & facts of NAFLD/NASH (NIDDK)', 'https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/definition-facts'],
      ['Correlation of ultrasound grades of fatty liver with blood parameters (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10896709/'],
    ],
    related: [['Fatty liver', 'fatty-liver'], ['Fatty liver diet', 'fatty-liver-diet'], ['Liver function test report', 'liver-function-test-report'], ['Raised SGPT / SGOT', 'raised-sgpt-sgot']],
  },
  'fatty-liver-diet': {
    icon: 'salad', title: 'Fatty Liver Diet', crumb: 'Liver · Fatty Liver Diet',
    intro: 'There is no special fatty liver diet beyond an honestly balanced Indian plate, and that is good news: diet and activity are the most effective treatment available for fatty liver.',
    aboutTitle: 'What should I actually eat with fatty liver?',
    about: 'Weight loss through diet and activity is the most effective treatment available for fatty liver, more effective than any product sold as a supplement or a tonic. The same RiiMS Renal Plate used for kidney patients works well here too, because the principle behind it, vegetables filling half the plate, controlled portions of grains and protein, fresh and home-cooked food over packaged and fried, protects the liver in much the same way it protects the kidney. Two things matter more for a fatty liver specifically. First, added sugar and sweetened drinks, cold drinks, packaged juice, sweets, are a direct driver of fat building up inside liver cells, so cutting these down matters more here than in most other conditions. Second, alcohol adds its own separate load onto a liver that already carries fat, so even a small regular habit is worth discussing honestly with your doctor. A realistic, gradual weight-loss target, generally 7 to 10% of body weight over several months and guided by your own reports rather than a fixed number, is what actually changes the disease, not any single food avoided or added.',
    symptoms: ['Often no symptoms at all', 'Mild tiredness or a dull ache under the right ribs', 'Found incidentally on a routine ultrasound', 'A normal weight does not rule it out, especially with a large waist', 'Raised SGPT or SGOT on a blood report', 'Weight regain after a crash diet is common without a sustainable plan'],
    approach: [
      'A personalized eating plan built from your reports, not a generic diet chart taken off the internet',
      'The RiiMS Renal Plate principle applied to a fatty liver: half vegetables, a controlled portion of grains, and lean protein',
      'Cutting added sugar and sweetened drinks, the food group most directly linked to fat building up in the liver',
      'A realistic, gradual weight-loss target (usually 7 to 10% of body weight), reviewed against your own follow-up reports',
      'Honest guidance on alcohol, alongside regular activity and sleep, not diet in isolation',
    ],
    when: 'Talk to a doctor before starting any major diet change if you already have diabetes, are on blood-pressure or sugar medicines, or have another liver condition, so your plan fits your reports and does not clash with your treatment.',
    redFlags: {
      emergency: ['Yellow eyes or skin (jaundice)', 'Swelling in the abdomen or legs', 'Vomiting blood, or black tarry stools', 'Confusion or unusual drowsiness'],
    },
    sources: [
      ['Eating, diet & nutrition for NAFLD/NASH (NIDDK)', 'https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/eating-diet-nutrition'],
      ['Lifestyle modification (diet & exercise) for NAFLD (AGA)', 'https://gastro.org/clinical-guidance/lifestyle-modification-using-diet-and-exercise-to-achieve-weight-loss-in-the-management-of-nonalcoholic-fatty-liver-disease-nafld/'],
    ],
    related: [['Fatty liver', 'fatty-liver'], ['Fatty liver Grade 2', 'fatty-liver-grade-2'], ['Raised SGPT / SGOT', 'raised-sgpt-sgot']],
  },
  'liver-function-test-report': {
    icon: 'file-search', title: 'Liver Function Test (LFT) Report Explained', crumb: 'Liver · LFT Report Explained',
    intro: 'LFT stands for liver function test, but most of what it measures is liver damage, not liver function. Knowing the difference changes how you read your own report.',
    aboutTitle: 'What does a liver function test (LFT) report actually measure?',
    about: 'LFT is something of a misnomer. Most of the tests grouped under a liver function test report, SGPT (ALT), SGOT (AST), ALP and GGT, actually measure liver cell damage or bile-duct strain, not how well the liver is functioning. Only three values on the panel measure function directly: albumin (the main protein the liver makes), bilirubin (a waste product the liver clears), and INR (a measure of how well the liver makes clotting factors). This distinction matters because a liver can be extensively scarred, even cirrhotic, and still return a completely normal LFT report. A patient with cirrhosis and bleeding varices can have SGPT, SGOT and bilirubin all within range, because by that stage there are too few working liver cells left to raise the damage markers, even though the function that remains is failing. A normal LFT report is reassuring, but it is not proof of a normal liver. Typical laboratory ranges are roughly SGPT 7–55 U/L, SGOT 8–48 U/L, total bilirubin 0.1–1.2 mg/dL, albumin 3.5–5.0 g/dL, ALP 45–115 U/L, GGT 0–50 U/L, and INR 0.8–1.1. Every one of these ranges varies slightly between laboratories, so read the range printed on your own report, not the numbers on this page.',
    symptoms: ['A report with SGPT/SGOT raised but everything else normal', 'A report where every value looks normal but you feel unwell', 'Low albumin or a prolonged INR on an otherwise unremarkable report', 'Raised bilirubin, with or without yellow eyes', 'Old reports that were never compared side by side', 'A report ordered for an unrelated reason that came back abnormal'],
    approach: [
      'Read the three function markers, albumin, bilirubin and INR, alongside the damage markers, not instead of them',
      'Compare your report against previous ones to see the trend, since one report in isolation can mislead',
      'A FIB-4 score or further imaging when the pattern suggests fibrosis risk, even if the individual numbers look mild',
      'Correlate the report with your symptoms and history; a number never stands alone',
      'Repeat testing at the right interval rather than reacting to a single abnormal value',
    ],
    when: 'Bring your LFT report to a doctor for review, especially if albumin is low, bilirubin is raised, or INR is prolonged, even if SGPT and SGOT look normal. Do not assume a normal report rules out a liver problem if you have other symptoms or risk factors.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion or unusual drowsiness', 'Vomiting blood, or black tarry stools'],
      soon: ['Albumin below the laboratory range', 'INR above the laboratory range', 'Bilirubin persistently raised on repeat testing'],
    },
    sources: [
      ['Liver function tests (Cleveland Clinic)', 'https://my.clevelandclinic.org/health/diagnostics/17662-liver-function-tests'],
      ['Interpreting liver function tests (AAFP)', 'https://www.aafp.org/afp/1999/0415/p2223'],
    ],
    related: [['Raised SGPT / SGOT', 'raised-sgpt-sgot'], ['Fatty liver', 'fatty-liver'], ['Jaundice', 'jaundice']],
  },
  'jaundice': {
    icon: 'eye', title: 'Jaundice', crumb: 'Liver · Jaundice',
    intro: 'Jaundice, yellow eyes or skin, is a sign, not a disease in itself. The real work is finding out why it is happening, and doing that quickly.',
    aboutTitle: 'What does jaundice mean, and what causes it?',
    about: 'Jaundice means the eyes and skin have turned yellow because bilirubin, a substance the liver would normally clear, has built up in the blood. It is a sign, not a disease in itself, and it can point to several different problems: viral hepatitis, a gallstone blocking the bile duct, certain medicines, or a blood condition that breaks down red cells faster than usual. In Indian adults, hepatitis A and E, usually caught from contaminated water or food, are the commonest causes, and in an otherwise healthy adult both usually settle on their own within a few weeks. Pregnancy changes this picture completely. Hepatitis E in pregnancy, particularly in the later months, has a reported mortality as high as 20 to 30 percent, so any pregnant woman with jaundice needs immediate hospital assessment, not a wait-and-watch approach at home. Because most hepatitis A and E clears on its own within weeks regardless of what is taken during that time, home and local remedies often appear to work, since recovery was usually on the way regardless. The real risk is not the remedy itself but the delay it can cause: the small number of cases that are genuinely severe, or that occur in pregnancy, need a hospital during that same window, and lost days can matter.',
    symptoms: ['Yellowing of the eyes or skin', 'Dark urine', 'Pale or clay-coloured stools', 'Itching', 'Loss of appetite, nausea or vomiting', 'Fever, especially with hepatitis A or E'],
    approach: [
      'Find the cause first: blood tests for hepatitis, an ultrasound to check for gallstones or a blockage, and a careful medicine history',
      'Distinguish a liver-cell cause from a blocked-bile-duct cause, since the two need very different next steps',
      'Immediate hospital referral for any pregnant woman with jaundice, without waiting to see if it settles',
      'Rest, hydration and monitoring for uncomplicated hepatitis A or E in an otherwise well adult, with clear warning signs to watch for',
      'Honest guidance on home and local remedies: they do not shorten the illness, and delaying proper evaluation on their account can be dangerous',
    ],
    when: 'Any pregnant woman with jaundice needs same-day hospital assessment. For anyone else, yellow eyes with confusion, vomiting blood, black stools, or jaundice that is worsening rather than settling after one to two weeks, needs urgent medical attention.',
    redFlags: {
      emergency: ['Jaundice during pregnancy, at any stage', 'Yellow eyes or skin with confusion, drowsiness or a disturbed sleep pattern', 'Vomiting blood, or black tarry stools', 'Jaundice with high fever and severe abdominal pain'],
      soon: ['Jaundice not improving after one to two weeks', 'Jaundice with pale stools and dark urine, suggesting a blocked bile duct', 'Jaundice appearing after starting a new medicine, herb or supplement'],
    },
    sources: [
      ['Adult jaundice (Cleveland Clinic)', 'https://my.clevelandclinic.org/health/symptoms/15367-adult-jaundice'],
      ['Hepatitis E fact sheet (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-e'],
      ['Hepatitis E virus infection during pregnancy (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7286216/'],
    ],
    related: [['Hepatitis B', 'hepatitis-b'], ['Hepatitis C', 'hepatitis-c'], ['Liver function test report', 'liver-function-test-report']],
  },
  'hepatitis-b': {
    icon: 'syringe', title: 'Hepatitis B', crumb: 'Liver · Hepatitis B',
    intro: 'Hepatitis B is usually a long-term infection, not a short illness to get over. The honest news is that it can be controlled well in almost everyone, even though the virus itself does not go away.',
    aboutTitle: 'What is hepatitis B, and does it need lifelong treatment?',
    about: 'Hepatitis B is a viral infection of the liver that can become chronic, staying in the body for years or for life. The World Health Organization estimates around 29 million people in India were living with hepatitis B in 2024, one of the largest numbers of any country. Not everyone with hepatitis B needs medicine. Many people have inactive or low-level infection and need only regular monitoring, blood tests and an ultrasound every six months to a year, to confirm the virus is staying quiet. When treatment is needed, antiviral tablets suppress the virus very effectively and meaningfully lower the risk of cirrhosis and liver cancer over time. What antivirals do not do is clear the virus from the body completely. The WHO is direct about this: most people who start hepatitis B treatment must continue it for life, because stopping usually lets the virus become active again. Loss of the viral surface marker, HBsAg, the best available sign of long-term viral control, happens in only about 3 to 5% of treated patients even after ten years. Prevention remains the strongest tool available: the hepatitis B vaccine given at birth, ideally within 24 hours, is highly effective at stopping a newborn from acquiring the infection from an infected mother. Third-dose hepatitis B vaccine coverage in India has reached 86%, but birth-dose coverage, the single dose that matters most for stopping mother-to-child transmission, is still only around 45%. That gap, more than anything about the vaccine itself, is what still allows hepatitis B to pass from mother to child in India.',
    symptoms: ['Often no symptoms for years', 'Tiredness', 'Yellowing of the eyes or skin', 'Loss of appetite or nausea', 'Found incidentally on a blood test or during pregnancy screening', 'Dark urine'],
    approach: [
      'Confirm the diagnosis and check whether the infection is active, with HBV DNA, liver enzymes and an ultrasound',
      'Decide, using your reports, whether antiviral treatment is needed now or structured monitoring is enough, not treatment by default',
      'If treatment is started, honest counseling that it is usually lifelong, with regular review of how well it is working',
      'Screening for hepatitis B in your close family, and same-day birth-dose vaccination advice if pregnancy is involved',
      'Six-monthly liver monitoring to watch for cirrhosis or early liver cancer in higher-risk patients',
    ],
    when: 'Get tested if a family member has hepatitis B, if you are pregnant, or if a routine blood test shows raised liver enzymes. If you already have hepatitis B and are on antiviral treatment, do not stop it on your own; any change needs to go through your doctor.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion or unusual drowsiness', 'Vomiting blood, or black tarry stools', 'Jaundice during pregnancy'],
      soon: ['New jaundice in a known hepatitis B carrier', 'A family member testing positive without you having been screened', 'A pregnant woman who has not been tested for hepatitis B'],
    },
    sources: [
      ['Hepatitis B fact sheet (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-b'],
      ['Hepatitis B vaccine birth dose in India: time to reconsider (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/31295047/'],
    ],
    related: [['Hepatitis C', 'hepatitis-c'], ['Jaundice', 'jaundice'], ['Liver cirrhosis', 'liver-cirrhosis']],
  },
  'hepatitis-c': {
    icon: 'flask-conical', title: 'Hepatitis C', crumb: 'Liver · Hepatitis C',
    intro: 'Hepatitis C is one of the few chronic viral infections where tablets can clear the virus completely in the large majority of people. The real challenge is finding it before liver damage builds up, not treating it.',
    aboutTitle: 'Is hepatitis C curable?',
    about: 'Hepatitis C is curable in more than 95% of people with a 12–24 week course of tablets (WHO). Treatment is free under India\'s National Viral Hepatitis Control Programme. Unlike hepatitis B, no vaccine exists for hepatitis C, so prevention rests on avoiding exposure, unsterilized needles or instruments, unscreened blood, and shared razors or injecting equipment, rather than vaccination. The real obstacle to eliminating hepatitis C from India is not treatment, which works extremely well, but diagnosis: most people carrying the virus do not know it, because the infection is usually silent for years until liver damage is already advanced. A simple blood test is all it takes to find out. If you have ever had a blood transfusion before screening became routine, used shared needles, or had dialysis, tattooing or piercing with reused equipment, testing is worth doing even if you feel completely well.',
    symptoms: ['Often no symptoms for years', 'Tiredness', 'Yellowing of the eyes or skin', 'Loss of appetite', 'Found incidentally on a blood test', 'Joint pain'],
    approach: [
      'A simple blood test, an antibody test confirmed with an HCV RNA test if positive, to establish the diagnosis',
      'Referral for a free course of directly-acting antiviral tablets under the National Viral Hepatitis Control Programme once confirmed',
      'An assessment of existing liver damage, since the degree of scarring affects follow-up even after the virus is cleared',
      'Testing anyone with a relevant exposure history, even without symptoms, since most infections are silent',
      'A follow-up blood test after treatment finishes to confirm the virus is gone',
    ],
    when: 'If you have ever had a blood transfusion before screening was routine, shared needles, had dialysis or invasive procedures with reused equipment, or a partner with hepatitis C, get tested even without symptoms. Yellow eyes, confusion or vomiting blood need urgent care.',
    redFlags: {
      emergency: ['Yellow eyes or skin with confusion or unusual drowsiness', 'Vomiting blood, or black tarry stools'],
      soon: ['A positive hepatitis C test that has not yet been followed up', 'Unexplained tiredness with a relevant exposure history'],
    },
    sources: [
      ['Hepatitis C fact sheet (WHO)', 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-c'],
      ['National Viral Hepatitis Control Programme (Govt of India)', 'https://nvhcp.mohfw.gov.in/about_us'],
    ],
    related: [['Hepatitis B', 'hepatitis-b'], ['Jaundice', 'jaundice'], ['Liver cirrhosis', 'liver-cirrhosis']],
  },
  'liver-cirrhosis': {
    icon: 'shield-alert', title: 'Liver Cirrhosis', crumb: 'Liver · Cirrhosis',
    intro: 'Cirrhosis cannot be undone — but at every stage, treating the cause changes what happens next.',
    aboutTitle: 'What does a diagnosis of cirrhosis actually mean?',
    about: 'Cirrhosis means the liver has developed enough scarring to change how it is built and how it works, usually as the end result of years of untreated or ongoing liver damage, most often from fatty liver, alcohol, or chronic hepatitis B or C. Cirrhosis cannot be undone, but at every stage, treating the cause changes what happens next. Doctors describe two broad stages. Compensated cirrhosis means the liver is scarred but still manages to do its job well enough that a person may feel completely normal, sometimes for years, especially if the underlying cause is brought under control. Decompensated cirrhosis means the liver can no longer keep up, and complications appear: fluid collecting in the abdomen (ascites), confusion (hepatic encephalopathy), or bleeding from enlarged veins in the food pipe (variceal bleeding). This shift, from compensated to decompensated, changes the outlook the most. It is also the point where stopping the cause, whether that is alcohol, an untreated viral hepatitis, or uncontrolled fatty liver, still meaningfully changes what happens next, even though the scarring itself remains. Regular monitoring matters throughout, because cirrhosis also raises the risk of liver cancer: an ultrasound and an AFP blood test every six months is the standard surveillance schedule for anyone with cirrhosis, worth keeping to even when you feel entirely well.',
    symptoms: ['Often no symptoms for years (compensated stage)', 'Tiredness and reduced appetite', 'Yellowing of the eyes or skin', 'Swelling in the abdomen or legs', 'Confusion, forgetfulness or a flipped day-night sleep pattern', 'Easy bruising or bleeding'],
    approach: [
      'Confirm the diagnosis and stage, compensated or decompensated, and identify the underlying cause',
      'Treat the cause directly, alcohol, viral hepatitis, or fatty liver, since this is what changes the path from here, even after scarring has set in',
      'Six-monthly ultrasound and AFP blood test for liver cancer surveillance, for every patient with cirrhosis',
      'Manage complications as they arise, fluid, confusion, bleeding risk, each with its own specific plan',
      'Involve the family in watching for early confusion or a flipped day-night sleep pattern, since these changes are often noticed at home before the patient notices them',
    ],
    when: 'See a doctor for any known or suspected cirrhosis, even if you feel well, so the cause can be treated and cancer surveillance started. Get emergency care immediately for vomiting blood, black stools, new confusion or a flipped day-night sleep pattern, or fever with abdominal swelling.',
    redFlags: {
      emergency: ['Vomiting blood, or black tarry stools', 'Confusion, drowsiness, or a flipped day-night sleep pattern, sleeping through the day and awake at night, often noticed first by family rather than the patient', 'Fever or abdominal pain together with abdominal swelling (ascites)', 'Passing very little urine'],
      soon: ['New or worsening swelling in the abdomen or legs', 'Mild confusion or forgetfulness that is new, even if it seems minor'],
    },
    sources: [
      ['Definition & facts for cirrhosis (NIDDK)', 'https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/definition-facts'],
      ['AASLD practice guidance on hepatocellular carcinoma (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10663390/'],
      ['Caregivers of patients with hepatic encephalopathy (American Liver Foundation)', 'https://liverfoundation.org/liver-diseases/complications-of-liver-disease/hepatic-encephalopathy/caregivers-of-patients-with-hepatic-encephalopathy/'],
    ],
    related: [['Alcoholic liver disease', 'alcoholic-liver-disease'], ['Hepatitis B', 'hepatitis-b'], ['Hepatitis C', 'hepatitis-c']],
  },
  'alcoholic-liver-disease': {
    icon: 'wine', title: 'Alcoholic Liver Disease', crumb: 'Liver · Alcoholic Liver Disease',
    intro: 'Alcohol-related liver disease moves through stages, and there is real good news: the earlier stages improve substantially once alcohol stops, and even at the latest stage, stopping still changes the outlook.',
    aboutTitle: 'What is alcoholic liver disease, and does it improve if I stop drinking?',
    about: 'Alcoholic liver disease develops in stages, from drinking beyond what the liver can safely process over months or years. The first stage, fatty liver from alcohol, is common and improves substantially, often completely, within weeks of stopping. The next stage, alcoholic hepatitis, is inflammation of the liver caused by alcohol, ranging from mild to life-threatening, and it also improves with abstinence, though recovery is slower and less complete than fatty liver alone. The furthest stage is cirrhosis, scarring that does not go back to normal once it has set in. But stopping alcohol still matters enormously even at this stage: survival improves at every stage of alcoholic liver disease once drinking stops, cirrhosis included, because the liver tissue that remains is protected from further injury. On a blood report, one useful clue that alcohol is driving the picture is the ratio between the two liver enzymes: when AST (SGOT) runs more than twice ALT (SGPT), this pattern favors alcohol as the cause, though it is a clue and not a standalone diagnosis, read alongside your history and other tests.',
    symptoms: ['Often no symptoms in the early stage', 'Tiredness and poor appetite', 'Tenderness or discomfort under the right ribs', 'Yellowing of the eyes or skin', 'Swelling in the abdomen or legs, in later stages', 'Nausea, especially after drinking'],
    approach: [
      'An honest, non-judgmental alcohol history, since accurate treatment depends on an accurate picture',
      'Blood tests including the AST:ALT ratio, alongside imaging, to assess the stage of liver involvement',
      'Support to stop drinking completely, the single most effective step at every stage of this disease',
      'Nutrition support, since alcoholic liver disease often comes with vitamin and protein deficiency',
      'Staged monitoring for cirrhosis and its complications if scarring has already developed',
    ],
    when: 'If you drink regularly and notice tiredness, appetite loss, or discomfort under the right ribs, get your liver checked. Yellow eyes, confusion, or vomiting blood after drinking need emergency care immediately.',
    redFlags: {
      emergency: ['Vomiting blood, or black tarry stools', 'New confusion or unusual drowsiness', 'Sudden, deep yellowing of the eyes or skin'],
      soon: ['AST persistently more than twice ALT on a report', 'Swelling in the abdomen or legs', 'Ongoing heavy drinking with any abnormal liver report'],
    },
    sources: [
      ['Alcohol-associated liver disease (Cleveland Clinic)', 'https://my.clevelandclinic.org/health/diseases/alcohol-associated-liver-disease'],
      ['Alcohol-associated liver disease (StatPearls, NCBI Bookshelf)', 'https://www.ncbi.nlm.nih.gov/books/NBK546632/'],
    ],
    related: [['Liver cirrhosis', 'liver-cirrhosis'], ['Raised SGPT / SGOT', 'raised-sgpt-sgot'], ['Liver function test report', 'liver-function-test-report']],
  },
  'liver-abscess': {
    icon: 'bug', title: 'Liver Abscess', crumb: 'Liver · Liver Abscess',
    intro: 'A liver abscess is a serious infection, but a treatable one. In India it is most often amoebic, and catching it early makes the real difference.',
    aboutTitle: 'What is a liver abscess, and who gets it?',
    about: 'A liver abscess is a collection of pus inside the liver, caused by an infection that has taken hold in the liver tissue. In India, the amoebic type, caused by the parasite Entamoeba histolytica and usually spread through contaminated food or water, is the most common form. It is strongly linked to alcohol use, which is thought to weaken the immune defenses that would otherwise control the parasite, and it typically affects men between 18 and 50 years of age far more often than women. A liver abscess is treatable: most cases respond well to a course of medicine that kills the amoeba, and larger abscesses are drained, usually with a needle or a small tube placed through the skin under imaging guidance, rather than open surgery. Found and treated early, the outlook is good. The danger lies in delay, because a large abscess can rupture into the abdomen or chest, turning a treatable infection into a surgical emergency.',
    symptoms: ['Fever, often with chills', 'Pain in the upper right abdomen, sometimes spreading to the right shoulder', 'Tenderness over the liver', 'Loss of appetite and weight loss', 'Nausea or vomiting', 'Cough or breathlessness, if the abscess is pressing upward'],
    approach: [
      'Confirm the diagnosis with an ultrasound or CT scan, plus blood tests for amoebic serology and infection markers',
      'A course of medicine to treat the amoeba, started promptly once the diagnosis is clear',
      'Drainage of the abscess, usually with a needle or a small catheter under imaging guidance, when it is large or not settling with medicine alone',
      'Screening for and honest discussion of alcohol use, since it is a major associated risk factor',
      'Follow-up imaging to confirm the abscess is resolving as expected',
    ],
    when: 'Fever with pain in the upper right abdomen needs prompt medical evaluation, especially in a man with a history of regular alcohol use. Breathlessness, sudden worsening of pain, or a high fever that spikes suddenly needs emergency care.',
    redFlags: {
      emergency: ['High fever with severe pain in the upper right abdomen', 'Breathlessness or chest pain', 'Sudden worsening of pain or new abdominal rigidity (possible rupture)', 'Confusion or drowsiness with fever'],
      soon: ['Fever with abdominal discomfort persisting beyond a few days', 'Ongoing heavy alcohol use with unexplained fever or weight loss'],
    },
    sources: [
      ['Amebic liver abscess (StatPearls, NCBI Bookshelf)', 'https://www.ncbi.nlm.nih.gov/books/NBK430832/'],
      ['Clinical profile of liver abscess in Northern India (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4066852/'],
    ],
    related: [['Alcoholic liver disease', 'alcoholic-liver-disease'], ['Raised SGPT / SGOT', 'raised-sgpt-sgot'], ['Liver cirrhosis', 'liver-cirrhosis']],
  },
};
export const HEART = {};

/* ---------------- General / Metabolic conditions (Task 4) ----------------
   Diabetes, thyroid, obesity, uric acid and vitamin deficiencies — the
   conditions that sit behind most kidney and liver disease. The two starred
   entries (diabetes-and-kidney-disease, uric-acid-gout) are the kidney
   bridges: they link the existing flat kidney pages (diabetic-kidney-disease,
   hypertensive-kidney-disease, ckd, kidney-stone-treatment) as plain inline
   <a> tags inside `about`, not via `related[]` — the related-link builder in
   pages.mjs only ever targets the current category's own directory, so a
   kidney slug in `related` here would render as conditions/general/<kidney
   slug>.html and 404. All 12 carry redFlags + sources. */
export const GENERAL = {
  'diabetes-and-kidney-disease': {
    icon: 'droplet', title: 'Diabetes and Kidney Disease', crumb: 'General · Diabetes & Kidney Disease',
    intro: 'Diabetes is the single biggest cause of kidney disease in India, and the damage builds silently for years before creatinine ever moves. Good control on the diabetes side protects the kidneys directly.',
    aboutTitle: 'How does diabetes affect the kidneys?',
    about: 'Diabetes damages the kidneys\' filtering units gradually over years of high blood sugar, and it is the leading cause of kidney disease in India today. High blood pressure often travels alongside diabetes and adds its own strain on the same filters, so the two are usually managed together rather than as separate problems. For the detailed picture of how each type of damage progresses, see our pages on <a href="../diabetic-kidney-disease.html">diabetic kidney disease</a> and <a href="../hypertensive-kidney-disease.html">hypertensive kidney disease</a>. The earliest sign in diabetes is not a rising creatinine but a small amount of protein leaking into the urine, called microalbuminuria, which a urine ACR test can pick up years before creatinine or eGFR move outside their normal range. This page focuses on what day-to-day diabetes control means for kidney protection: annual screening, a lower blood pressure target once the kidneys are involved, agreed with your treating doctor, and coordinating sugar and blood pressure treatment as one plan rather than two separate ones.',
    symptoms: ['Usually no symptoms for years, screening is what catches it', 'Protein or foam in the urine (microalbuminuria)', 'Gradually rising creatinine or falling eGFR', 'Blood pressure becoming harder to control', 'Swelling in the feet as damage advances', 'Frequent urination at night'],
    approach: [
      'A yearly urine ACR and eGFR test for everyone with diabetes, whether or not any symptoms are present',
      'A blood pressure target agreed with your treating doctor, usually lower once the kidneys are involved',
      'Sugar control coordinated with your diabetes treatment, supporting it rather than replacing it',
      'A kidney-appropriate diet that also respects your diabetes diet, planned as one plan rather than two',
      'Structured follow-up so any change in your reports is caught early, not found by chance',
    ],
    when: 'Everyone with diabetes should have a urine ACR and eGFR test at least once a year, even without symptoms. If protein appears in the urine, blood pressure becomes hard to control, or creatinine starts rising, ask for a kidney-focused review without delay.',
    redFlags: {
      emergency: ['Very little or no urine output', 'Breathlessness at rest or when lying flat', 'Confusion together with a very high or very low blood sugar reading'],
      soon: ['New or worsening swelling in the feet or around the eyes', 'Protein or foam newly noticed in the urine', 'Blood pressure that has stopped responding to your usual medicine'],
    },
    sources: [
      ['Diabetic kidney disease (NIDDK)', 'https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/diabetic-kidney-disease'],
      ['KDIGO 2022 diabetes management in CKD, synopsis (Annals of Internal Medicine)', 'https://www.acpjournals.org/doi/10.7326/M22-2904'],
    ],
    related: [['Type 2 diabetes', 'type-2-diabetes'], ['Metabolic syndrome', 'metabolic-syndrome'], ['Insulin resistance', 'insulin-resistance']],
  },
  'uric-acid-gout': {
    icon: 'flask-conical', title: 'Uric Acid & Gout', crumb: 'General · Uric Acid & Gout',
    intro: 'A high uric acid number on a health check is not automatically a disease, and gout, kidney stones and kidney disease are linked more closely than most people realise.',
    aboutTitle: 'What does high uric acid actually mean?',
    about: 'Uric acid is a waste product that forms when the body breaks down purines, found in certain foods and made naturally by the body itself. When levels stay high in the blood, a condition called hyperuricaemia, urate crystals can form in joints and cause gout, or settle in the kidneys and contribute to <a href="../kidney-stone-treatment.html">kidney stones</a> and, over time, <a href="../ckd.html">kidney disease</a>. A high uric acid number on a routine health check, without any joint pain or swelling, is not automatically a disease that needs treating. The American College of Rheumatology\'s 2020 guideline conditionally recommends against starting urate-lowering medicine for this kind of symptomless high reading, even in people who also have kidney disease, heart disease or kidney stones, because the medicine\'s downsides can outweigh a benefit that has not been shown for this group. Gout itself is different: once someone has had an actual attack, joint pain with swelling and redness, urate-lowering treatment is usually advised to prevent further attacks and joint damage. One further trap is worth knowing: uric acid levels often fall during an acute gout attack itself, because the inflammation temporarily increases how much is cleared through urine, so a normal reading during a flare does not rule gout out.',
    symptoms: ['Sudden, severe pain in a single joint, often the big toe', 'Redness, warmth and swelling over the joint', 'A high uric acid number found on a routine blood test with no symptoms at all', 'Repeated joint attacks over months or years', 'A history of kidney stones', 'Small firm lumps (tophi) near joints in long-standing gout'],
    approach: [
      'A proper diagnosis first, since a high uric acid number alone does not confirm gout and a normal number during an attack does not rule it out',
      'Prompt treatment of an acute attack to settle the pain and inflammation, guided by a doctor',
      'A decision on long-term urate-lowering treatment based on actual attacks and risk, not a single high lab value',
      'Screening for kidney stones and kidney function in anyone with recurrent gout',
      'Honest diet and lifestyle guidance that fits your reports, without promising a number it cannot reliably deliver',
    ],
    when: 'A single high uric acid reading with no symptoms usually does not need medicine, though it is worth discussing with a doctor. A joint that is genuinely swollen, red and painful needs prompt evaluation, and if it comes with fever, treat it as an emergency, not ordinary gout.',
    redFlags: {
      emergency: ['A hot, swollen joint together with fever, which can mean a joint infection (septic arthritis) rather than gout, until proven otherwise', 'Severe joint pain with chills or feeling unwell overall', 'Sudden inability to move a joint at all'],
      soon: ['A first attack of joint pain and swelling', 'Gout attacks becoming more frequent', 'A known history of kidney stones with a new high uric acid reading'],
    },
    sources: [
      ['2020 ACR Guideline for the Management of Gout (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10563586/'],
      ['Evaluation and management of septic arthritis and its mimics in the ED (West J Emerg Med, PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6404712/'],
    ],
    related: [['Metabolic syndrome', 'metabolic-syndrome'], ['Obesity', 'obesity'], ['Type 2 diabetes', 'type-2-diabetes']],
  },

  /* ---------------- General conditions (remaining 10) ---------------- */
  'type-2-diabetes': {
    icon: 'gauge', title: 'Type 2 Diabetes', crumb: 'General · Type 2 Diabetes',
    intro: 'Type 2 diabetes is a lifelong condition to manage, and for some people intensive weight loss can bring blood sugar into a normal range without medication for a period of time. Doctors call this state remission: a deliberately careful word, not a sign that follow-up can stop.',
    aboutTitle: 'What does a diagnosis of type 2 diabetes mean, and what is remission?',
    about: 'Type 2 diabetes means the body does not use insulin effectively, or does not make enough of it, so blood sugar runs higher than it should. It typically develops over years and often has no early symptoms, which is why routine screening matters as much as symptoms do. In 2021 an international panel convened by the American Diabetes Association and the European Association for the Study of Diabetes agreed on a precise definition of remission: HbA1c below 6.5% sustained for at least three months after completely stopping all glucose-lowering medication. The panel deliberately chose remission over a more absolute-sounding term, because implying the condition was gone for good would wrongly suggest that follow-up is no longer needed. Even in remission, the same yearly checks continue: eye screening, kidney tests, foot checks and an annual HbA1c, because the underlying tendency towards high blood sugar does not disappear. The strongest evidence for remission comes from the DiRECT trial in Scotland, where a structured weight-management programme put 46% of participants into remission at one year, falling to 36% at two years and 13% by five years. DiRECT enrolled people who had lived with diabetes for six years or less, were not on insulin, and were of Scottish background; whether the same results apply to Asian Indians, who tend to develop diabetes at a lower body weight and after fewer years of excess weight, has not been established. What weight loss reliably improves, whether or not full remission is reached, is blood sugar control, blood pressure and the medicine burden.',
    symptoms: ['Increased thirst and frequent urination', 'Unexplained tiredness', 'Slow-healing cuts or frequent infections', 'Blurred vision', 'Tingling or numbness in the feet', 'Often no symptoms at all in the early years'],
    approach: [
      'HbA1c at diagnosis, with eye, kidney, foot and cholesterol screening from the start, not after years of silence',
      'A structured, doctor-guided weight-management plan for those who want to pursue remission, with honest odds rather than a promise',
      'Yoga added to standard treatment modestly improved blood sugar in trials, about 0.4 to 0.6% off HbA1c: a useful addition, never a substitute for medication or monitoring',
      'Continued eye, kidney and foot screening every year, even after remission is reached',
      'Blood pressure, cholesterol and medicine management for heart protection on their own terms: the Look-AHEAD trial found that intensive diet and exercise alone did not reduce heart attacks or strokes once diabetes was established',
    ],
    when: 'A fasting sugar, HbA1c or random blood sugar test confirms the diagnosis. Do not wait for symptoms if you have risk factors such as family history, high BMI or a large waist. Contact your doctor promptly for very high or very low readings, or for the emergency signs below.',
    redFlags: {
      emergency: ['Confusion, drowsiness or difficulty waking someone with diabetes', 'Fruity-smelling breath with vomiting and rapid breathing (possible diabetic ketoacidosis)', 'A blood sugar reading below 70 mg/dL that does not improve after taking sugar', 'Chest pain or breathlessness'],
      soon: ['Blood sugar consistently above your target range despite taking medicine as advised', 'A foot wound, numbness or a new ulcer', 'Blurred vision that is new or worsening'],
    },
    sources: [
      ['Consensus Report: Definition and Interpretation of Remission in Type 2 Diabetes, ADA/EASD (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8929179/'],
      ['5-year follow-up of the DiRECT trial (Lancet Diabetes & Endocrinology)', 'https://www.thelancet.com/journals/landia/article/PIIS2213-8587(23)00385-6/fulltext'],
      ['Cardiovascular effects of intensive lifestyle intervention in type 2 diabetes, Look AHEAD (NEJM)', 'https://www.nejm.org/doi/full/10.1056/NEJMoa1212914'],
    ],
    related: [['Prediabetes', 'prediabetes'], ['Diabetes and kidney disease', 'diabetes-and-kidney-disease'], ['Insulin resistance', 'insulin-resistance'], ['Metabolic syndrome', 'metabolic-syndrome']],
  },
  'prediabetes': {
    icon: 'trending-up', title: 'Prediabetes', crumb: 'General · Prediabetes',
    intro: 'Prediabetes usually causes no symptoms at all, which is exactly why it matters: this is the stage where prevention still has the best odds of working.',
    aboutTitle: 'What does a diagnosis of prediabetes mean?',
    about: 'Prediabetes means blood sugar is higher than normal but not yet high enough to be called diabetes, and it typically causes no symptoms at all, which is exactly why routine screening matters. The ICMR-INDIAB national study found prediabetes in 15.3% of Indian adults. Uttar Pradesh has the lowest measured diabetes prevalence of any Indian state studied, at 4.8%, but this is not a reason for reassurance: the ratio of diabetes to prediabetes in UP is 1:2 or lower, meaning a large pool of people already have prediabetes and have simply not converted to diabetes yet. This is precisely where prevention has the most to offer. The Indian Diabetes Prevention Programme (IDPP-1), a trial conducted on Asian Indians with impaired glucose tolerance, found that over three years 55.0% of the untreated group went on to develop diabetes, compared with 39.3% of the group given a structured lifestyle programme. That is real and meaningful protection, and it is also an honest number: even in the best-performing group, roughly 4 in 10 people still went on to develop diabetes despite the lifestyle changes. Adding metformin to the lifestyle programme in the same trial added no extra benefit over lifestyle alone. Prediabetes is a genuine opportunity to change the odds, not a guarantee that diabetes can be avoided.',
    symptoms: ['Usually no symptoms at all', 'Increased thirst, in some people', 'Patches of darkened skin at the neck or armpits (acanthosis nigricans)', 'Found only on a routine blood sugar or HbA1c test', 'A strong family history of diabetes', 'A large waist with little else noticeable'],
    approach: [
      'A fasting sugar, HbA1c or oral glucose tolerance test to confirm the diagnosis, not a single random reading',
      'A structured, doctor-guided lifestyle programme, since the Indian trial evidence for prediabetes is strongest for lifestyle change rather than medicine',
      'Realistic goal-setting: lifestyle change meaningfully lowers the odds of progressing to diabetes, it does not remove the risk',
      'A yearly re-test, since prediabetes can move to diabetes, stay unchanged, or improve, and only testing tells you which',
      'Screening for blood pressure and cholesterol alongside sugar, since they commonly travel together with prediabetes',
    ],
    when: 'Ask for a fasting sugar or HbA1c test if you have a family history of diabetes, a large waist, or are over 30. Prediabetes has no symptoms to wait for. If you already know you have prediabetes, a yearly re-check is the minimum, not a one-time test.',
    redFlags: {
      emergency: ['Symptoms of very high blood sugar developing quickly, such as excessive thirst, confusion, or fruity-smelling breath with vomiting, need same-day care as this may mean diabetes has already developed'],
      soon: ['A repeat test showing HbA1c or fasting sugar has moved higher since the last check', 'New symptoms such as increased thirst or unexplained weight loss'],
    },
    sources: [
      ['Metabolic non-communicable disease health report of India, ICMR-INDIAB (Lancet Diabetes & Endocrinology)', 'https://www.thelancet.com/journals/landia/article/PIIS2213-8587(23)00119-5/fulltext'],
      ['The Indian Diabetes Prevention Programme, IDPP-1 (Diabetologia)', 'https://link.springer.com/article/10.1007/s00125-005-0097-z'],
    ],
    related: [['Type 2 diabetes', 'type-2-diabetes'], ['Insulin resistance', 'insulin-resistance'], ['Obesity', 'obesity'], ['Metabolic syndrome', 'metabolic-syndrome']],
  },
  'hypothyroidism': {
    icon: 'thermometer', title: 'Hypothyroidism', crumb: 'General · Hypothyroidism',
    intro: 'An underactive thyroid is common and treatable, but not every mildly raised TSH needs a tablet for life. The honest approach is to test properly, not to assume.',
    aboutTitle: 'What does hypothyroidism mean, and does it always need lifelong treatment?',
    about: 'Hypothyroidism means the thyroid gland is not making enough hormone, and the standard treatment, levothyroxine, replaces that hormone rather than repairing the gland itself; for most people who need it, treatment continues long-term. An eight-city Indian study found hypothyroidism in 10.95% of adults screened. But lifelong treatment for everyone is not accurate, and a milder form called subclinical hypothyroidism, a mildly raised TSH with a normal thyroxine level and often no clear symptoms, is treated far too often. A 2019 BMJ Rapid Recommendations panel issued a strong recommendation against giving thyroid hormone for subclinical hypothyroidism in most adults, based on a review of 21 trials covering 2,192 patients that found no meaningful improvement in quality of life, mood or energy from treatment. Treatment remains clearly appropriate in specific situations: pregnancy or planning a pregnancy, a TSH above 10, a positive anti-TPO antibody test together with symptoms, and in children. Outside these situations, the honest and useful step is not to stop a tablet abruptly on your own, but to have your TSH properly reviewed with your doctor to see whether the medicine is actually needed at your current dose, or at all.',
    symptoms: ['Tiredness and low energy', 'Unexplained weight gain', 'Feeling cold when others do not', 'Dry skin and hair thinning', 'Constipation', 'Slowed thinking or low mood'],
    approach: [
      'TSH and free T4 together, not TSH alone, with a borderline result repeated before starting treatment',
      'Treatment for the situations where it is clearly appropriate: overt hypothyroidism, pregnancy or planning pregnancy, a TSH above 10, or anti-TPO positive with symptoms',
      'For milder, subclinical readings without a clear indication, an honest discussion of whether treatment actually helps you rather than automatic prescribing',
      'A dose review through TSH testing at the right interval, rather than an old dose continued indefinitely without a recheck',
      'Any dose change made only with your treating physician, never a decision to stop or reduce medicine on your own',
    ],
    when: 'Get tested if you have persistent tiredness, unexplained weight gain, or a family history of thyroid disease, or if you are pregnant or planning a pregnancy. If you are already on levothyroxine and unsure whether you still need it, ask for a TSH-based review rather than stopping it yourself.',
    redFlags: {
      emergency: ['Severe tiredness with confusion, slowed breathing or a very slow pulse (a rare emergency called myxoedema coma, more common in the elderly with untreated severe hypothyroidism)', 'Chest pain or fainting'],
      soon: ['Symptoms not improving despite treatment', 'A new pregnancy while on or being evaluated for thyroid medicine', 'A TSH result far outside the expected range on a routine test'],
    },
    sources: [
      ['Thyroid hormones treatment for subclinical hypothyroidism: a clinical practice guideline (BMJ, PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/31088853/'],
      ['Prevalence of hypothyroidism in adults: an epidemiological study in eight cities of India (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3743364/'],
    ],
    related: [['Hyperthyroidism', 'hyperthyroidism'], ['Thyroid in pregnancy', 'thyroid-in-pregnancy'], ['Obesity', 'obesity']],
  },
  'hyperthyroidism': {
    icon: 'flame', title: 'Hyperthyroidism', crumb: 'General · Hyperthyroidism',
    intro: 'An overactive thyroid speeds up nearly every system in the body. Most cases are managed well, but two warning signs on treatment need same-day attention.',
    aboutTitle: 'What is hyperthyroidism, and why does fever need urgent attention on treatment?',
    about: 'Hyperthyroidism means the thyroid gland is making too much hormone, speeding up the body\'s metabolism. Graves\' disease, an autoimmune condition, is responsible for roughly 50 to 80% of cases and is the most common cause overall; other causes include toxic nodules and thyroiditis. Symptoms can be dramatic, a racing heart, weight loss despite a good appetite, tremor, heat intolerance, but they can also be mild, especially in older adults, where the main clue may simply be an irregular heartbeat or unexplained weight loss. Treatment usually starts with anti-thyroid medicine, and here one safety point matters more than any other: on these drugs, fever or a sore throat needs an urgent blood test to check the white cell count, not a wait-and-see approach. This is because anti-thyroid drugs carry a rare but serious risk called agranulocytosis, a sudden drop in the white blood cells that fight infection, occurring in roughly 0.2 to 0.5% of people who take them, and it can develop within days. The two most common symptoms of this complication are fever and a sore throat, and getting an urgent blood count checked and contacting your prescribing doctor immediately is the safe response, not waiting to see if it passes. At the far end of severity, poorly controlled hyperthyroidism can tip into thyroid storm, a medical emergency.',
    symptoms: ['Rapid or irregular heartbeat', 'Unexplained weight loss despite normal or increased appetite', 'Tremor or shakiness in the hands', 'Heat intolerance and increased sweating', 'Anxiety, irritability or trouble sleeping', 'A visibly enlarged thyroid (goitre) or bulging eyes, in some cases'],
    approach: [
      'TSH and free T4/T3 to confirm the diagnosis, with the cause identified (Graves\' disease, a toxic nodule, or thyroiditis), since treatment differs by cause',
      'Anti-thyroid medicine where appropriate, with clear safety counselling on the fever and sore-throat warning sign before the first dose',
      'An urgent white blood cell count, the same day, for anyone on anti-thyroid medicine who develops fever or a sore throat',
      'Beta-blockers for symptom control (heart rate, tremor) while the underlying cause is treated',
      'Planned referral for definitive treatment (radioactive iodine or surgery) when appropriate, coordinated with your treating doctor',
    ],
    when: 'A racing heart, unexplained weight loss, tremor or heat intolerance deserve a thyroid blood test. If you are taking anti-thyroid medicine and develop fever or a sore throat, get an urgent blood count check the same day and contact your prescribing doctor immediately.',
    redFlags: {
      emergency: ['Fever or sore throat while taking anti-thyroid medicine (possible agranulocytosis), needing an urgent white blood cell count the same day', 'High fever, a racing heart and confusion or agitation together (possible thyroid storm)', 'Chest pain or severe breathlessness'],
      soon: ['A new or worsening tremor, weight loss or heat intolerance', 'An irregular heartbeat noticed for the first time', 'Eye symptoms, such as bulging, redness or double vision, in someone with known thyroid disease'],
    },
    sources: [
      ['Graves Disease (StatPearls, NCBI Bookshelf)', 'https://www.ncbi.nlm.nih.gov/books/NBK448195/'],
      ['Antithyroid drug induced agranulocytosis: what still we need to learn? (PMC)', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4856502/'],
    ],
    related: [['Hypothyroidism', 'hypothyroidism'], ['Thyroid in pregnancy', 'thyroid-in-pregnancy'], ['Metabolic syndrome', 'metabolic-syndrome']],
  },
  'obesity': {
    icon: 'ruler', title: 'Obesity', crumb: 'General · Obesity',
    intro: 'Obesity in India is best measured at the waist, not on the bathroom scale. A simple tape measure catches risk that weight alone can miss.',
    aboutTitle: 'How is obesity actually measured in India?',
    about: 'The single most useful number for an Indian adult is not weight or BMI, it is waist circumference: 90 cm or more in men, 80 cm or more in women. This threshold is consistent across every major Indian clinical framework and needs nothing more than a measuring tape, unlike BMI, which has been redefined twice and is a less reliable single number for the Indian body type, where fat gathers around the organs even at a modest weight. The 2009 Indian consensus statement set the obesity threshold at a BMI of 25 or more; a 2025 revision lowered that threshold to above 23, reflecting evidence that Indians face metabolic risk at a lower BMI than Western populations. Because these two thresholds differ, it matters which one your report is using; this page uses the 2025 threshold of BMI above 23, paired with waist circumference, rather than BMI alone. What treatment can realistically achieve matters just as much as how obesity is defined. A weight loss of 3 to 5% of body weight produces a meaningful improvement in triglycerides and blood sugar; losing 5 to 10% adds a real improvement in blood pressure and cholesterol. No plan can promise an exact number of kilograms, results vary by person, but even a modest, sustained loss changes your numbers in ways that matter.',
    symptoms: ['Waist circumference at or above 90 cm (men) or 80 cm (women)', 'BMI above 23 (using the 2025 Indian threshold)', 'Breathlessness on ordinary exertion', 'Joint pain, especially in the knees', 'Snoring or disturbed sleep', 'Often found alongside high blood sugar, blood pressure or cholesterol'],
    approach: [
      'Waist circumference and BMI measured together at every visit, not BMI alone',
      'Screening for the conditions obesity commonly travels with: blood sugar, blood pressure, cholesterol and thyroid function',
      'A staged weight-loss target, 3 to 5% first and more if tolerated, built around food, activity and sleep rather than a fixed number',
      'Regular re-measurement against your own reports to track what is actually changing, not the scale alone',
      'Coordination with your physician if medicine or a specific medical condition is contributing, rather than treating weight in isolation',
    ],
    when: 'If your waist measures 90 cm or more (men) or 80 cm or more (women), or your BMI is above 23, it is worth a conversation with a doctor, even if you feel well. Obesity-related risk often shows up in blood tests before it shows up in symptoms.',
    redFlags: {
      emergency: ['Sudden chest pain or breathlessness', 'Loud snoring with witnessed pauses in breathing and daytime collapse or extreme sleepiness (possible severe sleep apnoea)'],
      soon: ['Waist circumference or BMI crossing into the at-risk range on a routine check', 'New joint pain limiting daily activity', 'Breathlessness on mild exertion that is new'],
    },
    sources: [
      ['Revised definition of obesity in Asian Indians living in India (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/39814628/'],
      ['Consensus statement for diagnosis of obesity, abdominal obesity and the metabolic syndrome for Asian Indians, Misra et al 2009 (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/19582986/'],
      ['2013 AHA/ACC/TOS guideline for the management of overweight and obesity in adults (Circulation)', 'https://www.ahajournals.org/doi/10.1161/01.cir.0000437739.71477.ee'],
    ],
    related: [['Metabolic syndrome', 'metabolic-syndrome'], ['Insulin resistance', 'insulin-resistance'], ['Type 2 diabetes', 'type-2-diabetes']],
  },
  'metabolic-syndrome': {
    icon: 'heart-pulse', title: 'Metabolic Syndrome', crumb: 'General · Metabolic Syndrome',
    intro: 'Metabolic syndrome is a cluster of risk factors, not a single disease, and together they raise the risk of diabetes and heart disease more than any one of them alone.',
    aboutTitle: 'What is metabolic syndrome?',
    about: 'Metabolic syndrome is not one disease but a cluster of risk factors that, together, raise the risk of diabetes and heart disease more than any one of them alone. The International Diabetes Federation\'s definition, the one most used in India, makes waist circumference the mandatory starting point: 90 cm or more in men, or 80 cm or more in women. On top of that, a diagnosis needs at least two of four further findings: triglycerides of 150 mg/dL or more, HDL cholesterol below 40 mg/dL in men or below 50 mg/dL in women, blood pressure of 130/85 or higher, and fasting blood sugar of 100 mg/dL or more. A person can meet this definition without ever having been told they have diabetes, high blood pressure or high cholesterol individually, because the syndrome captures the combination itself, and the combination carries more risk than the sum of its parts. This is why a single waist measurement and a basic blood panel, not a single symptom, is what actually identifies it.',
    symptoms: ['A large waist (90 cm or more in men, 80 cm or more in women)', 'Often no symptoms at all otherwise', 'Blood pressure at or above 130/85', 'Raised triglycerides or low HDL on a lipid profile', 'Fasting blood sugar at or above 100 mg/dL', 'Skin tags or darkened skin at the neck, in some people'],
    approach: [
      'Waist circumference, blood pressure, fasting sugar and a full lipid profile measured together, since the diagnosis rests on the combination',
      'The component furthest out of range treated first, guided by your reports, rather than everything addressed at once',
      'A structured diet and activity plan aimed at the waist measurement specifically, not weight alone',
      'Blood pressure, sugar and cholesterol managed together with your treating physician where medicine is needed for any one component',
      'Regular re-testing of all four components together, since improving one without the others still leaves meaningful risk',
    ],
    when: 'If you have a large waist and any one of high blood pressure, high triglycerides, low HDL or raised fasting sugar, ask for the full panel. The other components are often missed if only one is tested.',
    redFlags: {
      emergency: ['Chest pain, breathlessness or one-sided weakness (possible heart attack or stroke)', 'A blood pressure reading of 180/120 or higher with symptoms such as headache or chest pain'],
      soon: ['A new component (sugar, BP, triglycerides or HDL) crossing into the abnormal range on a repeat test', 'Waist circumference increasing on successive checks despite effort'],
    },
    sources: [
      ['The IDF consensus worldwide definition of the metabolic syndrome (IDF)', 'https://idf.org/news-and-resources/resources/idf-consensus-worldwide-definition-of-the-metabolic-syndrome/'],
      ['Metabolic non-communicable disease health report of India, ICMR-INDIAB (Lancet Diabetes & Endocrinology)', 'https://www.thelancet.com/journals/landia/article/PIIS2213-8587(23)00119-5/fulltext'],
    ],
    related: [['Obesity', 'obesity'], ['Insulin resistance', 'insulin-resistance'], ['Uric acid & gout', 'uric-acid-gout']],
  },
  'insulin-resistance': {
    icon: 'activity', title: 'Insulin Resistance', crumb: 'General · Insulin Resistance',
    intro: 'Insulin resistance sits behind prediabetes, fatty liver and metabolic syndrome, and it is often marketed with an expensive blood test that adds little for most people.',
    aboutTitle: 'What is insulin resistance, and should I get a HOMA-IR test?',
    about: 'Insulin resistance means the body\'s cells respond less well to insulin, so the pancreas has to produce more of it to keep blood sugar normal, often years before blood sugar itself rises. It sits upstream of prediabetes, type 2 diabetes, metabolic syndrome and fatty liver, which is why it gets talked about often, sometimes with a specific blood test attached, HOMA-IR or a fasting insulin level. It is worth being clear about what these tests actually are: research tools, used to compare groups in studies, not routine diagnostic tests with an agreed cut-off for an individual Indian patient. No validated Indian cut-off for HOMA-IR exists, cut-offs used in published Indian studies vary depending on who was studied, and these tests are also marketed, sometimes as part of expensive health-check packages, in a way the evidence does not support. A more useful approach is to look at the consequences of insulin resistance directly: waist circumference, HbA1c, a lipid profile, blood pressure and liver enzymes or an ultrasound for fatty liver. These five together tell you more about your actual risk than a HOMA-IR number would, and they are all tests with established, useful reference ranges.',
    symptoms: ['Often no symptoms at all', 'A large waist despite a near-normal weight', 'Darkened, velvety skin at the neck or armpits (acanthosis nigricans)', 'Fatigue after meals', 'Fatty liver found on an ultrasound', 'Skin tags, in some people'],
    approach: [
      'Consequences assessed directly, rather than HOMA-IR or fasting insulin ordered as a routine test: waist circumference, HbA1c, lipid profile, blood pressure and liver enzymes',
      'An ultrasound for fatty liver where indicated, since insulin resistance and fatty liver commonly occur together',
      'A weight and activity plan targeted at waist circumference, since this is what actually improves insulin sensitivity',
      'Screening for prediabetes and metabolic syndrome, since insulin resistance often precedes both',
      'Honest guidance on what commercial insulin-resistance test packages can and cannot tell you',
    ],
    when: 'If you have a large waist, fatty liver, or a family history of diabetes, ask for HbA1c, a lipid profile and blood pressure check rather than a HOMA-IR test. These tests tell your doctor more about what to do next.',
    redFlags: {
      emergency: ['Symptoms of very high blood sugar developing quickly, such as excessive thirst, confusion, or fruity-smelling breath with vomiting'],
      soon: ['Fatty liver found on a scan with abnormal liver enzymes', 'A rising HbA1c or lipid profile on repeat testing', 'New skin darkening at the neck or armpits'],
    },
    sources: [
      ['A study of insulin resistance by HOMA-IR and its cut-off value in urban Indian adolescents (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3890224/'],
      ['NAFLD prevalence in India: a systematic review (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/35677499/'],
    ],
    related: [['Metabolic syndrome', 'metabolic-syndrome'], ['Prediabetes', 'prediabetes'], ['Obesity', 'obesity']],
  },
  'vitamin-d-deficiency': {
    icon: 'sun', title: 'Vitamin D Deficiency', crumb: 'General · Vitamin D Deficiency',
    intro: 'Vitamin D deficiency is one of the most over-tested and over-treated findings in Indian healthcare today. Most healthy adults do not need routine testing at all.',
    aboutTitle: 'Does everyone need a vitamin D test?',
    about: 'Vitamin D deficiency is one of the most over-tested and over-treated conditions in Indian healthcare today. The Endocrine Society\'s 2024 clinical guideline is direct about this: for healthy adults under 75 with no specific risk factor, routine screening of vitamin D levels is not recommended, and routine dosing decisions should not be based on a repeat blood level either. This does not mean vitamin D does not matter; people with osteoporosis, malabsorption, limited sun exposure, or those who are pregnant, elderly or on certain medicines are genuinely at higher risk, and testing them is appropriate. What is not appropriate is testing every asymptomatic adult who walks in for an unrelated complaint, or treating a borderline low level with a high-dose injection as a matter of routine. Mega-dose vitamin D shots, given without any follow-up monitoring, are not harmless: a prospective study from a Kashmir tertiary care centre found that every patient with vitamin D toxicity in the series had received multiple, unmonitored intramuscular injections, with severe cases taking months to resolve. Too much vitamin D raises blood calcium, and real toxicity, nausea, weakness, confusion and kidney strain, can follow. The safer path for most healthy adults is adequate sun exposure and diet, testing reserved for people with an actual risk factor or symptom, and any treatment given at a measured dose with a follow-up plan, not a one-time high-dose shot and no recheck.',
    symptoms: ['Often no symptoms at all', 'Bone or muscle aches, in more significant deficiency', 'Muscle weakness', 'Tiredness', 'Frequent minor infections, in some studies', 'Found incidentally on a blood test done for another reason'],
    approach: [
      'Testing reserved for an actual risk factor (malabsorption, limited sun exposure, osteoporosis, pregnancy, or a relevant medicine), not added routinely to every blood panel',
      'A genuinely low level treated with a measured, monitored dose, not a one-time high-dose injection with no follow-up',
      'Re-testing at an appropriate interval after starting treatment, not repeated frequent testing without a reason',
      'Calcium levels reviewed alongside vitamin D wherever a high dose or injection is being considered',
      'Sun exposure and diet as the first, ordinary steps for most people, before any supplement is considered',
    ],
    when: 'Testing is worth doing if you have bone pain, a condition affecting absorption, very limited sun exposure, or are pregnant or elderly. For most other healthy adults, routine vitamin D testing is not necessary, and a doctor can advise on general sun and diet steps instead.',
    redFlags: {
      emergency: ['Severe nausea, vomiting, confusion or extreme thirst after a high-dose vitamin D injection (possible toxicity with high calcium)'],
      soon: ['Bone pain or repeated fractures with a known low vitamin D level', 'Muscle weakness that is new and unexplained'],
    },
    sources: [
      ['Vitamin D for the Prevention of Disease, 2024 Clinical Practice Guideline (Endocrine Society)', 'https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease'],
      ['Vitamin D toxicity: a prospective study from a tertiary care centre in Kashmir Valley (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6683682/'],
    ],
    related: [['Vitamin B12 deficiency', 'vitamin-b12-deficiency'], ['Obesity', 'obesity'], ['Metabolic syndrome', 'metabolic-syndrome']],
  },
  'vitamin-b12-deficiency': {
    icon: 'syringe', title: 'Vitamin B12 Deficiency', crumb: 'General · Vitamin B12 Deficiency',
    intro: 'Vitamin B12 deficiency causes two separate problems, anaemia and nerve damage, and they do not always show up together. Checking B12 before treating anaemia with folic acid matters more than most people realise.',
    aboutTitle: 'What is vitamin B12 deficiency, and why does it need checking before folic acid?',
    about: 'Vitamin B12 deficiency is common in India, more so in people who eat little or no animal protein, and it causes two separate problems that do not always appear together: anaemia, and damage to nerves. This is where a genuine safety trap lies. High-dose folic acid, often given for anaemia without checking which vitamin is actually low, can correct the blood picture of B12 deficiency, the anaemia looks better, while the nerve damage continues silently underneath, unrecognised because the blood test that prompted concern has normalised. For this reason, B12 should always be checked before folic acid is given for an unexplained anaemia, not assumed. Metformin, one of the most widely used diabetes medicines, is a separate and common cause: long-term use measurably lowers B12 levels, and anyone who has taken it for several years should have a B12 level checked periodically, whether or not they have symptoms. Caught early, B12 deficiency responds well to replacement. The nerve-related symptoms, numbness, tingling, unsteady walking, are the ones to take seriously, because once nerve damage has been present for a long time, it may not fully recover even with treatment, which is exactly why unexplained tingling or numbness deserves a B12 check rather than being dismissed.',
    symptoms: ['Tiredness and weakness', 'Numbness or tingling in the hands or feet', 'Unsteady walking or poor balance', 'Pale skin or breathlessness (from anaemia)', 'Memory difficulty or low mood', 'A sore, smooth tongue'],
    approach: [
      'B12 checked directly before an unexplained anaemia is treated with folic acid, since folic acid can mask the anaemia of B12 deficiency while nerve damage continues',
      'Periodic B12 screening for anyone on long-term metformin, a well-documented, common cause of low B12',
      'Prompt replacement, usually with injections initially where levels are very low or symptoms are neurological, then tablets for maintenance',
      'Numbness, tingling or an unsteady walk taken seriously as an early nerve symptom, not dismissed as age or diabetes',
      'Dietary and supplement guidance for vegetarians and vegans, who are at higher risk, coordinated with your treating doctor',
    ],
    when: 'Get a B12 level checked if you have unexplained tiredness, tingling or numbness in the hands or feet, unsteady walking, or have been on metformin for more than a couple of years. Do not accept folic acid alone for an unexplained anaemia without a B12 check first.',
    redFlags: {
      emergency: ['Sudden weakness, difficulty walking, or loss of bladder or bowel control (needs urgent neurological assessment)', 'Severe breathlessness or chest pain with known significant anaemia'],
      soon: ['New or worsening numbness, tingling or unsteady walking', 'Anaemia found on a blood test without a clear cause', 'Long-term metformin use with no B12 level ever checked'],
    },
    sources: [
      ['Vitamin B12, Health Professional Fact Sheet (NIH Office of Dietary Supplements)', 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/'],
      ['Study of Vitamin B12 deficiency and peripheral neuropathy in metformin-treated early Type 2 diabetes mellitus (PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5040042/'],
    ],
    related: [['Type 2 diabetes', 'type-2-diabetes'], ['Vitamin D deficiency', 'vitamin-d-deficiency'], ['Insulin resistance', 'insulin-resistance']],
  },
  'thyroid-in-pregnancy': {
    icon: 'baby', title: 'Thyroid in Pregnancy', crumb: 'General · Thyroid in Pregnancy',
    intro: 'Thyroid hormone needs change as soon as pregnancy begins. Any woman already on thyroid medication who becomes pregnant needs prompt testing and a dose review, not a wait-and-watch approach.',
    aboutTitle: 'Why does pregnancy change thyroid treatment?',
    about: 'Thyroid hormone needs change as soon as pregnancy begins, and this is one of the few places in medicine where waiting to see is the wrong instinct. Any woman already on thyroid medication who becomes pregnant needs a TSH test and a dose review as soon as the pregnancy is confirmed, because the usual, non-pregnant reference range for TSH is no longer the right yardstick. Thyroid hormone demand rises through pregnancy, especially in the first trimester, and current guidelines use separate, lower TSH reference ranges for each trimester rather than the standard adult range, precisely because a level that would look normal outside pregnancy can already mean under-treatment inside it. The baby\'s own brain development depends on adequate maternal thyroid hormone in early pregnancy, before the baby\'s own thyroid gland is fully functioning, which is why timely correction matters so much here. This is also the honest place to say plainly why stopping thyroid medication on the promise of a natural remedy during pregnancy is genuinely dangerous, not simply unwise: untreated hypothyroidism in pregnancy is linked to a higher risk of miscarriage, preterm birth and impaired childhood development, and no herbal or natural remedy has been shown to replace what the medication is doing. If a woman on thyroid medication wishes to explore Ayurveda or lifestyle support alongside her care, that conversation belongs with her treating doctor, planned together with regular TSH monitoring, never as a reason to stop the tablet first and ask later.',
    symptoms: ['Extreme tiredness beyond normal pregnancy fatigue', 'Unusual weight change, gain or loss', 'A racing heart or, conversely, unusual sluggishness', 'A visibly enlarged thyroid (goitre)', 'Often no symptoms at all, found only on testing', 'A history of thyroid disease before this pregnancy'],
    approach: [
      'Immediate TSH testing as soon as pregnancy is confirmed, for anyone already on thyroid medication or with known thyroid disease',
      'Dose review against trimester-specific reference ranges, not the standard non-pregnant range',
      'Regular re-testing through pregnancy, since the right dose in the first trimester is often not the right dose later on',
      'Clear counselling on why thyroid medication must continue through pregnancy, with any Ayurveda or lifestyle support offered alongside it, never as a replacement',
      'Thyroid care and pregnancy care coordinated together between your obstetrician and endocrinologist, not managed separately',
    ],
    when: 'Any woman on thyroid medication who becomes pregnant, or is planning a pregnancy, needs a TSH test and dose review without delay. This is time-sensitive, not something to fit in at the next routine visit. Newly pregnant women with thyroid symptoms should also be tested.',
    redFlags: {
      emergency: ['Chest pain, a very fast heart rate, or severe breathlessness in a pregnant woman with known thyroid disease', 'Signs of a possible miscarriage or severe abdominal pain, needing immediate obstetric care'],
      soon: ['A missed thyroid dose review after a new pregnancy is confirmed', 'Symptoms of poorly controlled thyroid disease appearing or worsening during pregnancy', 'Any advice to stop thyroid medication that did not come from your treating doctor'],
    },
    sources: [
      ['2017 ATA Guidelines for the Diagnosis and Management of Thyroid Disease During Pregnancy and the Postpartum', 'https://www.liebertpub.com/doi/full/10.1089/thy.2016.0457'],
      ['Trimester-specific reference ranges for thyroid hormones in pregnant women (PMC)', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6358369/'],
    ],
    related: [['Hypothyroidism', 'hypothyroidism'], ['Hyperthyroidism', 'hyperthyroidism']],
  },
};

/* Category key -> condition map. conditionPage()/generate.mjs resolve through this. */
export const CONDITION_SETS = { kidney: CONDITIONS, liver: LIVER, heart: HEART, general: GENERAL };

/* ---------------- Home: conditions grid ---------------- */
export const PROBLEMS = [
  { icon: 'droplet', title: 'High Creatinine', tone: 'blue', slug: 'high-creatinine', desc: 'Understand what raised creatinine means and the safe next steps.' },
  { icon: 'activity', title: 'Chronic Kidney Disease', tone: 'green', slug: 'ckd', desc: 'Slow progression with monitoring, diet and doctor-led care.' },
  { icon: 'heart-crack', title: 'Kidney Failure', tone: 'blue', slug: 'kidney-failure', desc: 'Know your stage and the realistic options available to you.' },
  { icon: 'waves', title: 'Dialysis Support Guidance', tone: 'cream', slug: 'dialysis', desc: 'Prepare for, or understand, dialysis with clear guidance.' },
  { icon: 'beaker', title: 'Protein in Urine', tone: 'green', slug: 'proteinuria', desc: 'Why proteinuria happens and how it is investigated.' },
  { icon: 'droplets', title: 'Kidney Swelling (Edema)', tone: 'blue', slug: 'kidney-swelling-treatment', desc: 'Swelling in feet or face — when it points to the kidneys.' },
  { icon: 'gauge', title: 'Diabetic Kidney Disease', tone: 'green', slug: 'diabetic-kidney-disease', desc: 'Protect kidneys when living with diabetes — screening and care.' },
  { icon: 'circle-dot', title: 'Kidney Stone Treatment', tone: 'cream', slug: 'kidney-stone-treatment', desc: 'Evaluation, treatment and prevention of kidney stones.' },
];

const DEFAULT_WHY = [
  { icon: 'target', title: 'Kidney-focused institute', desc: 'A team and process built specifically around nephrology and kidney health.' },
  { icon: 'git-merge', title: 'DNA Kayakalp Protocol care', desc: 'An integrated D-N-A approach: Diagnosis, Nutrition and Ayurveda-led activation.' },
  { icon: 'map', title: 'Kidney Mapping first', desc: 'We map your full kidney picture — function, markers, diet and lifestyle — before advising.' },
  { icon: 'salad', title: 'RiiMS Renal Plate & lifestyle', desc: 'Practical, region-aware kidney diet and daily-routine guidance you can follow.' },
  { icon: 'leaf', title: 'Supervised Ayurveda support', desc: 'Panchakarma-based support used only alongside medical care, never instead of it.' },
  { icon: 'shield-check', title: 'Ethical patient education', desc: 'Honest information. No “100% cure” or “stop dialysis” promises, ever.' },
];
/* "Why RIIMS" cards (Admin → Why RIIMS). Empty = defaults above. */
export const WHY = (Array.isArray(CONTENT.why) && CONTENT.why.length) ? CONTENT.why : DEFAULT_WHY;

const DEFAULT_STEPS = [
  { n: 1, icon: 'file-text', title: 'Share symptoms & reports', desc: 'Send your concern and reports over WhatsApp, the form, or in clinic.' },
  { n: 2, icon: 'map', title: 'Kidney Mapping & doctor review', desc: 'We assess your full kidney picture — function, markers, diet, medicines and lifestyle.' },
  { n: 3, icon: 'clipboard-list', title: 'Personalized DNA Kayakalp plan', desc: 'A doctor-guided diet and lifestyle plan shaped to your reports and daily life.' },
  { n: 4, icon: 'repeat', title: 'Follow-up & monitoring', desc: 'Ongoing diet, lifestyle and test monitoring, adapted as your condition changes.' },
];
/* "How consultation works" steps (Admin → Steps). Number `n` is auto by order. */
export const STEPS = ((Array.isArray(CONTENT.steps) && CONTENT.steps.length) ? CONTENT.steps : DEFAULT_STEPS)
  .map((s, i) => ({ ...s, n: i + 1 }));

/* ---- Admin-editable content (from data/content.json + content.local.json) ---- */

/* Doctors: one list drives everything. First 3 appear in the compact
   "Doctors & integrated care specialists" section; all appear on the
   doctors page and the home "Meet our experts" carousel. */
export const DOCTORS_FULL = (CONTENT.doctors || []).map((d) => ({
  languages: 'Hindi, English',
  init: d.name.replace(/^Dr\.?\s*/i, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  specialties: [],
  ...d,
}));
export const DOCTORS = DOCTORS_FULL.slice(0, 3);
export const EXPERTS = DOCTORS_FULL;

export const POSTS = (CONTENT.posts || []).map((p) => ({ body: '', ...p }));

export const POPULAR_TOPICS = [
  'High creatinine treatment in India', 'Kidney diet chart (Hindi)', 'Ayurvedic kidney care', 'CKD stage 3 & 4 diet',
  'What does creatinine 5.0 mean', 'Dialysis guidance', 'Kidney specialist in Baraut, UP', 'Protein in urine causes',
  'Foamy urine treatment', 'Diabetic kidney disease', 'Second opinion for kidney', 'Kidney failure symptoms',
];

export const TESTIMONIALS = CONTENT.testimonials || [];

/* The "patient video stories" tile under testimonials (admin: Patient Stories tab). */
export const STORY_VIDEO = {
  enabled: true, title: 'Watch patient video stories', img: 'assets/video-testimonial.webp', url: '',
  ...(CONTENT.storyVideo || {}),
};

export const FAQS = CONTENT.faqs || [];

export const REELS = CONTENT.reels || [];

const DEFAULT_SERVICES = [
  { icon: 'video', t: 'Video Consultation', d: 'Consult expert doctors online' },
  { icon: 'building-2', t: 'Clinic Consultation', d: 'Visit our Baraut clinic' },
  { icon: 'map', t: 'Kidney Mapping & Report Review', d: 'Whole-picture assessment, not one number' },
  { icon: 'clipboard-list', t: 'DNA Kayakalp Protocol Care', d: 'Doctor-led, patient-specific care plan' },
  { icon: 'salad', t: 'RiiMS Renal Plate Diet Planning', d: 'Balanced, portion-aware kidney meals' },
  { icon: 'leaf', t: 'Panchakarma Support (supervised)', d: 'Ayurvedic support alongside medical care' },
  { icon: 'activity', t: 'Lifestyle & Activation Coaching', d: 'Routine, sleep, activity & stress support' },
  { icon: 'waves', t: 'Dialysis Guidance', d: 'Understand & prepare safely' },
  { icon: 'heart-pulse', t: 'BP & Sugar Care', d: 'Protect kidneys from risk' },
  { icon: 'user-round', t: 'Doctors', d: 'Connect with nephrology experts' },
  { icon: 'repeat', t: 'Follow-up Care', d: 'Ongoing monitoring & support' },
];
/* "Complete Care" service tiles (Admin → Services). Empty = defaults above. */
export const SERVICES = (Array.isArray(CONTENT.services) && CONTENT.services.length) ? CONTENT.services : DEFAULT_SERVICES;

/* Multi-disease search dataset (used by the home search banner + site.js). */
export const HEALTH_DB = {
  Kidney: { tone: 'green', doctor: { name: 'Dr. Abhishek Gupta', title: 'Senior Nephrologist', init: 'AG' }, blogs: ['High creatinine: symptoms & causes', 'CKD diet chart (Indian, veg)', 'Dialysis myths vs facts'], video: '5 signs your creatinine is rising' },
  Liver: { tone: 'cream', doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' }, blogs: ['Fatty liver: causes & reversal', 'Foods that support liver health', 'When jaundice needs a doctor'], video: 'Understanding fatty liver in 3 minutes' },
  Diabetes: { tone: 'blue', doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' }, blogs: ['Protect your kidneys with diabetes', 'Diabetic diet basics', 'HbA1c explained simply'], video: 'Diabetes & kidney health: what to watch' },
  Cancer: { tone: 'cream', doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' }, blogs: ['Early warning signs to discuss', 'Nutrition during treatment', 'Getting a second opinion'], video: 'Talking to your doctor about a diagnosis' },
  Heart: { tone: 'blue', doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' }, blogs: ['BP control protects kidneys & heart', 'Heart-friendly Indian diet', 'When chest symptoms need care'], video: 'Blood pressure & your organs' },
};
export const POPULAR = ['Kidney', 'High creatinine', 'CKD', 'Dialysis'];

/* Admin-managed disease-search config (Admin → Search). Each topic: label (chip/badge
   text), keywords (comma match terms), popular (show as a Popular chip), blogSlugs
   (which posts to surface), doctor (specific doctor name or '' = auto nephrologist),
   reel (specific reel title or '' = auto first reel). Falls back to a code default so
   the site still works if the section is absent. */
const DEFAULT_SEARCH = {
  topics: [
    { id: 't-kidney', label: 'Kidney', keywords: 'kidney,creat,ckd,dialys,nephro,gfr,egfr,urine,renal', popular: true, blogSlugs: ['high-creatinine-symptoms-causes', 'ckd-diet-chart-indian-veg', 'dialysis-myths-vs-facts'], doctor: '', reel: '' },
    { id: 't-creat', label: 'High creatinine', keywords: 'creatinine,creat', popular: true, blogSlugs: ['high-creatinine-symptoms-causes', 'reduce-creatinine-safely'], doctor: '', reel: '' },
    { id: 't-ckd', label: 'CKD', keywords: 'ckd,chronic kidney', popular: true, blogSlugs: ['ckd-diet-chart-indian-veg', 'reduce-creatinine-safely'], doctor: '', reel: '' },
    { id: 't-dialysis', label: 'Dialysis', keywords: 'dialys', popular: true, blogSlugs: ['dialysis-myths-vs-facts'], doctor: '', reel: '' },
  ],
};
export const SEARCH = (CONTENT.search && Array.isArray(CONTENT.search.topics) && CONTENT.search.topics.length)
  ? CONTENT.search : DEFAULT_SEARCH;
