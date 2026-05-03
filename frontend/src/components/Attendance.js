import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Attendance() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student: studentId,
        date: selectedDate,
        class: selectedClass,
        status
      }));

      await axios.post(`${API_URL}/attendance/bulk`, { records });
      setAttendance({});
      alert('Attendance marked successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                label="Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="lecture">Lecture</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
                <MenuItem value="tutorial">Tutorial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(attendance).length === 0}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['present', 'absent', 'late'].map((status) => (
                        <Chip
                          key={status}
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          color={getStatusColor(status)}
                          variant={attendance[student._id] === status ? 'filled' : 'outlined'}
                          onClick={() => handleAttendanceChange(student._id, status)}
                          icon={
                            status === 'present'
                              ? <CheckCircleIcon />
                              : status === 'absent'
                              ? <CancelIcon />
                              : <RefreshIcon />
                          }
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No students found. Add students first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Attendance;
