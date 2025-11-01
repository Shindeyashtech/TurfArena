// models/Turf.js
const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String },
  images: [String],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  pricing: {
    basePrice: { type: Number, required: true }, // per hour
    weekendPrice: { type: Number },
    peakHourPrice: { type: Number }
  },
  amenities: [String], // ['parking', 'changing_room', 'water', 'lights']
  specifications: {
    pitchType: String, // 'turf', 'concrete', 'matting'
    dimensions: String, // '60x40 yards'
    capacity: Number,
    lightingAvailable: Boolean
  },
  availability: [{
    date: Date,
    slots: [{
      startTime: String, // '06:00'
      endTime: String, // '08:00'
      isBooked: { type: Boolean, default: false },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
    }]
  }],
  maintenanceDates: [String], // Array of date strings in 'YYYY-MM-DD' format
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  statistics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    popularSlots: [String]
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

turfSchema.index({ 'location.coordinates': '2dsphere' });
turfSchema.index({ 'ratings.average': -1 });

module.exports = mongoose.model('Turf', turfSchema);
