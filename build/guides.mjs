/* Patient Guides — long-form educational content derived from the "Kidney Kavach"
   book (founder Dr. Abhishek Gupta). Bodies are markdown-lite files in build/guides/*.md,
   rendered by renderBody() in pages.mjs. All copy is compliance-safe (no cure/guarantee
   claims; Ayurveda/herbs framed as supportive, doctor-guided). */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const md = (slug) => readFileSync(join(__dirname, 'guides', `${slug}.md`), 'utf8').trim();

/* Display order (also the hub card order). */
export const GUIDE_ORDER = [
  'how-kidneys-work',
  'understand-kidney-reports',
  'kidney-diet-renal-plate',
  'ayurvedic-kidney-herbs',
  'kidney-myths-facts',
  'everyday-symptom-care',
  '30-day-kidney-plan',
];

export const GUIDES = {
  'how-kidneys-work': {
    icon: 'book-open',
    title: `How Your Kidneys Work (and How Disease Begins)`,
    crumb: `Patient Guides · How Kidneys Work`,
    desc: `Learn what your kidneys do, their 7 jobs, how kidney disease quietly begins, CKD vs AKI, and the early warning signs worth testing for.`,
    intro: `Most people think the kidneys only make urine, but they are one of the body's most multi-functional organs. They clean the blood, balance water and minerals, and do much more. Understanding how they work makes it far easier to see how kidney disease quietly begins, often years before any symptom appears.`,
    blurb: `See what your kidneys do every day and how kidney disease quietly begins. It is the foundation for everything else.`,
    related: ['ckd', 'high-creatinine', 'diabetic-kidney-disease', 'proteinuria'],
    faqs: [
      [`Do the kidneys only make urine?`, `No. Making urine is only one part of their work. The kidneys also clean the blood, balance water and minerals, help control blood pressure, make the EPO hormone for blood formation, activate vitamin D for bone health, and maintain the body's acid-base balance.`],
      [`Does chronic kidney disease (CKD) always lead to dialysis?`, `No. This is a common misconception. Not everyone with CKD needs dialysis. With early detection, regular monitoring, nutrition, lifestyle changes and doctor-led care, many people stay stable for years. Finding it early gives the best chance to plan care well.`],
      [`If I feel fine, can my kidneys still have a problem?`, `Yes. Early kidney disease is often silent because the kidneys have large reserve capacity, so the body keeps working normally even as damage begins. That is why people with diabetes, high blood pressure, obesity, fatty liver, or a family history of kidney disease should get tested regularly rather than wait for symptoms.`],
      [`Why does kidney disease cause low haemoglobin (anaemia)?`, `The kidneys make a hormone called erythropoietin (EPO) that tells the bone marrow to produce red blood cells, part of the body's oxygen-sensing "HIF pathway," the discovery that won the 2019 Nobel Prize in Medicine. When the kidneys are affected, EPO signalling can fall and haemoglobin drops, which is why anaemia is common in kidney disease. It should be checked and managed with your doctor, never self-treated with iron or supplements.`],
    ],
    body: md('how-kidneys-work'),
  },
  'understand-kidney-reports': {
    icon: 'file-search',
    title: `Understand Your Kidney Reports`,
    crumb: `Patient Guides · Understand Your Reports`,
    desc: `Read your kidney reports the honest way: creatinine, eGFR, urine protein, potassium, Hb and ultrasound, and why one number never tells the full story.`,
    intro: `Getting a kidney report with a raised number can feel frightening, but a single value rarely tells the whole story. This guide explains what each test on your kidney report actually means, in plain language, so you can understand your results calmly and ask your doctor the right questions.`,
    blurb: `Make sense of creatinine, eGFR, urine protein and other numbers so you can read your own reports with confidence.`,
    related: ['ckd', 'high-creatinine', 'proteinuria', 'dialysis'],
    faqs: [
      [`My creatinine is high. Does that mean my kidneys have failed?`, `Not necessarily. Creatinine is a marker, not a disease, and a single high value does not confirm kidney failure; it signals that your kidney function should be looked at more closely. Your doctor will read it alongside your eGFR, urine protein, symptoms and previous reports to understand the real picture.`],
      [`Why do doctors rely on eGFR more than creatinine?`, `eGFR estimates how much blood your kidneys actually filter each minute, calculated from creatinine along with age, gender and other factors. Two people can have the same creatinine but different eGFR, so eGFR often reflects true kidney function better and is the basis for CKD staging. Even so, it is always read together with your other tests and symptoms.`],
      [`My urine has protein but my creatinine is normal. Should I worry?`, `Protein in the urine (albuminuria) can be one of the earliest signs of kidney strain, and it sometimes appears while creatinine still looks normal. This is exactly why it should not be ignored, though it is not a reason to panic either. Show the report to your doctor, who will decide whether further tests or monitoring are needed.`],
    ],
    body: md('understand-kidney-reports'),
  },
  'kidney-diet-renal-plate': {
    icon: 'salad',
    title: `Kidney Diet & the RiiMS Renal Plate`,
    crumb: `Patient Guides · Kidney Diet`,
    desc: `A definitive, India-aware kidney diet guide: the RiiMS Renal Plate, protein, sodium, potassium, phosphorus, fluids and the 6 tastes, personalised to you.`,
    intro: `There is no single "kidney diet" that fits every patient. The right plate depends on your CKD stage, your reports, whether you are on dialysis, and conditions like diabetes and blood pressure. This guide explains the science behind each nutrient and introduces the RiiMS Renal Plate, a simple, personalised way to eat well.`,
    blurb: `Build kidney-friendly Indian meals with the RiiMS Renal Plate: practical portions for protein, salt and potassium.`,
    related: ['ckd', 'dialysis', 'proteinuria', 'diabetic-kidney-disease'],
    faqs: [
      [`Do I have to stop dal, fruit and milk completely if I have kidney disease?`, `No. These are valuable foods and are not banned for everyone. Protein foods like dal and milk, and fruits, are restricted only if your stage or reports (for example high potassium or phosphorus) call for it. The right amount is decided from your reports and your doctor or dietitian, not from general advice.`],
      [`How many litres of water should a kidney patient drink daily?`, `There is no fixed number. The right amount depends on your CKD stage, urine output, swelling, dialysis status, heart function, weather and activity. Some patients need to limit fluids while others can drink normally. Also remember that tea, milk, soup, juice and coconut water all count as fluid. Follow your doctor's advice for your situation.`],
      [`Is the RiiMS Renal Plate a fixed diet chart I can just follow?`, `No. It is a visual guide (half vegetables, a quarter grains, a quarter protein) to help you picture a balanced, safe meal. The exact portions and food choices can change based on your diabetes, potassium, phosphorus, dialysis and weight. It is always meant to be personalised with your doctor and a renal dietitian.`],
    ],
    body: md('kidney-diet-renal-plate'),
  },
  'ayurvedic-kidney-herbs': {
    icon: 'leaf',
    title: `Ayurvedic Herbs Studied for Kidney Health: An Honest Guide`,
    crumb: `Patient Guides · Ayurvedic Herbs`,
    desc: `An evidence-honest look at Ayurvedic herbs studied for kidney health: Punarnava, Gokshura, Varuna and more. Supportive only, never cures, always doctor-guided.`,
    intro: `Ayurveda has described several herbs for the urinary system and kidney health for centuries, and modern researchers are now studying some of them. This guide explains what those herbs are traditionally used for and what current research actually explores, honestly. None is a proven cure, and none should be self-started; they may have a supportive role only, always alongside proper medical care.`,
    blurb: `An honest look at herbs studied for kidney health: what is known, what is not, and why nothing replaces your medicines.`,
    related: ['kidney-stone-treatment', 'ckd', 'high-creatinine', 'proteinuria'],
    faqs: [
      [`Can Ayurvedic herbs cure kidney disease or reverse kidney damage?`, `No. These herbs are studied for a possible supportive role only, and much of the evidence is still preliminary. They are not proven to cure kidney disease or reverse damage, and they should never replace the treatment your doctor has prescribed.`],
      [`If a herb is natural, is it safe for my kidneys?`, `Not necessarily. "Natural" does not mean "safe." Herbs are biologically active, can interact with your medicines, and some products can even harm the kidneys if they are poor quality or adulterated. Anyone with kidney disease should get their nephrologist's clearance first and use only quality-assured products.`],
      [`Why doesn't this guide give doses or say which herb to take for my condition?`, `Because the right herb, form, amount, duration and combination differ for every patient and every stage of disease. Those decisions must be made and supervised by a qualified physician who knows your reports and medicines, not chosen from a web page.`],
    ],
    body: md('ayurvedic-kidney-herbs'),
  },
  'kidney-myths-facts': {
    icon: 'scale',
    title: `Kidney Disease: Myths vs Facts (and Common Mistakes)`,
    crumb: `Patient Guides · Myths vs Facts`,
    desc: `Common kidney myths delay timely testing and treatment. Get calm, report-led facts, the biggest mistakes patients make, and what every CKD patient should know.`,
    intro: `Kidney disease is surrounded by myths, and many of them quietly stop people from getting tested, following up, or trusting their treatment at the right time. This guide calmly separates the common myths from the facts. Every fact here is honest and report-led: your creatinine, eGFR, urine protein, symptoms and doctor's guidance together tell the real story, not fear or hearsay.`,
    blurb: `Separate common kidney myths from facts and avoid the everyday mistakes that many patients make without realising.`,
    related: ['dialysis', 'high-creatinine', 'ckd', 'proteinuria'],
    faqs: [
      [`Does high creatinine mean my kidneys have completely failed?`, `No. A single high creatinine value cannot tell the whole story. Your doctor looks at eGFR, urine protein, blood pressure, symptoms and your history together before judging kidney function or deciding on any treatment. High creatinine is a signal to investigate calmly, not a final verdict.`],
      [`My urine looks normal and I feel fine. Can I still have kidney disease?`, `Yes. Kidney disease is often silent in its early stages because healthy nephrons keep working and compensate. Many patients pass normal-looking urine and feel well even after kidney function has dropped. That is exactly why regular testing and follow-up matter, especially if you have diabetes or high blood pressure.`],
      [`Can I stop my kidney medicines once I feel better?`, `No. Feeling better does not always mean the underlying problem has resolved, and stopping or changing any medicine on your own can be harmful. Always take medicines as prescribed and discuss any change with your doctor first.`],
    ],
    body: md('kidney-myths-facts'),
  },
  'everyday-symptom-care': {
    icon: 'heart-pulse',
    title: `Everyday Symptoms in Kidney Disease: Gentle Supportive Care`,
    crumb: `Patient Guides · Everyday Symptom Care`,
    desc: `Gentle, kitchen-level comfort measures for 9 common kidney-disease symptoms, alongside medical care, with clear red-flag signs to see a doctor promptly.`,
    intro: `Kidney disease often brings everyday discomforts like poor appetite, nausea, swelling, or cramps. The measures below are gentle comfort steps to ease these symptoms alongside your prescribed treatment. They are not cures or substitutes for medical care, and every symptom carries red flags where you must see your doctor promptly.`,
    blurb: `Gentle, supportive ways to feel more comfortable with swelling, poor appetite, fatigue and other daily symptoms.`,
    related: ['kidney-swelling-treatment', 'ckd', 'high-creatinine', 'kidney-failure'],
    faqs: [
      [`Are these home measures a treatment for kidney disease?`, `No. They are gentle comfort steps to ease everyday symptoms alongside your prescribed treatment, diet, and medicines. They do not cure kidney disease or replace your doctor's care. Always follow your medical team's plan and the salt, fluid, potassium, and protein limits set for you.`],
      [`Can I start iron or supplements myself if my hemoglobin or cramps feel bad?`, `No. Iron, EPO therapy, and any supplement should be started only on your doctor's advice, after the right tests. Starting them on your own can be harmful in kidney disease. Report low hemoglobin, breathlessness, dizziness, or repeated cramps to your doctor instead.`],
      [`When should I stop home care and see a doctor urgently?`, `Seek care promptly for red flags such as being unable to eat for 2 to 3 days, repeated vomiting, blood in vomit or cough, breathlessness, a sharp fall in urine output, rapidly increasing swelling, fainting, confusion, or chest pain. These need medical attention, not home measures.`],
    ],
    body: md('everyday-symptom-care'),
  },
  '30-day-kidney-plan': {
    icon: 'calendar-check',
    title: `Your 30-Day Kidney Health Plan & Checklist`,
    crumb: `Patient Guides · 30-Day Plan`,
    desc: `A simple 30-day plan of daily habits, weekly checks and a yes/no kidney health checklist to build a lasting routine alongside your doctor's care.`,
    intro: `Kidney health is not built in a single day. It grows from small, correct choices repeated every day. Follow these simple habits for 30 days, alongside your doctor's plan, and you can build a steady, kidney-protective routine that stays with you for the long term.`,
    blurb: `A simple 30-day checklist to build kidney-protective habits, track your numbers and stay on top of follow-ups.`,
    related: ['ckd', 'diabetic-kidney-disease', 'high-creatinine'],
    faqs: [
      [`Will 30 days of these habits cure my kidney disease?`, `No, and this plan does not promise that. Kidney disease needs ongoing medical care. What 30 days can do is help you build steady, healthy habits and better discipline that support your treatment. Always continue the plan your own doctor has given you.`],
      [`What if I miss a day or cannot tick every box?`, `That is normal, and it is not a failure. The goal is consistency over time, not a perfect record. Simply start again the next day. Small correct choices repeated daily are what matter most, so keep going rather than giving up.`],
      [`Can I use this checklist instead of visiting my doctor?`, `No. This checklist is a self-awareness tool to see how well your daily routine supports your kidneys. It does not replace tests, follow-up visits or medical advice. Use it between visits, and always take your medicines exactly as prescribed and keep your scheduled follow-ups.`],
    ],
    body: md('30-day-kidney-plan'),
  },
};

/* Which guides to surface on each condition page ("Helpful guides"). */
export const CONDITION_GUIDES = {
  'high-creatinine': ['understand-kidney-reports', 'kidney-myths-facts', 'kidney-diet-renal-plate'],
  'ckd': ['how-kidneys-work', 'understand-kidney-reports', '30-day-kidney-plan'],
  'kidney-failure': ['understand-kidney-reports', 'everyday-symptom-care', 'kidney-diet-renal-plate'],
  'dialysis': ['kidney-diet-renal-plate', 'everyday-symptom-care', 'kidney-myths-facts'],
  'proteinuria': ['understand-kidney-reports', 'how-kidneys-work', 'kidney-diet-renal-plate'],
  'kidney-swelling-treatment': ['everyday-symptom-care', 'kidney-diet-renal-plate', 'understand-kidney-reports'],
  'diabetic-kidney-disease': ['how-kidneys-work', '30-day-kidney-plan', 'kidney-diet-renal-plate'],
  'kidney-stone-treatment': ['everyday-symptom-care', 'understand-kidney-reports', 'kidney-myths-facts'],
};
