import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Order.css';
import { API_URL } from './config';

const Order = () => {
 
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (!pendingOrder) {
      navigate('/cart');
      return;
    }
    setOrder(JSON.parse(pendingOrder));
    setLoading(false);
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Group items by seller
      const ordersBySellerMap = {};
      
      order.items.forEach(item => {
        const itemSellerId = item.sellerId && item.sellerId._id ? item.sellerId._id : item.sellerId;
        const key = String(itemSellerId);
        if (!ordersBySellerMap[key]) {
          ordersBySellerMap[key] = [];
        }
        ordersBySellerMap[key].push({
          productId: item._id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        });
      });

      // Save orders by seller to database
      for (const [sId, products] of Object.entries(ordersBySellerMap)) {
        try {
          await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sellerId: sId,
              items: products,
              subtotal: order.subtotal,
              shipping: order.shipping,
              total: order.total,
              status: 'pending',
              buyer: formData
            })
          });
        } catch (error) {
          console.log('Order creation error:', error);
        }
      }

      // Update order with buyer details
      const completedOrder = {
        ...order,
        buyer: formData,
        status: 'confirmed'
      };

      // Save to localStorage
      localStorage.setItem('lastOrder', JSON.stringify(completedOrder));
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('cart');

      // Navigate to confirmation page
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !order) {
    return <div className="loading">Loading order details...</div>;
  }

  return (
    <div className="order-container">
      <div className="order-content">
        <button className="back-btn" onClick={() => navigate('/cart')}>← Back to Cart</button>

        <div className="order-main">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{order.shipping === '0.00' ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              <div className="total-row total">
                <span>Total:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Address Form */}
          <div className="address-form-section">
            <h2>Delivery & Contact Details</h2>
            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                    placeholder="New York"
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={errors.state ? 'error' : ''}
                    placeholder="NY"
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={errors.zipCode ? 'error' : ''}
                    placeholder="10001"
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate('/cart')}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                  style={submitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 18, height: 18, border: '3px solid #fff', borderTop: '3px solid #39d353', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
                      Processing...
                    </span>
                  ) : 'Confirm & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
