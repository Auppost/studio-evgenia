import { useEffect, useState } from 'react'
import { TR, LANGS } from './i18n.js'
import { pathFor, parsePath } from './helpers.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './components/Home.jsx'
import Services from './components/Services.jsx'
import Gallery from './components/Gallery.jsx'
import Reviews from './components/Reviews.jsx'
import Contacts from './components/Contacts.jsx'
import Booking from './components/Booking.jsx'
import ConsentBanner from './components/ConsentBanner.jsx'
import { consentChoice, initTracking } from './analytics.js'

// Hero layout: 'A' full-bleed photo, 'B' split column (text + photo panel).
// 'B' fits the studio's portrait photos without cropping the subject.
const HERO_VARIANT = 'B'

export default function App() {
  // Язык и раздел живут в URL (/services/, /et/ ...), состояние стартует из него.
  const initial = parsePath(window.location.pathname)
  const [lang, setLang] = useState(initial.lang)
  const [page, setPage] = useState(initial.page)
  const [aud, setAud] = useState('all')
  const [faqOpen, setFaqOpen] = useState(0)
  const [booking, setBooking] = useState({ step: 1, service: null, date: null, time: null })
  const [bName, setBName] = useState('')
  const [bContact, setBContact] = useState('')
  const [bEmail, setBEmail] = useState('')

  const t = TR[lang]

  // Load analytics if the visitor already accepted cookies.
  useEffect(() => {
    if (consentChoice() === 'yes') initTracking()
  }, [])

  // Навигация назад/вперёд браузера.
  useEffect(() => {
    const onPop = () => {
      const { lang: l, page: p } = parsePath(window.location.pathname)
      setLang(l)
      setPage(p)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Keep <html lang>, title, description, canonical and hreflang in sync (SEO).
  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.title = page === 'home' ? t.metaTitle : `${t['nav_' + (page === 'booking' ? 'book' : page)]} · ${t.metaTitle}`
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', t.metaDescription)
    const setLink = (rel, href, hreflang) => {
      const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
      let el = document.head.querySelector(sel)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        if (hreflang) el.setAttribute('hreflang', hreflang)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
    }
    const base = 'https://evgenia.ee'
    setLink('canonical', base + pathFor(lang, page))
    LANGS.forEach((l) => setLink('alternate', base + pathFor(l, page), l === 'ru' ? 'ru' : l))
    setLink('alternate', base + pathFor('ru', page), 'x-default')
    const og = document.querySelector('meta[property="og:url"]')
    if (og) og.setAttribute('content', base + pathFor(lang, page))
  }, [t, lang, page])

  // Смена раздела/языка меняет и адрес в строке браузера.
  const go = (next) => {
    setPage(next)
    window.history.pushState({}, '', pathFor(lang, next))
    window.scrollTo(0, 0)
  }

  const switchLang = (code) => {
    setLang(code)
    window.history.pushState({}, '', pathFor(code, page))
  }

  const goServicesWithAud = (code) => {
    setAud(code)
    go('services')
  }

  // "Book this" from the services list, preselect and jump to date step.
  const bookService = (s) => {
    setBooking({ step: 2, service: s, date: null, time: null })
    go('booking')
  }

  return (
    <div className="app">
      <Header t={t} lang={lang} setLang={switchLang} page={page} go={go} />

      <main>
        {page === 'home' && (
          <Home
            t={t} lang={lang} go={go}
            goServicesWithAud={goServicesWithAud}
            faqOpen={faqOpen} setFaqOpen={setFaqOpen}
            heroVariant={HERO_VARIANT}
          />
        )}
        {page === 'services' && (
          <Services t={t} lang={lang} aud={aud} setAud={setAud} onBook={bookService} />
        )}
        {page === 'gallery' && <Gallery t={t} />}
        {page === 'reviews' && <Reviews t={t} lang={lang} />}
        {page === 'contacts' && <Contacts t={t} />}
        {page === 'booking' && (
          <Booking
            t={t} lang={lang}
            booking={booking} setBooking={setBooking}
            bName={bName} setBName={setBName}
            bContact={bContact} setBContact={setBContact}
            bEmail={bEmail} setBEmail={setBEmail}
          />
        )}
      </main>

      <Footer t={t} lang={lang} go={go} />
      <ConsentBanner t={t} />
    </div>
  )
}
