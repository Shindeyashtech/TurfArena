// routes/payments.js - UPDATED FOR MOCK PAYMENTS
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mockPayment = require('../config/payment');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/create-order
// @desc    Create payment order (Mock)
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, paymentType, bookingId, matchId } = req.body;
    
    // Create mock order
    const order = await mockPayment.createOrder({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    
    const payment = await Payment.create({
      user: req.user._id,
      amount,
      paymentType,
      razorpayOrderId: order.id,
      status: 'pending',
      booking: bookingId,
      match: matchId
    });
    
    res.json({ 
      success: true, 
      order,
      paymentId: payment._id,
      // Mock payment credentials for frontend
      mockMode: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment (Mock - Auto Success)
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    
    // Mock verification (always succeeds)
    const mockPaymentId = razorpayPaymentId || `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = razorpaySignature || crypto.randomBytes(32).toString('hex');
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.razorpayPaymentId = mockPaymentId;
    payment.razorpaySignature = mockSignature;
    payment.status = 'success';
    await payment.save();
    
    // Update booking status if it's a booking payment
    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, {
        status: 'pending', // Keep as pending until turf owner confirms
        paymentId: payment._id
      });
    }
    
    // Send notification
    await Notification.create({
      user: req.user._id,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of ₹${payment.amount} was successful`,
      actionUrl: payment.booking ? `/bookings/${payment.booking}` : `/payments/${payment._id}`
    });
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/my
// @desc    Get user payment history
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking')
      .populate('match')
      .sort('-createdAt');
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('match');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments/refund/:id
// @desc    Process refund (Mock)
// @access  Private (Admin only)
router.post('/refund/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'success') {
      return res.status(400).json({ message: 'Can only refund successful payments' });
    }
    
    payment.status = 'refunded';
    await payment.save();
    
    // Notify user
    await Notification.create({
      user: payment.user,
      type: 'payment',
      title: 'Refund Processed',
      message: `Refund of ₹${payment.amount} has been processed`,
      actionUrl: `/payments/${payment._id}`
    });
    
    res.json({ success: true, payment, message: 'Refund processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
