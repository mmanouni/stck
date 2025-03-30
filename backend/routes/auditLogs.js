const express = require('express');
const AuditLog = require('../models/AuditLog');
const router = express.Router();
const { authenticateUser, authorize } = require('../middleware/auth'); // Corrected import path
const csv = require('fast-csv'); // Add missing import

// Get audit logs with pagination and filtering
router.get('/', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, action } = req.query;
    const query = action ? { action: { $regex: action, $options: 'i' } } : {};
    const logs = await AuditLog.find(query)
      .populate('userId', 'username')
      .select('userId action timestamp') // Project only necessary fields
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });
    const total = await AuditLog.countDocuments(query);
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error fetching audit logs:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time audit logs
router.get('/real-time', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .limit(10); // Fetch the latest 10 logs
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export audit logs as CSV with pagination
router.get('/export', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const logs = await AuditLog.find()
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit)) // Parse `limit` as an integer
      .limit(parseInt(limit));
    const csvStream = csv.format({ headers: true });
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.setHeader('Content-Type', 'text/csv');
    csvStream.pipe(res);
    logs.forEach((log) => csvStream.write(log.toObject()));
    csvStream.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analytics for user activity logs
router.get('/analytics', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const analytics = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Ensure the router is exported
