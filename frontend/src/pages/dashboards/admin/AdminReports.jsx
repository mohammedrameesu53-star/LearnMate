import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import {
    AlertCircle, Users, BookOpen, TrendingUp, Landmark,
    CheckCircle2, Activity, User as UserIcon, Trophy
} from "lucide-react";

export default function AdminReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.get("/api/adminpanel/reports/");
            setReports(response.data || {});
        } catch (err) {
            console.error("Error fetching admin reports:", err);
            setError("Failed to load platform reports.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <DashboardLayout role="admin" user={user}>
                <div className="flex items-center justify-center p-12 min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-semibold text-slate-500">Compiling platform reports...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const recentUsers = reports?.recent_users || [];
    const recentCourses = reports?.recent_courses || [];
    const topCourses = reports?.top_courses || [];

    return (
        <DashboardLayout role="admin" user={user}>
            <div className="space-y-8 animate-fade-in">
                {error && (
                    <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </span>
                        <button onClick={fetchReports} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
                    </div>
                )}

                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Platform Reports</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Enrollment trends, recent activity, and top-performing courses</p>
                </div>

                {/* Enrollment stat strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Enrollments</span>
                            <Landmark size={16} className="text-indigo-400" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{reports?.total_enrollments ?? 0}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed</span>
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{reports?.completed_enrollments ?? 0}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active</span>
                            <Activity size={16} className="text-amber-400" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{reports?.active_enrollments ?? 0}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Users</h3>
                        </div>
                        {recentUsers.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No recent registrations.</p>
                        ) : (
                            <div className="space-y-1">
                                {recentUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <UserIcon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                        ${u.role === "admin" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400" :
                                                    u.role === "mentor" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400" :
                                                        "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                                {u.role}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Courses */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Courses</h3>
                        </div>
                        {recentCourses.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No recent course activity.</p>
                        ) : (
                            <div className="space-y-1">
                                {recentCourses.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{c.title}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">by {c.mentor?.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase
                        ${c.status === "published"
                                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60"
                                                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60"}`}>
                                                {c.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Courses */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={16} className="text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Courses by Enrollment</h3>
                    </div>
                    {topCourses.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No enrollment data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        <th className="pb-3 w-12">Rank</th>
                                        <th className="pb-3">Course Title</th>
                                        <th className="pb-3 text-right">Students Enrolled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {topCourses.map((c, i) => (
                                        <tr key={c.id}>
                                            <td className="py-3">
                                                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black
                          ${i === 0 ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400" :
                                                        i === 1 ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300" :
                                                            i === 2 ? "bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400" :
                                                                "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-800 dark:text-slate-200">{c.title}</td>
                                            <td className="py-3 text-right flex items-center justify-end gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                <TrendingUp size={13} />
                                                {c.students}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// dashboard/admin/AdminReports.jsx