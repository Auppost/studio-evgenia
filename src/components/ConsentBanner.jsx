import { useState } from 'react'
import { trackingConfigured, consentChoice, setConsent } from '../analytics.js'

// Показывается один раз, только если настроен трекинг (пиксель/GA) и выбор ещё не сделан.
export default function ConsentBanner({ t }) {
  const [choice, setChoice] = useState(() => consentChoice())
  if (!trackingConfigured || choice) return null

  const decide = (value) => { setConsent(value); setChoice(value) }

  return (
    <div className="consent">
      <span className="consent-text">{t.consent_text}</span>
      <div className="consent-btns">
        <button className="btn btn-accent btn-sm" onClick={() => decide('yes')}>{t.consent_accept}</button>
        <button className="consent-decline" onClick={() => decide('no')}>{t.consent_decline}</button>
      </div>
    </div>
  )
}
