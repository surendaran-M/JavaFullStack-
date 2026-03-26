import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../services/api.jsx";
import "../styles/Profile.css";
import "../styles/Button.css";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Get orders from localStorage (stored when orders are placed)
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        // Try to get orders from API
        try {
          const apiOrders = await getOrders(user.id);
          if (Array.isArray(apiOrders) && apiOrders.length > 0) {
            setOrders(apiOrders);
            setLoading(false);
            return;
          }
        } catch {
          // API failed, try localStorage
        }

        // Get orders from localStorage
        const ordersKey = `orders_${user.id}`;
        const savedOrders = localStorage.getItem(ordersKey);
        
        if (savedOrders) {
          try {
            const parsedOrders = JSON.parse(savedOrders);
            setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
          } catch {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalItems = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0);
    }, 0);
    
    return {
      totalOrders,
      totalSpent,
      totalItems,
      averageOrder: totalOrders > 0 ? totalSpent / totalOrders : 0
    };
  }, [orders]);

  if (!user) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {(user.name || user.email || "U").charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name || "User"}</h1>
          <p className="profile-email">{user.email}</p>
          <div className="profile-badge">
            <span className="badge-icon">⭐</span>
            <span>{user.role === "admin" ? "Administrator" : "Member"}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>
        
        <div className="stat-card stat-gold">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Spent</p>
            <h3 className="stat-value">₹{stats.totalSpent.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="stat-card stat-success">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <p className="stat-label">Books Purchased</p>
            <h3 className="stat-value">{stats.totalItems}</h3>
          </div>
        </div>
        
        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Avg Order Value</p>
            <h3 className="stat-value">₹{stats.averageOrder.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span>📋</span> Overview
        </button>
        <button
          className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <span>🛒</span> Order History
        </button>
        <button
          className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span>⚙️</span> Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="info-card">
              <h3>👤 Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.name || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">User ID</span>
                  <span className="info-value">#{user.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type</span>
                  <span className="info-value">{user.role === "admin" ? "Administrator" : "Standard User"}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>📈 Activity Summary</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">🛒</span>
                  <div className="activity-content">
                    <p className="activity-title">Orders Placed</p>
                    <p className="activity-desc">{stats.totalOrders} order{stats.totalOrders !== 1 ? 's' : ''} in total</p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">💰</span>
                  <div className="activity-content">
                    <p className="activity-title">Total Spending</p>
                    <p className="activity-desc">₹{stats.totalSpent.toFixed(2)} across all orders</p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">📚</span>
                  <div className="activity-content">
                    <p className="activity-title">Books Collected</p>
                    <p className="activity-desc">{stats.totalItems} book{stats.totalItems !== 1 ? 's' : ''} purchased</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading"></div>
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders. Start shopping to see your order history here!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate("/")}
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h4 className="order-id">Order #{order.id}</h4>
                        <p className="order-date">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className="order-status">
                        <span className="status-badge status-completed">✓ Completed</span>
                      </div>
                    </div>
                    
                    <div className="order-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="item-info">
                            <span className="item-title">{item.title || item.bookTitle}</span>
                            <span className="item-details">Qty: {item.quantity || 1} × ₹{item.price}</span>
                          </div>
                          <span className="item-total">₹{((item.quantity || 1) * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-footer">
                      <div className="order-total">
                        <span className="total-label">Total Amount</span>
                        <span className="total-value">₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-section">
            <div className="info-card">
              <h3>⚙️ Account Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates about your orders and promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Order Updates</h4>
                    <p>Get notified when your order status changes</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>🔒 Security</h3>
              <div className="settings-actions">
                <button className="btn btn-secondary">Change Password</button>
                <button className="btn btn-outline">Update Profile</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
