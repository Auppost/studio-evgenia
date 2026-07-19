// Пост-сборка (SEO): из dist/index.html генерирует отдельные HTML-страницы
// для каждого раздела и языка (/services/, /et/, /en/gallery/ ...), каждая с
// правильными <title>, description, canonical, hreflang и og:url. Хостинг
// отдаёт их со статусом 200, Google индексирует каждый раздел и каждый язык.
// Также пишет sitemap.xml и 404.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TR, LANGS } from '../src/i18n.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const BASE = 'https://evgenia.ee'
const PAGES = ['home', 'services', 'gallery', 'reviews', 'contacts', 'booking']
const OG_LOCALE = { ru: 'ru_RU', et: 'et_EE', en: 'en_GB' }
const BRAND = { ru: 'Студия Евгении, Таллинн', et: 'Jevgenia stuudio, Tallinn', en: 'Evgenia studio, Tallinn' }

const pathFor = (lang, page) => {
  const pre = lang === 'ru' ? '' : `/${lang}`
  return `${pre}/${page === 'home' ? '' : page + '/'}`
}

const titleFor = (t, lang, page) => {
  if (page === 'home') return t.metaTitle
  const label = t['nav_' + (page === 'booking' ? 'book' : page)]
  return `${label} · ${BRAND[lang]}`
}

const descFor = (t, page) => {
  if (page === 'services') return `${t.cat_depilation}, ${t.cat_electro}, ${t.cat_massage}. ${t.services_note}`
  if (page === 'gallery') return t.gallery_sub
  if (page === 'contacts') return `${t.c_address_l}: ${t.c_address_v}. ${t.c_hours_l}: ${t.c_hours_v}.`
  return t.metaDescription
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const urls = []

for (const lang of LANGS) {
  const t = TR[lang]
  for (const page of PAGES) {
    const path = pathFor(lang, page)
    const url = BASE + path
    const links = [
      `<link rel="canonical" href="${url}" />`,
      ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE + pathFor(l, page)}" />`),
      `<link rel="alternate" hreflang="x-default" href="${BASE + pathFor('ru', page)}" />`,
    ].join('\n  ')

    let html = template
      .replace(/<html lang="[^"]*">/, `<html lang="${t.htmlLang}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(titleFor(t, lang, page))}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(descFor(t, page))}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(titleFor(t, lang, page))}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${OG_LOCALE[lang]}$2`)
      .replace('</head>', `  ${links}\n</head>`)

    const outDir = join(dist, path)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html)
    if (page !== 'booking') urls.push(url) // запись в sitemap не нужна
  }
}

// 404 для случайных адресов: приложение само покажет главную.
writeFileSync(join(dist, '404.html'), readFileSync(join(dist, 'index.html'), 'utf8'))

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}\n</urlset>\n`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`prerender: ${LANGS.length * PAGES.length} страниц, sitemap: ${urls.length} URL`)
