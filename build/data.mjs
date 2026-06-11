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
const CONTENT = { ...baseContent, ...localContent };   // section-level override

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

export const SITE = {
  name: 'RIIMS',
  fullName: 'Rashtriya Institute of Integrated Medical Sciences',
  // Production domain (non-www canonical; the server 301-redirects www -> apex).
  origin: 'https://riimshospitals.com',
  phone: `+91 ${CALL.slice(0, 5)} ${CALL.slice(5)}`,
  phoneTel: `+91${CALL}`,              // E.164 — used for tel: and schema
  waNumber: `91${WA}`,                 // bare digits for wa.me deep links
  whatsapp: `https://wa.me/91${WA}`,
  facebook: 'https://www.facebook.com/profile.php?id=61590269039418',
  instagram: 'https://www.instagram.com/riimshospital/',
  city: 'Baraut, Uttar Pradesh 250611',
  addressLine: 'Near Baraut Medicity Hospital',
  addressSub: '36VW+JHV, Kotana Rd, Baraut, Uttar Pradesh 250611',
  hours: 'Mon–Sat, 9am–7pm',
  // Approximate Baraut clinic coordinates — VERIFY against the Google Business Profile.
  geo: { lat: 29.1066, lng: 77.2637 },
  mapsQuery: 'RIIMS+Rashtriya+Institute+of+Integrated+Medical+Sciences+Baraut',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=RIIMS+Baraut',
  serviceCities: ['Baraut', 'Baghpat', 'Meerut', 'Shamli'],
  year: 2026,
};

/* Header navigation (Kidney Diseases / Treatments point at the conditions hub). */
export const NAV = [
  { label: 'About', href: 'about.html' },
  { label: 'Kidney Diseases', href: 'conditions/index.html' },
  { label: 'Treatments', href: 'services.html' },
  { label: 'Doctors', href: 'doctors.html' },
  { label: 'Blog', href: 'blog.html' },
  { label: 'Contact', href: 'contact.html' },
];

/* ---------------- Conditions (8 SEO pages) ---------------- */
export const CONDITIONS = {
  'high-creatinine': {
    icon: 'droplet', title: 'High Creatinine', crumb: 'Kidney Diseases · High Creatinine',
    intro: 'High creatinine often signals that the kidneys are under strain. It is a sign to investigate calmly — not a diagnosis on its own.',
    aboutTitle: 'What does high creatinine mean?',
    about: 'Creatinine is a waste product filtered by your kidneys. When levels rise, it can indicate reduced kidney function — but the cause matters. Dehydration, medication, infection, diabetes and blood pressure can all play a role. A proper review of your reports and history is the only reliable way to understand your situation.',
    symptoms: ['Tiredness and low energy', 'Swelling in feet or face', 'Foamy or reduced urine', 'Loss of appetite, nausea', 'Itching or dry skin', 'High blood pressure'],
    approach: ['Report-based review of creatinine, eGFR, urine and history', 'Doctor-led plan addressing the underlying cause', 'Kidney-friendly diet and lifestyle guidance you can follow', 'Regular monitoring and honest, jargon-free updates'],
    when: 'If creatinine stays elevated across reports, or you have diabetes, high blood pressure or swelling, it is wise to seek a nephrology opinion early. Early guidance gives the most options.',
    related: [['Chronic Kidney Disease (CKD)', 'ckd'], ['Protein in urine', 'proteinuria'], ['Dialysis guidance', 'dialysis'], ['Swelling (edema)', 'swelling']],
  },
  'ckd': {
    icon: 'activity', title: 'Chronic Kidney Disease (CKD)', crumb: 'Kidney Diseases · CKD',
    intro: 'CKD means the kidneys have been working below normal for months. With monitoring, diet and doctor-led care, its progression can often be slowed.',
    aboutTitle: 'What is CKD?',
    about: 'Chronic Kidney Disease is graded in stages (1–5) using eGFR and urine tests. Many people live well with early-stage CKD for years. What matters most is finding the cause — commonly diabetes or high blood pressure — and protecting the kidney function you have through regular monitoring, medication review and the right diet.',
    symptoms: ['Often no symptoms in early stages', 'Swelling around ankles or eyes', 'Changes in urine or foamy urine', 'Tiredness and poor concentration', 'Raised creatinine / falling eGFR in reports', 'High blood pressure'],
    approach: ['Staging from your actual reports (eGFR, urine ACR, history)', 'Doctor-led plan to slow progression and protect function', 'Personalized Indian kidney diet — protein, salt, potassium guidance', 'Scheduled follow-ups so changes are caught early'],
    when: 'If your eGFR is falling, urine shows protein, or you have diabetes/BP with abnormal kidney reports — consult early. Early-stage care offers the most options.',
    related: [['High Creatinine', 'high-creatinine'], ['Kidney Failure', 'kidney-failure'], ['Dialysis guidance', 'dialysis'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'kidney-failure': {
    icon: 'heart-crack', title: 'Kidney Failure', crumb: 'Kidney Diseases · Kidney Failure',
    intro: 'Kidney failure (advanced CKD / stage 5) is life-changing news — but understanding your stage and options calmly is the first step to taking control.',
    aboutTitle: 'What does kidney failure mean?',
    about: 'Kidney failure means the kidneys can no longer adequately filter waste on their own. It does not always mean dialysis starts immediately — the timing depends on your reports, symptoms and overall health. Honest, report-based guidance helps you and your family plan, prepare and choose between the realistic options with your doctor.',
    symptoms: ['Severe tiredness, weakness', 'Significant swelling in legs or face', 'Very reduced urine output', 'Nausea, vomiting or loss of appetite', 'Breathlessness', 'Confusion or trouble concentrating'],
    approach: ['Careful review of your stage from reports — no panic, no false hope', 'Clear explanation of options: medical management, dialysis, transplant pathway', 'Symptom, diet and fluid guidance to maintain quality of life', 'Coordination and preparation support for you and your family'],
    when: 'If you have been told your kidneys are failing, or eGFR is very low with worsening symptoms, seek a nephrology consultation promptly — and bring all your reports.',
    related: [['Dialysis guidance', 'dialysis'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Swelling (edema)', 'swelling']],
  },
  'dialysis': {
    icon: 'waves', title: 'Dialysis Support & Guidance', crumb: 'Kidney Diseases · Dialysis Guidance',
    intro: 'Dialysis raises many questions and fears. We help you understand what it involves, when it is truly needed, and how to prepare — guided strictly by your doctor and reports.',
    aboutTitle: 'What is dialysis and when is it needed?',
    about: 'Dialysis is a treatment that filters waste and extra fluid when kidneys can no longer do it adequately. The decision to start is medical — based on your eGFR, symptoms and overall condition — never on fear. We never claim dialysis can be "stopped permanently"; instead we help you understand your reports, ask the right questions, and prepare well if it is needed.',
    symptoms: ['Advanced CKD (usually stage 5) on reports', 'Symptoms of waste build-up: nausea, severe itching', 'Fluid overload or breathlessness', 'Doctor-advised preparation (fistula planning)', 'Confusion about hemodialysis vs peritoneal options', 'Anxiety and unanswered questions'],
    approach: ['Plain-language explanation of both dialysis types', 'Report-based second opinion on timing — no premature, no delayed', 'Diet, fluid and lifestyle guidance between sessions', 'Emotional preparation and family counselling support'],
    when: 'If dialysis has been advised and you feel unsure or scared, a calm second opinion with your reports can bring clarity. Decisions remain with your treating nephrologist.',
    related: [['Kidney Failure', 'kidney-failure'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'proteinuria': {
    icon: 'beaker', title: 'Protein in Urine (Proteinuria)', crumb: 'Kidney Diseases · Protein in Urine',
    intro: 'Protein leaking into urine is an early, important signal from your kidneys. Caught early, the underlying cause can often be treated effectively.',
    aboutTitle: 'Why does protein appear in urine?',
    about: 'Healthy kidney filters keep protein in the blood. When filters are inflamed or damaged — by diabetes, blood pressure, infections or kidney-specific diseases — protein escapes into urine. Foamy urine is a common first clue. Urine tests (ACR, 24-hour protein) and blood reports together reveal how significant it is and what is causing it.',
    symptoms: ['Foamy or frothy urine', 'Swelling around eyes, especially mornings', 'Swelling in feet or ankles', 'Weight gain from fluid', 'Often detected only on routine urine tests', 'High blood pressure'],
    approach: ['Confirm and quantify with proper urine + blood reports', 'Identify the underlying cause — not just the number', 'Doctor-led treatment plan with diet and BP/sugar control', 'Regular re-testing to track real improvement'],
    when: 'Persistent foamy urine, morning facial puffiness, or protein flagged on any routine test deserves timely evaluation — particularly if you have diabetes or hypertension.',
    related: [['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Swelling (edema)', 'swelling'], ['Diabetes & BP kidney risk', 'diabetes-bp']],
  },
  'swelling': {
    icon: 'droplets', title: 'Swelling (Edema)', crumb: 'Kidney Diseases · Swelling',
    intro: 'Swelling in the feet, ankles or face can have many causes — the kidneys are an important one to check properly.',
    aboutTitle: 'When does swelling point to the kidneys?',
    about: 'When kidneys cannot remove enough salt and water, or when protein is leaking into urine, fluid collects in the tissues — typically feet and ankles by evening, or around the eyes in the morning. Heart, liver and vein problems can also cause swelling, so the right tests matter: kidney function, urine protein, and a careful history.',
    symptoms: ['Swollen feet or ankles, worse by evening', 'Puffiness around eyes in the morning', 'Tight rings or shoes', 'Sudden weight gain', 'Reduced or foamy urine', 'Breathlessness when lying flat (seek care promptly)'],
    approach: ['Identify the true cause — kidney, heart, liver or medication', 'Report-based kidney work-up: creatinine, eGFR, urine protein', 'Salt, fluid and diet guidance that fits Indian meals', 'Treatment of the cause, with honest monitoring'],
    when: 'Swelling that persists, recurs, or comes with foamy urine, high BP or breathlessness should be evaluated without delay.',
    related: [['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney Failure', 'kidney-failure']],
  },
  'diabetes-bp': {
    icon: 'gauge', title: 'Diabetes / BP & Kidney Risk', crumb: 'Kidney Diseases · Diabetes & BP Kidney Risk',
    intro: 'Diabetes and high blood pressure are the two biggest causes of kidney disease in India. Protecting your kidneys starts years before any symptom.',
    aboutTitle: 'How do diabetes and BP damage kidneys?',
    about: 'Years of high sugar and high pressure quietly damage the kidney’s fine filters. The earliest sign is usually microalbumin (tiny protein) in urine — long before creatinine rises. The encouraging news: tight sugar control, good BP control and the right medicines can significantly slow or prevent kidney damage. Annual kidney screening is the key habit.',
    symptoms: ['Usually silent for years — screening matters', 'Microalbumin in urine on testing', 'Gradually rising creatinine', 'Swelling in feet as damage progresses', 'BP becoming harder to control', 'Frequent night-time urination'],
    approach: ['Annual kidney screening plan: urine ACR, creatinine, eGFR', 'Coordination with your sugar/BP treatment — never replacing it', 'Kidney-protective diet that works with diabetes', 'Clear targets and follow-up so you see your own progress'],
    when: 'Every person with diabetes or hypertension should have kidney tests at least yearly. If anything is abnormal — or BP/sugar is hard to control — consult early.',
    related: [['Protein in urine', 'proteinuria'], ['High Creatinine', 'high-creatinine'], ['CKD', 'ckd'], ['Kidney diet (blog)', 'blog:']],
  },
  'stone-uti': {
    icon: 'circle-dot', title: 'Kidney Stone & UTI', crumb: 'Kidney Diseases · Kidney Stone / UTI',
    intro: 'Kidney stones and urinary infections are common, painful and — with the right habits — largely preventable. Repeated episodes deserve proper evaluation.',
    aboutTitle: 'Understanding stones and urinary infections',
    about: 'Stones form when minerals concentrate in urine — often from low water intake in our climate. UTIs are infections of the urinary tract that need timely, complete treatment; repeated UTIs or infections with fever may involve the kidneys and need deeper evaluation. Both conditions can affect kidney function if neglected, which is why recurring episodes should never be ignored.',
    symptoms: ['Severe flank or lower-abdomen pain (stones)', 'Burning or frequent urination (UTI)', 'Blood in urine', 'Fever with urinary symptoms — needs prompt care', 'Nausea with pain episodes', 'Repeated episodes of either'],
    approach: ['Proper evaluation: urine tests, imaging when advised', 'Doctor-led treatment; referral coordination if procedure needed', 'Hydration, diet and prevention plan tailored to your stone type', 'Education to break the repeat-episode cycle'],
    when: 'Severe pain, fever with urinary symptoms, blood in urine, or a second episode of stones/UTI — all deserve timely medical evaluation.',
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
  { icon: 'git-merge', title: 'Integrated medical approach', desc: 'Evidence-aware medical care supported by Ayurveda-informed lifestyle guidance.' },
  { icon: 'clipboard-list', title: 'Personalized care planning', desc: 'Plans shaped by your reports, history, diet and day-to-day life.' },
  { icon: 'salad', title: 'Diet & lifestyle support', desc: 'Practical, region-aware kidney diet and lifestyle guidance you can follow.' },
  { icon: 'file-check-2', title: 'Report-based consultation', desc: 'We review your actual reports before guiding — never guesswork.' },
  { icon: 'shield-check', title: 'Ethical patient education', desc: 'Honest information. No “100% cure” or “stop dialysis” promises, ever.' },
];

export const STEPS = [
  { n: 1, icon: 'file-text', title: 'Share symptoms & reports', desc: 'Send your concern and reports over WhatsApp, the form, or in clinic.' },
  { n: 2, icon: 'search-check', title: 'Doctor / team reviews', desc: 'Our nephrology team studies your case, history and medications.' },
  { n: 3, icon: 'clipboard-list', title: 'Personalized guidance', desc: 'You receive a clear, doctor-guided plan written in plain language.' },
  { n: 4, icon: 'repeat', title: 'Follow-up & lifestyle plan', desc: 'Ongoing diet, lifestyle and monitoring support as you progress.' },
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

export const FAQS = CONTENT.faqs || [];

export const REELS = CONTENT.reels || [];

export const SERVICES = [
  { icon: 'video', t: 'Video Consultation', d: 'Consult expert doctors online' },
  { icon: 'building-2', t: 'Clinic Consultation', d: 'Visit our Baraut clinic' },
  { icon: 'file-check-2', t: 'Report Review', d: 'Doctor-guided report analysis' },
  { icon: 'user-round', t: 'Doctors', d: 'Connect with nephrology experts' },
  { icon: 'waves', t: 'Dialysis Guidance', d: 'Understand & prepare safely' },
  { icon: 'salad', t: 'Diet & Lifestyle', d: 'Personalized kidney diet plans' },
  { icon: 'leaf', t: 'Ayurveda Support', d: 'Integrated lifestyle care' },
  { icon: 'heart-pulse', t: 'BP & Sugar Care', d: 'Protect kidneys from risk' },
  { icon: 'help-circle', t: 'Ask Health Questions', d: 'Answers from our team' },
  { icon: 'clipboard-list', t: 'Care Programs', d: 'Disease-specific plans' },
  { icon: 'repeat', t: 'Follow-up Care', d: 'Ongoing monitoring & support' },
];

/* Multi-disease search dataset (used by the home search banner + site.js). */
export const HEALTH_DB = {
  Kidney: { tone: 'green', doctor: { name: 'Dr. A. Sharma', title: 'Senior Nephrologist', init: 'AS' }, blogs: ['High creatinine: symptoms & causes', 'CKD diet chart (Indian, veg)', 'Dialysis myths vs facts'], video: '5 signs your creatinine is rising' },
  Liver: { tone: 'cream', doctor: { name: 'Dr. R. Verma', title: 'Hepatology & Medicine', init: 'RV' }, blogs: ['Fatty liver: causes & reversal', 'Foods that support liver health', 'When jaundice needs a doctor'], video: 'Understanding fatty liver in 3 minutes' },
  Diabetes: { tone: 'blue', doctor: { name: 'Dr. R. Verma', title: 'Diabetes & Kidney Risk', init: 'RV' }, blogs: ['Protect your kidneys with diabetes', 'Diabetic diet basics', 'HbA1c explained simply'], video: 'Diabetes & kidney health: what to watch' },
  Cancer: { tone: 'cream', doctor: { name: 'RIIMS Care Team', title: 'Guided referral & support', init: 'RC' }, blogs: ['Early warning signs to discuss', 'Nutrition during treatment', 'Getting a second opinion'], video: 'Talking to your doctor about a diagnosis' },
  Heart: { tone: 'blue', doctor: { name: 'Dr. R. Verma', title: 'Internal Medicine', init: 'RV' }, blogs: ['BP control protects kidneys & heart', 'Heart-friendly Indian diet', 'When chest symptoms need care'], video: 'Blood pressure & your organs' },
};
export const POPULAR = ['Kidney', 'High creatinine', 'CKD', 'Dialysis'];
