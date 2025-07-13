const express = require('express');
const Material = require('../models/Material');
const Project = require('../models/Project');
const Maintenance = require('../models/Maintenance');
const Task = require('../models/Task');
const BOM = require('../models/BOM');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/overview', auth, async (req, res) => {
  try {
    const [
      totalMaterials,
      lowStockMaterials,
      totalProjects,
      activeProjects,
      totalMaintenanceRecords,
      overdueMaintenanceCount,
      totalTasks,
      overdueTasks,
      totalUsers
    ] = await Promise.all([
      Material.countDocuments({ isActive: true }),
      Material.countDocuments({ 
        isActive: true,
        $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
      }),
      Project.countDocuments({ isActive: true }),
      Project.countDocuments({ isActive: true, status: { $in: ['Planning', 'In Progress'] } }),
      Maintenance.countDocuments({ isActive: true }),
      Maintenance.countDocuments({ 
        isActive: true,
        status: { $in: ['Scheduled', 'In Progress'] },
        nextDueDate: { $lt: new Date() }
      }),
      Task.countDocuments({ isActive: true }),
      Task.countDocuments({ 
        isActive: true,
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: new Date() }
      }),
      User.countDocuments({ isActive: true })
    ]);

    res.json({
      materials: {
        total: totalMaterials,
        lowStock: lowStockMaterials
      },
      projects: {
        total: totalProjects,
        active: activeProjects
      },
      maintenance: {
        total: totalMaintenanceRecords,
        overdue: overdueMaintenanceCount
      },
      tasks: {
        total: totalTasks,
        overdue: overdueTasks
      },
      users: {
        total: totalUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard overview', 
      error: error.message 
    });
  }
});

// Get recent activities
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [recentProjects, recentMaintenance, recentTasks] = await Promise.all([
      Project.find({ isActive: true })
        .populate('createdBy', 'name')
        .select('projectId projectName status createdAt')
        .sort({ createdAt: -1 })
        .limit(3),
      
      Maintenance.find({ isActive: true })
        .populate('createdBy', 'name')
        .select('maintenanceId machineNo status createdAt')
        .sort({ createdAt: -1 })
        .limit(3),
      
      Task.find({ isActive: true })
        .populate('createdBy', 'name')
        .select('taskId title status createdAt')
        .sort({ createdAt: -1 })
        .limit(4)
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentProjects.map(p => ({
        type: 'project',
        id: p._id,
        title: p.projectName,
        identifier: p.projectId,
        status: p.status,
        createdBy: p.createdBy?.name,
        createdAt: p.createdAt
      })),
      ...recentMaintenance.map(m => ({
        type: 'maintenance',
        id: m._id,
        title: m.machineNo,
        identifier: m.maintenanceId,
        status: m.status,
        createdBy: m.createdBy?.name,
        createdAt: m.createdAt
      })),
      ...recentTasks.map(t => ({
        type: 'task',
        id: t._id,
        title: t.title,
        identifier: t.taskId,
        status: t.status,
        createdBy: t.createdBy?.name,
        createdAt: t.createdAt
      }))
    ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ 
      message: 'Error fetching recent activities', 
      error: error.message 
    });
  }
});

// Get project status distribution
router.get('/project-status', auth, async (req, res) => {
  try {
    const statusDistribution = await Project.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json(statusDistribution);
  } catch (error) {
    console.error('Get project status error:', error);
    res.status(500).json({ 
      message: 'Error fetching project status distribution', 
      error: error.message 
    });
  }
});

// Get department wise workload
router.get('/department-workload', auth, async (req, res) => {
  try {
    const departmentWorkload = await Project.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$department', 
          activeProjects: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['Planning', 'In Progress']] }, 
                1, 
                0
              ] 
            } 
          },
          totalProjects: { $sum: 1 }
        } 
      },
      { $sort: { totalProjects: -1 } }
    ]);

    res.json(departmentWorkload);
  } catch (error) {
    console.error('Get department workload error:', error);
    res.status(500).json({ 
      message: 'Error fetching department workload', 
      error: error.message 
    });
  }
});

// Get material category distribution
router.get('/material-categories', auth, async (req, res) => {
  try {
    const categoryDistribution = await Material.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          totalValue: { 
            $sum: { 
              $multiply: ['$quantityAvailable', '$unitPrice'] 
            } 
          }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categoryDistribution);
  } catch (error) {
    console.error('Get material categories error:', error);
    res.status(500).json({ 
      message: 'Error fetching material category distribution', 
      error: error.message 
    });
  }
});

// Get maintenance compliance
router.get('/maintenance-compliance', auth, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [
      totalScheduled,
      completedOnTime,
      overdue,
      upcoming
    ] = await Promise.all([
      Maintenance.countDocuments({ 
        isActive: true,
        scheduledDate: { $gte: thirtyDaysAgo }
      }),
      Maintenance.countDocuments({ 
        isActive: true,
        status: 'Completed',
        scheduledDate: { $gte: thirtyDaysAgo },
        actualDate: { $lte: '$scheduledDate' }
      }),
      Maintenance.countDocuments({ 
        isActive: true,
        status: { $in: ['Scheduled', 'In Progress'] },
        nextDueDate: { $lt: today }
      }),
      Maintenance.countDocuments({ 
        isActive: true,
        status: 'Scheduled',
        nextDueDate: { 
          $gte: today,
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      })
    ]);

    const complianceRate = totalScheduled > 0 ? 
      ((completedOnTime / totalScheduled) * 100).toFixed(2) : 0;

    res.json({
      totalScheduled,
      completedOnTime,
      overdue,
      upcoming,
      complianceRate: parseFloat(complianceRate)
    });
  } catch (error) {
    console.error('Get maintenance compliance error:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance compliance', 
      error: error.message 
    });
  }
});

// Get task performance metrics
router.get('/task-performance', auth, async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Apply role-based filtering
    if (req.user.role === 'operator') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      query.department = req.user.department;
    }

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      avgCompletionTime
    ] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'Completed' }),
      Task.countDocuments({ ...query, status: 'In Progress' }),
      Task.countDocuments({ 
        ...query,
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: new Date() }
      }),
      Task.aggregate([
        { $match: { ...query, status: 'Completed', startDate: { $exists: true } } },
        { 
          $project: { 
            completionTime: { 
              $divide: [
                { $subtract: ['$completedDate', '$startDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            avgTime: { $avg: '$completionTime' } 
          } 
        }
      ])
    ]);

    const completionRate = totalTasks > 0 ? 
      ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: parseFloat(completionRate),
      avgCompletionTime: avgCompletionTime[0]?.avgTime || 0
    });
  } catch (error) {
    console.error('Get task performance error:', error);
    res.status(500).json({ 
      message: 'Error fetching task performance metrics', 
      error: error.message 
    });
  }
});

// Get alerts and notifications
router.get('/alerts', auth, async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const [
      lowStockAlerts,
      overdueMaintenanceAlerts,
      upcomingMaintenanceAlerts,
      overdueTaskAlerts
    ] = await Promise.all([
      Material.find({ 
        isActive: true,
        $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
      })
      .select('name serialNumber quantityAvailable minStockLevel')
      .limit(5),
      
      Maintenance.find({ 
        isActive: true,
        status: { $in: ['Scheduled', 'In Progress'] },
        nextDueDate: { $lt: today }
      })
      .populate('assignedTo', 'name')
      .select('maintenanceId machineNo nextDueDate assignedTo')
      .limit(5),
      
      Maintenance.find({ 
        isActive: true,
        status: 'Scheduled',
        nextDueDate: { $gte: today, $lte: nextWeek }
      })
      .populate('assignedTo', 'name')
      .select('maintenanceId machineNo nextDueDate assignedTo')
      .limit(5),
      
      Task.find({ 
        isActive: true,
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: today }
      })
      .populate('assignedTo', 'name')
      .select('taskId title dueDate assignedTo')
      .limit(5)
    ]);

    res.json({
      lowStock: lowStockAlerts.map(material => ({
        type: 'low_stock',
        id: material._id,
        message: `${material.name} is running low (${material.quantityAvailable}/${material.minStockLevel})`,
        severity: 'warning',
        data: material
      })),
      overdueMaintenance: overdueMaintenanceAlerts.map(maintenance => ({
        type: 'overdue_maintenance',
        id: maintenance._id,
        message: `Maintenance overdue for ${maintenance.machineNo}`,
        severity: 'error',
        data: maintenance
      })),
      upcomingMaintenance: upcomingMaintenanceAlerts.map(maintenance => ({
        type: 'upcoming_maintenance',
        id: maintenance._id,
        message: `Maintenance due for ${maintenance.machineNo} on ${maintenance.nextDueDate.toDateString()}`,
        severity: 'info',
        data: maintenance
      })),
      overdueTasks: overdueTaskAlerts.map(task => ({
        type: 'overdue_task',
        id: task._id,
        message: `Task "${task.title}" is overdue`,
        severity: 'warning',
        data: task
      }))
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ 
      message: 'Error fetching alerts', 
      error: error.message 
    });
  }
});

// Get cost analysis
router.get('/cost-analysis', auth, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : 
      new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const [
      materialCosts,
      maintenanceCosts,
      projectBudgets
    ] = await Promise.all([
      Material.aggregate([
        { $match: { isActive: true } },
        { 
          $group: { 
            _id: '$category',
            totalValue: { 
              $sum: { 
                $multiply: ['$quantityAvailable', '$unitPrice'] 
              } 
            }
          }
        }
      ]),
      
      Maintenance.aggregate([
        { 
          $match: { 
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { 
          $group: { 
            _id: '$department',
            totalCost: { $sum: '$totalCost' }
          }
        }
      ]),
      
      Project.aggregate([
        { 
          $match: { 
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { 
          $group: { 
            _id: '$department',
            totalBudget: { $sum: '$budget.allocated' },
            totalSpent: { $sum: '$budget.spent' }
          }
        }
      ])
    ]);

    res.json({
      period: { startDate, endDate },
      materialCosts,
      maintenanceCosts,
      projectBudgets
    });
  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({ 
      message: 'Error fetching cost analysis', 
      error: error.message 
    });
  }
});

module.exports = router;
