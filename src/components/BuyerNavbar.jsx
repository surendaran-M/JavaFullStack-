import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, User, Home, Search, Heart, LogOut, Menu, X, Bell } from "lucide-react";

function BuyerNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      if (!user) return;
      const cartKey = `cart_${user.id}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalItems);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/buyer/dashboard", label: "Home", icon: <Home size={20} /> },
    { path: "/buyer/browse", label: "Browse", icon: <Search size={20} /> },
    { path: "/buyer/wishlist", label: "Wishlist", icon: <Heart size={20} /> },
    { path: "/buyer/orders", label: "Orders", icon: <ShoppingBag size={20} /> },
    { path: "/buyer/profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <nav className="navbar buyer-navbar">
      <div className="nav-container">
        <Link to="/buyer/dashboard" className="brand">
          <ShoppingBag size={28} />
          <span className="brand-text">FireHorse Books</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Link to="/buyer/cart" className="nav-link cart-link">
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <span className="user-name">{user?.name || "User"}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Link 
            to="/buyer/cart" 
            className="mobile-nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          <div className="mobile-user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <span>{user?.name || user?.email}</span>
          </div>
          
          <button onClick={handleLogout} className="mobile-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default BuyerNavbar;