const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add student
router.post('/', auth, async (req, res) => {
  try {
    const { name, rollNumber, department, email, phone } = req.body;
    const student = new Student({ name, rollNumber, department, email, phone });
    await student.save();
    res.json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Student with this roll number or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, rollNumber, department, email, phone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (department !== undefined) updates.department = department;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Student with this roll number or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
