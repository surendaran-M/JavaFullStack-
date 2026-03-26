import { useState } from "react";
import { login } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, User, Lock, Book, Store, AlertCircle } from "lucide-react";

function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "buyer"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting login with:", { ...credentials, password: "***" });
      
      const userData = await login(credentials);
      console.log("Login successful, user data:", userData);
      
      if (!userData) {
        throw new Error("No user data returned");
      }
      
      // Check if role matches (optional, but good for UX)
      if (credentials.role && userData.role !== credentials.role) {
        console.warn(`User role (${userData.role}) doesn't match selected role (${credentials.role})`);
        // Still allow login, but show warning
        setError(`Note: You're logging in as a ${userData.role}. Redirecting to ${userData.role} dashboard...`);
      }
      
      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // Give a small delay for better UX
      setTimeout(() => {
        // Redirect based on actual user role
        if (userData.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/buyer/dashboard");
        }
      }, 500);
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className={`login-card ${credentials.role === "seller" ? "seller" : "buyer"}`}>
          <div className="login-header">
            <div className={`login-icon ${credentials.role === "seller" ? "seller" : "buyer"}`}>
              {credentials.role === "seller" ? <Store size={48} /> : <Book size={48} />}
            </div>
            <div className="login-title">
              <h1>Welcome Back</h1>
              <p className="login-subtitle">Sign in to continue to FireHorse Books</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="role-selection">
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${credentials.role === "buyer" ? "active" : ""} ${credentials.role === "buyer" ? "buyer" : ""}`}
                onClick={() => setCredentials({ ...credentials, role: "buyer" })}
                disabled={loading}
              >
                <Book size={24} />
                <span>Buyer</span>
                <p>Browse and purchase books</p>
              </button>
              
              <button
                type="button"
                className={`role-option ${credentials.role === "seller" ? "active" : ""} ${credentials.role === "seller" ? "seller" : ""}`}
                onClick={() => setCredentials({ ...credentials, role: "seller" })}
                disabled={loading}
              >
                <Store size={24} />
                <span>Seller</span>
                <p>Manage and sell books</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className={`login-message ${error.includes("Note:") ? "warning" : "error"}`}>
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
                name="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="email"
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
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`login-button ${credentials.role === "seller" ? "seller" : "buyer"}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                `Sign in as ${credentials.role === "seller" ? "Seller" : "Buyer"}`
              )}
            </button>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <a href="/signup" onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}>Sign up as {credentials.role === "seller" ? "Seller" : "Buyer"}</a>
              </p>
              <a href="/forgot-password" className="forgot-password" onClick={(e) => {
                e.preventDefault();
                alert("Password reset feature coming soon!");
              }}>
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        
        .login-container {
          max-width: 500px;
          margin-top: 60px;
          width: 100%;
        }
        
        .login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 2px solid #2563eb;
          transition: all 0.3s ease;
        }
        
        .login-card.seller {
          border-color: #10b981;
        }
        
        .login-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }
        
        .login-icon.seller {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .login-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .login-subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        
        .role-selection {
          margin-bottom: 30px;
        }
        
        .role-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .role-option {
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .role-option:hover:not(:disabled) {
          border-color: #2563eb;
          transform: translateY(-2px);
        }
        
        .role-option.seller:hover:not(:disabled) {
          border-color: #10b981;
        }
        
        .role-option.active {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.05);
        }
        
        .role-option.active.seller {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        
        .role-option span {
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
        }
        
        .role-option p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .login-message {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          animation: slideIn 0.3s ease;
        }
        
        .login-message.error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        
        .login-message.warning {
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #d97706;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .password-toggle {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
        }
        
        .password-toggle:hover:not(:disabled) {
          color: #374151;
        }
        
        .form-group input {
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .login-card.seller .form-group input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .login-button {
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .login-button.buyer {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
        }
        
        .login-button.seller {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }
        
        .login-button.seller:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .login-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          font-size: 14px;
        }
        
        .login-footer a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        
        .login-card.seller .login-footer a {
          color: #10b981;
        }
        
        .login-footer a:hover {
          text-decoration: underline;
        }
        
        .forgot-password {
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .role-options {
            grid-template-columns: 1fr;
          }
          
          .login-footer {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
          
          .login-title h1 {
            font-size: 24px;
          }
        }
        
        @media (max-width: 480px) {
          .login-page {
            padding: 10px;
          }
          
          .login-card {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;