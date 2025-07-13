const express = require('express');
const Project = require('../models/Project');
const Material = require('../models/Material');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all projects with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isActive: true };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    if (req.query.search) {
      query.$or = [
        { projectName: { $regex: req.query.search, $options: 'i' } },
        { projectId: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('projectManager', 'name email department')
      .populate('teamMembers.user', 'name email department')
      .populate('materialsAllocated.material', 'name serialNumber unit')
      .populate('milestones.completedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      message: 'Error fetching projects', 
      error: error.message 
    });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'name email department')
      .populate('teamMembers.user', 'name email department')
      .populate('materialsAllocated.material', 'name serialNumber unit quantityAvailable')
      .populate('materialsAllocated.allocatedBy', 'name email')
      .populate('milestones.completedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      message: 'Error fetching project', 
      error: error.message 
    });
  }
});

// Create new project
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('User info:', { id: req.user._id, email: req.user.email });
    
    const projectData = {
      ...req.body,
      createdBy: req.user._id,
      // Set the current user as project manager if not specified
      projectManager: req.body.projectManager || req.user._id
    };

    // Generate unique project ID if not provided
    if (!projectData.projectId) {
      const count = await Project.countDocuments();
      projectData.projectId = `PRJ${String(count + 1).padStart(4, '0')}`;
    }

    console.log('Final project data before save:', projectData);

    // Validate material allocations
    if (projectData.materialsAllocated && projectData.materialsAllocated.length > 0) {
      for (const allocation of projectData.materialsAllocated) {
        const material = await Material.findById(allocation.material);
        if (!material) {
          return res.status(400).json({ 
            message: `Material not found: ${allocation.material}` 
          });
        }
        
        if (material.quantityAvailable < allocation.quantityAllocated) {
          return res.status(400).json({ 
            message: `Insufficient quantity for material: ${material.name}. Available: ${material.quantityAvailable}, Required: ${allocation.quantityAllocated}` 
          });
        }
      }
    }

    const project = new Project(projectData);
    await project.save();

    // Update material quantities
    if (projectData.materialsAllocated && projectData.materialsAllocated.length > 0) {
      for (const allocation of projectData.materialsAllocated) {
        await Material.findByIdAndUpdate(
          allocation.material,
          { 
            $inc: { quantityAvailable: -allocation.quantityAllocated },
            updatedBy: req.user._id,
            lastUpdated: new Date()
          }
        );
        
        // Set allocation details
        allocation.allocatedBy = req.user._id;
        allocation.allocatedDate = new Date();
      }
      
      await project.save();
    }

    const populatedProject = await Project.findById(project._id)
      .populate('projectManager', 'name email department')
      .populate('materialsAllocated.material', 'name serialNumber unit')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error.message 
    });
  }
});

// Update project
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to update this project
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        !project.projectManager.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'materialsAllocated') {
        project[key] = req.body[key];
      }
    });

    project.updatedBy = req.user._id;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('projectManager', 'name email department')
      .populate('teamMembers.user', 'name email department')
      .populate('materialsAllocated.material', 'name serialNumber unit')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      message: 'Project updated successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      message: 'Error updating project', 
      error: error.message 
    });
  }
});

// Update project status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        !project.projectManager.equals(req.user._id) &&
        !project.teamMembers.some(member => member.user.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to update this project status' });
    }

    const oldStatus = project.status;
    project.status = status;
    project.updatedBy = req.user._id;

    // Set completion date if project is completed
    if (status === 'Completed' && oldStatus !== 'Completed') {
      project.actualEndDate = new Date();
      project.completionPercentage = 100;
    }

    if (notes) {
      project.notes = notes;
    }

    await project.save();

    res.json({
      message: 'Project status updated successfully',
      project,
      previousStatus: oldStatus
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ 
      message: 'Error updating project status', 
      error: error.message 
    });
  }
});

// Allocate materials to project
router.post('/:id/allocate-materials', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { materialsToAllocate } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate and allocate materials
    for (const allocation of materialsToAllocate) {
      const material = await Material.findById(allocation.material);
      if (!material) {
        return res.status(400).json({ 
          message: `Material not found: ${allocation.material}` 
        });
      }
      
      if (material.quantityAvailable < allocation.quantityAllocated) {
        return res.status(400).json({ 
          message: `Insufficient quantity for material: ${material.name}. Available: ${material.quantityAvailable}, Required: ${allocation.quantityAllocated}` 
        });
      }

      // Update material quantity
      material.quantityAvailable -= allocation.quantityAllocated;
      material.updatedBy = req.user._id;
      material.lastUpdated = new Date();
      await material.save();

      // Add to project allocation
      allocation.allocatedBy = req.user._id;
      allocation.allocatedDate = new Date();
      project.materialsAllocated.push(allocation);
    }

    project.updatedBy = req.user._id;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('materialsAllocated.material', 'name serialNumber unit');

    res.json({
      message: 'Materials allocated successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Allocate materials error:', error);
    res.status(500).json({ 
      message: 'Error allocating materials', 
      error: error.message 
    });
  }
});

// Add team member
router.post('/:id/team-members', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a team member
    const existingMember = project.teamMembers.find(member => 
      member.user.equals(userId)
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.teamMembers.push({
      user: userId,
      role: role,
      assignedDate: new Date()
    });

    project.updatedBy = req.user._id;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('teamMembers.user', 'name email department');

    res.json({
      message: 'Team member added successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ 
      message: 'Error adding team member', 
      error: error.message 
    });
  }
});

// Delete project (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.isActive = false;
    project.updatedBy = req.user._id;
    await project.save();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      message: 'Error deleting project', 
      error: error.message 
    });
  }
});

module.exports = router;
