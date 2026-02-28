const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Create order
router.post('/create', async (req, res) => {
  try {
    const { sellerId, items, subtotal, shipping, total, status, buyer } = req.body;

    if (!sellerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize sellerId: accept either a plain id or an object containing _id/id
    let resolvedSellerId = sellerId;
    if (sellerId && typeof sellerId === 'object') {
      if (sellerId._id) resolvedSellerId = sellerId._id;
      else if (sellerId.id) resolvedSellerId = sellerId.id;
      else if (sellerId.toString) resolvedSellerId = sellerId.toString();
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(resolvedSellerId)) {
      return res.status(400).json({ error: 'Invalid sellerId provided' });
    }

    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const order = new Order({
      orderId,
      sellerId: resolvedSellerId,
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

    // Send email notification to seller and user
    // Setup nodemailer transporter (Gmail example, use app password for security)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NOTIFY_EMAIL || 'yourgmail@gmail.com',
        pass: process.env.NOTIFY_EMAIL_PASS || 'your_app_password'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Get seller email
    const seller = await Seller.findById(resolvedSellerId);
    const sellerEmail = seller?.email;
    const userEmail = buyer?.email;

    // Build order details
    const orderDate = new Date(order.createdAt).toLocaleString();
    let itemsHtml = '';
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    order.items.forEach(item => {
      // Try to build a product link using storeSlug and productId if available
      let productLink = '#';
      if (item.productId && seller && seller.storeSlug) {
        productLink = `${baseUrl}/${seller.storeSlug}/view/${item.productId}`;
      }
      itemsHtml += `<li>${item.productName} (Qty: ${item.quantity}) - ₹${item.price} <br/><a href="${productLink}" target="_blank">Click here to view product</a></li>`;
    });

    const orderDetailsHtml = `
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Date:</strong> ${orderDate}</p>
      <p><strong>Buyer Name:</strong> ${order.buyer.fullName || 'N/A'}</p>
      <p><strong>Phone:</strong> ${order.buyer.phone || 'N/A'}</p>
      <p><strong>Address:</strong> ${order.buyer.address || 'N/A'}, ${order.buyer.city || ''}, ${order.buyer.state || ''}, ${order.buyer.zipCode || ''}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
      <p><strong>Shipping:</strong> ₹${order.shipping}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
    `;

    // Send to seller
    if (sellerEmail) {
      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL || 'yourgmail@gmail.com',
        to: sellerEmail,
        subject: `New Order Received - ${order.orderId}`,
        html: `<p>You have received a new order:</p>${orderDetailsHtml}`
      });
    }

    // Send to user
    if (userEmail) {
      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL || 'yourgmail@gmail.com',
        to: userEmail,
        subject: `Order Confirmation - ${order.orderId}`,
        html: `<p>Thank you for your order! Here are your order details:</p>${orderDetailsHtml}`
      });
    }

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
    const sellerId = req.params.sellerId;
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


// Delete order by MongoDB _id
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
