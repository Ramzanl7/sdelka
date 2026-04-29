const fs = require('fs');
const path = 'c:/Users/administrator/Desktop/www/src/data/siteStore.js';
let content = fs.readFileSync(path, 'utf-8');

// 1. Добавляем normalizeProduct и normalizeProductList после normalizeOfferList
const normalizeOfferListEnd = `function normalizeOfferList(list) {
  const next = [];
  const seenIds = new Set();

  for (const item of toArray(list)) {
    const offer = normalizeOffer(item);
    if (!offer) {
      continue;
    }

    const idKey = toText(offer.id);
    if (idKey && seenIds.has(idKey)) {
      continue;
    }

    if (idKey) {
      seenIds.add(idKey);
    }

    next.push(offer);
  }

  return next;
}`;

const normalizeProductFunctions = `function normalizeProduct(product) {
  if (!isPlainObject(product)) {
    return null;
  }

  const createdAt = toText(product.createdAt ?? product.created_at ?? product.dateCreated, nowIso());
  const updatedAt = toText(product.updatedAt ?? product.modifiedAt ?? product.dateUpdated, createdAt);
  const shopId = toText(product.shopId ?? product.shop?.id ?? product.ownerId ?? product.userId, '');
  const status = normalizeStatus(product.status, PRODUCT_STATUS_ACTIVE);

  return {
    ...clone(product),
    id: toText(product.id ?? product.productId ?? generateId('product'), generateId('product')),
    name: toText(product.name ?? product.title ?? 'Без названия', 'Без названия'),
    description: toText(product.description ?? product.details ?? ''),
    price: normalizeNumber(product.price ?? product.cost ?? product.amount, 0),
    currency: toText(product.currency ?? product.money, 'USD'),
    category: toText(product.category ?? product.type ?? ''),
    images: Array.isArray(product.images) ? product.images.slice() : [],
    shopId: shopId || null,
    status,
    stock: normalizeNumber(product.stock ?? product.quantity ?? product.count, 0),
    createdAt,
    updatedAt,
  };
}

function normalizeProductList(list) {
  const next = [];
  const seenIds = new Set();

  for (const item of toArray(list)) {
    const product = normalizeProduct(item);
    if (!product) {
      continue;
    }

    const idKey = toText(product.id);
    if (idKey && seenIds.has(idKey)) {
      continue;
    }

    if (idKey) {
      seenIds.add(idKey);
    }

    next.push(product);
  }

  return next;
}`;

if (content.includes(normalizeOfferListEnd)) {
  content = content.replace(normalizeOfferListEnd, normalizeOfferListEnd + '\n\n' + normalizeProductFunctions);
  console.log('Added normalizeProduct functions');
} else {
  console.log('normalizeOfferList not found');
}

// 2. Добавляем readProductsRaw и writeProductsRaw после writeSupportTicketsRaw
const writeSupportTicketsRaw = `function writeSupportTicketsRaw(tickets) {
  persistCollection(STORAGE_KEYS.supportTickets, normalizeSupportTicketList(tickets));
  return readSupportTicketsRaw();
}`;

const productsRawFunctions = `function readProductsRaw() {
  return readCollection(STORAGE_KEYS.products, ['products', 'shopProducts', 'app_products'], [], normalizeProductList);
}

function writeProductsRaw(products) {
  persistCollection(STORAGE_KEYS.products, normalizeProductList(products));
  return readProductsRaw();
}`;

if (content.includes(writeSupportTicketsRaw)) {
  content = content.replace(writeSupportTicketsRaw, writeSupportTicketsRaw + '\n\n' + productsRawFunctions);
  console.log('Added read/writeProductsRaw');
} else {
  console.log('writeSupportTicketsRaw not found');
}

// 3. Добавляем resolveProductIndex после resolveTicketIndex
const resolveTicketIndex = `function resolveTicketIndex(tickets, ticketOrId) {
  const id = isPlainObject(ticketOrId) ? ticketOrId.id ?? ticketOrId.ticketId : ticketOrId;
  const idText = toText(id);

  return tickets.findIndex((ticket) => ticket && toText(ticket.id) === idText);
}`;

const resolveProductIndex = `function resolveProductIndex(products, productOrId) {
  const id = isPlainObject(productOrId) ? productOrId.id ?? productOrId.productId : productOrId;
  const idText = toText(id);

  return products.findIndex((product) => product && toText(product.id) === idText);
}`;

if (content.includes(resolveTicketIndex)) {
  content = content.replace(resolveTicketIndex, resolveTicketIndex + '\n\n' + resolveProductIndex);
  console.log('Added resolveProductIndex');
} else {
  console.log('resolveTicketIndex not found');
}

// 4. Добавляем product internal functions после getPendingShopsInternal
const getPendingShopsInternal = `function getPendingShopsInternal() {
  return getUsersInternal().filter(user => user.role === ROLE_PENDING_SHOP);
}`;

const productInternalFunctions = `// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ТОВАРАМИ ==========

function getProductsInternal() {
  return clone(readProductsRaw()).map((product) => clone(product));
}

function getProductByIdInternal(productOrId) {
  const products = readProductsRaw();
  const index = resolveProductIndex(products, productOrId);
  return index >= 0 ? clone(products[index]) : null;
}

function saveProductInternal(product) {
  const data = isPlainObject(product) ? product : null;
  if (!data) {
    return null;
  }

  const currentUser = getCurrentUserInternal();
  const normalized = normalizeProduct({
    ...data,
    id: data.id ?? data.productId ?? generateId('product'),
    createdAt: data.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    shopId: data.shopId ?? currentUser?.id ?? null,
  });

  if (!normalized) {
    return null;
  }

  const products = readProductsRaw();
  const index = resolveProductIndex(products, normalized);
  if (index >= 0) {
    products[index] = normalizeProduct({
      ...products[index],
      ...normalized,
      id: products[index].id,
      createdAt: products[index].createdAt,
      updatedAt: nowIso(),
    });
  } else {
    products.push(normalized);
  }

  writeProductsRaw(products);
  return clone(index >= 0 ? products[index] : normalized);
}

function createProductInternal(product = {}) {
  const currentUser = getCurrentUserInternal();
  const normalized = normalizeProduct({
    ...product,
    id: product.id ?? generateId('product'),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: product.status ?? PRODUCT_STATUS_ACTIVE,
    shopId: product.shopId ?? currentUser?.id ?? null,
  });

  if (!normalized) {
    return null;
  }

  const products = readProductsRaw();
  products.push(normalized);
  writeProductsRaw(products);
  return clone(normalized);
}

function updateProductInternal(productOrId, updates = {}) {
  const products = readProductsRaw();
  const index = resolveProductIndex(products, productOrId);
  if (index < 0) {
    return null;
  }

  const nextProduct = normalizeProduct({
    ...products[index],
    ...clone(isPlainObject(productOrId) ? { ...productOrId, ...updates } : updates),
    id: products[index].id,
    createdAt: products[index].createdAt,
    updatedAt: nowIso(),
  });

  products[index] = nextProduct;
  writeProductsRaw(products);
  return clone(nextProduct);
}

function deleteProductInternal(productOrId) {
  const products = readProductsRaw();
  const removed = removeEntityById(products, productOrId, (product) => toText(product.id));
  if (removed) {
    writeProductsRaw(products);
  }
  return removed;
}

function getProductsByShopIdInternal(shopOrId) {
  const shopId = isPlainObject(shopOrId) ? toText(shopOrId.id ?? shopOrId.userId) : toText(shopOrId);
  if (!shopId) {
    return [];
  }

  return getProductsInternal().filter((product) => toText(product.shopId) === shopId);
}`;

if (content.includes(getPendingShopsInternal)) {
  content = content.replace(getPendingShopsInternal, getPendingShopsInternal + '\n\n' + productInternalFunctions);
  console.log('Added product internal functions');
} else {
  console.log('getPendingShopsInternal not found');
}

// 5. Обновляем bootstrapStore для инициализации продуктов
const oldBootstrap = `  persistCollection(STORAGE_KEYS.users, users);
  persistCollection(STORAGE_KEYS.requests, requests);
  persistCollection(STORAGE_KEYS.offers, offers);
  persistCollection(STORAGE_KEYS.ratings, ratings);
  persistCollection(STORAGE_KEYS.supportTickets, supportTickets);
  writeStorageValue(STORAGE_KEYS.theme, normalizeTheme(readJSON(STORAGE_KEYS.theme, readJSON(LEGACY_STORAGE_KEYS.theme[0], DEFAULT_THEME))));
  syncCurrentUserSession(users);

  return {
    users,
    requests,
    offers,
    ratings,
    supportTickets,
  };`;

const newBootstrap = `  const products = readCollection(STORAGE_KEYS.products, ['products', 'shopProducts', 'app_products'], [], normalizeProductList);

  persistCollection(STORAGE_KEYS.users, users);
  persistCollection(STORAGE_KEYS.requests, requests);
  persistCollection(STORAGE_KEYS.offers, offers);
  persistCollection(STORAGE_KEYS.ratings, ratings);
  persistCollection(STORAGE_KEYS.supportTickets, supportTickets);
  persistCollection(STORAGE_KEYS.products, products);
  writeStorageValue(STORAGE_KEYS.theme, normalizeTheme(readJSON(STORAGE_KEYS.theme, readJSON(LEGACY_STORAGE_KEYS.theme[0], DEFAULT_THEME))));
  syncCurrentUserSession(users);

  return {
    users,
    requests,
    offers,
    ratings,
    supportTickets,
    products,
  };`;

if (content.includes(oldBootstrap)) {
  content = content.replace(oldBootstrap, newBootstrap);
  console.log('Updated bootstrapStore');
} else {
  console.log('bootstrapStore pattern not found');
}

// 6. Добавляем публичные экспорты после getPendingShops
const getPendingShopsExport = `export function getPendingShops() {
  return getPendingShopsInternal();
}`;

const productExports = `export function getProducts() {
  return getProductsInternal();
}

export function getProduct(productOrId) {
  return getProductByIdInternal(productOrId);
}

export function getProductById(productOrId) {
  return getProductByIdInternal(productOrId);
}

export function createProduct(product = {}) {
  return createProductInternal(product);
}

export function saveProduct(product = {}) {
  return saveProductInternal(product);
}

export function updateProduct(productOrId, updates = {}) {
  return updateProductInternal(productOrId, updates);
}

export function deleteProduct(productOrId) {
  return deleteProductInternal(productOrId);
}

export function removeProduct(productOrId) {
  return deleteProductInternal(productOrId);
}

export function getProductsByShopId(shopOrId) {
  return getProductsByShopIdInternal(shopOrId);
}

export function useProducts() {
  return useStoreValue(() => getProductsInternal());
}`;

if (content.includes(getPendingShopsExport)) {
  content = content.replace(getPendingShopsExport, getPendingShopsExport + '\n\n' + productExports);
  console.log('Added product exports');
} else {
  console.log('getPendingShops export not found');
}

// 7. Добавляем в default export
const oldDefaultExport = `  getPendingShops,
  getAdminStats,`;

const newDefaultExport = `  getPendingShops,
  getProducts,
  getProduct,
  getProductById,
  createProduct,
  saveProduct,
  updateProduct,
  deleteProduct,
  removeProduct,
  getProductsByShopId,
  getAdminStats,`;

if (content.includes(oldDefaultExport)) {
  content = content.replace(oldDefaultExport, newDefaultExport);
  console.log('Updated default export');
} else {
  console.log('Default export pattern not found');
}

fs.writeFileSync(path, content, 'utf-8');
console.log('Done!');
