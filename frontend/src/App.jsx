import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import MentorDashboard from './pages/dashboards/MentorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

export default function App() {
    return (
        <AuthProvider>
            <Router>
            <Routes>
                {/* Auth Routes group */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> 
                <Route path="/forgot-password" element={<ForgotPassword />} /> 

                {/* Role-Specific Protected Dashboards */}
                <Route 
                    path="/student-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/mentor-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['mentor']}>
                            <MentorDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin-dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Default Fallback Redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    </AuthProvider>
    );
}