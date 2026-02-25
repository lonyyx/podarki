import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import GiftList from "./components/GiftList";
import "./App.css";

// Инициализация Supabase клиента
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка подарков из Supabase
  const fetchGifts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gifts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching gifts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Обновление счетчика подарка
  const updateGiftCount = async (giftId, currentCount) => {
    try {
      const newCount = currentCount + 1;

      const { error } = await supabase
        .from("gifts")
        .update({
          count: newCount,
          is_selected: true,
          selected_at: new Date().toISOString(),
        })
        .eq("id", giftId);

      if (error) throw error;

      // Обновляем локальное состояние
      setGifts((prevGifts) =>
        prevGifts.map((gift) =>
          gift.id === giftId
            ? {
                ...gift,
                count: newCount,
                is_selected: true,
                selected_at: new Date().toISOString(),
              }
            : gift
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating gift count:", err);
      setError(err.message);
      return false;
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchGifts();

    // Подписка на изменения в реальном времени
    const subscription = supabase
      .channel("gifts-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gifts" },
        () => fetchGifts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Статистика
  const stats = gifts.reduce(
    (acc, gift) => {
      acc.total++;
      if (gift.is_selected) {
        acc.selected++;
      } else {
        acc.available++;
      }
      return acc;
    },
    { total: 0, selected: 0, available: 0 }
  );

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🎁 Выбор подарков на День Рождения</h1>
          <p className="subtitle">
            Выберите понравившийся подарок. Каждый подарок можно выбрать только
            один раз!
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              Загрузка подарков...
            </div>
          ) : error ? (
            <div className="error">
              <i className="fas fa-exclamation-triangle"></i>
              Ошибка: {error}
              <button onClick={fetchGifts} className="retry-btn">
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <div className="global-stats">
                <div className="stat-card total">
                  <h3>Всего подарков</h3>
                  <div className="number">{stats.total}</div>
                </div>
                <div className="stat-card available">
                  <h3>Доступно для выбора</h3>
                  <div className="number">{stats.available}</div>
                </div>
                <div className="stat-card selected">
                  <h3>Заблокировано</h3>
                  <div className="number">{stats.selected}</div>
                </div>
                <div className="stat-card">
                  <h3>Всего выборов</h3>
                  <div className="number">
                    {gifts.reduce((sum, g) => sum + g.count, 0)}
                  </div>
                </div>
              </div>

              <GiftList gifts={gifts} onUpdateCount={updateGiftCount} />

              <div className="instructions">
                <h3>
                  <i className="fas fa-info-circle"></i> Как это работает:
                </h3>
                <div className="instructions-grid">
                  <div className="instruction-item">
                    <div className="instruction-icon available">
                      <i className="fas fa-unlock"></i>
                    </div>
                    <div className="instruction-text">
                      <h4>Доступные подарки</h4>
                      <p>Можно выбрать, нажав на кнопку с галочкой</p>
                    </div>
                  </div>

                  <div className="instruction-item">
                    <div className="instruction-icon locked">
                      <i className="fas fa-lock"></i>
                    </div>
                    <div className="instruction-text">
                      <h4>Заблокированные подарки</h4>
                      <p>Уже выбраны другим пользователем</p>
                    </div>
                  </div>

                  <div className="instruction-item">
                    <div className="instruction-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="instruction-text">
                      <h4>Один выбор</h4>
                      <p>Каждый подарок можно выбрать только один раз</p>
                    </div>
                  </div>

                  <div className="instruction-item">
                    <div className="instruction-icon">
                      <i className="fas fa-sync-alt"></i>
                    </div>
                    <div className="instruction-text">
                      <h4>Обновления в реальном времени</h4>
                      <p>Видите выборы других пользователей сразу</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>Создано с ❤️ для выбора лучших подарков на день рождения</p>
          <p className="tech-stack">
            <i className="fas fa-code"></i> Технологии: React • Supabase • CSS
          </p>
          <p className="copyright">
            {new Date().getFullYear()} © lopuh. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
