const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @route   GET /api/public/settings
// @desc    Get public settings (like COD enabled, Categories)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    // Only return safe public fields
    res.json({
      codEnabled: settings.codEnabled,
      categories: settings.categories,
      supportWhatsapp: settings.supportWhatsapp,
      lowPriceLuxuryDealsEnabled: settings.lowPriceLuxuryDealsEnabled,
      deliveryCharge: settings.deliveryCharge || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
