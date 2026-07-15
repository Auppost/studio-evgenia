import { IG_URL } from '../data.js'

export default function Footer({ t, go }) {
  return (
    <footer className="footer">
      <div className="top">
        <div className="brand">
          <div className="name">Evgenia</div>
          <div className="tag">{t.brand_tag} · {t.c_hours_v}</div>
        </div>
        <div className="cols">
          <div className="col">
            <button className="foot-link" onClick={() => go('services')}>{t.nav_services}</button>
            <button className="foot-link" onClick={() => go('gallery')}>{t.nav_gallery}</button>
            <button className="foot-link" onClick={() => go('reviews')}>{t.nav_reviews}</button>
          </div>
          <div className="col">
            <button className="foot-link" onClick={() => go('contacts')}>{t.nav_contacts}</button>
            <button className="foot-link" onClick={() => go('booking')}>{t.nav_book}</button>
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
