import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";
import axios from "axios";
import { useUser } from "../context/UserContext"; // Імпорт useUser

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useUser(); // Виклик функції login з контексту

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);

      // Збереження користувача в контексті
      login(response.data.user);

      // Перенаправлення до сторінки профілю
      navigate("/menu");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Користувач не знайдений");
      } else {
        setError(
          err.response?.data?.error || "Сталася помилка. Спробуйте ще раз"
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Вхід</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <input
            type="email"
            placeholder="Електронна пошта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Увійти
          </button>
        </form>
        <p className={styles.registerLink}>
          Ще не маєте акаунту? <a href="/register">Зареєструйтесь</a>
        </p>
      </div>
    </div>
  );
}
