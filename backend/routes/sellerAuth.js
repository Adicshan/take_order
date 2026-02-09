const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const slugify = require('slugify');
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate token
const generateToken = (sellerId) => {
  return jwt.encode({ sellerId, iat: Date.now() }, JWT_SECRET);
};

// POST /api/seller-auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  seller.resetToken = token;
  seller.resetTokenExpires = Date.now() + 3600000; // 1 hour
  await seller.save();

  // Send email using your company Gmail
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'rk8816616@gmail.com',
      pass: 'ooowvqsximrdmcex' // Use an App Password, not your main Gmail password!
    },
  tls: {
    rejectUnauthorized: false
  }
  });

  const resetUrl = `http://localhost:3000/seller-set-password?token=${token}`;
  const mailOptions = {
    to: seller.email,
    subject: 'Reset your BlackCart password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
  };

  await transporter.sendMail(mailOptions);

  res.json({ message: 'Reset email sent' });
});

// POST /api/seller-auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    const seller = await Seller.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!seller) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    seller.password = password;
    seller.resetToken = undefined;
    seller.resetTokenExpires = undefined;
    await seller.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// @route   POST /api/seller-auth/register
// @desc    Register a new seller
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      storeName,
      businessType,
      address,
      taxId,
      bankAccount,
      idDocument
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !phone || !storeName || !businessType || !taxId || !bankAccount) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new seller (ensure storeSlug generated)
    const seller = new Seller({
      fullName,
      email,
      password,
      phone,
      storeName,
      storeSlug: slugify(storeName || '', { lower: true, strict: true }),
      businessType,
      address,
      taxId,
      bankAccount,
      idDocument: {
        fileName: idDocument ? idDocument.name : null,
        uploadDate: new Date(),
        verified: false
      }
    });

    // Save seller to database
    await seller.save();

    // Generate token
    const token = generateToken(seller._id);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Seller registered successfully. Pending verification.',
      token,
      seller: seller.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/seller-auth/login
// @desc    Login seller
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find seller by email
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(seller._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      seller: seller.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/seller-auth/profile
// @desc    Get seller profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.decode(token, JWT_SECRET);
    const seller = await Seller.findById(decoded.sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Ensure existing sellers have a storeSlug (migration / fallback)
    if (!seller.storeSlug && seller.storeName) {
      try {
        seller.storeSlug = slugify(seller.storeName || '', { lower: true, strict: true });
        await seller.save();
      } catch (err) {
        console.error('Error generating storeSlug for seller:', err);
      }
    }

    res.json({
      success: true,
      seller: seller.toJSON()
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// @route   POST /api/seller-auth/verify
// @desc    Verify seller account
// @access  Private (Admin only)
router.post('/verify/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.sellerId,
      {
        isVerified: true,
        verifiedAt: new Date(),
        'idDocument.verified': true
      },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({
      success: true,
      message: 'Seller verified successfully',
      seller: seller.toJSON()
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
