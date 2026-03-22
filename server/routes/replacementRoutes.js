const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReplacement, getMyRequests, getAllRequests, updateReplacementStatus
} = require('../controllers/replacementController');

router.post('/', protect, createReplacement);
router.get('/my', protect, getMyRequests);
router.get('/admin', protect, admin, getAllRequests);
router.put('/admin/:id', protect, admin, updateReplacementStatus);

module.exports = router;
