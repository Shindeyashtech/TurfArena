const mongoose = require('mongoose'); // ← This line is mandatory

// models/Payment.js
const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentType: { 
    type: String, 
    enum: ['booking', 'match_fee', 'lose_to_pay'], 
    required: true 
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'], 
    default: 'pending' 
  },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

