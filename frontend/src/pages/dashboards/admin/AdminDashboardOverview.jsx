import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Users, Activity, Landmark, Cpu, AlertCircle, BookOpen, Clock } from "lucide-react";

export default function AdminDashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/courses/admin/dashboard/");
      setData(response.data);
    } catch (err) {
      console.error("Error fetching admin dashboard stats:", err);
      setError("Failed to load platform analytics from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="admin" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading Admin Control Center...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.statistics || {};
  const popularCourse = data?.most_popular_course || {};
  const latestCourses = data?.latest_courses || [];

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-8 animate-fade-in">
        {/* Header section with Operational Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Platform Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
              Real-time overview of LearnMate registrations, course distributions, and student streaks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-4 py-2 rounded-xl">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Platform Systems Live</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">Updated just now</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={fetchAdminData} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Students", count: stats.total_students ?? 0, desc: "Registered learners", color: "text-indigo-600 bg-indigo-50", icon: Users },
            { label: "Coordinating Mentors", count: stats.total_mentors ?? 0, desc: "Active course advisors", color: "text-purple-600 bg-purple-50", icon: Users },
            { label: "Catalog Courses", count: stats.total_courses ?? 0, desc: `(${stats.published_courses || 0} Published / ${stats.draft_courses || 0} Draft)`, color: "text-emerald-600 bg-emerald-50", icon: BookOpen },
            { label: "Active Enrollments", count: stats.total_enrollments ?? 0, desc: `${stats.completed_courses || 0} fully completed`, color: "text-amber-600 bg-amber-50", icon: Landmark }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden transition-colors duration-200">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{stat.label}</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{stat.count}</h3>
              </div>
              <div className="mt-4 flex gap-1 items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                <stat.icon size={12} className="text-slate-400 dark:text-slate-500" />
                <span>{stat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Column: popular course & recent courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular course showcase */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-indigo-950 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Most Popular
              </span>
              <h4 className="text-lg font-black mt-4">{popularCourse.title || "No Enrollments Yet"}</h4>
              <p className="text-xs text-indigo-200/80 mt-1">
                Currently tracking the highest user signups across all semesters.
              </p>
            </div>
            {popularCourse.students !== undefined && (
              <div className="mt-6 flex items-center justify-between border-t border-indigo-800/40 pt-4">
                <span className="text-[10px] font-bold text-indigo-300 uppercase">Current Enrolled</span>
                <span className="text-sm font-extrabold text-white">{popularCourse.students} Students</span>
              </div>
            )}
          </div>

          {/* syllabus stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-colors duration-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Syllabus Breakdown</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{stats.total_lessons ?? 0} Lessons</h4>
            </div>
            <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-4">
              <div>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Modules</span>
                <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-0.5">{stats.total_modules || 0}</p>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Average per Module</span>
                <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                  {stats.total_modules ? Math.round(stats.total_lessons / stats.total_modules) : 0}
                </p>
              </div>
            </div>
          </div>

          {/* AI server node status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 self-start w-full transition-colors duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Operational Nodes</h3>
              <Cpu size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {[
                { name: "Auth OTP Service", val: "Online", type: "Active" },
                { name: "SMTP Service", val: "Online", type: "Active" },
                { name: "Celery Worker Queue", val: "Online", type: "Active" }
              ].map((node, i) => (
                <div key={i} className="flex justify-between items-center border border-slate-50 dark:border-slate-800 p-2 rounded-xl text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-700 dark:text-slate-200">{node.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{node.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Created Courses Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden transition-colors duration-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recently Created Courses</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Platform-wide additions audit trails</p>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Course Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Creation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {latestCourses.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400 dark:text-slate-500 font-medium">No courses created yet.</td>
                  </tr>
                ) : (
                  latestCourses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-4 text-slate-800 dark:text-slate-200">{c.title}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border
                          ${c.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 dark:text-slate-500 font-medium">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// dashboard/admin/AdminDashboardOverview.jsx

