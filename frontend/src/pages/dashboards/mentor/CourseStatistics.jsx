import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { ArrowLeft, BarChart2, AlertCircle, BookOpen, Users, Award, Percent } from "lucide-react";

export default function CourseStatistics() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/courses/mentor/courses/${courseId}/statistics/`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading course stats:", err);
      setError("Failed to fetch course analytics data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchStats();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading course analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const course = data?.course || {};
  const stats = data?.statistics || {};

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Back Link */}
        <button 
          onClick={() => navigate("/mentor/courses")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Classes</span>
        </button>

        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Header summary */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Course Analytics</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Platform performance indicators for {course.title}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm">
            <BarChart2 size={18} />
          </div>
        </div>

        {/* Statistics Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Syllabus count */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Course Structure</span>
            <p className="text-lg font-black text-slate-800 mt-2">{stats.modules} Modules</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.lessons} Lessons total</p>
          </div>

          {/* Enrolled Mentees */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled Mentees</span>
            <p className="text-lg font-black text-slate-800 mt-2">{stats.enrolled_students} Students</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Active registrations</p>
          </div>

          {/* Average Progress */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Progress</span>
            <p className="text-lg font-black text-indigo-600 mt-2">{stats.average_progress}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-indigo-600 h-full" style={{ width: `${stats.average_progress}%` }}></div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
            <p className="text-lg font-black text-emerald-600 mt-2">{stats.completion_rate}%</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{stats.completed_students} completions</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
