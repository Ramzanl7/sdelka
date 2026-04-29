import React from "react";

function Profile({role, user}) {
  return (
    <div className="profile">
      <h2>{user.name}</h2>
      {role === 'client' && (
        <>
          <p><strong>Роль:</strong>Клиент</p>
          <p><strong>Рейтинг:</strong>{user.rating}</p>
          <p><strong>Отзывы:</strong>{user.reviews.join(', ')}</p>
        </>
      )}
      {role === 'master' && (
        <>
          <p><strong>Роль:</strong>Мастер</p>
          <p><strong>Рейтинг:</strong>{user.rating}</p>
          <p><strong>Отзывы:</strong>{user.reviews.join(', ')}</p>
          <p><strong>Навыки:</strong>{user.skills.join(', ')}</p>
        </>
      )}
      {role === 'shop' && (
        <>
          <p><strong>Роль:</strong>Магазин</p>
          <p><strong>Рейтинг:</strong>{user.rating}</p>
          <p><strong>Отзывы:</strong>{user.reviews.join(', ')}</p>
          <p><strong>Адрес:</strong>{user.adress}</p>
        </>
      )}
      <img src={user.photoUrl} alt="Фото пользователя" />
    </div>
  );
}

export default Profile;