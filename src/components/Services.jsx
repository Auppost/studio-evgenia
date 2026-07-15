import { SERVICES } from '../data.js'
import { localizeService } from '../helpers.js'

function ServiceRow({ s, t, onBook }) {
  return (
    <div className="svc-row">
      <div className="info">
        <div>
          <div className="name">{s.name}</div>
          <div className="dur">{s.dur}</div>
        </div>
        {s.mark && <span className="mark">{s.mark}</span>}
      </div>
      <div className="row-price">{s.price}</div>
      <button className="book-this" onClick={onBook}>{t.book_this}</button>
    </div>
  )
}

export default function Services({ t, lang, aud, setAud, onBook }) {
  const inAud = (s) => aud === 'all' || s.aud === 'both' || s.aud === aud
  const withMeta = SERVICES.filter(inAud).map((s) => ({ raw: s, ...localizeService(s, lang, t) }))
  const depilation = withMeta.filter((s) => s.raw.cat === 'd')
  const electro = withMeta.filter((s) => s.raw.cat === 'e')
  const massage = withMeta.filter((s) => s.raw.cat === 'm')

  const tabs = [['all', t.aud_all], ['w', t.aud_w], ['m', t.aud_m]]

  return (
    <div className="page services-page">
      <div className="head">
        <div className="eyebrow">{t.services_eyebrow}</div>
        <h2>{t.services_title}</h2>
        <p className="note">{t.services_note}</p>
      </div>

      <div className="aud-tabs">
        {tabs.map(([code, label]) => (
          <button
            key={code}
            className={`aud-tab${code === aud ? ' active' : ''}`}
            onClick={() => setAud(code)}
          >
            {label}
          </button>
        ))}
      </div>

      {depilation.length > 0 && (
        <>
          <h3 className="cat-title">{t.cat_depilation}</h3>
          <p className="cat-note">{t.depil_note}</p>
          <div className="svc-list">
            {depilation.map((s, i) => (
              <ServiceRow key={i} s={s} t={t} onBook={() => onBook(s)} />
            ))}
          </div>
        </>
      )}

      {electro.length > 0 && (
        <>
          <h3 className="cat-title">{t.cat_electro}</h3>
          <p className="cat-note">{t.electro_note}</p>
          <div className="svc-list">
            {electro.map((s, i) => (
              <ServiceRow key={i} s={s} t={t} onBook={() => onBook(s)} />
            ))}
          </div>
          <details className="contra">
            <summary>{t.contra_title}</summary>
            <div className="contra-body">
              <p className="contra-intro">{t.contra_intro}</p>

              <h4 className="contra-h contra-abs">{t.contra_abs_title}</h4>
              <ul className="contra-list">
                {t.contra_abs.map((x, i) => <li key={i}>{x}</li>)}
              </ul>

              <h4 className="contra-h contra-rel">{t.contra_rel_title}</h4>
              <p className="contra-sub">{t.contra_rel_intro}</p>
              <ul className="contra-list">
                {t.contra_rel.map((x, i) => <li key={i}>{x}</li>)}
              </ul>

              <h4 className="contra-h contra-rec">{t.contra_rec_title}</h4>
              <ul className="contra-list">
                {t.contra_rec.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          </details>
        </>
      )}

      {massage.length > 0 && (
        <>
          <div className="massage-head">
            <div className="kicker">{t.massage_extra}</div>
            <h3>{t.cat_massage}</h3>
          </div>
          <p className="cat-note">{t.massage_note}</p>
          <div className="svc-list">
            {massage.map((s, i) => (
              <ServiceRow key={i} s={s} t={t} onBook={() => onBook(s)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
