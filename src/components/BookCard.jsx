import React from "react";
import { getImageSrc, handleImageError } from "../utils/imageUtils";
import "../styles/BookCard.css";

const BookCard = ({ book, onClick }) => {
  if (!book) return null;

  const displayStock = Number.isFinite(Number(book.availableStock))
    ? Number(book.availableStock)
    : Number(book.stock ?? 0);

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleCardClick = (e) => {
    // Only trigger onClick if clicking directly on the card (not buttons)
    if (e.target === e.currentTarget || 
        e.target.classList.contains('book-card') ||
        !e.target.closest('.book-card-button')) {
      if (onClick) onClick();
    }
  };

  return (
    <div 
      className="book-card"
      onClick={handleCardClick}
    >
      {/* Book Image - Fixed Aspect Ratio */}
      <div className="book-card-image-container">
        <img 
          src={getImageSrc(book)} 
          alt={book.title}
          className="book-card-image"
          onError={(e) => handleImageError(e, book.title)}
        />
        
        {/* Stock Badge */}
        {displayStock <= 5 && displayStock > 0 && (
          <div className="book-badge book-badge-stock">
            Only {displayStock} left!
          </div>
        )}
        
        {displayStock <= 0 && (
          <div className="book-badge book-badge-out">
            Out of Stock
          </div>
        )}
        
        {/* Category Badge */}
        {book.category && (
          <div className="book-badge book-badge-category">
            {book.category}
          </div>
        )}
      </div>
      
      {/* Book Info - Fixed Height Content */}
      <div className="book-card-content">
        <h3 className="book-card-title">
          {book.title || "Untitled Book"}
        </h3>
        
        <p className="book-card-author">
          by {book.author || "Unknown Author"}
        </p>
        
        <div className="book-card-meta">
          <div>
            <p className="book-card-price-label">Price</p>
            <p className="book-card-price">
              ₹{book.price || 0}
            </p>
          </div>
          
          <div className="book-card-right-meta">
            <div className="book-card-rating">
              <span>⭐</span>
              <span>4.5</span>
            </div>
            <p className="book-card-stock">
              {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
            </p>
          </div>
        </div>
        
        {/* View Details Button */}
        <button
          className="book-card-button view-details-btn"
          onClick={handleViewDetails}
        >
          <span>📖</span>
          View Details
        </button>
      </div>
    </div>
  );
};

export default BookCard;
