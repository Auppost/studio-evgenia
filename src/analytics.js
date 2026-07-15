import { META_PIXEL_ID, GA_MEASUREMENT_ID } from './data.js'

// Трекинг включается, только если задан хотя бы один ID.
export const trackingConfigured = !!(META_PIXEL_ID || GA_MEASUREMENT_ID)

const KEY = 'cookie_consent'

export function consentChoice() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value) } catch { /* ignore */ }
  if (value === 'yes') initTracking()
}

let started = false

// Грузит пиксель и GA. Вызывается только после согласия на куки.
export function initTracking() {
  if (started) return
  started = true
  initPixel()
  initGA()
}

function initPixel() {
  if (!META_PIXEL_ID || typeof window === 'undefined' || window.fbq) return
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
}

function initGA() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || window.gtag) return
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)
}

// Событие успешной онлайн-записи для Meta и GA.
export function trackBooking() {
  if (typeof window === 'undefined') return
  if (window.fbq) window.fbq('track', 'Schedule')
  if (window.gtag) window.gtag('event', 'generate_lead', { currency: 'EUR' })
}
