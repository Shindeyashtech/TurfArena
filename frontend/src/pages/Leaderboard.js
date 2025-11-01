// ============================================
// src/pages/Leaderboard.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Zap } from 'lucide-react';
import { getLeaderboard } from '../utils/api';

const Leaderboard = () => {
  const [leaderboardType, setLeaderboardType] = useState('rating');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await getLeaderboard({ type: leaderboardType });
      setPlayers(res.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaderboardTypes = [
    { value: 'rating', label: 'Overall Rating', icon: Trophy },
    { value: 'wins', label: 'Most Wins', icon: Award },
    { value: 'runs', label: 'Most Runs', icon: Target },
    { value: 'wickets', label: 'Most Wickets', icon: Zap }
  ];

  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Top performing players on TurfArena</p>
      </div>

      {/* Category Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg shadow p-1">
          {leaderboardTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setLeaderboardType(type.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                leaderboardType === type.value
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <type.icon size={16} />
              <span className="hidden md:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
        {players.slice(0, 3).map((player, index) => {
          const order = [1, 0, 2];
          const actualIndex = order.indexOf(index);
          
          return (
            <div
              key={player._id}
              className={`relative ${actualIndex === 1 ? 'md:-mt-4' : ''}`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform transition hover:-translate-y-2">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-yellow-400 to-yellow-600' :
                    index === 1 ? 'from-gray-300 to-gray-500' :
                    'from-orange-400 to-orange-600'
                  } flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {index + 1}
                  </div>
                </div>

                <div className={`w-24 h-24 mx-auto mb-4 mt-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                  actualIndex === 1 ? 'w-28 h-28' : ''
                }`}>
                  {player.name.charAt(0)}
                </div>

                <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                
                <div className="mb-4">
                  {leaderboardType === 'rating' && (
                    <div className="text-3xl font-bold text-green-500">
                      {player.stats.skillRating}
                    </div>
                  )}
                  {leaderboardType === 'wins' && (
                    <div className="text-3xl font-bold text-green-500">
                      {player.stats.matchesWon} Wins
                    </div>
                  )}
                  {leaderboardType === 'runs' && (
                    <div className="text-3xl font-bold text-green-500">
                      {player.stats.totalRuns} Runs
                    </div>
                  )}
                  {leaderboardType === 'wickets' && (
                    <div className="text-3xl font-bold text-green-500">
                      {player.stats.totalWickets} Wickets
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {player.stats.matchesPlayed} Matches Played
                </div>

                {player.achievements && player.achievements.length > 0 && (
                  <div className="mt-4 flex justify-center space-x-1">
                    {player.achievements.slice(0, 3).map((achievement, i) => (
                      <div
                        key={i}
                        className="text-2xl"
                        title={achievement.name}
                      >
                        {achievement.icon || '🏅'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of the Leaderboard */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-left">Matches</th>
                <th className="px-6 py-3 text-left">
                  {leaderboardType === 'rating' && 'Rating'}
                  {leaderboardType === 'wins' && 'Wins'}
                  {leaderboardType === 'runs' && 'Runs'}
                  {leaderboardType === 'wickets' && 'Wickets'}
                </th>
                <th className="px-6 py-3 text-left">Level</th>
              </tr>
            </thead>
            <tbody>
              {players.slice(3).map((player, index) => {
                const actualIndex = index + 3;
                return (
                  <tr
                    key={player._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">
                      <span className={`font-bold ${getRankColor(actualIndex)}`}>
                        #{actualIndex + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          {player.achievements && player.achievements.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {player.achievements.slice(0, 2).map((achievement, i) => (
                                <span key={i} className="text-xs" title={achievement.name}>
                                  {achievement.icon || '🏅'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{player.stats.matchesPlayed}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-500">
                        {leaderboardType === 'rating' && player.stats.skillRating}
                        {leaderboardType === 'wins' && player.stats.matchesWon}
                        {leaderboardType === 'runs' && player.stats.totalRuns}
                        {leaderboardType === 'wickets' && player.stats.totalWickets}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        Lvl {player.stats.level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;