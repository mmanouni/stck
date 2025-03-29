const nodemailer = require('nodemailer');
const validator = require('validator');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS must be set in the environment variables.');
}

const sendLicenseNotification = async (email, action, licenseKey) => {
  try {
    // Disable email notifications
    console.warn(`Email notifications are disabled. Skipping notification for ${email}.`);
    return;
  } catch (err) {
    console.error(`Failed to send license notification to ${email}:`, err);
  }
};

module.exports = sendLicenseNotification;
