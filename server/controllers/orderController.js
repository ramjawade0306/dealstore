const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins are not allowed to place orders.' });
    }

    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    // Check COD toggle
    if (paymentMethod === 'COD') {
      const settings = await Settings.findOne();
      if (!settings || !settings.codEnabled) {
        return res.status(400).json({ message: 'Cash on Delivery is currently not available' });
      }
    }

    // Calculate total
    const settings = await Settings.findOne();
    const deliveryCharge = settings?.deliveryCharge || 0;
    
    let totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalAmount += deliveryCharge;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          return res.status(400).json({ message: 'Coupon has expired' });
        }
        if (totalAmount < coupon.minOrderAmount) {
          return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
        }
        if (coupon.discountType === 'Percentage') {
          totalAmount -= (totalAmount * coupon.discountAmount) / 100;
        } else {
          totalAmount -= coupon.discountAmount;
        }
      } else {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }
    }

    const order = new Order({
      user: req.user._id,
      items,
      deliveryCharge,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
    });

    const createdOrder = await order.save();

    // Reduce stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Add order to user history
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orderHistory: createdOrder._id }
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title images brand')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'phoneNumber name')
      .populate('items.product', 'title images brand');

    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['Order Placed', 'Packed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============  ADMIN CONTROLLERS  =============

// @desc    Get all orders
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    if (status) query.orderStatus = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const orders = await Order.find(query)
      .populate('user', 'phoneNumber name')
      .populate('items.product', 'title brand images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, courierCompany, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'This order is cancelled and cannot be modified.' });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    if (courierCompany) order.courier.company = courierCompany;
    if (trackingNumber) order.courier.trackingNumber = trackingNumber;

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, pending, delivered, cancelled, ordersToday, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Order Placed' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      totalOrders: total,
      pendingOrders: pending,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      ordersToday,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
