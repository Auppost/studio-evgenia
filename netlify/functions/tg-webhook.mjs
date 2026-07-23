// Прослойка для Telegram-вебхука бота @Studio_Evgenia_bot.
//
// Telegram требует от вебхука чистый ответ 200, а Google Apps Script на любой
// POST отвечает редиректом 302, из-за чего Telegram бесконечно повторяет
// доставку. Эта функция мгновенно отвечает Телеграму 200 и передаёт
// обновление в скрипт записи (который проверяет chat_id мастера).

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbymgF5cXbwdJ5FwEqYbEJ6gibcNqGiSalymxmnCdYtwpTvvWxyzX5Be3mewimjduTt-/exec'

export default async (req) => {
  if (req.method !== 'POST') return new Response('ok')
  try {
    const body = await req.text()
    // Запрос уходит в Apps Script, но его обработку мы НЕ ждём: Телеграму
    // важно получить 200 мгновенно, иначе при задержке скрипта дольше таймаута
    // функции нажатие теряется и Telegram шлёт повторы. Скрипт, получив
    // запрос, доделывает работу сам, его ответ нам не нужен.
    const forward = fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    }).catch(() => {})
    // Короткая пауза, чтобы запрос гарантированно ушёл в сеть.
    await Promise.race([forward, new Promise((r) => setTimeout(r, 600))])
  } catch {
    // Телеграму всегда отвечаем 200.
  }
  return new Response('ok')
}
