const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  taskType: {
    type: String,
    enum: ['Project Task', 'Maintenance Task', 'Quality Check', 'Documentation', 'Training', 'Meeting', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Under Review', 'Completed', 'Cancelled', 'On Hold'],
    default: 'Pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  maintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  },
  department: {
    type: String,
    required: true,
    enum: ['CAM Switch', 'Transducer', 'MID', 'MFM', 'PQ', 'EQ', 'MDI', 'CT', 'SMT', 'Digital Other', 'Discrete']
  },
  dueDate: {
    type: Date,
    required: true
  },
  startDate: Date,
  completedDate: Date,
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
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
  comments: [{
    comment: {
      type: String,
      required: true
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    dependencyType: {
      type: String,
      enum: ['Finish-to-Start', 'Start-to-Start', 'Finish-to-Finish', 'Start-to-Finish'],
      default: 'Finish-to-Start'
    }
  }],
  subtasks: [{
    title: {
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
    completedDate: Date
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
    },
    interval: Number,
    endDate: Date
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

// Auto-generate task ID
taskSchema.pre('save', async function(next) {
  if (!this.taskId) {
    const count = await mongoose.model('Task').countDocuments();
    this.taskId = `TASK-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for better performance
taskSchema.index({ taskId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ department: 1 });

module.exports = mongoose.model('Task', taskSchema);
