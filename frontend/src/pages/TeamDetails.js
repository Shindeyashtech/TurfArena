// src/pages/TeamDetails.js - CREATE THIS FILE
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Trophy, MapPin } from 'lucide-react';
import { getTeam, joinTeam } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TeamDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamDetails = useCallback(async () => {
    try {
      const res = await getTeam(id);
      setTeam(res.data.team);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  const handleJoinTeam = async () => {
    try {
      await joinTeam(id);
      alert('Successfully joined team!');
      fetchTeamDetails();
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!team) {
    return <div className="container mx-auto px-4 py-8">Team not found</div>;
  }

  const isMember = team.members.some(m => m.user && m.user._id === user?._id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">{team.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{team.description}</p>
            {team.location?.city && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin size={16} />
                <span>{team.location.city}</span>
              </div>
            )}
          </div>
          {!isMember && user && team.lookingForPlayers && (
            <button
              onClick={handleJoinTeam}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90"
            >
              Join Team
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" />
            Members ({team.members.length}/{team.maxMembers})
          </h2>
          <div className="space-y-3">
            {team.members.map((member) => (
              <div key={member.user?._id || member._id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {member.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold">{member.user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2" />
            Statistics
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Matches Played:</span>
              <span className="font-bold">{team.statistics.matchesPlayed}</span>
            </div>
            <div className="flex justify-between">
              <span>Matches Won:</span>
              <span className="font-bold text-green-500">{team.statistics.matchesWon}</span>
            </div>
            <div className="flex justify-between">
              <span>Team Rating:</span>
              <span className="font-bold text-blue-500">{team.statistics.teamRating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
