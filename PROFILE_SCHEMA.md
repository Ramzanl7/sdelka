# Схема данных профилей с RBAC (SDELKA)

## Общая структура пользователя (User)

```typescript
interface User {
  id: string;              // Уникальный идентификатор
  username: string;        // Логин
  name: string;            // Имя / Название
  email: string;           // Email
  password: string;        // SHA-256 хеш пароля
  role: 'client' | 'master' | 'shop' | 'admin' | 'pending_verification';
  phone: string;           // Телефон
  city: string;            // Город
  avatar: string;          // URL фото/логотипа
  bio: string;             // О себе / Описание
  active: boolean;         // Активен ли аккаунт
  createdAt: string;       // ISO дата регистрации
  updatedAt: string;       // ISO дата обновления
  lastLoginAt: string | null;
  rating: {
    average: number;       // Средний рейтинг (0–5)
    count: number;         // Количество отзывов
    total: number;         // Сумма баллов
  };
  profile: Profile;        // Ролевые поля профиля
}
```

## Ролевой профиль (Profile)

Поле `profile` — универсальный контейнер для ролевых данных:

```typescript
interface Profile {
  // Общие для всех ролей
  address?: string;        // Адрес (мастер, магазин)

  // Только для мастера
  skills?: string[];       // Навыки (['сантехника', 'электрика'])
  specialization?: string; // Специализация

  // Можно расширять под задачи:
  // socialLinks?: { vk?: string; telegram?: string };
  // workSchedule?: string;
  // verified?: boolean;
}
```

## Разделение видимости по ролям

### 1. Клиент (client)

| Поле | Владелец | Другие |
|------|----------|--------|
| name | ✅ | ✅ |
| avatar | ✅ | ✅ |
| rating | ✅ | ✅ |
| email | ✅ | ❌ |
| phone | ✅ | ❌ |
| activeRequests | ✅ | ❌ |
| reviews | ✅ | ✅ |

### 2. Мастер (master)

| Поле | Владелец | Другие |
|------|----------|--------|
| name | ✅ | ✅ |
| avatar | ✅ | ✅ |
| rating | ✅ | ✅ |
| skills | ✅ | ✅ |
| specialization | ✅ | ✅ |
| city | ✅ | ✅ |
| bio | ✅ | ✅ |
| email | ✅ | ❌ |
| phone | ✅ | ❌ |
| address | ✅ | ❌ |
| completedDeals | ✅ | ❌ |
| reviews | ✅ | ✅ |

### 3. Магазин (shop)

| Поле | Владелец | Другие |
|------|----------|--------|
| name | ✅ | ✅ |
| avatar | ✅ | ✅ |
| email | ✅ | ✅ |
| phone | ✅ | ✅ |
| city | ✅ | ✅ |
| address | ✅ | ✅ |
| products | ✅ | ✅ |
| rating | ✅ | ✅ |
| completedDeals | ✅ | ✅ |
| bio | ✅ | ✅ |

> У магазина нет скрытых полей — все данные публичные.

### 4. Администратор (admin)

Видит всё без ограничений.

## Файлы реализации

| Файл | Назначение |
|------|-----------|
| `src/pages/ProfilePage.jsx` | Просмотр профиля с RBAC-рендерингом |
| `src/pages/AccountSettingsPage.jsx` | Редактирование профиля и смена пароля |
| `src/data/siteStore.js` | `normalizeUser` с поддержкой `profile` |
| `src/App.jsx` | Маршруты `/profile`, `/settings` |

## URL профилей

- Свой профиль: `#/profile`
- Профиль другого пользователя: `#/profile?id=<userId>`

Пример: `#/profile?id=user_abc123`

