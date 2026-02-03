import React, { useState, useEffect } from 'react';

import './AllProducts.css';
import Product from './Product';
import { API_URL } from './config';

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
        console.log('All Products loaded:', data.products);
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
        <h1>All Products</h1>
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
            <Product key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
