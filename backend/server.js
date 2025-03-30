require('dotenv').config(); // Ensure this is at the top of the file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize'); // Ensure this is imported
const xss = require('xss-clean');
const path = require('path');
const { csrfProtection, generateCsrfToken } = require('./middleware/csrfProtection');
const userActivityLogger = require('./middleware/userActivityLogger');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db'); // Import the DB connection logic

// Correctly import and use routes
const authRoutes = require('./routes/auth'); // Corrected import path
const inventoryRoutes = require('./routes/inventory'); // Ensure inventory route is registered
const auditLogRoutes = require('./routes/auditLogs'); // Corrected import path
const transactionRoutes = require('./routes/transactions'); // Corrected import path
const licenseRoutes = require('./routes/license'); // Corrected import path
const contractRoutes = require('./routes/contracts'); // Import contract routes

if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.SESSION_SECRET) {
  console.error('Missing required environment variables. Check your .env file.');
  process.exit(1);
}

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});
app.use(xss());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict' },
}));

// MongoDB connection
connectDB();

// Routes
app.use('/api/auth', csrfProtection, authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/contracts', contractRoutes);

// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => console.log('A user disconnected'));
});

// Notify clients of updates
app.use((req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      if (req.originalUrl.includes('/api/inventory')) {
        io.emit('inventoryUpdate', { message: 'Inventory updated' });
      } else if (req.originalUrl.includes('/api/audit-logs')) {
        io.emit('auditLogUpdate', { message: 'Audit log updated' });
      }
    }
  });
  next();
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
