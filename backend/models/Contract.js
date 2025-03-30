const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  version: { type: String, required: true }, // Contract version
  changelog: { type: String, required: true }, // Detailed changelog of updates
  buyerDetails: {
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    representativeName: { type: String, required: true },
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who accepted the contract
  acceptedAt: { type: Date }, // Timestamp of acceptance
  createdAt: { type: Date, default: Date.now }, // Contract creation date
});

module.exports = mongoose.model('Contract', contractSchema);
