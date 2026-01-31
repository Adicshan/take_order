import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SellerAuth.css';

const API_URL = 'http://localhost:5000/api';

const SellerSignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/seller-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sellerToken', data.token);
        setSuccess('Sign in successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/seller-dashboard'), 1500);
      } else {
        setError(data.message || 'Sign in failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>📦 SellerHub</h1>
          <p>Grow Your Business Online</p>
        </div>
        <div className="auth-benefits">
          <div className="benefit">
            <span className="benefit-icon">✓</span>
            <p>Reach millions of customers</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">✓</span>
            <p>Professional seller dashboard</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">✓</span>
            <p>Secure payment processing</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">✓</span>
            <p>24/7 seller support</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Seller Sign In</h2>
          <p>Access your seller dashboard</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Link to="#" className="forgot-link">Forgot your password?</Link>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have a seller account? <Link to="/seller-signup">Create one now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSignIn;
