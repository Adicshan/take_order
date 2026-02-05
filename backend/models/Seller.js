const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const sellerSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true
  },

  // Store Information
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  storeSlug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['individual', 'small_business', 'corporation'],
    required: true
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },

  // Verification Information
  taxId: {
    type: String,
    required: true
  },
  bankAccount: {
    type: String,
    required: true
  },
  idDocument: {
    fileName: String,
    uploadDate: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Seller Stats
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  suspendedReason: String,
  suspendedAt: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
sellerSchema.pre('save', async function(next) {
  // Generate slug from storeName
  if (this.isModified('storeName')) {
    this.storeSlug = slugify(this.storeName, { lower: true, strict: true });
  }

  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
sellerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
sellerSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Seller', sellerSchema);
