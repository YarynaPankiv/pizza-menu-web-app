import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "../styles/HomePage.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [reviews, setReviews] = useState([]); // State for reviews
  const navigator = useNavigate();

  useEffect(() => {
    // Fetch reviews from the backend
    axios
      .get("http://localhost:5000/reviews") // Adjust the endpoint as per your backend
      .then((response) => {
        setReviews(response.data.reviews); // Assuming the server responds with a `reviews` array
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      });
  }, []);

  const handleClick = () => {
    navigator("/menu");
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>Найкраща піца у вашому місті.</h1>
          <p className={styles.subtitle}>Спробуй!</p>
          <button className={styles.menu_button} onClick={handleClick}>
            Переглянути меню
          </button>
        </div>
      </div>
      <div className={styles.infoText}>
        <img src="pizza.png" className={styles.pizzaImage}></img>
        <p>
          Не втрачайте можливість скуштувати нашу унікальну піцу, приготовану з
          найкращих інгредієнтів. Вибирайте свою улюблену піцу та насолоджуйтеся
          неперевершеним смаком!
        </p>
      </div>
      <div className={styles.reviewSection}>
        <h2 className={styles.reviewTitle}>Що кажуть клієнти:</h2>
        <div className={styles.reviewLine}></div>
        {reviews.length > 0 ? (
          <div className={styles.scrollContainer}>
            {reviews.map((review, index) => (
              <div key={index} className={styles.reviewCard}>
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>
                    {review.user?.name || "Анонімний користувач"}
                  </h3>
                </div>
                <p className={styles.reviewText}>{review.review}</p>
                <p className={styles.reviewDate}>
                  {new Date(review.reviewCreatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>
            Немає відгуків. Будьте першим, хто залишить відгук!
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}
