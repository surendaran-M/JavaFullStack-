  import { useLocation, useNavigate } from "react-router-dom";

  function OrderConfirmation() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const order = state?.order;

    if (!order) {
      return (
        <div className="container">
          <h2>Order not found</h2>
          <p>No order details available.</p>
          <button className="btn primary" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      );
    }

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{ color: "var(--success)", fontSize: 32 }}>✅ Order Confirmed!</h2>
          <p style={{ color: "var(--text-light)", fontSize: 16 }}>Thank you for your purchase</p>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", background: "var(--card)", padding: 24, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ color: "var(--text-light)", fontSize: 12, marginBottom: 4 }}>Order ID</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{order.id}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-light)", fontSize: 12, marginBottom: 4 }}>Order Date</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{order.orderDate}</p>
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Order Items</h3>
          <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
            {(order.items || []).map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: 12, borderRadius: 8, background: "var(--bg)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{it.title || it.bookTitle}</div>
                  <div style={{ fontSize: 12, color: "var(--text-light)" }}>{it.author || ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>₹{it.price} x {it.quantity}</div>
                  <div style={{ fontWeight: 700, marginTop: 6, color: "var(--primary)" }}>₹{(it.price * (it.quantity || 1)).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 16, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)", borderRadius: 8, color: "white", marginBottom: 24 }}>
            <p style={{ fontSize: 12, marginBottom: 4 }}>Total Amount</p>
            <h2 style={{ color: "white", margin: 0 }}>₹{order.totalAmount}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button className="btn primary full" onClick={handlePrint}>Print Bill</button>
            <button className="btn secondary" onClick={() => navigate("/")} style={{background: "var(--secondary)", color: "white"}}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  export default OrderConfirmation;
