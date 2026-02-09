import React, { useState } from 'react';
import { API_URL } from './config';
import './SellerAuth.css';

const SellerResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/seller-auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email.');
        setSent(true);
      } else {
        setError(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-right" style={{ margin: 'auto' }}>
        <div className="auth-form-wrapper">
          <h2>Reset Password</h2>
          <p>Enter your email to receive password reset instructions.</p>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          {!sent && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerResetPassword;
