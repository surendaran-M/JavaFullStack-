import { useState } from "react";
import { login } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Eye, EyeOff, User, Lock, AlertCircle, BookOpen } from "lucide-react";
import "../styles/Auth.css";

function BuyerLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const userData = await login({
        ...credentials,
        role: "buyer"
      });
      
      if (userData.role !== "buyer") {
        throw new Error("This account is not registered as a buyer. Please use seller login.");
      }
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", credentials.email);
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to buyer dashboard
      navigate("/buyer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page buyer-login">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <BookOpen size={48} />
            </div>
            <div className="auth-title">
              <h1>Welcome to FireHorse Books</h1>
              <p className="auth-subtitle">Sign in to browse and purchase books</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="buyer@example.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <Lock size={18} />
                  <span>Password</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="auth-button buyer-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Sign In as Buyer
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>Don't have an account?</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="auth-button secondary-button"
              disabled={loading}
            >
              Create Buyer Account
            </button>

            <div className="auth-footer">
              <p className="switch-role">
                Are you a seller?{" "}
                <button 
                  type="button" 
                  onClick={() => navigate("/login/seller")}
                  className="role-switch-link"
                >
                  Login as Seller
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-features">
          <div className="feature-card">
            <ShoppingBag size={32} />
            <h3>Buyer Benefits</h3>
            <ul className="feature-list">
              <li>Browse thousands of books</li>
              <li>Exclusive member discounts</li>
              <li>Fast and secure checkout</li>
              <li>Track your orders</li>
              <li>Wishlist and saved items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerLogin;