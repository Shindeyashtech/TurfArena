import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, Target, Zap, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const MatchDetails = () => {
  const { id } = useParams();
  const socket = useSocket();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  useEffect(() => {
    if (socket && match) {
      socket.emit('joinMatch', match._id);
      socket.on('scoreUpdate', handleScoreUpdate);

      return () => {
        socket.emit('leaveMatch', match._id);
        socket.off('scoreUpdate', handleScoreUpdate);
      };
    }
  }, [socket, match]);

  const fetchMatchDetails = async () => {
    try {
      const res = await axios.get(`/api/matches/${id}`);
      setMatch(res.data.match);
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = (data) => {
    setMatch(prev => ({
      ...prev,
      scores: data.scores,
      liveUpdates: data.liveUpdate 
        ? [...(prev.liveUpdates || []), data.liveUpdate]
        : prev.liveUpdates
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Match not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Match Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`px-4 py-2 rounded-full font-semibold ${
            match.status === 'live' 
              ? 'bg-red-500 text-white animate-pulse' 
              : match.status === 'scheduled'
              ? 'bg-blue-500 text-white'
              : match.status === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {match.status.toUpperCase()}
          </div>
          
          {match.matchType === 'lose-to-pay' && (
            <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full font-semibold flex items-center">
              💰 Lose-to-Pay: ₹{match.loseToPayDetails?.amount}
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Team 1 */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {match.team1.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold mb-2">{match.team1.name}</h2>
            {match.status !== 'scheduled' && (
              <div className="text-4xl font-bold text-green-500">
                {match.scores.team1.runs}/{match.scores.team1.wickets}
                <div className="text-sm text-gray-500">({match.scores.team1.overs} overs)</div>
              </div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-400 mb-4">VS</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Calendar size={16} />
                <span>{new Date(match.matchDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock size={16} />
                <span>{match.startTime} - {match.endTime}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Trophy size={16} />
                <span>{match.format}</span>
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {match.team2.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold mb-2">{match.team2.name}</h2>
            {match.status !== 'scheduled' && (
              <div className="text-4xl font-bold text-green-500">
                {match.scores.team2.runs}/{match.scores.team2.wickets}
                <div className="text-sm text-gray-500">({match.scores.team2.overs} overs)</div>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {match.status === 'completed' && match.result && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-xl font-bold">
              {match.result.winner === match.team1._id ? match.team1.name : match.team2.name} won by {match.result.margin}
            </p>
            {match.result.manOfTheMatch && (
              <p className="text-sm mt-2">
                Man of the Match: {match.result.manOfTheMatch.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <MapPin className="mr-2 text-green-500" />
            Venue
          </h3>
          <p className="font-semibold mb-2">{match.turf.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {match.turf.location.address}, {match.turf.location.city}
          </p>
        </div>

        {/* Teams */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2 text-blue-500" />
            Teams
          </h3>
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{match.team1.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rating: {match.team1.statistics.teamRating}
              </p>
            </div>
            <div>
              <p className="font-semibold">{match.team2.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rating: {match.team2.statistics.teamRating}
              </p>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Match Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="font-semibold">{match.matchType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Format:</span>
              <span className="font-semibold">{match.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Overs:</span>
              <span className="font-semibold">{match.overs}</span>
            </div>
            {match.toss && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Toss:</span>
                <span className="font-semibold">
                  Won by {match.toss.wonBy === match.team1._id ? match.team1.name : match.team2.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Updates */}
      {match.liveUpdates && match.liveUpdates.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Live Commentary</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {match.liveUpdates.slice().reverse().map((update, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    Over {update.over}.{update.ball}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{update.description}</p>
                {update.runs > 0 && (
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-bold">
                    {update.runs} run{update.runs > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;

