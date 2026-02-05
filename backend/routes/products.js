const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const jwt = require('jwt-simple');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'All fields are required' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

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
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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
