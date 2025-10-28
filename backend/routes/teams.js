
// routes/teams.js
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/teams
// @desc    Create team
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      captain: req.user._id,
      members: [{ user: req.user._id, role: 'captain' }]
    };
    
    const team = await Team.create(teamData);
    res.status(201).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teams
// @desc    Get all teams
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, lookingForPlayers, minRating, maxRating } = req.query;
    
    let query = { isActive: true };
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (lookingForPlayers === 'true') query.lookingForPlayers = true;
    if (minRating || maxRating) {
      query['statistics.teamRating'] = {};
      if (minRating) query['statistics.teamRating'].$gte = Number(minRating);
      if (maxRating) query['statistics.teamRating'].$lte = Number(maxRating);
    }
    
    const teams = await Team.find(query)
      .populate('captain', 'name avatar')
      .populate('members.user', 'name avatar stats')
      .sort('-statistics.teamRating');
    
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email phone avatar stats')
      .populate('members.user', 'name avatar stats');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teams/:id/join
// @desc    Request to join team
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }
    
    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    team.members.push({ user: req.user._id, role: 'player' });
    
    if (team.members.length >= team.minMembers) {
      team.lookingForPlayers = false;
    }
    
    await team.save();
    
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teams/:teamId/members/:userId
// @desc    Remove member from team
// @access  Private (Captain only)
router.delete('/:teamId/members/:userId', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only captain can remove members' });
    }
    
    team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
    await team.save();
    
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;