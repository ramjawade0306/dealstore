const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log(`[AUTH] User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User no longer exists' });
      }
      
      console.log(`[AUTH] User Authenticated: ${req.user.phoneNumber} (Role: ${req.user.role})`);
      next();
    } catch (error) {
      console.error('[AUTH] Token Verification Failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn(`[AUTH] Forbidden Admin Access Attempt: ${req.user?.phoneNumber} (Role: ${req.user?.role})`);
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};
