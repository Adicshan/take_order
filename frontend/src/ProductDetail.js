import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { API_URL } from './config';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [buyer, setBuyer] = useState({ fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' });

  useEffect(() => {
     const fetchProductData = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        
        // Fetch seller info
        const sellerRes = await fetch(`${API_URL}/sellers/${data.product.sellerId}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSeller(sellerData.seller);
          // remember seller for cart navigation
          try { 
            localStorage.setItem('currentSeller', sellerData.seller._id);
            localStorage.setItem('currentStoreSlug', sellerData.seller.storeSlug);
          } catch(e){}
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

    fetchProductData();
  }, [productId]);

 
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.cartQuantity += quantity;
    } else {
      cart.push({
        ...product,
        cartQuantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    // notify other UI that cart changed
    try { window.dispatchEvent(new Event('cartUpdated')); } catch(e){}
    // Store seller info for navigation
    if (seller) {
      try { 
        localStorage.setItem('currentSeller', seller._id);
        localStorage.setItem('currentStoreName', seller.storeName);
      } catch(e){}
    }
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

 

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  const total = (product.price * quantity).toFixed(2);

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-detail-content">
        <div className="product-images">
          {product.imageUrl ? (
            <img 
              src={`${API_URL.split('/api')[0]}${product.imageUrl}`}
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          ) : (
            <div className="no-image">No image available</div>
          )}
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>
          
          <div className="seller-info-box">
              {seller && (
                <>
                  <p className="seller-name">🏪 Sold by: <strong>{seller.storeName}</strong></p>
                </>
              )}
          </div>

          {/* rating removed per design update */}

          <div className="product-price">
            <span className="price-label">Price:</span>
            <span className="price-value">₹{Number(product.price).toFixed(2)}</span>
          </div>

          <div className="product-stock">
            <span className={product.quantity > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.quantity > 0 ? `✓ In Stock (${product.quantity} available)` : '✗ Out of Stock'}
            </span>
          </div>

          <div className="product-category">
            <span className="category-badge">{product.category}</span>
            <span className="status-badge">{product.status}</span>
          </div>

          <div className="product-description">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>

          {product.quantity > 0 && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    max={product.quantity}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="price-summary">
                <div className="summary-item">
                  <span>Unit Price:</span>
                  <span>₹{Number(product.price).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="cart-btn"
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart
                </button>
                <button 
                  className="buy-btn"
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => {
                      const cartLink = seller && seller.storeSlug ? `/${seller.storeSlug}/cart` : '/cart';
                      navigate(cartLink);
                    }, 300);
                  }}
                >
                  ⚡ Buy Now
                </button>
              </div>

              {addedToCart && (
                <div className="success-message">✓ Added to cart successfully!</div>
              )}
              {showCheckoutForm && (
                <div className="checkout-form">
                  <h3>Billing & Delivery Details</h3>
                  <div className="form-row">
                    <input placeholder="Full name" value={buyer.fullName} onChange={(e)=>setBuyer({...buyer, fullName: e.target.value})} />
                    <input placeholder="Email" value={buyer.email} onChange={(e)=>setBuyer({...buyer, email: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <input placeholder="Phone" value={buyer.phone} onChange={(e)=>setBuyer({...buyer, phone: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <input placeholder="Address line" value={buyer.address} onChange={(e)=>setBuyer({...buyer, address: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <input placeholder="City" value={buyer.city} onChange={(e)=>setBuyer({...buyer, city: e.target.value})} />
                    <input placeholder="State" value={buyer.state} onChange={(e)=>setBuyer({...buyer, state: e.target.value})} />
                    <input placeholder="ZIP" value={buyer.zipCode} onChange={(e)=>setBuyer({...buyer, zipCode: e.target.value})} />
                  </div>
                  <div className="form-actions">
                    <button className="cart-btn" onClick={()=>setShowCheckoutForm(false)}>Cancel</button>
                    <button className="buy-btn" onClick={async ()=>{
                      // simple validation
                      if (!buyer.fullName || !buyer.address) { alert('Please enter name and address'); return; }
                      const orderObj = {
                        orderId: 'ORD-'+Date.now(),
                        orderDate: new Date().toLocaleString(),
                        items: [{ _id: product._id, name: product.name, price: product.price, quantity }],
                        subtotal: (product.price * quantity).toFixed(2),
                        tax: (product.price * quantity * 0.1).toFixed(2),
                        shipping: (product.price * quantity > 50 ? 0 : 9.99).toFixed(2),
                        total: ( (product.price * quantity) * 1.1 + (product.price * quantity > 50 ? 0 : 9.99) ).toFixed(2),
                        status: 'pending',
                        buyer
                      };

                      try {
                        await fetch(`${API_URL}/orders/create`, {
                          method: 'POST', headers: {'Content-Type':'application/json'},
                          body: JSON.stringify({ sellerId: product.sellerId, items: orderObj.items, subtotal: orderObj.subtotal, tax: orderObj.tax, shipping: orderObj.shipping, total: orderObj.total, status: orderObj.status, buyer })
                        });
                      } catch(err){ console.log('order create error', err); }

                      localStorage.setItem('lastOrder', JSON.stringify(orderObj));
                      localStorage.removeItem('cart');
                      window.dispatchEvent(new Event('cartUpdated'));
                      navigate('/order-confirmation');
                    }}>Place Order</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
