const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const compileRoutes = require('./routes/compile');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'https://compiler-client-9wha.vercel.app'];

    // Check if origin is in allowed list (normalize by removing trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || allowed === '*';
    });

    callback(null, true); // Allow all origins (you can make this stricter)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection with timeout settings and fallback to local
const tryConnectMongo = async () => {
  const localUri = 'mongodb://localhost:27017/online-compiler';
  const primaryUri = process.env.MONGODB_URI || localUri;

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(primaryUri, options);
    console.log('✅ MongoDB Connected');
    return;
  } catch (err) {
    console.error('❌ MongoDB Connection Error (primary):', err.message);
    if (primaryUri !== localUri) {
      console.log(`🔁 Attempting fallback to local MongoDB at ${localUri}...`);
      try {
        await mongoose.connect(localUri, options);
        console.log('✅ MongoDB Connected (local fallback)');
        return;
      } catch (err2) {
        console.error('❌ MongoDB Connection Error (fallback):', err2.message);
      }
    }
    console.log('⚠️ Server will continue running without database support');
  }
};

tryConnectMongo();

// Routes
app.use('/api/compile', compileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer(PORT);
