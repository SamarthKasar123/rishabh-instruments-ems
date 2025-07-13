const express = require('express');
const mongoose = require('mongoose');
const BOM = require('../models/BOM');
const Material = require('../models/Material');
const Project = require('../models/Project');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all BOMs with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.project) {
      query.project = req.query.project;
    }
    
    if (req.query.search) {
      query.$or = [
        { bomId: { $regex: req.query.search, $options: 'i' } },
        { version: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const boms = await BOM.find(query)
      .populate('project', 'projectId projectName department')
      .populate('materials.material', 'name serialNumber category unit')
      .populate('approvedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BOM.countDocuments(query);

    res.json({
      boms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ 
      message: 'Error fetching BOMs', 
      error: error.message 
    });
  }
});

// Get BOM by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('project', 'projectId projectName department status')
      .populate('materials.material', 'name serialNumber category unit quantityAvailable unitPrice')
      .populate('materials.parentMaterial', 'name serialNumber')
      .populate('approvedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('revisionHistory.changedBy', 'name email');
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    res.json(bom);
  } catch (error) {
    console.error('Get BOM error:', error);
    res.status(500).json({ 
      message: 'Error fetching BOM', 
      error: error.message 
    });
  }
});

// Create new BOM
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { project, materials, notes, version } = req.body;

    // Validate project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(400).json({ message: 'Project not found' });
    }

    // Validate materials and calculate costs
    const validatedMaterials = [];
    let totalCost = 0;

    for (const materialItem of materials) {
      const material = await Material.findById(materialItem.material);
      if (!material) {
        return res.status(400).json({ 
          message: `Material not found: ${materialItem.material}` 
        });
      }

      const unitCost = materialItem.unitCost || material.unitPrice;
      const totalItemCost = materialItem.quantity * unitCost;

      validatedMaterials.push({
        ...materialItem,
        unit: materialItem.unit || material.unit,
        unitCost: unitCost,
        totalCost: totalItemCost,
        supplier: materialItem.supplier || material.supplier.name
      });

      totalCost += totalItemCost;
    }

    const bomData = {
      project,
      version: version || '1.0',
      materials: validatedMaterials,
      totalCost,
      notes,
      createdBy: req.user._id
    };

    const bom = new BOM(bomData);
    await bom.save();

    const populatedBOM = await BOM.findById(bom._id)
      .populate('project', 'projectId projectName department')
      .populate('materials.material', 'name serialNumber category unit')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'BOM created successfully',
      bom: populatedBOM
    });
  } catch (error) {
    console.error('Create BOM error:', error);
    res.status(500).json({ 
      message: 'Error creating BOM', 
      error: error.message 
    });
  }
});

// Update BOM
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    // Check if BOM is already approved/released
    if (bom.status === 'Released') {
      return res.status(400).json({ 
        message: 'Cannot modify released BOM. Create a new version instead.' 
      });
    }

    // Store revision history
    if (req.body.materials && JSON.stringify(bom.materials) !== JSON.stringify(req.body.materials)) {
      bom.revisionHistory.push({
        version: bom.version,
        changes: req.body.changeReason || 'Materials updated',
        changedBy: req.user._id,
        changeDate: new Date()
      });

      // Increment version
      const [major, minor] = bom.version.split('.').map(Number);
      bom.version = `${major}.${minor + 1}`;
    }

    // Recalculate total cost if materials changed
    if (req.body.materials) {
      let totalCost = 0;
      for (const materialItem of req.body.materials) {
        totalCost += materialItem.totalCost || (materialItem.quantity * materialItem.unitCost);
      }
      req.body.totalCost = totalCost;
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'changeReason') {
        bom[key] = req.body[key];
      }
    });

    bom.updatedBy = req.user._id;
    await bom.save();

    const populatedBOM = await BOM.findById(bom._id)
      .populate('project', 'projectId projectName department')
      .populate('materials.material', 'name serialNumber category unit')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      message: 'BOM updated successfully',
      bom: populatedBOM
    });
  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({ 
      message: 'Error updating BOM', 
      error: error.message 
    });
  }
});

// Approve BOM
router.patch('/:id/approve', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.status !== 'Draft') {
      return res.status(400).json({ 
        message: `Cannot approve BOM with status: ${bom.status}` 
      });
    }

    bom.status = 'Approved';
    bom.approvedBy = req.user._id;
    bom.approvedDate = new Date();
    bom.updatedBy = req.user._id;

    await bom.save();

    const populatedBOM = await BOM.findById(bom._id)
      .populate('project', 'projectId projectName')
      .populate('approvedBy', 'name email');

    res.json({
      message: 'BOM approved successfully',
      bom: populatedBOM
    });
  } catch (error) {
    console.error('Approve BOM error:', error);
    res.status(500).json({ 
      message: 'Error approving BOM', 
      error: error.message 
    });
  }
});

// Release BOM and deduct inventory
router.patch('/:id/release', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('materials.material', 'name serialNumber quantityAvailable unit');
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.status !== 'Approved') {
      return res.status(400).json({ 
        message: `Cannot release BOM with status: ${bom.status}. Must be approved first.` 
      });
    }

    // Check material availability before releasing
    const insufficientMaterials = [];
    for (const bomMaterial of bom.materials) {
      const material = bomMaterial.material;
      if (!material) {
        insufficientMaterials.push(`Material ID ${bomMaterial.material} not found`);
        continue;
      }
      
      if (material.quantityAvailable < bomMaterial.quantity) {
        insufficientMaterials.push(
          `${material.name} (${material.serialNumber}): Required ${bomMaterial.quantity}, Available ${material.quantityAvailable}`
        );
      }
    }

    if (insufficientMaterials.length > 0) {
      return res.status(400).json({
        message: 'Insufficient materials in inventory',
        insufficientMaterials
      });
    }

    // Start transaction for inventory deduction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct materials from inventory
      for (const bomMaterial of bom.materials) {
        await Material.findByIdAndUpdate(
          bomMaterial.material._id,
          {
            $inc: { quantityAvailable: -bomMaterial.quantity },
            $set: { 
              lastUpdated: new Date(),
              updatedBy: req.user._id 
            }
          },
          { session }
        );
      }

      // Update BOM status
      bom.status = 'Released';
      bom.updatedBy = req.user._id;
      await bom.save({ session });

      await session.commitTransaction();

      res.json({
        message: 'BOM released successfully and materials deducted from inventory',
        bom,
        deductedMaterials: bom.materials.map(m => ({
          material: m.material.name,
          deductedQuantity: m.quantity,
          unit: m.unit
        }))
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Release BOM error:', error);
    res.status(500).json({ 
      message: 'Error releasing BOM', 
      error: error.message 
    });
  }
});

// Get BOM cost analysis
router.get('/:id/cost-analysis', auth, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('materials.material', 'name category unitPrice');
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    const costBreakdown = bom.materials.map(item => ({
      material: item.material.name,
      category: item.material.category,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.totalCost,
      costPercentage: ((item.totalCost / bom.totalCost) * 100).toFixed(2)
    }));

    const categoryBreakdown = bom.materials.reduce((acc, item) => {
      const category = item.material.category;
      if (!acc[category]) {
        acc[category] = { totalCost: 0, itemCount: 0 };
      }
      acc[category].totalCost += item.totalCost;
      acc[category].itemCount += 1;
      return acc;
    }, {});

    res.json({
      bomId: bom.bomId,
      totalCost: bom.totalCost,
      materialCount: bom.materials.length,
      costBreakdown,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({ 
      message: 'Error generating cost analysis', 
      error: error.message 
    });
  }
});

// Delete BOM (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.status === 'Released') {
      return res.status(400).json({ 
        message: 'Cannot delete released BOM' 
      });
    }

    bom.isActive = false;
    bom.updatedBy = req.user._id;
    await bom.save();

    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    console.error('Delete BOM error:', error);
    res.status(500).json({ 
      message: 'Error deleting BOM', 
      error: error.message 
    });
  }
});

module.exports = router;
