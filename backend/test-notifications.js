const mongoose = require('mongoose');
const Material = require('./models/Material');
const Maintenance = require('./models/Maintenance');
const Task = require('./models/Task');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rishabh-system')
  .then(async () => {
    console.log('🔍 Testing notification API without authentication...\n');
    
    // Check if we have data
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    console.log('📅 Today:', today.toDateString());
    console.log('📅 Next Week:', nextWeek.toDateString());
    console.log('');

    // Check materials manually
    const lowStockMaterials = await Material.find({ 
      isActive: true,
      $expr: { $lte: ['$quantityAvailable', '$minStockLevel'] }
    }).select('name serialNumber quantityAvailable minStockLevel');
    
    console.log(`📦 Low Stock Materials Found: ${lowStockMaterials.length}`);
    lowStockMaterials.forEach(material => {
      console.log(`  - ${material.name}: ${material.quantityAvailable}/${material.minStockLevel} units`);
    });
    
    // Check overdue maintenance
    const overdueMaintenanceAlerts = await Maintenance.find({ 
      isActive: true,
      status: { $in: ['Scheduled', 'In Progress'] },
      nextDueDate: { $lt: today }
    }).populate('assignedTo', 'name').select('maintenanceId machineNo nextDueDate assignedTo');
    
    console.log(`\n🔧 Overdue Maintenance Found: ${overdueMaintenanceAlerts.length}`);
    overdueMaintenanceAlerts.forEach(maintenance => {
      console.log(`  - ${maintenance.maintenanceId} (${maintenance.machineNo}): Due ${maintenance.nextDueDate.toDateString()}`);
    });
    
    // Check upcoming maintenance
    const upcomingMaintenanceAlerts = await Maintenance.find({ 
      isActive: true,
      status: 'Scheduled',
      nextDueDate: { $gte: today, $lte: nextWeek }
    }).populate('assignedTo', 'name').select('maintenanceId machineNo nextDueDate assignedTo');
    
    console.log(`\n⏰ Upcoming Maintenance Found: ${upcomingMaintenanceAlerts.length}`);
    upcomingMaintenanceAlerts.forEach(maintenance => {
      console.log(`  - ${maintenance.maintenanceId} (${maintenance.machineNo}): Due ${maintenance.nextDueDate.toDateString()}`);
    });
    
    // Check overdue tasks
    const overdueTaskAlerts = await Task.find({ 
      isActive: true,
      status: { $nin: ['Completed', 'Cancelled'] },
      dueDate: { $lt: today }
    }).populate('assignedTo', 'name').select('taskId title dueDate assignedTo');
    
    console.log(`\n📋 Overdue Tasks Found: ${overdueTaskAlerts.length}`);
    overdueTaskAlerts.forEach(task => {
      console.log(`  - ${task.taskId} (${task.title}): Due ${task.dueDate.toDateString()}`);
    });

    // Simulate the API response
    const apiResponse = {
      lowStock: lowStockMaterials.map(material => ({
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
    };

    console.log('\n🚀 Simulated API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    const totalNotifications = 
      apiResponse.lowStock.length + 
      apiResponse.overdueMaintenance.length + 
      apiResponse.upcomingMaintenance.length + 
      apiResponse.overdueTasks.length;
    
    console.log(`\n📊 Total Notifications: ${totalNotifications}`);
    
    if (totalNotifications === 0) {
      console.log('\n❌ No notifications found! This explains why your frontend shows no notifications.');
      console.log('\n🔍 Let me check what might be wrong...\n');
      
      // Check if materials exist but don't meet criteria
      const allMaterials = await Material.find({ isActive: true });
      console.log(`Total active materials: ${allMaterials.length}`);
      
      allMaterials.forEach(material => {
        const isLowStock = material.quantityAvailable <= material.minStockLevel;
        console.log(`  - ${material.name}: ${material.quantityAvailable}/${material.minStockLevel} - ${isLowStock ? 'LOW STOCK ⚠️' : 'OK ✅'}`);
      });
      
    } else {
      console.log('\n✅ Notifications should appear in your frontend!');
      console.log('\n🔧 If you still don\'t see them, check:');
      console.log('1. Is your frontend connected to the right backend URL?');
      console.log('2. Are you logged in?');
      console.log('3. Check browser console for errors');
      console.log('4. Try refreshing the page');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  });
