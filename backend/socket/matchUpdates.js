// socket/matchUpdates.js
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(socket.userId);
    console.log(`User ${socket.userId} joined personal room`);

    // Join match room
    socket.on('joinMatch', (matchId) => {
      socket.join(`match_${matchId}`);
      console.log(`User ${socket.userId} joined match ${matchId}`);
    });

    // Leave match room
    socket.on('leaveMatch', (matchId) => {
      socket.leave(`match_${matchId}`);
      console.log(`User ${socket.userId} left match ${matchId}`);
    });

    // Join chat room
    socket.on('joinChat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    });

    // Match score update (real-time)
    socket.on('updateScore', async (data) => {
      const { matchId, team, runs, wickets, overs } = data;
      
      // Broadcast to all users watching this match
      io.to(`match_${matchId}`).emit('scoreUpdate', {
        matchId,
        team,
        runs,
        wickets,
        overs,
        timestamp: new Date()
      });
    });

    // Live commentary
    socket.on('commentary', (data) => {
      const { matchId, message } = data;
      io.to(`match_${matchId}`).emit('newCommentary', {
        message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
