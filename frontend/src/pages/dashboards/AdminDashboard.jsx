import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; 

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/dashboard/admin/')
            .then(res => setData(res.data))
            .catch(err => console.error("Access denied:", err));
    }, []);

    const handleLogout = () => {
        // Clear all session details cleanly
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        
        // Return to the entry doorway
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-slate-900 border border-rose-500/20 rounded-2xl p-6 shadow-xl">
                
                {/* Header Section with Admin Title and Logout Button */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-rose-400">Control Administration</h1>
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
                        System Operator: <span className="font-semibold text-white">{data.name}</span>. Full platform permissions granted.
                    </p>
                ) : (
                    <p className="text-slate-500 animate-pulse text-lg">
                        Acquiring administrative infrastructure telemetry...
                    </p>
                )}
            </div>
        </div>
    );
}