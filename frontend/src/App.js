import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TurfsList from './pages/TurfsList';
import TurfDetails from './pages/TurfDetails';

import TeamsList from './pages/TeamsList';
import TeamDetails from './pages/TeamDetails';
import CreateTeam from './pages/CreateTeam';
import CreateTurf from './pages/CreateTurf';
import MatchesList from './pages/MatchesList';
import MatchDetails from './pages/MatchDetails';
import CreateMatch from './pages/CreateMatch';
import MyBookings from './pages/MyBookings';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  useEffect(() => {
    // Initialize dark mode from localStorage
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/turfs" element={<TurfsList />} />
              <Route path="/turfs/:id" element={<TurfDetails />} />
              <Route path="/teams" element={<TeamsList />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/matches" element={<MatchesList />} />
              <Route path="/matches/:id" element={<MatchDetails />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Protected Routes */}
              <Route 
                path="/turfs/create" 
                element={
                  <PrivateRoute requiredRole="turf_owner">
                    <CreateTurf />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/teams/create" 
                element={
                  <PrivateRoute>
                    <CreateTeam />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/matches/create" 
                element={
                  <PrivateRoute>
                    <CreateMatch />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } 
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
