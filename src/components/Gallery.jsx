import { useState } from 'react'
import { GALLERY } from '../data.js'

const CAT_LABEL = {
  depil: 'gallery_cat_depil',
  electro: 'gallery_cat_electro',
  massage: 'gallery_cat_massage',
}

export default function Gallery({ t }) {
  // Hide photos whose file is not present yet, so a group with no available
  // photo simply does not render (no broken images, no empty heading).
  const [failed, setFailed] = useState({})

  return (
    <div className="page gallery-page">
      <div className="head">
        <div className="eyebrow">{t.gallery_eyebrow}</div>
        <h2>{t.gallery_title}</h2>
        <p className="sub">{t.gallery_sub}</p>
      </div>
      {GALLERY.map((group) => {
        const photos = group.photos.filter((src) => !failed[src])
        if (photos.length === 0) return null
        return (
          <section className="gallery-group" key={group.key}>
            <h3 className="gallery-group-title">{t[CAT_LABEL[group.key]]}</h3>
            <div className="gallery-grid">
              {photos.map((src) => (
                <div className="cell" key={src}>
                  <img
                    src={src}
                    alt={t[CAT_LABEL[group.key]]}
                    loading="lazy"
                    onError={() => setFailed((f) => ({ ...f, [src]: true }))}
                  />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
