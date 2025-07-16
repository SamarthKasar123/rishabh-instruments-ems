const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const User = require('./models/User');
const Material = require('./models/Material');
const Project = require('./models/Project');
const BOM = require('./models/BOM');
const Maintenance = require('./models/Maintenance');
const Task = require('./models/Task');

require('dotenv').config();

const exportData = async () => {
  try {
    console.log('🔄 Connecting to local MongoDB...');
    // Connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/rishabh-instruments');
    console.log('✅ Connected to local MongoDB');

    const backupDir = path.join(__dirname, '..', 'mongodb-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export all collections
    const collections = [
      { model: User, name: 'users' },
      { model: Material, name: 'materials' },
      { model: Project, name: 'projects' },
      { model: BOM, name: 'boms' },
      { model: Maintenance, name: 'maintenance' },
      { model: Task, name: 'tasks' }
    ];

    console.log('📦 Exporting data from local database...');
    
    for (const collection of collections) {
      try {
        const data = await collection.model.find({}).lean();
        const filePath = path.join(backupDir, `${collection.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Exported ${data.length} ${collection.name} records`);
      } catch (error) {
        console.log(`⚠️  Collection ${collection.name} not found or empty`);
      }
    }

    console.log('🎉 Local data export completed!');
    
  } catch (error) {
    console.error('❌ Export error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from local MongoDB');
  }
};

const importData = async () => {
  try {
    console.log('🔄 Connecting to production MongoDB...');
    // Connect to production MongoDB
    await mongoose.connect(process.env.MONGODB_URI_PROD);
    console.log('✅ Connected to production MongoDB');

    const backupDir = path.join(__dirname, '..', 'mongodb-backup');
    
    // Import all collections
    const collections = [
      { model: User, name: 'users' },
      { model: Material, name: 'materials' },
      { model: Project, name: 'projects' },
      { model: BOM, name: 'boms' },
      { model: Maintenance, name: 'maintenance' },
      { model: Task, name: 'tasks' }
    ];

    console.log('📥 Importing data to production database...');
    
    for (const collection of collections) {
      try {
        const filePath = path.join(backupDir, `${collection.name}.json`);
        
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (data.length > 0) {
            // Clear existing data (except users to keep demo users)
            if (collection.name !== 'users') {
              await collection.model.deleteMany({});
            } else {
              // For users, only delete non-demo users
              await collection.model.deleteMany({
                email: { $nin: ['admin@rishabh.co.in', 'manager@rishabh.co.in', 'operator@rishabh.co.in'] }
              });
            }
            
            // Insert new data
            const cleanData = data.map(item => {
              // Remove MongoDB-specific fields for reimport
              const { _id, __v, createdAt, updatedAt, ...cleanItem } = item;
              return cleanItem;
            });
            
            await collection.model.insertMany(cleanData);
            console.log(`✅ Imported ${cleanData.length} ${collection.name} records`);
          } else {
            console.log(`⚠️  No data found for ${collection.name}`);
          }
        } else {
          console.log(`⚠️  File not found: ${collection.name}.json`);
        }
      } catch (error) {
        console.error(`❌ Error importing ${collection.name}:`, error.message);
      }
    }

    console.log('🎉 Production data import completed!');
    
  } catch (error) {
    console.error('❌ Import error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production MongoDB');
  }
};

// Check command line arguments
const command = process.argv[2];

if (command === 'export') {
  exportData();
} else if (command === 'import') {
  importData();
} else {
  console.log('Usage:');
  console.log('  node migrateData.js export  - Export from local MongoDB');
  console.log('  node migrateData.js import  - Import to production MongoDB');
}
