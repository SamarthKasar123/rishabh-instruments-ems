const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Maintenance = require('../models/Maintenance');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all tasks with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    // Apply filters based on user role
    if (req.user.role === 'operator') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedBy: req.user._id },
        { department: req.user.department }
      ];
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    if (req.query.taskType) {
      query.taskType = req.query.taskType;
    }
    
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { taskId: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date filters
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      query.dueDate = {};
      if (req.query.dueDateFrom) {
        query.dueDate.$gte = new Date(req.query.dueDateFrom);
      }
      if (req.query.dueDateTo) {
        query.dueDate.$lte = new Date(req.query.dueDateTo);
      }
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('project', 'projectId projectName status')
      .populate('maintenance', 'maintenanceId machineNo status')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('project', 'projectId projectName status department')
      .populate('maintenance', 'maintenanceId machineNo status department')
      .populate('dependencies.task', 'taskId title status')
      .populate('subtasks.completedBy', 'name email')
      .populate('comments.commentedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to view this task
    if (req.user.role === 'operator' && 
        !task.assignedTo.equals(req.user._id) && 
        !task.assignedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      message: 'Error fetching task', 
      error: error.message 
    });
  }
});

// Create new task
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.user._id,
      createdBy: req.user._id
    };

    // Validate project or maintenance if provided
    if (taskData.project) {
      const project = await Project.findById(taskData.project);
      if (!project) {
        return res.status(400).json({ message: 'Project not found' });
      }
      taskData.department = project.department;
    }

    if (taskData.maintenance) {
      const maintenance = await Maintenance.findById(taskData.maintenance);
      if (!maintenance) {
        return res.status(400).json({ message: 'Maintenance record not found' });
      }
      taskData.department = maintenance.department;
    }

    const task = new Task(taskData);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('project', 'projectId projectName')
      .populate('maintenance', 'maintenanceId machineNo')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Error creating task', 
      error: error.message 
    });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        !task.assignedTo.equals(req.user._id) &&
        !task.assignedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    });

    task.updatedBy = req.user._id;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email department')
      .populate('project', 'projectId projectName')
      .populate('maintenance', 'maintenanceId machineNo')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      message: 'Error updating task', 
      error: error.message 
    });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, completionPercentage, actualHours, comments } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        !task.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task status' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedBy = req.user._id;

    // Update dates based on status
    if (status === 'In Progress' && oldStatus === 'Pending') {
      task.startDate = new Date();
    } else if (status === 'Completed') {
      task.completedDate = new Date();
      task.completionPercentage = 100;
    }

    if (completionPercentage !== undefined) {
      task.completionPercentage = completionPercentage;
    }

    if (actualHours !== undefined) {
      task.actualHours = actualHours;
    }

    if (comments) {
      task.comments.push({
        comment: comments,
        commentedBy: req.user._id,
        commentedAt: new Date()
      });
    }

    await task.save();

    res.json({
      message: 'Task status updated successfully',
      task,
      previousStatus: oldStatus
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ 
      message: 'Error updating task status', 
      error: error.message 
    });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      comment,
      commentedBy: req.user._id,
      commentedAt: new Date()
    });

    task.updatedBy = req.user._id;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('comments.commentedBy', 'name email');

    res.json({
      message: 'Comment added successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      message: 'Error adding comment', 
      error: error.message 
    });
  }
});

// Complete subtask
router.patch('/:id/subtasks/:subtaskIndex/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtaskIndex = parseInt(req.params.subtaskIndex);
    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      return res.status(400).json({ message: 'Invalid subtask index' });
    }

    const subtask = task.subtasks[subtaskIndex];
    if (subtask.isCompleted) {
      return res.status(400).json({ message: 'Subtask is already completed' });
    }

    subtask.isCompleted = true;
    subtask.completedBy = req.user._id;
    subtask.completedDate = new Date();

    // Update task completion percentage
    const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
    const completionPercentage = (completedSubtasks / task.subtasks.length) * 100;
    task.completionPercentage = Math.min(completionPercentage, task.completionPercentage);

    task.updatedBy = req.user._id;
    await task.save();

    res.json({
      message: 'Subtask completed successfully',
      task
    });
  } catch (error) {
    console.error('Complete subtask error:', error);
    res.status(500).json({ 
      message: 'Error completing subtask', 
      error: error.message 
    });
  }
});

// Get overdue tasks
router.get('/alerts/overdue', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let query = {
      isActive: true,
      status: { $nin: ['Completed', 'Cancelled'] },
      dueDate: { $lt: today }
    };

    // Apply role-based filtering
    if (req.user.role === 'operator') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedBy: req.user._id },
        { department: req.user.department }
      ];
    }

    const overdueTasks = await Task.find(query)
      .populate('assignedTo', 'name email department')
      .populate('project', 'projectId projectName')
      .sort({ dueDate: 1 });

    res.json(overdueTasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ 
      message: 'Error fetching overdue tasks', 
      error: error.message 
    });
  }
});

// Get my tasks (for current user)
router.get('/my/assigned', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {
      isActive: true,
      assignedTo: req.user._id
    };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query)
      .populate('assignedBy', 'name email')
      .populate('project', 'projectId projectName')
      .populate('maintenance', 'maintenanceId machineNo')
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ 
      message: 'Error fetching assigned tasks', 
      error: error.message 
    });
  }
});

// Delete task (soft delete)
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isActive = false;
    task.updatedBy = req.user._id;
    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      message: 'Error deleting task', 
      error: error.message 
    });
  }
});

module.exports = router;
