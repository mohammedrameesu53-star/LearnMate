import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; 

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/dashboard/student/')
            .then(res => setData(res.data))
            .catch(err => console.error("Access denied:", err));
    }, []);

    const handleLogout = () => {
        // Clear all session details safely
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        
        // Bounce user straight back to login page
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
                
                {/* Header Section with Portal Title and Logout Button */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-indigo-400">Student Portal</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition duration-200 shadow-md"
                    >
                        Log Out
                    </button>
                </div>

                {/* Dashboard Content Body */}
                {data ? (
                    <p className="text-slate-300 text-lg">
                        Welcome back, <span className="font-semibold text-white">{data.name}</span>! Ready to continue your courses?
                    </p>
                ) : (
                    <p className="text-slate-500 animate-pulse text-lg">
                        Loading workspace profiling info...
                    </p>
                )}
            </div>
        </div>
    );
}