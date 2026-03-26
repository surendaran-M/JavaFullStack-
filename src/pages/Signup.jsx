import { useState } from "react";
import { signup } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  User, Mail, Lock, Eye, EyeOff, 
  Book, Store, CheckCircle, AlertCircle 
} from "lucide-react";

import "../styles/Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Call validateForm() with parentheses
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const userData = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (!userData) {
        throw new Error("No user data returned from signup");
      }
      
      setSuccess(true);
      
      // Auto login after successful signup
      setTimeout(() => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        
        if (formData.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/buyer/dashboard");
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <div className={`signup-icon ${formData.role === "seller" ? "seller" : "buyer"}`}>
              {formData.role === "seller" ? <Store size={48} /> : <Book size={48} />}
            </div>
            <div className="signup-title">
              <h1>Join FireHorse Books</h1>
              <p className="signup-subtitle">
                {formData.role === "seller" 
                  ? "Start selling your books today" 
                  : "Start your reading journey today"}
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="role-selection">
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${formData.role === "buyer" ? "active" : ""} ${formData.role === "buyer" ? "buyer" : ""}`}
                onClick={() => setFormData({...formData, role: "buyer"})}
                disabled={loading || success}
              >
                <Book size={24} />
                <span>Buyer</span>
                <p>Browse and purchase books</p>
              </button>
              
              <button
                type="button"
                className={`role-option ${formData.role === "seller" ? "active" : ""} ${formData.role === "seller" ? "seller" : ""}`}
                onClick={() => setFormData({...formData, role: "seller"})}
                disabled={loading || success}
              >
                <Store size={24} />
                <span>Seller</span>
                <p>Manage and sell books</p>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <CheckCircle size={24} />
              <div>
                <h3>Account Created Successfully!</h3>
                <p>Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="signup-form">
            {error && !success && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading || success}
                minLength="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading || success}
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
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading || success}
                minLength="6"
              />
              <p className="password-hint">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <Lock size={18} />
                  <span>Confirm Password</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={loading || success}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading || success}
                minLength="6"
              />
            </div>

            <div className="terms-agreement">
              <input
                type="checkbox"
                id="terms"
                required
                disabled={loading || success}
              />
              <label htmlFor="terms">
                I agree to the <a href="/terms" onClick={(e) => {
                  e.preventDefault();
                  alert("Terms of Service page coming soon!");
                }}>Terms of Service</a> and <a href="/privacy" onClick={(e) => {
                  e.preventDefault();
                  alert("Privacy Policy page coming soon!");
                }}>Privacy Policy</a>
              </label>
            </div>

            <button 
              type="submit" 
              className={`signup-button ${formData.role === "seller" ? "seller" : "buyer"}`}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Account Created!
                </>
              ) : (
                `Sign up as ${formData.role === "seller" ? "Seller" : "Buyer"}`
              )}
            </button>

            <div className="signup-divider">
              <span>Already have an account?</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="signup-button secondary-button"
              disabled={loading || success}
            >
              Sign In Instead
            </button>

            <div className="signup-footer">
              <p className="switch-role">
                Want to {formData.role === "seller" ? "buy" : "sell"} books?{" "}
                <button 
                  type="button" 
                  onClick={() => setFormData({
                    ...formData, 
                    role: formData.role === "seller" ? "buyer" : "seller"
                  })}
                  className="role-switch-link"
                  disabled={loading || success}
                >
                  Sign up as {formData.role === "seller" ? "Buyer" : "Seller"}
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="signup-features">
          <div className={`feature-card ${formData.role === "seller" ? "seller-feature" : "buyer-feature"}`}>
            {formData.role === "seller" ? (
              <>
                <Store size={48} />
                <h3>Seller Benefits</h3>
                <ul className="feature-list">
                  <li>📦 Manage your book inventory</li>
                  <li>💰 Set your own prices and discounts</li>
                  <li>📊 Track sales with analytics dashboard</li>
                  <li>👥 Manage customer orders</li>
                  <li>🚀 Fast and secure payments</li>
                  <li>⭐ Build your seller reputation</li>
                </ul>
              </>
            ) : (
              <>
                <Book size={48} />
                <h3>Buyer Benefits</h3>
                <ul className="feature-list">
                  <li>📚 Access thousands of books</li>
                  <li>💰 Exclusive member discounts</li>
                  <li>🚚 Fast and free shipping on orders over ₹499</li>
                  <li>📱 Track your orders in real-time</li>
                  <li>❤️ Create wishlists and save favorites</li>
                  <li>⭐ Write reviews and rate books</li>
                </ul>
              </>
            )}
          </div>
          
          <div className="security-note">
            <div className="security-icon">🔒</div>
            <div>
              <h4>Secure & Private</h4>
              <p>Your information is protected with bank-level security</p>
            </div>
          </div>
        </div>
      </div>

      <style >{`
        .signup-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        
        .signup-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 90px;
          max-width: 1200px;
          width: 100%;
          align-items: start;
        }
        
        .signup-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 2px solid ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          transition: all 0.3s ease;
        }
        
        .signup-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
        }
        
        .signup-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .signup-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, 
            ${formData.role === 'seller' ? '#10b981 0%, #059669 100%' : '#2563eb 0%, #1e40af 100%'}
          );
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 8px 20px ${formData.role === 'seller' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(37, 99, 235, 0.3)'};
        }
        
        .signup-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .signup-subtitle {
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }
        
        .role-selection {
          margin-bottom: 32px;
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
          border-color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .role-option.active {
          border-color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          background: ${formData.role === 'seller' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(37, 99, 235, 0.05)'};
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
        
        .role-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .success-message {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 1px solid #86efac;
          color: #059669;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease;
        }
        
        .success-message h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .success-message p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
        
        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease;
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
        
        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-label {
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
        }
        
        .password-toggle {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .password-toggle:hover:not(:disabled) {
          color: #374151;
        }
        
        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .form-input {
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
          background: #f8f9fa;
        }
        
        .form-input:focus {
          outline: none;
          border-color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          background: white;
          box-shadow: 0 0 0 3px ${formData.role === 'seller' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
        }
        
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f3f4f6;
        }
        
        .password-hint {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }
        
        .terms-agreement {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 10px 0;
        }
        
        .terms-agreement input[type="checkbox"] {
          margin-top: 4px;
          cursor: pointer;
          width: 18px;
          height: 18px;
          accent-color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
        }
        
        .terms-agreement input[type="checkbox"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .terms-agreement label {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .terms-agreement a {
          color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          text-decoration: none;
          font-weight: 500;
        }
        
        .terms-agreement a:hover {
          text-decoration: underline;
        }
        
        .signup-button {
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
        
        .signup-button.buyer {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
        }
        
        .signup-button.seller {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        
        .signup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px ${formData.role === 'seller' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(37, 99, 235, 0.3)'};
        }
        
        .signup-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .secondary-button {
          background: white;
          border: 2px solid #e5e7eb;
          color: #374151;
        }
        
        .secondary-button:hover:not(:disabled) {
          border-color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
        }
        
        .spinner-small {
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
        
        .signup-divider {
          text-align: center;
          position: relative;
          margin: 20px 0;
        }
        
        .signup-divider span {
          background: white;
          padding: 0 15px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .signup-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
          z-index: -1;
        }
        
        .signup-footer {
          text-align: center;
          margin-top: 20px;
        }
        
        .switch-role {
          color: #6b7280;
          font-size: 14px;
        }
        
        .role-switch-link {
          background: none;
          border: none;
          color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          font-size: 14px;
          padding: 0;
        }
        
        .role-switch-link:hover:not(:disabled) {
          opacity: 0.8;
        }
        
        .role-switch-link:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .signup-features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .buyer-feature {
          border-color: #2563eb;
        }
        
        .seller-feature {
          border-color: #10b981;
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .feature-card > svg {
          color: ${formData.role === 'seller' ? '#10b981' : '#2563eb'};
          margin-bottom: 20px;
        }
        
        .feature-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #1a1a1a;
        }
        
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .feature-list li {
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
        }
        
        .feature-list li:last-child {
          border-bottom: none;
        }
        
        .security-note {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #fbbf24;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .security-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .security-note h4 {
          margin: 0 0 4px 0;
          color: #1a1a1a;
          font-size: 16px;
        }
        
        .security-note p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        @media (max-width: 1024px) {
          .signup-container {
            grid-template-columns: 1fr;
            gap: 30px;
            max-width: 600px;
          }
          
          .signup-features {
            order: -1;
          }
        }
        
        @media (max-width: 768px) {
          .signup-card {
            padding: 30px 20px;
          }
          
          .role-options {
            grid-template-columns: 1fr;
          }
          
          .feature-card {
            padding: 24px;
          }
          
          .signup-title h1 {
            font-size: 24px;
          }
        }
        
        @media (max-width: 480px) {
          .signup-page {
            padding: 10px;
          }
          
          .signup-container {
            gap: 20px;
          }
          
          .signup-card {
            padding: 24px 16px;
          }
          
          .feature-list li {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;
