const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  getOrders,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/users').get(protect, authorize('admin'), getUsers);
router.route('/users/:id/status').put(protect, authorize('admin'), updateUserStatus);
router.route('/orders').get(protect, authorize('admin'), getOrders);
router.route('/stats').get(protect, authorize('admin'), getStats);

module.exports = router;
