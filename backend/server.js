const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const { csrfProtection, generateCsrfToken } = require('./middleware/csrfProtection');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const auditLogRoutes = require('./routes/auditLogs');
const transactionRoutes = require('./routes/transactions');
const licenseRoutes = require('./routes/license');
const userActivityLogger = require('./middleware/userActivityLogger');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

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
app.use(mongoSanitize());
app.use(xss());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict' },
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', csrfProtection, authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/license', licenseRoutes);

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
