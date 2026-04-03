import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import Students from './components/Students';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } }
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <MainApp />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <main style={{ flex: 1, padding: '20px', marginLeft: sidebarOpen && isAuthenticated ? '240px' : 0 }}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={isAuthenticated ? <Attendance /> : <Navigate to="/login" />} />
          <Route path="/students" element={isAuthenticated ? <Students /> : <Navigate to="/login" />} />
          <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
