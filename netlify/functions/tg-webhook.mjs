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
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    })
  } catch {
    // Телеграму всегда отвечаем 200, иначе он начнёт повторять доставку.
  }
  return new Response('ok')
}
