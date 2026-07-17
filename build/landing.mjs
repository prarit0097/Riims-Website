/* ============================================================================
   RIIMS landing pages — the "where do I get treated" SEO silo.

   These target place/intent keywords ("… hospital in Delhi-NCR", "affordable …")
   as opposed to the condition pages, which explain the diseases. Keep that split:
   if a landing page starts re-explaining CKD, it becomes a duplicate of
   /conditions/ckd.html and the two fight each other in Google. Link, don't repeat.

   Rendered by landingPage() in build/pages.mjs; registered in build/generate.mjs.
   Fields (REQUIRED unless marked optional):
     dir      '' for a root page (/slug.html), 'doctors' for /doctors/slug.html
     icon     lucide name (site/assets/vendor/lucide.min.js) — a wrong name renders blank
     h1       visible heading. NO "Best …" self-claim — see the rule in pages.mjs:207
     metaTitle  <title>
     intro    hero paragraph; also the meta description. KEEP IT ≤155 — head() calls
              clampDesc(), which truncates silently at 155 and will cut your last clause
     lead     opening paragraph of the body
     when     "When to get in touch" paragraph
     related  [[label, conditionSlug], …] — links to /conditions/<slug>.html (optional,
              but a page with none loses its outbound topical links)
     points   optional — { title, items[] } card list
     body     optional — [[heading, paragraph], …]
     faqs     optional — [[q, a], …]. Rendered AND emitted as FAQPage schema, so the two
              must stay identical; Google penalises schema that isn't on the page
     doctor   optional — false hides the founder card (see landingPage's comment)

   COMPLIANCE (build/compliance.mjs enforces the wording at save time; these rules
   are the reason this copy reads the way it does):
     · Dr. Abhishek Gupta is B.A.M.S. (Ayurvedacharya) — NEVER an MD/DM nephrologist.
     · No cure/guarantee claims; never that dialysis can be avoided or stopped.
     · RIIMS is in Baraut, UP — in the NCR region, not a Delhi city clinic.
     · No invented prices. We have no pricing data; a made-up figure is a lie.
   ============================================================================ */

export const LANDING = {
  'best-nephrologist-delhi-ncr': {
    dir: 'doctors',
    icon: 'route',
    h1: 'Nephrologist Care in Delhi NCR & Baraut',
    metaTitle: 'Nephrologist in Delhi NCR — How Kidney Care at RIIMS Works',
    crumb: 'Doctors · Nephrologist Care (Delhi NCR)',
    intro: 'Searching for a nephrologist in Delhi NCR? RIIMS kidney care is led by an Ayurvedacharya (B.A.M.S.), and we refer to a nephrologist when you need one.',
    // No founder card here: his face under a "nephrologist" heading would imply a
    // qualification he does not hold. The page speaks for the institution instead.
    doctor: false,
    lead: 'A nephrologist is a doctor who holds MBBS, then MD, then a DM in nephrology. Dr. Abhishek Gupta, who leads kidney care at RIIMS, does not hold that qualification, and we are not going to let you assume otherwise: he is an Ayurvedacharya (B.A.M.S.) who has spent more than fifteen years on integrated, report-based kidney care. For dialysis decisions, acute kidney injury, transplant workup and advanced medical management you need a nephrologist, and our job is to make sure you are seeing one.',
    points: {
      title: 'Which one do you actually need?',
      items: [
        'Dialysis decisions, acute kidney injury, a transplant workup or advanced medical management: that is nephrologist work. Ask us and we will refer you.',
        'A creatinine that keeps climbing, diabetes or blood pressure behind it, and nobody has yet explained your reports to you: start with a kidney-care consultation at RIIMS.',
        'Already under a nephrologist and want diet, lifestyle and supervised Ayurvedic support around that treatment: that is the part RIIMS adds, with your nephrologist still in charge.',
        'Very low urine, breathlessness, chest pain or a potassium your lab has flagged: go to a hospital now, not to any outpatient clinic, ours included.',
      ],
    },
    body: [
      ['What a nephrologist does that kidney-care at RIIMS does not', 'Starting and prescribing dialysis, immunosuppression, reading a kidney biopsy, running a transplant workup, and the drug decisions behind an acute kidney injury. Those are MD and DM decisions and they belong with a doctor who holds those degrees. Dr. Abhishek Gupta does not make them, does not offer to stand in for them, and will not ask you to postpone them while you try something else first. If your reports say you need that care, you will hear it from us plainly.'],
      ['What RIIMS does alongside it', 'Dr. Abhishek Gupta reads your whole report set through Kidney Mapping rather than reacting to one creatinine value, then looks for the root cause straining the kidney. From there the work is the part that usually goes unaddressed: what you eat, using the RiiMS Renal Plate matched to your stage and potassium; which nephrotoxins to stop, including the painkillers and protein powders most people forget to mention; sleep, movement within your capacity, and Ayurvedic support given only under qualified supervision. All of it runs alongside your medical treatment, never instead of it, and never as a reason to skip a prescribed medicine.'],
      ['Why we will not call our kidney lead a nephrologist', 'Clinics around Delhi NCR blur this line constantly, and the patient is the one who pays for it. In India, describing a B.A.M.S. practitioner as a nephrologist misrepresents a qualification. It also does real damage, because the patient believes they have finally seen the specialist they needed and quietly stops looking for one. We would rather lose the search result than have you find that out at stage 5. Dr. Abhishek Gupta is an Ayurvedacharya, registration DBCP A/7368, and that is what we will tell you at the desk.'],
    ],
    when: 'If a nephrologist has already started your treatment, keep it and bring us in around it. If your creatinine is rising and no one has explained why, a report review is a sensible first step. RIIMS is in Baraut, Baghpat district, within the NCR region and reached from Delhi, Ghaziabad, Meerut and Baghpat. Video and phone consultations are available if travelling is hard.',
    faqs: [
      ['Is Dr. Abhishek Gupta a nephrologist?', 'No. He is an Ayurvedacharya with a B.A.M.S. degree, and he is the founder and senior kidney-care physician at RIIMS. A nephrologist holds MBBS, MD and then a DM in nephrology. Those are different qualifications and we do not blur them. For nephrology decisions, RIIMS refers you to a qualified nephrologist.'],
      ['Can RIIMS refer me to a nephrologist in Delhi NCR?', 'Yes. RIIMS coordinates with qualified nephrologists and will point you towards one when your reports call for it, whether that is dialysis planning, an acute kidney injury or a transplant workup. Ask at your consultation. If a nephrologist is what your reports call for, that is what we will tell you.'],
      ['Can I see RIIMS and my nephrologist at the same time?', 'That is the arrangement we prefer. Your nephrologist manages your medical treatment and your medicines. RIIMS builds the diet, lifestyle and supervised Ayurvedic support around that, and will not ask you to change or stop anything your nephrologist has prescribed. Bring your prescription to the consultation so the two plans fit together instead of pulling against each other.'],
      ['Will treatment at RIIMS mean I can avoid dialysis?', 'We cannot promise that, and you should be wary of any clinic that does. The decision is made from your whole clinical picture, including symptoms, potassium, fluid status and eGFR, and it sits with a nephrologist. What integrated care can do is protect the function you still have and treat what is straining the kidney. Whether that changes your timeline depends on your stage and your cause, and no honest doctor knows the answer in advance.'],
    ],
    related: [['Dialysis Guidance', 'dialysis'], ['Kidney Failure', 'kidney-failure'], ['Stage 4 CKD', 'stage-4-ckd'], ['Chronic Kidney Disease', 'ckd']],
  },

  'chronic-kidney-disease-hospital-delhi-ncr': {
    dir: '',
    icon: 'building-2',
    h1: 'Chronic Kidney Disease Hospital in Delhi-NCR & Baraut',
    metaTitle: 'Chronic Kidney Disease Hospital in Delhi-NCR & Baraut | RIIMS',
    crumb: 'Kidney Care · CKD Hospital (Delhi-NCR)',
    intro: 'Looking for a CKD hospital near Delhi-NCR? RIIMS in Baraut gives integrated, report-based kidney care that runs alongside your nephrologist\'s treatment.',
    lead: 'CKD is a long illness, and most of it is managed away from a hospital bed: food, blood pressure, sugar, medicines taken on time, and reports read properly. RIIMS is an integrated, Ayurveda-led kidney institute in Baraut, Baghpat district, inside the NCR region and reached by road from Delhi, Ghaziabad, Meerut and Baghpat. Care here is report-based and works alongside your medical treatment, never in place of it. We do not run a dialysis unit or a transplant centre; when those are needed, we coordinate with nephrologists and hospitals that do. Our CKD page explains the disease and its stages. This page is about what the care itself looks like, and whether this is the right place for you.',
    points: {
      title: 'What long-term CKD care at RIIMS involves',
      items: [
        'A first visit built around your actual reports — eGFR read together with urine protein, sugar, BP and haemoglobin, not one number in isolation',
        'A written kidney diet you can cook at home (the RiiMS Renal Plate), sized to your stage rather than copied off the internet',
        'A follow-up schedule on the Kidney Alert System, so a change shows up as a trend instead of a shock',
        'Coordination with your nephrologist, who keeps every medical and dialysis decision',
      ],
    },
    body: [
      ['What a first visit is like', 'Bring every report you have, not only the newest one. The trend across the last six or twelve months tells us far more than a single creatinine value, and families often carry those old papers around in a plastic bag without realising they are the most useful thing in the room. Dr. Abhishek Gupta (B.A.M.S., Ayurvedacharya) and the care team map the full picture, find what is driving it (in most people it is diabetes or blood pressure), and explain the stage in plain Hindi or English. You go home with a diet, a list of things to stop taking without asking, and a date for the next test. Nobody here will tell you your kidney is finished, and nobody will tell you it is nothing.'],
      ['Alongside your nephrologist, not instead of them', 'This is the part patients most often get wrong, sometimes because a previous clinic encouraged them to. Keep taking exactly what your doctor prescribed. Stopping a medicine because you feel better, or because someone on YouTube said kidneys heal without it, is one of the most common ways people lose function they will not get back. Ayurveda at RIIMS is supportive and supervised. It sits next to your medical treatment, we tell your nephrologist what we are giving you, and if the two ever pull in different directions, your nephrologist decides.'],
      ['Coming from Delhi, Ghaziabad or Meerut', 'Baraut is in Baghpat district, within the NCR region, and people drive in from across the belt. Be realistic about the travel before you commit: CKD care is a relationship measured in years, not one dramatic visit. Most people find the first consultation worth doing in person, because reports, questions and family all fit better in one room. After that, a good share of follow-ups run on video or phone, and we would rather you keep the follow-up from home than skip it because the road was long.'],
    ],
    when: 'If your eGFR is falling, urine shows protein, or you have diabetes or BP with abnormal kidney reports, start regular care now rather than after the next bad report. Early-stage CKD is where careful care buys the most time.',
    faqs: [
      ['Is RIIMS a hospital or a clinic?', 'RIIMS is an integrated kidney institute in Baraut. We do consultations, report-based assessment, diet, supervised Ayurveda-led supportive care and structured follow-up. We do not have a dialysis unit or a transplant centre. If you need either, we help you plan it with a nephrologist and a hospital that does.'],
      ['Do I have to stop my allopathic medicines to be treated here?', 'No, and if a clinic tells you to, walk out. Your prescribed medicines continue exactly as written. Care here is added alongside them.'],
      ['Do I need to travel to Baraut every month?', 'Usually not. The first visit is best done in person with all your reports. After that most follow-ups can be done by video or phone, with tests taken at a lab near your home.'],
      ['Is there a Delhi branch?', 'No. RIIMS is in Baraut, Baghpat district. It is inside the NCR region and reached from Delhi, Ghaziabad, Meerut and Baghpat, but it is not a Delhi city clinic and we would rather say so than let you find out on the day.'],
    ],
    related: [['Chronic Kidney Disease', 'ckd'], ['Stage 3 CKD', 'stage-3-ckd'], ['High Creatinine', 'high-creatinine'], ['Diabetic Kidney Disease', 'diabetic-kidney-disease']],
  },

  'best-kidney-failure-hospital-in-delhi-ncr': {
    dir: '',
    icon: 'heart-pulse',
    h1: 'Kidney Failure Hospital in Delhi-NCR & Baraut',
    metaTitle: 'Kidney Failure Hospital in Delhi-NCR & Baraut | RIIMS',
    crumb: 'Kidney Care · Kidney Failure Hospital (Delhi-NCR)',
    // Kept under 155: clampDesc() truncates there, and at 156 this line lost the word
    // "upfront" — the one page where a half-finished honesty claim is worst.
    intro: 'Told that your kidneys have failed? RIIMS in Baraut gives honest, integrated care alongside your nephrologist. We never promise cure, and say so upfront.',
    lead: 'If you are searching this at 2am with a report in your hand, you are probably being offered promises by several places at once. Here is ours: RIIMS never claims that kidney failure can be undone, and any clinic that tells you otherwise is not telling you the truth. RIIMS is an integrated, Ayurveda-led kidney institute in Baraut, Baghpat district, within the NCR region and reached from Delhi, Ghaziabad, Meerut and Baghpat. What we do at this stage is support the work of protecting the function that remains, keep symptoms and daily life bearable, prepare your family before decisions turn urgent, and coordinate closely with nephrologists for dialysis and advanced care. Our kidney failure page explains the condition itself; this page is about whether we are the right people to walk it with you.',
    points: {
      title: 'What RIIMS can honestly do at this stage',
      items: [
        'Support the work of protecting whatever kidney function is left — BP, potassium, anaemia and acid balance managed together with your treating team',
        'Symptom and quality-of-life support: swelling, itching, nausea, appetite, sleep',
        'A renal diet and fluid plan matched to your stage and your dialysis status, not a generic list',
        'Plain answers for the family, and preparation done calmly beforehand rather than in a crisis at midnight',
      ],
    },
    body: [
      ['Why we will not promise you what others do', 'Patients reach us after months spent on assurances that dialysis would be avoided, having paid heavily for them. The dialysis was not avoided. It was only started late, after the potassium had climbed and the breathlessness had set in, and that delay costs something real. So we say it plainly: nobody can guarantee recovery from kidney failure, nobody can undo the damage that is done, and the dialysis decision is not ours to make or unmake. It belongs to your nephrologist, and it rests on your symptoms, potassium, fluid status and whole clinical picture, never on eGFR alone.'],
      ['Then what is the point of coming here at all?', 'Fair question, and one worth asking every clinic you visit. Reaching Stage 5 does not mean dialysis starts that day, and it does not mean nothing is left to manage. There is a lot of room between "cure" and "nothing can be done", and that room is where the actual work sits: the diet that keeps potassium out of danger, the fluid limit that lowers the risk of ending up on oxygen, the anaemia that gets treated so you can climb your own stairs, the itching that lets you sleep, the honest conversation about HD versus PD before someone rushes you into a decision. Many people live active years alongside dialysis. Care at that stage is about how well those years go.'],
      ['Getting here from Delhi-NCR, and when to go elsewhere instead', 'Baraut is a road journey from most of the NCR, and for a person in advanced kidney failure that journey is a real cost in energy. Do not make it during an emergency. Sudden breathlessness at rest, a big fall in urine, persistent vomiting, chest pain or confusion means the nearest hospital with emergency facilities, right now, not a two-hour drive to us. For everything else, come in person once with every report and, if possible, with the family member who makes decisions. Most of the follow-up after that can run on video, which matters when the patient is tired and the trip is long.'],
    ],
    when: 'Very low eGFR with worsening symptoms needs a nephrology consultation promptly, with all your reports. Breathlessness at rest, severe swelling, drowsiness, confusion or a sudden fall in urine needs emergency care immediately, not an appointment.',
    faqs: [
      ['Can kidney failure be reversed?', 'No. Once kidney damage is established it does not undo itself, and anyone offering to reverse kidney failure for a fee is not being honest with you. What can often be influenced is how fast things move from here, and how well you live meanwhile.'],
      ['Will RIIMS help me avoid dialysis?', 'We will not promise that, because it is not a promise anyone can keep. We help you understand your reports and support what your treating team is working to protect, and if you want a second opinion on dialysis timing we will help you get one from a nephrologist. But delaying dialysis out of fear when it is genuinely needed is among the most damaging mistakes we see, and we will tell you so rather than let you drift.'],
      ['My relative is already on dialysis. Is it too late to come?', 'No. Diet, fluids, potassium, nutrition between sessions, anaemia, itching and sleep all still matter, and they are much of what decides how someone feels day to day. Dialysis is support, not the end of the story.'],
      ['Is RIIMS a dialysis or transplant centre?', 'No. RIIMS provides integrated kidney care and coordinates with nephrologists and hospitals for dialysis and the transplant pathway. If you need those services, you need a centre that has them, and we would rather point you there than keep you here.'],
    ],
    related: [['Kidney Failure', 'kidney-failure'], ['Dialysis Guidance', 'dialysis'], ['Stage 4 CKD', 'stage-4-ckd'], ['Kidney Disease Treatment', 'kidney-disease-treatment']],
  },

  'affordable-kidney-treatment-delhi-ncr': {
    dir: '',
    icon: 'badge-check',
    h1: 'Affordable Kidney Treatment in Delhi-NCR & Baraut',
    metaTitle: 'Affordable Kidney Treatment in Delhi-NCR & Baraut | RIIMS',
    crumb: 'Kidney Care · Affordable Kidney Treatment (Delhi-NCR)',
    intro: 'Honest, report-based kidney care near Delhi-NCR, at RIIMS in Baraut. No unnecessary tests, and you can ask what a visit costs before you travel.',
    lead: 'Money is a real part of kidney disease and pretending otherwise helps nobody. CKD is a long illness, and for most families the cost is not one large bill. It is the slow drip: tests repeated, scans repeated, medicines bought month after month for years, a day of work lost for every trip. RIIMS will not tell you it is the cheapest option, and any clinic that quotes you a figure before reading your reports is guessing. What we can do is avoid wasting your money. We test when the result will change the plan, we say so plainly when something is not needed, and we will tell you what a consultation and the advised tests cost if you ask us on the phone before you travel.',
    points: {
      title: 'What affordable means here',
      items: [
        'A test is advised when its result will change something, not to fill a file',
        'No routine scan at every visit. An ultrasound shows structure, and structure rarely changes month to month',
        'Generic-first thinking, and a straight answer when a tonic or supplement is not worth buying',
        'You can ask what the visit and the advised tests cost before you travel, on the phone',
      ],
    },
    body: [
      ['Where the money actually goes', 'Families brace for one big expense and are then worn down by small ones. The consultation is rarely the problem. It is the fourth ultrasound in a year, the panel repeated because the last file was left at home, the supplement nobody explained, and the bus fare and lost wages for each of those visits. Kidney disease is measured in years, so a small monthly waste turns into a large number quietly, in exactly the way the disease itself does.'],
      ['Why report-based care costs less', 'Bring every old report you have, however untidy the pile. Previous reports show the direction your kidney function is moving, and direction is what decisions are made from. Start again from scratch and you pay to rebuild a history you already owned. Read the old file first and much of the work is already done, so what gets repeated is what is genuinely needed to decide the next step.'],
      ['We will also tell you when something is not needed', 'This is the part clinics tend to skip. Not every stone needs a procedure, and many pass with hydration and time. Not every CKD patient develops high potassium, so there is no reason to fearfully give up all fruit and vegetables before anyone has seen your report. Not every tired patient needs an expensive supplement. Being told plainly that you can skip something is worth as much as being sold it.'],
      ['Why there is no price list on this page', 'Because an honest number depends on what you actually turn out to need, and nobody can know that before reading your reports. A package price printed on a website is a guess dressed up as a fact, and a sick family deserves better than that. So we would rather you call, describe your situation, and ask. If the answer to a treatment is that it is not needed, that conversation costs you nothing.'],
    ],
    when: 'If cost is the reason you have been putting off a kidney consultation, call before you decide against it. Bring every old report you have. If you are travelling from Delhi, Ghaziabad, Meerut or Baghpat, ask on the phone what the visit and the advised tests will involve, so the trip is worth making. For some reviews a video or phone consultation is enough and saves the journey.',
    faqs: [
      ['How much does kidney treatment cost at RIIMS?', 'We do not publish a price list, because an honest answer depends on what you need, and that cannot be known before your reports are read. Anyone quoting a figure without them is guessing. Call the clinic, describe your situation, and ask what a consultation and the advised tests will cost before you travel.'],
      ['Is Ayurvedic kidney treatment cheaper than medical treatment?', 'That comparison does not apply, because it is not a choice between the two. Ayurveda and lifestyle care at RIIMS run alongside your medical treatment and never instead of it, so you keep taking what your doctor prescribes. Be cautious of anywhere that offers to replace your prescribed medicines to save you money.'],
      ['Do I have to repeat all my tests if I already have reports?', 'Usually not. Bring everything, including old files and reports from other hospitals. They show the trend your kidney function is following, which is often more useful than a fresh set of numbers with nothing to compare against. We repeat what is needed to make a decision.'],
      ['Is RIIMS in Delhi?', 'No. RIIMS is in Baraut, Baghpat district, Uttar Pradesh, within the NCR region, and patients reach us from Delhi, Ghaziabad, Meerut and Baghpat. It is not a Delhi city clinic. For some visits a phone or video consultation is enough.'],
    ],
    related: [['Kidney disease treatment', 'kidney-disease-treatment'], ['CKD', 'ckd'], ['High Creatinine', 'high-creatinine'], ['Dialysis guidance', 'dialysis']],
  },
};
