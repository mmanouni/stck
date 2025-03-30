const express = require('express');
const Role = require('../models/Role');
const { authenticate, authorize } = require('../routes/auth'); // Corrected import path
const router = express.Router();

// Create a new role (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    const role = new Role({ name, description, permissions });
    await role.save();
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all roles
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a role (admin only)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (permissions && !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true }
    );
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role updated successfully', role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a role (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add permissions to a role
router.put('/:id/permissions', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    const role = await Role.findByIdAndUpdate(req.params.id, { permissions }, { new: true });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Permissions updated successfully', role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get permissions for a role
router.get('/:id/permissions', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role.permissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize predefined roles (admin only)
router.post('/initialize', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await Role.initializeRoles();
    res.json({ message: 'Predefined roles initialized successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delegate admin role to a manager temporarily
router.put('/delegate-admin', authenticate, authorize(['superadmin']), async (req, res) => {
  try {
    const { userId, expiresAt } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.delegatedRole = 'admin';
    user.delegationExpiresAt = new Date(expiresAt);
    await user.save();

    res.json({ message: 'Admin role delegated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
