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
    related: [['Chronic Kidney Disease (CKD)', 'ckd'], ['Protein in urine', 'proteinuria'], ['Dialysis guidance', 'dialysis'], ['Swelling (edema)', 'swelling']],
  },
  'ckd': {
    icon: 'activity', title: 'Chronic Kidney Disease (CKD)', crumb: 'Kidney Diseases · CKD',
    intro: 'CKD means the kidneys have been working below normal for months. With monitoring, diet and doctor-led care, its progression can often be slowed.',
    aboutTitle: 'What is CKD?',
    about: 'Chronic Kidney Disease means the kidneys have worked below normal for months, and it is staged 1 to 5 using your eGFR — from Stage 1 (eGFR 90 or more) down to Stage 5 (below 15). Modern guidelines read eGFR together with albuminuria (urine protein), because someone at an early stage with heavy protein leak can carry more risk than the number alone suggests. The stage is not a final verdict — it can change — and finding the cause, most often diabetes or high blood pressure, while protecting remaining function is what matters most.',
    symptoms: ['Often no symptoms in early stages', 'Swelling around ankles or eyes', 'Foamy urine or a change in output', 'Tiredness, weakness, poor concentration', 'Rising creatinine / falling eGFR on reports', 'High blood pressure or low hemoglobin'],
    approach: ['Report-based staging via Kidney Mapping — eGFR and albuminuria read together, not eGFR alone', 'Root-cause identification, commonly diabetes or blood pressure, to help slow progression', 'Personalized Indian kidney diet (RiiMS Renal Plate) — protein, salt and potassium guidance', 'Scheduled follow-ups on a simple Kidney Alert System so changes are caught early'],
    when: 'If your eGFR is falling, urine shows protein, or you have diabetes or BP with abnormal kidney reports, consult early. Early-stage care offers the most options.',
    related: [['High Creatinine', 'high-creatinine'], ['Kidney Failure', 'kidney-failure'], ['Dialysis guidance', 'dialysis'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'kidney-failure': {
    icon: 'heart-crack', title: 'Kidney Failure', crumb: 'Kidney Diseases · Kidney Failure',
    intro: 'Kidney failure (advanced CKD / stage 5) is life-changing news — but understanding your stage and options calmly is the first step to taking control.',
    aboutTitle: 'What does kidney failure mean?',
    about: 'Kidney failure (advanced CKD, usually Stage 5 or ESKD with eGFR below 15) means the kidneys can no longer filter waste and fluid adequately on their own. Reaching Stage 5 does not automatically mean dialysis starts that day — that decision rests on the full clinical picture: your symptoms, potassium, fluid status, acid-base balance and overall health, not eGFR alone. Honest, report-based guidance helps you and your family understand where things stand and plan the realistic options calmly with your doctor.',
    symptoms: ['Severe tiredness and weakness', 'Marked swelling in legs or face', 'Very reduced urine output', 'Nausea, vomiting or loss of appetite', 'Breathlessness', 'Confusion or other uremic symptoms'],
    approach: ['A calm, report-based Kidney Mapping of your true stage — no panic, no false hope', 'Clear explanation of options: medical management, dialysis, or the transplant pathway', 'Symptom, diet, fluid and potassium guidance (RiiMS Renal Plate) to protect quality of life', 'Ongoing monitoring and preparation support for you and your family'],
    when: 'If you have been told your kidneys are failing, or eGFR is very low with worsening symptoms, seek a nephrology consultation promptly and bring all your reports. Sudden very low urine, breathlessness at rest, persistent vomiting or confusion needs emergency care.',
    related: [['Dialysis guidance', 'dialysis'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Swelling (edema)', 'swelling']],
  },
  'dialysis': {
    icon: 'waves', title: 'Dialysis Support & Guidance', crumb: 'Kidney Diseases · Dialysis Guidance',
    intro: 'Dialysis raises many questions and fears. We help you understand what it involves, when it is truly needed, and how to prepare — guided strictly by your doctor and reports.',
    aboutTitle: 'What is dialysis and when is it needed?',
    about: 'Dialysis uses a machine (hemodialysis) or the abdomen\'s own lining (peritoneal dialysis) to filter waste and extra fluid when the kidneys can no longer do it adequately. It is not a cure and not a full replacement for the kidney — it partially takes over some kidney functions — and the decision to begin rests on the whole clinical picture: very low kidney function, high potassium, fluid overload or severe uremic symptoms, never on fear or eGFR alone. We never claim dialysis can be "stopped permanently"; instead we help you understand your reports, weigh HD versus PD, and prepare well if it is advised.',
    symptoms: ['Advanced CKD (usually Stage 5) on reports', 'Waste build-up — nausea, severe itching', 'Fluid overload or breathlessness', 'High potassium on reports', 'Doctor-advised access (fistula/catheter) planning', 'Anxiety and many unanswered questions'],
    approach: ['Plain-language explanation of both dialysis types (HD and PD) and how each is chosen', 'Report-based second opinion on timing — guided by the full clinical picture, not eGFR alone', 'Diet, fluid and nutrition guidance (RiiMS Renal Plate) between sessions', 'Ongoing monitoring plus emotional and family counselling support'],
    when: 'If dialysis has been advised and you feel unsure or scared, a calm second opinion with your reports can bring clarity. The final decision stays with your treating nephrologist; signs like irregular heartbeat, breathlessness or confusion need urgent care.',
    related: [['Kidney Failure', 'kidney-failure'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'proteinuria': {
    icon: 'beaker', title: 'Protein in Urine (Proteinuria)', crumb: 'Kidney Diseases · Protein in Urine',
    intro: 'Protein leaking into urine is an early, important signal from your kidneys. Caught early, the underlying cause can often be treated effectively.',
    aboutTitle: 'Why does protein appear in urine?',
    about: 'Healthy kidney filters are fine enough to keep protein in the blood; when they are inflamed or damaged — by diabetes, blood pressure, infections or a kidney-specific disease — albumin and other proteins leak into the urine. Albuminuria is often the earliest sign of kidney damage, appearing while creatinine still looks normal, so it should never be dismissed. Urine tests (ACR, 24-hour protein) read alongside eGFR show how significant the leak is and what is driving it.',
    symptoms: ['Foamy or frothy urine', 'Puffiness around the eyes, worse in mornings', 'Swelling in feet or ankles', 'Weight gain from fluid', 'Often none — found only on routine urine tests', 'Higher risk with diabetes or high BP'],
    approach: ['Confirm and quantify with proper urine and blood reports — eGFR plus albuminuria together', 'Root-cause identification, not just the number — diabetes, BP or a kidney-specific cause', 'Doctor-led plan with sugar/BP control and a personalized diet (RiiMS Renal Plate)', 'Regular re-testing to track real change over time'],
    when: 'Persistent foamy urine, morning facial puffiness, or protein flagged on any routine test deserves timely evaluation — especially if you have diabetes or hypertension.',
    related: [['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Swelling (edema)', 'swelling'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'swelling': {
    icon: 'droplets', title: 'Swelling (Edema)', crumb: 'Kidney Diseases · Swelling',
    intro: 'Swelling in the feet, ankles or face can have many causes — the kidneys are an important one to check properly.',
    aboutTitle: 'When does swelling point to the kidneys?',
    about: 'When kidneys cannot clear enough salt and water, or when protein is leaking into urine, fluid collects in the tissues — typically the feet and ankles by evening, or around the eyes in the morning. But swelling is not always the kidneys: the heart, liver, veins and some medicines can cause it too, so the right tests matter. A proper work-up — creatinine, eGFR, urine protein and a careful history — reveals the true cause instead of guessing.',
    symptoms: ['Swollen feet or ankles, worse by evening', 'Puffiness around the eyes in the morning', 'Tight rings or shoes', 'Sudden weight gain from fluid', 'Reduced or foamy urine', 'Breathlessness lying flat — seek care promptly'],
    approach: ['Identify the true cause first — kidney, heart, liver or medication', 'Report-based Kidney Mapping — creatinine, eGFR and urine protein', 'Salt, fluid and diet guidance (RiiMS Renal Plate) that fits Indian meals', 'Treat the cause, with honest, ongoing monitoring'],
    when: 'Swelling that persists or recurs, or comes with foamy urine, high BP or breathlessness, should be evaluated without delay. Rapidly increasing swelling with breathlessness needs urgent care.',
    related: [['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney Failure', 'kidney-failure']],
  },
  'diabetes-bp': {
    icon: 'gauge', title: 'Diabetes / BP & Kidney Risk', crumb: 'Kidney Diseases · Diabetes & BP Kidney Risk',
    intro: 'Diabetes and high blood pressure are the two biggest causes of kidney disease in India. Protecting your kidneys starts years before any symptom.',
    aboutTitle: 'How do diabetes and BP damage kidneys?',
    about: 'Diabetes and high blood pressure are the two biggest causes of kidney disease in India, and the damage is usually silent for years. High sugar and high pressure slowly strain the kidney\'s fine filters, and the earliest clue is often microalbumin (tiny protein) in the urine — long before creatinine rises. Not everyone with diabetes or BP develops kidney disease, and the encouraging truth is that tight sugar control, good BP control and regular screening can substantially lower that risk.',
    symptoms: ['Usually silent for years — screening matters', 'Microalbumin in urine on testing', 'Gradually rising creatinine / falling eGFR', 'Swelling in feet as damage advances', 'BP becoming harder to control', 'Frequent night-time urination'],
    approach: ['Annual kidney screening — urine ACR, creatinine and eGFR read together', 'Coordination with your sugar and BP treatment — supporting it, never replacing it', 'Kidney-protective diet (RiiMS Renal Plate) that works alongside diabetes care', 'Clear targets and ongoing follow-up so you can see your own progress'],
    when: 'Everyone with diabetes or hypertension should have kidney tests at least yearly. If anything is abnormal — or sugar/BP is hard to control — consult early.',
    related: [['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney diet (blog)', 'blog:']],
  },
  'stone-uti': {
    icon: 'circle-dot', title: 'Kidney Stone & UTI', crumb: 'Kidney Diseases · Kidney Stone / UTI',
    intro: 'Kidney stones and urinary infections are common, painful and — with the right habits — largely preventable. Repeated episodes deserve proper evaluation.',
    aboutTitle: 'Understanding stones and urinary infections',
    about: 'Not every kidney stone harms the kidney — a stone becomes a real problem when it recurs, blocks the flow of urine, triggers infection, or is ignored for a long time. Obstruction (from stones, prostate enlargement or some congenital causes) backs up urine and can injure the kidney, sometimes silently as hydronephrosis. UTIs need timely, complete treatment; infections with fever may involve the kidney and call for deeper evaluation, which is why repeated episodes should never be brushed aside.',
    symptoms: ['Severe flank or lower-abdomen pain (stones)', 'Burning or frequent urination (UTI)', 'Blood in urine', 'Fever with urinary symptoms — needs prompt care', 'Difficulty passing or holding urine', 'Repeated episodes of either'],
    approach: ['Proper evaluation — urine tests and imaging (ultrasound KUB) when advised', 'Assess each problem by location, size and impact — not size alone', 'Hydration, diet and prevention plan tailored to your stone type', 'Doctor-led treatment, referral if a procedure is needed, and follow-up to break the repeat cycle'],
    when: 'Severe pain, fever with urinary symptoms, blood in urine, near-complete stoppage of urine, or a second episode of stones or UTI all deserve timely evaluation.',
    related: [['High Creatinine', 'high-creatinine'], ['Swelling (edema)', 'swelling'], ['CKD', 'ckd'], ['Protein in urine', 'proteinuria']],
  },
};

/* ---------------- Home: conditions grid ---------------- */
export const PROBLEMS = [
  { icon: 'droplet', title: 'High Creatinine', tone: 'blue', slug: 'high-creatinine', desc: 'Understand what raised creatinine means and the safe next steps.' },
  { icon: 'activity', title: 'Chronic Kidney Disease', tone: 'green', slug: 'ckd', desc: 'Slow progression with monitoring, diet and doctor-led care.' },
  { icon: 'heart-crack', title: 'Kidney Failure', tone: 'blue', slug: 'kidney-failure', desc: 'Know your stage and the realistic options available to you.' },
  { icon: 'waves', title: 'Dialysis Support Guidance', tone: 'cream', slug: 'dialysis', desc: 'Prepare for, or understand, dialysis with clear guidance.' },
  { icon: 'beaker', title: 'Protein in Urine', tone: 'green', slug: 'proteinuria', desc: 'Why proteinuria happens and how it is investigated.' },
  { icon: 'droplets', title: 'Swelling (Edema)', tone: 'blue', slug: 'swelling', desc: 'Swelling in feet or face — when it points to the kidneys.' },
  { icon: 'gauge', title: 'Diabetes / BP Kidney Risk', tone: 'green', slug: 'diabetes-bp', desc: 'Protect kidneys when living with diabetes or hypertension.' },
  { icon: 'circle-dot', title: 'Kidney Stone / UTI', tone: 'cream', slug: 'stone-uti', desc: 'Education on stones and urinary infections, and prevention.' },
];

export const WHY = [
  { icon: 'target', title: 'Kidney-focused institute', desc: 'A team and process built specifically around nephrology and kidney health.' },
  { icon: 'git-merge', title: 'DNA Kayakalp Protocol care', desc: 'An integrated D-N-A approach: Diagnosis, Nutrition and Ayurveda-led activation.' },
  { icon: 'map', title: 'Kidney Mapping first', desc: 'We map your full kidney picture — function, markers, diet and lifestyle — before advising.' },
  { icon: 'salad', title: 'RiiMS Renal Plate & lifestyle', desc: 'Practical, region-aware kidney diet and daily-routine guidance you can follow.' },
  { icon: 'leaf', title: 'Supervised Ayurveda support', desc: 'Panchakarma-based support used only alongside medical care, never instead of it.' },
  { icon: 'shield-check', title: 'Ethical patient education', desc: 'Honest information. No “100% cure” or “stop dialysis” promises, ever.' },
];

export const STEPS = [
  { n: 1, icon: 'file-text', title: 'Share symptoms & reports', desc: 'Send your concern and reports over WhatsApp, the form, or in clinic.' },
  { n: 2, icon: 'map', title: 'Kidney Mapping & doctor review', desc: 'We assess your full kidney picture — function, markers, diet, medicines and lifestyle.' },
  { n: 3, icon: 'clipboard-list', title: 'Personalized DNA Kayakalp plan', desc: 'A doctor-guided diet and lifestyle plan shaped to your reports and daily life.' },
  { n: 4, icon: 'repeat', title: 'Follow-up & monitoring', desc: 'Ongoing diet, lifestyle and test monitoring, adapted as your condition changes.' },
];

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

export const SERVICES = [
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
