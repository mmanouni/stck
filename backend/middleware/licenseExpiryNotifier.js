const License = require('../models/License');
const nodemailer = require('nodemailer');

const notifyExpiringLicenses = async () => {
  try {
    // Disable expiry notifications
    console.warn('License expiry notifications are disabled.');
    return;
  } catch (err) {
    console.error('Failed to send expiry notifications:', err);
  }
};

module.exports = notifyExpiringLicenses;
