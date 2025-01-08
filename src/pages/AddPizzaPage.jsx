import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/AddPizzaPage.module.css";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";

export default function AddPizzaPage({ isEdit = false }) {
  const { id } = useParams(); // Отримуємо ID піци для редагування (якщо є)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Завантаження даних піци, якщо редагування
  useEffect(() => {
    if (isEdit && id) {
      const fetchItems = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/item/${id}`);
          setFormData(response.data); // Завантажуємо дані в форму
        } catch (err) {
          setError("Не вдалося завантажити дані.");
        }
      };

      fetchItems();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Редагування піци
        await axios.put(`http://localhost:5000/item/${id}`, formData);
        setSuccess("Піцу успішно оновлено!");
      } else {
        // Додавання нової піци
        await axios.post("http://localhost:5000/add-item", formData);
        setSuccess("Піцу успішно додано!");
        setFormData({
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          category: "",
        });
      }
      setTimeout(() => navigate("/menu"), 2000); // Перенаправлення до меню через 2 секунди
    } catch (err) {
      setError(
        isEdit
          ? "Не вдалося оновити. Будь ласка, спробуйте ще раз."
          : "Не вдалося додати. Будь ласка, спробуйте ще раз."
      );
    }
  };

  const handleDelete = async () => {
    try {
      // Відправка запиту на видалення піци за її ID
      await axios.delete(`http://localhost:5000/item/${id}`);

      // Виведення повідомлення про успіх
      setSuccess("Товар успішно видалено!");

      // Перенаправлення до меню після 2 секунд
      setTimeout(() => navigate("/menu"), 2000);
    } catch (err) {
      setError("Не вдалося видалити. Будь ласка, спробуйте ще раз.");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.formContainer}>
        <h2 className={styles.title}>
          {isEdit ? "Редагувати" : "Додати новий товар"}
        </h2>
        {success && <p className={styles.successMessage}>{success}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Назва:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            Опис:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              required
            />
          </label>
          <label className={styles.label}>
            Ціна (₴):
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            URL зображення:
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Категорія:
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Виберіть категорію</option>
              <option value="pizza">Піца</option>
              <option value="salad">Салати</option>
              <option value="drinks">Напої</option>
            </select>
          </label>
          <button type="submit" className={styles.button}>
            {isEdit ? "Оновити" : "Додати"}
          </button>
          {isEdit && (
            <button className={styles.button} onClick={handleDelete}>
              Видалити
            </button>
          )}
        </form>
      </div>
    </>
  );
}
