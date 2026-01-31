import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderConfirmation.css';

const API_URL = 'http://localhost:5000/api';

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
  }, [navigate]);

  if (!order) {
    return <div className="loading">Loading order details...</div>;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">✓</div>
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
                <p className="unit-price">${item.price.toFixed(2)}</p>
                <p className="total-price">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="price-breakdown">
          <div className="breakdown-item">
            <span>Subtotal:</span>
            <span>${order.subtotal}</span>
          </div>
          <div className="breakdown-item">
            <span>Shipping:</span>
            <span>{order.shipping === '0.00' ? 'FREE' : `$${order.shipping}`}</span>
          </div>
          <div className="breakdown-total">
            <span>Total:</span>
            <span>${order.total}</span>
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

        <div className="action-buttons">
          <Link to="/" className="continue-btn">
            Continue Shopping
          </Link>
          <Link to="/" className="home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
