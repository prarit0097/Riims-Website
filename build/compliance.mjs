/* ============================================================================
   RIIMS compliance guard — blocks banned medical claims before they can be saved.

   India's Drugs & Magic Remedies (Objectionable Advertisements) Act 1954 applies
   expressly to Ayurveda, and a YMYL medical site must never promise a cure. The
   admin panel calls checkPayload() on every content save (see admin/server.mjs);
   a hit is refused with 400 and the offending phrase.

   Honest copy that NAMES a false claim in order to deny it is legitimate and must
   keep passing — the site says things like: No "100% cure" or "stop dialysis"
   promises, ever. And FAQ headings ask the question patients actually type ("Can
   Ayurvedic herbs cure kidney disease?") before answering it honestly. So a match
   is allowed when it is negated, quoted, or sits inside a question. This is a
   guard rail, not a lawyer: it catches the careless claim, not a determined author.
   ============================================================================ */

export const BANNED = [
  { re: /100\s*%\s*(cure|ilaa?j|इलाज|guarantee|recovery|result)/giu, label: '100% cure' },
  { re: /guaranteed?\s+(cure|recovery|result|ilaa?j)/gi, label: 'guaranteed cure/recovery' },
  { re: /permanent(ly)?\s+cure/gi, label: 'permanent cure' },
  { re: /cure[ds]?\s+permanently/gi, label: 'cured permanently' },
  { re: /\bstop(s|ped|ping)?\s+(your\s+)?dialysis\b/gi, label: 'stop dialysis' },
  { re: /dialysis\s+band\b/gi, label: 'dialysis band (Hindi)' },
  { re: /revers(e|es|ed|ing)\s+(kidney|renal|liver)\s+(failure|damage)/gi, label: 'reverse organ failure' },
  { re: /पक्का\s*इलाज/gu, label: 'pakka ilaj' },
  { re: /गारंटी\s*(से)?\s*(इलाज|ठीक)/gu, label: 'guarantee ilaj (Hindi)' },
  { re: /\bmiracle\s+(cure|treatment|remedy)/gi, label: 'miracle cure' },
];

const NEG = /\b(no|not|never|don'?t|does\s+not|do\s+not|cannot|can\s*not|without|avoid|nahi|nahin|kabhi\s+nahi|koi|beware|myth|false|claim(s|ing)?)\b|नहीं|कभी\s*नहीं/i;
const NEG_WINDOW = 90;
const QUOTES = /["'“”‘’„]/;

/** The sentence the match sits in, so a question can be told from a claim. */
function sentenceAround(s, index) {
  const before = Math.max(s.lastIndexOf('.', index), s.lastIndexOf('?', index), s.lastIndexOf('!', index), s.lastIndexOf('\n', index));
  let end = index;
  while (end < s.length && !'.?!\n'.includes(s[end])) end++;
  return s.slice(before + 1, end + 1).trim();
}

/** Is this match negated, quoted, or asked as a question (i.e. legitimate copy)? */
function exempt(s, index, len) {
  const before = s.slice(Math.max(0, index - NEG_WINDOW), index);
  if (NEG.test(before)) return true;
  if (QUOTES.test(s[index - 1] || '') && QUOTES.test(s[index + len] || '')) return true;
  return sentenceAround(s, index).endsWith('?');
}

/** @returns {{phrase:string,label:string}|null} */
export function checkText(text) {
  const s = String(text ?? '');
  for (const rule of BANNED) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(s)) !== null) {
      if (!exempt(s, m.index, m[0].length)) return { phrase: m[0], label: rule.label };
    }
  }
  return null;
}

/** Walks every string in a section payload. @returns {{phrase,label,path}|null} */
export function checkPayload(value, path = '') {
  if (typeof value === 'string') {
    const hit = checkText(value);
    return hit ? { ...hit, path } : null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = checkPayload(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const hit = checkPayload(value[k], path ? `${path}.${k}` : k);
      if (hit) return hit;
    }
  }
  return null;
}
