import React, { useState, useEffect } from "react";
import styles from "../styles/CheckoutPage.module.css";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext"; // Імпортуємо useUser
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart(); // Отримуємо товари з кошика
  const { user } = useUser(); // Отримуємо дані користувача з контексту
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // Заповнюємо поля ім'я та електронної пошти з контексту
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-order`,
        {
          userId: user.uid, // або з контексту користувача
          items: cartItems,
          total,
          contactInfo: formData,
        }
      );

      console.log("Order response:", response.data);
      clearCart(); // Очищення кошика
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        {orderSuccess ? (
          <div className={styles.successMessage}>
            <h2>Дякуємо за ваше замовлення!</h2>
            <p>
              Ваше замовлення обробляється. Найближчим часом з вами зв'яжуться.
            </p>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Оформлення замовлення</h1>
            <div className={styles.cartSummary}>
              <h2>Ваше замовлення</h2>
              <ul className={styles.cartList}>
                {cartItems.map((item) => (
                  <li key={item.id} className={styles.cartItem}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={styles.image}
                    />
                    <div className={styles.details}>
                      <p className={styles.itemName}>
                        {item.name} × {item.quantity}
                      </p>
                      <p className={styles.itemDescription}>
                        <strong>Опис:</strong> {item.description}
                      </p>
                      <p className={styles.itemCategory}>
                        <strong>Категорія:</strong> {item.category}
                      </p>
                      <p className={styles.itemPrice}>
                        Сума: {item.price * item.quantity} ₴
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles.total}>
                <p>Загальна сума: {total} ₴</p>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className={styles.form}>
              <h2>Контактна інформація</h2>
              <label>
                Ім'я:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Електронна пошта:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Телефон:
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Адреса доставки:
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className={styles.textarea}
                ></textarea>
              </label>
              <button type="submit" className={styles.submitButton}>
                Підтвердити замовлення
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
