const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 1 }); // Index for name-based searches
productSchema.index({ category: 1 }); // Index for category-based queries

module.exports = mongoose.model('Product', productSchema);
