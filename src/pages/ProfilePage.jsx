import React, { useState, useEffect } from "react";
import styles from "../styles/ProfilePage.module.css";
import { useUser } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faEdit,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfilePage() {
  const navigator = useNavigate();
  const { user, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
  });
  console.log(user);
  console.log(formData.name);

  const [orders, setOrders] = useState([]); // Стан для замовлень
  const [reviewData, setReviewData] = useState({}); // Стан для відгуків
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || "",
        email: user.email || "",
      });
    }
  }, [user]);
  // Завантаження замовлень користувача
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/orders?userId=${user.uid}`)
        .then((response) => {
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ); // Сортування за датою у порядку спадання
          setOrders(sortedOrders);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
        });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    // Підготовка даних для оновлення
    const updatedData = {
      name: formData.name,
      email: formData.email,
    };
    try {
      // Здійснення PUT-запиту для оновлення користувача
      const response = await axios.put(
        `http://localhost:5000/user/${user.uid}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Перевірка структури відповіді
      if (response.data && response.data.user) {
        const updatedUser = response.data.user;
        // Оновлення контексту користувача
        updateUser(updatedUser);
        setIsEditing(false);
      } else {
        console.error("Unexpected response structure:", response.data);
        setUpdateError("Не вдалося оновити профіль. Спробуйте пізніше.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError(
        "Сталася помилка при оновленні профілю. Спробуйте пізніше."
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigator("/"); // Перенаправлення на головну сторінку після виходу
  };

  // Збереження відгуку
  const handleReviewSubmit = (orderId) => {
    const review = reviewData[orderId];
    if (!review) return;
    const userId = user.uid;

    axios
      .post("http://localhost:5000/add-review", {
        orderId,
        review,
        userId,
      })
      .then(() => {
        alert("Відгук успішно збережено!");
        setReviewData((prev) => ({ ...prev, [orderId]: "" }));
      })
      .catch((error) => {
        console.error("Error submitting review:", error);
      });
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1>Мій профіль</h1>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          {user ? (
            isEditing ? (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Ім'я:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Електронна пошта:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>
                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    Зберегти зміни
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setIsEditing(false)}
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <p>
                  <strong>Ім'я:</strong> {user.displayName}
                </p>
                <p>
                  <strong>Електронна пошта:</strong> {user.email}
                </p>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditing(true)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Редагувати профіль
                  </button>
                  <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Вийти з акаунту
                  </button>
                </div>
              </div>
            )
          ) : (
            <p>Ви не авторизовані. Будь ласка, увійдіть у свій акаунт.</p>
          )}
        </div>

        <div className={styles.ordersContainer}>
          <h2>Ваші замовлення</h2>
          {orders.length === 0 ? (
            <p>У вас ще немає замовлень.</p>
          ) : (
            <ul className={styles.ordersList}>
              {orders.map((order) => (
                <li key={order.id} className={styles.orderItem}>
                  <p>
                    <strong>Дата:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Сума:</strong> {order.total} ₴
                  </p>

                  <h3>Товари:</h3>
                  <ul className={styles.cartList}>
                    {order.items.map((item) => (
                      <li key={item.id} className={styles.cartItem}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={styles.image}
                        />
                        <div className={styles.details}>
                          <p className={styles.name}>{item.name}</p>
                          <p className={styles.price}>
                            {item.price} ₴ × {item.quantity}
                          </p>
                          <p className={styles.totalPrice}>
                            Разом: {item.price * item.quantity} ₴
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.reviewSection}>
                    <textarea
                      placeholder="Напишіть ваш відгук..."
                      value={reviewData[order.id] || ""}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                      className={styles.reviewInput}
                    />
                    <button
                      onClick={() => handleReviewSubmit(order.id)}
                      className={styles.reviewButton}
                    >
                      Надіслати відгук
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
