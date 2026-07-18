/**
 * Studio Evgenia, онлайн-запись с занятостью слотов + письмо-подтверждение клиенту.
 *
 * • doGet(?action=slots) → занятые слоты "YYYY-MM-DD HH:MM" (для «занято» на сайте).
 * • doPost → бронирует слот (LockService, без двойной брони) и шлёт КЛИЕНТУ письмо на email.
 * • Мастер видит все заявки в таблице. Статус «Отменена» освобождает слот.
 *
 * После правок этого файла: Развернуть → Управление развёртываниями → карандаш → Новая версия.
 */

// ── Данные студии (идут в письмо клиенту) ─────────────────────────────────────
var STUDIO_NAME = 'Evgenia'
var STUDIO_ADDRESS = 'Kadaka tee 44, каб. 23, Mustamäe, Таллинн'
var STUDIO_PHONE = '+372 5573 981'

// ── Уведомления мастеру (необязательны; '' = выключено) ───────────────────────
var NOTIFY_EMAIL = ''
var TELEGRAM_BOT_TOKEN = ''
var TELEGRAM_CHAT_ID = ''

// ── Настройки таблицы ─────────────────────────────────────────────────────────
var TIMEZONE = 'Europe/Tallinn'
var HEADERS = ['Получено', 'Дата', 'Время', 'Услуга', 'Имя', 'Email', 'Контакт', 'Язык', 'Статус']
var CANCELLED = 'Отменена'
var STATUSES = ['Новая', 'Подтверждена', 'Выполнена', 'Отменена', 'Блок']

// ── Telegram-бот мастера ──────────────────────────────────────────────────────
// Публичный URL этого веб-приложения (нужен для setWebhook, не меняется при новых версиях).
var WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbymgF5cXbwdJ5FwEqYbEJ6gibcNqGiSalymxmnCdYtwpTvvWxyzX5Be3mewimjduTt-/exec'
// Часы, которые бот предлагает при ручной блокировке (как на сайте).
var BOT_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
var BLOCK_NAME = 'Блокировка мастера'
var RU_DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
// Индексы колонок (0-based) под порядок HEADERS
var COL_DATE = 1, COL_TIME = 2, COL_STATUS = 8

// ── Точки входа ───────────────────────────────────────────────────────────────

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'slots') {
    return json_({ ok: true, taken: takenSlots_() })
  }
  return json_({ ok: true, service: 'studio-evgenia booking endpoint' })
}

function doPost(e) {
  // Telegram-вебхук приходит на этот же адрес; у его запросов есть update_id.
  var probe = {}
  try { if (e && e.postData && e.postData.contents) probe = JSON.parse(e.postData.contents) } catch (err) { return json_({ ok: false, reason: 'error' }) }
  if (probe.update_id) return handleTg_(probe)

  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(15000)
  } catch (err) {
    return json_({ ok: false, reason: 'busy' })
  }
  try {
    var data = probe

    if (!data.dateISO || !data.time || !data.name || !data.email) {
      return json_({ ok: false, reason: 'invalid' })
    }

    // Валидация: строгий формат даты/времени, разумные длины, email похож на email.
    // Защита от мусорных броней, спама через письма и захвата всех слотов скриптом.
    data.dateISO = clip_(data.dateISO, 10)
    data.time = clip_(data.time, 5)
    data.name = clip_(data.name, 80)
    data.email = clip_(data.email, 120)
    data.contact = clip_(data.contact, 120)
    data.service = clip_(data.service, 90)
    data.date = clip_(data.date, 60)
    data.lang = clip_(data.lang, 5)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateISO)) return json_({ ok: false, reason: 'invalid' })
    if (!/^\d{2}:\d{2}$/.test(data.time)) return json_({ ok: false, reason: 'invalid' })
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return json_({ ok: false, reason: 'invalid' })
    // Дата: не в прошлом и не дальше 60 дней вперёд.
    var today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd')
    var maxD = Utilities.formatDate(new Date(Date.now() + 60 * 864e5), TIMEZONE, 'yyyy-MM-dd')
    if (data.dateISO < today || data.dateISO > maxD) return json_({ ok: false, reason: 'invalid' })

    var sheet = getSheet_()
    ensureHeaders_(sheet)

    // Конфликт: слот уже занят (кроме отменённых)?
    var rows = sheet.getDataRange().getValues()
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][COL_STATUS]) === CANCELLED) continue
      if (rowDateISO_(rows[i][COL_DATE]) === data.dateISO && rowTime_(rows[i][COL_TIME]) === data.time) {
        return json_({ ok: false, reason: 'taken' })
      }
    }

    var now = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm')
    sheet.appendRow([now, data.dateISO, data.time, cell_(data.service), cell_(data.name), cell_(data.email), cell_(data.contact), cell_(data.lang), 'Новая'])

    notifyClient_(data)   // письмо клиенту
    notifyEmail_(data)    // письмо мастеру (если включено)
    notifyTelegram_(data) // Telegram мастеру (если включено)

    return json_({ ok: true })
  } catch (err) {
    console.error('doPost failed: ' + err)
    return json_({ ok: false, reason: 'error' })
  } finally {
    lock.releaseLock()
  }
}

// ── Слоты ─────────────────────────────────────────────────────────────────────

function takenSlots_() {
  var sheet = getSheet_()
  if (sheet.getLastRow() < 2) return []
  var rows = sheet.getDataRange().getValues()
  var out = []
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][COL_STATUS]) === CANCELLED) continue
    var d = rowDateISO_(rows[i][COL_DATE])
    var tm = rowTime_(rows[i][COL_TIME])
    if (d && tm) out.push(d + ' ' + tm)
  }
  return out
}

// ── Письмо клиенту (подтверждение записи) ─────────────────────────────────────

function notifyClient_(data) {
  if (!data.email) return
  var when = data.date || data.dateISO
  var msg = clientMessage_(data.lang, data, when)
  try {
    MailApp.sendEmail({ to: data.email, subject: msg.subject, body: msg.body, name: STUDIO_NAME })
  } catch (err) { console.error('client email failed: ' + err) }
}

function clientMessage_(lang, data, when) {
  var s = data.service || ''
  if (lang === 'et') {
    return {
      subject: 'Sinu broneering, ' + s + ', ' + when + ' ' + data.time,
      body: 'Tere, ' + data.name + '!\n\n' +
        'Aitäh broneeringu eest Evgenia stuudios. Sinu andmed:\n\n' +
        'Teenus: ' + s + '\nKuupäev: ' + when + '\nKellaaeg: ' + data.time + '\nAadress: ' + STUDIO_ADDRESS + '\n\n' +
        'Kui plaanid muutuvad, kirjuta või helista: ' + STUDIO_PHONE + '.\n\nKohtumiseni!\nJevgenia',
    }
  }
  if (lang === 'en') {
    return {
      subject: 'Your booking, ' + s + ', ' + when + ' ' + data.time,
      body: 'Hello ' + data.name + '!\n\n' +
        'Thank you for booking at Evgenia studio. Your details:\n\n' +
        'Service: ' + s + '\nDate: ' + when + '\nTime: ' + data.time + '\nAddress: ' + STUDIO_ADDRESS + '\n\n' +
        'If your plans change, write or call: ' + STUDIO_PHONE + '.\n\nSee you soon!\nEvgenia',
    }
  }
  return {
    subject: 'Ваша запись, ' + s + ', ' + when + ' ' + data.time,
    body: 'Здравствуйте, ' + data.name + '!\n\n' +
      'Спасибо за запись в студию Evgenia. Ваши детали:\n\n' +
      'Услуга: ' + s + '\nДата: ' + when + '\nВремя: ' + data.time + '\nАдрес: ' + STUDIO_ADDRESS + '\n\n' +
      'Если планы изменятся, напишите или позвоните: ' + STUDIO_PHONE + '.\n\nДо встречи!\nЕвгения',
  }
}

// ── Уведомления мастеру (опционально) ─────────────────────────────────────────

function notifyEmail_(data) {
  if (!NOTIFY_EMAIL) return
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Новая запись: ' + (data.service || '') + ', ' + data.dateISO + ' ' + data.time,
      body: 'Дата: ' + data.dateISO + '\nВремя: ' + data.time + '\nУслуга: ' + (data.service || '') +
        '\nИмя: ' + data.name + '\nEmail: ' + data.email + '\nКонтакт: ' + (data.contact || '') + '\nЯзык: ' + (data.lang || ''),
    })
  } catch (err) { console.error('master email failed: ' + err) }
}

function notifyTelegram_(data) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  try {
    var text = '<b>🗓 Новая запись</b>\n\n' +
      '<b>Дата:</b> ' + esc_(data.dateISO) + '\n<b>Время:</b> ' + esc_(data.time) +
      '\n<b>Услуга:</b> ' + esc_(data.service) + '\n<b>Имя:</b> ' + esc_(data.name) +
      '\n<b>Email:</b> ' + esc_(data.email) + '\n<b>Контакт:</b> ' + esc_(data.contact)
    tg_('sendMessage', {
      chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[
        { text: '✅ Подтвердить', callback_data: 'ok|' + data.dateISO + '|' + data.time },
        { text: '❌ Отменить', callback_data: 'no|' + data.dateISO + '|' + data.time },
      ]] },
    })
  } catch (err) { console.error('telegram notify failed: ' + err) }
}

// ── Telegram-бот мастера: меню, блокировка слотов, отмена записей ────────────

function handleTg_(u) {
  try {
    var msg = u.message
    var cb = u.callback_query
    var chatId = msg && msg.chat ? msg.chat.id : (cb && cb.message ? cb.message.chat.id : null)
    // Бот отвечает только мастеру, чужие сообщения молча игнорируются.
    if (!TELEGRAM_CHAT_ID || String(chatId) !== String(TELEGRAM_CHAT_ID)) return json_({ ok: true })
    if (cb) return handleTgButton_(cb)
    if (msg) sendMenu_(chatId)
  } catch (err) { console.error('tg update failed: ' + err) }
  return json_({ ok: true })
}

function sendMenu_(chatId) {
  tg_('sendMessage', {
    chat_id: chatId,
    text: 'Привет! Чем помочь?',
    reply_markup: { inline_keyboard: [
      [{ text: '🔒 Занять время', callback_data: 'blk' }],
      [{ text: '📋 Ближайшие записи', callback_data: 'list' }],
    ] },
  })
}

function handleTgButton_(cb) {
  var chatId = cb.message.chat.id
  var p = String(cb.data || '').split('|')
  var act = p[0]

  if (act === 'noop') { answerCb_(cb.id, 'Это время занято'); return json_({ ok: true }) }

  // Шаг 1 блокировки: выбор дня (сегодня + 11 вперёд).
  if (act === 'blk' && p.length === 1) {
    var rows = [], row = []
    for (var i = 0; i < 12; i++) {
      var dt = new Date(Date.now() + i * 864e5)
      var iso = Utilities.formatDate(dt, TIMEZONE, 'yyyy-MM-dd')
      var label = RU_DAYS[dt.getDay()] + ' ' + Utilities.formatDate(dt, TIMEZONE, 'dd.MM')
      row.push({ text: label, callback_data: 'blk|' + iso })
      if (row.length === 3) { rows.push(row); row = [] }
    }
    if (row.length) rows.push(row)
    answerCb_(cb.id, '')
    tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: 'Какой день занять?', reply_markup: { inline_keyboard: rows } })
    return json_({ ok: true })
  }

  // Шаг 2: выбор времени, занятые помечены крестиком.
  if (act === 'blk' && p.length === 2) {
    var iso2 = p[1]
    var taken = {}
    takenSlots_().forEach(function (k) { taken[k] = true })
    var rows2 = [], row2 = []
    BOT_TIMES.forEach(function (tm) {
      var busy = taken[iso2 + ' ' + tm]
      row2.push(busy ? { text: '✖ ' + tm, callback_data: 'noop' } : { text: tm, callback_data: 'blk|' + iso2 + '|' + tm })
      if (row2.length === 3) { rows2.push(row2); row2 = [] }
    })
    if (row2.length) rows2.push(row2)
    rows2.push([{ text: '← Другой день', callback_data: 'blk' }])
    answerCb_(cb.id, '')
    tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: 'Какое время занять (' + iso2 + ')?', reply_markup: { inline_keyboard: rows2 } })
    return json_({ ok: true })
  }

  // Шаг 3: записать блокировку.
  if (act === 'blk' && p.length === 3) {
    var isoT = p[1], tmT = p[2]
    var lock = LockService.getScriptLock()
    try { lock.waitLock(10000) } catch (e2) { answerCb_(cb.id, 'Занято, нажми ещё раз'); return json_({ ok: true }) }
    try {
      if (takenSlots_().indexOf(isoT + ' ' + tmT) !== -1) { answerCb_(cb.id, 'Это время уже занято'); return json_({ ok: true }) }
      var sheet = getSheet_()
      ensureHeaders_(sheet)
      var now = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm')
      sheet.appendRow([now, isoT, tmT, 'Занято вручную', BLOCK_NAME, '', '', '', 'Блок'])
    } finally { lock.releaseLock() }
    answerCb_(cb.id, 'Готово')
    tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: '🔒 Занято: ' + isoT + ' ' + tmT + '\nНа сайте это время больше не предлагается.' })
    return json_({ ok: true })
  }

  // Список ближайших записей с кнопками отмены.
  if (act === 'list') {
    var today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd')
    var sheet3 = getSheet_()
    var vals = sheet3.getLastRow() < 2 ? [] : sheet3.getDataRange().getValues()
    var items = []
    for (var r = 1; r < vals.length; r++) {
      if (String(vals[r][COL_STATUS]) === CANCELLED) continue
      var d3 = rowDateISO_(vals[r][COL_DATE])
      if (d3 < today) continue
      items.push({ row: r + 1, d: d3, t: rowTime_(vals[r][COL_TIME]), name: String(vals[r][4] || ''), svc: String(vals[r][3] || '') })
    }
    items.sort(function (a, b) { return (a.d + a.t) < (b.d + b.t) ? -1 : 1 })
    items = items.slice(0, 10)
    answerCb_(cb.id, '')
    if (!items.length) {
      tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: 'Ближайших записей нет.' })
      return json_({ ok: true })
    }
    var kb = items.map(function (it) {
      return [{ text: '❌ ' + it.d.slice(8) + '.' + it.d.slice(5, 7) + ' ' + it.t + ' · ' + (it.name || it.svc), callback_data: 'cxl|' + it.row }]
    })
    tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: 'Ближайшие записи. Нажми, чтобы отменить и освободить время:', reply_markup: { inline_keyboard: kb } })
    return json_({ ok: true })
  }

  // Отмена конкретной строки из списка.
  if (act === 'cxl') {
    var rowN = parseInt(p[1], 10)
    var sheet4 = getSheet_()
    if (rowN >= 2 && rowN <= sheet4.getLastRow()) {
      sheet4.getRange(rowN, COL_STATUS + 1).setValue(CANCELLED)
      answerCb_(cb.id, 'Отменено')
      tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: '❌ Запись отменена, время снова свободно на сайте.' })
    } else { answerCb_(cb.id, 'Запись не нашлась') }
    return json_({ ok: true })
  }

  // Кнопки под уведомлением о новой брони.
  if (act === 'ok' || act === 'no') {
    var d5 = p[1], t5 = p[2]
    var done = setStatusBySlot_(d5, t5, act === 'ok' ? 'Подтверждена' : CANCELLED)
    answerCb_(cb.id, done ? (act === 'ok' ? 'Подтверждена' : 'Отменена') : 'Запись не найдена')
    if (done) {
      var base = cb.message.text || ''
      tg_('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: base + '\n\n' + (act === 'ok' ? '✅ Подтверждена' : '❌ Отменена, слот свободен') })
    }
    return json_({ ok: true })
  }

  answerCb_(cb.id, '')
  return json_({ ok: true })
}

// Находит невычеркнутую запись по дате+времени и ставит ей статус.
function setStatusBySlot_(dateISO, time, status) {
  var sheet = getSheet_()
  if (sheet.getLastRow() < 2) return false
  var vals = sheet.getDataRange().getValues()
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][COL_STATUS]) === CANCELLED) continue
    if (rowDateISO_(vals[i][COL_DATE]) === dateISO && rowTime_(vals[i][COL_TIME]) === time) {
      sheet.getRange(i + 1, COL_STATUS + 1).setValue(status)
      return true
    }
  }
  return false
}

function tg_(method, payload) {
  if (!TELEGRAM_BOT_TOKEN) return
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/' + method, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true,
  })
}

function answerCb_(id, text) {
  var p = { callback_query_id: id }
  if (text) p.text = text
  tg_('answerCallbackQuery', p)
}

// Привязка бота к этому скрипту. Запустить ОДИН РАЗ вручную из редактора,
// ПОСЛЕ того как вписан токен и сделана «Новая версия» развёртывания.
function setWebhook() {
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/setWebhook', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ url: WEBAPP_URL, allowed_updates: ['message', 'callback_query'] }),
    muteHttpExceptions: true,
  })
  Logger.log(res.getContentText())
}

// ── Оформление таблицы ────────────────────────────────────────────────────────
// Запустить ОДИН РАЗ вручную из редактора: выбрать функцию setupSheet → Выполнить.
// Делает статус выпадающим списком и красит строки по статусу. Повторный запуск
// безопасен (просто переустановит оформление заново).

function setupSheet() {
  var sheet = getSheet_()
  ensureHeaders_(sheet)
  var rows = Math.max(sheet.getMaxRows(), 1000)

  // Шапка: цвет студии, белый жирный текст, закреплена.
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#6E7A61').setFontColor('#FFFFFF').setFontWeight('bold')
  sheet.setFrozenRows(1)

  // Статус: выпадающий список вместо ручного ввода.
  var statusCol = sheet.getRange(2, COL_STATUS + 1, rows - 1)
  statusCol.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build()
  )

  // Подсветка всей строки по статусу.
  var data = sheet.getRange(2, 1, rows - 1, HEADERS.length)
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$I2="Отменена"')
      .setBackground('#EFEFEF').setFontColor('#999999').setStrikethrough(true)
      .setRanges([data]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$I2="Новая"')
      .setBackground('#FFF4CC')
      .setRanges([data]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$I2="Подтверждена"')
      .setBackground('#DDE9D5')
      .setRanges([data]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$I2="Выполнена"')
      .setBackground('#DCE7EA')
      .setRanges([data]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$I2="Блок"')
      .setBackground('#E8E4EF').setFontColor('#7A6F8A')
      .setRanges([data]).build(),
  ])

  // Ширины колонок под содержимое.
  var widths = [130, 100, 70, 230, 160, 210, 160, 60, 140]
  for (var i = 0; i < widths.length; i++) sheet.setColumnWidth(i + 1, widths[i])
}

// ── Утилиты ───────────────────────────────────────────────────────────────────

function getSheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0] }

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
    sheet.getRange('B:C').setNumberFormat('@') // Дата и Время, текстом
  }
}

function rowDateISO_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd')
  return String(v).trim()
}

function rowTime_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, 'HH:mm')
  return String(v).trim()
}

function esc_(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Обрезает строку до максимума (защита от мегабайтных полей).
function clip_(v, max) {
  return String(v == null ? '' : v).slice(0, max)
}

// Значение для ячейки таблицы: строки, начинающиеся с = + - @, получают префикс ',
// чтобы Google Таблица не выполнила их как формулу (formula injection).
function cell_(v) {
  var s = String(v == null ? '' : v)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
