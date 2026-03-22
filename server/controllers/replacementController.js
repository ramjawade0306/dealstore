const ReplacementRequest = require('../models/ReplacementRequest');
const Order = require('../models/Order');

// @desc    Create replacement request
// @route   POST /api/replacements
// @access  Private
exports.createReplacement = async (req, res) => {
  try {
    const { orderId, reason, proofImages } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Replacement only allowed for delivered orders' });
    }

    const request = await ReplacementRequest.create({
      order: orderId,
      user: req.user._id,
      reason,
      proofImages
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get my replacement requests
// @route   GET /api/replacements/my
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ReplacementRequest.find({ user: req.user._id })
      .populate('order');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all replacement requests (Admin)
// @route   GET /api/replacements/admin
// @access  Private/Admin
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ReplacementRequest.find({})
      .populate('user', 'phoneNumber name')
      .populate({
        path: 'order',
        populate: {
          path: 'items.product',
          select: 'title images brand'
        }
      })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update replacement status (Admin)
// @route   PUT /api/replacements/admin/:id
// @access  Private/Admin
exports.updateReplacementStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await ReplacementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    request.adminNotes = adminNotes || request.adminNotes;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
