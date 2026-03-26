import { useEffect, useState, useMemo, useCallback } from "react";
import { placeOrder } from "../services/api.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Generate or get guest ID
  const userId = useMemo(() => {
    if (user?.id) return user.id;
    
    let guestId = sessionStorage.getItem('guestId');
    if (!guestId) {
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          guestId = crypto.randomUUID();
        }
      } catch {
        // Use the fallback ID
      }
      sessionStorage.setItem('guestId', guestId);
    }
    return guestId;
  }, [user?.id]);

  // ✅ FIXED: Memoized loadCart function
  const loadCart = useCallback(() => {
    setLoading(true);
    try {
      const cartKey = `cart_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCart();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      console.log("Cart update event received, reloading cart...");
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [loadCart]); // ✅ Now using memoized loadCart

  // ✅ FIXED: Added silentClearCart for checkout
  const silentClearCart = () => {
    setCartItems([]);
    localStorage.removeItem(`cart_${userId}`);
    window.dispatchEvent(new Event('cartUpdated'));
    console.log("Cart cleared silently");
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    // Check stock limit
    if (item.stock !== undefined && newQuantity > item.stock) {
      alert(`Only ${item.stock} items available in stock!`);
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    const cartKey = `cart_${userId}`;
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    
    // Trigger update event
    window.dispatchEvent(new Event('cartUpdated'));
    console.log("Quantity updated for item", itemId, "to", newQuantity);
  };

  const removeItem = (itemId) => {
    if (window.confirm("Are you sure you want to remove this item from cart?")) {
      const filtered = cartItems.filter(item => item.id !== itemId);
      setCartItems(filtered);
      const cartKey = `cart_${userId}`;
      localStorage.setItem(cartKey, JSON.stringify(filtered));
      
      // Trigger update event
      window.dispatchEvent(new Event('cartUpdated'));
      console.log("Item removed from cart:", itemId);
    }
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      silentClearCart();
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    
    if (!user) {
      alert("Please login to checkout");
      navigate("/login/buyer");
      return;
    }
    
    const orderPayload = {
      userId,
      orderDate: new Date().toISOString().split("T")[0],
      totalAmount: totalPrice,
      items: cartItems.map((it) => ({ 
        bookId: it.id, 
        title: it.title || "Unknown Book", 
        price: it.price || 0, 
        quantity: it.quantity || 1 
      })),
    };
    
    try {
      setPlacing(true);
      
      // Try backend order placement
      let order;
      try {
        order = await placeOrder(orderPayload);
        alert("✅ Order placed successfully!");
      } catch (apiError) {
        // If backend fails, create mock order
        console.log("Backend order failed, using mock order:", apiError);
        order = {
          id: Date.now(),
          ...orderPayload
        };
        alert("⚠️ Order placed locally (backend offline)");
      }
      
      // Save order to localStorage for profile
      if (user?.id) {
        const ordersKey = `orders_${user.id}`;
        const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
        existingOrders.unshift(order);
        localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
      }
      
      // ✅ FIXED: Clear cart without confirmation dialog
      silentClearCart();
      
      // Navigate to confirmation
      navigate("/order/confirmation", { state: { order } });
    } catch (err) {
      alert("Failed to place order: " + (err.message || "Unknown error"));
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="container">
      <div className="loading"></div>
      <p>Loading cart...</p>
    </div>
  );

  return (
    <div className="container">
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#d32f2f", margin: "0 0 8px 0" }}>FireHorse</h1>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#555", margin: "0" }}>
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h2>
      </header>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "40px", padding: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
          <p style={{ color: "var(--text-light)", fontSize: "18px", marginBottom: "20px" }}>Your cart is empty</p>
          <button className="btn primary" onClick={() => navigate("/")}>
            Browse Books
          </button>
        </div>
      ) : (
        <>
          {/* ✅ FIXED: Items list comes FIRST (logical order) */}
          <div className="cart-list">
            {cartItems.map(item => {
              const quantity = item.quantity || 0;
              const itemTotal = (item.price || 0) * quantity;
              const stock = item.stock || 99;
              
              return (
                <div key={item.id} className="cart-item" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  marginBottom: "16px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border)",
                  flexWrap: "wrap",
                  gap: "20px"
                }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "600" }}>
                      {item.title || "Unknown Book"}
                    </h3>
                    <p style={{ color: "var(--text-light)", fontSize: "14px", margin: "0 0 6px 0" }}>
                      {item.author || "Unknown Author"}
                    </p>
                    <p style={{ fontWeight: "600", color: "var(--primary)", fontSize: "16px", margin: "0 0 4px 0" }}>
                      ₹{item.price || 0}
                    </p>
                    {/* ✅ FIXED: Correct stock display (was "To available" in original) */}
                    <p style={{ fontSize: "13px", color: "#2e7d32", marginTop: "4px", fontWeight: "500" }}>
                      Stock: {stock-quantity} available
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      border: "2px solid var(--border)", 
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "none",
                          cursor: "pointer",
                          padding: "10px 14px",
                          fontSize: "18px",
                          color: "var(--text-dark)",
                          fontWeight: "bold",
                          transition: "all 0.2s",
                          minWidth: "44px"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#e5e7eb"}
                        onMouseLeave={(e) => e.target.style.background = "var(--bg-secondary)"}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      
                      <span style={{ 
                        padding: "10px 16px", 
                        fontWeight: "600", 
                        minWidth: "50px", 
                        textAlign: "center",
                        background: "white",
                        borderLeft: "1px solid var(--border)",
                        borderRight: "1px solid var(--border)",
                        fontSize: "16px"
                      }}>
                        {quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "none",
                          cursor: "pointer",
                          padding: "10px 14px",
                          fontSize: "18px",
                          color: "var(--text-dark)",
                          fontWeight: "bold",
                          transition: "all 0.2s",
                          minWidth: "44px"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#e5e7eb"}
                        onMouseLeave={(e) => e.target.style.background = "var(--bg-secondary)"}
                        disabled={quantity >= stock}
                      >
                        +
                      </button>
                    </div>
                    
                    <div style={{ textAlign: "right", minWidth: "100px" }}>
                      <p style={{ 
                        fontWeight: "700", 
                        fontSize: "20px",
                        color: "var(--text-dark)",
                        margin: "0 0 4px 0"
                      }}>
                        ₹{itemTotal.toFixed(2)}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
                        {quantity} × ₹{item.price || 0}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                        transition: "all 0.3s",
                        minWidth: "100px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.3)";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* ✅ FIXED: Single summary section (no duplicate totals) */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            padding: "28px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            border: "2px solid #fbbf24",
            marginTop: "32px",
            color: "white"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: "500", marginBottom: "8px" }}>Total Items</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "28px", color: "#fbbf24", fontWeight: "800" }}>{totalItems}</span>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{totalItems === 1 ? 'item' : 'items'}</span>
                </div>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: "500", marginBottom: "8px" }}>Total Amount</p>
                <h2 style={{ fontSize: "40px", color: "#fbbf24", margin: "0", fontWeight: "800", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  ₹{totalPrice.toFixed(2)}
                </h2>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap" }}>
              <button 
                className="btn primary full" 
                onClick={handleCheckout} 
                disabled={placing || cartItems.length === 0}
                style={{ 
                  flex: "2 1 300px",
                  padding: "18px 24px",
                  fontSize: "18px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                }}
              >
                {placing ? (
                  <>
                    <div className="spinner-small" style={{ 
                      width: "20px", 
                      height: "20px", 
                      border: "2px solid rgba(255,255,255,0.3)", 
                      borderTopColor: "white", 
                      borderRadius: "50%", 
                      animation: "spin 1s linear infinite",
                      display: "inline-block",
                      marginRight: "12px",
                      verticalAlign: "middle"
                    }}></div>
                    Placing Order...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
              
              <button 
                onClick={clearCart}
                style={{ 
                  flex: "1 1 150px",
                  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                  color: "white",
                  padding: "18px 24px",
                  fontSize: "16px",
                  fontWeight: "700",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(107, 114, 128, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(107, 114, 128, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.4)";
                }}
                disabled={cartItems.length === 0}
              >
                Clear Cart
              </button>
            </div>
            
            <p style={{ 
              textAlign: "center", 
              color: "rgba(255,255,255,0.7)", 
              fontSize: "13px", 
              marginTop: "20px",
              fontStyle: "italic",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.1)"
            }}>
              {user ? `Logged in as ${user.name || user.email}` : "Guest user - Please login to checkout"}
            </p>
          </div>
        </>
      )}
      
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner-small {
          animation: spin 1s linear infinite;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        }
        
        .cart-item button:disabled {
          background-color: #d1d5db !important;
          color: #9ca3af !important;
          cursor: not-allowed;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .cart-item {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .cart-item > div:last-child {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default Cart;