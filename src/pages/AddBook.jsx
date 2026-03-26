import React, { useState } from 'react';
import '../styles/AddBook.css';

function AddBook() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Fiction",
    stock: 1,
    price: "",
    description: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    "Fiction", "Fantasy", "Non-Fiction", "Science", "Programming",
    "Business", "Romance", "Psychology", "Cookbook", "Travel",
    "Health", "History", "Mystery", "Biography", "Art",
    "Music", "Self-Help", "Thriller", "Children", "Calssic", "Philosophy", "Technology"
];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch('http://localhost:8080/api/books/addBook', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        await response.json();
        setSuccess(true);
        
        // Reset form
        setFormData({
          title: "",
          author: "",
          category: "Fiction",
          stock: 1,
          price: "",
          description: ""
        });
        setImageFile(null);
        setImagePreview(null);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="add-book-container">
      <div className="add-book-card">
        <h2 className="add-book-title">📚 Add New Book</h2>
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>Book added successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Book Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Author <span className="required">*</span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter author name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Stock <span className="required">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Price <span className="required">*</span>
              </label>
              <div className="price-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Book Cover Image
              </label>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="image-upload"
                  className="file-input"
                />
                <label htmlFor="image-upload" className="file-upload-label">
                  <span className="upload-icon">📁</span>
                  <span>Choose Image</span>
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="5"
                placeholder="Enter book description..."
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Book...
              </>
            ) : (
              'Add Book to Library'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;
