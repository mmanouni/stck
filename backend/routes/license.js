const express = require('express');
const License = require('../models/License');
const router = express.Router();
const { authenticate, authorize } = require('./auth');
const sendLicenseNotification = require('../middleware/licenseNotifier');
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
    await license.save();

    // Disable email notifications
    console.warn('Email notifications are disabled. Skipping activation email.');

    res.json({ message: 'License activated successfully' });
  } catch (err) {
    console.error(`Error during license activation: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate a license
router.post('/deactivate', authenticate, async (req, res) => {
  try {
    const encryptedKey = sanitize(req.body.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key
    const email = sanitize(req.body.email);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const license = await License.findOne({ key: hashedKey });
    if (!license || !license.isActive) {
      console.error(`Suspicious activity detected: Attempt to deactivate non-existent or inactive license key: ${hashedKey}`);
      return res.status(400).json({ error: 'License is not active or does not exist' });
    }

    license.isActive = false;
    license.activatedAt = null;
    license.expiresAt = null;
    license.usageHistory.push({ action: 'deactivate' });
    await license.save();

    // Disable email notifications
    console.warn('Email notifications are disabled. Skipping deactivation email.');

    res.json({ message: 'License deactivated successfully' });
  } catch (err) {
    console.error(`Error during license deactivation: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notify about license expiry
router.get('/expiry-notification', authenticate, async (req, res) => {
  try {
    const licenses = await License.find({
      isActive: true,
      expiresAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
    });

    res.json({ licenses });
  } catch (err) {
    console.error(`Error fetching expiry notifications: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Renew a license
router.post('/renew', authenticate, async (req, res) => {
  try {
    const encryptedKey = sanitize(req.body.key);
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the key

    const license = await License.findOne({ key: hashedKey });
    if (!license) {
      console.error(`Suspicious activity detected: Attempt to renew non-existent license key: ${hashedKey}`);
      return res.status(404).json({ error: 'License key not found' });
    }

    license.usageHistory.push({ action: 'renew' });
    await license.save();

    res.json({ message: 'License renewed successfully' });
  } catch (err) {
    console.error(`Error during license renewal: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create a new license
router.post('/admin/create', authenticate, authorize(['admin']), async (req, res) => {
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
router.delete('/admin/delete/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await License.findByIdAndDelete(req.params.id);
    res.json({ message: 'License deleted successfully' });
  } catch (err) {
    console.error(`Error during license deletion: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: List all licenses
router.get('/admin/list', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const licenses = await License.find();
    res.json(licenses);
  } catch (err) {
    console.error(`Error fetching license list: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Search licenses
router.get('/admin/search', authenticate, authorize(['admin']), async (req, res) => {
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
router.get('/analytics', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const analytics = await License.aggregate([
      {
        $group: {
          _id: null,
          totalLicenses: { $sum: 1 },
          activeLicenses: { $sum: { $cond: ['$isActive', 1, 0] } },
          expiredLicenses: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } },
        },
      },
    ]);
    res.json(analytics[0] || { totalLicenses: 0, activeLicenses: 0, expiredLicenses: 0 });
  } catch (err) {
    console.error(`Error fetching analytics: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get detailed license data
router.get('/admin/dashboard', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const licenses = await License.find().select('-__v');
    res.json(licenses);
  } catch (err) {
    console.error(`Error fetching dashboard data: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get license usage history
router.get('/admin/usage-history/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const license = await License.findById(req.params.id).select('key usageHistory');
    if (!license) return res.status(404).json({ error: 'License not found' });

    res.json(license);
  } catch (err) {
    console.error(`Error fetching usage history: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
