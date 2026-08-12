# Планшет ПНР (pr4-WM)

Мобильное планшетное приложение для сопровождения **пусконаладочных работ (ПНР)** на объектах капитального строительства (ОКС). Полевой инструмент для исполнителей и супервайзеров: ведение замечаний и дефектов, журнал работ, структура систем объекта, документация, KPI-дашборд, а также **офлайн-режим** для работы без связи.

Подробное описание архитектуры — в [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Стек

- **Expo SDK 53** + **React Native 0.79.5** + **React 19** (New Architecture)
- **Expo Router ~5.1** (file-based навигация, typed routes)
- **TypeScript** (strict, алиас `@/*`)
- **WatermelonDB** (SQLite) — локальная БД офлайн-режима
- **expo-secure-store** — токены/права, **EAS Build** — сборка (Android)

## Требования

- Node.js 18+ (рекомендуется 20 LTS)
- JDK 17 и Android SDK (для нативной сборки Android)
- EAS CLI: `npm install -g eas-cli`
- Устройство/эмулятор Android

## Установка

```bash
npm install
# или, при использовании bun:
# bun install
```

## Запуск (разработка)

```bash
npm start         # expo start
npm run android   # запуск на Android-устройстве/эмуляторе
```

Для разработки используется **development build** (не Expo Go) — приложение задействует нативные модули (`react-native-fs`, `watermelondb` и др.):

```bash
npm run build:dev   # обл. сборка development-клиента (EAS)
# или локально: npm run build:dev:local
```

## Сборка (EAS Build, Android)

| Профиль | Назначение | Команда |
|---|---|---|
| `development` | Dev-клиент для отладки | `npm run build:dev` |
| `preview` | Внутреннее тестирование | `npm run build:preview` |
| `production` | Релиз (APK, `autoIncrement`) | `npm run build:prod` |
| `production-aab` | Релиз (AAB для сторов) | `npm run build:prod:aab` |

Варианты `:local` собирают на вашей машине без облака.

## Конфигурация окружения

URL бэкенда задаётся в [`config/api.js`](./config/api.js) по окружениям:

- `development` (при `__DEV__`) и `preview` (релизные сборки по умолчанию) → тестовый сервер;
- `production` — прод-сервер.

> ⚠️ **Важно:** текущая логика выбора окружения (`__DEV__` → development, иначе preview) **никогда не возвращает `production`** — релизные сборки уходят на тестовый сервер. Это известная проблема (см. [ARCHITECTURE.md §10.1](./docs/ARCHITECTURE.md)). Перед настоящим релизом требуется исправить переключение окружений.

## Структура проекта

Кратко: `app/` — маршруты Expo Router (онлайн-дерево + параллельное `app/offline/`), `components/` — UI, `providers/` — Context авторизации, `hooks/` — кастомные хуки, `DB/` — WatermelonDB (схема, модели, миграции), `config/api.js` — бэкенд, `android/` — нативный проект. Полная карта — в [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Ресурсы

- [Архитектура проекта](./docs/ARCHITECTURE.md)
- [Документация Expo](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
