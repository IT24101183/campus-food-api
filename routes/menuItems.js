// routes/menuItems.js
const express = require('express');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// POST /menu-items - Create menu item
router.post('/', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating menu item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /menu-items - List all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 }); // newest first
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu items:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /menu-items/search?name=egg&category=Rice - Search
// ⚠️ IMPORTANT: This route must be placed ABOVE the /:id route!
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query; // Get query params
    const filter = {};

    // Partial, case-insensitive search if name is provided
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Exact match if category is provided
    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter).sort({ name: 1 }); // name A-Z
    res.json(items);
  } catch (err) {
    console.error('Error searching menu items:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
