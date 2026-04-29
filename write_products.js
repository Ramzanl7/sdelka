const fs = require('fs');

const content = `import { useState } from 'react';
import { getProducts, getCurrentUser, createProduct, updateProduct, deleteProduct } from '../data/siteStore';
import { escapeHtml } from '../utils/security';

export default function ProductsPage({ navigate }) {
  const user = getCurrentUser();
  const allProducts = getProducts();
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  const isShop = user?.role === 'shop';
  const isAdmin = user?.role === 'admin';

  const filteredProducts = allProducts.filter((p) => {
    const search = filter.toLowerCase();
    return (
      !search ||
      p.name?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price) || 0,
      category: formData.category.trim(),
      stock: Number(formData.stock) || 0,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      createProduct(payload);
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: '', stock: '' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      category: product.category || '',
      stock: String(product.stock || ''),
    });
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Удалить товар?')) {
      deleteProduct(productId);
    }
  };

  return (
    <section className="page-stack">
      <div className="panel panel--hero">
        <h2 className="page-title">Каталог товаров</h2>
        <p className="page-copy">Просмотр и управление товарами магазинов.</p>
      </div>

      <div className="panel">
        <div className="search-bar" style={{ marginBottom: '1rem' }}>
          <input
            type="search"
            className="field__input"
            placeholder="Поиск товаров..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {(isShop || isAdmin) && (
          <div className="button-row" style={{ marginBottom: '1rem' }}>
            <button className="button button--primary" onClick={() => { setShowForm(!showForm); setEditingProduct(null); }}>
              {showForm ? 'Отмена' : 'Добавить товар'}
            </button>
          </div>
        )}

        {showForm && (
          <div className="form-stack" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface-elevated)', borderRadius: '8px' }}>
            <h4>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h4>
            <label className="field">
              <span className="field__label">Название</span>
              <input className="field__input" type="text" name="name" value={formData.name} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Описание</span>
              <textarea className="field__input field__input--textarea" name="description" rows="2" value={formData.description} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Цена</span>
              <input className="field__input" type="number" name="price" value={formData.price} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Категория</span>
              <input className="field__input" type="text" name="category" value={formData.category} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Количество</span>
              <input className="field__input" type="number" name="stock" value={formData.stock} onChange={handleChange} />
            </label>
            <div className="button-row">
              <button className="button button--primary" onClick={handleSubmit}>
                {editingProduct ? 'Сохранить' : 'Создать'}
              </button>
              <button className="button button--ghost" onClick={() => setShowForm(false)}>
                Отмена
              </button>
            </div>
        )}

        <div className="products-grid" style={{ display: 'grid', gap: '1rem' }}>
          {filteredProducts.length === 0 ? (
            <p className="page-copy">Товары не найдены.</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>{escapeHtml(product.name)}</h4>
                    <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)' }}>
                      {escapeHtml(product.description)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>{product.price} USD</strong> · {escapeHtml(product.category)} · В наличии: {product.stock}
                    </p>
                  </div>
                  {(isShop || isAdmin) && (
                    <div className="button-row" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                      <button className="button button--ghost" onClick={() => handleEdit(product)}>
                        Изменить
                      </button>
                      <button className="button button--ghost" onClick={() => handleDelete(product.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
            ))
          )}
        </div>
    </section>
  );
}`;

fs.writeFileSync('c:/Users/administrator/Desktop/www/src/pages/ProductsPage.jsx', content, 'utf-8');
console.log('ProductsPage written successfully');
