import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login/buyer");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container">
      <div style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        borderRadius: "20px",
        padding: "40px",
        marginBottom: "32px",
        color: "white",
        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
        border: "2px solid #fbbf24"
      }}>
        <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>👋 Welcome, {user.name || "Buyer"}!</h1>
        <p style={{ fontSize: "18px", opacity: 0.9 }}>This is your buyer dashboard. Manage your reading journey here.</p>
      </div>
      
      <div className="dashboard-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>
        <div className="dashboard-card" style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "2px solid #e5e7eb",
          transition: "all 0.3s",
          textAlign: "center"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 99, 235, 0.15)";
          e.currentTarget.style.borderColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#1a1a1a" }}>Browse Books</h3>
          <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>Discover new books to read</p>
          <button onClick={() => navigate("/")} className="btn primary" style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            transition: "all 0.3s"
          }}>
            Go to Bookstore
          </button>
        </div>
        
        <div className="dashboard-card" style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "2px solid #e5e7eb",
          transition: "all 0.3s",
          textAlign: "center"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 99, 235, 0.15)";
          e.currentTarget.style.borderColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
          <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#1a1a1a" }}>Your Cart</h3>
          <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>Review items and checkout</p>
          <button onClick={() => navigate("/cart")} className="btn primary" style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            transition: "all 0.3s"
          }}>
            View Cart
          </button>
        </div>
        
        <div className="dashboard-card" style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "2px solid #e5e7eb",
          transition: "all 0.3s",
          textAlign: "center"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 99, 235, 0.15)";
          e.currentTarget.style.borderColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#1a1a1a" }}>Your Orders</h3>
          <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>Track your purchases</p>
          <button onClick={() => navigate("/profile")} className="btn primary" style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            transition: "all 0.3s"
          }}>
            View Orders
          </button>
        </div>
        
        <div className="dashboard-card" style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "2px solid #e5e7eb",
          transition: "all 0.3s",
          textAlign: "center"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 99, 235, 0.15)";
          e.currentTarget.style.borderColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
          <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#1a1a1a" }}>Your Profile</h3>
          <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>Manage your account</p>
          <button onClick={() => navigate("/profile")} className="btn primary" style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            transition: "all 0.3s"
          }}>
            View Profile
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        borderRadius: "20px",
        padding: "32px",
        color: "white",
        marginBottom: "40px",
        border: "2px solid #fbbf24"
      }}>
        <h2 style={{ fontSize: "24px", marginBottom: "24px", color: "#fbbf24" }}>📊 Quick Stats</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📚</div>
            <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Books Available</p>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24" }}>50+</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>⭐</div>
            <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Average Rating</p>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24" }}>4.5/5</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🚚</div>
            <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Free Shipping</p>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24" }}>₹499+</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔄</div>
            <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Easy Returns</p>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24" }}>10 Days</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "2px solid #e5e7eb"
      }}>
        <h2 style={{ fontSize: "24px", marginBottom: "24px", color: "#1a1a1a" }}>📋 Recent Activity</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              👋
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", marginBottom: "4px", color: "#1a1a1a" }}>Welcome to FireHorse Books!</p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Start your reading journey by browsing our collection</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Just now</span>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              🎉
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", marginBottom: "4px", color: "#1a1a1a" }}>Special Offer!</p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Get 15% off on your first order with code: WELCOME15</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;