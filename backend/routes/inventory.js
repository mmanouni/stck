const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const csv = require('fast-csv');
const fs = require('fs');
const multer = require('multer');
const auditLogger = require('../middleware/auditLogger');

const upload = multer({ dest: 'uploads/' });

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Product.countDocuments();
    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Search products by name or category
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    const suggestions = await Product.find(
      { name: { $regex: query, $options: 'i' } },
      'name'
    ).limit(5);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
router.post('/', auditLogger('Add Product'), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const newProduct = new Product({ name, description, price, quantity, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', auditLogger('Update Product'), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', auditLogger('Delete Product'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$price", "$quantity"] } } } }
    ]);
    res.json({
      totalProducts,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product counts grouped by category
router.get('/category-stats', async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.json(categoryStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload products
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'text/csv') {
      return res.status(400).json({ error: 'Invalid file type. Only CSV files are allowed.' });
    }
    const products = [];
    fs.createReadStream(req.file.path)
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => products.push(row))
      .on('end', async () => {
        await Product.insertMany(products);
        fs.unlinkSync(req.file.path); // Clean up the uploaded file
        res.status(201).json({ message: 'Products uploaded successfully' });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export inventory as CSV
router.get('/export', async (req, res) => {
  try {
    const products = await Product.find();
    const csvStream = csv.format({ headers: true });
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.setHeader('Content-Type', 'text/csv');
    csvStream.pipe(res);
    products.forEach((product) => csvStream.write(product.toObject()));
    csvStream.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory trends
router.get('/trends', async (req, res) => {
  try {
    const trends = await Product.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          value: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
