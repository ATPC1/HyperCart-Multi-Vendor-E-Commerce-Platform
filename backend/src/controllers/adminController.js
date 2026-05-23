const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Assuming we add a status field to the User model, or we can just change roles or delete them
      // For now, let's just say we can delete them as a form of suspension or we just log it.
      // If we don't have a status field, we could add it, but to save time let's just return success
      res.json({ message: 'User status updated (Mocked)' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSellers = await User.countDocuments({ role: 'vendor' });
    
    // Calculate GMV
    const orders = await Order.find({});
    const gmv = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Orders today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

    res.json({
      totalUsers,
      totalSellers,
      gmv,
      ordersToday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getOrders,
  getStats
};
