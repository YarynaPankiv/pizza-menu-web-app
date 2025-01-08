import { Link } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPizzaSlice,
  faShoppingCart,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext";
import CartDropdown from "./CartDropdown";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <div className={styles.container}>
      {/* Ліва частина: Логотип */}
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink}>
          <FontAwesomeIcon icon={faPizzaSlice} className={styles.logoIcon} />
        </Link>
      </div>

      {/* Центральна частина: Навігаційні посилання */}
      <div className={styles.linksContainer}>
        <Link to="/" className={styles.link}>
          <p className={styles.titles}>Головна</p>
        </Link>
        <Link to="/menu" className={styles.link}>
          <p className={styles.titles}>Меню</p>
        </Link>
        <Link to="/news" className={styles.link}>
          <p className={styles.titles}>Новини</p>
        </Link>
        <Link to="/about" className={styles.link}>
          <p className={styles.titles}>Про нас</p>
        </Link>
        <CartDropdown />
      </div>
      {user && user.role === "admin" && (
        <Link to="/orders" className={styles.link}>
          <p className={styles.titles}>Всі замовлення</p>
        </Link>
      )}

      {/* Права частина: Дії користувача */}
      {user ? (
        <div className={styles.userContainer}>
          <Link to="/profile" className={`${styles.link} ${styles.userIcon}`}>
            <FontAwesomeIcon icon={faUserCircle} />{" "}
            {user.dispalyName || "Мій акаунт"}
          </Link>
        </div>
      ) : (
        <div className={styles.userContainer}>
          <Link to="/login" className={`${styles.link} ${styles.button}`}>
            Вхід
          </Link>
          <Link to="/register" className={`${styles.link} ${styles.button}`}>
            Реєстрація
          </Link>
        </div>
      )}
    </div>
  );
}
