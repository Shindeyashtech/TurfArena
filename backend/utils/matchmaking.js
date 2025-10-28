// utils/matchmaking.js
const Team = require('../models/Team');
const User = require('../models/User');

/**
 * AI-based matchmaking algorithm
 * Matches teams based on skill rating, location proximity, and availability
 */
class MatchmakingEngine {
  constructor() {
    this.SKILL_WEIGHT = 0.5;
    this.DISTANCE_WEIGHT = 0.3;
    this.AVAILABILITY_WEIGHT = 0.2;
  }

  /**
   * Calculate similarity score between two teams
   */
  calculateTeamSimilarity(team1, team2) {
    // Skill rating difference (normalized to 0-1, lower is better)
    const ratingDiff = Math.abs(team1.statistics.teamRating - team2.statistics.teamRating);
    const maxRatingDiff = 1000; // Assume max rating difference
    const skillScore = 1 - (Math.min(ratingDiff, maxRatingDiff) / maxRatingDiff);

    // Distance between teams (if location available)
    let distanceScore = 0.5; // Default neutral score
    if (team1.location?.coordinates && team2.location?.coordinates) {
      const distance = this.calculateDistance(
        team1.location.coordinates.coordinates,
        team2.location.coordinates.coordinates
      );
      const maxDistance = 50; // 50 km
      distanceScore = 1 - (Math.min(distance, maxDistance) / maxDistance);
    }

    // Availability match (simplified - could be enhanced)
    const availabilityScore = 0.7; // Placeholder

    // Weighted total score
    const totalScore = (
      skillScore * this.SKILL_WEIGHT +
      distanceScore * this.DISTANCE_WEIGHT +
      availabilityScore * this.AVAILABILITY_WEIGHT
    );

    return totalScore;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance([lon1, lat1], [lon2, lat2]) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find best match for a team
   */
  async findBestMatch(teamId, options = {}) {
    try {
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Team not found');

      const {
        maxDistance = 50, // km
        minRatingDiff = 0,
        maxRatingDiff = 500,
        limit = 10
      } = options;

      // Build query for potential opponents
      let query = {
        _id: { $ne: teamId },
        isActive: true,
        'statistics.teamRating': {
          $gte: team.statistics.teamRating - maxRatingDiff,
          $lte: team.statistics.teamRating + maxRatingDiff
        }
      };

      // Add geospatial query if location available
      if (team.location?.coordinates) {
        query['location.coordinates'] = {
          $near: {
            $geometry: team.location.coordinates,
            $maxDistance: maxDistance * 1000 // Convert to meters
          }
        };
      }

      const potentialOpponents = await Team.find(query)
        .limit(limit * 2); // Get more candidates for scoring

      // Calculate similarity scores
      const scoredTeams = potentialOpponents.map(opponent => ({
        team: opponent,
        score: this.calculateTeamSimilarity(team, opponent)
      }));

      // Sort by score and return top matches
      scoredTeams.sort((a, b) => b.score - a.score);

      return scoredTeams.slice(0, limit).map(item => ({
        ...item.team.toObject(),
        matchScore: (item.score * 100).toFixed(1)
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find players for a team based on skill and position requirements
   */
  async findPlayersForTeam(teamId, options = {}) {
    try {
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Team not found');

      const {
        requiredPositions = team.requiredPositions || [],
        maxDistance = 30,
        limit = 20
      } = options;

      // Calculate average team rating
      const avgTeamRating = team.statistics.teamRating;

      let query = {
        role: 'player',
        'stats.skillRating': {
          $gte: avgTeamRating - 200,
          $lte: avgTeamRating + 200
        }
      };

      // Filter by positions if specified
      if (requiredPositions.length > 0) {
        query['preferences.playingPosition'] = { $in: requiredPositions };
      }

      // Add geospatial query
      if (team.location?.coordinates) {
        query['location.coordinates'] = {
          $near: {
            $geometry: team.location.coordinates,
            $maxDistance: maxDistance * 1000
          }
        };
      }

      // Exclude current team members
      const memberIds = team.members.map(m => m.user);
      query._id = { $nin: memberIds };

      const players = await User.find(query)
        .select('name avatar stats preferences location')
        .limit(limit);

      // Score players
      const scoredPlayers = players.map(player => {
        const ratingDiff = Math.abs(player.stats.skillRating - avgTeamRating);
        const skillScore = 1 - (Math.min(ratingDiff, 400) / 400);

        let distanceScore = 0.5;
        if (player.location?.coordinates && team.location?.coordinates) {
          const distance = this.calculateDistance(
            player.location.coordinates.coordinates,
            team.location.coordinates.coordinates
          );
          distanceScore = 1 - (Math.min(distance, maxDistance) / maxDistance);
        }

        const totalScore = skillScore * 0.6 + distanceScore * 0.4;

        return {
          ...player.toObject(),
          matchScore: (totalScore * 100).toFixed(1)
        };
      });

      scoredPlayers.sort((a, b) => b.matchScore - a.matchScore);

      return scoredPlayers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MatchmakingEngine();

