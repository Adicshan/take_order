import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SellerAuth.css';

const API_URL = 'http://localhost:5000/api';

const SellerSignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Step 2 - Business Info
    storeName: '',
    businessType: 'individual',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    // Step 3 - Verification
    taxId: '',
    bankAccount: '',
    idDocument: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, idDocument: e.target.files[0] }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all personal information fields');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.storeName || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all business information fields');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.taxId || !formData.bankAccount) {
      setError('Please fill in verification details');
      return false;
    }
    if (!formData.idDocument) {
      setError('Please upload an ID document');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        storeName: formData.storeName,
        businessType: formData.businessType,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        taxId: formData.taxId,
        bankAccount: formData.bankAccount
      };

      const response = await fetch(`${API_URL}/seller-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sellerToken', data.token);
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/seller-dashboard'), 1500);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="auth-container signup">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>📦 SellerHub</h1>
          <p>Start Selling Today</p>
        </div>
        <div className="auth-benefits">
          <div className="benefit">
            <span className="benefit-icon">1</span>
            <p><strong>Personal Info</strong> - Your details</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">2</span>
            <p><strong>Business Info</strong> - Store details</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">3</span>
            <p><strong>Verification</strong> - Confirm identity</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Seller Sign Up</h2>
          <p>Create your seller account in 3 steps</p>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">Step {step} of 3</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Step 1 - Personal Info */}
            {step === 1 && (
              <div className="form-step">
                <h3>Personal Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>

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
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - Business Info */}
            {step === 2 && (
              <div className="form-step">
                <h3>Business Information</h3>
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="My Awesome Store"
                  />
                </div>

                <div className="form-group">
                  <label>Business Type</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange}>
                    <option value="individual">Individual</option>
                    <option value="small_business">Small Business</option>
                    <option value="corporation">Corporation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Verification */}
            {step === 3 && (
              <div className="form-step">
                <h3>Verification Details</h3>
                <div className="form-group">
                  <label>Tax ID / EIN</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Bank Account (for payments)</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    placeholder="Account number"
                  />
                </div>

                <div className="form-group">
                  <label>Upload ID Document (Passport/License)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="verification-note">
                  <p>Your information is secure and will be verified within 24-48 hours.</p>
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className="form-buttons">
              {step > 1 && (
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                  Back
                </button>
              )}

              {step < 3 ? (
                <button type="button" className="btn-primary" onClick={handleNextStep}>
                  Next
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/seller-signin">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSignUp;
