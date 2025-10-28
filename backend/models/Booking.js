const mongoose = require('mongoose'); // ← This line is mandatory

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  turf: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Turf', 
    required: true 
  },
  bookingDate: { type: Date, required: true },
  slots: [
    {
      startTime: String,
      endTime: String
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  linkedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ turf: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
