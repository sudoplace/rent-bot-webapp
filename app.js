/* ------------------------------------------------------------------
   Krisha-bot · Mini App
   Чистый JS без сборки и без npm-зависимостей.
   Загруженный заранее в HTML SDK даёт глобал window.Telegram.WebApp.
------------------------------------------------------------------ */

/* === Справочные данные ============================================ */

// 8 районов Алматы. Источник: GET /region/ajaxGetChildren/?id=2 (см. reference).
// id оставлен на случай, если позже понадобится /region/ajaxParentChain.
//
// Поля для подсказки новоприезжему:
//   price:     "💸💸💸" — относительный уровень цен на аренду (1–3 значка)
//   transport: короткая фраза про транспорт / метро / пробки
//   safety:    короткая фраза про безопасность и общий вайб
//   summary:   1–2 предложения «о чём этот район»
//   src:       'aviasales' — взято из статьи aviasales.ru/psgr/article/almaty-districts
//              'general'   — обобщённое знание про Алматы (статья этот район не охватывает)
const DISTRICTS = [
  {
    id: 26, alias: "almaty-almalinskij", name: "Алмалинский",
    price: "💸💸💸",
    transport: "Всё пешком, центр, метро рядом",
    safety: "Безопасно днём, шумно вечером и в выходные",
    summary: "Исторический центр — «Золотой квадрат», кафе, галереи, театры. Самое дорогое жильё, часто старый ремонт.",
    src: "aviasales",
  },
  {
    id: 89, alias: "almaty-medeuskij", name: "Медеуский",
    price: "💸💸💸",
    transport: "В верхней части без машины тяжело, метро не дотягивается",
    safety: "Самый спокойный и престижный, чистый воздух",
    summary: "У подножия гор: Медеу, Кок-Тобе, парки. Тихо и зелено, но цены высокие, локации разбросаны.",
    src: "aviasales",
  },
  {
    id: 73, alias: "almaty-bostandykskij", name: "Бостандыкский",
    price: "💸💸",
    transport: "4 станции метро, плотная сеть автобусов",
    safety: "Спокойно, семейный район",
    summary: "Новостройки, ТЦ, парки. Хороший баланс цены и инфраструктуры. Местами шумно из-за стройки.",
    src: "aviasales",
  },
  {
    id: 29, alias: "almaty-aujezovskij", name: "Ауэзовский",
    price: "💸",
    transport: "Метро есть, до центра ехать прилично",
    safety: "Спальный, оживлённый, без особых проблем",
    summary: "Демократичные цены, рынки, супермаркеты, зелёные улицы. Далеко от достопримечательностей.",
    src: "aviasales",
  },
  {
    id: 3, alias: "almaty-alatauskij", name: "Алатауский",
    price: "💸",
    transport: "Метро нет, до центра далеко, нужны автобусы или машина",
    safety: "Окраина, новые ЖК соседствуют с частным сектором",
    summary: "Северо-западная окраина: бюджетное жильё, новые микрорайоны, но инфраструктура и транспорт слабее.",
    src: "general",
  },
  {
    id: 83, alias: "almaty-zhetysuskij", name: "Жетысуский",
    price: "💸💸",
    transport: "Метро частично, до центра 20–30 минут",
    safety: "Смешанная застройка, есть проблемные участки",
    summary: "Северо-восток города, бывший Жетысуский промышленный пояс. Сейчас активно обновляется, цены средние.",
    src: "general",
  },
  {
    id: 99, alias: "almaty-turksibskij", name: "Турксибский",
    price: "💸",
    transport: "Метро нет, привязка к вокзалу и автобусам",
    safety: "Бюджетный район, вечером на окраинах лучше быть внимательнее",
    summary: "Север города, у вокзала Алматы-1. Дёшево, инфраструктура попроще, репутация «рабочего» района.",
    src: "general",
  },
  {
    id: 783, alias: "almaty-nauryzbajskiy", name: "Наурызбайский",
    price: "💸",
    transport: "Метро нет, утром серьёзные пробки в центр",
    safety: "Тихо, частный сектор и новые ЖК (Калкаман, Шугыла)",
    summary: "Юго-западная окраина, бывшие пригороды. Воздух чище, цены ниже, но связность с городом слабая.",
    src: "general",
  },
];

// Комнаты. "5" в Krisha означает «5 и больше».
const ROOMS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5+" },
];

/* === Telegram WebApp init ========================================== */

const tg = window.Telegram?.WebApp;
const isInTelegram = !!(tg && tg.initData);

if (tg) {
  tg.ready();
  tg.expand();
}

/* === Рендер чипов ================================================== */

function renderChips(containerId, items, getValue, getLabel) {
  const root = document.getElementById(containerId);
  root.innerHTML = "";
  for (const it of items) {
    const id = `${containerId}-${getValue(it)}`;
    const label = document.createElement("label");
    label.className = "chip";
    label.htmlFor = id;
    label.innerHTML = `
      <input type="checkbox" id="${id}" value="${getValue(it)}">
      <span>${getLabel(it)}</span>
    `;
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      label.classList.toggle("checked", input.checked);
      onChange();
    });
    root.appendChild(label);
  }
}

renderChips("districts", DISTRICTS, d => d.alias, d => d.name);
renderChips("rooms",     ROOMS,     r => r.value, r => r.label);

/* === Рендер карточек подсказки по районам ========================= */

function renderDistrictInfoCards() {
  const root = document.getElementById("distInfoCards");
  root.innerHTML = DISTRICTS.map(d => `
    <article class="info-card">
      <header class="info-card-head">
        <span class="info-card-name">${d.name}</span>
        <span class="info-card-price" title="Относительная цена">${d.price}</span>
        <span class="src-tag src-${d.src}"
              title="${d.src === 'aviasales'
                ? 'Из статьи aviasales.ru/psgr/article/almaty-districts'
                : 'Общее знание про Алматы (этого района нет в статье)'}">
          ${d.src === 'aviasales' ? 'A' : '·'}
        </span>
      </header>
      <p class="info-card-summary">${d.summary}</p>
      <ul class="info-card-meta">
        <li>🚇 ${d.transport}</li>
        <li>🛡 ${d.safety}</li>
      </ul>
    </article>
  `).join("");
}
renderDistrictInfoCards();

// тоггл блока подсказки
(() => {
  const btn   = document.getElementById("distInfoToggle");
  const panel = document.getElementById("distInfo");
  btn.addEventListener("click", () => {
    const open = panel.hidden;          // станет открытым после переключения
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Скрыть подсказку" : "Как выбирать?";
  });
})();

/* === Сбор состояния → JSON ========================================= */

function readChecked(containerId) {
  return [...document.querySelectorAll(`#${containerId} input:checked`)]
    .map(i => i.value);
}

function readNumber(id) {
  const v = document.getElementById(id).value.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function readWho() {
  const r = document.querySelector('#who input[name="who"]:checked');
  return r ? r.value : "any";
}

function collect() {
  // rooms приводим обратно к числам
  const rooms = readChecked("rooms").map(Number);

  return {
    city: "almaty",
    districts: readChecked("districts"),
    rooms,
    price: {
      from: readNumber("priceFrom"),
      to:   readNumber("priceTo"),
    },
    who: readWho(),
  };
}

/* === Валидация =================================================== */

function validate(state) {
  const errors = [];
  const { from, to } = state.price;
  if (from != null && to != null && from > to) {
    errors.push("Цена «от» больше, чем «до».");
  }
  // комнаты/районы могут быть пустыми — это валидно (= «все»)
  return errors;
}

/* === Отправка в Telegram ========================================= */

function send(state) {
  const payload = JSON.stringify(state);
  if (isInTelegram) {
    tg.sendData(payload);   // бот получит это в апдейте web_app_data
    tg.close();
  } else {
    // dev-режим: показываем JSON и копируем в буфер
    const dump = document.getElementById("dump");
    dump.textContent = payload;
    navigator.clipboard?.writeText(payload).catch(() => {});
  }
}

/* === Реактивность MainButton ===================================== */

function onChange() {
  const state = collect();
  const errors = validate(state);

  if (isInTelegram) {
    const mb = tg.MainButton;
    if (errors.length) {
      mb.setText(errors[0]);
      mb.show();
      mb.disable();
    } else {
      mb.setText("Сохранить фильтры");
      mb.show();
      mb.enable();
    }
  } else {
    const btn = document.getElementById("saveBtn");
    btn.textContent = errors.length ? errors[0] : "Сохранить (dev)";
    btn.disabled = errors.length > 0;
  }
}

/* === Бутстрап =================================================== */

// слушатели на инпуты цены/радио
["priceFrom", "priceTo"].forEach(id =>
  document.getElementById(id).addEventListener("input", onChange));
document.querySelectorAll('#who input').forEach(i =>
  i.addEventListener("change", onChange));

if (isInTelegram) {
  // Используем нативную нижнюю кнопку Telegram
  tg.MainButton.onClick(() => {
    const state = collect();
    if (validate(state).length === 0) send(state);
  });
} else {
  // Вне Telegram — показываем debug-блок и резервную кнопку
  document.getElementById("debug").hidden = false;
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.hidden = false;
  saveBtn.addEventListener("click", () => {
    const state = collect();
    if (validate(state).length === 0) send(state);
  });
  document.getElementById("dumpBtn").addEventListener("click", () => {
    document.getElementById("dump").textContent =
      JSON.stringify(collect(), null, 2);
  });
}

// первичное состояние кнопки
onChange();

/* === Предзаполнение из start_param / cloudStorage ================
   На следующем шаге, когда подключим бота:
   - можно передавать сохранённые фильтры через tg.initDataUnsafe.start_param
     или через Telegram Cloud Storage (tg.CloudStorage), и заполнять форму
     ими при открытии. Сейчас оставлено как hook на будущее.
================================================================== */
function prefill(/* state */) { /* TODO на этапе бота */ }
prefill();
