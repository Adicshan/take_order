import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderConfirmation.css';
import { API_URL } from './config';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (!lastOrder) {
      navigate('/cart');
      return;
    }
    setOrder(JSON.parse(lastOrder));
    // Clear cart count after order confirmation
    localStorage.setItem('cartCount', '0');
    // Also clear cart array and notify listeners
    localStorage.setItem('cart', '[]');
    window.dispatchEvent(new Event('cartUpdated'));
  }, [navigate]);

  if (!order) {
    return <div className="loading">Loading order details...</div>;
  }

  // Determine sellerSlug for navigation
  let sellerSlug = order.sellerSlug;
  if (!sellerSlug && order.items && order.items.length > 0) {
    sellerSlug = order.items[0].sellerSlug;
  }

  return (
    <div className="confirmation-container" style={{ background: '#eaffea', minHeight: '100vh', padding: 0 }}>
      <div className="confirmation-content" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #d0ffd0', maxWidth: 540, margin: '0 auto', padding: 32 }}>
        <div className="success-icon" style={{ color: '#39d353', fontSize: '3rem', background: '#eaffea', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>✓</div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">Thank you for your purchase</p>

        <div className="order-details">
          <div className="detail-item">
            <span className="label">Order ID:</span>
            <span className="value">{order.orderId}</span>
          </div>
          <div className="detail-item">
            <span className="label">Order Date:</span>
            <span className="value">{order.orderDate}</span>
          </div>
          <div className="detail-item">
            <span className="label">Status:</span>
            <span className="value status-badge">{order.status}</span>
          </div>
        </div>

        <div className="order-items">
          <h2>Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-qty">Quantity: {item.quantity}</p>
              </div>
              <div className="item-price">
                <p className="unit-price">₹{Number(item.price).toFixed(2)}</p>
                <p className="total-price">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="price-breakdown">
          <div className="breakdown-item">
            <span>Subtotal:</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span>Shipping:</span>
            <span>{order.shipping === '0.00' ? 'FREE' : `₹${Number(order.shipping).toFixed(2)}`}</span>
          </div>
          <div className="breakdown-total">
            <span>Total:</span>
            <span>₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ Your order has been placed successfully</li>
            <li>✓ Sellers will be notified and will start processing</li>
            <li>✓ You will receive tracking information via email</li>
            <li>✓ Expected delivery: 5-7 business days</li>
          </ul>
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <Link
            to="/adicshan"
            className="continue-btn"
            style={{
              background: 'black',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px #eaffea',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Visit Seller Storefront
          </Link>
         
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
