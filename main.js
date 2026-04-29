/**
 * main.js - Основной JS для SDELKA
 * Управление пользователями, заявками, чатом, темой
 */

// ========== УТИЛИТЫ БЕЗОПАСНОСТИ ==========

/**
 * Экранирует HTML-сущности для предотвращения XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Асинхронно хеширует пароль через SHA-256
 * @param {string} password
 * @returns {Promise<string>} hex-хеш
 */
async function hashPassword(password) {
    try {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
        console.warn('Web Crypto API недоступен, используется fallback хеширование');
    }
    // Fallback для file:// и старых браузеров
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'fb_' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Проверяет пароль против SHA-256 хеша
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hash) {
    const computed = await hashPassword(password);
    return computed === hash;
}

// Инициализация localStorage
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('requests')) {
    localStorage.setItem('requests', JSON.stringify([]));
}
if (!localStorage.getItem('supportTickets')) {
    localStorage.setItem('supportTickets', JSON.stringify([]));
}
if (!localStorage.getItem('currentUser')) {
    localStorage.removeItem('currentUser');
}

// Унифицированные демо-данные администратора (синхронизировано с React siteStore.js)
const DEFAULT_ADMIN_EMAIL = 'admin@sdelka.local';
const DEFAULT_ADMIN_PASSWORD_HASH = '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121';
const DEFAULT_ADMIN_USER = {
    id: 'admin',
    name: 'Администратор SDELKA',
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD_HASH,
    role: 'admin',
    phone: '',
    city: '',
    avatar: '',
    bio: 'Демо-администратор для тестирования платформы.',
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: null,
    rating: { average: 0, count: 0, total: 0 }
};

/**
 * Безопасно читает массив из localStorage
 * @param {string} key - Ключ localStorage
 * @returns {Array<object>}
 */
function parseStoredList(key) {
    try {
        const rawValue = localStorage.getItem(key);
        if (!rawValue) return [];
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
        console.warn(`Не удалось прочитать ${key}:`, error);
        return [];
    }
}

/**
 * Возвращает список пользователей
 * @returns {Array<object>}
 */
function getUsers() {
    return parseStoredList('users');
}

/**
 * Сохраняет список пользователей
 * @param {Array<object>} users - Пользователи
 */
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(Array.isArray(users) ? users : []));
}

/**
 * Возвращает список заявок
 * @returns {Array<object>}
 */
function getRequests() {
    return parseStoredList('requests');
}

/**
 * Сохраняет список заявок
 * @param {Array<object>} requests - Заявки
 */
function saveRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(Array.isArray(requests) ? requests : []));
}

/**
 * Возвращает список обращений в поддержку
 * @returns {Array<object>}
 */
function getSupportTickets() {
    return parseStoredList('supportTickets');
}

/**
 * Сохраняет список обращений в поддержку
 * @param {Array<object>} tickets - Обращения
 */
function saveSupportTickets(tickets) {
    localStorage.setItem('supportTickets', JSON.stringify(Array.isArray(tickets) ? tickets : []));
}

/**
 * Создает демо-администратора, если его еще нет
 */
function ensureDefaultAdmin() {
    const users = getUsers();
    if (!users.some(user => user.email === DEFAULT_ADMIN_EMAIL)) {
        users.push(DEFAULT_ADMIN_USER);
        saveUsers(users);
    }
}
ensureDefaultAdmin();

/**
 * Регистрация пользователя
 * @param {string} name - Имя
 * @param {string} email - Email
 * @param {string} phone - Телефон
 * @param {string} password - Пароль
 * @param {string} role - Роль
 * @returns {Promise<boolean>} Успех
 */
async function registerUser(name, email, phone, password, role) {
    const users = getUsers();
    const normalizedName = name.trim();
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const normalizedPhone = phone ? phone.trim() : '';
    const normalizedPassword = password.trim();

    if (!normalizedName || !normalizedPassword) {
        alert('Имя и пароль обязательны.');
        return false;
    }
    if (!normalizedPhone) {
        alert('Номер телефона обязателен для связи.');
        return false;
    }
    if (normalizedPassword.length < 6) {
        alert('Пароль должен содержать не менее 6 символов.');
        return false;
    }
    if (normalizedEmail && users.find(user => user.email && user.email.toLowerCase() === normalizedEmail)) {
        alert('Пользователь с таким email уже существует');
        return false;
    }
    if (role === 'admin') {
        alert('Регистрация администратора через форму недоступна.');
        return false;
    }

    let userRole = role;
    if (role === 'shop') {
        userRole = 'pending_verification';
    }

    const hashedPassword = await hashPassword(normalizedPassword);

    users.push({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: userRole,
        createdAt: new Date().toISOString(),
        rating: { average: 0, count: 0, total: 0 }
    });
    saveUsers(users);
    return true;
}

/**
 * Вход пользователя
 * @param {string} identifier - Email или номер телефона
 * @param {string} password - Пароль
 * @returns {Promise<boolean>} Успех
 */
async function loginUser(identifier, password) {
    const users = getUsers();
    const normalizedIdentifier = identifier.trim();
    const normalizedPassword = password.trim();

    const user = users.find(u => {
        if (u.email && u.email.toLowerCase() === normalizedIdentifier.toLowerCase()) return true;
        if (u.phone && u.phone === normalizedIdentifier) return true;
        return false;
    });

    if (!user) return false;

    const storedPassword = user.password || '';
    let passwordValid = false;

    if (storedPassword.length === 64) {
        passwordValid = await verifyPassword(normalizedPassword, storedPassword);
    }

    if (!passwordValid && storedPassword === normalizedPassword) {
        passwordValid = true;
        user.password = await hashPassword(normalizedPassword);
        saveUsers(users);
    }

    if (passwordValid) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

/**
 * Выход пользователя
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
}

/**
 * Получить текущего пользователя
 * @returns {object|null} Пользователь или null
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
        return null;
    }
}

/**
 * Проверяет, является ли пользователь администратором
 * @param {object|null} user - Пользователь
 * @returns {boolean}
 */
function isAdminUser(user = getCurrentUser()) {
    return Boolean(user && user.role === 'admin');
}

/**
 * Обновляет меню навигации
 */
function updateNav() {
    const user = getCurrentUser();
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const loginLink = navUl.querySelector('a[href="login.html"]');
    const registerLink = navUl.querySelector('a[href="register.html"]');
    let adminNavItem = navUl.querySelector('[data-admin-nav-item="true"]');

    if (!isAdminUser(user) && adminNavItem) {
        adminNavItem.remove();
        adminNavItem = null;
    }

    if (isAdminUser(user)) {
        if (!adminNavItem) {
            adminNavItem = document.createElement('li');
            adminNavItem.dataset.adminNavItem = 'true';
            adminNavItem.innerHTML = '<a href="admin.html">Админка</a>';
            const insertBeforeNode = loginLink ? loginLink.closest('li') : registerLink ? registerLink.closest('li') : null;
            if (insertBeforeNode) {
                navUl.insertBefore(adminNavItem, insertBeforeNode);
            } else {
                navUl.appendChild(adminNavItem);
            }
        }
    }

    if (user) {
        if (loginLink) {
            loginLink.textContent = 'Выход';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                logoutUser();
                updateNav();
                window.location.href = 'index.html';
            };
        }
        if (registerLink) registerLink.style.display = 'none';
    } else {
        if (loginLink) {
            loginLink.textContent = 'Войти';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
        if (registerLink) registerLink.style.display = 'inline-block';
    }
}
