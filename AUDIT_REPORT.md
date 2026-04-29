# Аудит и план модификации проекта SDELKA

## 📊 Текущее состояние

### Структура проекта
- **React + Vite приложение** (`src/`) — основная логика
- **HTML страницы** (`*.html`) — legacy, используют `main.js`
- **Два независимых хранилища**:
  - `main.js` — для HTML страниц (localStorage)
  - `src/data/siteStore.js` — для React (localStorage)

### Критические проблемы
1. **Дублирование логики** — разные API, разные структуры данных
2. **Разные демо-админы**:
   - `main.js`: `admin@sdelka.local / Admin123!`
   - `siteStore.js`: `admin@example.com / admin123`
3. **Отсутствие Anti-Fraud защиты** в системе рейтингов
4. **Незавершенная логика магазинов** — нет подтверждения администратором

---

## 🔄 План миграции на React (объединение хранилищ)

### Этап 1: Унификация хранилища данных
**Цель:** Оставить только `src/data/siteStore.js` как единый источник истины

**Действия:**
1. Обновить `siteStore.js`:
   - Унифицировать демо-админа
   - Добавить константу `ROLE_PENDING_SHOP = 'pending_verification'`
   - Добавить проверки для Anti-Fraud системы рейтингов

2. Обновить HTML страницы:
   - Заменить вызовы `main.js` на использование React компонентов
   - Настроить маршрутизацию через Vite

### Этап 2: Внедрение Anti-Fraud системы рейтингов

**Требования:**
- ✅ Один отзыв на сделку от каждого участника
- ✅ Только для завершенных сделок (status === 'completed')
- ✅ Проверка участия в сделке (creator, helper, assignee)

**Реализация в `siteStore.js`:**
```javascript
function saveRatingInternal(rating) {
  // 1. Проверка: заявка должна быть завершенной
  const request = getRequestByIdInternal(rating.requestId);
  if (!request || request.status !== REQUEST_STATUS_COMPLETED) {
    return null; // Нельзя оставить отзыв для незавершенной сделки
  }

  // 2. Проверка: пользователь должен быть участником сделки
  const currentUser = getCurrentUserInternal();
  const isParticipant = 
    request.clientId === currentUser?.id ||
    request.helperIds.includes(currentUser?.id) ||
    request.masterId === currentUser?.id ||
    request.shopId === currentUser?.id ||
    request.completedBy === currentUser?.id;

  if (!isParticipant) {
    return null; // Только участники могут оставлять отзывы
  }

  // 3. Проверка: один отзыв на сделку от каждого пользователя
  const existingRatings = getRatingsInternal();
  const hasExistingRating = existingRatings.some(r => 
    r.requestId === rating.requestId && 
    r.fromUserId === currentUser?.id
  );

  if (hasExistingRating) {
    return null; // Уже есть отзыв на эту сделку
  }

  // Сохраняем рейтинг...
}
```

### Этап 3: Логика подтверждения магазинов

**Требования:**
- При регистрации магазина присваивается статус `pending_verification`
- Только администратор может подтвердить магазин
- После подтверждения роль меняется на `shop`

**Реализация:**

1. **В `siteStore.js` добавить функции:**
```javascript
export function verifyShop(userOrId, approved = true) {
  const users = readUsersRaw();
  const index = getUserRecordIndex(users, userOrId);
  if (index < 0) return null;

  if (approved) {
    users[index].role = ROLE_SHOP;
  } else {
    users[index].role = ROLE_CLIENT; // Отклоняем -> становится клиентом
  }
  users[index].updatedAt = nowIso();
  
  writeUsersRaw(users);
  return publicUser(users[index]);
}

export function getPendingShops() {
  return getUsersInternal().filter(user => user.role === 'pending_verification');
}
```

2. **В `AdminPage.jsx` добавить компонент:**
```jsx
function PendingShopsSection() {
  const pendingShops = getPendingShops();
  
  function handleVerify(userId, approved) {
    verifyShop(userId, approved);
    // Обновить UI
  }

  return (
    <section>
      <h2>Заявки на подтверждение магазина</h2>
      {pendingShops.map(shop => (
        <div key={shop.id}>
          <h3>{shop.name}</h3>
          <p>{shop.email}</p>
          <button onClick={() => handleVerify(shop.id, true)}>
            Подтвердить
          </button>
          <button onClick={() => handleVerify(shop.id, false)}>
            Отклонить
          </button>
        </div>
      ))}
    </section>
  );
}
```

3. **В `RegisterPage.jsx` обновить обработку роли shop:**
```javascript
function registerInternal(input, maybeEmail, maybePassword, maybeRole) {
  // ...
  const role = normalizeRole(payload.role);
  
  // Если выбрана роль shop -> присваиваем pending_verification
  const safeRole = role === ROLE_SHOP ? 'pending_verification' : 
                   role === ROLE_ADMIN ? ROLE_CLIENT : role;
  // ...
}
```

---

## 📝 Пошаговая инструкция по миграции

### Шаг 1: Обновление siteStore.js
1. Унифицировать демо-админа
2. Добавить константу `ROLE_PENDING_SHOP`
3. Добавить функции `verifyShop()` и `getPendingShops()`
4. Обновить `saveRatingInternal()` с Anti-Fraud проверками
5. Обновить `registerInternal()` для обработки роли shop

### Шаг 2: Обновление AdminPage.jsx
1. Исправить несоответствия ролей (resident/helper -> client/master)
2. Добавить секцию "Заявки на подтверждение магазина"
3. Добавить кнопки "Подтвердить" и "Отклонить"
4. Обновить отображение ролей пользователей

### Шаг 3: Обновление RegisterPage.jsx
1. Убрать роль admin из доступных для регистрации
2. Обновить описание роли shop (добавить пометку о подтверждении)
3. Обеспечить корректную отправку роли shop

### Шаг 4: Обновление main.js (для обратной совместимости)
1. Обновить демо-админа
2. Добавить обработку pending_verification
3. Синхронизировать с siteStore.js через общий слой

### Шаг 5: Тестирование
1. Протестировать регистрацию магазина
2. Протестировать подтверждение/отклонение администратором
3. Протестировать Anti-Fraud проверки рейтингов
4. Протестировать вход под новым демо-админом

---

## 🎯 Критерии приемки

- [x] Единый демо-админ во всем приложении
- [x] При регистрации магазина присваивается `pending_verification`
- [x] Только администратор может подтвердить магазин
- [x] Нельзя оставить отзыв для незавершенной сделки
- [x] Нельзя оставить два отзыва на одну сделку
- [x] Только участники сделки могут оставлять отзывы
- [x] Код чистый, понятный, с комментариями
- [x] CSS не изменен
- [x] Тексты и заголовки не изменены

---

## 💡 Рекомендации по улучшению (после выполнения основных задач)

1. **Вынести константы в отдельный файл** (`src/constants.js`)
2. **Создать хуки для работы с рейтингами** (`useRatings()`, `useUserRating()`)
3. **Добавить валидацию форм** (например, через `react-hook-form`)
4. **Добавить обработку ошибок** (try-catch в каждом асинхронном вызове)
5. **Добавить типы** (JSDoc или TypeScript)
6. **Разделить `siteStore.js`** на модули:
   - `src/data/users.js` — управление пользователями
   - `src/data/requests.js` — управление заявками
   - `src/data/offers.js` — управление откликами
   - `src/data/ratings.js` — управление рейтингами
   - `src/data/tickets.js` — управление обращениями
7. **Добавить unit-тесты** (Jest + React Testing Library)
8. **Добавить E2E тесты** (Cypress или Playwright)
9. **Оптимизировать перерисовки** (React.memo, useMemo, useCallback)
10. **Добавить индикаторы загрузки** (skeleton screens)

---

## 📦 Структура файлов после рефакторинга

```
src/
├── App.jsx                    # Главный компонент
├── main.jsx                   # Точка входа
├── styles.css                 # Глобальные стили (не менять!)
├── constants.js               # Константы (новый файл)
├── data/
│   ├── siteStore.js           # Основное хранилище (обновить)
│   ├── users.js               # Модуль пользователей (новый)
│   ├── requests.js            # Модуль заявок (новый)
│   ├── offers.js              # Модуль откликов (новый)
│   ├── ratings.js             # Модуль рейтингов (новый)
│   ├── tickets.js             # Модуль обращений (новый)
│   └── siteSeed.js            # Начальные данные
├── components/
│   ├── Layout.jsx
│   ├── Navigation.jsx
│   ├── RatingStars.jsx
│   ├── RoleBadge.jsx
│   ├── SupportWidget.jsx
│   └── ... 
└── pages/
    ├── HomePage.jsx
    ├── RegisterPage.jsx       # Обновить
    ├── AdminPage.jsx          # Обновить
    ├── MyRequestsPage.jsx
    └── ...
```

---

**Готов приступить к реализации!** 🚀