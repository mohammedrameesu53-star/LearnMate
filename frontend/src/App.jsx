import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

export default function App() {
  return (
    <Router>
      <div className="bg-slate-950 min-h-screen">
        <Routes>
          {/* Automatically redirect empty route path '/' to register */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<div className="text-white p-8">Welcome to Student Dashboard Content!</div>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
        </Routes>
      </div>
    </Router>
  );
}

