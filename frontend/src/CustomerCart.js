import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './CustomerCart.css';
import { API_URL } from './config';

const CustomerCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  useEffect(() => {
    loadCart();
  }, []);

  const sellerIdForLinks = () => {
    if (params && params.storeSlug) return params.storeSlug;
    const stored = localStorage.getItem('currentStoreSlug');
    if (stored) return stored;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart && cart.length > 0 ? (cart[0].seller?.storeSlug || cart[0].seller?._id || '') : '';
  };



  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (productId, newQuantity) => {
    const updated = cartItems.map(item => 
      item._id === productId 
        ? { ...item, cartQuantity: Math.max(1, Math.min(newQuantity, item.quantity)) }
        : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // notify floating cart and other listeners
    try { window.dispatchEvent(new Event('cartUpdated')); } catch(e){}
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item._id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // notify floating cart and other listeners
    try { window.dispatchEvent(new Event('cartUpdated')); } catch(e){}
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
      if (cartItems.length === 0) return;
      setLoading(false);
    // Only navigate to order page, payment is now handled there
        // Only navigate to order page, payment is now handled there
        if (cartItems.length === 0) return;
        // Get the first seller from cart items — prefer storeSlug, fall back to stored values
        const firstItem = cartItems[0] || {};
        const firstSellerSlug = firstItem?.seller?.storeSlug || localStorage.getItem('currentStoreSlug') || '';
        const firstSellerId = firstItem?.sellerId || firstItem?.seller?._id || localStorage.getItem('currentSeller') || '';
        // Create order and store in localStorage
        const order = {
          orderId: 'ORD-' + Date.now(),
          orderDate: new Date().toLocaleString(),
          items: cartItems.map(item => ({
            _id: item._id,
            name: item.name,
            category:item.category,
            ...(item.category === 'Clothing' && item.selectedSize ? { size: item.selectedSize } : {}),
            price: item.price,
            quantity: item.cartQuantity,
            sellerId: item.sellerId,
            imageUrl: item.imageUrl
          })),
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          status: 'pending'
        };
        localStorage.setItem('pendingOrder', JSON.stringify(order));
        let orderLink = '/cart';
        if (firstSellerSlug) {
          orderLink = `/${firstSellerSlug}/order`;
        } else if (firstSellerId) {
          try {
            const sellerRes = await fetch(`${API_URL}/sellers/${firstSellerId}`);
            if (sellerRes.ok) {
              const sellerData = await sellerRes.json();
              const resolvedSlug = sellerData.seller?.storeSlug || sellerData.storeSlug || '';
              if (resolvedSlug) {
                try { localStorage.setItem('currentStoreSlug', resolvedSlug); } catch(e){}
                orderLink = `/${resolvedSlug}/order`;
              } else {
                orderLink = `/order/${firstSellerId}`;
              }
            } else {
              orderLink = `/order/${firstSellerId}`;
            }
          } catch (err) {
            console.error('Failed to resolve seller slug:', err);
            orderLink = `/order/${firstSellerId}`;
          }
        }
        if (!orderLink || orderLink === '/') {
          alert('Unable to determine seller for checkout. Please ensure cart items belong to a seller.');
          return;
        }
        navigate(orderLink);
  };

  return (
    <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item._id + (item.selectedSize || '')} className="cart-item">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.split('/api')[0]}${item.imageUrl}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  {item.category === 'Clothing' && item.selectedSize && (
                    <p className="item-size">Size: <b>{item.selectedSize}</b></p>
                  )}
                  <p className="item-description">{item.description?.substring(0, 50)}...</p>
                  <p className="item-category">{item.category}</p>
                </div>

                <div className="item-price">
                  <span>₹{item.price.toFixed(2)}</span>
                </div>

                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item._id, item.cartQuantity - 1)}>−</button>
                  <input 
                    type="number" 
                    value={item.cartQuantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                  />
                  <button onClick={() => updateQuantity(item._id, item.cartQuantity + 1)}>+</button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.cartQuantity).toFixed(2)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeItem(item._id)}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-line">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  <span className="free-shipping">FREE</span>
               //   `₹${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            {shipping === 0 && (
              <p className="shipping-note">✓ Free shipping on orders over ₹50</p>
            )}

            <div className="summary-total">
              <span>Total</span>
              <span style={{ marginLeft: 'auto', minWidth: '100px', textAlign: 'right', display: 'inline-block' }}>₹{total.toFixed(2)}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <div className="cart-notes">
              <p>✓ Fast and reliable delivery</p>
              <p>✓ 100% authentic products</p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default CustomerCart;
