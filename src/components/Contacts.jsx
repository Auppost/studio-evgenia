import { useState } from 'react'
import { IG_URL, IG_HANDLE } from '../data.js'

export default function Contacts({ t }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)

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
          <div className="contact-photo">
            <img src="uploads/IMG_3181.jpg" alt={t.contacts_title} />
          </div>
        </div>

        <div className="form-card">
          <h3>{t.form_title}</h3>
          <p className="sub">{t.form_sub}</p>
          {sent ? (
            <div className="thanks">{t.form_thanks}</div>
          ) : (
            <form
              className="form-fields"
              onSubmit={(e) => { e.preventDefault(); setSent(true) }}
            >
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.form_name} />
              <input className="field" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t.form_phone} />
              <textarea className="field" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t.form_msg} rows="4" />
              <button className="btn btn-accent" type="submit" style={{ marginTop: 4 }}>{t.form_send}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
