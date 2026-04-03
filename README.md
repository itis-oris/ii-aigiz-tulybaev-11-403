# Sprinly Frontend

Frontend часть Sprinly построена на `Next.js 16` с `App Router`, `TypeScript` и `Tailwind CSS 4`.

## Стек

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `@tanstack/react-query`
- `zustand`
- `ESLint`
- `Prettier`
- `Stylelint`
- `Husky`
- `lint-staged`

## Архитектура

Проект разложен по адаптированному `Feature-Sliced Design` для `Next App Router`.

```text
frontend/
  app/         # маршруты, layout, глобальные стили, providers
  pages/       # route-level композиция экранов
  widgets/     # крупные блоки страницы
  features/    # прикладные пользовательские сценарии
  entities/    # доменные сущности, модели и связанный UI
  shared/      # переиспользуемый UI, конфиги и утилиты
```

Принцип простой:

- `app` остаётся тонким и не хранит бизнес-логику
- `pages` собирают экран из виджетов
- `widgets` собираются из `features`, `entities` и `shared`
- `shared` не зависит от вышестоящих слоёв

## Скрипты

Запускать из каталога `frontend/`.

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run stylelint
npm run format
npm run format:check
```

