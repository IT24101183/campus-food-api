// models/Order.js
const mongoose = require('mongoose');

// Order item schema - For items array inside order
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to MenuItem ID
      ref: 'MenuItem',                       // MenuItem model reference
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1    // Minimum quantity 1
    }
  },
  {
    _id: false  // Do not create an _id for sub-documents
  }
);

// Stores items ordered by students. Uses sub-document (embedded schema) here.
const orderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,   // Reference to Student ID
    ref: 'Student',
    required: true
  },
  items: {
    type: [orderItemSchema],  // Array of orderItemSchema
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'Order must have at least one item'
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'], // Allowed values
    default: 'PLACED'
  },
  createdAt: {
    type: Date,
    default: Date.now  // Current date/time
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
