const fs = require('fs');

const content = `import { useState } from 'react';
import { getCurrentUser, updateUser, logout } from '../data/siteStore';
import { escapeHtml } from '../utils/security';

export default function ProfilePage({ navigate }) {
  const user = getCurrentUser();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <section className="page-stack">
        <div className="panel panel--hero">
          <h2 className="page-title">Требуется авторизация</h2>
          <p className="page-copy">Войдите в систему, чтобы просмотреть профиль.</p>
          <button className="button button--primary" onClick={() => navigate('/login')}>
            Войти
          </button>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const result = updateUser(user.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      bio: formData.bio.trim(),
      avatar: formData.avatar.trim(),
    });
    if (result) {
      setMessage('Профиль обновлен.');
      setEditMode(false);
    } else {
      setMessage('Ошибка при обновлении профиля.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  const roleLabel = {
    client: 'Клиент',
    master: 'Мастер',
    shop: 'Магазин',
    admin: 'Администратор',
    pending_verification: 'Магазин (ожидает подтверждения)',
  }[user.role] || user.role;

  return (
    <section className="page-stack">
      <div className="panel panel--hero">
        <h2 className="page-title">Личный кабинет</h2>
        <p className="page-copy">Управление вашим профилем и настройками.</p>
      </div>

      <div className="panel">
        {message && (
          <div className="alert alert--info" style={{ marginBottom: '1rem' }}>
            {escapeHtml(message)}
          </div>
        )}

        <div className="profile-header" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div
            className="avatar"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: user.avatar ? \`url(\${escapeHtml(user.avatar)}) center/cover\` : 'var(--color-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '2px solid var(--color-border)',
            }}
          >
            {!user.avatar && (user.name?.[0] || '?')}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{escapeHtml(user.name)}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>
              {escapeHtml(roleLabel)} · Рейтинг: {user.rating?.average?.toFixed(1) || '0.0'} / 5
            </p>
          </div>

        {editMode ? (
          <div className="form-stack">
            <label className="field">
              <span className="field__label">Имя</span>
              <input className="field__input" type="text" name="name" value={formData.name} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input className="field__input" type="email" name="email" value={formData.email} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Телефон</span>
              <input className="field__input" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">Город</span>
              <input className="field__input" type="text" name="city" value={formData.city} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">О себе</span>
              <textarea className="field__input field__input--textarea" name="bio" rows="3" value={formData.bio} onChange={handleChange} />
            </label>
            <label className="field">
              <span className="field__label">URL аватара</span>
              <input className="field__input" type="url" name="avatar" value={formData.avatar} onChange={handleChange} />
            </label>
            <div className="button-row">
              <button className="button button--primary" onClick={handleSave}>
                Сохранить
              </button>
              <button className="button button--ghost" onClick={() => setEditMode(false)}>
                Отмена
              </button>
            </div>
        ) : (
          <div className="profile-info">
            <div className="info-grid" style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div><strong>Email:</strong> {escapeHtml(user.email) || '—'}</div>
              <div><strong>Телефон:</strong> {escapeHtml(user.phone) || '—'}</div>
              <div><strong>Город:</strong> {escapeHtml(user.city) || '—'}</div>
              <div><strong>О себе:</strong> {escapeHtml(user.bio) || '—'}</div>
              <div><strong>Дата регистрации:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}</div>
            <div className="button-row">
              <button className="button button--primary" onClick={() => setEditMode(true)}>
                Редактировать профиль
              </button>
              <button className="button button--ghost" onClick={handleLogout}>
                Выйти
              </button>
            </div>
        )}
      </div>
    </section>
  );
}`;

fs.writeFileSync('c:/Users/administrator/Desktop/www/src/pages/ProfilePage.jsx', content, 'utf-8');
console.log('ProfilePage written successfully');
