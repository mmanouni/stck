const express = require('express');
const UserActivityLog = require('../models/UserActivityLog');
const { authenticate, authorize } = require('../routes/auth'); // Corrected import path
const router = express.Router();

// Get all user activity logs (admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, action, userAgent } = req.query;
    const query = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (userAgent) query.userAgent = { $regex: userAgent, $options: 'i' };

    const logs = await UserActivityLog.find(query)
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await UserActivityLog.countDocuments(query);
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user activity logs filtered by userId (admin only)
router.get('/by-user/:userId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const logs = await UserActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await UserActivityLog.countDocuments({ userId });
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
