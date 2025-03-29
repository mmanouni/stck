const mongoose = require('mongoose');
const crypto = require('crypto');

if (!process.env.LICENSE_ENCRYPTION_KEY || !process.env.LICENSE_ENCRYPTION_IV) {
  throw new Error('LICENSE_ENCRYPTION_KEY and LICENSE_ENCRYPTION_IV must be set in the environment variables.');
}

const licenseSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // Store hashed license key
  isActive: { type: Boolean, default: false },
  activatedAt: { type: Date },
  usageCount: { type: Number, default: 0 },
  maxUsage: { type: Number, default: 5 }, // Default max usage limit
  usageHistory: [
    {
      action: { type: String, enum: ['activate', 'deactivate', 'renew'], required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  hardwareId: { type: String, required: false }, // Store hashed hardware ID
});

// Add indexes for better performance
licenseSchema.index({ key: 1 }); // Index for faster key lookups
licenseSchema.index({ isActive: 1 }); // Index for active/inactive queries
licenseSchema.index({ expiresAt: 1 }); // Index for expiry-related queries

// Pre-save hook to hash the license key
licenseSchema.pre('save', function (next) {
  if (this.isModified('key')) {
    this.key = crypto.createHash('sha256').update(this.key).digest('hex');
  }
  next();
});

// Method to renew a license
licenseSchema.methods.renew = function () {
  this.isActive = true;
  this.usageCount = 0; // Reset usage count
};

// Add a method to bind a license to a hardware ID
licenseSchema.methods.bindToHardware = function (hardwareId) {
  this.hardwareId = crypto.createHash('sha256').update(hardwareId).digest('hex'); // Hash the hardware ID
};

// Add a method to validate the hardware ID
licenseSchema.methods.validateHardware = function (hardwareId) {
  const hashedHardwareId = crypto.createHash('sha256').update(hardwareId).digest('hex');
  return this.hardwareId === hashedHardwareId;
};

// Log license usage action
licenseSchema.methods.logUsageAction = function (action) {
  if (this.usageCount >= this.maxUsage && action === 'activate') {
    throw new Error('License usage limit exceeded.');
  }
  this.usageHistory.push({ action, timestamp: new Date() });
  return this.save();
};

module.exports = mongoose.model('License', licenseSchema);
