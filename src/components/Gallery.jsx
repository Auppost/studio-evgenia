import { GALLERY } from '../data.js'

export default function Gallery({ t }) {
  return (
    <div className="page gallery-page">
      <div className="head">
        <div className="eyebrow">{t.gallery_eyebrow}</div>
        <h2>{t.gallery_title}</h2>
        <p className="sub">{t.gallery_sub}</p>
      </div>
      <div className="gallery-grid">
        {GALLERY.map((g, i) => (
          <div className={`cell${g.tall ? ' tall' : ''}`} key={i}>
            <img src={g.src} alt={t.gallery_title} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
