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
      <div className="storefront-header" >
        <div className="header-content" style={{display:'flex',justifyContent:'space-between',alignItems:'center',height:"35px"}}>
          <p style={{color:'white',fontSize:"1.2rem"}} className="store-name-left">{seller.storeName}</p>
          <span className="whatsapp-contact">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" style={{marginRight:'4px'}}><path fill="#25D366" d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.624 1.934 6.6L3 29l7.6-2.534A12.96 12.96 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.91-.52-5.6-1.5l-.4-.2-4.52 1.51 1.51-4.52-.2-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.04 2.81 1.19 3 .15.19 2.05 3.14 5.01 4.28.7.3 1.25.48 1.68.61.71.23 1.36.2 1.87.12.57-.09 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/></svg>
              <span style={{color:'#fff',fontSize:'0.95rem'}}>8949181434</span>
  
          </span>
        </div>
      </div>

  

      {/* Preload product images so they load fully */}
      {products.map(p => p.imageUrl ? <link key={p._id} rel="preload" as="image" href={`${API_URL}${p.imageUrl}`} /> : null)}

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products available in this category</p>
        </div>
      ) : (
        <div className="products-grid" style={{marginTop:"90px"}}>
          {filteredProducts.map(product => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      )}
          
          {/* Why Shop with Us Section */}
          <section className="why-shop-section">
            <h2 className="why-shop-title">Why Buy from This Seller</h2>
            <div className="why-shop-features">
              <div className="why-shop-feature">
                <h3>Trusted Seller</h3>
                <p>We are a verified seller with a proven track record of quality and reliability.</p>
              </div>
              <div className="why-shop-feature">
                <h3>Safe & Secure Payments</h3>
                <p>Pay confidently—your transactions are protected and processed securely.</p>
              </div>
              <div className="why-shop-feature">
                <h3>Direct Support</h3>
                <p>Get fast, friendly help directly from us for any order or product questions.</p>
              </div>
              <div className="why-shop-feature">
                <h3>Easy Returns</h3>
                <p>Enjoy hassle-free returns within 30 days if you're not satisfied with your purchase.</p>
              </div>
            </div>
          </section>

            <footer className="storefront-footer" style={{backgroundColor:"black",color:"white"}}>
              <div className="footer-inner">
                <div className="footer-left">
                  <h2 className="footer-store">{seller.storeName}</h2>
                  <div className="seller-meta-footer">
                    <span className="business-type">{seller.businessType}</span>
                    <span className="seller-owner">By {seller.fullName}</span>
                    {seller.isVerified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                    <div className="footer-address" style={{color:'#fff',marginTop:'8px',fontSize:'1.05rem'}}>
                      <span role="img" aria-label="address" style={{marginRight:'8px'}}>📍</span>
                      {typeof seller.address === 'object' ? `${seller.address?.street}, ${seller.address?.city}, ${seller.address?.state} ${seller.address?.zipCode}` : seller.address}
                    </div>
                    <div className="footer-phone" style={{color:'#fff',marginTop:'6px',fontSize:'1.05rem'}}>
                      <span role="img" aria-label="phone" style={{marginRight:'8px'}}>📞</span>
                      {seller.phone}
                    </div>
                </div>
                <div className="seller-footer-inner" >
                  <div className="seller-footer-section">
                    <h3 className="seller-footer-title">Store Features</h3>
                    <ul className="footer-info-list">
                      <li>High product quality</li>
                      <li>Reliable delivery experience</li>
                      <li>Direct support from seller</li>
                    </ul>
                  </div>
                  <div className="seller-footer-section">
                    <h3 className="seller-footer-title">Product Quality</h3>
                    <ul className="footer-info-list">
                      <li>Carefully selected products</li>
                      <li>Quality checked for satisfaction</li>
                      <li>Authentic and trusted items</li>
                    </ul>
                  </div>
                  <div className="seller-footer-section">
                    <h3 className="seller-footer-title">Delivery Experience</h3>
                    <ul className="footer-info-list">
                      <li>Fast and secure delivery</li>
                      <li>Real-time tracking</li>
                      <li>Hassle-free returns</li>
                    </ul>
                  </div>
                </div>
                <div className="seller-footer-bottom">
                  <span>© 2026 Adicshan. All rights reserved.</span>
                </div>
              </div>
            </footer>
          </div>
        );
      };
      
      export default SellerStorefront;
