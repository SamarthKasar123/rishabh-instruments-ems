const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test credentials
    const email = 'admin@rishabh.co.in';
    const password = 'admin123';
    
    console.log(`Testing login for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      
      // Create the user
      console.log('Creating demo user...');
      const newUser = new User({
        name: 'Admin User',
        email: 'admin@rishabh.co.in',
        password: 'admin123',
        role: 'admin',
        department: 'Administration'
      });
      
      await newUser.save();
      console.log('✅ Demo user created');
      
      // Test login again
      const testUser = await User.findOne({ email });
      const isMatch = await testUser.comparePassword(password);
      console.log('Password match result:', isMatch);
      
    } else {
      console.log('✅ User found');
      console.log('User details:', {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
      
      // Test password
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password mismatch. Updating password...');
        user.password = password;
        await user.save();
        console.log('Password updated');
        
        // Test again
        const updatedUser = await User.findOne({ email });
        const newMatch = await updatedUser.comparePassword(password);
        console.log('New password match result:', newMatch);
      }
    }
    
    mongoose.connection.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
