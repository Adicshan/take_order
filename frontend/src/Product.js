import React, { useState } from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;

// Reusable product card for lists/grid
const Product = ({ product, showBuy = true }) => {
  const [added, setAdded] = useState(false);
  const imageSrc = product.imageUrl ? `${API_BASE}${product.imageUrl}` : 'https://via.placeholder.com/300x300?text=No+Image';

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.cartQuantity = Math.min((existing.cartQuantity || 1) + 1, product.quantity || 9999);
    } else {
      cart.push({ ...product, cartQuantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // remember last seller viewed/added for cart navigation
    try { 
      localStorage.setItem('currentSeller', product.sellerId || (product.seller && product.seller._id) || product.seller || '');
      // Also store the seller's storeSlug if available
      const storeSlug = (product.seller && product.seller.storeSlug) || '';
      if (storeSlug) localStorage.setItem('currentStoreSlug', storeSlug);
    } catch(e){}
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const ratingDisplay = typeof product.rating === 'number' ? product.rating.toFixed(1) : (product.rating || null);
  const reviews = product.reviewCount || product.reviews || null;

  // Get storeSlug for URL generation
  const storeSlug = (product.seller && product.seller.storeSlug) || '';
  // Use /:storeSlug/view/:productId as the human-friendly product link (alias of /:storeSlug/product/:productId)
  const productDetailLink = storeSlug ? `/${storeSlug}/view/${product._id}` : `/view/${product._id}`;

  return (
    <div className="product-card">
      <div className="product-image">
        {/* If image is an emoji or simple string, show it; otherwise show image */}
        {product.imageUrl ? (
          <img src={imageSrc} alt={product.name} loading="eager" decoding="async" onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=No+Image')} />
        ) : (
          <div className="image-fallback">{product.image || '🛍️'}</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="seller-name">{(product.seller && product.seller.name) || product.sellerName || product.seller || 'Unknown Seller'}</p>
        <div className="rating" style={{display:"none"}}>
          <span className="stars">★★★★★</span>
          <span className="rating-score">{ratingDisplay || '-'}</span>
          {reviews ? <span className="reviews">({reviews})</span> : null}
        </div>
        <div className="price">
          <span className="current">₹{(product.price || 0).toFixed(2)}</span>
          {product.originalPrice ? <span className="original">₹{Number(product.originalPrice).toFixed(2)}</span> : null}
        </div>
        <div className="product-actions">
          <Link to={productDetailLink} className="btn btn-sm outline view-btn">View</Link>
          {showBuy && (
            <button className="btn primary" style={{color:"5px"}} onClick={handleAddToCart}>Add to Cart</button>
          )}
        </div>
        {added && <div className="added-badge">Added ✓</div>}
      </div>
    </div>
  );
};

export default Product;
