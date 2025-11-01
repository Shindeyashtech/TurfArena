const mongoose = require('mongoose'); // ← This line is mandatory

// models/Match.js
const matchSchema = new mongoose.Schema({
  team1: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  team2: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  turf: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Turf', 
    required: true 
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  },
  matchDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  matchType: { 
    type: String, 
    enum: ['friendly', 'lose-to-pay', 'tournament'], 
    default: 'friendly' 
  },
  format: { 
    type: String, 
    enum: ['T20', 'T10', 'One Day'], 
    default: 'T20' 
  },
  overs: Number,
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  toss: {
    wonBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    decision: { type: String, enum: ['bat', 'bowl'] }
  },
  scores: {
    team1: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      extras: { type: Number, default: 0 }
    },
    team2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      extras: { type: Number, default: 0 }
    }
  },
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    margin: String, // '5 wickets', '20 runs'
    manOfTheMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  loseToPayDetails: {
    amount: Number,
    isPaid: { type: Boolean, default: false },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
  },
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  liveUpdates: [{
    over: Number,
    ball: Number,
    runs: Number,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

matchSchema.index({ matchDate: -1, status: 1 });
matchSchema.index({ team1: 1, team2: 1 });

module.exports = mongoose.model('Match', matchSchema);
