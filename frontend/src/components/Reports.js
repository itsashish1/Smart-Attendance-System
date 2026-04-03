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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const API_URL = 'http://localhost:5000/api';

function Reports() {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedStudent) params.append('studentId', selectedStudent);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_URL}/attendance?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data);
        generateReport(data);
      } else {
        setError('Failed to fetch attendance records');
      }
    } catch (err) {
      setError('An error occurred while fetching records');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (records) => {
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const total = records.length;

    setReportData({
      present,
      absent,
      late,
      total,
      attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : 0,
      chartData: [
        { name: 'Present', value: present, color: '#4caf50' },
        { name: 'Absent', value: absent, color: '#f44336' },
        { name: 'Late', value: late, color: '#ff9800' }
      ]
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Students</em>
                </MenuItem>
                {students.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name} ({s.rollNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={fetchAttendanceRecords}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h4">{reportData.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Present
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {reportData.present}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Absent
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {reportData.absent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Attendance Rate
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {reportData.attendanceRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {reportData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.student?.name || 'N/A'}</TableCell>
                      <TableCell>{record.class || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography
                          color={
                            record.status === 'present'
                              ? 'success.main'
                              : record.status === 'absent'
                              ? 'error.main'
                              : 'warning.main'
                          }
                          fontWeight="bold"
                        >
                          {record.status?.toUpperCase()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {!reportData && !loading && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Select filters and click "Generate Report" to view attendance data
        </Typography>
      )}
    </Box>
  );
}

export default Reports;
