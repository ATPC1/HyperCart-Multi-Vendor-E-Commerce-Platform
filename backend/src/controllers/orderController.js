const Order = require('../models/Order');
const Razorpay = require('razorpay');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      // Calculate estimated delivery: 3-5 business days from now
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 3); // 3-5 days

      const isPaid = paymentMethod !== 'Cash on Delivery';

      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        totalPrice,
        isPaid,
        paidAt: isPaid ? new Date() : undefined,
        estimatedDelivery,
      });

      const createdOrder = await order.save();

      // Emit socket event to vendors
      const io = req.app.get('io');
      const vendors = [...new Set(orderItems.map(item => item.vendor))];
      vendors.forEach(vendorId => {
        if (vendorId) {
          io.to(`vendor_${vendorId}`).emit('new_order', {
            message: 'You have a new order!',
            orderId: createdOrder._id
          });
        }
      });

      // Send order confirmation email
      if (req.user?.email) {
        const itemsHtml = orderItems.map(i =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(i.price * i.qty).toFixed(2)}</td></tr>`
        ).join('');
        sendEmail({
          to: req.user.email,
          subject: `✅ HyperCart Order Confirmed — #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:32px;border-radius:16px">
              <h2 style="color:#0F3460;margin-bottom:8px">Order Confirmed! 🎉</h2>
              <p style="color:#64748b">Hi <strong>${req.user.name}</strong>, your order has been placed successfully.</p>
              <p style="color:#64748b">Payment Method: <strong>${paymentMethod}</strong></p>
              <p style="color:#64748b">Estimated Delivery: <strong>${estimatedDelivery.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#fff;border-radius:12px;overflow:hidden">
                <thead><tr style="background:#0F3460;color:#fff"><th style="padding:10px;text-align:left">Product</th><th style="padding:10px">Qty</th><th style="padding:10px;text-align:right">Price</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <p style="font-size:18px;font-weight:bold;color:#0F3460">Total: $${totalPrice.toFixed(2)}</p>
              <p style="color:#94a3b8;font-size:12px;margin-top:32px">Thank you for shopping with HyperCart!</p>
            </div>
          `
        }).catch(console.error);
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a vendor
// @route   GET /api/orders/vendor
// @access  Private/Vendor
const getVendorOrders = async (req, res) => {
  try {
    // Find orders that contain at least one item from this vendor
    const orders = await Order.find({ 'orderItems.vendor': req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Vendor or Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      // Mark COD as paid when delivered
      if (order.paymentMethod === 'Cash on Delivery' && req.body.status === 'Delivered') {
        order.isPaid = true;
        order.paidAt = new Date();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Razorpay Order
// @route   POST /api/orders/razorpay
// @access  Private
const generateRazorpayOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
      console.log('[Razorpay] Using Mock Order Generation (Credentials missing or placeholder)');
      return res.json({
        id: `mock_order_${new Date().getTime()}`,
        isMock: true,
        amount: Math.round(req.body.amount * 100),
        currency: "INR"
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(req.body.amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.warn('[Razorpay API Error] Falling back to Mock Order:', error.message);
    res.json({
      id: `mock_order_fallback_${new Date().getTime()}`,
      isMock: true,
      amount: Math.round(req.body.amount * 100),
      currency: "INR"
    });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  generateRazorpayOrder,
};
