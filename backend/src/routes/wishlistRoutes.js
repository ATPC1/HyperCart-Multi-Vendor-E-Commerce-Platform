const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc  Get wishlist
// @route GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc  Toggle product in wishlist (add if not present, remove if present)
// @route POST /api/wishlist/:productId
router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.findIndex((id) => id.toString() === productId);

    if (idx === -1) {
      user.wishlist.push(productId);
      await user.save();
      res.json({ added: true, wishlist: user.wishlist });
    } else {
      user.wishlist.splice(idx, 1);
      await user.save();
      res.json({ added: false, wishlist: user.wishlist });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
