// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { unread } = req.query;
    
    let query = { user: req.user._id };
    if (unread === 'true') query.isRead = false;
    
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(50);
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
