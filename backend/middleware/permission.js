const User = require('../models/User');

const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    const userPermissions = user.role.permissions || [];
    if (!user || !userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkPermission;
