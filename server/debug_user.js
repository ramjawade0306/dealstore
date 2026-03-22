const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    const phoneNumber = '+919999999999';
    const user = await User.findOne({ phoneNumber });

    if (user) {
      console.log('User found:');
      console.log('ID:', user._id);
      console.log('Phone:', user.phoneNumber);
      console.log('Role:', user.role);
    } else {
      console.log('User not found!');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error debugging user:', error);
    process.exit(1);
  }
};

debugUser();
