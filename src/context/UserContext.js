import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Метод для оновлення користувача
  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
    console.log("context", updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, login, logout, updateUser: updateUserInContext }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Кастомний хук для використання контексту користувача
export const useUser = () => useContext(UserContext);
