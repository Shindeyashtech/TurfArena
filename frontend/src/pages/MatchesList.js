import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Shield, Plus, Filter } from 'lucide-react';
import { getMatches } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MatchesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    matchType: '',
    view: 'all' // all, upcoming, live, completed
  });

  useEffect(() => {
    fetchMatches();
  }, [filters]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      if (filters.view === 'upcoming') {
        params.upcoming = 'true';
        delete params.status;
      } else if (filters.view === 'live') {
        params.live = 'true';
        delete params.status;
      } else if (filters.view === 'completed') {
        params.status = 'completed';
      }
      
      delete params.view;
      
      const res = await getMatches(params);
      setMatches(res.data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white animate-pulse';
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Matches</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and follow cricket matches
          </p>
        </div>
        {user && (
          <button
            onClick={() => navigate('/matches/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus size={20} />
            <span>Create Match</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">View</label>
            <select
              value={filters.view}
              onChange={(e) => setFilters({ ...filters, view: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="all">All Matches</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Match Type</label>
            <select
              value={filters.matchType}
              onChange={(e) => setFilters({ ...filters, matchType: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="">All Types</option>
              <option value="friendly">Friendly</option>
              <option value="lose-to-pay">Lose-to-Pay</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => setFilters({ status: '', matchType: '', view: 'all' })}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Live Matches Highlight */}
      {matches.filter(m => m.status === 'live').length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center text-red-500">
            <span className="animate-pulse mr-2">🔴</span>
            Live Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches
              .filter(m => m.status === 'live')
              .map((match) => (
                <Link
                  key={match._id}
                  to={`/matches/${match._id}`}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-white text-red-500 rounded-full text-sm font-bold animate-pulse">
                      LIVE
                    </span>
                    {match.matchType === 'lose-to-pay' && (
                      <Shield className="text-yellow-300" size={20} />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="text-center">
                      <p className="font-bold text-lg">{match.team1.name}</p>
                      <p className="text-2xl font-bold">
                        {match.scores?.team1?.runs || 0}/{match.scores?.team1?.wickets || 0}
                      </p>
                    </div>
                    <div className="text-center text-xl font-bold">VS</div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{match.team2.name}</p>
                      <p className="text-2xl font-bold">
                        {match.scores?.team2?.runs || 0}/{match.scores?.team2?.wickets || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm opacity-90">
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin size={14} />
                      <span>{match.turf.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* All Matches */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No matches found</p>
          </div>
        ) : (
          matches.map((match) => (
            <Link
              key={match._id}
              to={`/matches/${match._id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(match.status)}`}>
                  {match.status.toUpperCase()}
                </div>
                
                <div className="flex items-center space-x-3">
                  {match.matchType === 'lose-to-pay' && (
                    <div className="flex items-center space-x-1 text-sm text-yellow-600 dark:text-yellow-400">
                      <Shield size={16} />
                      <span>Lose-to-Pay</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">{match.format}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {match.team1.name.charAt(0)}
                  </div>
                  <p className="font-bold">{match.team1.name}</p>
                  {match.status !== 'scheduled' && (
                    <p className="text-lg font-semibold text-green-500">
                      {match.scores?.team1?.runs || 0}/{match.scores?.team1?.wickets || 0}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400 mb-2">VS</div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar size={14} />
                      <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin size={14} />
                      <span>{match.turf.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {match.team2.name.charAt(0)}
                  </div>
                  <p className="font-bold">{match.team2.name}</p>
                  {match.status !== 'scheduled' && (
                    <p className="text-lg font-semibold text-green-500">
                      {match.scores?.team2?.runs || 0}/{match.scores?.team2?.wickets || 0}
                    </p>
                  )}
                </div>
              </div>

              {match.status === 'completed' && match.result && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700 text-center">
                  <Trophy className="inline text-yellow-500 mr-2" size={20} />
                  <span className="font-semibold">
                    {match.result.winner === match.team1._id ? match.team1.name : match.team2.name} won by {match.result.margin}
                  </span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesList;
