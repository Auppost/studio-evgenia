import { SERVICES, REVIEWS, FEATURED } from '../data.js'
import { localizeService } from '../helpers.js'

// Three home-page benefit points, copy varies per language (from the handoff).
const POINTS = {
  ru: [
    { t: 'Результат навсегда', d: 'Электроэпиляция убирает волос навсегда, даже светлый, седой и вросший.' },
    { t: 'Бережно и без боли', d: 'Работаю деликатно, с анестезией и заботой о вашей коже.' },
    { t: 'Только вы и я', d: 'Одна мастерица, одна запись в час, без потока и спешки.' },
  ],
  et: [
    { t: 'Tulemus jäädavalt', d: 'Elektroepilatsioon eemaldab karva jäädavalt, ka heleda, halli ja sissekasvanu.' },
    { t: 'Õrn ja valutu', d: 'Töötan hoolikalt, tuimestuse ja hoolega sinu naha eest.' },
    { t: 'Ainult sina ja mina', d: 'Üks meister, üks broneering tunnis, ilma voo ja kiirustamiseta.' },
  ],
  en: [
    { t: 'Results for good', d: 'Electrolysis removes hair permanently, even light, grey and ingrown.' },
    { t: 'Gentle & painless', d: 'I work carefully, with numbing and care for your skin.' },
    { t: 'Just you and me', d: 'One specialist, one appointment per hour, no crowds, no rush.' },
  ],
}

export default function Home({ t, lang, go, goServicesWithAud, faqOpen, setFaqOpen, heroVariant }) {
  const points = POINTS[lang]
  const process = t.process.map((p, i) => ({ n: `${i + 1 < 10 ? '0' : ''}${i + 1}`, ...p }))
  const featured = FEATURED.map((f) => ({
    ...localizeService(SERVICES[f.index], lang, t),
    img: f.img,
  }))
  const reviews = REVIEWS[lang]

  return (
    <div className="page">
      {/* HERO */}
      {heroVariant === 'A' ? (
        <section className="hero-a">
          <div className="bg">
            <img src="uploads/IMG_3479.jpg" alt={t.hero_eyebrow} />
          </div>
          <div className="overlay" />
          <div className="content">
            <div className="eyebrow">{t.hero_eyebrow}</div>
            <h1>{t.hero_title_a}</h1>
            <p className="sub">{t.hero_sub}</p>
            <div className="actions">
              <button className="btn btn-accent" onClick={() => go('booking')}>{t.hero_cta}</button>
              <button className="btn btn-ghost-light" onClick={() => go('services')}>{t.hero_secondary}</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="hero-b">
          <div className="col-text">
            <div className="eyebrow">{t.hero_eyebrow}</div>
            <h1>{t.hero_title_b}</h1>
            <p className="sub">{t.hero_sub}</p>
            <div className="actions">
              <button className="btn btn-accent" onClick={() => go('booking')}>{t.hero_cta}</button>
              <button className="btn btn-ghost-dark" onClick={() => go('services')}>{t.hero_secondary}</button>
            </div>
          </div>
          <div className="col-img">
            <img src="uploads/IMG_3479.jpg" alt={t.about_title} />
          </div>
        </section>
      )}

      {/* PILLARS, what's offered, at a glance, right under the hero */}
      <section className="pillars-band">
        <div className="inner">
          <div className="eyebrow pillars-eyebrow">{t.pillars_eyebrow}</div>
          <div className="pillars">
            {t.pillars.map((p, i) => (
              <div className="pillar" key={i}>
                <span className="pillar-rule" />
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-top">
          <div className="about-photo">
            <img src="uploads/evgenia.jpg" alt={t.about_title} />
          </div>
          <div className="about-text">
            <div className="eyebrow">{t.about_eyebrow}</div>
            <h2>{t.about_title}</h2>
            <p className="body">{t.about_body}</p>
          </div>
        </div>
        <div className="points">
          {points.map((p, i) => (
            <div className="point" key={i}>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCE SPLIT */}
      <section className="audience">
        <div className="inner">
          <div className="section-head">
            <div className="eyebrow">{t.aud_eyebrow}</div>
            <h2>{t.aud_title}</h2>
          </div>
          <div className="aud-grid">
            <div className="aud-card">
              <div className="photo"><img src="uploads/IMG_3163.jpg" alt={t.aud_w} /></div>
              <div className="body">
                <div className="label">♀ {t.aud_w}</div>
                <p>{t.aud_w_desc}</p>
                <button className="btn-outline" onClick={() => goServicesWithAud('w')}>{t.aud_cta_w}</button>
              </div>
            </div>
            <div className="aud-card">
              <div className="photo"><img src="uploads/IMG_3467.jpg" alt={t.aud_m} /></div>
              <div className="body">
                <div className="label">♂ {t.aud_m}</div>
                <p>{t.aud_m_desc}</p>
                <button className="btn-outline" onClick={() => goServicesWithAud('m')}>{t.aud_cta_m}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process">
        <div className="section-head">
          <div className="eyebrow">{t.process_eyebrow}</div>
          <h2>{t.process_title}</h2>
        </div>
        <div className="process-grid">
          {process.map((p, i) => (
            <div className="process-step" key={i}>
              <div className="process-num">{p.n}</div>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="services-teaser">
        <div className="inner">
          <div className="teaser-head">
            <div>
              <div className="eyebrow">{t.services_eyebrow}</div>
              <h2>{t.services_title}</h2>
            </div>
            <button className="btn-ghost-dark btn" onClick={() => go('services')}>{t.see_all}</button>
          </div>
          <div className="teaser-grid">
            {featured.map((s, i) => (
              <div className="svc-card" key={i}>
                <div className="photo"><img src={s.img} alt={s.name} /></div>
                <div className="body">
                  <div className="cat">{s.cat}</div>
                  <h3>{s.name}</h3>
                  <div className="meta">
                    <span>{s.dur}</span>
                    <span className="price">{s.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS TEASER */}
      <section className="reviews-teaser">
        <div className="section-head">
          <div className="eyebrow">{t.reviews_eyebrow}</div>
          <h2>{t.reviews_title}</h2>
        </div>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="quote">“</div>
              <p>{r.text}</p>
              <div className="name">{r.name}</div>
              <div className="rmeta">{r.meta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="section-head">
          <div className="eyebrow">{t.faq_eyebrow}</div>
          <h2>{t.faq_title}</h2>
        </div>
        <div className="faq-list">
          {t.faqs.map((f, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span>{f.q}</span>
                <span className={`faq-icon${faqOpen === i ? ' open' : ''}`}>+</span>
              </button>
              {faqOpen === i && (
                <div><p className="faq-a">{f.a}</p></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>{t.cta_title}</h2>
        <p>{t.cta_sub}</p>
        <button className="btn" onClick={() => go('booking')}>{t.hero_cta}</button>
      </section>
    </div>
  )
}
