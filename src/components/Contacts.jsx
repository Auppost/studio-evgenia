import { useState } from 'react'
import { IG_URL, IG_HANDLE, WHATSAPP_NUMBER } from '../data.js'

export default function Contacts({ t }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  // Open WhatsApp with the typed question prefilled to the studio.
  const openWhatsApp = (e) => {
    e.preventDefault()
    const text = name ? `${name}: ${msg}` : msg
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text.trim() || ' ')}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="page contacts-page">
      <div className="head">
        <div className="eyebrow">{t.contacts_eyebrow}</div>
        <h2>{t.contacts_title}</h2>
      </div>
      <div className="contacts-grid">
        <div>
          <div className="contact-rows">
            <div>
              <div className="label">{t.c_address_l}</div>
              <div className="value">{t.c_address_v}</div>
            </div>
            <div>
              <div className="label">{t.c_hours_l}</div>
              <div className="value">{t.c_hours_v}</div>
            </div>
            <div>
              <div className="label">{t.c_phone_l}</div>
              <a className="value" href={`tel:${t.c_phone_v.replace(/\s/g, '')}`}>{t.c_phone_v}</a>
            </div>
            <div>
              <div className="label">Instagram</div>
              <a className="value" href={IG_URL} target="_blank" rel="noreferrer">{IG_HANDLE}</a>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              title="Studio Evgenia — Kadaka tee 44, Tallinn"
              src="https://maps.google.com/maps?q=Kadaka%20tee%2044,%20Tallinn&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="form-card">
          <h3>{t.form_title}</h3>
          <p className="sub">{t.form_sub}</p>
          <form className="form-fields" onSubmit={openWhatsApp}>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.form_name} />
            <textarea className="field" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t.form_msg} rows="4" />
            <button className="btn btn-accent" type="submit" style={{ marginTop: 4 }}>{t.form_wa_btn}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
