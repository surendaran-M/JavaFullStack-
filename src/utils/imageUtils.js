// utils/imageUtils.jsx
/**
 * Utility functions for handling book images
 */

/**
 * Get the appropriate image source for a book
 * @param {Object} book - The book object
 * @returns {string} - The image URL
 */
export const getImageSrc = (book) => {
  // Default placeholder if no book is provided
  if (!book) return "https://placehold.co/300x400/4A6572/FFFFFF?text=Book";
  
  // If book has image data
  if (book.image) {
    // If image is a string
    if (typeof book.image === 'string') {
      // Check for valid URLs or data URLs
      if (book.image.startsWith('http') || book.image.startsWith('data:')) {
        return book.image;
      }
      // Check if it's a long string (likely base64)
      if (book.image.length > 100) { 
        return `data:image/jpeg;base64,${book.image}`;
      }
      return book.image;
    }
    
    // Handle byte array from backend (Spring Boot)
    if (Array.isArray(book.image) || book.image instanceof Uint8Array) {
      try {
        const bytes = new Uint8Array(book.image);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        return `data:image/jpeg;base64,${base64}`;
      } catch (error) {
        console.error('Error converting byte array to Base64:', error);
        // Continue to fallback
      }
    }
  }
  
  // Final fallback: Placeholder with book title
  return `https://placehold.co/300x400/4A6572/FFFFFF?text=${
    encodeURIComponent(book.title ? book.title.substring(0, 20) : 'Book')
  }`;
};

/**
 * Handle image loading errors
 * @param {Event} e - The error event
 * @param {string} bookTitle - The book title for placeholder
 */
export const handleImageError = (e, bookTitle) => {
  // Set placeholder image on error
  e.target.src = `https://placehold.co/300x400/4A6572/FFFFFF?text=${
    encodeURIComponent(bookTitle ? bookTitle.substring(0, 20) : 'Book')
  }`;
  
  // Prevent infinite error loop
  e.target.onerror = null;
};