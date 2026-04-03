const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ branch: 1, semester: 1 });

module.exports = mongoose.model('Student', StudentSchema);
