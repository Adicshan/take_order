const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

// Get all sellers
router.get('/all', async (req, res) => {
  try {
    const sellers = await Seller.find({ isVerified: true }).select('-password -bankAccount -taxId -idDocument');
    res.status(200).json({ sellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller by ID
router.get('/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId).select('-password -bankAccount -taxId -idDocument');
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    res.status(200).json({ seller });
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
