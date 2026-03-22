const mongoose = require('mongoose');

const ReplacementRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  proofImages: [{
    type: String // URLs
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('ReplacementRequest', ReplacementRequestSchema);
