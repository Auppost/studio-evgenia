import { useState, useEffect, useCallback } from 'react'
import { SERVICES, IG_URL, BOOK_TIMES, BOOKING_ENDPOINT } from '../data.js'
import { localizeService, buildDays } from '../helpers.js'

export default function Booking({
  t, lang, booking, setBooking, bName, setBName, bContact, setBContact, bEmail, setBEmail,
}) {
  const { step, service, date, time } = booking
  const days = buildDays(t.loc)
  const allServices = SERVICES.map((s) => ({ raw: s, ...localizeService(s, lang, t) }))

  // Set of taken slot keys "YYYY-MM-DD HH:MM", read from the master's sheet.
  const [taken, setTaken] = useState(() => new Set())
  // Submission state for the confirm step: idle | sending | sent | error | taken
  const [status, setStatus] = useState('idle')
  const emailValid = /\S+@\S+\.\S+/.test(bEmail.trim())
  const canSubmit = bName.trim() && emailValid && status !== 'sending'

  const slotKey = (iso, tm) => `${iso} ${tm}`

  // Pull the list of already-booked slots from the backend.
  const loadSlots = useCallback(async () => {
    if (!BOOKING_ENDPOINT) return new Set()
    try {
      const res = await fetch(`${BOOKING_ENDPOINT}?action=slots`)
      const data = await res.json()
      const set = new Set(Array.isArray(data.taken) ? data.taken : [])
      setTaken(set)
      return set
    } catch {
      return null // couldn't read (e.g. CORS), treat availability as unknown
    }
  }, [])

  useEffect(() => { loadSlots() }, [loadSlots])

  const stepNames = [t.step_service, t.step_date, t.step_time, t.step_confirm]
  const back = () => setBooking((b) => ({ ...b, step: Math.max(1, b.step - 1) }))

  const resetWizard = () => {
    setStatus('idle')
    setBName('')
    setBContact('')
    setBEmail('')
    setBooking({ step: 1, service: null, date: null, time: null })
    loadSlots()
  }

  const submit = async () => {
    if (!canSubmit) return
    // No endpoint configured yet, fall back to Instagram Direct.
    if (!BOOKING_ENDPOINT) {
      window.open(IG_URL, '_blank', 'noopener')
      return
    }
    const key = date ? slotKey(date.iso, time) : ''
    const payload = {
      dateISO: date ? date.iso : '',
      date: date ? date.full : '',
      time: time || '',
      service: service ? service.name : '',
      name: bName.trim(),
      email: bEmail.trim(),
      contact: bContact.trim(),
      lang,
    }
    setStatus('sending')
    try {
      // text/plain keeps this a "simple" request (no CORS preflight the Apps
      // Script web app can't answer); the script parses the JSON body itself.
      const res = await fetch(BOOKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      let data = null
      try { data = await res.json() } catch { /* response not readable */ }

      if (data && data.ok) { setStatus('sent'); return }
      if (data && data.reason === 'taken') { markTakenAndReturn(key); return }
      if (data && data.ok === false) { setStatus('error'); return }

      // Response wasn't readable, verify by re-reading slots: if our slot is
      // now taken, the booking went through; otherwise it's a real error.
      await verifyOrFail(key)
    } catch {
      await verifyOrFail(key)
    }
  }

  // Booking succeeded server-side but we couldn't read the reply, confirm via slots.
  const verifyOrFail = async (key) => {
    const set = await loadSlots()
    if (set && key && set.has(key)) setStatus('sent')
    else setStatus('error')
  }

  const markTakenAndReturn = (key) => {
    setTaken((prev) => new Set(prev).add(key))
    setStatus('taken')
    setBooking((b) => ({ ...b, time: null, step: 3 }))
    loadSlots()
  }

  const times = BOOK_TIMES.map((label) => ({
    label,
    isTaken: date ? taken.has(slotKey(date.iso, label)) : false,
  }))
  const allTaken = times.every((tm) => tm.isTaken)

  return (
    <div className="page booking-page">
      <div className="head">
        <div className="eyebrow">{t.book_eyebrow}</div>
        <h2>{t.book_title}</h2>
      </div>

      {/* stepper */}
      <div className="stepper">
        {stepNames.map((name, i) => {
          const reached = step >= i + 1
          return (
            <div className="step" key={i}>
              <div className={`step-dot${reached ? ' reached' : ''}`}>{i + 1}</div>
              <div className={`step-label${reached ? ' reached' : ''}`}>{name}</div>
            </div>
          )
        })}
      </div>

      {/* STEP 1: service */}
      {step === 1 && (
        <>
          <h3 className="book-h3">{t.book_pick_service}</h3>
          <div className="book-services">
            {allServices.map((s, i) => (
              <button
                key={i}
                className="book-service"
                onClick={() => setBooking((b) => ({ ...b, service: s, step: 2 }))}
              >
                <span>
                  <span className="bs-cat">{s.cat}</span>
                  <span className="bs-name">{s.name}</span>
                  <span className="bs-dur">{s.dur}</span>
                </span>
                <span className="bs-price">{s.price}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 2: date */}
      {step === 2 && (
        <>
          <h3 className="book-h3">{t.book_pick_date}</h3>
          <div className="book-days">
            {days.map((d, i) => (
              <button
                key={i}
                className="book-day"
                onClick={() => setBooking((b) => ({ ...b, date: d, step: 3 }))}
              >
                <span className="wd">{d.wd}</span>
                <span className="dnum">{d.day}</span>
              </button>
            ))}
          </div>
          <div className="book-back-wrap"><button className="back-btn" onClick={back}>{t.book_back}</button></div>
        </>
      )}

      {/* STEP 3: time */}
      {step === 3 && (
        <>
          <h3 className="book-h3">{t.book_pick_time}</h3>
          <p className="book-sub">{date ? date.full : ''}</p>
          {status === 'taken' && <p className="book-err">{t.book_slot_taken}</p>}
          {allTaken ? (
            <p className="book-sub">{t.book_no_times}</p>
          ) : (
            <div className="book-times">
              {times.map((tm) => (
                <button
                  key={tm.label}
                  className={`book-time${tm.isTaken ? ' taken' : ''}`}
                  disabled={tm.isTaken}
                  onClick={() => setBooking((b) => ({ ...b, time: tm.label, step: 4 }))}
                >
                  {tm.label}
                  {tm.isTaken && <span className="taken-label">{t.book_taken_label}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="book-back-wrap"><button className="back-btn" onClick={back}>{t.book_back}</button></div>
        </>
      )}

      {/* STEP 4: confirm */}
      {step === 4 && (
        <div className="confirm">
          <div className="summary">
            <div className="title">{t.book_summary}</div>
            <div className="row"><span className="k">{t.step_service}</span><span>{service ? service.name : ''}</span></div>
            <div className="row"><span className="k">{t.step_date}</span><span>{date ? date.full : ''}</span></div>
            <div className="row"><span className="k">{t.step_time}</span><span>{time || ''}</span></div>
          </div>

          {status === 'sent' ? (
            <>
              <div className="thanks">
                <strong>{t.book_sent_title}.</strong> {t.book_sent}
              </div>
              <a className="send-ig" style={{ marginTop: 18 }} href={IG_URL} target="_blank" rel="noreferrer">{t.book_also_ig}</a>
              <div className="book-back-wrap"><button className="back-btn" onClick={resetWizard}>{t.book_new}</button></div>
            </>
          ) : (
            <>
              <div className="your">{t.book_your}</div>
              <div className="form-fields">
                <input className="field" value={bName} onChange={(e) => setBName(e.target.value)} placeholder={t.form_name} />
                <input className="field" type="email" value={bEmail} onChange={(e) => setBEmail(e.target.value)} placeholder={t.form_email} />
                <input className="field" value={bContact} onChange={(e) => setBContact(e.target.value)} placeholder={t.form_phone_opt} />
              </div>
              <p className="ig-note">{t.book_ig_note}</p>
              {status === 'error' && <p className="book-err">{t.book_error}</p>}
              <button className="send-ig send-btn" onClick={submit} disabled={!canSubmit}>
                {status === 'sending' ? t.book_sending : (BOOKING_ENDPOINT ? t.book_send : t.book_send_ig)}
              </button>
              {!canSubmit && status !== 'sending' && <p className="book-hint">{t.book_required}</p>}
              <div className="book-back-wrap"><button className="back-btn" onClick={back}>{t.book_back}</button></div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
