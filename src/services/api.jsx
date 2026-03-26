// services/api.jsx - COMPLETE FIXED VERSION

import { mockBooks, mockUsers } from './mockData';

const BASE_URL = "http://localhost:8080";
const USE_MOCK_DATA = false; // Set to true for development without backend

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readStoredArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

// GET ALL BOOKS
export const getAllBooks = async () => {
  console.log("Fetching all books...");
  
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await delay(300);
    console.log("Returning mock books:", mockBooks.length);
    return mockBooks;
  }
  
  try {
    console.log("Calling API:", `${BASE_URL}/api/books/all`);
    const response = await fetch(`${BASE_URL}/api/books/all`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log("API books response:", data.length);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching books:", err);
    // Fallback to mock data if API fails
    return mockBooks;
  }
};

// LOGIN
export const login = async (credentials) => {
  console.log("Login attempt with:", { 
    email: credentials.email, 
    password: "***", 
    role: credentials.role 
  });
  
  if (USE_MOCK_DATA) {
    await delay(300);
    console.log("Checking mock users:", mockUsers);
    
    // Find user by email (case insensitive)
    const user = mockUsers.find((u) => 
      u.email.toLowerCase() === credentials.email.toLowerCase().trim()
    );
    
    console.log("Found user:", user ? "Yes" : "No");
    
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // Check password (exact match for mock data)
    if (user.password !== credentials.password) {
      console.log("Password mismatch:", user.password, "!=", credentials.password);
      throw new Error("Invalid email or password");
    }
    
    // Use role from credentials if provided, otherwise from user data
    const userRole = credentials.role || user.role || "buyer";
    
    console.log("Login successful! User role:", userRole);
    
    // Return user data without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      ...(user.storeVerified && { storeVerified: user.storeVerified })
    };
  }
  
  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Login failed with status ${response.status}`);
    }

    const userData = await response.json();
    console.log("API login response:", userData);
    return userData;
  } catch (err) {
    console.error("API login error:", err);
    throw new Error("Network error. Please check your connection.");
  }
};

// SIGNUP
export const signup = async (data) => {
  console.log("Signup attempt with:", { 
    name: data.name, 
    email: data.email, 
    password: "***", 
    role: data.role 
  });
  
  if (USE_MOCK_DATA) {
    await delay(300);
    
    const email = String(data?.email || "").trim().toLowerCase();
    const password = String(data?.password || "");
    const name = String(data?.name || "").trim();
    const role = data?.role || "buyer";

    // Validation
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    // Check if email already exists
    const emailExists = mockUsers.some((u) => u.email.toLowerCase() === email);
    if (emailExists) {
      throw new Error("Email already exists. Please use a different email or login.");
    }

    // Create new user
    const nextId = Math.max(0, ...mockUsers.map((u) => Number(u.id) || 0)) + 1;
    const newUser = { 
      id: nextId, 
      name, 
      email, 
      password, 
      role 
    };
    
    console.log("Adding new user to mock data:", newUser);
    mockUsers.push(newUser);
    
    // Return user data without password
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  }

  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Signup failed with status ${response.status}`);
    }

    const userData = await response.json();
    console.log("Signup API response:", userData);
    return userData;
  } catch (err) {
    console.error("Signup API error:", err);
   throw new Error("Invalid values provided.");
  }
};

// ADD TO CART
export const addToCart = async (userId, bookId) => {
  console.log("Add to cart:", { userId, bookId });
  
  if (USE_MOCK_DATA) {
    await delay(150);
    const uid = String(userId);
    const bid = Number(bookId);
    
    // Find book
    const book = mockBooks.find((b) => Number(b.id) === bid);
    if (!book) throw new Error("Book not found");
    const bookStock = Number(book.stock ?? 0);
    if (Number.isFinite(bookStock) && bookStock <= 0) {
      throw new Error("This book is out of stock");
    }

    const cartKey = `cart_${uid}`;
    const cart = readStoredArray(cartKey);
    const existing = cart.find((it) => Number(it.id) === bid);
    
    if (existing) {
      const currentQty = Number(existing.quantity ?? 0);
      const nextQty = (Number.isFinite(currentQty) ? currentQty : 0) + 1;

      if (Number.isFinite(bookStock) && nextQty > bookStock) {
        throw new Error(`Only ${bookStock} items available in stock!`);
      }

      existing.quantity = nextQty;
    } else {
      cart.push({ 
        ...book, 
        quantity: 1,
        bookTitle: book.title // Add bookTitle for compatibility
      });
    }
    
    writeStoredArray(cartKey, cart);
    console.log("Cart updated:", cart);
    return cart;
  }

  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bookId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Add to cart API response:", data);
    return data;
  } catch (err) {
    console.error("Add to cart error:", err);
    throw new Error("Failed to add to cart. Please try again.");
  }
};

// GET CART
export const getCart = async (userId) => {
  console.log("Get cart for user:", userId);
  
  if (USE_MOCK_DATA) {
    await delay(150);
    const cartKey = `cart_${userId}`;
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        console.log("Cart from localStorage:", cart);
        return cart;
      } catch {
        console.log("Invalid cart data in localStorage");
        return [];
      }
    }
    
    console.log("No cart found for user");
    return [];
  }
  
  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/cart/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log("Cart API response:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching cart:", err);
    return [];
  }
};

// PLACE ORDER
export const placeOrder = async (orderData) => {
  console.log("Placing order:", orderData);
  
  if (USE_MOCK_DATA) {
    await delay(200);
    
    // Create order with ID
    const order = { 
      id: Date.now(), 
      ...orderData,
      status: "completed",
      orderDate: orderData.orderDate || new Date().toISOString().split("T")[0]
    };
    
    // Save to localStorage
    const ordersKey = `orders_${orderData.userId}`;
    const orders = readStoredArray(ordersKey);
    orders.unshift(order);
    writeStoredArray(ordersKey, orders);
    
    // Clear cart
    const cartKey = `cart_${orderData.userId}`;
    localStorage.removeItem(cartKey);
    
    console.log("Order placed:", order);
    return order;
  }

  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/orders/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to place order: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Place order API response:", data);
    return data;
  } catch (err) {
    console.error("Place order error:", err);
    throw new Error("Failed to place order. Please try again.");
  }
};

// GET ORDERS
export const getOrders = async (userId) => {
  console.log("Getting orders for user:", userId);
  
  if (USE_MOCK_DATA) {
    await delay(150);
    const orders = readStoredArray(`orders_${userId}`);
    console.log("Orders from localStorage:", orders);
    return orders;
  }

  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load orders: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Orders API response:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Get orders error:", err);
    throw new Error("Failed to load orders.");
  }
};

// ADD BOOK WITH IMAGE
export const addBookWithImage = async (formData) => {
  console.log("Adding book with image...");
  
  if (USE_MOCK_DATA) {
    await delay(200);
    
    // Extract form data
    const title = String(formData.get("title") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const category = String(formData.get("category") || "").trim() || "Fiction";
    const stock = Number(formData.get("stock") || 0);
    const price = Number(formData.get("price") || 0);
    const description = String(formData.get("description") || "").trim();
    const imageFile = formData.get("image");

    // Validation
    if (!title || !author) {
      throw new Error("Title and author are required");
    }

    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }

    if (price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Handle image
    let image = "";
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        image = await fileToDataUrl(imageFile);
      } catch (err) {
        console.error("Error reading image:", err);
        // Use placeholder if image fails
        image = `https://placehold.co/300x400/4A6572/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`;
      }
    } else {
      // Use placeholder if no image
      image = `https://placehold.co/300x400/4A6572/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`;
    }

    // Create new book
    const nextId = Math.max(0, ...mockBooks.map((b) => Number(b.id) || 0)) + 1;
    const newBook = { 
      id: nextId, 
      title, 
      author, 
      category, 
      stock, 
      price, 
      description, 
      image 
    };
    
    mockBooks.unshift(newBook);
    console.log("Book added:", newBook);
    return newBook;
  }

  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/books/addBook`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add book: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Add book API response:", data);
    return data;
  } catch (err) {
    console.error("Add book error:", err);
    throw new Error("Failed to add book. Please try again.");
  }
};

// GET BOOK IMAGE URL
export const getBookImageUrl = (bookId) => {
  if (USE_MOCK_DATA) {
    // For mock data, return null - images are embedded in book objects
    return null;
  }
  
  return `${BASE_URL}/api/books/${bookId}/image`;
};

// SEARCH BOOKS (Helper function)
export const searchBooks = async (query, filters = {}) => {
  console.log("Searching books:", { query, filters });
  
  if (USE_MOCK_DATA) {
    await delay(200);
    
    let results = [...mockBooks];
    
    // Apply search query
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      results = results.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    if (filters.category && filters.category !== 'all') {
      results = results.filter(book => 
        book.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    if (filters.minPrice !== undefined) {
      results = results.filter(book => book.price >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      results = results.filter(book => book.price <= filters.maxPrice);
    }
    
    if (filters.inStock === true) {
      results = results.filter(book => book.stock > 0);
    }
    
    console.log("Search results:", results.length);
    return results;
  }
  
  // Real API call
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.inStock) params.append('inStock', filters.inStock);
    
    const response = await fetch(`${BASE_URL}/api/books/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Search API response:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Search error:", err);
    return mockBooks; // Fallback to mock data
  }
};

// UPDATE BOOK STOCK (for sellers)
export const updateBookStock = async (bookId, stock) => {
  console.log("Updating book stock:", { bookId, stock });
  
  if (USE_MOCK_DATA) {
    await delay(150);
    
    const bookIndex = mockBooks.findIndex(b => Number(b.id) === Number(bookId));
    
    if (bookIndex === -1) {
      throw new Error("Book not found");
    }
    
    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }
    
    mockBooks[bookIndex].stock = stock;
    console.log("Stock updated:", mockBooks[bookIndex]);
    return mockBooks[bookIndex];
  }
  
  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/books/${bookId}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update stock: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Update stock API response:", data);
    return data;
  } catch (err) {
    console.error("Update stock error:", err);
    throw new Error("Failed to update stock. Please try again.");
  }
};

// GET BOOK BY ID
export const getBookById = async (bookId) => {
  console.log("Getting book by ID:", bookId);
  
  if (USE_MOCK_DATA) {
    await delay(100);
    
    const book = mockBooks.find(b => Number(b.id) === Number(bookId));
    
    if (!book) {
      throw new Error("Book not found");
    }
    
    console.log("Found book:", book.title);
    return book;
  }
  
  // Real API call
  try {
    const response = await fetch(`${BASE_URL}/api/books/${bookId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get book: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Get book API response:", data);
    return data;
  } catch (err) {
    console.error("Get book error:", err);
    throw new Error("Failed to load book details.");
  }
};

// Export mock data for testing
export { mockBooks, mockUsers };
