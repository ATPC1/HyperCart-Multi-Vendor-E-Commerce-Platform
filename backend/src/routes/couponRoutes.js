const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc  Validate / apply coupon code
// @route POST /api/coupons/apply
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code.' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res.status(400).json({ message: 'This coupon has expired.' });
    if (orderAmount < coupon.minOrderAmount)
      return res.status(400).json({ message: `Minimum order amount for this coupon is $${coupon.minOrderAmount}.` });

    const discount =
      coupon.discountType === 'percentage'
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: parseFloat(discount.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc  Create coupon (Admin only)
// @route POST /api/coupons
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// @desc  Get all coupons (Admin only)
// @route GET /api/coupons
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc  Toggle coupon active status (Admin)
// @route PUT /api/coupons/:id/toggle
router.put('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc  Delete coupon (Admin)
// @route DELETE /api/coupons/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
