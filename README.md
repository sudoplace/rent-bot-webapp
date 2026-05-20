# rent-bot-webapp

Telegram Mini App с фильтрами поиска для бота-парсера krisha.kz (аренда квартир в Алматы).

Чистая статика — `index.html` + `styles.css` + `app.js`. Никакой сборки и зависимостей кроме официального SDK Telegram, подключённого как `<script>`.

## Структура

```
.
├─ index.html     — разметка формы фильтров
├─ styles.css     — стили (поддерживают тему Telegram)
├─ app.js         — логика, сбор JSON, отправка через Telegram.WebApp.sendData
└─ README.md
```

## Что отправляется боту

При нажатии на нативную кнопку «Сохранить фильтры» (Telegram MainButton) бот получает в `update.message.web_app_data.data` JSON вида:

```json
{
  "city": "almaty",
  "districts": ["almaty-almalinskij", "almaty-medeuskij"],
  "rooms": [1, 2],
  "price": { "from": null, "to": 250000 },
  "who": "any"
}
```

Допустимые значения:
- `city` — пока всегда `"almaty"`.
- `districts` — массив alias'ов из дерева `/region/ajaxGetChildren/?id=2`. Пустой массив = весь город.
- `rooms` — массив чисел 1–5 (5 = «5 и больше»). Пустой = любое количество.
- `price.from` / `price.to` — целое число в тенге или `null`.
- `who` — `"any"` | `"owner"` | `"agent"`.

## Локальная разработка

Открой `index.html` двойным кликом в браузере. Будет показан dev-блок: кнопка «Сохранить (dev)» и JSON-дамп текущего состояния. Вне Telegram `tg.sendData` не сработает — просто скопируется JSON в буфер.

## Деплой на GitHub Pages

1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main`, folder: `/ (root)`
4. Save → подожди минуту → URL появится в этом же разделе.

После деплоя URL будет вида:
```
https://sudoplace.github.io/rent-bot-webapp/
```

Этот URL подставляется в бот как `WEBAPP_URL` (см. репозиторий бота).
