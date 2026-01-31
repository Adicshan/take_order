const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const jwt = require('jwt-simple');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const verifySeller = async (req, res, next) => {
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

    req.seller = seller;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard data
// @access  Private
router.get('/dashboard', verifySeller, async (req, res) => {
  try {
    const seller = req.seller;

    res.json({
      success: true,
      data: {
        storeName: seller.storeName,
        totalSales: seller.totalSales,
        totalOrders: seller.totalOrders,
        activeProducts: seller.totalProducts,
        rating: seller.rating,
        isVerified: seller.isVerified,
        verifiedAt: seller.verifiedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/seller/info
// @desc    Get seller full information
// @access  Private
router.get('/info', verifySeller, async (req, res) => {
  try {
    res.json({
      success: true,
      seller: req.seller.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/seller/update
// @desc    Update seller information
// @access  Private
router.put('/update', verifySeller, async (req, res) => {
  try {
    const { storeName, businessType, address, phone } = req.body;

    const seller = await Seller.findByIdAndUpdate(
      req.seller._id,
      {
        storeName,
        businessType,
        address,
        phone,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Seller information updated',
      seller: seller.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
