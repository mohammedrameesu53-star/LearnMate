import React, { useEffect, useState } from 'react';
import api from '../../api';
export default function MentorDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/api/dashboard/mentor/')
            .then(res => setData(res.data))
            .catch(err => console.error("Access denied:", err));
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
                <h1 className="text-3xl font-bold text-emerald-400 mb-2">Mentor Workspace</h1>
                {data ? (
                    <p className="text-slate-300">Hello Instructor <span className="font-semibold text-white">{data.name}</span>. Your student tracking reviews are active.</p>
                ) : (
                    <p className="text-slate-500 animate-pulse">Synchronizing performance rosters...</p>
                )}
            </div>
        </div>
    );
}