// Service catalogue, carried over verbatim from the design handoff.
// cat: 'd' depilation · 'e' electrolysis · 'm' massage
// aud: 'both' | 'w' (women) | 'm' (men)
// Реальный прайс студии (источник, DIKIDI). cat: 'd' депиляция · 'e' электроэпиляция · 'm' массаж.
// aud: 'w' женская · 'm' мужская · 'both'. from: true, цена «от …» (зависит от зоны/густоты).
export const SERVICES = [
  // Женская депиляция
  { cat: 'd', aud: 'w', min: 5, price: 5, ru: 'Усики', et: 'Ülahuul', en: 'Upper lip' },
  { cat: 'd', aud: 'w', min: 10, price: 10, ru: 'Подмышки', et: 'Kaenlaalused', en: 'Underarms' },
  { cat: 'd', aud: 'w', min: 20, price: 15, ru: 'Ручки до локтя', et: 'Käed küünarnukini', en: 'Forearms (to elbow)' },
  { cat: 'd', aud: 'w', min: 20, price: 20, ru: 'Голень', et: 'Sääred', en: 'Shins' },
  { cat: 'd', aud: 'w', min: 30, price: 25, ru: 'Руки полностью', et: 'Käed täies pikkuses', en: 'Full arms' },
  { cat: 'd', aud: 'w', min: 30, price: 30, ru: 'Бикини', et: 'Bikiinijoon', en: 'Bikini' },
  { cat: 'd', aud: 'w', min: 40, price: 35, ru: 'Ноги полностью', et: 'Jalad täielikult', en: 'Full legs' },
  // Мужская депиляция
  { cat: 'd', aud: 'm', min: 10, price: 5, ru: 'Лицо, 1 зона', et: 'Nägu, 1 tsoon', en: 'Face, 1 zone' },
  { cat: 'd', aud: 'm', min: 15, price: 15, ru: 'Подмышки', et: 'Kaenlaalused', en: 'Underarms' },
  { cat: 'd', aud: 'm', min: 30, price: 15, from: true, ru: 'Депиляция бороды', et: 'Habeme depilatsioon', en: 'Beard depilation' },
  { cat: 'd', aud: 'm', min: 45, price: 30, ru: 'Спина', et: 'Selg', en: 'Back' },
  { cat: 'd', aud: 'm', min: 40, price: 40, ru: 'Торс (грудь, живот)', et: 'Torso (rind, kõht)', en: 'Torso (chest, abdomen)' },
  { cat: 'd', aud: 'm', min: 30, price: 30, ru: 'Голени', et: 'Sääred', en: 'Shins' },
  { cat: 'd', aud: 'm', min: 30, price: 30, ru: 'Бёдра', et: 'Reied', en: 'Thighs' },
  { cat: 'd', aud: 'm', min: 60, price: 55, ru: 'Ноги полностью', et: 'Jalad täielikult', en: 'Full legs' },
  { cat: 'd', aud: 'm', min: 45, price: 50, ru: 'Бикини', et: 'Bikiinijoon', en: 'Bikini' },
  // Электроэпиляция
  { cat: 'e', aud: 'both', min: 30, price: 25, ru: 'Пробная электроэпиляция', et: 'Proovielektroepilatsioon', en: 'Trial electrolysis' },
  { cat: 'e', aud: 'both', min: 60, price: 50, ru: 'Электроэпиляция', et: 'Elektroepilatsioon', en: 'Electrolysis' },
  // Массаж (только расслабляющий, три длительности)
  { cat: 'm', aud: 'both', min: 60, price: 45, ru: 'Расслабляющий массаж', et: 'Lõõgastav massaaž', en: 'Relaxing massage' },
  { cat: 'm', aud: 'both', min: 90, price: 60, ru: 'Расслабляющий массаж', et: 'Lõõgastav massaaž', en: 'Relaxing massage' },
  { cat: 'm', aud: 'both', min: 120, price: 75, ru: 'Расслабляющий массаж', et: 'Lõõgastav massaaž', en: 'Relaxing massage' },
]

export const REVIEWS = {
  ru: [
    { name: 'Анна', meta: 'Депиляция', text: 'Очень уютно и аккуратно. Евгения, настоящий профессионал, всё спокойно и безболезненно.' },
    { name: 'Мария', meta: 'Массаж', text: 'Хожу на массаж каждый месяц. Расслабляюсь полностью, атмосфера тихая и приятная.' },
    { name: 'Ольга', meta: 'Электроэпиляция', text: 'Наконец избавилась от вросших волосков навсегда. Терпеливо, аккуратно, с заботой, результатом очень довольна.' },
  ],
  et: [
    { name: 'Anna', meta: 'Depilatsioon', text: 'Väga hubane ja korralik. Jevgenia on tõeline professionaal, kõik käib rahulikult ja valutult.' },
    { name: 'Maria', meta: 'Massaaž', text: 'Käin massaažis igal kuul. Lõõgastun täielikult, õhkkond on vaikne ja meeldiv.' },
    { name: 'Olga', meta: 'Elektroepilatsioon', text: 'Sain sissekasvanud karvadest lõpuks jäädavalt lahti. Kannatlikult, korralikult ja hoolega, tulemusega väga rahul.' },
  ],
  en: [
    { name: 'Anna', meta: 'Depilation', text: 'So cosy and tidy. Evgenia is a true professional, everything calm and painless.' },
    { name: 'Maria', meta: 'Massage', text: 'I come for a massage every month. I relax completely; the atmosphere is quiet and lovely.' },
    { name: 'Olga', meta: 'Electrolysis', text: 'Finally rid of ingrown hairs for good. Patient, tidy and caring, really happy with the result.' },
  ],
}

// Gallery grouped by service, so it is clear which work is which.
// Only work / process shots, no posed portraits of the master.
// key maps to gallery_cat_* label in i18n.
export const GALLERY = [
  {
    key: 'depil',
    photos: [
      'uploads/IMG_3546.jpg', // шугаринг груди
      'uploads/IMG_3530.jpg', // шугаринг, снятие пасты
      'uploads/IMG_3525.jpg', // шугаринг подмышки
      'uploads/IMG_3446.jpg', // подготовка кожи
      'uploads/IMG_3168.jpg', // воск ItalWax
      'uploads/wax-italwax.jpg', // НОВОЕ: картриджи воска (прислано)
    ],
  },
  {
    key: 'electro',
    photos: [
      'uploads/IMG_3467.jpg', // электроэпиляция, процедура
      'uploads/IMG_3473.jpg', // работа иглой, крупно
      'uploads/IMG_3230.jpg', // стерильные инструменты
    ],
  },
  {
    key: 'massage',
    photos: [
      'uploads/massage-back.jpg',   // НОВОЕ: массаж спины (прислано)
      'uploads/massage-leg.jpg',    // НОВОЕ: массаж ног (прислано)
      'uploads/massage-foot.jpg',   // НОВОЕ: массаж стоп (прислано)
      'uploads/massage-towels.jpg', // НОВОЕ: подготовка, полотенца (прислано)
    ],
  },
]

// Depilation packages (bundled zones at a special price). zones map to pkg_z keys.
export const PACKAGES = [
  { size: 'S', price: 50, zones: ['armpits', 'shin', 'bikini'] },
  { size: 'M', price: 65, zones: ['bikini', 'shin', 'forearm', 'armpits'] },
  { size: 'XL', price: 90, zones: ['legs', 'arms', 'bikini', 'armpits'] },
]

// Before / after cases for the results section (electrolysis).
export const RESULTS = [
  {
    captionKey: 'results_cap_underarm',
    before: 'uploads/result-before.jpg',
    after: 'uploads/result-after.jpg',
  },
  {
    captionKey: 'results_cap_bikini',
    before: 'uploads/result-bikini-before.jpg',
    after: 'uploads/result-bikini-after.jpg',
  },
]

// Featured services on the home teaser (index into SERVICES + a photo).
export const FEATURED = [
  { index: 14, img: 'uploads/IMG_3253.jpg' },      // Электроэпиляция (фото с иглодержателем)
  { index: 6, img: 'uploads/IMG_3163.jpg' },       // Ноги полностью — нейтральное фото депиляции (воск)
  { index: 15, img: 'uploads/massage-back.jpg' },  // Расслабляющий массаж — фото массажа спины
]

// Google Apps Script Web App URL that receives bookings and appends them to the
// master's Google Sheet. Leave '' until deployed, the form then falls back to
// Instagram Direct only. See booking-sheet.gs and SETUP-BOOKING.md.
export const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbymgF5cXbwdJ5FwEqYbEJ6gibcNqGiSalymxmnCdYtwpTvvWxyzX5Be3mewimjduTt-/exec'

// Meta (Facebook) Pixel ID из Events Manager. Пусто = пиксель выключен.
// Вписать сюда числовой ID (напр. '1234567890123456'), чтобы включить трекинг.
export const META_PIXEL_ID = ''

// Google Analytics 4 Measurement ID (напр. 'G-XXXXXXXXXX'). Пусто = GA выключен.
export const GA_MEASUREMENT_ID = 'G-F04V2VQGG6'

// Телефон студии (WhatsApp) в международном формате без плюса и пробелов.
export const WHATSAPP_NUMBER = '3725573981'

export const IG_URL = 'https://www.instagram.com/massage_tln_depilation'
export const IG_HANDLE = '@massage_tln_depilation'
export const BOOK_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
