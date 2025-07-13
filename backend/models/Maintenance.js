const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    unique: true,
    required: true
  },
  machineNo: {
    type: String,
    required: true
  },
  machineName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CAM Switch', 'Transducer', 'MID', 'MFM', 'PQ', 'EQ', 'MDI', 'CT', 'SMT', 'Digital Other', 'Discrete']
  },
  maintenanceType: {
    type: String,
    enum: ['Preventive', 'Corrective', 'Predictive', 'Routine'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    required: true
  },
  frequencyDays: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  actualDate: Date,
  nextDueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue', 'Cancelled'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tasks: [{
    taskName: {
      type: String,
      required: true
    },
    description: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedDate: Date,
    estimatedTime: Number, // in minutes
    actualTime: Number // in minutes
  }],
  materialsUsed: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  downtime: {
    planned: Number, // in minutes
    actual: Number // in minutes
  },
  workOrderNumber: String,
  notes: String,
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  compliance: {
    required: {
      type: Boolean,
      default: false
    },
    achieved: {
      type: Boolean,
      default: false
    },
    certificationBody: String,
    certificateNumber: String
  },
  effectiveness: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedDate: Date
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

// Auto-generate maintenance ID
maintenanceSchema.pre('save', async function(next) {
  if (!this.maintenanceId) {
    const count = await mongoose.model('Maintenance').countDocuments();
    this.maintenanceId = `MAINT-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate total cost
  const materialCost = this.materialsUsed.reduce((total, item) => total + item.cost, 0);
  this.totalCost = materialCost + this.laborCost;
  
  next();
});

// Index for better performance
maintenanceSchema.index({ maintenanceId: 1 });
maintenanceSchema.index({ machineNo: 1 });
maintenanceSchema.index({ department: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ scheduledDate: 1 });
maintenanceSchema.index({ nextDueDate: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
