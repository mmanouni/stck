const UserActivityLog = require('../models/UserActivityLog');
const User = require('../models/User');

const userActivityLogger = (action) => async (req, res, next) => {
  try {
    const log = new UserActivityLog({
      userId: req.user?.id || null,
      action,
      details: JSON.stringify(req.body),
      ipAddress: req.ip,
      role: req.user?.role || 'guest',
      userAgent: req.headers['user-agent'],
    });

    await log.save();
    next();
  } catch (err) {
    console.error('Failed to log user activity:', err);
    next();
  }
};

module.exports = userActivityLogger;
