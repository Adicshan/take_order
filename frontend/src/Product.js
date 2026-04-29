import React, { useState } from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';
import Bag from './header_images/bag.png';

const API_BASE = API_BASE_URL;

const Product = ({ product, showBuy = true }) => {
  const [added, setAdded] = useState(false);

  // ── Image URL ─────────────────────────────────────────────────
  let imageSrc = 'https://via.placeholder.com/300x300?text=No+Image';
  if (product.imageUrl) {
    let url = product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${API_BASE}${product.imageUrl}`;
    if (url.includes('/upload/')) {
      url = url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    imageSrc = url;
  }

  // ── Cart ──────────────────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.cartQuantity = Math.min(
        (existing.cartQuantity || 1) + 1,
        product.quantity || 9999
      );
    } else {
      cart.push({ ...product, cartQuantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    try {
      localStorage.setItem(
        'currentSeller',
        product.sellerId ||
          (product.seller && product.seller._id) ||
          product.seller || ''
      );
      const storeSlug = (product.seller && product.seller.storeSlug) || '';
      if (storeSlug) localStorage.setItem('currentStoreSlug', storeSlug);
    } catch (e) {}
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // ── Derived values ────────────────────────────────────────────
  const ratingDisplay =
    typeof product.rating === 'number'
      ? product.rating.toFixed(1)
      : product.rating || null;
  const reviews = product.reviewCount || product.reviews || null;

  const storeSlug = (product.seller && product.seller.storeSlug) || '';
  const productDetailLink = storeSlug
    ? `/${storeSlug}/view/${product._id}`
    : `/view/${product._id}`;

  const discountPct =
    product.originalPrice && product.price
      ? Math.round((1 - product.price / Number(product.originalPrice)) * 100)
      : null;

  const sellerName =
    (product.seller && product.seller.name) ||
    product.sellerName ||
    (typeof product.seller === 'string' ? product.seller : '') ||
    '';

  // ── Render ────────────────────────────────────────────────────
  return (
  <Link to={productDetailLink} className="product-card">

  {/* Discount Badge */}
  {discountPct > 0 && (
    <span className="discount-badge">-{discountPct}%</span>
  )}

  {/* IMAGE */}
  <div className="product-image">
    {product.imageUrl ? (
      <img
        src={imageSrc}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onError={e =>
          (e.target.src =
            'https://via.placeholder.com/300x300?text=No+Image')
        }
      />
    ) : (
      <div className="image-fallback">{product.image || '🛍️'}</div>
    )}
  </div>

  {/* INFO */}
  <div className="product-info">

    <p className="product-title">{product.name}</p>

    {/* PRICE */}
    <div className="price-row">
      <span className="current">₹{(product.price || 0).toFixed(2)}</span>
    </div>

    {/* BUTTON */}
    <div className="product-actions">
      <span className="view-btn">
        <img src={Bag} alt="Bag" /> VIEW DETAILS
      </span>
    </div>

  </div>

</Link>
  );
};

export default Product;
