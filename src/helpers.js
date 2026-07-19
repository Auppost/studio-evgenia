// ── URL routing (SEO: у каждого раздела и языка свой адрес) ──────────────────
// ru живёт в корне (/, /services, ...), et и en с префиксом (/et/, /en/services).
export const ROUTE_PAGES = ['home', 'services', 'gallery', 'reviews', 'contacts', 'booking']

// Адреса в «каталожной» форме со слэшем (/services/, /et/), как их отдаёт
// хостинг для сгенерированных страниц — без лишних редиректов.
export function pathFor(lang, page) {
  const pre = lang === 'ru' ? '' : `/${lang}`
  const seg = page === 'home' ? '' : `${page}/`
  return `${pre}/${seg}`
}

export function parsePath(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  let lang = 'ru'
  let i = 0
  if (parts[0] === 'et' || parts[0] === 'en') { lang = parts[0]; i = 1 }
  const seg = parts[i] || 'home'
  const page = ROUTE_PAGES.includes(seg) ? seg : 'home'
  return { lang, page }
}

// Turn a raw SERVICES entry into localized display fields for the current language.
export function localizeService(s, lang, t) {
  const dur = `${s.min} ${t.unit}`
  const price = s.from ? `${t.price_from} ${s.price} €` : `${s.price} €`
  const cat = s.cat === 'd'
    ? t.cat_depilation.split('(')[0].trim()
    : s.cat === 'e' ? t.cat_electro : t.cat_massage
  const mark = s.aud === 'm' ? '♂' : s.aud === 'w' ? '♀' : ''
  return { name: s[lang], dur, price, cat, mark }
}

// Next 12 upcoming days, localized weekday labels + stable ISO key for slots.
export function buildDays(loc) {
  const arr = []
  const today = new Date()
  for (let i = 1; i <= 12; i++) {
    const dt = new Date(today)
    dt.setDate(today.getDate() + i)
    const wd = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(dt)
    const full = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(dt)
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    arr.push({ wd: wd.replace('.', ''), day: dt.getDate(), full, iso })
  }
  return arr
}
