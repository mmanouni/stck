const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }, // Reference to Role model
  profilePicture: { type: String }, // New field for profile picture
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }, // Lockout expiration timestamp
  isActive: { type: Boolean, default: true }, // New field to track account status
  language: { type: String, enum: ['en', 'ar', 'fr'], default: 'en' }, // New field for preferred language
  lastLogin: { type: Date }, // New field to track last login timestamp
  lastActivity: { type: Date }, // New field to track the last activity timestamp
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // New field for user category
  categoryPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // New field for assigned category permissions
  failedLoginAttempts: { type: Number, default: 0 }, // Track failed login attempts
  deactivationReason: { type: String }, // New field for deactivation reason
  delegatedRole: { type: String, enum: ['manager', 'user', 'admin'], default: null }, // New field for delegated role
  delegationExpiresAt: { type: Date }, // New field for delegation expiration
  isSuspended: { type: Boolean, default: false }, // New field for suspension status
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); // Use higher salt rounds for stronger password hashing
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.isLocked()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Lock for 15 minutes
  }
  return this.updateOne(updates);
};

userSchema.methods.incrementFailedLoginAttempts = async function () {
  if (this.isLocked()) {
    return this.updateOne({ $set: { failedLoginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Lock for 15 minutes
  }
  return this.updateOne(updates);
};

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

userSchema.methods.updateLastActivity = async function () {
  this.lastActivity = new Date();
  await this.save();
};

userSchema.methods.assignCategory = async function (categoryId) {
  this.category = categoryId;
  await this.save();
};

userSchema.methods.deactivateAccount = async function (reason) {
  this.isActive = false;
  this.deactivationReason = reason;
  await this.save();
};

userSchema.methods.delegateRole = async function (role, expiresAt) {
  this.delegatedRole = role;
  this.delegationExpiresAt = expiresAt;
  await this.save();
};

userSchema.methods.delegateAdminRole = async function (expiresAt) {
  this.delegatedRole = 'admin';
  this.delegationExpiresAt = expiresAt;
  await this.save();
};

userSchema.methods.revokeDelegatedRole = async function () {
  this.delegatedRole = null;
  this.delegationExpiresAt = null;
  await this.save();
};

userSchema.methods.suspendAccount = async function () {
  this.isSuspended = true;
  await this.save();
};

userSchema.methods.unsuspendAccount = async function () {
  this.isSuspended = false;
  await this.save();
};

userSchema.methods.getPermissions = async function () {
  const role = await this.populate('role').execPopulate();
  return role.permissions || [];
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Remove password from the returned object
  delete user.__v; // Remove version key
  return user;
};

module.exports = mongoose.model('User', userSchema);
