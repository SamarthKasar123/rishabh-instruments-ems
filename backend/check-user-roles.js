const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'name email role department');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role} - ${user.department}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUserRoles();
