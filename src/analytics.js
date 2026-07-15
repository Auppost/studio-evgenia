import { META_PIXEL_ID } from './data.js'

// Загружает Meta Pixel и фиксирует просмотр страницы. No-op, пока META_PIXEL_ID пустой.
export function initPixel() {
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

// Событие успешной онлайн-записи (стандартное событие Meta «Schedule»).
export function trackBooking() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'Schedule')
}
