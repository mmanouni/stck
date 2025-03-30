const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Get transactions summary
router.get('/summary', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('stck');
    const transactions = await db.collection('transactions').find({}).toArray();

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Add a new transaction
router.post('/', async (req, res) => {
  try {
    const { transactionId, amount, date } = req.body;

    await client.connect();
    const db = client.db('stck');
    const newTransaction = { transactionId, amount, date };
    await db.collection('transactions').insertOne(newTransaction);

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await client.connect();
    const db = client.db('stck');
    const result = await db.collection('transactions').deleteOne({ _id: new MongoClient.ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

module.exports = router;
