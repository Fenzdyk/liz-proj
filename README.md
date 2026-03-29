# Liza — многостраничный фронтенд на Vite

Статический сайт из нескольких HTML-страниц с общими шаблонами (Handlebars), стилями на SCSS и UI-компонентами Bootstrap 5.

---

## Требования к окружению

- **Node.js** актуальной LTS-ветки (рекомендуется 20.x или новее).
- **npm** (идёт вместе с Node.js).

Проверка версий:

```bash
node -v
npm -v
```

---

## Установка зависимостей

Из корня проекта:

```bash
npm install
```

Будут установлены зависимости из `package.json`: **Bootstrap** (runtime) и инструменты разработки — **Vite**, **Sass**, **vite-plugin-handlebars**.

---

## Запуск в режиме разработки

```bash
npm run dev
```

Vite поднимает dev-сервер (по умолчанию `http://localhost:5173`) с **Hot Module Replacement (HMR)** для JS/CSS: изменения в `src/` и в HTML подхватываются без полной перезагрузки там, где это возможно.

Корень dev-сервера — **`src/pages/`** (см. `root` в `vite.config.js`). Каждая страница — папка **`src/pages/&lt;имя&gt;/`** с **`index.html`** и **`context.js`** (данные для Handlebars). Общий скрипт — **`/main.js`** (`src/pages/main.js` импортирует `src/main.js`). Запросы **`/`** и **`/index.html`** в dev и `preview` перенаправляются на **`/index/index.html`** (плагин `vite/home-redirect-plugin.js`). Ссылки между разделами в шапке — вида **`/studio/index.html`** и т.д.; после сборки структура та же внутри **`dist/`**.

---

## Сборка для продакшена

```bash
npm run build
```

Результат попадает в каталог **`dist/`**:

- минифицированные и с хэшами в именах **JS** и **CSS** (через Rollup внутри Vite);
- скопированные и обработанные **HTML**-страницы;
- относительные пути к ассетам переписаны под выкладку.

Многостраничная сборка задана в `vite.config.js` через `build.rollupOptions.input` — в бандл попадают все страницы из `src/pages/`. Каталог **`dist/`** задаётся явно (`build.outDir`), чтобы артефакты не оказывались внутри `src/pages/`.

---

## Просмотр собранного сайта локально

```bash
npm run preview
```

Запускается статический сервер поверх **`dist/`**, чтобы проверить продакшен-сборку до выкладки на хостинг.

---

## Используемые технологии и роль каждой части

### Сборщик и dev-сервер: **Vite** (^8)

- Dev: нативные ES-модули в браузере, быстрый старт, HMR.
- Build: **Rollup** для оптимизации бандлов (tree-shaking, code splitting по страницам/чанкам по необходимости).
- В `package.json` указано `"type": "module"` — конфиг и скрипты в формате **ESM** (`import`/`export`).

### Препроцессор стилей: **Sass (Dart Sass)** (^1.98)

- Файлы в `src/scss/` с расширением **`.scss`** (синтаксис SCSS: вложенность, переменные, миксины).
- Vite обрабатывает `@import` / `@use` в JS и CSS пайплайне без отдельного CLI `sass`.
- В `vite.config.js` для SCSS задано `css.preprocessorOptions.scss.quietDeps: true` — подавление предупреждений из зависимостей (например, Bootstrap).

### CSS-фреймворк: **Bootstrap 5** (^5.3.8)

- **SCSS**: в `src/scss/main.scss` Bootstrap подключается через современную директиву **`@use 'bootstrap/scss/bootstrap' as * with (...)`** — так задаются переменные темы (например, `$primary`, шрифты) до подмешивания стилей фреймворка (в отличие от устаревшего глобального `@import`).
- **JavaScript**: в `src/main.js` импортируется **`bootstrap.bundle.min.js`** (включает Popper) для интерактивных компонентов (модалки, дропдауны и т.д.).

### Шаблонизатор: **Handlebars** (через **vite-plugin-handlebars**)

- HTML-страницы в `src/pages/` используют синтаксис Handlebars: `{{title}}`, `{{> header }}` и т.д.
- Частичные шаблоны лежат в **`partials/`** (`header.hbs`, `footer.hbs`, `product-card.hbs` и т.д.).
- Контекст для страницы задаётся в **`src/pages/&lt;страница&gt;/context.js`**: `export default { title, ... }` или `export default async (pagePath) => ({ ... })`. **`vite/page-context.js`** подключает этот файл по публичному пути страницы; в **`vite.config.js`** остаётся только вызов плагина Handlebars.

### Шрифты

- В **`src/scss/fonts.scss`** подключены веб-шрифты через **`@import url(...)`** с Google Fonts (Open Sans, PT Serif), далее эти семейства согласованы с переменными Bootstrap в `main.scss`.

### Язык клиентского кода

- **Чистый JavaScript** как ES-модули (`import`/`export`), без React/Vue и без TypeScript в текущем `package.json`.

---

## Структура проекта (кратко)

| Путь | Назначение |
|------|------------|
| `src/pages/<slug>/index.html` | Разметка страницы; Handlebars + `/main.js` |
| `src/pages/<slug>/context.js` | Данные для шаблона (title и др.) |
| `src/pages/main.js` | Обёртка: импорт `../main.js` (URL `/main.js` при `root: src/pages`) |
| `src/main.js` | Общая точка входа: Bootstrap + SCSS |
| `vite/page-context.js` | Загрузка `context.js` рядом с HTML |
| `vite/home-redirect-plugin.js` | `/` → `/index/index.html` в dev и preview |
| `public/` | Статика без обработки (иконки, изображения — пути вида `/static/...`) |
| `partials/*.hbs` | Переиспользуемые фрагменты разметки |
| `src/scss/main.scss` | Тема Bootstrap и кастомные стили |
| `src/scss/fonts.scss` | Подключение шрифтов |
| `vite.config.js` | Плагины, мультистраничный input, опции SCSS |
| `dist/` | Артефакты сборки (в `.gitignore`) |

---

## Полезные замечания

- Для деплоя достаточно выложить содержимое **`dist/`** на любой статический хостинг. Главная в сборке — **`dist/index/index.html`**; для URL **`/`** на хостинге настройте индексный файл или редирект (аналогично плагину для dev/preview).
