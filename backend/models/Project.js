const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true,
    required: true
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CAM Switch', 'Transducer', 'MID', 'MFM', 'PQ', 'EQ', 'MDI', 'CT', 'SMT', 'Digital Other', 'Discrete']
  },
  projectType: {
    type: String,
    enum: ['Automation', 'Testing', 'Development', 'Maintenance', 'Production'],
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Under Maintenance'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedEndDate: {
    type: Date,
    required: true
  },
  actualEndDate: Date,
  budget: {
    allocated: {
      type: Number,
      required: true,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Lead', 'Developer', 'Tester', 'Analyst', 'Support']
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  materialsAllocated: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    quantityAllocated: {
      type: Number,
      required: true,
      min: 0
    },
    quantityUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    allocatedDate: {
      type: Date,
      default: Date.now
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    targetDate: {
      type: Date,
      required: true
    },
    actualDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending'
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  documents: [{
    name: String,
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
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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

// Auto-generate project ID
projectSchema.pre('save', async function(next) {
  if (!this.projectId) {
    const count = await mongoose.model('Project').countDocuments();
    const year = new Date().getFullYear();
    this.projectId = `RI-AUTO-PRO-${String(count + 1).padStart(3, '0')}-${year}`;
  }
  next();
});

// Index for better performance
projectSchema.index({ projectId: 1 });
projectSchema.index({ projectName: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ department: 1 });
projectSchema.index({ projectManager: 1 });

module.exports = mongoose.model('Project', projectSchema);
