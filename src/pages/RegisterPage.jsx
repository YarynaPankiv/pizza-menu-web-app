import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import styles from "../styles/RegisterPage.module.css";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigator = useNavigate();

  const { login } = useUser();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", {
        email,
        password,
        name,
        role: "client",
      });

      setSuccess("User registered successfully!");
      console.log("User registered:", response.data);

      login(response.data.user);
      navigator("/");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
      console.error("Registration failed:", err.response?.data);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.form}>
        <h2 className={styles.title}>Зареєструватись</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Електронна адреса"
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
          Зареєструватись
        </button>
      </form>
    </div>
  );
}
