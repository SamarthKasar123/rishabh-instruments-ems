const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAndCreateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check existing users
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} users in database`);
    
    if (existingUsers.length > 0) {
      existingUsers.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    } else {
      console.log('No users found. Creating demo users...');
      
      // Create demo users
      const demoUsers = [
        {
          name: 'Admin User',
          email: 'admin@rishabh.co.in',
          password: 'admin123',
          role: 'admin',
          department: 'Administration'
        },
        {
          name: 'Manager User',
          email: 'manager@rishabh.co.in',
          password: 'manager123',
          role: 'manager',
          department: 'Production'
        },
        {
          name: 'Operator User',
          email: 'operator@rishabh.co.in',
          password: 'operator123',
          role: 'operator',
          department: 'Operations'
        }
      ];
      
      for (const userData of demoUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${user.email}`);
      }
    }
    
    mongoose.connection.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateUsers();
