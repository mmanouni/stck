const express = require('express');
const AuditLog = require('../models/AuditLog');
const router = express.Router();
const { authenticate, authorize } = require('./auth');
const csv = require('fast-csv');
const fs = require('fs');

// Get audit logs with pagination and filtering
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, action } = req.query;
    const query = action ? { action: { $regex: action, $options: 'i' } } : {};
    const logs = await AuditLog.find(query)
      .populate('userId', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });
    const total = await AuditLog.countDocuments(query);
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get real-time audit logs
router.get('/real-time', authenticate, authorize(['admin']), async (req, res) => {
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
router.get('/export', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const logs = await AuditLog.find()
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
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

module.exports = router;
