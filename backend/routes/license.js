const express = require('express');
const License = require('../models/License');
const router = express.Router();
const { authenticateUser, authorize } = require('../routes/auth'); // Corrected import path
const sanitize = require('mongo-sanitize');
const validator = require('validator');
const crypto = require('crypto');
const getHardwareId = require('../utils/hardwareId');

// Encrypt the license key
const encryptLicenseKey = (licenseKey) => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.LICENSE_ENCRYPTION_KEY, 'hex'),
    Buffer.from(process.env.LICENSE_ENCRYPTION_IV, 'hex')
  );
  let encrypted = cipher.update(licenseKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Decrypt the license key
const decryptLicenseKey = (encryptedKey) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.LICENSE_ENCRYPTION_KEY, 'hex'),
    Buffer.from(process.env.LICENSE_ENCRYPTION_IV, 'hex')
  );
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Activate a license
router.post('/activate', async (req, res) => {
  try {
    const encryptedKey = sanitize(req.body.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key
    const email = sanitize(req.body.email);
    const hardwareId = sanitize(req.body.hardwareId);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const license = await License.findOne({ key: hashedKey });
    if (!license) return res.status(404).json({ error: 'License key not found' });
    if (license.isActive) return res.status(400).json({ error: 'License already activated' });

    license.isActive = true;
    license.activatedAt = new Date();
    license.bindToHardware(hardwareId); // Bind to hardware ID
    license.usageHistory.push({ action: 'activate' });
    license.logUsageAction('activate'); // Log usage action
    await license.save();

    res.json({ message: 'License activated successfully' });
  } catch (err) {
    console.error(`Error during license activation: ${err.message}`);
    res.status(500).json({ error: 'Failed to activate license. Please contact support.' });
  }
});

// Deactivate a license
router.post('/deactivate', authenticateUser, async (req, res) => {
  try {
    const encryptedKey = sanitize(req.body.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key

    const license = await License.findOne({ key: hashedKey });
    if (!license || !license.isActive) {
      return res.status(400).json({ error: 'License is not active or does not exist' });
    }

    license.isActive = false;
    license.activatedAt = null;
    license.usageHistory.push({ action: 'deactivate' });
    await license.save();

    res.json({ message: 'License deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove the /expiry-notification route:
router.get('/expiry-notification', authenticateUser, async (req, res) => {
  return res.status(400).json({ error: 'License expiry notifications are not applicable.' });
});

// Validate a license
router.get('/validate', async (req, res) => {
  try {
    const encryptedKey = sanitize(req.query.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key
    const hardwareId = sanitize(req.query.hardwareId);

    const license = await License.findOne({ key: hashedKey });
    if (!license || !license.isActive || !license.validateHardware(hardwareId)) {
      console.error(`Invalid license or hardware mismatch for key: ${hashedKey}`);
      return res.status(400).json({ valid: false });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error(`Error during license validation: ${err.message}`);
    res.status(500).json({ error: 'Failed to validate license. Please try again later.' });
  }
});

// Renew a license
router.post('/renew', authenticateUser, async (req, res) => {
  try {
    const encryptedKey = sanitize(req.body.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key

    const license = await License.findOne({ key: hashedKey });
    if (!license) {
      return res.status(404).json({ error: 'License key not found' });
    }

    license.usageHistory.push({ action: 'renew' });
    await license.save();

    res.json({ message: 'License renewed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create a new license
router.post('/admin/create', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const licenseKey = sanitize(req.body.key);
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key

    const newLicense = new License({ key: hashedKey });
    await newLicense.save();

    res.status(201).json({ message: 'License created successfully', license: newLicense });
  } catch (err) {
    console.error(`Error during license creation: ${err.message}`);
    res.status(400).json({ error: 'Internal server error' });
  }
});

// Admin: Delete a license
router.delete('/admin/delete/:id', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    await License.findByIdAndDelete(req.params.id);
    res.json({ message: 'License deleted successfully' });
  } catch (err) {
    console.error(`Error during license deletion: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: List all licenses
router.get('/admin/list', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const licenses = await License.find().select('key isActive usageCount maxUsage'); // Project necessary fields
    res.json(licenses);
  } catch (err) {
    console.error(`Error fetching license list: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Search licenses
router.get('/admin/search', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const key = sanitize(req.query.key);
    const status = sanitize(req.query.status);

    const query = {};
    if (key) query.key = { $regex: key, $options: 'i' };
    if (status) query.isActive = status === 'active';

    const licenses = await License.find(query);
    res.json(licenses);
  } catch (err) {
    console.error(`Error during license search: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get license usage analytics
router.get('/analytics', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const analytics = await License.aggregate([
      {
        $group: {
          _id: null,
          totalLicenses: { $sum: 1 },
          activeLicenses: { $sum: { $cond: ['$isActive', 1, 0] } },
        },
      },
    ]);
    res.json(analytics[0] || { totalLicenses: 0, activeLicenses: 0 });
  } catch (err) {
    console.error(`Error fetching analytics: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed license usage analytics
router.get('/usage-analytics', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const analytics = await License.aggregate([
      {
        $group: {
          _id: null,
          totalLicenses: { $sum: 1 },
          activeLicenses: { $sum: { $cond: ['$isActive', 1, 0] } },
          maxUsageExceeded: { $sum: { $cond: [{ $gte: ['$usageCount', '$maxUsage'] }, 1, 0] } },
        },
      },
    ]);
    res.json(analytics[0] || { totalLicenses: 0, activeLicenses: 0, maxUsageExceeded: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get detailed license data
router.get('/admin/dashboard', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const licenses = await License.find().select('-__v');
    res.json(licenses);
  } catch (err) {
    console.error(`Error fetching dashboard data: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get license usage history
router.get('/admin/usage-history/:id', authenticateUser, authorize(['admin']), async (req, res) => {
  try {
    const license = await License.findById(req.params.id).select('key usageHistory');
    if (!license) return res.status(404).json({ error: 'License not found' });

    res.json(license);
  } catch (err) {
    console.error(`Error fetching usage history: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; // Ensure the router is exported
