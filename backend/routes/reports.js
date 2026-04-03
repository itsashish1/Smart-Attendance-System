const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
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

// Generate attendance report
router.get('/attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    const attendance = await Attendance.find(query).populate('student');
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    res.json({ total, present, absent, late, records: attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate student-wise report
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { student: req.params.studentId };
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    const attendance = await Attendance.find(query);
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    res.json({ studentId: req.params.studentId, total, present, percentage });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
