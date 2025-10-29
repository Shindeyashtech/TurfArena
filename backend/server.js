const mongoose = require('mongoose');
require('dotenv').config();
console.log("Connecting to MongoDB:", process.env.MONGO_URI);

// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const socketIO = require('socket.io');
const http = require('http');
const mongoURI = "mongodb+srv://yash_db_turf:yash_db_turf@turf.ouovq4d.mongodb.net/turfarena?retryWrites=true&w=majority&appName=turf";

// Log environment variables to confirm
console.log("Connecting to MongoDB:", process.env.MONGO_URI);



const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  // Fix geo indexes on startup
  try {
    const db = mongoose.connection.db;
    
    // Update users with missing coordinates
    await db.collection('users').updateMany(
      { 'location.coordinates.coordinates': { $exists: false } },
      { $set: { 'location.coordinates.coordinates': [0, 0] } }
    );
    
    console.log('Fixed user coordinates');
  } catch (error) {
    console.log('Coordinates already fixed or error:', error.message);
  }
})
.catch(err => console.error('MongoDB connection error:', err));


// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/api/matchmaking', require('./routes/matchmaking'));

// Passport Config
require('./config/passport')(passport);

// Socket.io setup
require('./socket/matchUpdates')(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/turfs', require('./routes/turfs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

// Error Handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
