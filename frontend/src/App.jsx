import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

export default function App() {
  return (
    <Router>
      <div className="bg-slate-950 min-h-screen">
        <Routes>
          {/* Automatically redirect empty route path '/' to register */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
        </Routes>
      </div>
    </Router>
  );
}

