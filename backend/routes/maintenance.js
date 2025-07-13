const express = require('express');
const Maintenance = require('../models/Maintenance');
const Material = require('../models/Material');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all maintenance records with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    if (req.query.maintenanceType) {
      query.maintenanceType = req.query.maintenanceType;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    if (req.query.search) {
      query.$or = [
        { machineNo: { $regex: req.query.search, $options: 'i' } },
        { machineName: { $regex: req.query.search, $options: 'i' } },
        { maintenanceId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date filters
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      query.nextDueDate = {};
      if (req.query.dueDateFrom) {
        query.nextDueDate.$gte = new Date(req.query.dueDateFrom);
      }
      if (req.query.dueDateTo) {
        query.nextDueDate.$lte = new Date(req.query.dueDateTo);
      }
    }

    const maintenanceRecords = await Maintenance.find(query)
      .populate('assignedTo', 'name email department')
      .populate('materialsUsed.material', 'name serialNumber unit')
      .populate('createdBy', 'name email')
      .sort({ nextDueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Maintenance.countDocuments(query);

    res.json({
      maintenanceRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get maintenance records error:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance records', 
      error: error.message 
    });
  }
});

// Get maintenance record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('materialsUsed.material', 'name serialNumber unit unitPrice')
      .populate('tasks.completedBy', 'name email')
      .populate('effectiveness.ratedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Get maintenance record error:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance record', 
      error: error.message 
    });
  }
});

// Create new maintenance record
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Calculate next due date based on frequency
    if (!maintenanceData.nextDueDate) {
      const scheduledDate = new Date(maintenanceData.scheduledDate);
      const nextDueDate = new Date(scheduledDate);
      nextDueDate.setDate(nextDueDate.getDate() + maintenanceData.frequencyDays);
      maintenanceData.nextDueDate = nextDueDate;
    }

    const maintenance = new Maintenance(maintenanceData);
    await maintenance.save();

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Maintenance record created successfully',
      maintenance: populatedMaintenance
    });
  } catch (error) {
    console.error('Create maintenance record error:', error);
    res.status(500).json({ 
      message: 'Error creating maintenance record', 
      error: error.message 
    });
  }
});

// Update maintenance record
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        maintenance[key] = req.body[key];
      }
    });

    maintenance.updatedBy = req.user._id;
    await maintenance.save();

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('assignedTo', 'name email department')
      .populate('materialsUsed.material', 'name serialNumber unit')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      message: 'Maintenance record updated successfully',
      maintenance: populatedMaintenance
    });
  } catch (error) {
    console.error('Update maintenance record error:', error);
    res.status(500).json({ 
      message: 'Error updating maintenance record', 
      error: error.message 
    });
  }
});

// Update maintenance status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        !maintenance.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this maintenance record' });
    }

    const oldStatus = maintenance.status;
    maintenance.status = status;
    maintenance.updatedBy = req.user._id;

    // Update dates based on status
    if (status === 'In Progress' && oldStatus === 'Scheduled') {
      maintenance.actualDate = new Date();
    } else if (status === 'Completed') {
      if (!maintenance.actualDate) {
        maintenance.actualDate = new Date();
      }
      
      // Calculate next due date
      const nextDueDate = new Date(maintenance.actualDate);
      nextDueDate.setDate(nextDueDate.getDate() + maintenance.frequencyDays);
      maintenance.nextDueDate = nextDueDate;
    }

    if (notes) {
      maintenance.notes = notes;
    }

    await maintenance.save();

    res.json({
      message: 'Maintenance status updated successfully',
      maintenance,
      previousStatus: oldStatus
    });
  } catch (error) {
    console.error('Update maintenance status error:', error);
    res.status(500).json({ 
      message: 'Error updating maintenance status', 
      error: error.message 
    });
  }
});

// Add materials used
router.post('/:id/materials', auth, async (req, res) => {
  try {
    const { materialsUsed } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Validate materials and update quantities
    for (const materialUsed of materialsUsed) {
      const material = await Material.findById(materialUsed.material);
      if (!material) {
        return res.status(400).json({ 
          message: `Material not found: ${materialUsed.material}` 
        });
      }
      
      if (material.quantityAvailable < materialUsed.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for material: ${material.name}. Available: ${material.quantityAvailable}, Required: ${materialUsed.quantity}` 
        });
      }

      // Update material quantity
      material.quantityAvailable -= materialUsed.quantity;
      material.updatedBy = req.user._id;
      material.lastUpdated = new Date();
      await material.save();

      // Add to maintenance record
      maintenance.materialsUsed.push(materialUsed);
    }

    maintenance.updatedBy = req.user._id;
    await maintenance.save();

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('materialsUsed.material', 'name serialNumber unit');

    res.json({
      message: 'Materials added successfully',
      maintenance: populatedMaintenance
    });
  } catch (error) {
    console.error('Add materials error:', error);
    res.status(500).json({ 
      message: 'Error adding materials', 
      error: error.message 
    });
  }
});

// Complete task
router.patch('/:id/tasks/:taskIndex/complete', auth, async (req, res) => {
  try {
    const { actualTime, notes } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const taskIndex = parseInt(req.params.taskIndex);
    if (taskIndex < 0 || taskIndex >= maintenance.tasks.length) {
      return res.status(400).json({ message: 'Invalid task index' });
    }

    const task = maintenance.tasks[taskIndex];
    if (task.isCompleted) {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    task.isCompleted = true;
    task.completedBy = req.user._id;
    task.completedDate = new Date();
    
    if (actualTime) {
      task.actualTime = actualTime;
    }

    maintenance.updatedBy = req.user._id;
    await maintenance.save();

    res.json({
      message: 'Task completed successfully',
      maintenance
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ 
      message: 'Error completing task', 
      error: error.message 
    });
  }
});

// Get overdue maintenance
router.get('/alerts/overdue', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueMaintenance = await Maintenance.find({
      isActive: true,
      status: { $in: ['Scheduled', 'In Progress'] },
      nextDueDate: { $lt: today }
    })
    .populate('assignedTo', 'name email department')
    .sort({ nextDueDate: 1 });

    res.json(overdueMaintenance);
  } catch (error) {
    console.error('Get overdue maintenance error:', error);
    res.status(500).json({ 
      message: 'Error fetching overdue maintenance', 
      error: error.message 
    });
  }
});

// Get upcoming maintenance
router.get('/alerts/upcoming', auth, async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingMaintenance = await Maintenance.find({
      isActive: true,
      status: 'Scheduled',
      nextDueDate: { 
        $gte: today, 
        $lte: nextWeek 
      }
    })
    .populate('assignedTo', 'name email department')
    .sort({ nextDueDate: 1 });

    res.json(upcomingMaintenance);
  } catch (error) {
    console.error('Get upcoming maintenance error:', error);
    res.status(500).json({ 
      message: 'Error fetching upcoming maintenance', 
      error: error.message 
    });
  }
});

// Delete maintenance record (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    maintenance.isActive = false;
    maintenance.updatedBy = req.user._id;
    await maintenance.save();

    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance record error:', error);
    res.status(500).json({ 
      message: 'Error deleting maintenance record', 
      error: error.message 
    });
  }
});

module.exports = router;
