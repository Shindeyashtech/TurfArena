// src/pages/Dashboard.js - ADMIN & TURF OWNER ANALYTICS
import React, { useState, useEffect } from 'react';
import {
  BarChart, Users, DollarSign, Calendar,
  TrendingUp, MapPin, Activity, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalytics, getTurfOwnerAnalytics } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []); // Empty dependency array - fetch only once on mount

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (user?.role === 'admin') {
        res = await getDashboardAnalytics();
      } else if (user?.role === 'turf_owner') {
        res = await getTurfOwnerAnalytics();
      } else {
        setError('Unauthorized access');
        return;
      }
      setAnalytics(res.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics');
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

  const statsCards = user.role === 'admin' ? [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'blue' },
    { label: 'Total Turfs', value: analytics?.totalTurfs || 0, icon: MapPin, color: 'green' },
    { label: 'Total Turf Owners', value: analytics?.totalTurfOwners || 0, icon: Building, color: 'yellow' },
    { label: 'Total Revenue', value: `₹${analytics?.totalRevenue || 0}`, icon: DollarSign, color: 'purple' }
  ] : [
    { label: 'Total Turfs', value: analytics?.totalTurfs || 0, icon: MapPin, color: 'blue' },
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: Calendar, color: 'green' },
    { label: 'Total Revenue', value: `₹${analytics?.totalRevenue || 0}`, icon: DollarSign, color: 'purple' },
    { label: 'Active Slots', value: analytics?.activeSlots || 0, icon: Activity, color: 'orange' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user.role === 'admin' ? 'Platform Analytics' : 'Your Business Analytics'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`text-${stat.color}-500`} size={32} />
              <span className={`text-3xl font-bold text-${stat.color}-500`}>{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="mr-2 text-green-500" />
            Recent Bookings
          </h2>
          <div className="space-y-3">
            {analytics?.recentBookings?.slice(0, 5).map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold">{booking.user?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {booking.turf?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">₹{booking.totalAmount}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Turfs / Turf Owners */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" />
            {user.role === 'admin' ? 'Top Turf Owners' : 'Top Performing Turfs'}
          </h2>
          <div className="space-y-3">
            {user.role === 'admin' ? (
              analytics?.topTurfOwners?.slice(0, 5).map((owner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{owner.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {owner.turfCount} turfs, {owner.totalBookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">₹{owner.totalRevenue}</p>
                  </div>
                </div>
              ))
            ) : (
              analytics?.topTurfs?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.bookingCount} bookings
                      </p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{ width: `${Math.min((item.bookingCount / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BarChart className="mr-2 text-purple-500" />
          Revenue Overview
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Revenue chart would be displayed here using a charting library (Chart.js, Recharts, etc.)
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

