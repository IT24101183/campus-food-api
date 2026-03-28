// server.js
require('dotenv').config(); // Load .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Route modules
const studentRoutes = require('./routes/students');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Read Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());           // Enable CORS
app.use(express.json());   // Enable JSON body parsing

// Root route - check if server running
app.get('/', (req, res) => {
  res.json({ message: 'Campus Food API is running!' });
});

// Mount Routes
app.use('/students', studentRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);
app.use('/analytics', analyticsRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
