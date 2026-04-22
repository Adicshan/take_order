import React, { useState } from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;


const Product = ({ product, showBuy = true }) => {
  const [added, setAdded] = useState(false);
  let imageSrc = 'https://via.placeholder.com/300x300?text=No+Image';
  if (product.imageUrl) {

    imageSrc = product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`;

    let url = product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`;
   

    if(url.includes('/upload/')){
      url = url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    imageSrc = url;

  }

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.cartQuantity = Math.min((existing.cartQuantity || 1) + 1, product.quantity || 9999);
    } else {
      cart.push({ ...product, cartQuantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    try { 
      localStorage.setItem('currentSeller', product.sellerId || (product.seller && product.seller._id) || product.seller || '');
   
      const storeSlug = (product.seller && product.seller.storeSlug) || '';
      if (storeSlug) localStorage.setItem('currentStoreSlug', storeSlug);
    } catch(e){}
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const ratingDisplay = typeof product.rating === 'number' ? product.rating.toFixed(1) : (product.rating || null);
  const reviews = product.reviewCount || product.reviews || null;


  const storeSlug = (product.seller && product.seller.storeSlug) || '';
  
  const productDetailLink = storeSlug ? `/${storeSlug}/view/${product._id}` : `/view/${product._id}`;
const isMobile = window.innerWidth <= 480;

  return (
  <Link to={productDetailLink} className="product-card" 
  style={{
    maxWidth: isMobile ? '95vw' : '250px',
    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(10px, 2fr))' : 'repeat(auto-fit, minmax(140px, 1fr))'
  }}
  >
      <div className="product-image">
        {product.imageUrl ? (
          <img
            src={imageSrc}

            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=No+Image')}
          />
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
          <Link to={productDetailLink} className="btn btn-sm outline view-btn" onClick={e => e.stopPropagation()}>View</Link>
         
        </div>
    
      </div>
    </Link>
  );
};

export default Product;
