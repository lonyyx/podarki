import React, { useState } from "react";
import PropTypes from "prop-types";

const GiftList = ({ gifts, onUpdateCount }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleSelectGift = async (gift) => {
    // Проверяем, не выбран ли уже подарок
    if (gift.is_selected) {
      alert(
        "❌ Этот подарок уже был выбран другим пользователем и заблокирован для дальнейшего выбора!"
      );
      return;
    }

    // Подтверждение выбора
    if (
      !window.confirm(
        `Вы уверены, что хотите выбрать "${gift.name}"? Этот выбор будет окончательным!`
      )
    ) {
      return;
    }

    setUpdatingId(gift.id);

    const success = await onUpdateCount(gift.id, gift.count);

    if (success) {
      // Показываем успешное сообщение
      alert(
        `🎉 Поздравляем! Вы выбрали "${gift.name}"! Этот подарок теперь заблокирован для других пользователей.`
      );

      // Анимация успешного выбора
      setTimeout(() => setUpdatingId(null), 500);
    } else {
      setUpdatingId(null);
      alert("⚠️ Произошла ошибка при выборе подарка. Попробуйте еще раз.");
    }
  };

  // Функция для получения цвета в зависимости от статуса
  const getStatusColor = (gift) => {
    if (gift.is_selected) return "#e63946"; // Красный для выбранных
    if (gift.count >= 10) return "#2a9d8f"; // Зеленый для популярных
    if (gift.count >= 5) return "#e9c46a"; // Желтый для средних
    return "#a8dadc"; // Голубой для остальных
  };

  // Функция для текста статуса
  const getStatusText = (gift) => {
    if (gift.is_selected) {
      return "Выбран";
    }
    return "Доступен";
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="gifts-container">
      {gifts.map((gift) => {
        const isUpdating = updatingId === gift.id;
        const isSelected = gift.is_selected;

        return (
          <div
            key={gift.id}
            className={`gift-card ${isSelected ? "selected" : ""}`}
          >
            <div className="gift-image-container">
              <img
                src={gift.image_url}
                alt={gift.name}
                className="gift-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x300/FFB6C1/333333?text=${encodeURIComponent(
                    gift.name
                  )}`;
                }}
              />
              <div
                className="status-badge"
                style={{
                  backgroundColor: getStatusColor(gift),
                  background: isSelected
                    ? "linear-gradient(135deg, #e63946 0%, #c1121f 100%)"
                    : "linear-gradient(135deg, #2a9d8f 0%, #1d7873 100%)",
                }}
              >
                <i className={isSelected ? "fas fa-lock" : "fas fa-unlock"}></i>
                {getStatusText(gift)}
              </div>
            </div>

            <div className="gift-content">
              <h3 className="gift-title">{gift.name}</h3>
              <p className="gift-description">{gift.description}</p>

              <div className="gift-info">
                <div className="gift-stats">
                  <div className="stat">
                    <i
                      className="fas fa-heart"
                      style={{ color: getStatusColor(gift) }}
                    ></i>
                    <span>
                      Выбрано раз: <strong>{gift.count}</strong>
                    </span>
                  </div>

                  {gift.is_selected && gift.selected_at && (
                    <div className="stat">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Дата выбора: {formatDate(gift.selected_at)}</span>
                    </div>
                  )}

                  <div className="stat">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Статус:{" "}
                      <strong>
                        {isSelected ? "Заблокирован" : "Доступен"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="gift-footer">
                <div
                  className="counter"
                  style={{ color: getStatusColor(gift) }}
                >
                  <i className="fas fa-gift"></i>
                  <span>{gift.count}</span>
                  <span style={{ fontSize: "1rem", marginLeft: "5px" }}>
                    {gift.count === 1 ? "раз" : gift.count < 5 ? "раза" : "раз"}
                  </span>
                </div>

                <button
                  className={`select-btn ${isSelected ? "disabled" : ""} ${
                    isUpdating ? "updating" : ""
                  }`}
                  onClick={() => handleSelectGift(gift)}
                  disabled={isUpdating || isSelected}
                  aria-label={
                    isSelected ? "Подарок уже выбран" : `Выбрать ${gift.name}`
                  }
                  title={
                    isSelected
                      ? "Этот подарок уже выбран"
                      : "Выбрать этот подарок"
                  }
                >
                  {isUpdating ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : isSelected ? (
                    <i className="fas fa-lock"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                </button>
              </div>

              {isSelected ? (
                <div className="selection-message locked">
                  <i className="fas fa-ban"></i>
                  <div>
                    <strong>Этот подарок уже выбран</strong>
                    <br />
                    <small>
                      Дальнейший выбор заблокирован для всех пользователей
                    </small>
                  </div>
                </div>
              ) : gift.count > 0 ? (
                <div className="selection-message available">
                  <i className="fas fa-users"></i>
                  <span>
                    Этот подарок выбирали {gift.count}{" "}
                    {gift.count === 1 ? "раз" : "раза"}
                  </span>
                </div>
              ) : (
                <div className="selection-message available">
                  <i className="fas fa-star"></i>
                  <span>Этот подарок еще никто не выбирал! Будьте первым!</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

GiftList.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      image_url: PropTypes.string,
      count: PropTypes.number.isRequired,
      is_selected: PropTypes.bool,
      selected_at: PropTypes.string,
    })
  ).isRequired,
  onUpdateCount: PropTypes.func.isRequired,
};

export default GiftList;
