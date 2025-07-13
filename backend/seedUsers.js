const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@rishabh.co.in' });
    if (existingAdmin) {
      console.log('Demo users already exist');
      return;
    }

    // Create demo users
    const demoUsers = [
      {
        name: 'System Administrator',
        email: 'admin@rishabh.co.in',
        password: 'admin123',
        role: 'admin',
        department: 'MID',
        isActive: true,
      },
      {
        name: 'Project Manager',
        email: 'manager@rishabh.co.in',
        password: 'manager123',
        role: 'manager',
        department: 'CAM Switch',
        isActive: true,
      },
      {
        name: 'System Operator',
        email: 'operator@rishabh.co.in',
        password: 'operator123',
        role: 'operator',
        department: 'Transducer',
        isActive: true,
      },
    ];

    // Hash passwords and save users
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email}`);
    }

    console.log('Demo users created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@rishabh.co.in / admin123');
    console.log('Manager: manager@rishabh.co.in / manager123');
    console.log('Operator: operator@rishabh.co.in / operator123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedUsers();
