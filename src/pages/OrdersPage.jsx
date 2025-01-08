// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/OrdersPage.module.css";
import Header from "../components/Header";
import { useUser } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function OrdersPage() {
  const { user } = useUser(); // Отримуємо користувача з контексту
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // Для індикації завантаження при оновленні

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user || !user.uid) {
          throw new Error("User is not authenticated.");
        }

        console.log("Отправка userId:", user.uid);
        const response = await axios.get("http://localhost:5000/all-orders", {
          headers: {
            userId: user.uid, // Передаємо userId у заголовках
          },
        });
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Помилка при завантаженні замовлень."
        );
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchOrders();
    } else if (user) {
      setError("У вас немає доступу до цієї сторінки.");
      setLoading(false);
    } else {
      setError("Користувач не залогінений.");
      setLoading(false);
    }
  }, [user]);

  // Функція для оновлення статусу замовлення
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId); // Початок оновлення

      await axios.put(
        `http://localhost:5000/order/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            userId: user.uid,
          },
        }
      );

      // Оновлення локального стану без перезавантаження сторінки
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setUpdatingOrderId(null); // Завершення оновлення
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.message ||
          "Помилка при оновленні статусу замовлення."
      );
      setUpdatingOrderId(null); // Завершення оновлення
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <p className={styles.loading}>Завантаження замовлень...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>Всі Замовлення</h2>
        {orders.length === 0 ? (
          <p>Немає замовлень.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Замовлення</th>
                <th>Користувач</th>
                <th>Товари</th>
                <th>Сума</th>
                <th>Контактна Інформація</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th> {/* Додано колонку для дій */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userId}</td>
                  <td>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{order.total} ₴</td>
                  <td>
                    <p>Ім'я: {order.contactInfo.name}</p>
                    <p>Телефон: {order.contactInfo.phone}</p>
                    <p>Адреса: {order.contactInfo.address}</p>
                  </td>
                  <td>
                    <div className={`${styles.status} ${styles[order.status]}`}>
                      {order.status === "pending" && (
                        <FontAwesomeIcon
                          icon={faClock}
                          className={styles.icon}
                        />
                      )}
                      {order.status === "completed" && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className={styles.icon}
                        />
                      )}
                      {order.status === "canceled" && (
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className={styles.icon}
                        />
                      )}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    {/* Додамо випадаючий список для зміни статусу */}
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      disabled={updatingOrderId === order.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                    {updatingOrderId === order.id && (
                      <FontAwesomeIcon
                        icon={faSyncAlt}
                        spin
                        className={styles.loadingIcon}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
