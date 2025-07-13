const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronic Components',
      'Mechanical Parts',
      'Raw Materials',
      'Packaging Materials',
      'Tools & Equipment',
      'Testing Equipment',
      'Consumables',
      'Hardware',
      'Software Components',
      'Safety Equipment'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['pcs', 'kg', 'gm', 'mt', 'ltr', 'ml', 'ft', 'mt2', 'set', 'box', 'roll', 'sheet']
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    name: {
      type: String,
      required: true
    },
    contact: String,
    email: String,
    address: String
  },
  location: {
    warehouse: String,
    rack: String,
    bin: String
  },
  specifications: {
    type: Map,
    of: String
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'A'
  },
  expiryDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate serial number
materialSchema.pre('save', async function(next) {
  if (!this.serialNumber) {
    const count = await mongoose.model('Material').countDocuments();
    this.serialNumber = `MAT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for better performance
materialSchema.index({ serialNumber: 1 });
materialSchema.index({ name: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ quantityAvailable: 1 });

module.exports = mongoose.model('Material', materialSchema);
