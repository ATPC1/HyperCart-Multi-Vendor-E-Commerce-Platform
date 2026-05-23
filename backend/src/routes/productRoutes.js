const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, authorize('vendor'), createProduct);
router.route('/vendor').get(protect, authorize('vendor'), getVendorProducts);
router.route('/:id').get(getProductById).delete(protect, authorize('vendor', 'admin'), deleteProduct).put(protect, authorize('vendor', 'admin'), updateProduct);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
