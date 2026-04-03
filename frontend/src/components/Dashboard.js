import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';

const API_URL = 'http://localhost:5000/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [attendanceRes, studentsRes] = await Promise.all([
          axios.get(`${API_URL}/attendance/date/${today}`),
          axios.get(`${API_URL}/students`)
        ]);
        setStats({
          totalStudents: studentsRes.data.length,
          presentToday: attendanceRes.data.filter(a => a.status === 'present').length,
          absentToday: attendanceRes.data.filter(a => a.status === 'absent').length,
          totalRecords: attendanceRes.data.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: <PeopleIcon fontSize="large" /> },
    { title: 'Present Today', value: stats?.presentToday || 0, icon: <EventIcon fontSize="large" color="success" /> },
    { title: 'Absent Today', value: stats?.absentToday || 0, icon: <EventIcon fontSize="large" color="error" /> },
    { title: 'Total Records', value: stats?.totalRecords || 0, icon: <DashboardIcon fontSize="large" /> }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }} elevation={2}>
              {card.icon}
              <Box>
                <Typography variant="h4">{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.title}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
