const mongoose = require('mongoose');

const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

/**
 * Recommendation engine for turf time slots and nearby matches
 */
class RecommendationEngine {
  /**
   * Recommend best turf time slots based on user history and popularity
   */
  async recommendTimeSlots(userId, turfId, date) {
    try {
      const turf = await Turf.findById(turfId);
      if (!turf) throw new Error('Turf not found');

      // Get user's previous bookings to understand preferences
      const userBookings = await Booking.find({ user: userId })
        .sort('-createdAt')
        .limit(10);

      // Analyze user's preferred time slots
      const timePreferences = {};
      userBookings.forEach(booking => {
        booking.slots.forEach(slot => {
          const hour = parseInt(slot.startTime.split(':')[0]);
          timePreferences[hour] = (timePreferences[hour] || 0) + 1;
        });
      });

      // Get popular slots for this turf
      const popularBookings = await Booking.find({ 
        turf: turfId,
        status: 'confirmed'
      }).limit(100);

      const popularSlots = {};
      popularBookings.forEach(booking => {
        booking.slots.forEach(slot => {
          const key = `${slot.startTime}-${slot.endTime}`;
          popularSlots[key] = (popularSlots[key] || 0) + 1;
        });
      });

      // Get availability for the date
      const availability = turf.availability.find(
        a => new Date(a.date).toDateString() === new Date(date).toDateString()
      );

      if (!availability) {
        return { recommendations: [], message: 'No slots available for this date' };
      }

      // Score available slots
      const scoredSlots = availability.slots
        .filter(slot => !slot.isBooked)
        .map(slot => {
          const hour = parseInt(slot.startTime.split(':')[0]);
          const userPreferenceScore = timePreferences[hour] || 0;
          const popularityScore = popularSlots[`${slot.startTime}-${slot.endTime}`] || 0;
          
          // Time of day score (assuming evening is most preferred)
          let timeScore = 0;
          if (hour >= 17 && hour <= 21) timeScore = 3; // Evening
          else if (hour >= 6 && hour <= 10) timeScore = 2; // Morning
          else if (hour >= 14 && hour <= 17) timeScore = 2; // Afternoon
          else timeScore = 1; // Night

          const totalScore = userPreferenceScore * 0.4 + popularityScore * 0.3 + timeScore * 0.3;

          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            score: totalScore,
            reason: this.getSlotReason(userPreferenceScore, popularityScore, timeScore)
          };
        });

      scoredSlots.sort((a, b) => b.score - a.score);

      return {
        recommendations: scoredSlots.slice(0, 5),
        date: date
      };
    } catch (error) {
      throw error;
    }
  }

  getSlotReason(userScore, popularScore, timeScore) {
    if (userScore > 0) return 'Based on your preferences';
    if (popularScore > 5) return 'Popular slot';
    if (timeScore === 3) return 'Prime evening slot';
    return 'Available slot';
  }

  /**
   * Recommend nearby matches that user might be interested in
   */
  async recommendNearbyMatches(userId, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const { maxDistance = 20, limit = 10 } = options;

      const Match = require('../models/Match');
      
      let query = {
        status: 'scheduled',
        matchDate: { $gte: new Date() }
      };

      // Find matches within radius
      const matches = await Match.find(query)
        .populate({
          path: 'turf',
          select: 'name location'
        })
        .populate('team1', 'name statistics')
        .populate('team2', 'name statistics')
        .limit(limit * 2);

      // Score matches based on skill level and distance
      const matchmakingEngine = require('./matchmaking');
      
      const scoredMatches = matches
        .filter(match => {
          if (!match.turf?.location?.coordinates || !user.location?.coordinates) {
            return false;
          }
          
          const distance = matchmakingEngine.calculateDistance(
            user.location.coordinates.coordinates,
            match.turf.location.coordinates.coordinates
          );
          
          return distance <= maxDistance;
        })
        .map(match => {
          const avgMatchRating = (
            match.team1.statistics.teamRating + 
            match.team2.statistics.teamRating
          ) / 2;
          
          const ratingDiff = Math.abs(user.stats.skillRating - avgMatchRating);
          const skillScore = 1 - (Math.min(ratingDiff, 500) / 500);

          const distance = matchmakingEngine.calculateDistance(
            user.location.coordinates.coordinates,
            match.turf.location.coordinates.coordinates
          );
          const distanceScore = 1 - (Math.min(distance, maxDistance) / maxDistance);

          const totalScore = skillScore * 0.6 + distanceScore * 0.4;

          return {
            match: match.toObject(),
            distance: distance.toFixed(1),
            matchScore: (totalScore * 100).toFixed(1)
          };
        });

      scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

      return scoredMatches.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RecommendationEngine();
