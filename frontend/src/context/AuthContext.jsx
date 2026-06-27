import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (role, email) => {
        const fallbackName = 
            role === 'student' ? 'Julianne V.' :
            role === 'mentor' ? 'Dr. Sarah Chen' :
            'Alex Rivera';

        const fallbackLabel = 
            role === 'student' ? 'PHYSICS STUDENT' :
            role === 'mentor' ? 'Senior Mentor' :
            'Platform Owner';

        const defaultUser = {
            name: fallbackName,
            email: email || localStorage.getItem('user_email') || 'user@learnmate.com',
            role: role,
            label: fallbackLabel,
            avatarUrl: '', // Will use name initials as fallback in UI
            bio: role === 'student' ? 'Curious student diving deep into Einstein Relativity.' : 'Experienced educator helping students master engineering and science.',
            grade: role === 'student' ? 'Advanced Physics II' : undefined,
            learning_goal: role === 'student' ? 'Quantum Mechanics' : undefined,
            specialization: role === 'mentor' ? 'Advanced Algorithms, AI & Machine Learning' : undefined,
            experience: role === 'mentor' ? '12 Years' : undefined,
        };

        try {
            // Attempt to load from backend profile endpoints
            if (role === 'student') {
                const response = await api.get('/api/profile/student/');
                setUser({
                    ...defaultUser,
                    name: response.data.username || defaultUser.name,
                    email: response.data.email || defaultUser.email,
                    bio: response.data.bio || defaultUser.bio,
                    grade: response.data.grade || defaultUser.grade,
                    learning_goal: response.data.learning_goal || defaultUser.learning_goal
                });
            } else if (role === 'mentor') {
                const response = await api.get('/api/profile/mentor/');
                setUser({
                    ...defaultUser,
                    name: response.data.username || defaultUser.name,
                    email: response.data.email || defaultUser.email,
                    specialization: response.data.specialization || defaultUser.specialization,
                    experience: response.data.experience || defaultUser.experience
                });
            } else {
                // Admin has no specific profile endpoint
                setUser(defaultUser);
            }
        } catch (error) {
            console.warn("Could not load backend profile details. Using high-fidelity mock fallback:", error);
            setUser(defaultUser);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');
        const email = localStorage.getItem('user_email');

        if (token && role) {
            loadUserProfile(role, email).finally(() => setLoading(false));
        } else {
            setUser(null);
            setLoading(false);
        }
    }, []);

    const login = async (accessToken, refreshToken, role, email) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_role', role);
        if (email) localStorage.setItem('user_email', email);
        
        setLoading(true);
        await loadUserProfile(role, email);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: () => loadUserProfile(user?.role, user?.email) }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
