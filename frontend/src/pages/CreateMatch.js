// ============================================
// src/pages/CreateMatch.js
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, MapPin } from 'lucide-react';
import { createMatch, getTeams, getTurfs } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CreateMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    turf: '',
    matchDate: '',
    startTime: '',
    endTime: '',
    matchType: 'lose-to-pay',
    format: 'T20',
    overs: 20,
    matchFee: 5000
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, turfsRes] = await Promise.all([
        getTeams(),
        getTurfs()
      ]);
      setTeams(teamsRes.data.teams);
      setTurfs(turfsRes.data.turfs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.matchType === 'lose-to-pay' && !formData.matchFee) {
      alert('Please enter match fee for Lose-to-Pay mode');
      return;
    }

    setLoading(true);
    try {
      await createMatch(formData);
      alert('Match created successfully!');
      navigate('/matches');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Trophy className="mr-3 text-green-500" />
        Create Match
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Match Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Match Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'friendly', label: 'Friendly', icon: '🤝', description: 'Just for fun' },
              { value: 'lose-to-pay', label: 'Lose-to-Pay', icon: '💰', description: 'Winner takes all' },
              { value: 'tournament', label: 'Tournament', icon: '🏆', description: 'Competitive' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, matchType: type.value })}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  formData.matchType === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="font-semibold">{type.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
              </button>
            ))}
          </div>

          {formData.matchType === 'lose-to-pay' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">Lose-to-Pay Mode</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The losing team will pay the match fee.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                  Match Fee (₹)
                </label>
                <input
                  type="number"
                  required={formData.matchType === 'lose-to-pay'}
                  value={formData.matchFee}
                  onChange={(e) => setFormData({ ...formData, matchFee: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Teams Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Select Teams</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Team *</label>
              <select
                required
                value={formData.team1}
                onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              >
                <option value="">Select team</option>
                {teams.filter(t => t.captain?._id === user?._id).map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opponent Team *</label>
              <select
                required
                value={formData.team2}
                onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              >
                <option value="">Select opponent</option>
                {teams.filter(t => t._id !== formData.team1).map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Match Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <MapPin size={16} className="mr-1" />
                Select Turf *
              </label>
              <select
                required
                value={formData.turf}
                onChange={(e) => setFormData({ ...formData, turf: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              >
                <option value="">Select turf</option>
                {turfs.map((turf) => (
                  <option key={turf._id} value={turf._id}>
                    {turf.name} - ₹{turf.pricing?.basePrice}/hr ({turf.location?.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Match Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time *</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format *</label>
                <select
                  required
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="T20">T20 (20 overs)</option>
                  <option value="T10">T10 (10 overs)</option>
                  <option value="One Day">One Day (50 overs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Overs *</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="50"
                  value={formData.overs}
                  onChange={(e) => setFormData({ ...formData, overs: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating Match...' : 'Create Match'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMatch;

