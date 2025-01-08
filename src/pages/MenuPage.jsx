import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/MenuPage.module.css";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [filteredPizzas, setFilteredPizzas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { addToCart } = useCart();
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const navigator = useNavigate();
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/items");
        setItems(response.data);
        setFilteredPizzas(response.data); // Set pizzas initially as all
      } catch (error) {
        console.error("Failed to fetch pizzas:", error);
      }
    };

    fetchPizzas();
  }, []);

  // Handle changes in search term
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle price range filter change
  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
  };
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filter pizzas based on search term, category, and price
  useEffect(() => {
    let filtered = [...items];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (pizza) =>
          pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((pizza) =>
        pizza.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-");
      filtered = filtered.filter((pizza) => {
        const pizzaPrice = pizza.price;
        if (minPrice && maxPrice) {
          return (
            pizzaPrice >= parseInt(minPrice) && pizzaPrice <= parseInt(maxPrice)
          );
        } else if (minPrice) {
          return pizzaPrice >= parseInt(minPrice);
        } else if (maxPrice) {
          return pizzaPrice <= parseInt(maxPrice);
        }
        return true;
      });
    }

    // Apply sorting
    if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.price - b.price; // Low to high
        } else if (sortOrder === "desc") {
          return b.price - a.price; // High to low
        }
        return 0;
      });
    }

    // Update filtered pizzas
    setFilteredPizzas(filtered);
  }, [items, searchTerm, categoryFilter, priceRange, sortOrder]);

  const handleAddPizza = () => {
    navigator("/add-pizza");
  };

  const handleEditPizza = (pizzaId) => {
    window.location.href = `/edit-pizza/${pizzaId}`;
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Меню</h1>

        {isAdmin && (
          <button onClick={handleAddPizza} className={styles.addPizzaButton}>
            + Додати нове
          </button>
        )}

        <div className={styles.filters}>
          {/* Search input */}
          <input
            type="text"
            placeholder="Пошук за назвою або описом"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className={styles.filterSelect}
          >
            <option value="">Виберіть категорію</option>
            <option value="pizza">Піца</option>
            <option value="salad">Салати</option>
            <option value="drinks">Напої</option>
          </select>

          <select
            className={styles.filterSelect}
            value={sortOrder}
            onChange={handleSortChange}
            placeholder="Сортувати"
          >
            <option value="">Сортувати за датою додавання</option>
            <option value="asc">Сортувати за ціною: за зростанням</option>
            <option value="desc">Сортувати за ціною: за спаданням</option>
          </select>
        </div>

        <div className={styles.pizzaList}>
          {filteredPizzas.map((pizza) => (
            <div key={pizza.id} className={styles.pizzaCard}>
              <img
                src={pizza.imageUrl}
                alt={pizza.name}
                className={styles.pizzaImage}
              />
              <h3 className={styles.pizzaName}>{pizza.name}</h3>
              <p className={styles.pizzaDescription}>{pizza.description}</p>
              <p className={styles.pizzaPrice}>{pizza.price} грн</p>
              <div className={styles.buttons}>
                <button
                  onClick={() => addToCart(pizza)}
                  className={styles.addButton}
                >
                  Додати в кошик
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleEditPizza(pizza.id)}
                    className={styles.editButton}
                  >
                    ✎ Редагувати
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
