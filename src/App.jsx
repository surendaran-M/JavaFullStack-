import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BuyerLogin from "./pages/BuyerLogin";
import SellerLogin from "./pages/SellerLogin";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import BookDetails from "./pages/BookDetails";
import AddBook from "./pages/AddBook";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading FireHorse Books...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/book/:id" element={<BookDetails />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/login/buyer" element={!user ? <BuyerLogin /> : <Navigate to="/" />} />
          <Route path="/login/seller" element={!user ? <SellerLogin /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          {/* Protected Buyer Routes */}
          <Route 
            path="/buyer/dashboard" 
            element={user?.role === "buyer" ? <BuyerDashboard /> : <Navigate to="/login/buyer" />} 
          />
          <Route 
            path="/cart" 
            element={user ? <Cart /> : <Navigate to="/login" />} 
          />
          
          {/* Protected Seller Routes */}
          <Route 
            path="/seller/dashboard" 
            element={user?.role === "seller" ? <SellerDashboard /> : <Navigate to="/login/seller" />} 
          />
          <Route 
            path="/add-book" 
            element={user?.role === "seller" ? <AddBook /> : <Navigate to="/login/seller" />} 
          />
          
          {/* Common Protected Routes */}
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/order/confirmation" 
            element={user?.role === "buyer" ? <OrderConfirmation /> : <Navigate to="/login/buyer" />} 
          />
          
          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;