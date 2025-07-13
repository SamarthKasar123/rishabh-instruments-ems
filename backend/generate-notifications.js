const mongoose = require('mongoose');
const Material = require('./models/Material');
const Maintenance = require('./models/Maintenance');
const Task = require('./models/Task');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rishabh-system')
  .then(async () => {
    console.log('🔍 Checking notification data...\n');
    
    // Check materials
    const materials = await Material.find({ isActive: true });
    console.log(`📦 Total Materials: ${materials.length}`);
    
    const lowStockMaterials = await Material.find({ 
      isActive: true,
      $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
    });
    console.log(`⚠️  Low Stock Materials: ${lowStockMaterials.length}`);
    
    if (lowStockMaterials.length > 0) {
      console.log('Low Stock Items:');
      lowStockMaterials.forEach(material => {
        console.log(`  - ${material.name}: ${material.quantityAvailable}/${material.minStockLevel}`);
      });
    }
    
    // Check maintenance
    const today = new Date();
    const overdueMaintenance = await Maintenance.find({ 
      isActive: true,
      status: { $in: ['Scheduled', 'In Progress'] },
      nextDueDate: { $lt: today }
    });
    console.log(`🔧 Overdue Maintenance: ${overdueMaintenance.length}`);
    
    // Check tasks
    const overdueTasks = await Task.find({ 
      isActive: true,
      status: { $nin: ['Completed', 'Cancelled'] },
      dueDate: { $lt: today }
    });
    console.log(`📋 Overdue Tasks: ${overdueTasks.length}`);
    
    console.log('\n🚀 Creating test data to generate notifications...\n');
    
    // Create low stock materials
    const testMaterials = [
      {
        name: 'Test Steel Rod - LOW STOCK',
        serialNumber: 'TSR-001',
        description: 'Test material for low stock alert',
        category: 'Raw Materials',
        unit: 'kg',
        quantityAvailable: 5,
        minStockLevel: 20,
        maxStockLevel: 100,
        unitPrice: 150,
        supplier: {
          name: 'Test Supplier Corp',
          contact: '+91 9999999999',
          email: 'test@supplier.com'
        },
        location: {
          warehouse: 'Warehouse A',
          rack: 'A1',
          bin: 'B1'
        },
        createdBy: new mongoose.Types.ObjectId(),
        isActive: true
      },
      {
        name: 'Test Copper Wire - CRITICAL',
        serialNumber: 'TCW-002',
        description: 'Test material for critical stock alert',
        category: 'Electronic Components',
        unit: 'mt',
        quantityAvailable: 2,
        minStockLevel: 50,
        maxStockLevel: 200,
        unitPrice: 25,
        supplier: {
          name: 'Test ElectroCorp Ltd',
          contact: '+91 8888888888',
          email: 'sales@electrocorp.com'
        },
        location: {
          warehouse: 'Warehouse B',
          rack: 'B2',
          bin: 'C3'
        },
        createdBy: new mongoose.Types.ObjectId(),
        isActive: true
      }
    ];
    
    // Delete existing test materials first
    await Material.deleteMany({ name: { $regex: /^Test/ } });
    
    // Insert new test materials
    const createdMaterials = await Material.insertMany(testMaterials);
    console.log(`✅ Created ${createdMaterials.length} test materials with low stock`);
    
    // Create overdue maintenance
    const testMaintenance = {
      maintenanceId: 'MAINT-TEST-001',
      machineNo: 'TEST-MACHINE-001',
      machineName: 'Test Production Machine',
      department: 'CAM Switch',
      maintenanceType: 'Preventive',
      frequency: 'Monthly',
      frequencyDays: 30,
      description: 'Test overdue maintenance',
      priority: 'High',
      status: 'Scheduled',
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      nextDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
      estimatedDuration: 4,
      assignedTo: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      isActive: true
    };
    
    await Maintenance.deleteMany({ maintenanceId: { $regex: /^MAINT-TEST/ } });
    const createdMaintenance = await Maintenance.create(testMaintenance);
    console.log(`🔧 Created overdue maintenance: ${createdMaintenance.maintenanceId}`);
    
    // Create overdue task
    const testTask = {
      taskId: 'TASK-TEST-001',
      title: 'Test Overdue Task',
      description: 'This is a test overdue task for notifications',
      taskType: 'Project Task',
      department: 'CAM Switch',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue)
      assignedTo: new mongoose.Types.ObjectId(),
      assignedBy: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      isActive: true
    };
    
    await Task.deleteMany({ taskId: { $regex: /^TASK-TEST/ } });
    const createdTask = await Task.create(testTask);
    console.log(`📋 Created overdue task: ${createdTask.taskId}`);
    
    console.log('\n🔍 Verifying notifications will be generated...\n');
    
    // Re-check after creating test data
    const newLowStock = await Material.find({ 
      isActive: true,
      $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
    });
    console.log(`📦 Low Stock Materials Now: ${newLowStock.length}`);
    
    const newOverdueMaintenance = await Maintenance.find({ 
      isActive: true,
      status: { $in: ['Scheduled', 'In Progress'] },
      nextDueDate: { $lt: today }
    });
    console.log(`🔧 Overdue Maintenance Now: ${newOverdueMaintenance.length}`);
    
    const newOverdueTasks = await Task.find({ 
      isActive: true,
      status: { $nin: ['Completed', 'Cancelled'] },
      dueDate: { $lt: today }
    });
    console.log(`📋 Overdue Tasks Now: ${newOverdueTasks.length}`);
    
    console.log('\n✅ Test data created! You should now see notifications in your frontend.');
    console.log('🔄 Refresh your browser or wait 30 seconds for auto-refresh.');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  });
