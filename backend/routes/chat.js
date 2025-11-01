const mongoose = require('mongoose'); // ← This line is mandatory

// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @route   POST /api/chat
// @desc    Create or get chat
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { participantId, chatType, teamId, matchId } = req.body;
    
    let query = {
      participants: { $all: [req.user._id, participantId] },
      chatType: chatType || 'direct'
    };
    
    if (teamId) query.team = teamId;
    if (matchId) query.match = matchId;
    
    let chat = await Chat.findOne(query)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');
    
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        chatType: chatType || 'direct',
        team: teamId,
        match: matchId
      });
      
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name avatar');
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/chat/my
// @desc    Get user chats
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('lastMessage.sender', 'name')
      .sort('-updatedAt');
    
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/chat/:id/message
// @desc    Send message
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { content, messageType, attachments } = req.body;
    
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const message = {
      sender: req.user._id,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      isRead: [req.user._id]
    };
    
    chat.messages.push(message);
    chat.lastMessage = {
      content,
      sender: req.user._id,
      createdAt: new Date()
    };
    chat.updatedAt = new Date();
    
    await chat.save();
    
    // Emit socket event for real-time chat
    const io = req.app.get('io');
    io.to(`chat_${chat._id}`).emit('newMessage', {
      chatId: chat._id,
      message
    });
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/chat/:id/messages
// @desc    Get chat messages
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const chat = await Chat.findById(req.params.id)
      .populate('messages.sender', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const messages = chat.messages
      .slice(-limit * page)
      .reverse();
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
