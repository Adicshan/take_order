require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Seller = require('../models/Seller');

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://rk8816616:raush616@cluster0.awwc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function ensureUniqueSlug(base, excludeId) {
  let slug = base;
  let i = 0;
  while (true) {
    const exists = await Seller.findOne({ storeSlug: slug, _id: { $ne: excludeId } });
    if (!exists) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

async function migrate() {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const sellers = await Seller.find({ $or: [ { storeSlug: { $exists: false } }, { storeSlug: null }, { storeSlug: '' } ] });
    console.log(`Found ${sellers.length} sellers missing storeSlug`);

    let updated = 0;
    for (const s of sellers) {
      const name = s.storeName || s.fullName || `seller-${s._id.toString().slice(-6)}`;
      const base = slugify(name, { lower: true, strict: true }) || `seller-${s._id.toString().slice(-6)}`;
      const unique = await ensureUniqueSlug(base, s._id);
      s.storeSlug = unique;
      await s.save();
      console.log(`Updated seller ${s._id} -> ${s.storeSlug}`);
      updated += 1;
    }

    console.log(`Migration complete. Updated ${updated} sellers.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    try { await mongoose.disconnect(); } catch(e){}
    process.exit(1);
  }
}

migrate();
