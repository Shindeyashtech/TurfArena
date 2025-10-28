const mongoose = require('mongoose');

// Define the Team Schema
const teamSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Team name is required'], 
      trim: true 
    },

    // Captain (Primary user who created the team)
    captain: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Captain ID is required'] 
    },

    // Team Members Array
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { 
          type: String, 
          enum: ['captain', 'vice_captain', 'player'], 
          default: 'player' 
        },
        joinedAt: { type: Date, default: Date.now }
      }
    ],

    // Optional branding
    logo: { type: String, default: '' },
    description: { type: String, trim: true },

    // Team size limits
    minMembers: { type: Number, default: 6 },
    maxMembers: { type: Number, default: 11 },

    // Recruitment options
    lookingForPlayers: { type: Boolean, default: false },
    requiredPositions: {
      type: [String],
      enum: ['batsman', 'bowler', 'all_rounder', 'wicket_keeper', 'fielder'],
      default: []
    },

    // Team performance stats
    statistics: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      totalRuns: { type: Number, default: 0 },
      totalWickets: { type: Number, default: 0 },
      teamRating: { type: Number, default: 1000 } // ELO-based rating
    },

    // Team location
    location: {
      city: { type: String, trim: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0]
        }
      }
    },

    // Awards or notable wins
    achievements: [
      {
        title: { type: String, trim: true },
        description: String,
        date: Date
      }
    ],

    // Team status
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// Indexing for performance
teamSchema.index({ 'location.coordinates': '2dsphere' }); // Geo search
teamSchema.index({ 'statistics.teamRating': -1 }); // Ranking
teamSchema.index({ name: 1 }); // Fast search by team name

// Middleware: keep updatedAt fresh on every save
teamSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual: calculate win ratio dynamically
teamSchema.virtual('winRatio').get(function () {
  if (this.statistics.matchesPlayed === 0) return 0;
  return this.statistics.matchesWon / this.statistics.matchesPlayed;
});

// Export Model
const Team = mongoose.model('Team', teamSchema);
module.exports = Team;

// // models/Team.js
// const teamSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   captain: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   members: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     role: { type: String, enum: ['captain', 'vice_captain', 'player'] },
//     joinedAt: { type: Date, default: Date.now }
//   }],
//   logo: String,
//   description: String,
//   minMembers: { type: Number, default: 6 },
//   maxMembers: { type: Number, default: 11 },
//   lookingForPlayers: { type: Boolean, default: false },
//   requiredPositions: [String], // ['batsman', 'bowler', 'wicket_keeper']
//   statistics: {
//     matchesPlayed: { type: Number, default: 0 },
//     matchesWon: { type: Number, default: 0 },
//     totalRuns: { type: Number, default: 0 },
//     totalWickets: { type: Number, default: 0 },
//     teamRating: { type: Number, default: 1000 }
//   },
//   location: {
//     city: String,
//     coordinates: {
//       type: { type: String, enum: ['Point'], default: 'Point' },
//       coordinates: [Number]
//     }
//   },
//   achievements: [{
//     title: String,
//     description: String,
//     date: Date
//   }],
//   isActive: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// teamSchema.index({ 'location.coordinates': '2dsphere' });
// teamSchema.index({ 'statistics.teamRating': -1 });

// module.exports = mongoose.model('Team', teamSchema);
