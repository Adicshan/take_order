import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './SellerStorefront.css';
import { API_URL } from './config';

import Product from './Product';
import shippingIcon from './header_images/shipping.png';
import returnsIcon from './header_images/return.png';
import paymentsIcon from './header_images/payment.png';

const SellerStorefront = () => {
  const { sellerId, storeSlug } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  let imgSrc = 'https://via.placeholder.com/300x300?text=No+Image';
  if (seller && seller.storeImg) {
    let url = seller.storeImg.startsWith('http')
      ? seller.storeImg
      : `${API_URL}${seller.storeImg}`;
    if (url.includes('/upload/')) {
      url = url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    imgSrc = url;
  }

  useEffect(() => {
    fetchSellerData();
  }, [sellerId, storeSlug]);

  const fetchSellerData = async () => {
    try {
      const slug = storeSlug || sellerId;
      const isSlug = slug && /[a-z-]/i.test(slug);

      const sellerEndpoint = isSlug
        ? `${API_URL}/sellers/by-store/${slug}`
        : `${API_URL}/sellers/${slug}`;

      const productsEndpoint = isSlug
        ? `${API_URL}/products/by-store/${slug}`
        : `${API_URL}/products/by-seller/${slug}`;

      const [sellerRes, productsRes] = await Promise.all([
        fetch(sellerEndpoint),
        fetch(productsEndpoint)
      ]);

      const sellerData = await sellerRes.json();
      const productData = await productsRes.json();

      setSeller(sellerData.seller);
      setProducts(productData.products || []);
      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Store...</div>;
  if (!seller) return null;

  return (
    <div className="store">

   <div className="topbar">
  <span>
    <img src={shippingIcon} alt="shipping" />
    Free Shipping Above ₹999
  </span>

  <span className="divider">|</span>

  <span>
    <img src={returnsIcon} alt="returns" />
    Easy Returns
  </span>

  <span className="divider">|</span>

  <span>
    <img src={paymentsIcon} alt="payments" />
    Secure Payments
  </span>
</div>
  

      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `url(${imgSrc})`}}>
        <div className="hero-text">
          <h1>{seller.storeName}</h1>
          <p>{seller.storeDesc}</p>
          <button>Shop Now</button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section">
        <div className="section-head">
          <h3>Best Products</h3>
        </div>

        <div className="products-grid">
         {products.map((product) => ( <Product key={product._id} product={product} /> ))}
        </div>
      </section>

      {/* FOOTER */}
<footer className="seller-footer">
  <div className="footer-wrap">

    {/* LEFT */}
    <div className="footer-left">
      <h2 className="store-name">{seller.storeName}</h2>

      <p className="meta">
        {seller.businessType} • By {seller.fullName}
      </p>

      {seller.isVerified && (
        <span className="verified">Verified Store</span>
      )}

      <p className="contact">
        {seller.phone}
      </p>

      <p className="address">
        {typeof seller.address === 'object'
          ? `${seller.address?.city}, ${seller.address?.state}`
          : seller.address}
      </p>
    </div>


  </div>
</footer>
    </div>
  );
};

export default SellerStorefront;