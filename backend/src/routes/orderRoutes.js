const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  generateRazorpayOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/razorpay').post(protect, generateRazorpayOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/vendor').get(protect, authorize('vendor'), getVendorOrders);
router.route('/:id/status').put(protect, authorize('vendor', 'admin'), updateOrderStatus);

module.exports = router;
