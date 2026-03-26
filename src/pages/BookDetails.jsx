import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getAllBooks, addToCart } from "../services/api.jsx";
import { useAuth } from "../context/AuthContext";
import { getImageSrc, handleImageError } from "../utils/imageUtils";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [clickDisabled, setClickDisabled] = useState(false);
  const [cartVersion, setCartVersion] = useState(0);
  const userId = user?.id || sessionStorage.getItem('guestId') || 'guest';

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        const books = await getAllBooks();
        const found = books.find((b) => b.id === parseInt(id));
        if (!found) {
          throw new Error("Book not found");
        }
        setBook(found);
      } catch (error) {
        console.error("Error loading book:", error);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadBook();
  }, [id]);

  useEffect(() => {
    const handleCartUpdate = () => setCartVersion((v) => v + 1);
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const baseStock = useMemo(() => {
    const stock = Number(book?.stock ?? 0);
    return Number.isFinite(stock) ? stock : 0;
  }, [book?.stock]);

  const inCartQty = useMemo(() => {
    void cartVersion;
    if (!book?.id) return 0;

    try {
      const savedCart = localStorage.getItem(`cart_${userId}`);
      if (!savedCart) return 0;

      const cartItems = JSON.parse(savedCart);
      if (!Array.isArray(cartItems)) return 0;

      const item = cartItems.find((it) => Number(it?.id) === Number(book.id));
      const qty = Number(item?.quantity ?? 0);
      return Number.isFinite(qty) ? qty : 0;
    } catch {
      return 0;
    }
  }, [userId, book?.id, cartVersion]);

  const availableStock = Math.max(0, baseStock - inCartQty);

  const handleAddToCart = async () => {
    // Prevent multiple rapid clicks
    if (clickDisabled || addingToCart) return;
    
    if (!book || availableStock <= 0) {
      alert("This book is out of stock");
      return;
    }
    
    setClickDisabled(true);
    setAddingToCart(true);
    
    try {
      // First check localStorage
      const cartKey = `cart_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      let cartItems = [];
      
      if (savedCart) {
        try {
          cartItems = JSON.parse(savedCart);
        } catch {
          cartItems = [];
        }
      }
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === book.id);
      
      if (existingItemIndex !== -1) {
        const existingItem = cartItems[existingItemIndex];
        const currentQty = Number(existingItem?.quantity ?? 0);
        const safeCurrentQty = Number.isFinite(currentQty) ? currentQty : 0;
        
        // Check stock limit
        if (safeCurrentQty >= baseStock) {
          alert("No more stock available for this book!");
          return;
        }
        
        // Increment quantity by 1 only
        cartItems[existingItemIndex].quantity = safeCurrentQty + 1;
        console.log("Increased quantity to:", cartItems[existingItemIndex].quantity);
      } else {
        // Add new item with quantity 1
        cartItems.push({
          ...book,
          quantity: 1,
          bookTitle: book.title // Add for compatibility
        });
        console.log("Added new item to cart");
      }
      
      // Save to localStorage
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      console.log("Cart saved to localStorage:", cartItems);
      
      // For logged-in users, also update via API
      if (user?.id) {
        try {
          await addToCart(userId, book.id);
          console.log("API cart update successful");
        } catch (apiError) {
          console.log("API call failed, cart updated locally only:", apiError);
        }
      }
      
      alert(`✅ "${book.title}" added to cart!`);
      
      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("❌ Error: " + (err.message || "Failed to add to cart"));
    } finally {
      setTimeout(() => {
        setAddingToCart(false);
        setClickDisabled(false);
      }, 500); // Prevent rapid clicks for 500ms
    }
  };

  if (loading) return (
    <div className="container">
      <div className="loading"></div>
      <p style={{textAlign:"center", marginTop: "40px"}}>Loading book details...</p>
    </div>
  );
  
  if (!book) return (
    <div className="container" style={{ textAlign: "center", padding: "40px" }}>
      <h2>Book Not Found</h2>
      <p>The book you're looking for doesn't exist or has been removed.</p>
      <button 
        className="btn primary" 
        onClick={() => navigate("/")} 
        style={{marginTop: 20}}
      >
        ← Back to Home
      </button>
    </div>
  );

  return (
    <div className="container">
      <button 
        className="btn back-button" 
        onClick={() => navigate("/")}
        style={{
          marginBottom: 20,
          background: "white",
          border: "2px solid #e5e7eb",
          color: "#1a1a1a",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#f8f9fa";
          e.target.style.borderColor = "#2563eb";
          e.target.style.color = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "white";
          e.target.style.borderColor = "#e5e7eb";
          e.target.style.color = "#1a1a1a";
        }}
      >
        ← Back to Books
      </button>
      
      <div className="book-details-grid">
        {/* Left: Book Image */}
        <div className="book-image-section">
          <div className="image-wrapper">
            <img 
              src={getImageSrc(book)} 
              alt={book.title} 
              className="book-main-image"
              onError={(e) => handleImageError(e, book.title)}
            />
            {availableStock <= 5 && availableStock > 0 && (
              <div className="stock-badge warning">
                Only {availableStock} left!
              </div>
            )}
            {availableStock <= 0 && (
              <div className="stock-badge danger">
                Out of Stock
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              className={`btn primary full add-to-cart-btn ${addingToCart ? 'adding-to-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart || clickDisabled || availableStock <= 0}
            >
              {addingToCart ? (
                <>
                  <div className="spinner-small"></div>
                  Adding to Cart...
                </>
              ) : availableStock > 0 ? (
                <>
                  🛒 Add to Cart - ₹{book.price}
                </>
              ) : (
                "Out of Stock"
              )}
            </button>
            
            <button 
              className="btn secondary full"
              onClick={() => navigate("/cart")}
            >
              🛍️ View Cart
            </button>
          </div>
        </div>

        {/* Right: Book Details */}
        <div className="book-info-section">
          <h1 className="book-title">
            {book.title}
          </h1>
          
          <p className="book-author">
            by <strong className="author-name">{book.author}</strong>
          </p>

          {/* Price & Stock */}
          <div className="price-availability-card">
            <div className="price-section">
              <p className="section-label">Price</p>
              <h2 className="price">₹{book.price}</h2>
            </div>
            <div className="availability-section">
              <p className="section-label">Availability</p>
              <h3 className={`availability ${availableStock > 0 ? "in-stock" : "out-of-stock"}`}>
                {availableStock > 0 ? `${availableStock} Available` : "Out of Stock"}
              </h3>
            </div>
          </div>

          {/* Book Info */}
          <div className="book-info-card">
            <div className="info-item">
              <span className="info-label">Category</span>
              <span className="category-badge">{book.category}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Book ID</span>
              <span className="book-id">#{book.id.toString().padStart(4, '0')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rating</span>
              <span className="rating">⭐ 4.5/5 (Based on 120 reviews)</span>
            </div>
          </div>

          {/* Description */}
          <div className="description-card">
            <h3>📖 About This Book</h3>
            <p className="description-text">
              {book.description || "A captivating read that will keep you engaged from start to finish. This book offers valuable insights and entertainment for readers of all ages."}
            </p>
          </div>

          {/* Features */}
          <div className="features-grid">
            {[
              { label: "Format", value: "Paperback", icon: "📖" },
              { label: "Language", value: "English", icon: "🌐" },
              { label: "Pages", value: "~300 pages", icon: "📄" },
              { label: "Publisher", value: "FireHorse Books", icon: "🏢" }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <p className="feature-label">{feature.label}</p>
                <p className="feature-value">{feature.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="reviews-section">
        <h3>⭐ Customer Reviews (4.5/5)</h3>
        <div className="reviews-grid">
          {[
            { rating: "⭐⭐⭐⭐⭐", title: "Excellent Book!", review: "\"A masterpiece that everyone should read. Highly recommended!\" - Sarah M.", color: "#fef3c7" },
            { rating: "⭐⭐⭐⭐", title: "Great Read", review: "\"Captivating story with brilliant characters. Worth every penny!\" - John D.", color: "#e0e7ff" },
            { rating: "⭐⭐⭐⭐⭐", title: "Must Read", review: "\"Couldn't put it down! Finished in one sitting.\" - Alex K.", color: "#d1fae5" },
            { rating: "⭐⭐⭐⭐", title: "Highly Enjoyable", review: "\"Well-written and thought-provoking. Will read again!\" - Maria L.", color: "#f3e8ff" }
          ].map((review, index) => (
            <div key={index} className="review-card" style={{ background: review.color }}>
              <p className="review-rating">{review.rating} {review.title}</p>
              <p className="review-text">{review.review}</p>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx="true">{`
        .book-details-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 40px;
          margin-top: 20px;
        }
        
        .book-image-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .image-wrapper {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 3px solid #e5e7eb;
        }
        
        .book-main-image {
          width: 100%;
          height: 500px;
          object-fit: cover;
          display: block;
        }
        
        .stock-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .stock-badge.warning {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #000000;
        }
        
        .stock-badge.danger {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .add-to-cart-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 16px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }
        
        .add-to-cart-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .adding-to-cart {
          opacity: 0.7;
        }
        
        .book-title {
          font-size: 36px;
          margin-bottom: 12px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.2;
        }
        
        .book-author {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        
        .author-name {
          color: #2563eb;
          font-size: 20px;
        }
        
        .price-availability-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .price-section {
          flex: 1;
        }
        
        .availability-section {
          flex: 1;
          text-align: right;
        }
        
        .section-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 500;
          display: block;
        }
        
        .price {
          font-size: 42px;
          color: #2563eb;
          margin: 0;
          font-weight: 800;
        }
        
        .availability {
          font-size: 28px;
          margin: 0;
          font-weight: 700;
        }
        
        .availability.in-stock {
          color: #10b981;
        }
        
        .availability.out-of-stock {
          color: #dc2626;
        }
        
        .book-info-card {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e5e7eb;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 16px;
          color: #4b5563;
          font-weight: 500;
        }
        
        .category-badge {
          background: #e0e7ff;
          color: #2563eb;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }
        
        .book-id {
          font-family: monospace;
          color: #6b7280;
          font-size: 16px;
          font-weight: 600;
        }
        
        .rating {
          color: #f59e0b;
          font-weight: 600;
        }
        
        .description-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e5e7eb;
        }
        
        .description-card h3 {
          font-size: 22px;
          margin-bottom: 16px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .description-text {
          color: #4b5563;
          line-height: 1.8;
          font-size: 16px;
          margin: 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        
        .feature-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          border-color: #2563eb;
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        
        .feature-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .feature-value {
          font-weight: 700;
          font-size: 16px;
          color: #1a1a1a;
          margin: 0;
        }
        
        .reviews-section {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
        }
        
        .reviews-section h3 {
          font-size: 24px;
          margin-bottom: 24px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .review-card {
          border: 2px solid #e5e7eb;
          padding: 20px;
          border-radius: 12px;
          transition: all 0.3s;
        }
        
        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .review-rating {
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 16px;
          color: #000000;
        }
        
        .review-text {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .book-details-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .book-main-image {
            height: 400px;
          }
          
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .book-title {
            font-size: 28px;
          }
          
          .price {
            font-size: 32px;
          }
          
          .availability {
            font-size: 24px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .reviews-grid {
            grid-template-columns: 1fr;
          }
          
          .book-main-image {
            height: 350px;
          }
        }
        
        @media (max-width: 480px) {
          .price-availability-card {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .availability-section {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default BookDetails;
