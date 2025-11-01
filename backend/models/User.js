const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['player', 'turf_owner', 'admin'], 
    default: 'player' 
  },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    matchesWon: { type: Number, default: 0 },
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    skillRating: { type: Number, default: 1000 },
    level: { type: Number, default: 1 }
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  location: {
    city: String,
    state: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // FIXED: Array with default [longitude, latitude]
    }
  },
  preferences: {
    playingPosition: [String],
    preferredFormats: [String],
    availability: {
      weekdays: [Boolean],
      timeSlots: [String]
    }
  },
  isVerified: { type: Boolean, default: false },
  fcmToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// FIXED: Only create index if coordinates are properly set
userSchema.index({ 'location.coordinates': '2dsphere' }, { 
  sparse: true // Allows documents without coordinates
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
