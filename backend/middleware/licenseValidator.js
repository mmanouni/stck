const License = require('../models/License');
const sanitize = require('mongo-sanitize');
const crypto = require('crypto');
const failedLicenseAttempts = new Map(); // Track failed attempts

if (!process.env.LICENSE_ENCRYPTION_KEY || !process.env.LICENSE_ENCRYPTION_IV) {
  throw new Error('LICENSE_ENCRYPTION_KEY and LICENSE_ENCRYPTION_IV must be set in the environment variables.');
}

const licenseValidator = async (req, res, next) => {
  try {
    const encryptedKey = sanitize(req.headers.licenseKey); // Sanitize encrypted license key
    const licenseKey = decryptLicenseKey(encryptedKey); // Decrypt the license key
    const hashedKey = crypto.createHash('sha256').update(licenseKey).digest('hex'); // Hash the license key
    const ip = req.ip;
    const hardwareId = sanitize(req.headers.hardwareId); // Retrieve hardware ID from headers

    // Rate limit invalid attempts
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    if (failedLicenseAttempts.has(ip)) {
      const { attempts, lastAttempt } = failedLicenseAttempts.get(ip);
      if (attempts >= maxAttempts && Date.now() - lastAttempt < lockoutTime) {
        console.warn(`IP ${ip} temporarily blocked due to repeated invalid license attempts`);
        return res.status(429).json({ error: 'Too many invalid attempts. Try again later.' });
      }
    }

    const license = await License.findOne({ key: hashedKey });
    if (!license || !license.isActive || !license.validateHardware(hardwareId)) {
      const attempts = failedLicenseAttempts.get(ip)?.attempts || 0;
      failedLicenseAttempts.set(ip, { attempts: attempts + 1, lastAttempt: Date.now() });
      console.warn(`Invalid license or hardware mismatch from IP: ${ip}`);
      return res.status(403).json({ error: 'Invalid license or hardware mismatch' });
    }

    // Reset failed attempts on success
    failedLicenseAttempts.delete(ip);

    // Enforce usage limit
    if (license.usageCount >= license.maxUsage) {
      return res.status(403).json({ error: 'License usage limit reached' });
    }

    // Increment usage count
    license.usageCount += 1;
    await license.save();

    // Log successful validation
    console.info(`License validated successfully for IP: ${ip}`);

    // Notify if license is about to expire
    if (license.expiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      console.warn(`License for key ${hashedKey} is about to expire`);
    }

    next();
  } catch (err) {
    console.error(`Error during license validation: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
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

module.exports = licenseValidator;
