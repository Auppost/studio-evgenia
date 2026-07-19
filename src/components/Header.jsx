import { useState } from 'react'
import { LANGS } from '../i18n.js'
import { pathFor } from '../helpers.js'

export default function Header({ t, lang, setLang, page, go }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ['home', t.nav_home],
    ['services', t.nav_services],
    ['gallery', t.nav_gallery],
    ['reviews', t.nav_reviews],
    ['contacts', t.nav_contacts],
  ]

  // Настоящие <a href> (SEO: индексируемые внутренние ссылки), но переход
  // делаем без перезагрузки страницы.
  const navigate = (e, key) => {
    e.preventDefault()
    setMenuOpen(false)
    go(key)
  }

  const switchLang = (e, code) => {
    e.preventDefault()
    setLang(code)
  }

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>{t.topbar}</span>
          <span>{t.c_phone_v}</span>
        </div>
      </div>

      <header className="header">
        <div className="wrap">
          <a className="logo" href={pathFor(lang, 'home')} onClick={(e) => navigate(e, 'home')}>
            <span className="logo-name">Evgenia</span>
            <span className="logo-tag">{t.brand_tag}</span>
          </a>

          <nav className="nav">
            {links.map(([key, label]) => (
              <a
                key={key}
                className={`nav-link${page === key ? ' active' : ''}`}
                href={pathFor(lang, key)}
                onClick={(e) => navigate(e, key)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="lang-switch">
            {LANGS.map((code) => (
              <a
                key={code}
                className={`lang-btn${code === lang ? ' active' : ''}`}
                href={pathFor(code, page)}
                onClick={(e) => switchLang(e, code)}
              >
                {code.toUpperCase()}
              </a>
            ))}
          </div>

          <a className="btn btn-accent btn-sm header-book" href={pathFor(lang, 'booking')} onClick={(e) => navigate(e, 'booking')}>
            {t.nav_book}
          </a>

          <button
            className="nav-toggle"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {links.map(([key, label]) => (
              <a
                key={key}
                className={`mobile-link${page === key ? ' active' : ''}`}
                href={pathFor(lang, key)}
                onClick={(e) => navigate(e, key)}
              >
                {label}
              </a>
            ))}
            <a className="btn btn-accent mobile-book" href={pathFor(lang, 'booking')} onClick={(e) => navigate(e, 'booking')}>
              {t.nav_book}
            </a>
          </div>
        )}
      </header>
    </>
  )
}
