const express = require('express');
const Material = require('../models/Material');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all materials with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isActive: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$quantityAvailable', '$minStockLevel'] };
    }

    const materials = await Material.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Material.countDocuments(query);

    res.json({
      materials,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ 
      message: 'Error fetching materials', 
      error: error.message 
    });
  }
});

// Get material by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ 
      message: 'Error fetching material', 
      error: error.message 
    });
  }
});

// Create new material
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Auto-calculate max stock level if not provided
    if (!materialData.maxStockLevel) {
      materialData.maxStockLevel = materialData.minStockLevel * 3;
    }

    const material = new Material(materialData);
    await material.save();

    const populatedMaterial = await Material.findById(material._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Material created successfully',
      material: populatedMaterial
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ 
      message: 'Error creating material', 
      error: error.message 
    });
  }
});

// Update material
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        material[key] = req.body[key];
      }
    });

    material.updatedBy = req.user._id;
    material.lastUpdated = new Date();

    await material.save();

    const populatedMaterial = await Material.findById(material._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      message: 'Material updated successfully',
      material: populatedMaterial
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ 
      message: 'Error updating material', 
      error: error.message 
    });
  }
});

// Update material quantity
router.patch('/:id/quantity', auth, authorize('admin', 'manager', 'operator'), async (req, res) => {
  try {
    const { quantityChange, operation, reason } = req.body;
    
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    let newQuantity;
    if (operation === 'add') {
      newQuantity = material.quantityAvailable + quantityChange;
    } else if (operation === 'subtract') {
      newQuantity = material.quantityAvailable - quantityChange;
    } else {
      newQuantity = quantityChange; // direct set
    }

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    material.quantityAvailable = newQuantity;
    material.updatedBy = req.user._id;
    material.lastUpdated = new Date();

    await material.save();

    res.json({
      message: 'Material quantity updated successfully',
      material,
      previousQuantity: operation === 'add' ? 
        material.quantityAvailable - quantityChange : 
        material.quantityAvailable + quantityChange,
      newQuantity: material.quantityAvailable
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ 
      message: 'Error updating material quantity', 
      error: error.message 
    });
  }
});

// Delete material (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    material.isActive = false;
    material.updatedBy = req.user._id;
    await material.save();

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ 
      message: 'Error deleting material', 
      error: error.message 
    });
  }
});

// Get material categories
router.get('/meta/categories', auth, async (req, res) => {
  try {
    const categories = await Material.distinct('category', { isActive: true });
    const subCategories = await Material.distinct('subCategory', { isActive: true });
    
    res.json({
      categories,
      subCategories: subCategories.filter(sub => sub) // Remove null/undefined
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// Get low stock materials
router.get('/alerts/low-stock', auth, async (req, res) => {
  try {
    const lowStockMaterials = await Material.aggregate([
      {
        $match: {
          isActive: true,
          $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: '$createdBy'
      },
      {
        $project: {
          serialNumber: 1,
          name: 1,
          category: 1,
          quantityAvailable: 1,
          minStockLevel: 1,
          unit: 1,
          'createdBy.name': 1
        }
      }
    ]);

    res.json(lowStockMaterials);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ 
      message: 'Error fetching low stock materials', 
      error: error.message 
    });
  }
});

module.exports = router;
