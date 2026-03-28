// models/Student.js
const mongoose = require('mongoose');

// Student schema to store student data in MongoDB
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,       // String type
      required: true,     // Required
      unique: true,       // No duplicate emails
      trim: true          // Remove spaces
    },
    faculty: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: 1,   // Minimum 1 year
      max: 4    // Maximum 4 year
    }
  },
  {
    timestamps: true  // Auto add createdAt and updatedAt
  }
);

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
