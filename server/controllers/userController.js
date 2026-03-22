const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { admin, firebaseInitialized } = require('../config/firebase');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user (Verify OTP + Save Info)
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { phoneNumber, name, password, idToken } = req.body;

    if (!firebaseInitialized) {
      return res.status(503).json({ message: 'Firebase is not configured. Please add your Firebase credentials to server/.env' });
    }

    // 1. Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const tokenPhone = decodedToken.phone_number;

    if (tokenPhone !== phoneNumber) {
      return res.status(400).json({ message: 'Phone number mismatch' });
    }

    // 2. Check if user exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create User
    user = await User.create({ phoneNumber, name, password });

    res.status(201).json({
      _id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

// @desc    Login user (Traditional Password)
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password (Verify OTP + New Password)
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { phoneNumber, password, idToken } = req.body;

    if (!firebaseInitialized) {
      return res.status(503).json({ message: 'Firebase is not configured' });
    }

    // 1. Verify OTP
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.phone_number !== phoneNumber) {
      return res.status(400).json({ message: 'Phone number mismatch' });
    }

    // 2. Update Password
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: 'Reset failed', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        addresses: user.addresses,
        wishlist: user.wishlist,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.addresses) user.addresses = req.body.addresses;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        phoneNumber: updatedUser.phoneNumber,
        name: updatedUser.name,
        addresses: updatedUser.addresses,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-__v')
      .populate({
        path: 'orderHistory',
        select: '_id totalAmount orderStatus createdAt paymentMethod items',
        populate: {
          path: 'items.product',
          select: 'title images brand'
        }
      })
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
