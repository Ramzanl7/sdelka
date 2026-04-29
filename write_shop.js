const fs = require('fs');

const content = `import { useState } from 'react';
import { getUsers, getProducts, getCurrentUser, getRequests, createOffer } from '../data/siteStore';
import { escapeHtml } from '../utils/security';

export default function ShopPage({ navigate }) {
  const user = getCurrentUser();
  const shops = getUsers().filter((u) => u.role === 'shop');
  const allProducts = getProducts();
  const allRequests = getRequests();
  const [selectedShop, setSelectedShop] = useState(null);
  const [offerForm, setOfferForm] = useState({ requestId: '', price: '', message: '' });

  const handleCreateOffer = () => {
    if (!offerForm.requestId || !offerForm.price) return;
    createOffer({
      requestId: offerForm.requestId,
      price: Number(offerForm.price),
      note: offerForm.message.trim(),
    });
    setOfferForm({ requestId: '', price: '', message: '' });
    alert('Отклик отправлен!');
  };

  if (selectedShop) {
    const shopProducts = allProducts.filter((p) => p.shopId === selectedShop.id);
    const openRequests = allRequests.filter((r) => r.status === 'open' || r.status === 'new');

    return (
      <section className="page-stack">
        <div className="panel panel--hero">
          <button className="button button--ghost" onClick={() => setSelectedShop(null)} style={{ marginBottom: '1rem' }}>
            ← Назад к списку
          </button>
          <h2 className="page-title">{escapeHtml(selectedShop.name)}</h2>
          <p className="page-copy">
            {escapeHtml(selectedShop.city || 'Город не указан')} · Рейтинг: {selectedShop.rating?.average?.toFixed(1) || '0.0'} / 5
          </p>
        </div>

        <div className="panel">
          <h3>Товары магазина</h3>
          {shopProducts.length === 0 ? (
            <p className="page-copy">У этого магазина пока нет товаров.</p>
          ) : (
            <div className="products-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {shopProducts.map((product) => (
                <div key={product.id} className="panel" style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem' }}>{escapeHtml(product.name)}</h4>
                  <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)' }}>{escapeHtml(product.description)}</p>
                  <p style={{ margin: 0 }}>
                    <strong>{product.price} USD</strong> · {escapeHtml(product.category)} · В наличии: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'shop' && user?.id === selectedShop.id && (
          <div className="panel">
            <h3>Откликнуться на заявку</h3>
            <div className="form-stack" style={{ marginTop: '1rem' }}>
              <label className="field">
                <span className="field__label">Заявка</span>
                <select
                  className="field__input"
                  value={offerForm.requestId}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, requestId: e.target.value }))}
                >
                  <option value="">Выберите заявку</option>
                  {openRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {escapeHtml(r.title)} ({r.budget ? r.budget + ' USD' : 'бюджет не указан'})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Цена предложения</span>
                <input
                  className="field__input"
                  type="number"
                  value={offerForm.price}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field__label">Сообщение</span>
                <textarea
                  className="field__input field__input--textarea"
                  rows="2"
                  value={offerForm.message}
                  onChange={(e) => setOfferForm((prev) => ({ ...prev, message: e.target.value }))}
                />
              </label>
              <button className="button button--primary" onClick={handleCreateOffer}>
                Отправить отклик
              </button>
            </div>
        )}
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="panel panel--hero">
        <h2 className="page-title">Магазины</h2>
        <p className="page-copy">Каталог подтвержденных магазинов платформы.</p>
      </div>

      <div className="panel">
        {shops.length === 0 ? (
          <p className="page-copy">Магазины не найдены.</p>
        ) : (
          <div className="shops-grid" style={{ display: 'grid', gap: '1rem' }}>
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="panel"
                style={{ padding: '1rem', cursor: 'pointer' }}
                onClick={() => setSelectedShop(shop)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem' }}>{escapeHtml(shop.name)}</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                      {escapeHtml(shop.city || 'Город не указан')} · Рейтинг: {shop.rating?.average?.toFixed(1) || '0.0'} / 5
                    </p>
                  </div>
                  <button className="button button--primary">Перейти</button>
                </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}`;

fs.writeFileSync('c:/Users/administrator/Desktop/www/src/pages/ShopPage.jsx', content, 'utf-8');
console.log('ShopPage written successfully');
