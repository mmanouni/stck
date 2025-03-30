const express = require('express');
const bodyParser = require('body-parser');
const inventoryRoutes = require('./routes/inventory');
const transactionsRoutes = require('./routes/transactions');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionsRoutes);

module.exports = app;