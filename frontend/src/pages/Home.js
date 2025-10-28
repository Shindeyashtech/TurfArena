// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, MapPin, Users, TrendingUp, 
  Calendar, Star, Shield, Zap 
} from 'lucide-react';
import { getTurfs, getMatches, getLeaderboard } from '../utils/api';

const Home = () => {
  const [featuredTurfs, setFeaturedTurfs] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []); // Empty dependency array - run only once

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with error handling for each request
      const results = await Promise.allSettled([
        getTurfs({ sort: 'rating', limit: 3 }),
        getMatches({ status: 'scheduled', limit: 3 }),
        getLeaderboard({ type: 'rating', limit: 5 })
      ]);

      if (results[0].status === 'fulfilled') {
        setFeaturedTurfs(results[0].value.data.turfs || []);
      }
      if (results[1].status === 'fulfilled') {
        setUpcomingMatches(results[1].value.data.matches || []);
      }
      if (results[2].status === 'fulfilled') {
        setTopPlayers(results[2].value.data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book your favorite turf in just a few clicks'
    },
    {
      icon: Users,
      title: 'Create Teams',
      description: 'Form teams and challenge opponents'
    },
    {
      icon: Shield,
      title: 'Lose-to-Pay',
      description: 'Competitive matches with real stakes'
    },
    {
      icon: Zap,
      title: 'AI Matchmaking',
      description: 'Smart team matching based on skill level'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Trophy className="mx-auto mb-6" size={64} />
          <h1 className="text-5xl font-bold mb-4">
            Welcome to TurfArena
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Book turfs, create teams, and compete in exciting cricket matches
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/turfs"
              className="px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Browse Turfs
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-green-600 transition font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose TurfArena?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <feature.icon className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Turfs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Turfs</h2>
            <Link
              to="/turfs"
              className="text-green-500 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTurfs.map((turf) => (
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
                    <span>{turf.location.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span className="font-semibold">{turf.ratings.average.toFixed(1)}</span>
                    </div>
                    <span className="text-lg font-bold text-green-500">
                      ₹{turf.pricing.basePrice}/hr
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Matches</h2>
            <Link
              to="/matches"
              className="text-green-500 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <Link
                key={match._id}
                to={`/matches/${match._id}`}
                className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <p className="font-bold text-lg">{match.team1?.name}</p>
                  </div>
                  <div className="px-6">
                    <div className="text-2xl font-bold text-green-500">VS</div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-bold text-lg">{match.team2?.name}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                    {match.matchType}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top Players</h2>
            <Link
              to="/leaderboard"
              className="text-green-500 hover:underline"
            >
              View Leaderboard →
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Player</th>
                  <th className="px-6 py-3 text-left">Matches</th>
                  <th className="px-6 py-3 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, index) => (
                  <tr
                    key={player._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <span className={`font-bold ${index < 3 ? 'text-yellow-500' : ''}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{player.stats.matchesPlayed}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-500">
                        {player.stats.skillRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of cricket enthusiasts on TurfArena
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
