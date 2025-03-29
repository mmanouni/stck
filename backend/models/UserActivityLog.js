const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  role: { type: String, required: true }, // New field to store user's role
  userAgent: { type: String }, // New field to store user's browser or device information
  category: { type: String }, // New field to store user's category
});

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);
