require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads folder for image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://rk8816616:raush616@cluster0.awwc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import Routes
const sellerAuthRoutes = require('./routes/sellerAuth');
const userAuthRoutes = require('./routes/userAuth');
const sellerRoutes = require('./routes/seller');
const productRoutes = require('./routes/products');
const sellersRoutes = require('./routes/sellers');
const ordersRoutes = require('./routes/orders');

// Use Routes
app.use('/api/seller-auth', sellerAuthRoutes);
app.use('/api/user-auth', userAuthRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/orders', ordersRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
