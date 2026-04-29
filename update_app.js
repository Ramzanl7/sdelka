const fs = require('fs');
const path = 'c:/Users/administrator/Desktop/www/src/App.jsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Исправляем brand и tagline
content = content.replace(
  `brand="City Assist"\n        tagline="A local request-and-offers demo"`,
  `brand="SDELKA"\n        tagline="Маркетплейс услуг и товаров"`
);

// 2. Добавляем новые маршруты перед закрывающей скобкой ROUTES
const routesEnd = `  {
    path: '/admin',
    label: 'Админ',
    title: 'Панель администратора',
    summary: 'Управление пользователями, заявками, модерация и статистика платформы.',
    role: 'admin',
    moduleNames: ['AdminPage', 'Admin'],
  },
];`;

const newRoutesEnd = `  {
    path: '/admin',
    label: 'Админ',
    title: 'Панель администратора',
    summary: 'Управление пользователями, заявками, модерация и статистика платформы.',
    role: 'admin',
    moduleNames: ['AdminPage', 'Admin'],
  },
  {
    path: '/profile',
    label: 'Профиль',
    title: 'Личный кабинет',
    summary: 'Управление профилем, настройками и выход из аккаунта.',
    role: 'member',
    moduleNames: ['ProfilePage', 'Profile'],
  },
  {
    path: '/products',
    label: 'Товары',
    title: 'Каталог товаров',
    summary: 'Просмотр и управление товарами магазинов.',
    role: 'guest',
    moduleNames: ['ProductsPage', 'Products'],
  },
  {
    path: '/shops',
    label: 'Магазины',
    title: 'Магазины',
    summary: 'Каталог подтвержденных магазинов платформы.',
    role: 'guest',
    moduleNames: ['ShopPage', 'Shops'],
  },
];`;

if (content.includes(routesEnd)) {
  content = content.replace(routesEnd, newRoutesEnd);
  console.log('Added new routes');
} else {
  console.log('Routes end pattern not found');
}

// 3. Добавляем импорт initializeStore и вызов
if (!content.includes('initializeStore')) {
  content = content.replace(
    `import { login, register, useCurrentUser } from './data/siteStore';`,
    `import { login, register, useCurrentUser, initializeStore } from './data/siteStore';`
  );
  
  // Добавляем вызов initializeStore в начало App
  content = content.replace(
    `export default function App() {\n  const currentUser = useCurrentUser();`,
    `export default function App() {\n  initializeStore();\n  const currentUser = useCurrentUser();`
  );
  console.log('Added initializeStore');
}

fs.writeFileSync(path, content, 'utf-8');
console.log('App.jsx updated');
