import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import NotificationPopup from './components/NotificationPopup';

// Eager load critical pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Lazy load non-critical pages for better performance
const TurfsList = lazy(() => import('./pages/TurfsList'));
const TurfDetails = lazy(() => import('./pages/TurfDetails'));
const TurfBookings = lazy(() => import('./pages/TurfBookings'));
const TeamsList = lazy(() => import('./pages/TeamsList'));
const TeamDetails = lazy(() => import('./pages/TeamDetails'));
const CreateTeam = lazy(() => import('./pages/CreateTeam'));
const CreateTurf = lazy(() => import('./pages/CreateTurf'));
const MatchesList = lazy(() => import('./pages/MatchesList'));
const MatchDetails = lazy(() => import('./pages/MatchDetails'));
const CreateMatch = lazy(() => import('./pages/CreateMatch'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

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
            <NotificationPopup />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/turfs" element={<TurfsList />} />
                <Route path="/turfs/:id" element={<TurfDetails />} />
              <Route
                path="/turf-bookings/:id"
                element={
                  <PrivateRoute requiredRole="turf_owner">
                    <TurfBookings />
                  </PrivateRoute>
                }
              />
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
                path="/turfs/:id/edit"
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
                path="/teams/:id/edit"
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
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookings />
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
              />              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
