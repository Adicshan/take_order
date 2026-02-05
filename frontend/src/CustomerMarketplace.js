import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CustomerMarketplace.css';
import { API_URL } from './config';

const CustomerMarketplace = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sellers/all`);
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || seller.businessType === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <div className="header-content">
          <h1>📦 Marketplace</h1>
          <p>Discover products from trusted sellers</p>
        </div>
      </header>

      <div className="marketplace-filters">
        <input
          type="text"
          placeholder="Search sellers by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="category-filter">
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home">Home & Garden</option>
          <option value="Sports">Sports & Outdoors</option>
          <option value="Food">Food & Beverages</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading sellers...</div>
      ) : filteredSellers.length === 0 ? (
        <div className="empty-state">
          <p>No sellers found matching your search.</p>
        </div>
      ) : (
        <div className="sellers-grid">
          {filteredSellers.map(seller => (
            <Link to={`/${seller.storeSlug}`} key={seller._id} className="seller-card-link">
              <div className="seller-card">
                <div className="seller-badge">{seller.businessType}</div>
                <div className="seller-info">
                  <h3>{seller.storeName}</h3>
                  <p className="seller-owner">{seller.fullName}</p>
                  <p className="seller-phone">📞 {seller.phone}</p>
                  <div className="seller-status">
                    {seller.isVerified ? (
                      <span className="verified">✓ Verified Seller</span>
                    ) : (
                      <span className="pending">⏳ Pending Verification</span>
                    )}
                  </div>
                </div>
                <button className="view-shop-btn">View Shop →</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerMarketplace;
