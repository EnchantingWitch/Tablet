# Архитектура «Планшет ПНР» (pr4-WM)

> Документ описывает архитектуру мобильного планшетного приложения для управления пусконаладочными работами.
> Состояние кодовой базы: ветка `docs/architecture`, коммит `26c8502` (Initial commit).

---

## 1. Назначение

**«Планшет ПНР»** — полевое приложение для сопровождения **пусконаладочных работ (ПНР)** на объектах капитального строительства (ОКС). Предоставляет исполнителям и супервайзерам ПНР инструмент для работы непосредственно на площадке:

- выбор объекта ОКС и просмотр сводки по нему (KPI, графики);
- ведение **замечаний** и **дефектов** с жизненным циклом статусов;
- ведение **журнала ПНР** (хронология работ);
- просмотр **структуры систем** объекта и **документации**;
- работа **офлайн** (без связи) с локальной БД — для замечаний и дефектов;
- **ролевая модель доступа** (PNR/ИИ исполнители, супервайзеры, кураторы, эксплуатация, админ).

**Доменные сокращения:** ПНР — пусконаладочные работы; ОКС — объект капитального строительства; ИИ — индивидуальные испытания; КО — комиссионные операции; СМР — строительно-монтажные работы.

---

## 2. Технологический стек

| Слой | Технология | Версия |
|---|---|---|
| Фреймворк | Expo (managed → bare/prebuild для Android) | SDK **53.0.22** |
| UI-движок | React Native | **0.79.5** |
| React | React | **19.0.0** |
| Навигация | Expo Router (file-based) + React Navigation | Expo Router **~5.1.5** |
| Язык | TypeScript (strict, alias `@/*` → корень) | **~5.8.3** |
| Локальная БД (офлайн) | WatermelonDB + SQLite | **^0.28** |
| Безопасное хранилище | expo-secure-store | ~14.2.4 |
| Сборка/доставка | EAS Build (Android) | — |
| New Architecture | включена (`newArchEnabled: true`) | — |

Прочие заметные зависимости: `react-native-gifted-charts`, `react-native-chart-kit` (графики), `react-native-element-dropdown`, `react-native-reanimated`, `react-native-webview`, `react-native-fs`, `react-native-blob-util`, `expo-document-picker`, `expo-image-picker`, `expo-media-library`, `expo-sharing`, `date-fns`.

**Платформа:** Android (папка `ios/` отсутствует, сборка только под Android). В `app.json` заложена конфигурация `ios.supportsTablet`, но iOS не собирается.

---

## 3. Высокоуровневая архитектура

```
┌───────────────────────────────────────────────────────────┐
│  UI / Маршрутизация — Expo Router (app/)                   │
│   index (auth-gate) → (tabs) | admin | offline            │
├───────────────────────────────────────────────────────────┤
│  Компоненты (components/) + хуки (hooks/)                  │
│   PermissionGuard · графики · списки · формы · календари  │
├───────────────────────────────────────────────────────────┤
│  Состояние: Context API                                    │
│   AuthProvider (права) + хук useToken (JWT)               │
├───────────────────────────────────────────────────────────┤
│  Слой данных                                               │
│   ONLINE  → REST API (config/api.js, fetch напрямую)      │
│   OFFLINE → WatermelonDB (DB/, SQLite)                    │
├───────────────────────────────────────────────────────────┤
│  Хранилище устройства                                      │
│   SecureStore: токены, роль, профиль, массив прав          │
│   AsyncStorage: UI-состояние (последний просмотр и т.п.)   │
└───────────────────────────────────────────────────────────┘
```

**Главный принцип:** единая кодовая база с двумя режимами работы — онлайн (данные с сервера через REST) и офлайн (локальная БД WatermelonDB). Режимы разнесены по двум параллельным деревьям маршрутов: `app/` (онлайн) и `app/offline/` (офлайн).

---

## 4. Структура каталогов

```
pr4-WM/
├── app/                  # Маршруты Expo Router (file-based)
│   ├── _layout.tsx       # Корневой Stack + AuthProvider + шрифты
│   ├── index.tsx         # Auth-gate: проверка JWT, роутинг по роли
│   ├── (tabs)/           # Основные вкладки (онлайн)
│   ├── objs/             # Выбор объекта ОКС
│   ├── sign/             # Вход / регистрация
│   ├── admin/            # Экраны администратора
│   ├── user/             # Профиль пользователя
│   ├── notes/            # Замечания: create/change/see
│   ├── defacts/          # Дефекты: create/change/see
│   ├── jour/             # Журнал ПНР: create/change/see
│   ├── structures/       # Структура систем объекта
│   ├── offline/          # Офлайн-режим (параллельное дерево)
│   ├── modal.tsx         # Модальное окно
│   └── +not-found.tsx    # 404
├── components/           # Переиспользуемые UI-компоненты
├── providers/            # AuthProvider (Context)
├── hooks/                # Кастомные хуки (useToken, usePermissions, …)
├── lib/                  # ⚠️ закомментированный код Appwrite (не используется)
├── config/api.js         # URL бэкенда по окружениям
├── DB/                   # WatermelonDB: schema, models, migrations, services
├── constants/Colors.ts   # Цвета/стили
├── utils/                # Вспомогательные утилиты
├── assets/               # Шрифты, иконки (SVG), изображения, файлы (гайд, политика)
├── scripts/reset-project.js
├── android/              # Bare/prebuild Android-проект
├── app.json · eas.json · tsconfig.json · package.json
└── docs/ARCHITECTURE.md  # Этот документ
```

---

## 5. Навигация и маршрутизация

### Корневой стек (`app/_layout.tsx`)
`Stack` с экранами: `index`, `objs`, `(tabs)`, `offline`, `notes`, `structures`, `sign`, `admin`, `user`, `defacts`, `jour`, `modal`. В корне подключается `AuthProvider` и загружаются шрифты (`HeliosCondC` + FontAwesome), управляется сплэш-экран.

### Auth-gate (`app/index.tsx`)
Точка входа после запуска. Читает `accessToken` из SecureStore, проверяет актуальность запросом `GET /capitals/getAll` с `Bearer`, парсит JWT (`parseJwt`), сохраняет профиль в SecureStore и выполняет роутинг по роли:

- `ADMIN` → `/admin/menu`
- `USER`, `CWEXECUTOR`, `CWSUPERVISOR`, `CWCURATOR`, `CIWEXECUTOR`, `CIWSUPERVISOR`, `EXPLOITING` → `/objs/objects`
- нет токена → `/sign/sign_in`

При протухании access-токена — refresh через `POST /refresh_token`.

### Основные вкладки (`app/(tabs)/_layout.tsx`)
Кастомный `TabBar` (нативный скрыт, рендерится горизонтальный `ScrollView`; каждая вкладка обёрнута в `PermissionGuard`). 6 вкладок, каждая защищена правом:

| Вкладка | Файл | Право |
|---|---|---|
| Объект | `object.tsx` | `OBJECT_VIEW` |
| Документы | `docs.tsx` | `MONITORING_DOWNLOAD` |
| Структура | `structure.tsx` | `STRUCTURE_VIEW` |
| Замечания | `two.tsx` | `COMMENT_VIEW` |
| Дефекты | `defacts.tsx` | `DEFACT_VIEW` |
| Журнал ПНР | `jour.tsx` | `JOURNAL_VIEW` |

Экраны создания/редактирования вынесены в отдельные ветки маршрутов (`notes/`, `defacts/`, `jour/`, `structures/`, `admin/`).

### Офлайн-режим (`app/offline/`)
Параллельное дерево маршрутов: вход через `load_objs_WM.tsx`, упрощённые вкладки `(tabsWM)/{notes,defacts}` и экраны `create/change/see` для замечаний и дефектов. Доступ ограничен ролями `CWEXECUTOR`, `CWSUPERVISOR`.

### Deep links
Схемы `pr://` и `exp+pr://` (intent-filters в `AndroidManifest.xml`).

---

## 6. Аутентификация и авторизация

**Аутентификация — JWT.** Пара `accessToken` + `refreshToken` хранится в **expo-secure-store**. Вход — `app/sign/sign_in.tsx` (запрос к серверу на логин). Валидация и refresh — в `app/index.tsx`.

**Профиль в SecureStore:** `userID`, `fullName`, `organisation`, `role`, `permissions` (массив строк), а также `accessToken`/`refreshToken` и UI-ключи (`lastViewedObj`, `selectedCodeCSS`, `selectedNameCSS`).

**Роли:** `ADMIN`, `USER`, `CWEXECUTOR`, `CWSUPERVISOR`, `CWCURATOR`, `CIWEXECUTOR`, `CIWSUPERVISOR`, `EXPLOITING`.

**Авторизация — на основе прав.** `AuthProvider` (`providers/AuthProvider.tsx`) при старте грузит массив `permissions` из SecureStore и expose'ит `hasPermission()` / `refreshPermissions()` через `useAuth()`. Компонент `PermissionGuard` (`components/PermissionGuard.tsx`) скрывает недоступные элементы. Права, проверяемые во вкладках: `OBJECT_VIEW`, `MONITORING_DOWNLOAD`, `STRUCTURE_VIEW`, `COMMENT_VIEW`, `DEFACT_VIEW`, `JOURNAL_VIEW`; для экранов создания/редактирования используются аналогичные права вида `*_CREATE`/`*_EDIT` (например `COMMENT_CREATE`, `DEFACT_CREATE`, `JOURNAL_CREATE`, `IIACTS_UPLOAD`).

---

## 7. Слой данных

### 7.1 Онлайн — REST API

Конфигурация — `config/api.js`. Базовые URL **захардкожены**:

| Окружение | baseUrl |
|---|---|
| production | `https://xn----7sbpwlcifkq8d.xn--p1ai:8441` (кириллический домен, punycode) |
| preview | `https://pnr-tablet-test.ru:8443` |
| development | `https://pnr-tablet-test.ru:8443` |

Выбор окружения: `__DEV__` → `development`; иначе → `preview`. **Внимание:** ветка `production` текущей логикой не выбирается (см. §10.1).

Проверенные эндпоинты: `GET /capitals/getAll` (авторизационная проверка), `POST /refresh_token`. Прочие запросы по ресурсам (объекты, замечания, дефекты, системы, журнал, загрузка файлов/реестров) выполняются `fetch` **непосредственно в экранах** — единого API-клиента нет.

### 7.2 Офлайн — WatermelonDB

- `DB/database/index.js` — `Database` + `SQLiteAdapter`, имя БД `myapp_db`, зарегистрированы 6 моделей.
- `DB/database/schema.js` — схема **версии 3**, таблицы: `defacts`, `notes`, `objects`, `organisations`, `subobjects`, `systems`.
- `DB/model/*.js` — модели с декораторами WatermelonDB и связями (объект ↔ замечания/дефекты/системы/подобъекты).
- `DB/model/migrations.js` — миграции (актуальная v3; в v2→v3 добавлен `flag_from_server`).
- `DB/services/saveServiceDB.js` — помощники записи; `DB/utils/databaseDebug.ts` — отладка.

**Модель синхронизации:** у `defacts` и `notes` есть поля `flag_from_server` (`0` — локальная запись, `1` — с сервера) и `id_from_server` — для reconciliation при синхронизации. Полноценный движок синхронизации/разрешения конфликтов пока не реализован (см. §10.4).

### 7.3 Хранилище устройства
- **SecureStore** — токены, профиль, права (секреты).
- **AsyncStorage** — UI-состояние (последний просмотренный объект/позиция списка, раскрытые секции).

---

## 8. Управление состоянием

- **Context API только.** Глобальный контекст один — `AuthProvider` (права). Глобального стора (Redux/Zustand) нет.
- **Библиотеки запросов нет** (React Query/SWR не подключены) — серверное состояние фетчится `fetch` в компонентах, кеширование ручное.
- **Хуки** (`hooks/`): `useToken` (управление JWT/SecureStore), `usePermissions`, `useColorText`/`useThemeColor` (тема), `useDevice` (платформа/адаптивность), семейство `useScrollToLastViewed*` (восстановление позиции списка). Примечание: часть хуков имеет префикс `-` (`-useAutoScrollToItem.ts` и т.п.) — отключённые/переименованные файлы (§10.12).
- **Темы:** цвета инкапсулированы в хуке `useColorText` (захардкоженные значения) и `constants/Colors.ts`; единой системы тем нет.

---

## 9. Сборка и развёртывание

- **EAS Build, Android.** Профили (`eas.json`): `development` (dev-клиент, internal), `preview` (internal), `production` (`autoIncrement`), `production-aab`.
- **Скрипты** (`package.json`): `build:dev`, `build:preview`, `build:prod`, `build:prod:aab` (+ варианты `:local`), `start`, `android`, `lint`, `eas:login`, `eas:whoami`.
- **Android** (`android/`, bare/prebuild): package `com.enchanting_witch.pr` (заглушка), `versionCode 14` / `versionName "1.20"`, New Architecture, Hermes, вручную добавлен `RNFSPackage` (react-native-fs). Разрешения: INTERNET, внешнее хранилище, RECORD_AUDIO, VIBRATE и др.
- **app.json:** имя `pnr`, slug `pr`, scheme `pr`, `newArchEnabled`, `typedRoutes`, `EAS projectId` прописан.

---

## 10. Известные проблемы и риски (по факту кода)

1. **Релизные сборки идут на тестовый сервер.** `getCurrentEnvironment()` в `config/api.js` возвращает `development` при `__DEV__`, иначе `preview` — значение `production` не возвращается никогда. Production-URL фактически мёртв.
2. **Захардкоженные URL** в `config/api.js`, нет переменных окружения / `extra` в `app.config`.
3. **Нет единого API-клиента.** `fetch` разбросан по экранам → дублирование, отсутствие единой обработки ошибок и типизации ответов.
4. **Офлайн-режим незавершён (WIP).** Зависимость `NetInfo` отсутствует; в `app/offline/load_objs_WM.tsx` флаг наличия сети захардкожен. Авто-синхронизация и разрешение конфликтов не реализованы (есть только поля-маркеры `flag_from_server`/`id_from_server`).
5. **Мёртвый код Appwrite.** `lib/appwrite.js` и `lib/useAppwrite.js` целиком закомментированы; Appwrite не используется и отсутствует в `package.json`.
6. **Захардкоженный JWT в комментариях** `app/index.tsx` (гигиена/безопасность — удалить).
7. **Подозрительная зависимость `rm` (`^0.1.8`)** в `package.json` — проверить цепочку поставок; вероятно попадание случайно.
8. **Рассинхрон версий:** `app.json` = `1.20`, `package.json` = `1.19`.
9. **Android package `com.enchanting_witch.pr`** — заглушка EAS; до релиза требуется переименование.
10. **Debug-keystore credentials** в `android/app/build.gradle`.
11. **`parseJwt` на клиенте** через `atob`; роли/клaims доверяются клиенту.
12. **Хуки с префиксом `-`** (`hooks/-useAutoScrollToItem.ts`, `-useScrollToIndex.ts`, `-useViewableItems.tsx`) — кандидаты на удаление/переименование.
13. **iOS не собирается** (нет `ios/`), несмотря на `ios.supportsTablet` в `app.json`.

---

## 11. Рекомендации (по приоритету)

**P0 (безопасность/корректность)**
- Перевести конфигурацию на env/EAS env (`app.config` `extra` + `EAS_BUILD_PROFILE`); **исправить выбор `production`** окружения для релизных сборок.
- Вынести `fetch` в **единый API-клиент** (перехватчики авторизации, refresh, типы ответов, обработка ошибок).
- Удалить захардкоженный JWT из комментариев; провести ревью зависимости `rm`.

**P1 (надёжность/офлайн)**
- Подключить `NetInfo`, реализовать определение связи и **движок синхронизации** WatermelonDB↔сервер с разрешением конфликтов.
- Добавить error boundaries и единую обработку ошибок; рассмотреть React Query для серверного состояния.
- Удалить мёртвый код Appwrite (`lib/`).

**P2 (инженерная гигиена)**
- Свести версии `app.json`/`package.json`; переименовать Android package; типизировать ответы API; ввести единую систему тем; почистить хуки с `-`.

---

## 12. Ключевые файлы (карта для погружения)

| Что | Файл |
|---|---|
| Корневой layout/провайдеры | `app/_layout.tsx` |
| Auth-gate, JWT, роутинг по роли | `app/index.tsx` |
| Права доступа (Context) | `providers/AuthProvider.tsx` |
| Гард компонентов по правам | `components/PermissionGuard.tsx` |
| Токены/SecureStore | `hooks/useToken.ts` |
| Конфиг бэкенда | `config/api.js` |
| Локальная БД (setup) | `DB/database/index.js` |
| Схема БД | `DB/database/schema.js` |
| Офлайн-вход | `app/offline/load_objs_WM.tsx` |
| Основные вкладки | `app/(tabs)/_layout.tsx` |
| Android native | `android/app/src/main/java/com/enchanting_witch/pr/` |
