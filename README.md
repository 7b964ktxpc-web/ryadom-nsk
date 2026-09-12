<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# РЯДОМ НСК — Гиперлокальный городской сервис Новосибирска

Всё полезное рядом с тобой прямо сейчас.

## Технологии

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React, Motion
- **Backend:** Express 4, tsx (TypeScript runtime)
- **AI:** Google Gemini 3.8 Flash API
- **Database:** Supabase (PostgreSQL + PostGIS + RLS)
- **Auth:** Phone-based + Telegram Mini App
- **Storage:** localStorage + server-side JSON backup
- **Compliance:** ФЗ-152 «О персональных данных»

## Быстрый старт

### Предварительные требования
- Node.js 20+
- npm 10+
- Supabase аккаунт (или локальный сервер)

### 1. Клонирование и установка
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте `.env.example` в `.env.local` и заполните:
```bash
cp .env.example .env.local
```

Обязательные переменные:
- `GEMINI_API_KEY` — ключ для Gemini AI
- `SUPABASE_URL` — URL вашего Supabase проекта
- `SUPABASE_ANON_KEY` — публичный ключ Supabase
- `SUPABASE_SERVICE_KEY` — service role key (только для сервера)
- `SESSION_SECRET` — секрет для сессий
- `OPERATOR_NAME`, `OPERATOR_ADDRESS`, `OPERATOR_CONTACT` — данные оператора для ФЗ-152
- `ADMIN_EMAIL` — email администратора
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` — параметры ограничения запросов
- `DATA_RETENTION_DAYS` — срок хранения данных при удалении

### 3. Supabase настройка

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните миграции из `schema.sql`:
```sql
-- Выполните schema.sql в Supabase SQL Editor
```
3. Скопируйте URL и ключи в `.env.local`

### 4. Запуск
```bash
# Разработка
npm run dev

# Продакшен-сборка
npm run build

# Запуск продакшена
npm start

# Очистка
npm run clean
```

## Архитектура

```
src/
├── components/          # React-компоненты (UI)
│   ├── Header.tsx       # Верхняя панель навигации
│   ├── BottomNavigation.tsx # Мобильная навигация
│   ├── PostCard.tsx     # Карточка публикации
│   ├── CreatePostModal.tsx # Создание публикации
│   ├── ProfileModal.tsx  # Профиль пользователя
│   ├── AdminPanelModal.tsx # Админ-панель
│   ├── OnboardingModal.tsx # Онбординг
│   ├── CookieConsent.tsx # Согласие на cookies (ФЗ-152)
│   ├── PrivacyPolicy.tsx # Политика конфиденциальности
│   ├── TermsOfService.tsx # Пользовательское соглашение
│   ├── DataManagement.tsx # Управление данными (ФЗ-152)
│   ├── Admin/
│   │   └── AdminMonitoring.tsx # Мониторинг системы
│   └── ...
├── contexts/            # React-контексты
│   ├── ConsentContext.tsx # Управление согласиями (ФЗ-152)
│   └── AuthContext.tsx   # Авторизация
├── services/            # Сервисный слой
│   ├── storage.ts       # Локальное хранилище (localStorage)
│   └── seedData.ts      # Демо-данные Новосибирска
├── lib/                 # Библиотечные утилиты
│   └── supabase.ts      # Supabase клиент
├── utils/               # Утилиты
│   └── geo.ts           # Геолокация, районы, расстояния
├── hooks/               # React-хуки
│   └── useRateLimit.ts  # Ограничение частоты запросов
├── types.ts             # TypeScript-интерфейсы
└── App.tsx              # Главный компонент

server/
└── store.ts             # Серверное хранилище (JSON-файл)

public/                  # Статические файлы
├── icon.svg             # PWA иконка
├── manifest.json        # PWA манифест
└── _redirects           # SPA redirect

data/                    # Данные
└── ryadom_db.json       # База данных (JSON)

schema.sql               # PostgreSQL/Supabase схема с PostGIS и RLS
```

## ФЗ-152 «О персональных данных»

Приложение соответствует требованиям ФЗ-152:
- ✅ Согласие на обработку персональных данных (ст. 9)
- ✅ Политика конфиденциальности и пользовательское соглашение
- ✅ Согласие на обработку геолокационных данных
- ✅ Право на экспорт данных (ст. 21)
- ✅ Право на удаление данных (ст. 17)
- ✅ Право на отзыв согласия
- ✅ Информация об операторе (ст. 5)
- ✅ Сроки хранения данных
- ✅ Механизм блокировки/удаления

## Админ-панель

Доступ: переключите роль на `admin` в настройках профиля.

Разделы:
- **Dashboard** — статистика: пользователи, публикации, отклики
- **Модерация** — одобрение/скрытие/удаление публикаций
- **Пользователи** — поиск, просмотр, блокировка
- **Жалобы** — просмотр и разрешение жалоб
- **Мониторинг** — журнал действий, безопасность
- **Данные** — сброс demo-данных

## Демо-данные

После первого запуска загружаются тестовые данные Новосибирска:
- 10 срочных запросов
- 10 услуг/предложений
- 10 скидок
- 10 событий
- 10 объявлений соседей
- 5 важных сообщений
- Разные районы Новосибирска

В админ-панели доступна кнопка **«Очистить demo-данные»**.

## Безопасность

- Rate limiting на сервере (100 запросов/15 минут)
- RLS (Row Level Security) в Supabase
- Мягкое удаление данных (soft delete)
- Аудит-логи действий модераторов
- Защита от спама
- Ограничение частоты публикаций

## Монетизация (подготовка)

- Поднять публикацию: 99–299 ₽
- Продвижение бизнеса: 149 ₽
- Бизнес PRO: 499 ₽/мес
- Бизнес PRO+: 1490 ₽/мес
- Срочный запрос: 99 ₽
- Будущая комиссия: 5–10%

## Развертывание (Netlify)

1. Push в GitHub-репозиторий
2. Подключите репозиторий к Netlify
3. Настройте environment variables в Netlify dashboard
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Для серверной части: используйте отдельный хостинг (Railway, Render, VPS)

## Лицензия

Проприетарный продукт, РЯДОМ НСК.

## Контакт

- Email: privacy@ryadom.nsk
- Город: Новосибирск
- Оператор: РЯДОМ НСК
