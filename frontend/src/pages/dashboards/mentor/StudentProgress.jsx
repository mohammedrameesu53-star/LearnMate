import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { ArrowLeft, Clock, Award, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export default function StudentProgress() {
  const { user } = useAuth();
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgressDetail = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/courses/mentor/courses/${courseId}/students/${studentId}/`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading student progress detail:", err);
      setError("Failed to fetch student progress records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && studentId) {
      fetchProgressDetail();
    }
  }, [courseId, studentId]);

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading student learning logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const student = data?.student || {};
  const course = data?.course || {};
  const stats = data?.statistics || {};
  const completedLessons = data?.completed_lessons || [];

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-12">
        {/* Back Link */}
        <button 
          onClick={() => navigate(`/mentor/courses/${courseId}/students`)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Students List</span>
        </button>

        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Student info and overall progress */}
        <div className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Mentee Progress
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-3">{student.name}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{student.email}</p>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Course Title</span>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{course.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-y border-slate-100 py-6 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed lessons</span>
              <p className="text-lg font-black text-slate-700 mt-1">{stats.completed_lessons} / {stats.total_lessons}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Percentage</span>
              <p className="text-lg font-black text-indigo-600 mt-1">{stats.progress}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Completed lessons list */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Completed Lessons Log</h3>
          {completedLessons.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              The student has not completed any lessons in this course outline.
            </div>
          ) : (
            <div className="space-y-3">
              {completedLessons.map((item) => (
                <div key={item.lesson_id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center gap-4 hover:border-slate-200 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">{item.lesson_title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    Completed: {new Date(item.completed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
