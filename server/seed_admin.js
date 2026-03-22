const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    const formats = ['+919999999999', '9999999999', '+91 9999999999'];
    const password = 'adminpassword123';

    for (const phoneNumber of formats) {
      let admin = await User.findOne({ phoneNumber });
      if (admin) {
        console.log(`Admin ${phoneNumber} exists! Updating...`);
        admin.password = password;
        admin.role = 'admin';
        await admin.save();
      } else {
        console.log(`Creating Admin: ${phoneNumber}`);
        admin = new User({
          name: 'Super Admin',
          phoneNumber,
          password,
          role: 'admin'
        });
        await admin.save();
      }
    }

    console.log('All admin formats seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
};

seedAdmins();
