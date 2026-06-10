/* RIIMS static-site generator — low-level UI primitives.
   Each function returns an HTML string. Inline styles are ported verbatim
   from the original React design (ui_kits/website) via the s() serializer,
   so the rendered output matches the prototype pixel-for-pixel. Hover,
   focus, responsive and background-image rules live in css/site.css. */

const UNITLESS = new Set([
  'fontWeight', 'lineHeight', 'opacity', 'zIndex', 'order',
  'flex', 'flexGrow', 'flexShrink', 'strokeWidth', 'zoom',
]);

/* Serialize a React-style style object into a CSS declaration string. */
export function s(obj = {}) {
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === false) continue;
    const prop = k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    const val = (typeof v === 'number' && !UNITLESS.has(k) && v !== 0) ? `${v}px` : v;
    out += `${prop}:${val};`;
  }
  return out;
}

/* Merge a style object with an optional extra CSS string. */
function st(obj, extra) {
  const base = s(obj);
  return extra ? base + extra : base;
}

export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Build a serialized attribute list from an object. */
function attrs(obj = {}) {
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === false) continue;
    if (v === true) { out += ` ${k}`; continue; }
    out += ` ${k}="${esc(v)}"`;
  }
  return out;
}

/* ---------------- Icons ---------------- */
/* Lucide icons render from <i data-lucide>; site.js calls createIcons().
   Facebook/Instagram are not in current Lucide, so they are inline SVG
   (matching kit.jsx). Stars are inline SVG so the gold fill is reliable. */
export function icon(n, { size = 18, style = '' } = {}) {
  if (n === 'facebook') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" style="${style}" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.46-.13-2.43 0-4.1 1.49-4.1 4.21V9.9H7.7V13h2.74v8h3.06z"/></svg>`;
  }
  if (n === 'instagram') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${style}" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>`;
  }
  return `<i data-lucide="${n}" aria-hidden="true" style="width:${size}px;height:${size}px;${style}"></i>`;
}

export function star(filled, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? '#e8a317' : 'none'}" stroke="#e8a317" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}

export function starRow(rating = 5, size = 18, extra = '') {
  let out = `<span style="display:inline-flex;gap:.15rem;${extra}">`;
  for (let i = 0; i < 5; i++) out += star(i < rating, size);
  return out + '</span>';
}

/* ---------------- Brand mark / logo ---------------- */
export function logo(base = '', { light = false, size = 54 } = {}) {
  const markStyle = st({
    height: size, width: size, display: 'block',
    borderRadius: light ? 12 : 0,
    backgroundColor: light ? '#fff' : 'transparent',
    padding: light ? 5 : 0,
    boxShadow: light ? 'var(--shadow-sm)' : 'none',
  });
  return `<a href="${base}index.html" aria-label="RIIMS — Rashtriya Institute of Integrated Medical Sciences" style="display:inline-flex;align-items:center;text-decoration:none">`
    + `<span class="riims-logo-mark" role="img" aria-label="RIIMS — Rashtriya Institute of Integrated Medical Sciences" style="${markStyle}"></span></a>`;
}

/* ---------------- Button ---------------- */
const BTN_SIZES = {
  sm: { fontSize: '.875rem', padding: '.5rem .9rem', minHeight: 38 },
  md: { fontSize: '1rem', padding: '.72rem 1.3rem', minHeight: 46 },
  lg: { fontSize: '1.0625rem', padding: '.95rem 1.7rem', minHeight: 54 },
};
const BTN_VARIANTS = {
  primary: { background: 'var(--brand-primary)', color: '#fff', boxShadow: 'var(--shadow-brand)' },
  secondary: { background: 'var(--brand-secondary)', color: '#fff', boxShadow: 'var(--shadow-green)' },
  whatsapp: { background: 'var(--whatsapp)', color: '#06351c', boxShadow: '0 10px 24px rgba(37,211,102,.28)' },
  outline: { background: 'var(--white)', color: 'var(--text-brand)', border: '1.5px solid var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text-brand)' },
  white: { background: '#fff', color: 'var(--text-brand)', boxShadow: 'var(--shadow-md)' },
};

export function button(children, opts = {}) {
  const {
    variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth,
    href, style = {}, type, extraAttrs = {},
  } = opts;
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : 'auto',
    alignItems: 'center', justifyContent: 'center', gap: '.5rem',
    fontFamily: 'var(--font-sans)', fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap',
    borderRadius: 'var(--radius-pill)', border: '1px solid transparent', cursor: 'pointer',
    textDecoration: 'none', transition: 'transform .14s var(--ease-out), box-shadow .22s, background .22s',
    ...BTN_SIZES[size], ...BTN_VARIANTS[variant], ...style,
  };
  const tag = href ? 'a' : 'button';
  const a = { class: `riims-btn riims-btn--${variant}`, style: s(base), ...extraAttrs };
  if (href) a.href = href; else a.type = type || 'button';
  const inner = (iconLeft ? `<span style="display:inline-flex">${iconLeft}</span>` : '')
    + (children ? `<span>${children}</span>` : '')
    + (iconRight ? `<span style="display:inline-flex">${iconRight}</span>` : '');
  return `<${tag}${attrs(a)}>${inner}</${tag}>`;
}

/* ---------------- IconButton ---------------- */
const IB_VARIANTS = {
  solid: { background: 'var(--brand-primary)', color: '#fff' },
  soft: { background: 'var(--surface-blue-soft)', color: 'var(--text-brand)' },
  whatsapp: { background: 'var(--whatsapp)', color: '#06351c' },
  outline: { background: 'var(--white)', color: 'var(--text-brand)', border: '1.5px solid var(--border-default)' },
  ghost: { background: 'rgba(255,255,255,.12)', color: '#fff' },
  ghostdark: { background: 'transparent', color: 'var(--icon-default)' },
};
export function iconButton(ic, opts = {}) {
  const { label, variant = 'soft', size = 'md', shape = 'circle', href, style = {}, extraAttrs = {} } = opts;
  const dim = { sm: 34, md: 42, lg: 48 }[size];
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
    width: dim, height: dim, borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
    border: '1px solid transparent', cursor: 'pointer', textDecoration: 'none',
    transition: 'transform .14s var(--ease-out), background .2s', ...IB_VARIANTS[variant], ...style,
  };
  const tag = href ? 'a' : 'button';
  const a = { 'aria-label': label, title: label, style: s(base), ...extraAttrs };
  if (href) a.href = href; else a.type = 'button';
  return `<${tag}${attrs(a)}>${ic}</${tag}>`;
}

/* ---------------- Badge ---------------- */
const BADGE_TONES = {
  blueSoft: { bg: 'var(--surface-blue-soft)', fg: 'var(--text-brand)' },
  blueSolid: { bg: 'var(--brand-primary)', fg: '#fff' },
  greenSoft: { bg: 'var(--surface-green-soft)', fg: 'var(--text-accent)' },
  greenSolid: { bg: 'var(--brand-secondary)', fg: '#fff' },
  cream: { bg: 'var(--surface-cream-deep)', fg: 'var(--text-on-cream)' },
  neutral: { bg: 'var(--neutral-100)', fg: 'var(--neutral-700)' },
  warning: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
};
export function badge(children, { tone = 'blue', soft = true, icon: ic, style = {} } = {}) {
  let key;
  if (tone === 'blue') key = soft ? 'blueSoft' : 'blueSolid';
  else if (tone === 'green') key = soft ? 'greenSoft' : 'greenSolid';
  else key = BADGE_TONES[tone] ? tone : 'blueSoft';
  const t = BADGE_TONES[key];
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '.34rem', background: t.bg, color: t.fg,
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-sm)', lineHeight: 1,
    padding: '.38rem .7rem', borderRadius: 'var(--radius-pill)', ...style,
  };
  return `<span style="${s(base)}">${ic ? `<span style="display:inline-flex">${ic}</span>` : ''}${children}</span>`;
}

/* ---------------- Card ---------------- */
const CARD_PADS = { none: 0, sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-6)', xl: 'var(--space-8)' };
const CARD_TONES = {
  plain: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' },
  cream: { background: 'var(--surface-cream)', border: '1px solid var(--cream-200)' },
  blue: { background: 'var(--surface-blue-soft)', border: '1px solid var(--border-brand)' },
  green: { background: 'var(--surface-green-soft)', border: '1px solid var(--green-100)' },
  inverse: { background: 'var(--surface-inverse)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.86)' },
};
export function card(children, { tone = 'plain', pad = 'lg', hover, accent, style = {}, className = '' } = {}) {
  const base = {
    position: 'relative', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
    padding: CARD_PADS[pad], overflow: 'hidden', ...CARD_TONES[tone], ...style,
  };
  const cls = `riims-card${hover ? ' riims-card--hover' : ''}${className ? ' ' + className : ''}`;
  const accentBar = accent
    ? `<span style="position:absolute;inset-inline:0;top:0;height:4px;background:linear-gradient(90deg,var(--brand-primary),var(--brand-secondary))"></span>`
    : '';
  return `<div class="${cls}" style="${s(base)}">${accentBar}${children}</div>`;
}

/* ---------------- Eyebrow + SectionHead ---------------- */
export function eyebrow(children, { onDark = false } = {}) {
  const base = {
    margin: '0 0 .7rem', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 700,
    letterSpacing: '.08em', textTransform: 'uppercase', color: onDark ? 'var(--green-300)' : 'var(--text-accent)',
    display: 'inline-flex', alignItems: 'center', gap: '.5rem',
  };
  return `<p style="${s(base)}">${children}</p>`;
}

export function sectionHead({ eyebrow: eb, title, intro, align = 'center', onDark = false } = {}) {
  const wrap = {
    textAlign: align, maxWidth: align === 'center' ? 620 : 'none',
    margin: align === 'center' ? '0 auto' : 0, marginBottom: 'var(--space-10)',
  };
  return `<div style="${s(wrap)}">`
    + (eb ? eyebrow(eb, { onDark }) : '')
    + `<h2 style="font-size:var(--fs-3xl);margin:0;color:${onDark ? '#fff' : 'var(--text-strong)'}">${title}</h2>`
    + (intro ? `<p style="margin:.8rem 0 0;font-size:var(--fs-lg);color:${onDark ? 'rgba(255,255,255,.8)' : 'var(--text-muted)'}">${intro}</p>` : '')
    + '</div>';
}

/* ---------------- Form fields ---------------- */
function field({ label, required, hint, error, control }) {
  const lbl = label
    ? `<label style="font-family:var(--font-sans);font-weight:600;font-size:var(--fs-sm);color:var(--text-strong)">${label}${required ? '<span style="color:var(--danger)"> *</span>' : ''}</label>`
    : '';
  const note = error
    ? `<span style="font-size:var(--fs-sm);color:var(--danger)">${error}</span>`
    : hint ? `<span style="font-size:var(--fs-sm);color:var(--text-muted)">${hint}</span>` : '';
  return `<div style="display:flex;flex-direction:column;gap:.34rem">${lbl}${control}${note}</div>`;
}

const INPUT_CSS = 'width:100%;font-family:var(--font-sans);font-size:var(--fs-md);color:var(--text-strong);background:var(--white);border:1.5px solid var(--border-default);border-radius:var(--radius-md);padding:.72rem .95rem;min-height:48px;outline:none;';

export function input({ label, required, hint, icon: ic, type = 'text', name, placeholder } = {}) {
  const control = `<div style="position:relative;display:flex;align-items:center">`
    + (ic ? `<span style="position:absolute;left:.85rem;color:var(--icon-default);pointer-events:none;display:inline-flex">${ic}</span>` : '')
    + `<input class="riims-input" type="${type}"${name ? ` name="${name}"` : ''}${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}${required ? ' required' : ''} style="${INPUT_CSS}padding-left:${ic ? '2.5rem' : '.95rem'}">`
    + `</div>`;
  return field({ label, required, hint, control });
}

export function select({ label, required, hint, icon: ic, options = [], placeholder = 'Select…', name } = {}) {
  const opts = `<option value="" disabled selected>${esc(placeholder)}</option>`
    + options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  const control = `<div style="position:relative;display:flex;align-items:center">`
    + (ic ? `<span style="position:absolute;left:.85rem;color:var(--icon-default);pointer-events:none;display:inline-flex">${ic}</span>` : '')
    + `<select class="riims-input riims-select"${name ? ` name="${name}"` : ''} style="${INPUT_CSS}appearance:none;cursor:pointer;color:var(--text-faint);padding-left:${ic ? '2.5rem' : '.95rem'};padding-right:2.4rem">${opts}</select>`
    + `<span style="position:absolute;right:.95rem;pointer-events:none;color:var(--icon-default);display:inline-flex">${icon('chevron-down')}</span>`
    + `</div>`;
  return field({ label, required, hint, control });
}

export function checkbox({ label, name, checked = true } = {}) {
  return `<label class="riims-check" style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;font-family:var(--font-sans);font-size:var(--fs-sm);color:var(--text-body)">`
    + `<input type="checkbox"${name ? ` name="${name}"` : ''}${checked ? ' checked' : ''} class="riims-check-input">`
    + `<span class="riims-check-box" aria-hidden="true">${icon('check', { size: 13, style: 'color:#fff;stroke-width:3' })}</span>`
    + `<span>${label}</span></label>`;
}

/* ---------------- Misc ---------------- */
export function infoList(items, { icon: ic = 'check', color = 'var(--icon-accent)' } = {}) {
  const lis = items.map((t) =>
    `<li style="display:flex;gap:.7rem;align-items:flex-start;font-size:var(--fs-md);color:var(--text-body)">`
    + `${icon(ic, { size: 20, style: `flex:0 0 auto;margin-top:2px;color:${color}` })} <span>${t}</span></li>`
  ).join('');
  return `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.8rem">${lis}</ul>`;
}

export function disclaimer({ onDark = false } = {}) {
  const base = {
    display: 'flex', gap: '.7rem', alignItems: 'flex-start',
    background: onDark ? 'rgba(255,255,255,.06)' : 'var(--warning-soft)',
    border: `1px solid ${onDark ? 'rgba(255,255,255,.12)' : 'rgba(201,138,20,.3)'}`,
    borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)',
    color: onDark ? 'rgba(255,255,255,.8)' : 'var(--neutral-700)',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--leading-relaxed)',
  };
  return `<div style="${s(base)}">`
    + icon('info', { size: 18, style: `flex:0 0 auto;margin-top:2px;color:${onDark ? 'var(--green-300)' : 'var(--warning)'}` })
    + `<span><strong style="color:${onDark ? '#fff' : 'var(--neutral-800)'}">Medical disclaimer:</strong> Information on this site is for awareness only and does not replace medical consultation. Treatment depends on doctor evaluation and patient reports. RIIMS does not promise guaranteed cure or recovery.</span></div>`;
}
