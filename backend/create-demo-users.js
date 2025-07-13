const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing demo users first
    await User.deleteMany({
      email: { $in: ['admin@rishabh.co.in', 'manager@rishabh.co.in', 'operator@rishabh.co.in'] }
    });
    console.log('Cleared existing demo users');
    
    // Create fresh demo users
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@rishabh.co.in',
        password: 'admin123',
        role: 'admin',
        department: 'MID',
        isActive: true
      },
      {
        name: 'Manager User',
        email: 'manager@rishabh.co.in',
        password: 'manager123',
        role: 'manager',
        department: 'CAM Switch',
        isActive: true
      },
      {
        name: 'Operator User',
        email: 'operator@rishabh.co.in',
        password: 'operator123',
        role: 'operator',
        department: 'Transducer',
        isActive: true
      }
    ];
    
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);
      
      // Test the password immediately
      const testMatch = await user.comparePassword(userData.password);
      console.log(`   Password test: ${testMatch ? '✅' : '❌'}`);
    }
    
    mongoose.connection.close();
    console.log('\n🎉 All demo users created successfully!');
    console.log('\nYou can now login with:');
    console.log('• admin@rishabh.co.in / admin123');
    console.log('• manager@rishabh.co.in / manager123');
    console.log('• operator@rishabh.co.in / operator123');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDemoUsers();
