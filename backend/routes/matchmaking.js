// routes/matchmaking.js - AI MATCHMAKING ROUTES
const express = require('express');
const router = express.Router();
const matchmakingEngine = require('../utils/matchmaking');
const recommendationEngine = require('../utils/recommendations');
const { protect } = require('../middleware/auth');

// @route   GET /api/matchmaking/teams/:teamId
// @desc    Find best team matches using AI
// @access  Private
router.get('/teams/:teamId', protect, async (req, res) => {
  try {
    const { maxDistance, maxRatingDiff, limit } = req.query;
    
    const matches = await matchmakingEngine.findBestMatch(req.params.teamId, {
      maxDistance: maxDistance ? parseInt(maxDistance) : 50,
      maxRatingDiff: maxRatingDiff ? parseInt(maxRatingDiff) : 500,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.json({ 
      success: true, 
      matches,
      message: 'AI-powered matchmaking results'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matchmaking/players/:teamId
// @desc    Find players for team
// @access  Private
router.get('/players/:teamId', protect, async (req, res) => {
  try {
    const { positions, maxDistance, limit } = req.query;
    
    const players = await matchmakingEngine.findPlayersForTeam(req.params.teamId, {
      requiredPositions: positions ? positions.split(',') : [],
      maxDistance: maxDistance ? parseInt(maxDistance) : 30,
      limit: limit ? parseInt(limit) : 20
    });
    
    res.json({ 
      success: true, 
      players,
      message: 'Recommended players based on skill and location'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matchmaking/recommendations/timeslots
// @desc    Recommend best time slots
// @access  Private
router.get('/recommendations/timeslots', protect, async (req, res) => {
  try {
    const { turfId, date } = req.query;
    
    if (!turfId || !date) {
      return res.status(400).json({ message: 'Turf ID and date are required' });
    }
    
    const recommendations = await recommendationEngine.recommendTimeSlots(
      req.user._id, 
      turfId, 
      date
    );
    
    res.json({ 
      success: true, 
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matchmaking/recommendations/matches
// @desc    Recommend nearby matches
// @access  Private
router.get('/recommendations/matches', protect, async (req, res) => {
  try {
    const { maxDistance, limit } = req.query;
    
    const matches = await recommendationEngine.recommendNearbyMatches(req.user._id, {
      maxDistance: maxDistance ? parseInt(maxDistance) : 20,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.json({ 
      success: true, 
      matches,
      message: 'Nearby matches you might be interested in'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
