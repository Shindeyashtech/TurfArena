// src/utils/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 10000; // 10 second timeout

// Add response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    return Promise.reject(error);
  }
);

// Turfs
export const getTurfs = (params) => axios.get('/api/turfs', { params });
export const getTurf = (id) => axios.get(`/api/turfs/${id}`);
export const createTurf = (data) => axios.post('/api/turfs', data);
export const updateTurf = (id, data) => axios.put(`/api/turfs/${id}`, data);
export const updateTurfSlot = (id, data) => axios.put(`/api/turfs/${id}/slots`, data);
export const deleteTurf = (id) => axios.delete(`/api/turfs/${id}`);
export const addTurfReview = (id, data) => axios.post(`/api/turfs/${id}/reviews`, data);

// Bookings
export const createBooking = (data) => axios.post('/api/bookings', data);
export const getMyBookings = () => axios.get('/api/bookings/my');
export const getTurfBookings = (turfId) => axios.get(`/api/bookings/turf/${turfId}`);
export const cancelBooking = (id) => axios.put(`/api/bookings/${id}/cancel`);
export const confirmPayment = (id) => axios.put(`/api/bookings/${id}/confirm-payment`);

// Teams
export const createTeam = (data) => axios.post('/api/teams', data);
export const getTeams = (params) => axios.get('/api/teams', { params });
export const getTeam = (id) => axios.get(`/api/teams/${id}`);
export const updateTeam = (id, data) => axios.put(`/api/teams/${id}`, data);
export const deleteTeam = (id) => axios.delete(`/api/teams/${id}`);
export const joinTeam = (id) => axios.post(`/api/teams/${id}/join`);
export const removeTeamMember = (teamId, userId) =>
  axios.delete(`/api/teams/${teamId}/members/${userId}`);

// Matches
export const createMatch = (data) => axios.post('/api/matches', data);
export const getMatches = (params) => axios.get('/api/matches', { params });
export const updateMatchScore = (id, data) => axios.put(`/api/matches/${id}/score`, data);
export const completeMatch = (id, data) => axios.put(`/api/matches/${id}/complete`, data);

// Payments
export const createPaymentOrder = (data) => axios.post('/api/payments/create-order', data);
export const verifyPayment = (data) => axios.post('/api/payments/verify', data);
export const getMyPayments = () => axios.get('/api/payments/my');

// Chat
export const createOrGetChat = (data) => axios.post('/api/chat', data);
export const getMyChats = () => axios.get('/api/chat/my');
export const sendMessage = (chatId, data) => axios.post(`/api/chat/${chatId}/message`, data);
export const getChatMessages = (chatId, params) => 
  axios.get(`/api/chat/${chatId}/messages`, { params });

// Notifications
export const getNotifications = (params) => axios.get('/api/notifications', { params });
export const markNotificationRead = (id) => axios.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => axios.put('/api/notifications/mark-all-read');

// Analytics
export const getLeaderboard = (params) => axios.get('/api/analytics/leaderboard', { params });
export const getDashboardAnalytics = () => axios.get('/api/analytics/dashboard');
export const getTurfOwnerAnalytics = () => axios.get('/api/analytics/turf-owner');

// Matchmaking & Recommendations
export const findTeamMatches = (teamId, params) => 
  axios.get(`/api/matchmaking/teams/${teamId}`, { params });
export const findPlayersForTeam = (teamId, params) => 
  axios.get(`/api/matchmaking/players/${teamId}`, { params });
export const getTimeSlotRecommendations = (params) => 
  axios.get('/api/recommendations/timeslots', { params });
export const getNearbyMatchRecommendations = (params) => 
  axios.get('/api/recommendations/matches', { params });
