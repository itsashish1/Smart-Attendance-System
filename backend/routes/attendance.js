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

// Get all attendance records (supports optional query filters: studentId, startDate, endDate)
router.get('/', auth, async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNumber department')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (single record)
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, status, date, class: className, remarks } = req.body;
    const attendance = new Attendance({
      student: studentId,
      status,
      date: date ? new Date(date) : Date.now(),
      class: className || '',
      remarks: remarks || ''
    });
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark bulk attendance
router.post('/bulk', auth, async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' });
    }

    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const dateObj = record.date ? new Date(record.date) : new Date();
        // Use upsert to handle duplicate attendance for same student+day
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOneAndUpdate(
          { student: record.student, date: { $gte: startOfDay, $lte: endOfDay } },
          {
            student: record.student,
            status: record.status,
            date: dateObj,
            class: record.class || '',
            remarks: record.remarks || ''
          },
          { upsert: true, new: true }
        );
        results.push(attendance);
      } catch (e) {
        errors.push({ record, error: e.message });
      }
    }

    res.json({ saved: results.length, errors });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const dateObj = new Date(req.params.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('student', 'name rollNumber department');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ message: 'Record not found' });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
