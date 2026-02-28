const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const jwt = require('jwt-simple');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dkqjagksx',
  api_key: '923462844941772',
  api_secret: 'rpqgNH_PizZojERGP8-fU7J20tw'
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Middleware to verify seller token
const verifySeller = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    const seller = await Seller.findById(decoded.sellerId);
    if (!seller) return res.status(401).json({ message: 'Seller not found' });

    req.seller = seller;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create product
router.post('/create', verifySeller, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    if (!name || !description || !price || !quantity || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let imageUrl = null;
    if (req.file) {
      // Upload image buffer to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary upload error', error: error.message });
          }
          imageUrl = result.secure_url;
          const product = new Product({
            sellerId: req.seller._id,
            name,
            description,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            category,
            imageUrl: imageUrl,
            status: 'active'
          });
          await product.save();
          return res.status(201).json({ message: 'Product created successfully', product });
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      const product = new Product({
        sellerId: req.seller._id,
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
        imageUrl: null,
        status: 'active'
      });
      await product.save();
      return res.status(201).json({ message: 'Product created successfully', product });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Get seller's products
router.get('/seller-products', verifySeller, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.seller._id }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get all products (public route for customers) - MUST BE BEFORE /:id
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('sellerId', 'storeName businessType phone address isVerified storeSlug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get products by seller (public route for customers)
router.get('/by-seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ 
      sellerId: req.params.sellerId,
      status: 'active'
    })
      .populate('sellerId', 'storeName businessType phone address isVerified storeSlug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get products by store slug
router.get('/by-store/:storeSlug', async (req, res) => {
  try {
    const Seller = require('../models/Seller');
    const seller = await Seller.findOne({ storeSlug: req.params.storeSlug });
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const products = await Product.find({ 
      sellerId: seller._id,
      status: 'active'
    })
      .populate('sellerId', 'storeName businessType phone address isVerified storeSlug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Update product
router.put('/update/:id', verifySeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, description, price, quantity, category, status } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (quantity !== undefined) product.quantity = parseInt(quantity);
    if (category) product.category = category;
    if (status) product.status = status;
    product.updatedAt = Date.now();

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/delete/:id', verifySeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
