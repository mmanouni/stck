const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const Category = require('../models/Category');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const userActivityLogger = require('../middleware/userActivityLogger');
const checkPermission = require('../middleware/permission');
const { authenticateUser } = require('../middleware/auth');
const sanitize = require('mongo-sanitize'); // Ensure this is imported
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // Use environment variable
const upload = multer({ dest: 'uploads/profile-pictures/' });

// Middleware to verify JWT for admin users
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for role-based access
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Rate limiting for login and registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login or registration attempts, please try again later.',
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
});
const failedLoginAttempts = new Map(); // Track failed login attempts

// Register a new user
router.post(
  '/register',
  authLimiter,
  [
    body('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('password')
      .isStrongPassword()
      .withMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const username = sanitize(req.body.username); // Sanitize input
      const password = sanitize(req.body.password); // Sanitize input
      const { role } = req.body;
      const newUser = new User({ username, password, role });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Enhanced login logging
router.post('/login', async (req, res) => {
  try {
    const username = sanitize(req.body.username); // Sanitize input
    const password = sanitize(req.body.password); // Sanitize input
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout a user
router.post('/logout', authenticateUser, userActivityLogger('Logout'), (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Failed to log out' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Fetch current user's profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile with activity logging
router.put('/profile', authenticateUser, userActivityLogger('Update Profile'), async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findById(req.user.id);
    if (username) user.username = username;
    if (password) user.password = password;
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateUser, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profilePicture = req.file.path;
    await user.save();
    res.json({ message: 'Profile picture updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate user account with reason
router.put('/profile/deactivate', authenticateUser, userActivityLogger('Deactivate Account'), async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deactivateAccount(reason);
    res.json({ message: 'Account deactivated successfully', reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request password reset
router.post('/password-reset', async (req, res) => {
  try {
    // Disable password reset emails
    console.warn('Password reset emails are disabled.');
    return res.status(503).json({ error: 'Password reset functionality is temporarily unavailable.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password
router.post('/password-reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const password = req.body.password; // Add sanitization
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token' });

    const user = await User.findById(resetToken.userId);
    user.password = password;
    await user.save();
    await resetToken.deleteOne();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh JWT token
router.post('/refresh-token', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users with filtering and sorting (admin only)
router.get('/users', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'username', isActive, role } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (role) query.role = role;

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch a specific user's details (admin only)
router.get('/users/:id', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deactivate a user account (admin only)
router.put('/users/:id/deactivate', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User account deactivated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reactivate a user account (admin only)
router.put('/users/:id/reactivate', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User account reactivated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user account (admin only)
router.delete('/users/:id', authenticateAdmin, authorize(['admin']), userActivityLogger('Delete User'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset MFA for a user (admin only)
router.post('/users/:id/reset-mfa', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.disableMFA();
    res.json({ message: 'MFA reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or manager: Delegate role to a user
router.put('/users/:id/delegate-role', authenticateAdmin, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { role, expiresAt } = req.body;
    if (role === 'admin') return res.status(403).json({ error: 'Cannot delegate admin role' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.delegateRole(role, new Date(expiresAt));
    res.json({ message: 'Role delegated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or manager: Suspend a user account
router.put('/users/:id/suspend', authenticateAdmin, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot suspend admin account' });

    await user.suspendAccount();
    res.json({ message: 'User account suspended successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or manager: Unsuspend a user account
router.put('/users/:id/unsuspend', authenticateAdmin, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.unsuspendAccount();
    res.json({ message: 'User account unsuspended successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user roles (admin only)
router.get('/roles', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const roles = ['admin', 'user'];
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category (admin only)
router.post('/categories', authenticateAdmin, checkPermission('create_category'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all categories
router.get('/categories', authenticateUser, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign a user to a category (admin only)
router.put('/users/:id/category', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { categoryId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.assignCategory(categoryId);
    res.json({ message: 'User assigned to category successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add permissions to a category
router.put('/categories/:id/permissions', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { permissions } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { permissions }, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Permissions updated successfully', category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Assign category permissions to a user
router.put('/users/:id/category-permissions', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { categoryIds } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { categoryPermissions: categoryIds }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Category permissions assigned successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Remove category permissions from a user
router.put('/users/:id/remove-category-permissions', authenticateAdmin, authorize(['admin']), async (req, res) => {
  try {
    const { categoryIds } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.categoryPermissions = user.categoryPermissions.filter(
      (categoryId) => !categoryIds.includes(categoryId.toString())
    );
    await user.save();
    res.json({ message: 'Category permissions removed successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
