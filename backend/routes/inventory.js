const express = require('express');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory'); // Replace with your actual model
const router = express.Router();
const csv = require('fast-csv');
const fs = require('fs');
const multer = require('multer');
const auditLogger = require('../middleware/auditLogger'); // Corrected import path
const { MongoClient } = require('mongodb');
const sanitize = require('mongo-sanitize'); // Ensure this is imported
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

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
    const query = sanitize(req.query.query); // Sanitize input
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
    const stats = await Inventory.aggregate([
      { $group: { _id: null, totalItems: { $sum: '$quantity' }, totalValue: { $sum: '$value' } } },
    ]);
    res.json(stats[0] || { totalItems: 0, totalValue: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product counts grouped by category
router.get('/category-stats', async (req, res) => {
  try {
    const categoryStats = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
    ]);
    res.json(categoryStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload products
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    const sanitizedFile = sanitize(req.file); // Sanitize file input
    if (!sanitizedFile || sanitizedFile.mimetype !== 'text/csv') {
      return res.status(400).json({ error: 'Invalid file type. Only CSV files are allowed.' });
    }

    const products = [];
    fs.createReadStream(req.file.path)
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => products.push(row))
      .on('end', async () => {
        try {
          await client.connect();
          const db = client.db('stck');
          await db.collection('inventory').insertMany(products);
          fs.unlinkSync(req.file.path); // Clean up the uploaded file
          res.status(201).json({ message: 'Products uploaded successfully' });
        } catch (err) {
          console.error('Error during bulk upload:', err);
          res.status(500).json({ error: 'Internal server error' });
        } finally {
          await client.close();
        }
      });
  } catch (err) {
    console.error('Error during bulk upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export inventory as CSV
router.get('/export', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('stck');
    const inventory = await db.collection('inventory').find({}).toArray();

    const csvStream = csv.format({ headers: true });
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.setHeader('Content-Type', 'text/csv');
    csvStream.pipe(res);
    inventory.forEach((item) => csvStream.write(item));
    csvStream.end();
  } catch (err) {
    console.error('Error exporting inventory:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
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
