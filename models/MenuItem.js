// models/MenuItem.js
const mongoose = require('mongoose');

// Store Canteen menu items.
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0      // Price cannot be negative
    },
    category: {
      type: String,
      trim: true  // Like "Rice", "Beverage", "Snack"
    },
    isAvailable: {
      type: Boolean,
      default: true   // Available by default
    }
  },
  {
    timestamps: true
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;
