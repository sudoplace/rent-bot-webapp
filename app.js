/* ------------------------------------------------------------------
   Krisha-bot · Mini App
   Чистый JS без сборки и без npm-зависимостей.
   Загруженный заранее в HTML SDK даёт глобал window.Telegram.WebApp.
------------------------------------------------------------------ */

/* === Справочные данные ============================================ */

// 8 районов Алматы. Источник alias: GET /region/ajaxGetChildren/?id=2
// (см. krisha_kz_reference.txt).
//
// Поля карточки-подсказки (обновлено по материалам 2024-2026):
//   price     — "💸..💸💸💸" относительный уровень аренды
//   transport — пробки, метро, наземный транспорт
//   safety    — общий уровень спокойствия + конкретика, если есть
//   summary   — 1–3 предложения по делу: жильё, развитие, особенности
const DISTRICTS = [
  {
    id: 26, alias: "almaty-almalinskij", name: "Алмалинский",
    price: "💸💸💸",
    transport: "Всё пешком, метро (Абая, Алмалы), пробки на Абая/Сейфуллина утром-вечером",
    safety: "В опросах опасности — 5-е место (~12%). Днём спокойно, вечером в переулках Золотого квадрата — повнимательнее",
    summary: "Центр города и Золотой квадрат: театры, кафе, галереи, бары. Самое дорогое жильё, в советских домах часто старый ремонт. Шумно по выходным.",
  },
  {
    id: 89, alias: "almaty-medeuskij", name: "Медеуский",
    price: "💸💸💸",
    transport: "В нижней части автобусы и пара станций метро; чем выше, тем хуже — без машины наверху сложно",
    safety: "Самый спокойный по статистике правонарушений",
    summary: "У подножия гор: Медеу, Кок-Тобе, Бутаковка. Чистый воздух, виды, престижное жильё. Объекты разбросаны, поэтому такси/машина — must.",
  },
  {
    id: 73, alias: "almaty-bostandykskij", name: "Бостандыкский",
    price: "💸💸",
    transport: "4 станции метро (Алатау, Байконур, Драмтеатр Ауэзова, Сайран) + плотная сеть автобусов",
    safety: "По опросам OLX — самый комфортный район, семейный, для детей ок",
    summary: "Самый большой по площади (~10 тыс. га), много новостроек, ТЦ, парков, школ. Цены на жильё — вторые после Медеуского (от ~500 тыс/м²). Местами разбитые тротуары и активная стройка вокруг.",
  },
  {
    id: 29, alias: "almaty-aujezovskij", name: "Ауэзовский",
    price: "💸",
    transport: "Метро + расширенная сеть автобусов (в 2024 парк увеличен на ~240 машин)",
    safety: "В 2024 поставили 153 камеры «Сергек» и 1027 камер видеомониторинга — стало заметно спокойнее",
    summary: "Спальный, демократичные цены, рынки, зелёные тихие улицы. Кофейни и шашлычные в каждом квартале. До центра ехать прилично.",
  },
  {
    id: 3, alias: "almaty-alatauskij", name: "Алатауский",
    price: "💸",
    transport: "Метро НЕТ. ~600 автобусов на 42 маршрута. Узкое горло — ул. Момышулы: утром и вечером плотные пробки на выезд",
    safety: "Статистика улучшилась, но жители сами просят больше видеокамер. Окраина, частный сектор соседствует с новыми ЖК",
    summary: "Северо-западная окраина, ~220k жителей. Активно застраивается, бюджетное жильё. С 2023 в частный сектор проводят воду и электричество — раньше многие жили без коммуналки.",
  },
  {
    id: 83, alias: "almaty-zhetysuskij", name: "Жетысуский",
    price: "💸💸",
    transport: "В 2024 отремонтировали 21 км дорог, в 2025 — ещё 19 км. Новый мост через Есентай, развязка Сейфуллина/Жансугурова",
    safety: "По опросу Vision Zero — наименее опасный (7.6%)",
    summary: "Северо-восток, бывший промышленный пояс, сейчас активно обновляется. Цены средние, инфраструктура подтягивается. Один из самых комфортных по динамике развития районов.",
  },
  {
    id: 99, alias: "almaty-turksibskij", name: "Турксибский",
    price: "💸",
    transport: "3 станции метро, автобусы. Близко к ж/д вокзалу Алматы-1 и аэропорту",
    safety: "Криминогенные зоны: Шолохов–Чехов–Молдагалиев–Щербаков, Зорге–Сейфуллин–Тынышпаев. Вечером на окраинах — внимательнее",
    summary: "Север, рабочая репутация. Старый фонд (~500 домов до 1960-х), идёт реновация — в 2024 заселили 6 новых домов на Кассина. Дёшево, инфраструктура попроще.",
  },
  {
    id: 783, alias: "almaty-nauryzbajskiy", name: "Наурызбайский",
    price: "💸",
    transport: "Метро НЕТ, но в 2026 открывают станцию Калкаман. Удлиняют пр. Абая до границы города, строится BRT. Утром серьёзные пробки в центр",
    safety: "Молодой район, низкая криминальная нагрузка. Не хватает скверов, аллей, удобных автобусных связей",
    summary: "Юго-западные бывшие пригороды (Калкаман, Шугыла). Многоэтажки на пустырях, много молодых семей и студентов. Цены ниже, воздух чище, но связность с городом пока слабая.",
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

// Признак запуска как настоящего Telegram Mini App.
// НЕ опираемся на initData: для web_app-кнопок reply-клавиатуры Telegram
// может не передавать initData вовсе — она нужна лишь тем, кто валидирует
// запуск на своём бэкенде. Нам нужен sendData(), а он работает БЕЗ
// initData (бот опознаёт пользователя по служебному web_app_data).
// Надёжный признак реального запуска Mini App — платформа != "unknown"
// (в обычном браузере telegram-web-app.js ставит "unknown").
const isInTelegram = !!(
  tg && (
    (tg.initData && tg.initData.length > 0) ||
    (tg.platform && tg.platform !== "unknown")
  )
);

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
  // две взаимоисключающие кнопки. Ничего не нажато → "any" (и хозяева,
  // и агенты).
  const pressed = document.querySelector('.who-btn[aria-pressed="true"]');
  return pressed ? pressed.dataset.who : "any";
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

  if (!isInTelegram) {
    // dev-режим: показываем JSON и копируем в буфер
    document.getElementById("dump").textContent = payload;
    navigator.clipboard?.writeText(payload).catch(() => {});
    return;
  }

  // В Telegram: sendData() мгновенно закрывает Mini App. Чтобы пользователь
  // успел увидеть отклик (спиннер на кнопке + вибро), закрываем не сразу,
  // а когда выполнены ОБА условия:
  //   1) фильтры записаны в CloudStorage (для префилла при след. открытии);
  //   2) прошла минимальная пауза MIN_DELAY_MS.
  // Плюс жёсткая страховка на случай зависания CloudStorage.
  const MIN_DELAY_MS = 600;
  const HARD_TIMEOUT_MS = 2500;

  let dispatched = false;
  const dispatch = () => {
    if (dispatched) return;
    dispatched = true;
    tg.sendData(payload);            // долетит боту как web_app_data
  };

  let writeReady = false;
  let delayReady = false;
  const maybeDispatch = () => {
    if (writeReady && delayReady) dispatch();
  };

  // (1) запись в облако
  const cs = tg.CloudStorage;
  const markWritten = () => { writeReady = true; maybeDispatch(); };
  if (cs && typeof cs.setItem === "function") {
    try {
      cs.setItem("filters", payload, markWritten);  // зовётся и при ошибке
    } catch (e) {
      markWritten();
    }
  } else {
    markWritten();                   // старый клиент без CloudStorage
  }

  // (2) минимальная пауза для видимости спиннера/вибро
  setTimeout(() => { delayReady = true; maybeDispatch(); }, MIN_DELAY_MS);

  // страховка: закрыть в любом случае, даже если CloudStorage завис
  setTimeout(dispatch, HARD_TIMEOUT_MS);
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

// слушатели на инпуты цены
["priceFrom", "priceTo"].forEach(id =>
  document.getElementById(id).addEventListener("input", onChange));

// «От кого» — две взаимоисключающие кнопки-тоггла.
// Повторный тап по активной кнопке снимает выбор → "any".
document.querySelectorAll(".who-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const wasPressed = btn.getAttribute("aria-pressed") === "true";
    document.querySelectorAll(".who-btn").forEach(b =>
      b.setAttribute("aria-pressed", "false"));
    if (!wasPressed) btn.setAttribute("aria-pressed", "true");
    onChange();
  });
});

if (isInTelegram) {
  // Используем нативную нижнюю кнопку Telegram
  tg.MainButton.onClick(() => {
    const state = collect();
    if (validate(state).length !== 0) return;

    // визуальный + тактильный отклик перед закрытием Mini App
    const mb = tg.MainButton;
    mb.setText("Сохраняем…");
    mb.showProgress();               // нативный спиннер на кнопке
    mb.disable();
    tg.HapticFeedback?.notificationOccurred?.("success");

    send(state);
  });
} else {
  // initData пустой → это НЕ настоящий запуск Mini App: либо обычный
  // браузер, либо ссылка во встроенном браузере Telegram. sendData()
  // в этом режиме недоступен — показываем dev-блок с диагностикой.
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

  // диагностика — почему режим Mini App не активен.
  // Главное: разбор location.hash — Telegram передаёт данные запуска
  // именно там. Если tgWebAppData отсутствует/пустой — Telegram его
  // не прислал (значит запуск не как keyboard-button web app).
  const hashRaw = (location.hash || "").replace(/^#/, "");
  const hashParams = hashRaw
    ? hashRaw.split("&").map((p) => {
        const i = p.indexOf("=");
        const name = i >= 0 ? p.slice(0, i) : p;
        const len = i >= 0 ? p.length - i - 1 : 0;
        return `${name}(len ${len})`;
      }).join(", ")
    : "(хэш пустой)";

  const idu = tg && tg.initDataUnsafe ? Object.keys(tg.initDataUnsafe) : [];

  const diag = {
    "window.Telegram": !!window.Telegram,
    "WebApp": !!tg,
    "platform": tg ? tg.platform : "—",
    "version": tg ? tg.version : "—",
    "initData длина": tg ? (tg.initData || "").length : "—",
    "initDataUnsafe ключи": idu.length ? idu.join(",") : "(нет)",
    "location.hash": hashParams,
  };
  document.getElementById("dump").textContent =
    "Режим Mini App НЕ активен — sendData недоступен.\n\n" +
    "Диагностика:\n" + JSON.stringify(diag, null, 2);
}

// первичное состояние кнопки
onChange();

/* === Префилл формы сохранёнными фильтрами =========================
   Источник — Telegram CloudStorage (ключ "filters"), куда мы пишем
   при каждом сохранении в send(). Backend для этого не нужен.
================================================================== */

function setChip(containerId, value, checked) {
  const input = document.querySelector(
    `#${containerId} input[value="${value}"]`
  );
  if (!input) return;
  input.checked = checked;
  input.closest(".chip")?.classList.toggle("checked", checked);
}

function applyState(state) {
  if (!state || typeof state !== "object") return;

  for (const alias of Array.isArray(state.districts) ? state.districts : []) {
    setChip("districts", alias, true);
  }
  for (const room of Array.isArray(state.rooms) ? state.rooms : []) {
    setChip("rooms", room, true);
  }
  if (state.price && typeof state.price === "object") {
    if (state.price.from != null) {
      document.getElementById("priceFrom").value = state.price.from;
    }
    if (state.price.to != null) {
      document.getElementById("priceTo").value = state.price.to;
    }
  }
  // who: "owner" / "agent" / "any" (для "any" обе кнопки не нажаты)
  document.querySelectorAll(".who-btn").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.who === state.who)));
  onChange();
}

function prefill() {
  const cs = tg && tg.CloudStorage;
  if (!isInTelegram || !cs || typeof cs.getItem !== "function") return;

  cs.getItem("filters", (err, value) => {
    if (err || !value) return;
    try {
      applyState(JSON.parse(value));
    } catch (e) {
      // битый JSON в облаке — игнорируем, форма останется пустой
    }
  });
}

prefill();
