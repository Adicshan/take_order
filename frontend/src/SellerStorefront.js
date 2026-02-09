import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './SellerStorefront.css';
import Product from './Product';
import { API_URL } from './config';

const SellerStorefront = () => {
  const { sellerId, storeSlug } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchSellerData();
  }, [sellerId, storeSlug]);

  const fetchSellerData = async () => {
    try {
      // Use storeSlug if available (new route), otherwise use sellerId (legacy)
      let sellerEndpoint;
      let productsEndpoint;
      
      const slug = storeSlug || sellerId; // Use whichever is available
      
      // Check if it looks like a slug (contains letters) or an ID (all hex/numbers)
      const isSlug = slug && /[a-z-]/i.test(slug);
      
      if (isSlug) {
        sellerEndpoint = `${API_URL}/sellers/by-store/${slug}`;
        productsEndpoint = `${API_URL}/products/by-store/${slug}`;
      } else {
        sellerEndpoint = `${API_URL}/sellers/${slug}`;
        productsEndpoint = `${API_URL}/products/by-seller/${slug}`;
      }

      const [sellerRes, productsRes] = await Promise.all([
        fetch(sellerEndpoint),
        fetch(productsEndpoint)
      ]);

      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setSeller(sellerData.seller);
        // Store seller ID and storeSlug for later use
        try { localStorage.setItem('currentSeller', sellerData.seller._id); } catch(e){}
        try { localStorage.setItem('currentStoreSlug', sellerData.seller.storeSlug); } catch(e){}
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    return filterCategory === 'all' || product.category === filterCategory;
  });

  if (loading) {
    return <div className="loading">Loading shop...</div>;
  }

  if (!seller) {
    // If seller not found, render nothing (or you can return null or a minimal message if desired)
    return null;
  }

  return (
    <div className="storefront-container">
      <div className="storefront-header">
        <div className="header-content">
          <h1 style={{color:"white"}} className="store-name-left">{seller.storeName}</h1>
        </div>
      </div>

      <div className="storefront-controls">
        {/* Back link and category filter removed per page-specific design request */}
      </div>

      {/* Preload product images so they load fully */}
      {products.map(p => p.imageUrl ? <link key={p._id} rel="preload" as="image" href={`${API_URL}${p.imageUrl}`} /> : null)}

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products available in this category</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      )}

      <footer className="storefront-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <h2 className="footer-store">{seller.storeName}</h2>
            <div className="seller-meta-footer">
              <span className="business-type">{seller.businessType}</span>
              <span className="seller-owner">By {seller.fullName}</span>
              {seller.isVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
            <div className="contact-info footer-contact-left">
              <p>📞 {seller.phone}</p>
              <p>📍 {typeof seller.address === 'object' ? `${seller.address?.street}, ${seller.address?.city}, ${seller.address?.state} ${seller.address?.zipCode}` : seller.address}</p>
            </div>
          </div>
            <div className="footer-right">
              <div className="branding">BlackCart</div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerStorefront;
