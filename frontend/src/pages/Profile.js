// src/pages/Profile.js - PLAYER STATS AND ACHIEVEMENTS
import React, { useState, useEffect } from 'react';
import { User, Trophy, Target, Zap, Award, Edit, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location?.city || '',
    preferences: {
      playingPosition: user?.preferences?.playingPosition || [],
      preferredFormats: user?.preferences?.preferredFormats || []
    }
  });

  const achievements = user?.achievements || [
    { name: 'First Match', description: 'Played your first match', icon: '🎯', earnedAt: new Date() },
    { name: 'Century', description: 'Scored 100 runs in a match', icon: '💯', earnedAt: new Date() },
    { name: 'Hat-trick', description: 'Took 3 wickets in 3 balls', icon: '🎩', earnedAt: new Date() }
  ];

  const stats = [
    { label: 'Matches Played', value: user?.stats?.matchesPlayed || 0, icon: Trophy, color: 'text-blue-500' },
    { label: 'Matches Won', value: user?.stats?.matchesWon || 0, icon: Award, color: 'text-green-500' },
    { label: 'Total Runs', value: user?.stats?.totalRuns || 0, icon: Target, color: 'text-yellow-500' },
    { label: 'Total Wickets', value: user?.stats?.totalWickets || 0, icon: Zap, color: 'text-purple-500' },
    { label: 'Skill Rating', value: user?.stats?.skillRating || 1000, icon: TrendingUp, color: 'text-red-500' },
    { label: 'Level', value: user?.stats?.level || 1, icon: Trophy, color: 'text-orange-500' }
  ];

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/auth/profile', profileData);
      alert('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="text-3xl font-bold mb-2 px-2 py-1 border dark:border-gray-600 rounded dark:bg-gray-700"
                />
              ) : (
                <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
              )}
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="mt-1 px-2 py-1 border dark:border-gray-600 rounded dark:bg-gray-700"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{user?.phone}</p>
              )}
              <div className="flex items-center space-x-4 mt-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                  Level {user?.stats?.level || 1}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                  {user?.role === 'player' ? 'Player' : user?.role === 'turf_owner' ? 'Turf Owner' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Edit size={16} />
            <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center hover:shadow-lg transition">
            <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={32} />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Award className="mr-2 text-yellow-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:border-green-500 transition">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="font-bold mb-1">{achievement.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {new Date(achievement.earnedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-green-500" />
          Performance Trend
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Performance graph would be displayed here using a charting library
        </div>
      </div>
    </div>
  );
};

export default Profile;
