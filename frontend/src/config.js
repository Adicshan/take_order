// Global API Configuration
// Use local backend during development when running on localhost
const IS_LOCAL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (IS_LOCAL ? 'http://localhost:5000' : 'https://take-order.onrender.com');
const API_URL = `${API_BASE_URL}/api`;

export { API_BASE_URL, API_URL };
