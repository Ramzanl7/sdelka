const fs = require('fs');

// Fix js/core.js
let core = fs.readFileSync('c:/Users/administrator/Desktop/www/js/core.js', 'utf-8');

// Replace hashPassword with fallback
const oldHash = `async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}`;

const newHash = `async function hashPassword(password) {
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
}`;

core = core.replace(oldHash, newHash);

// Replace verifyPassword
const oldVerify = `async function verifyPassword(password, hash) {
    const computed = await hashPassword(password);
    return computed === hash;
}`;

const newVerify = `async function verifyPassword(password, hash) {
    const computed = await hashPassword(password);
    return computed === hash;
}`;

core = core.replace(oldVerify, newVerify);

// Fix updateNav to properly remove admin link
const oldUpdateNav = `function updateNav() {
    const user = getCurrentUser();
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const loginLink = navUl.querySelector('a[href="login.html"]');
    const registerLink = navUl.querySelector('a[href="register.html"]');
    let adminNavItem = navUl.querySelector('[data-admin-nav-item="true"]');
    const insertBeforeNode = loginLink ? loginLink.closest('li') : registerLink ? registerLink.closest('li') : null;

    if (isAdminUser(user)) {
        if (!adminNavItem) {
            adminNavItem = document.createElement('li');
            adminNavItem.dataset.adminNavItem = 'true';
            adminNavItem.innerHTML = '<a href="admin.html">Админка</a>';
            navUl.insertBefore(adminNavItem, insertBeforeNode);
        }
    } else if (adminNavItem) {
        adminNavItem.remove();
    }

    if (user) {
        if (loginLink) {
            loginLink.textContent = 'Выход';
            loginLink.href = '#';
            loginLink.onclick = () => {
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
            if (loginLink.onclick) loginLink.onclick = null;
        }
        if (registerLink) registerLink.style.display = 'inline-block';
    }
}`;

const newUpdateNav = `function updateNav() {
    const user = getCurrentUser();
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const loginLink = navUl.querySelector('a[href="login.html"]');
    const registerLink = navUl.querySelector('a[href="register.html"]');
    let adminNavItem = navUl.querySelector('[data-admin-nav-item="true"]');

    // Удаляем админку, если пользователь не админ
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
}`;

core = core.replace(oldUpdateNav, newUpdateNav);

fs.writeFileSync('c:/Users/administrator/Desktop/www/js/core.js', core, 'utf-8');
console.log('js/core.js fixed');

// Fix main.js
let main = fs.readFileSync('c:/Users/administrator/Desktop/www/main.js', 'utf-8');

const oldMainHash = `async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}`;

main = main.replace(oldMainHash, newHash);

const oldMainVerify = `async function verifyPassword(password, hash) {
    const computed = await hashPassword(password);
    return computed === hash;
}`;

main = main.replace(oldMainVerify, newVerify);

// Fix updateNav in main.js similarly
const oldMainUpdateNav = `function updateNav() {
    const user = getCurrentUser();
    const navUl = document.querySelector('nav ul');
    if (navUl) {
        const loginLink = navUl.querySelector('a[href="login.html"]');
        const registerLink = navUl.querySelector('a[href="register.html"]');
        let adminNavItem = navUl.querySelector('[data-admin-nav-item="true"]');
        const insertBeforeNode = loginLink ? loginLink.closest('li') : registerLink ? registerLink.closest('li') : null;

        if (isAdminUser(user)) {
            if (!adminNavItem) {
                adminNavItem = document.createElement('li');
                adminNavItem.dataset.adminNavItem = 'true';
                adminNavItem.innerHTML = '<a href="admin.html">Админка</a>';
                navUl.insertBefore(adminNavItem, insertBeforeNode);
            }
        } else if (adminNavItem) {
            adminNavItem.remove();
        }

        if (user) {
            if (loginLink) {
                loginLink.textContent = 'Выход';
                loginLink.href = '#';
                loginLink.onclick = () => {
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
                if (loginLink.onclick) loginLink.onclick = null;
            }
            if (registerLink) registerLink.style.display = 'inline-block';
        }
    }
}`;

const newMainUpdateNav = `function updateNav() {
    const user = getCurrentUser();
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const loginLink = navUl.querySelector('a[href="login.html"]');
    const registerLink = navUl.querySelector('a[href="register.html"]');
    let adminNavItem = navUl.querySelector('[data-admin-nav-item="true"]');

    // Удаляем админку, если пользователь не админ
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
}`;

main = main.replace(oldMainUpdateNav, newMainUpdateNav);

fs.writeFileSync('c:/Users/administrator/Desktop/www/main.js', main, 'utf-8');
console.log('main.js fixed');

