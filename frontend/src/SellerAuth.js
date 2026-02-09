import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerAuth.css';
import { API_URL } from './config';

function SellerAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeName: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessType: '',
    taxId: '',
    idDocument: null,
    bankAccount: ''
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // For signup: step 1 = basic info, step 2 = business info, step 3 = verification

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      idDocument: e.target.files[0]
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!formData.storeName) newErrors.storeName = 'Store name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    }

    if (step === 3) {
      if (!formData.taxId) newErrors.taxId = 'Tax ID is required';
      if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
      if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/seller-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Login failed' });
        return;
      }

      // Save token and seller data
      localStorage.setItem('sellerToken', data.token);
      localStorage.setItem('sellerAuth', JSON.stringify(data.seller));
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/seller-dashboard'), 1500);
    } catch (error) {
      setErrors({ general: 'Connection error. Make sure backend is running.' });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupNext = async (e) => {
    e.preventDefault();
    if (!validateSignupStep()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final submission
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/seller-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          storeName: formData.storeName,
          businessType: formData.businessType,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          taxId: formData.taxId,
          bankAccount: formData.bankAccount,
          idDocument: formData.idDocument ? { name: formData.idDocument.name } : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        return;
      }

      // Save token and seller data
      localStorage.setItem('sellerToken', data.token);
      localStorage.setItem('sellerAuth', JSON.stringify(data.seller));
      setSuccessMessage('Registration successful! Verification pending. Redirecting...');
      setTimeout(() => navigate('/seller-dashboard'), 1500);
    } catch (error) {
      setErrors({ general: 'Connection error. Make sure backend is running.' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-auth-container">
      <nav className="auth-navbar">
        <div className="auth-logo">BlackCart Seller</div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}
          
          {isLogin ? (
            // LOGIN FORM
            <>
              <h2>Seller Login</h2>
              <p className="auth-subtitle">Access your seller dashboard</p>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <p className="auth-switch">
                New seller? <button onClick={() => { setIsLogin(false); setStep(1); }}>Join now</button>
              </p>
            </>
          ) : (
            // SIGNUP FORM
            <>
              <h2>Become a Seller</h2>
              <p className="auth-subtitle">Step {step} of 3 - {step === 1 ? 'Basic Information' : step === 2 ? 'Business Information' : 'Verification'}</p>
              
              {/* Progress Bar */}
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(step / 3) * 100}%` }}></div>
              </div>

              <form onSubmit={handleSignupNext}>
                {/* STEP 1: Basic Information */}
                {step === 1 && (
                  <>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                      {errors.fullName && <span className="error">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                      {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                      />
                      {errors.password && <span className="error">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                      />
                      {errors.phone && <span className="error">{errors.phone}</span>}
                    </div>
                  </>
                )}

                {/* STEP 2: Business Information */}
                {step === 2 && (
                  <>
                    <div className="form-group">
                      <label>Store Name</label>
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="Your business name"
                      />
                      {errors.storeName && <span className="error">{errors.storeName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Business Type</label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                      >
                        <option value="">Select business type</option>
                        <option value="individual">Individual Seller</option>
                        <option value="small_business">Small Business</option>
                        <option value="corporation">Corporation</option>
                      </select>
                      {errors.businessType && <span className="error">{errors.businessType}</span>}
                    </div>

                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your business address"
                      />
                      {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                        {errors.city && <span className="error">{errors.city}</span>}
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                        />
                        {errors.state && <span className="error">{errors.state}</span>}
                      </div>
                      <div className="form-group">
                        <label>Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="Zip code"
                        />
                        {errors.zipCode && <span className="error">{errors.zipCode}</span>}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3: Verification */}
                {step === 3 && (
                  <>
                    <div className="verification-notice">
                      <h4>Identity Verification Required</h4>
                      <p>We need to verify your identity to keep BlackCart safe and secure.</p>
                    </div>

                    <div className="form-group">
                      <label>Tax ID / SSN</label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        placeholder="Your tax ID or SSN"
                      />
                      {errors.taxId && <span className="error">{errors.taxId}</span>}
                    </div>

                    <div className="form-group">
                      <label>Bank Account (for payouts)</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        placeholder="Bank account number"
                      />
                      {errors.bankAccount && <span className="error">{errors.bankAccount}</span>}
                    </div>

                    <div className="form-group">
                      <label>Government ID Document</label>
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          id="idDocument"
                          onChange={handleFileChange}
                          accept="image/*,application/pdf"
                        />
                        <label htmlFor="idDocument" className="file-label">
                          {formData.idDocument ? formData.idDocument.name : 'Choose file (Passport, Driver License, ID Card)'}
                        </label>
                      </div>
                      {errors.idDocument && <span className="error">{errors.idDocument}</span>}
                    </div>

                    <div className="terms">
                      <input type="checkbox" id="terms" />
                      <label htmlFor="terms">
                        I agree to the Terms of Service and Privacy Policy
                      </label>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {step === 3 ? (loading ? 'Completing Verification...' : 'Complete Verification & Join') : 'Next'}
                </button>
              </form>

              {step > 1 && (
                <button
                  className="btn-secondary"
                  onClick={() => setStep(step - 1)}
                  style={{ marginTop: '10px' }}
                >
                  Back
                </button>
              )}

              <p className="auth-switch">
                Already a seller? <button onClick={() => setIsLogin(true)}>Sign in</button>
              </p>
            </>
          )}
        </div>

        <div className="auth-info">
          <h3>Why Sell on BlackCart?</h3>
          <ul>
            <li>✓ Reach millions of customers</li>
            <li>✓ Easy product management</li>
            <li>✓ Real-time order tracking</li>
            <li>✓ Secure payment processing</li>
            <li>✓ 24/7 seller support</li>
            <li>✓ Analytics & insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SellerAuth;
