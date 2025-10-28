// src/pages/TeamsList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, MapPin, Trophy, Search, Plus } from 'lucide-react';
import { getTeams } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    lookingForPlayers: false
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, [filters]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams(filters);
      setTeams(res.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        {user && (
          <button
            onClick={() => navigate('/teams/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus size={20} />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Search size={16} className="inline mr-1" />
              City
            </label>
            <input
              type="text"
              placeholder="Search by city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lookingForPlayers}
                onChange={(e) => setFilters({ ...filters, lookingForPlayers: e.target.checked })}
                className="w-4 h-4 text-green-500 rounded"
              />
              <span>Looking for players</span>
            </label>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link
            key={team._id}
            to={`/teams/${team._id}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {team.name.charAt(0)}
              </div>
              {team.lookingForPlayers && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                  Recruiting
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2">{team.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users size={16} />
                <span>{team.members.length}/{team.maxMembers} Members</span>
              </div>
              
              {team.location?.city && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>{team.location.city}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm">
                <Trophy className="text-yellow-500" size={16} />
                <span className="font-semibold">Rating: {team.statistics.teamRating}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{team.statistics.matchesPlayed} Matches</span>
              <span>{team.statistics.matchesWon} Wins</span>
            </div>
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No teams found</p>
        </div>
      )}
    </div>
  );
};

export default TeamsList;