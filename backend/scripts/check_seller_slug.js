require('dotenv').config();
const mongoose = require('mongoose');
const Seller = require('../models/Seller');

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://rk8816616:raush616@cluster0.awwc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    const slug = process.argv[2] || 'adixshan';
    const seller = await Seller.findOne({ storeSlug: slug });
    if (!seller) {
      console.log('Seller not found for slug:', slug);
    } else {
      console.log('Found seller:', seller._id.toString(), 'storeName:', seller.storeName, 'storeSlug:', seller.storeSlug, 'isVerified:', seller.isVerified);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
