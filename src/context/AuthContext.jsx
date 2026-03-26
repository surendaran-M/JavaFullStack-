import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  });
  const loading = false;
  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("guestId");
    setUser(null);
    navigate("/login");
  };

  const isBuyer = user?.role === "buyer";
  const isSeller = user?.role === "seller";

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: login, 
      logout, 
      loading, 
      isBuyer, 
      isSeller 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
