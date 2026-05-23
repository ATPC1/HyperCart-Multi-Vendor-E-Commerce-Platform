const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Example of a route restricted to admins only
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

module.exports = router;
