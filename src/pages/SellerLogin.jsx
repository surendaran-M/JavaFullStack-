import { useState } from "react";
import { login } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Store, Eye, EyeOff, Mail, Lock, AlertCircle, TrendingUp } from "lucide-react";
import "../styles/Auth.css";

function SellerLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
        role: "seller"
      });
      
      if (userData.role !== "seller") {
        throw new Error("This account is not registered as a seller. Please use buyer login.");
      }
      
      // Check if seller profile is complete
      if (!userData.storeVerified) {
        navigate("/seller/setup", { state: { user: userData } });
        return;
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/seller/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page seller-login">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon seller-icon">
              <Store size={48} />
            </div>
            <div className="auth-title">
              <h1>Seller Dashboard</h1>
              <p className="auth-subtitle">Manage your bookstore and sales</p>
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
                <Mail size={18} />
                <span>Business Email</span>
              </label>
              <input
                type="email"
                placeholder="business@example.com"
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

            <button 
              type="submit" 
              className="auth-button seller-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Accessing Dashboard...
                </>
              ) : (
                <>
                  <Store size={20} />
                  Access Seller Dashboard
                </>
              )}
            </button>

            <div className="auth-options">
              <a href="/forgot-password" className="forgot-link">
                Forgot business password?
              </a>
            </div>

            <div className="auth-divider">
              <span>Don't have a seller account?</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/signup/seller")}
              className="auth-button secondary-button"
              disabled={loading}
            >
              Apply as Seller
            </button>

            <div className="auth-footer">
              <p className="switch-role">
                Are you a buyer?{" "}
                <button 
                  type="button" 
                  onClick={() => navigate("/login/buyer")}
                  className="role-switch-link"
                >
                  Login as Buyer
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-features">
          <div className="feature-card seller-feature">
            <TrendingUp size={32} />
            <h3>Seller Benefits</h3>
            <ul className="feature-list">
              <li>Manage your book inventory</li>
              <li>Track sales and revenue</li>
              <li>Analytics dashboard</li>
              <li>Customer management</li>
              <li>Promotion tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerLogin;