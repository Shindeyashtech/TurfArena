// src/pages/CreateTeam.js - CREATE THIS FILE
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { createTeam } from '../utils/api';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minMembers: 6,
    maxMembers: 11,
    lookingForPlayers: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTeam(formData);
      alert('Team created successfully!');
      navigate('/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Users className="mr-3 text-green-500" />
        Create Team
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Team Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="e.g., Mumbai Warriors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Tell others about your team..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Members</label>
            <input
              type="number"
              min="6"
              max="11"
              value={formData.minMembers}
              onChange={(e) => setFormData({ ...formData, minMembers: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Members</label>
            <input
              type="number"
              min="6"
              max="11"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.lookingForPlayers}
            onChange={(e) => setFormData({ ...formData, lookingForPlayers: e.target.checked })}
            className="w-4 h-4 text-green-500 rounded"
          />
          <label className="ml-2">Looking for players</label>
        </div>

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
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            <Plus size={20} />
            <span>{loading ? 'Creating...' : 'Create Team'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
