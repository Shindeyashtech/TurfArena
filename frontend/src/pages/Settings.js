// pages/Settings.js - SETTINGS PAGE
import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState({
    matchInvites: true,
    bookingConfirmations: true,
    teamRequests: true,
    matchUpdates: true,
    payments: true
  });

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
    document.documentElement.classList.toggle('dark', newValue);
  };

  const handleNotificationToggle = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <User className="mr-2" />
          Account Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={user?.role}
              disabled
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 opacity-60 capitalize"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Bell className="mr-2" />
          Notification Preferences
        </h2>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleNotificationToggle(key)}
                className="w-5 h-5 text-green-500 rounded"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Globe className="mr-2" />
          Appearance
        </h2>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-2">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span>Dark Mode</span>
          </div>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeToggle}
            className="w-5 h-5 text-green-500 rounded"
          />
        </label>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Lock className="mr-2" />
          Security
        </h2>
        <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Settings;