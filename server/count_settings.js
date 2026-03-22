const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Settings = require('./models/Settings');

dotenv.config();

const count = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/low-price-luxury');
    const total = await Settings.countDocuments();
    const all = await Settings.find();
    console.log('Total Settings docs:', total);
    console.log('All Settings:', JSON.stringify(all, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

count();
