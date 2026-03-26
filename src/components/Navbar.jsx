import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/Navbar.css';
import { 
  ShoppingBag, 
  User, 
  Home, 
  Search, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  ChevronDown,
  ShoppingCart,
  Store,
  PlusCircle,
  TrendingUp
} from "lucide-react";

function Navbar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get cart count
  useEffect(() => {
    const updateCartCount = () => {
      const userId = user?.id || sessionStorage.getItem('guestId') || '';
      if (!userId) {
        setCartCount(0);
        return;
      }
      
      const cartKey = `cart_${userId}`;
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
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setUser(null);
    setIsUserDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isSeller = user?.role === "seller" || localStorage.getItem("userRole") === "seller";

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home", icon: <Home size={20} /> },
    ];

    if (user) {
      baseItems.push(
        { path: "/cart", label: "Cart", icon: <ShoppingCart size={20} />, badge: cartCount },
        { path: "/profile", label: "Profile", icon: <User size={20} /> }
      );

      if (isSeller) {
        baseItems.push(
          { path: "/add-book", label: "Add Book", icon: <PlusCircle size={20} />, highlight: true },
          { path: "/seller/dashboard", label: "Dashboard", icon: <TrendingUp size={20} /> }
        );
      }
    }

    return baseItems;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand">
          <div className="brand-icon-wrapper">
            <BookOpen size={28} className="brand-icon" />
            <div className="brand-pulse"></div>
          </div>
          <div className="brand-text-container">
            <span className="brand-text-main">FireHorse</span>
            <span className="brand-text-sub">Books</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span className="nav-link-text">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
              {isActive(item.path) && <span className="active-indicator"></span>}
            </Link>
          ))}
          
          {/* Auth Buttons / User Menu */}
          {!user ? (
            <div className="auth-buttons">
              <Link
                to="/login"
                className={`auth-btn login-btn ${isActive('/login') ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                className="auth-btn signup-btn"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="user-avatar">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name || user.email?.split('@')[0]}</span>
                  <span className="user-role">
                    {isSeller ? (
                      <>
                        <Store size={12} />
                        Seller
                      </>
                    ) : "Buyer"}
                  </span>
                </div>
                <ChevronDown size={16} className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="dropdown-name">{user.name || "User"}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link 
                    to="/cart" 
                    className="dropdown-item"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    <span>My Cart</span>
                    {cartCount > 0 && (
                      <span className="dropdown-badge">{cartCount}</span>
                    )}
                  </Link>
                  
                  {isSeller && (
                    <Link 
                      to="/seller/dashboard" 
                      className="dropdown-item"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <TrendingUp size={18} />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="mobile-nav">
            <div className="mobile-nav-header">
              <div className="mobile-user-info">
                {user ? (
                  <>
                    <div className="mobile-user-avatar">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                    <div className="mobile-user-details">
                      <div className="mobile-user-name">{user.name || user.email}</div>
                      <div className="mobile-user-role">{isSeller ? "Seller Account" : "Buyer Account"}</div>
                    </div>
                  </>
                ) : (
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">Welcome Guest</div>
                    <div className="mobile-user-role">Sign in to access all features</div>
                  </div>
                )}
              </div>
              <button 
                className="mobile-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mobile-nav-items">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-text">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="mobile-nav-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
              
              {!user ? (
                <>
                  <Link 
                    to="/login" 
                    className="mobile-auth-btn login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="mobile-auth-btn signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Sign Up Free</span>
                  </Link>
                </>
              ) : (
                <button 
                  className="mobile-auth-btn logout"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
            
            <div className="mobile-nav-footer">
              <div className="mobile-cart-summary">
                <ShoppingCart size={20} />
                <span>Cart Total: {cartCount} items</span>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;