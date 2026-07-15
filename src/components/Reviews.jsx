import { REVIEWS } from '../data.js'

export default function Reviews({ t, lang }) {
  const reviews = REVIEWS[lang]
  return (
    <div className="page reviews-page">
      <div className="head">
        <div className="eyebrow">{t.reviews_eyebrow}</div>
        <h2>{t.reviews_title}</h2>
      </div>
      <div className="reviews-list">
        {reviews.map((r, i) => (
          <div className="review-full" key={i}>
            <p>“{r.text}”</p>
            <div className="name">{r.name}</div>
            <div className="rmeta">{r.meta}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
