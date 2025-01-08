import React, { useState } from "react";
import styles from "../styles/CartDropdown.module.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, total, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { user } = useUser();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className={styles.cartContainer}>
      <button onClick={toggleDropdown} className={styles.cartButton}>
        🛒 Кошик ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {cartItems.length === 0 ? (
            <p className={styles.empty}>Кошик порожній</p>
          ) : (
            <>
              <ul className={styles.cartList}>
                {cartItems.map((item) => (
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
                    </div>
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className={styles.quantityButton}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className={styles.removeButton}
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.total}>
                <p>Загалом: {total} ₴</p>
              </div>
              <button
                onClick={handleCheckout}
                className={styles.checkoutButton}
              >
                Оформити замовлення
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
