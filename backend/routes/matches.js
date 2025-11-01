const mongoose = require('mongoose'); // ← This line is mandatory

// routes/matches.js - COMPLETE VERSION
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/matches
// @desc    Create match
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { team1, team2, turf, matchDate, startTime, endTime, matchType, format, overs, matchFee } = req.body;
    
    // Verify team captain
    const team1Doc = await Team.findById(team1);
    if (!team1Doc || team1Doc.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You must be the captain of team1 to create a match' });
    }
    
    const match = await Match.create({
      team1,
      team2,
      turf,
      matchDate,
      startTime,
      endTime,
      matchType,
      format,
      overs,
      status: 'scheduled',
      ...(matchType === 'lose-to-pay' && { 
        loseToPayDetails: { 
          amount: matchFee,
          isPaid: false 
        } 
      })
    });
    
    // Send notification to team2
    const team2Doc = await Team.findById(team2);
    await Notification.create({
      user: team2Doc.captain,
      type: 'match_invite',
      title: 'Match Challenge',
      message: `${team1Doc.name} has challenged your team to a ${matchType} match`,
      data: { matchId: match._id },
      actionUrl: `/matches/${match._id}`
    });
    
    res.status(201).json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matches
// @desc    Get all matches
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, matchType, teamId, upcoming, live } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (matchType) query.matchType = matchType;
    if (teamId) query.$or = [{ team1: teamId }, { team2: teamId }];
    if (upcoming === 'true') {
      query.matchDate = { $gte: new Date() };
      query.status = 'scheduled';
    }
    if (live === 'true') query.status = 'live';
    
    const matches = await Match.find(query)
      .populate('team1', 'name logo statistics')
      .populate('team2', 'name logo statistics')
      .populate('turf', 'name location pricing')
      .sort('-matchDate')
      .limit(50);
    
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matches/:id
// @desc    Get match by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1')
      .populate('team2')
      .populate('turf')
      .populate('result.manOfTheMatch', 'name stats');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/matches/:id/accept
// @desc    Accept match invitation
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1')
      .populate('team2');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Verify user is captain of team2
    if (match.team2.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team2 captain can accept' });
    }
    
    match.status = 'confirmed';
    await match.save();
    
    // Notify team1 captain
    await Notification.create({
      user: match.team1.captain,
      type: 'match_update',
      title: 'Match Accepted',
      message: `${match.team2.name} has accepted your match challenge!`,
      actionUrl: `/matches/${match._id}`
    });
    
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/matches/:id/score
// @desc    Update match score (live)
// @access  Private
router.put('/:id/score', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const { team, runs, wickets, overs, extras, liveUpdate } = req.body;
    
    if (team === 'team1') {
      match.scores.team1 = { runs, wickets, overs, extras };
    } else {
      match.scores.team2 = { runs, wickets, overs, extras };
    }
    
    if (liveUpdate) {
      match.liveUpdates.push(liveUpdate);
    }
    
    match.status = 'live';
    await match.save();
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`match_${match._id}`).emit('scoreUpdate', {
      matchId: match._id,
      scores: match.scores,
      liveUpdate
    });
    
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/matches/:id/complete
// @desc    Complete match and declare result
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1')
      .populate('team2');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const { winner, margin, manOfTheMatch } = req.body;
    
    match.result = { winner, margin, manOfTheMatch };
    match.status = 'completed';
    await match.save();
    
    // Update team statistics
    const winnerTeam = await Team.findById(winner);
    const loserTeamId = winner.toString() === match.team1._id.toString() 
      ? match.team2._id 
      : match.team1._id;
    const loserTeam = await Team.findById(loserTeamId);
    
    winnerTeam.statistics.matchesPlayed += 1;
    winnerTeam.statistics.matchesWon += 1;
    winnerTeam.statistics.teamRating += 25;
    await winnerTeam.save();
    
    loserTeam.statistics.matchesPlayed += 1;
    loserTeam.statistics.teamRating = Math.max(loserTeam.statistics.teamRating - 10, 0);
    await loserTeam.save();
    
    // Update player statistics
    await updatePlayerStats(match, winner, manOfTheMatch);
    
    // Handle Lose-to-Pay logic
    if (match.matchType === 'lose-to-pay' && match.loseToPayDetails) {
      const razorpay = require('../config/razorpay');
      
      // Create payment order for losing team
      const order = await razorpay.orders.create({
        amount: match.loseToPayDetails.amount * 100, // in paise
        currency: 'INR',
        receipt: `match_${match._id}_payment`
      });
      
      const payment = await Payment.create({
        user: loserTeam.captain,
        amount: match.loseToPayDetails.amount,
        paymentType: 'lose_to_pay',
        razorpayOrderId: order.id,
        status: 'pending',
        match: match._id
      });
      
      match.loseToPayDetails.paymentId = payment._id;
      await match.save();
      
      // Notify losing team captain
      await Notification.create({
        user: loserTeam.captain,
        type: 'payment',
        title: 'Match Fee Payment Required',
        message: `Your team lost the match. Please pay ₹${match.loseToPayDetails.amount}`,
        data: { 
          matchId: match._id,
          paymentId: payment._id,
          orderId: order.id
        },
        actionUrl: `/payments/${payment._id}`
      });
      
      // Notify winning team
      await Notification.create({
        user: winnerTeam.captain,
        type: 'match_update',
        title: 'Match Won! 🏆',
        message: `Congratulations! Your team won the match against ${loserTeam.name}`,
        actionUrl: `/matches/${match._id}`
      });
    }
    
    // Notify all team members
    const allMembers = [
      ...match.team1.members.map(m => m.user),
      ...match.team2.members.map(m => m.user)
    ];
    
    for (const userId of allMembers) {
      await Notification.create({
        user: userId,
        type: 'match_update',
        title: 'Match Completed',
        message: `Match between ${match.team1.name} and ${match.team2.name} has ended`,
        actionUrl: `/matches/${match._id}`
      });
    }
    
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update player statistics
async function updatePlayerStats(match, winnerId, manOfTheMatchId) {
  try {
    const winnerTeam = await Team.findById(winnerId).populate('members.user');
    const loserTeamId = winnerId.toString() === match.team1.toString() 
      ? match.team2 
      : match.team1;
    const loserTeam = await Team.findById(loserTeamId).populate('members.user');
    
    // Update all players' match count
    const allPlayers = [
      ...winnerTeam.members.map(m => m.user._id),
      ...loserTeam.members.map(m => m.user._id)
    ];
    
    for (const playerId of allPlayers) {
      const player = await User.findById(playerId);
      if (player) {
        player.stats.matchesPlayed += 1;
        
        // Update wins for winning team
        if (winnerTeam.members.some(m => m.user._id.toString() === playerId.toString())) {
          player.stats.matchesWon += 1;
          player.stats.skillRating += 10;
        } else {
          player.stats.skillRating = Math.max(player.stats.skillRating - 5, 0);
        }
        
        // Update level based on matches played
        player.stats.level = Math.floor(player.stats.matchesPlayed / 10) + 1;
        
        await player.save();
      }
    }
    
    // Give bonus to man of the match
    if (manOfTheMatchId) {
      const motm = await User.findById(manOfTheMatchId);
      if (motm) {
        motm.stats.skillRating += 20;
        
        // Check if this is their first MOTM achievement
        const hasMotmAchievement = motm.achievements.some(a => a.name === 'Man of the Match');
        if (!hasMotmAchievement) {
          motm.achievements.push({
            name: 'Man of the Match',
            description: 'Awarded Man of the Match for outstanding performance',
            icon: '⭐',
            earnedAt: new Date()
          });
        }
        
        await motm.save();
      }
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}

// @route   DELETE /api/matches/:id
// @desc    Cancel match
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('team1 team2');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Only captains can cancel
    if (
      match.team1.captain.toString() !== req.user._id.toString() &&
      match.team2.captain.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Only team captains can cancel matches' });
    }
    
    // Can't cancel if already started or completed
    if (match.status === 'live' || match.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel ongoing or completed matches' });
    }
    
    match.status = 'cancelled';
    await match.save();
    
    // Notify both teams
    const notifyUsers = [match.team1.captain, match.team2.captain];
    for (const userId of notifyUsers) {
      if (userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: userId,
          type: 'match_update',
          title: 'Match Cancelled',
          message: `The match between ${match.team1.name} and ${match.team2.name} has been cancelled`,
          actionUrl: `/matches/${match._id}`
        });
      }
    }
    
    res.json({ success: true, message: 'Match cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/matches/:id/spectate
// @desc    Add user as spectator
// @access  Private
router.post('/:id/spectate', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (!match.spectators.includes(req.user._id)) {
      match.spectators.push(req.user._id);
      await match.save();
    }
    
    res.json({ success: true, message: 'Added as spectator' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
