# Backend Sprintly

Backend-часть Sprintly построена на `NestJS`, `Prisma` и `PostgreSQL`. Сервис отвечает за аутентификацию, управление задачами и подготовку API для клиентского приложения.

## Стек

- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- `JWT` для access и refresh токенов
- `class-validator` для валидации входных данных
- `Swagger` для документации API

## Подготовка окружения

1. Установи зависимости:

```bash
npm install
```

2. Убедись, что PostgreSQL запущен и доступен по параметрам из `.env`.

3. Примени миграции:

```bash
npx prisma migrate dev
```

## Запуск проекта

```bash
# обычный запуск
npm run start

# режим разработки с отслеживанием изменений
npm run start:dev

# production-сборка
npm run build
npm run start:prod
```

## Prisma

Полезные команды для работы с базой данных:

```bash
# применить миграции в dev-окружении
npx prisma migrate dev

# открыть Prisma Studio
npx prisma studio

# пересоздать Prisma Client
npx prisma generate
```

## Тесты и качество кода

```bash
# unit-тесты
npm run test

# e2e-тесты
npm run test:e2e

# покрытие тестами
npm run test:cov

# линтер
npm run lint
```

## Документация API

Swagger доступен после запуска приложения по адресу:

```text
/api/docs
```

Что уже отражено в Swagger UI:

- теги по модулям API, включая отдельный раздел аутентификации
- схемы авторизации для `Bearer` access token и cookie `refreshToken`
- DTO-поля, примеры значений и базовые ограничения валидации
- описания основных ответов и типовых ошибок для контроллеров

Как работать с авторизацией в Swagger:

1. Выполни `POST /api/auth/login` или `POST /api/auth/register`.
2. Скопируй `accessToken` из ответа.
3. Нажми `Authorize` и вставь токен в схему `access-token`.
4. Для `refresh` и `logout` учитывай, что эти маршруты используют cookie `refreshToken`, а не bearer token.

Ограничения Swagger UI:

- `refreshToken` хранится в `httpOnly` cookie, поэтому удобнее всего тестировать `refresh` и `logout` после реального login/register запроса из того же браузера
- если cookie не установлена в браузере, `POST /api/auth/refresh` и `POST /api/auth/logout` вернут ошибку авторизации

## Основные модули

- `auth` — регистрация, вход, обновление токена и выход из системы
- `task` — создание, изменение, назначение, перемещение и удаление задач
- `prisma` — доступ к базе данных
- `config` — конфигурация JWT и Swagger

## Замечания по разработке

- Для `Prisma Studio` лучше использовать `Node.js 20` или `22` LTS, если на текущей версии Node возникают ошибки совместимости.
- Перед ручным изменением SQL-файлов миграций убедись, что миграция ещё не была применена, иначе Prisma обнаружит drift.
