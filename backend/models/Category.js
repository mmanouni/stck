const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  permissions: [{ type: String }], // New field to store category permissions
});

module.exports = mongoose.model('Category', categorySchema);
