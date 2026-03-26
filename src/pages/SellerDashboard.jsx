import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container">
      <h1>🏪 Seller Dashboard</h1>
      <p>Welcome, {user.name || "Seller"}! Manage your bookstore here.</p>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📚 Add New Book</h3>
          <p>Add books to your inventory</p>
          <button onClick={() => navigate("/add-book")} className="btn primary">
            Add Book
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>📦 Manage Orders</h3>
          <p>View and process customer orders</p>
          <button onClick={() => navigate("/profile")} className="btn primary">
            View Orders
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>📊 Sales Analytics</h3>
          <p>Track your sales and revenue</p>
          <button onClick={() => navigate("/profile")} className="btn primary">
            View Analytics
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>👤 Your Profile</h3>
          <p>Manage your seller account</p>
          <button onClick={() => navigate("/profile")} className="btn primary">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;