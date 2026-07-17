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
var STATUSES = ['Новая', 'Подтверждена', 'Выполнена', 'Отменена']
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
  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(15000)
  } catch (err) {
    return json_({ ok: false, reason: 'busy' })
  }
  try {
    var data = {}
    if (e && e.postData && e.postData.contents) data = JSON.parse(e.postData.contents)

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
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML', disable_web_page_preview: true }),
      muteHttpExceptions: true,
    })
  } catch (err) { console.error('telegram notify failed: ' + err) }
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
