import { useState } from 'react'
import { LANGS } from '../i18n.js'

export default function Header({ t, lang, setLang, page, go }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ['home', t.nav_home],
    ['services', t.nav_services],
    ['gallery', t.nav_gallery],
    ['reviews', t.nav_reviews],
    ['contacts', t.nav_contacts],
  ]

  const navigate = (key) => {
    setMenuOpen(false)
    go(key)
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
          <button className="logo" onClick={() => navigate('home')}>
            <span className="logo-name">Evgenia</span>
            <span className="logo-tag">{t.brand_tag}</span>
          </button>

          <nav className="nav">
            {links.map(([key, label]) => (
              <button
                key={key}
                className={`nav-link${page === key ? ' active' : ''}`}
                onClick={() => navigate(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="lang-switch">
            {LANGS.map((code) => (
              <button
                key={code}
                className={`lang-btn${code === lang ? ' active' : ''}`}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn btn-accent btn-sm header-book" onClick={() => navigate('booking')}>
            {t.nav_book}
          </button>

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
              <button
                key={key}
                className={`mobile-link${page === key ? ' active' : ''}`}
                onClick={() => navigate(key)}
              >
                {label}
              </button>
            ))}
            <button className="btn btn-accent mobile-book" onClick={() => navigate('booking')}>
              {t.nav_book}
            </button>
          </div>
        )}
      </header>
    </>
  )
}
