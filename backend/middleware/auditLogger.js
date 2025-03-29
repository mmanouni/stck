const AuditLog = require('../models/AuditLog');

const auditLogger = (action) => async (req, res, next) => {
  try {
    const log = new AuditLog({
      userId: req.user.id,
      action,
      details: JSON.stringify(req.body),
    });
    await log.save();
    next();
  } catch (err) {
    console.error('Failed to log audit:', err);
    next();
  }
};

module.exports = auditLogger;
