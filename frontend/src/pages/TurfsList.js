// src/pages/TurfsList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Search, Filter, Plus } from 'lucide-react';
import { getTurfs } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TurfsList = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    sort: 'rating'
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const fetchTurfs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTurfs(debouncedFilters);
      console.log('API Response:', res.data);
      setTurfs(Array.isArray(res.data) ? res.data : (res.data && res.data.turfs ? res.data.turfs : []));
    } catch (error) {
      console.error('Error fetching turfs:', error);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  // Debounce filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch turfs when debounced filters change
  useEffect(() => {
    fetchTurfs();
  }, [fetchTurfs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Browse Turfs</h1>
          {user && user.role === 'turf_owner' && (
            <Link
              to="/turfs/create"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus size={16} className="mr-2" />
              Add Turf
            </Link>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input
                type="number"
                placeholder="₹ 0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input
                type="number"
                placeholder="₹ 10000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Filter size={16} className="inline mr-1" />
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              >
                <option value="rating">Rating</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Turfs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map((turf) => (
          <Link
            key={turf._id}
            to={`/turfs/${turf._id}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-6xl">
              🏟️
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{turf.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <MapPin size={16} />
                <span>{turf.location.city}, {turf.location.state}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-500 fill-current" size={16} />
                  <span className="font-semibold">{turf.ratings.average.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({turf.ratings.count})</span>
                </div>
                <span className="text-lg font-bold text-green-500">
                  ₹{turf.pricing.basePrice}/hr
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{turf.specifications.pitchType}</span>
                <Clock size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {turfs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No turfs found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default TurfsList;
