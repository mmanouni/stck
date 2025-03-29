const License = require('../models/License');
const nodemailer = require('nodemailer');

const notifyExpiringLicenses = async () => {
  try {
    const expiringLicenses = await License.find({
      isActive: true,
      expiresAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
    });

    if (expiringLicenses.length === 0) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const license of expiringLicenses) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: license.email,
        subject: 'License Expiry Notification',
        text: `Your license with key ${license.key} is expiring soon. Please renew it to avoid interruptions.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.info(`Expiry notification sent to ${license.email} for license key ${license.key}`);
      } catch (err) {
        console.error(`Failed to send notification to ${license.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Failed to send expiry notifications:', err);
  }
};

module.exports = notifyExpiringLicenses;
