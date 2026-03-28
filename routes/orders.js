// routes/orders.js
const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// Helper function: calculate total price of items
async function calculateTotalPrice(items) {
  const menuItemIds = items.map(i => i.menuItem); // Get list of IDs

  // Get menu items from database
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  // Create price map { id: price }
  const priceMap = {};
  menuItems.forEach(mi => {
    priceMap[mi._id.toString()] = mi.price;
  });

  // Calculate total
  let total = 0;
  for (const item of items) {
    const price = priceMap[item.menuItem.toString()];
    if (!price && price !== 0) {
      throw new Error(`Invalid menuItem ID: ${item.menuItem}`);
    }
    total += price * item.quantity;
  }

  return total;
}

// POST /orders - Place an order
router.post('/', async (req, res) => {
  try {
    const { student, items } = req.body;

    // Validation
    if (!student) return res.status(400).json({ error: 'Student is required' });
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const totalPrice = await calculateTotalPrice(items);

    const order = new Order({ student, items, totalPrice, status: 'PLACED' });
    const saved = await order.save();

    // Populate and return (show student name, menu item name)
    const populated = await Order.findById(saved._id)
      .populate('student')
      .populate('items.menuItem');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /orders?page=1&limit=2 - Paginated orders list
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   // default page 1
    const limit = parseInt(req.query.limit) || 10; // default limit 10
    const skip = (page - 1) * limit;              // skip = offset

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student')
      .populate('items.menuItem');

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({ page, limit, totalOrders, totalPages, orders });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student')
      .populate('items.menuItem');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

// PATCH /orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true } // Return updated document
    )
      .populate('student')
      .populate('items.menuItem');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /orders/:id - Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

module.exports = router;
