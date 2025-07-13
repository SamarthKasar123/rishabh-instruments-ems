const mongoose = require('mongoose');

const bomSchema = new mongoose.Schema({
  bomId: {
    type: String,
    unique: true,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Released', 'Obsolete'],
    default: 'Draft'
  },
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0
    },
    supplier: {
      type: String,
      required: true
    },
    leadTime: {
      type: Number, // in days
      default: 0
    },
    notes: String,
    isAlternative: {
      type: Boolean,
      default: false
    },
    parentMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    }
  }],
  totalCost: {
    type: Number,
    required: true,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: Date,
  notes: String,
  revisionHistory: [{
    version: String,
    changes: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeDate: {
      type: Date,
      default: Date.now
    }
  }],
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

// Auto-generate BOM ID
bomSchema.pre('save', async function(next) {
  if (!this.bomId) {
    const count = await mongoose.model('BOM').countDocuments();
    this.bomId = `BOM-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate total cost
  this.totalCost = this.materials.reduce((total, item) => total + item.totalCost, 0);
  
  next();
});

// Index for better performance
bomSchema.index({ bomId: 1 });
bomSchema.index({ project: 1 });
bomSchema.index({ status: 1 });

module.exports = mongoose.model('BOM', bomSchema);
