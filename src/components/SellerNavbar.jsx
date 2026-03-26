import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Store, Home, Package, BarChart, Users, Settings, LogOut, Menu, X, PlusCircle, DollarSign } from "lucide-react";
cd 
function SellerNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/seller/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/seller/books", label: "My Books", icon: <Package size={20} /> },
    { path: "/seller/analytics", label: "Analytics", icon: <BarChart size={20} /> },
    { path: "/seller/orders", label: "Orders", icon: <DollarSign size={20} /> },
    { path: "/seller/customers", label: "Customers", icon: <Users size={20} /> },
    { path: "/seller/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <nav className="navbar seller-navbar">
      <div className="nav-container">
        <Link to="/seller/dashboard" className="brand">
          <Store size={28} />
          <span className="brand-text">Seller Dashboard</span>
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
          
          <Link to="/seller/add-book" className="nav-link add-book-link">
            <PlusCircle size={20} />
            <span>Add Book</span>
          </Link>

          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar seller-avatar">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "S"}
              </div>
              <span className="user-name">{user?.name || "Seller"}</span>
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
            to="/seller/add-book" 
            className="mobile-nav-link add-book-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PlusCircle size={20} />
            <span>Add Book</span>
          </Link>

          <div className="mobile-user-info">
            <div className="user-avatar seller-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "S"}
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

export default SellerNavbar;