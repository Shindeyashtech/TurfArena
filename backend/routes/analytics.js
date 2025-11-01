// routes/analytics.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Match = require('../models/Match');
const Payment = require('../models/Payment');
const Team = require('../models/Team');
const User = require('../models/User');
const Turf = require('../models/Turf');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get admin dashboard analytics
// @access  Private (Admin only)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalTeams = await Team.countDocuments();
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('turf', 'name')
      .sort('-createdAt')
      .limit(10);
    
    const topTurfs = await Booking.aggregate([
      { $group: { _id: '$turf', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalBookings,
        totalMatches,
        totalTeams,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentBookings,
        topTurfs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/turf-owner
// @desc    Get turf owner analytics
// @access  Private (Turf Owner)
router.get('/turf-owner', protect, authorize('turf_owner'), async (req, res) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id });
    const turfIds = turfs.map(t => t._id);
    
    const totalBookings = await Booking.countDocuments({ 
      turf: { $in: turfIds },
      status: 'confirmed'
    });
    
    const revenue = await Booking.aggregate([
      { $match: { turf: { $in: turfIds }, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const bookingsByTurf = await Booking.aggregate([
      { $match: { turf: { $in: turfIds } } },
      { $group: { _id: '$turf', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalTurfs: turfs.length,
        totalBookings,
        totalRevenue: revenue[0]?.total || 0,
        bookingsByTurf
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/leaderboard
// @desc    Get player leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'rating' } = req.query;
    
    let sortField = 'stats.skillRating';
    if (type === 'wins') sortField = 'stats.matchesWon';
    else if (type === 'runs') sortField = 'stats.totalRuns';
    else if (type === 'wickets') sortField = 'stats.totalWickets';
    
    const leaderboard = await User.find({ role: 'player' })
      .select('name avatar stats achievements')
      .sort({ [sortField]: -1 })
      .limit(50);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/player/:id
// @desc    Get individual player analytics
// @access  Public
router.get('/player/:id', async (req, res) => {
  try {
    const player = await User.findById(req.params.id)
      .select('name avatar stats achievements');
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Get recent matches
    const teams = await Team.find({ 'members.user': player._id });
    const teamIds = teams.map(t => t._id);
    
    const recentMatches = await Match.find({
      $or: [
        { team1: { $in: teamIds } },
        { team2: { $in: teamIds } }
      ],
      status: 'completed'
    })
    .sort('-matchDate')
    .limit(10)
    .populate('team1 team2', 'name');
    
    // Calculate win rate
    const wins = recentMatches.filter(m => 
      (teamIds.includes(m.result?.winner?.toString()))
    ).length;
    
    const winRate = recentMatches.length > 0 
      ? ((wins / recentMatches.length) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      player: {
        ...player.toObject(),
        recentMatches,
        winRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/team/:id
// @desc    Get team analytics
// @access  Public
router.get('/team/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name avatar stats');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get team's match history
    const matches = await Match.find({
      $or: [{ team1: team._id }, { team2: team._id }],
      status: 'completed'
    })
    .sort('-matchDate')
    .limit(20)
    .populate('team1 team2', 'name');
    
    // Calculate statistics
    const wins = matches.filter(m => 
      m.result?.winner?.toString() === team._id.toString()
    ).length;
    
    const losses = matches.length - wins;
    const winRate = matches.length > 0 
      ? ((wins / matches.length) * 100).toFixed(1)
      : 0;
    
    // Get recent form (last 5 matches)
    const recentForm = matches.slice(0, 5).map(m => 
      m.result?.winner?.toString() === team._id.toString() ? 'W' : 'L'
    );
    
    res.json({
      success: true,
      team: {
        ...team.toObject(),
        matches,
        analytics: {
          wins,
          losses,
          winRate,
          recentForm
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics over time
// @access  Private (Admin/Turf Owner)
router.get('/revenue', protect, authorize('admin', 'turf_owner'), async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    
    let matchQuery = { status: 'success' };
    
    if (req.user.role === 'turf_owner') {
      const turfs = await Turf.find({ owner: req.user._id });
      const turfIds = turfs.map(t => t._id);
      const bookings = await Booking.find({ 
        turf: { $in: turfIds } 
      }).select('_id');
      const bookingIds = bookings.map(b => b._id);
      
      matchQuery.booking = { $in: bookingIds };
    }
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Group by period
    let groupBy;
    switch (period) {
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      default: // daily
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
    
    const revenueData = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.json({
      success: true,
      period,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/popular-slots
// @desc    Get most popular booking time slots
// @access  Private (Turf Owner)
router.get('/popular-slots', protect, authorize('turf_owner'), async (req, res) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id });
    const turfIds = turfs.map(t => t._id);
    
    const bookings = await Booking.find({
      turf: { $in: turfIds },
      status: 'confirmed'
    });
    
    // Count slot occurrences
    const slotCounts = {};
    bookings.forEach(booking => {
      booking.slots.forEach(slot => {
        const key = `${slot.startTime}-${slot.endTime}`;
        slotCounts[key] = (slotCounts[key] || 0) + 1;
      });
    });
    
    // Convert to array and sort
    const popularSlots = Object.entries(slotCounts)
      .map(([slot, count]) => ({
        slot,
        count,
        percentage: ((count / bookings.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    res.json({
      success: true,
      popularSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
