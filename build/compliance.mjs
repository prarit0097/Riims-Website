/* ============================================================================
   RIIMS compliance guard — blocks banned medical claims before they can be saved.

   India's Drugs & Magic Remedies (Objectionable Advertisements) Act 1954 applies
   expressly to Ayurveda, and a YMYL medical site must never promise a cure. The
   admin panel calls checkPayload() on every content save (see admin/server.mjs);
   a hit is refused with 400 naming the phrase, so an SEO contractor cannot publish
   a cure claim through the panel.

   WHAT IT CANNOT DO — read this before trusting it:
   a denylist only catches claims that USE the banned words. Fluent promises that
   avoid them ("your reports will be normal again", "you will feel completely new")
   sail through, and no word list can fix that. Treat this as a tripwire, not as
   sign-off: an outside contractor's edits to the disease pages still need a human
   to read them. See RIIMS.md §23.

   EXEMPTIONS — honest copy must keep working. A match is allowed only when:
     1. it is negated WITHIN THE SAME SENTENCE, before or after the phrase
        ('No "100% cure" ... promises, ever.' / 'A miracle cure does not exist.')
     2. it sits in a sentence that both ends in "?" AND opens with a question word
        ('Can Ayurvedic herbs cure kidney disease?' — an FAQ heading answered "No.")
   Negation does NOT carry across a sentence boundary, because that let real claims
   through ("We never make false claims. Our treatment is a permanent cure."). The
   cost is that a two-sentence denial ("Many clinics promise a permanent cure. RIIMS
   does not.") is refused — rephrase it as one sentence with a dash and it passes.
   ============================================================================ */

/* NFKC folds fullwidth/ligature forms (１００％ -> 100%); the strip kills zero-width
   and soft-hyphen padding. Both are cheap and stop "1<zwsp>00% cure" evasion. */
const INVISIBLE = /[​-‍⁠﻿­]/g;
export const normalize = (s) => String(s ?? '').normalize('NFKC').replace(INVISIBLE, '');

const HUNDRED = '(?:100|hundred|सौ)\\s*(?:%|٪|percent|pct|प्रतिशत)';
const OUTCOME = '(?:cure|recovery|result|success|relief|ilaa?j|इलाज)';

export const BANNED = [
  { re: new RegExp(`${HUNDRED}[^.?!]{0,20}?${OUTCOME}|${OUTCOME}[^.?!]{0,20}?${HUNDRED}`, 'giu'), label: '100% cure' },
  // "guaranteed cure" and "cure guaranteed" — either order, a couple of words apart
  { re: new RegExp(`guarantee\\w*(?:\\s+\\w+){0,2}\\s+${OUTCOME}|${OUTCOME}(?:\\s+\\w+){0,2}\\s+guarantee\\w*`, 'giu'), label: 'guaranteed cure/recovery' },
  { re: /permanent(ly)?\s+(cure|relief|solution)|cure[ds]?\s+permanently/gi, label: 'permanent cure' },
  { re: /\bstop(s|ped|ping)?\s+(your\s+)?dialysis\b|dialysis\s+band\b/gi, label: 'stop dialysis' },
  { re: /\b(no|never)\s+(more\s+|need\s+for\s+|aur\s+)?dialysis\b/gi, label: 'no more dialysis' },
  { re: /revers(e|es|ed|ing)\s+(kidney|renal|liver|heart)\s+(failure|damage|disease)/gi, label: 'reverse organ damage' },
  { re: /free\s+from\s+[\w\s]{0,20}?(forever|permanently|for\s+life)/gi, label: 'free forever' },
  { re: /(say\s+)?goodbye\s+to\s+(dialysis|medicines?|kidney\s+disease)|dialysis\s+se\s+(mukti|azadi|छुटकारा)/gi, label: 'goodbye to dialysis' },
  // strict: "money back if not cured" carries its own "not", so the negation
  // exemption would swallow the very phrase that makes it an unlawful offer.
  { re: /money[\s-]?back|refund\s+if\s+not\s+(cured|better)/gi, label: 'money-back promise', strict: true },
  { re: /\bmiracle\s+(cure|treatment|remedy|herb)/gi, label: 'miracle cure' },
  { re: /पक्का\s*इलाज|गारंटी\s*(से)?\s*(इलाज|ठीक)|जड़\s*से\s*(खत्म|ठीक)/gu, label: 'guaranteed cure (Hindi)' },
  { re: /(chutkara|छुटकारा)\s*(dila|मिल)?|(thik|theek)\s*ho\s*jay?ega|ilaa?j\s*ki\s*guarantee|guarantee\s*(hai|ke\s*saath)/giu, label: 'guaranteed cure (Hinglish)' },
];

/* True negators only. Bare "claim"/"myth"/"false" are NOT here: they read as
   negation to a regex while a marketer uses them affirmatively ("Our claim: 100%
   cure"), which turned the exemption into a bypass. The second alternation is for
   copy that warns about SOMEONE ELSE's claim — "Be very cautious of any claim of a
   guaranteed cure." is real content on this site and must keep saving. It needs the
   preposition ("claim OF"), so an assertion ("Our claim: 100% cure") still trips. */
const NEG = /\b(no|not|never|none|nothing|nobody|no\s+one|cannot|can\s*not|can'?t|won'?t|don'?t|doesn'?t|didn'?t|isn'?t|aren'?t|without|avoid|beware|nahi|nahin|koi\s+bhi\s+nahi)\b|नहीं|कभी\s*नहीं|\b(cautious|careful|wary|skeptical|suspicious)\s+(of|about)\b|\b(any\s+)?claims?\s+of\b|\bpromises?\s+of\b/i;
const ASKS = /^["'\s(]*(can|could|does|do|did|is|are|was|were|will|would|should|has|have|what|how|why|when|which|who|kya|kaise|kyun)\b/i;

/* Widest sentence we will consider. Bounds the scan so checkText stays linear —
   an unbounded lastIndexOf per match made this quadratic (1MB of "Is it 100%
   cure?" froze the event loop for ~31s, taking the patient booking API with it). */
const MAX_SENTENCE = 400;
const STOPS = '.?!\n';

function sentenceAround(s, index) {
  const from = Math.max(0, index - MAX_SENTENCE);
  let start = from;
  for (let i = index - 1; i >= from; i--) { if (STOPS.includes(s[i])) { start = i + 1; break; } }
  const to = Math.min(s.length, index + MAX_SENTENCE);
  let end = index;
  while (end < to && !STOPS.includes(s[end])) end++;
  return { text: s.slice(start, Math.min(end + 1, s.length)), rel: index - start };
}

/** Negated in its own sentence, or asked as a genuine question? */
function exempt(s, index, len, rule) {
  if (rule.strict) return false;
  const { text, rel } = sentenceAround(s, index);
  if (NEG.test(text.slice(0, rel)) || NEG.test(text.slice(rel + len))) return true;
  const t = text.trim();
  return t.endsWith('?') && ASKS.test(t);
}

/** @returns {{phrase:string,label:string}|null} */
export function checkText(text) {
  const s = normalize(text);
  if (!s) return null;
  for (const rule of BANNED) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(s)) !== null) {
      if (!exempt(s, m.index, m[0].length, rule)) return { phrase: m[0].slice(0, 80), label: rule.label };
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++; // guard against a zero-length match
    }
  }
  return null;
}

/** Walks every string in a section payload. @returns {{phrase,label,path}|null} */
export function checkPayload(value, path = '', depth = 0) {
  if (depth > 24) return null; // content is never this deep; stops a hand-crafted bomb
  if (typeof value === 'string') {
    const hit = checkText(value);
    return hit ? { ...hit, path } : null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = checkPayload(value[i], `${path}[${i}]`, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const hit = checkPayload(value[k], path ? `${path}.${k}` : k, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

/* ---------------- Tracking tab: which <meta>/<link> tags may be pasted ----------
   The tab exists for site-verification tags. The generator already emits the page's
   own description/og/twitter/robots tags, so accepting those here would BOTH ship a
   duplicate (an SEO fault on its own) and hand someone a way to put ad copy in the
   <head> of every page. Refuse them by name; anything else passes through. */
const META_NAME_RE = /\b(?:name|property)\s*=\s*["']?\s*([^"'>\s]+)/i;
const RESERVED_META = /^(description|robots|title|keywords|canonical|og:|twitter:)/i;

/** @returns {string|null} the reserved name, or null when the tag is allowed. */
export function reservedMetaName(line) {
  const m = META_NAME_RE.exec(String(line || ''));
  return m && RESERVED_META.test(m[1]) ? m[1] : null;
}
