import { IG_URL } from '../data.js'
import { pathFor } from '../helpers.js'

export default function Footer({ t, lang, go }) {
  const link = (key, label) => (
    <a className="foot-link" href={pathFor(lang, key)} onClick={(e) => { e.preventDefault(); go(key) }}>
      {label}
    </a>
  )

  return (
    <footer className="footer">
      <div className="top">
        <div className="brand">
          <div className="name">Evgenia</div>
          <div className="tag">{t.brand_tag} · {t.c_hours_v}</div>
        </div>
        <div className="cols">
          <div className="col">
            {link('services', t.nav_services)}
            {link('gallery', t.nav_gallery)}
            {link('reviews', t.nav_reviews)}
          </div>
          <div className="col">
            {link('contacts', t.nav_contacts)}
            {link('booking', t.nav_book)}
            <a href={IG_URL} target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="bottom">
        <span>© 2026 Evgenia</span>
        <span>{t.demo_note}</span>
      </div>
    </footer>
  )
}
