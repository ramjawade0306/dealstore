const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  codEnabled: {
    type: Boolean,
    default: true
  },
  supportWhatsapp: {
    type: String,
    default: '+91 6264267644'
  },
  bannerImages: [String], // Hero slider images
  lowPriceLuxuryDealsEnabled: {
    type: Boolean,
    default: true
  },
  categories: {
    type: [String],
    default: ['Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories']
  },
  deliveryCharge: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
