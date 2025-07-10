const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/transaction', require('./routes/transactionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Debug logging middleware (to ensure requests reach here)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// MongoDB connect
mongoose.connect('mongodb://127.0.0.1:27017/biosecurepay')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.get('/', (req, res) => {
  res.send('Backend is alive ✅');
});

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
