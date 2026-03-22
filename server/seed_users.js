const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    const usersToSeed = [
      {
        name: 'Super Admin',
        phoneNumber: '+919999999999',
        password: 'adminpassword123',
        role: 'admin'
      },
      {
        name: 'Test Customer',
        phoneNumber: '+911234567890',
        password: 'password123',
        role: 'user'
      }
    ];

    for (const userData of usersToSeed) {
      let user = await User.findOne({ phoneNumber: userData.phoneNumber });
      if (user) {
        console.log(`User ${userData.phoneNumber} exists! Updating...`);
        user.password = userData.password;
        user.role = userData.role;
        await user.save();
      } else {
        console.log(`Creating User: ${userData.phoneNumber}`);
        user = new User(userData);
        await user.save();
      }
    }

    console.log('All users (Admin & Customer) seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
