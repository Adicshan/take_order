import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './CustomerCart.css';

const API_URL = 'http://localhost:5000/api';

const CustomerCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  useEffect(() => {
    loadCart();
  }, []);

  const sellerIdForLinks = () => {
    if (params && params.sellerId) return params.sellerId;
    const stored = localStorage.getItem('currentSeller');
    if (stored) return stored;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart && cart.length > 0 ? (cart[0].sellerId || '') : '';
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
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item._id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      // Get the first seller from cart items
      const firstSellerId = cartItems[0]?.sellerId;

      // Create order and store in localStorage
      const order = {
        orderId: 'ORD-' + Date.now(),
        orderDate: new Date().toLocaleString(),
        items: cartItems.map(item => ({
          _id: item._id,
          name: item.name,
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

      // Save order to localStorage for the order page to use
      localStorage.setItem('pendingOrder', JSON.stringify(order));

      // Navigate to order page with seller ID
      navigate(`/order/${firstSellerId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    const sellerLink = sellerIdForLinks() ? `/product/${sellerIdForLinks()}` : '/';
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h1>🛒 Your Cart is Empty</h1>
          <p>Add some products to get started</p>
          <Link to={sellerLink} className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <Link to={ sellerIdForLinks() ? `/product/${sellerIdForLinks()}` : '/' } className="back-link">← Continue Shopping</Link>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img 
                      src={`${API_URL.split('/api')[0]}${item.imageUrl}`}
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
                  <p className="item-description">{item.description?.substring(0, 50)}...</p>
                  <p className="item-category">{item.category}</p>
                </div>

                <div className="item-price">
                  <span>${item.price.toFixed(2)}</span>
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
                  ${(item.price * item.cartQuantity).toFixed(2)}
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
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            {shipping === 0 && (
              <p className="shipping-note">✓ Free shipping on orders over $50</p>
            )}

            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <div className="cart-notes">
              <p>✓ Secure payment processing</p>
              <p>✓ Fast and reliable delivery</p>
              <p>✓ 100% authentic products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
