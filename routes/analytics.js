// routes/analytics.js
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// GET /analytics/total-spent/:studentId
// Total amount spent by a student
router.get('/total-spent/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const result = await Order.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId) // student filter
        }
      },
      {
        $group: {
          _id: '$student',
          totalSpent: { $sum: '$totalPrice' } // totalPrice sum
        }
      }
    ]);

    const totalSpent = result.length > 0 ? result[0].totalSpent : 0;
    res.json({ studentId, totalSpent });
  } catch (err) {
    console.error('Error calculating total spent:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /analytics/top-menu-items?limit=5
// Most ordered menu items
router.get('/top-menu-items', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await Order.aggregate([
      { $unwind: '$items' },            // Flatten the items array
      {
        $group: {
          _id: '$items.menuItem',       // Group by menuItem ID
          totalQuantity: { $sum: '$items.quantity' } // quantity sum
        }
      },
      { $sort: { totalQuantity: -1 } }, // highest first
      { $limit: limit }                 // top N only
    ]);

    // Populate MenuItem details
    const populated = await Promise.all(
      result.map(async (item) => {
        const menuItem = await MenuItem.findById(item._id);
        return { menuItem, totalQuantity: item.totalQuantity };
      })
    );

    res.json(populated);
  } catch (err) {
    console.error('Error fetching top menu items:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /analytics/daily-orders
// Daily order count
router.get('/daily-orders', async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d', // YYYY-MM-DD format
              date: '$createdAt'
            }
          },
          orderCount: { $sum: 1 } // count orders
        }
      },
      { $sort: { _id: 1 } } // date ascending
    ]);

    const formatted = result.map(r => ({
      date: r._id,
      orderCount: r.orderCount
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching daily orders:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
