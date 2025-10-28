const mongoose = require('mongoose'); // ← This line is mandatory
// models/Chat.js
const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chatType: { 
    type: String, 
    enum: ['direct', 'team', 'match'], 
    default: 'direct' 
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    attachments: [String],
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);