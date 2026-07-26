import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { FileSpreadsheet, Plus, Users, AlertCircle, BookOpen, Calendar, ArrowRight, Award } from "lucide-react";

export default function MentorDashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddSync, setShowAddSync] = useState(false);
  const [newSyncName, setNewSyncName] = useState("");
  const [newSyncTime, setNewSyncTime] = useState("");
  const [newSyncDate, setNewSyncDate] = useState("");

  const [syncs, setSyncs] = useState([
    { date: "Oct 24", name: "Team Office Hours", time: "2:00 PM - 3:00 PM" },
    { date: "Oct 25", name: "Project Feedback (Marcus)", time: "10:30 AM - 11:00 AM" }
  ]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/courses/mentor/dashboard/");
      setStats(response.data.statistics || null);
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Error loading mentor stats:", err);
      setError("Failed to fetch dashboard data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddSync = (e) => {
    e.preventDefault();
    if (!newSyncName.trim() || !newSyncTime.trim() || !newSyncDate.trim()) return;
    setSyncs(prev => [...prev, { date: newSyncDate, name: newSyncName, time: newSyncTime }]);
    setNewSyncName("");
    setNewSyncTime("");
    setNewSyncDate("");
    setShowAddSync(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading mentor dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-8 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={fetchDashboardData} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        {/* Header section with Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mentor Overview</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Welcome back, {user?.name || "Mentor"}. Monitor your student progress and manage schedules below.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowAddSync(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer flex items-center gap-2">
              <Plus size={16} />
              <span>Schedule Sync</span>
            </button>
          </div>
        </div>

        {/* Sync Overlay Modal */}
        {showAddSync && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm animate-scale-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Schedule a Sync Session</h3>
              <form onSubmit={handleAddSync} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Session Title</label>
                  <input type="text" required value={newSyncName} onChange={e => setNewSyncName(e.target.value)} placeholder="e.g. Project Feedback" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                    <input type="text" required value={newSyncDate} onChange={e => setNewSyncDate(e.target.value)} placeholder="e.g. Oct 26" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Range</label>
                    <input type="text" required value={newSyncTime} onChange={e => setNewSyncTime(e.target.value)} placeholder="e.g. 1:00 PM - 2:00 PM" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" onClick={() => setShowAddSync(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700">Add Sync</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Students */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students Enrolled</span>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{stats?.total_students ?? 0} Mentees</h3>
            <div className="mt-4 flex gap-1 items-center text-xs font-medium text-slate-400">
              <Users size={14} />
              <span>Assigned active learners</span>
            </div>
          </div>

          {/* Completed Students */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Completions</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-2">{stats?.completed_students ?? 0} Students</h3>
            <div className="mt-4 flex gap-1 items-center text-xs font-medium text-slate-400">
              <Award size={14} className="text-emerald-500" />
              <span>Reached 100% progress milestones</span>
            </div>
          </div>

          {/* Active Courses coordinated */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Classes</span>
            <h3 className="text-3xl font-black text-indigo-600 mt-2">{stats?.total_courses ?? 0} Courses</h3>
            <div className="mt-4 flex gap-1 items-center text-xs font-medium text-slate-400">
              <BookOpen size={14} className="text-indigo-500" />
              <span>({stats?.published_courses ?? 0} Published, {stats?.draft_courses ?? 0} Drafts)</span>
            </div>
          </div>
        </div>

        {/* Layout Column: supervised courses list & Sync Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses summary table list */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Your Coordinated Courses</h3>
              <p className="text-xs text-slate-400 font-medium">Select a class to manage students or inspect statistics</p>
            </div>

            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium">No courses coordinated by you yet.</div>
              ) : (
                courses.map((c) => (
                  <div key={c.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-bold text-slate-700">{c.title}</h4>
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border
                          ${c.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {c.students} Students Enrolled • <span className="text-indigo-600 font-bold">{c.completion_rate}% completion rate</span>
                      </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => navigate(`/mentor/courses/${c.id}/students`)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                      >
                        Mentees
                      </button>
                      <button 
                        onClick={() => navigate(`/mentor/courses/${c.id}/statistics`)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                      >
                        Analytics
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Widgets: Upcoming Syncs panel */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4 self-start w-full">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Upcoming Syncs</h4>
              <Calendar size={16} className="text-slate-400" />
            </div>
            
            <div className="space-y-3">
              {syncs.map((sync, i) => (
                <div key={i} className="flex gap-3 items-center border border-slate-50 p-2.5 rounded-xl">
                  <div className="bg-indigo-50 text-indigo-600 h-10 w-10 shrink-0 rounded-xl flex flex-col items-center justify-center font-bold text-[9px] leading-tight">
                    <span className="text-xs">{sync.date.split(" ")[1]}</span>
                    <span className="text-[7px] uppercase">{sync.date.split(" ")[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-700 truncate">{sync.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sync.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
