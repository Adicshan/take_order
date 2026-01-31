import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AllProducts.css';

const API_URL = 'http://localhost:5000/api';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/all`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return b.soldCount - a.soldCount;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <div className="all-products-container">
      <div className="products-header">
        <h1>🛍️ All Products</h1>
        <p>Browse products from all sellers</p>
      </div>

      <div className="products-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-section">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home & Garden</option>
            <option value="Sports">Sports & Outdoors</option>
            <option value="Food">Food & Beverages</option>
            <option value="Other">Other</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="filter-select"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="results-info">
        <p>Showing {filteredAndSortedProducts.length} products</p>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredAndSortedProducts.map(product => (
            <Link 
              to={`/product/${product._id}?seller=${product.sellerId}`}
              key={product._id} 
              className="product-card-link"
            >
              <div className="product-card">
                {product.imageUrl && (
                  <div className="product-image">
                    <img 
                      src={`${API_URL.split('/api')[0]}${product.imageUrl}`}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/250x250?text=Product';
                      }}
                    />
                  </div>
                )}
                
                <div className="product-content">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <span className="category-badge">{product.category}</span>
                  </div>

                  <p className="product-desc">{product.description.substring(0, 60)}...</p>

                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">{product.totalReviews} reviews</span>
                  </div>

                  <div className="stock-info">
                    {product.quantity > 0 ? (
                      <span className="in-stock">✓ {product.quantity} in stock</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>

                  <div className="product-footer">
                    <span className="price">${product.price.toFixed(2)}</span>
                    <button className="add-btn">Add to Cart</button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
