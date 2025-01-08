import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { UserProvider } from "./context/UserContext";
import AddPizzaPage from "./pages/AddPizzaPage";
import { CartProvider } from "./context/CartContext";
import ProfilePage from "./pages/ProfilePage";
import NewsPage from "./pages/NewsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
function App() {
  return (
    <CartProvider>
      <UserProvider>
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/add-pizza" element={<AddPizzaPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/edit-pizza/:id"
              element={<AddPizzaPage isEdit={true} />}
            />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </div>
      </UserProvider>
    </CartProvider>
  );
}

export default App;
