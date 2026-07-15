import { useEffect, useState } from 'react'
import { TR } from './i18n.js'
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
  const [lang, setLang] = useState('ru')
  const [page, setPage] = useState('home')
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

  // Keep <html lang>, title and description in sync with the active language (SEO).
  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.title = t.metaTitle
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', t.metaDescription)
  }, [t])

  const go = (next) => {
    setPage(next)
    window.scrollTo(0, 0)
  }

  const goServicesWithAud = (code) => {
    setAud(code)
    setPage('services')
    window.scrollTo(0, 0)
  }

  // "Book this" from the services list, preselect and jump to date step.
  const bookService = (s) => {
    setBooking({ step: 2, service: s, date: null, time: null })
    setPage('booking')
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <Header t={t} lang={lang} setLang={setLang} page={page} go={go} />

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

      <Footer t={t} go={go} />
      <ConsentBanner t={t} />
    </div>
  )
}
