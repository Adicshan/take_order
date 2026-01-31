const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create order
router.post('/create', async (req, res) => {
  try {
    const { sellerId, items, subtotal, shipping, total, status, buyer } = req.body;

    if (!sellerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const order = new Order({
      orderId,
      sellerId,
      items,
      subtotal,
      shipping,
      total,
      status: status || 'pending',
      buyer: buyer || {},
      customerEmail: buyer?.email || '',
      customerPhone: buyer?.phone || '',
      deliveryAddress: buyer?.address || ''
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin/public)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('sellerId', 'storeName');
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller orders
router.get('/seller-orders', async (req, res) => {
  try {
    // Get seller ID from token or request (assuming authentication middleware adds it)
    const sellerId = req.headers['x-seller-id'] || req.body.sellerId;
    
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders for a specific seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/update/:orderId', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
