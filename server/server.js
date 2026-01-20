const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const compileRoutes = require('./routes/compile');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-compiler')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/compile', compileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
