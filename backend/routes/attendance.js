const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all attendance records
router.get('/', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('student', 'name rollNumber');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, status, date } = req.body;
    const attendance = new Attendance({ student: studentId, status, date });
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ date: req.params.date }).populate('student', 'name rollNumber');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
