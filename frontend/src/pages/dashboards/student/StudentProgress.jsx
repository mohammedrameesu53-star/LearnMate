import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { ArrowLeft, Clock, Award, AlertCircle, PlayCircle, Trophy } from "lucide-react";

export default function StudentProgress() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get(`/api/courses/student/courses/${courseId}/progress/`);
      setProgress(response.data);
    } catch (err) {
      console.error("Error loading progress details:", err);
      setError("Failed to load progress records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <DashboardLayout role="student" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading progress data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Viewer</span>
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100 shadow-sm animate-pulse">
            <Clock size={28} />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{progress?.course_title || "Course Progress Workspace"}</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Detailed student achievement & timeline statistics</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-6">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed</span>
              <p className="text-lg font-black text-slate-700 mt-1">{progress?.completed_lessons} Lessons</p>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Remaining</span>
              <p className="text-lg font-black text-rose-500 mt-1">
                {Math.max((progress?.total_lessons ?? 0) - (progress?.completed_lessons ?? 0), 0)} Lessons
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Overall Progress</span>
              <span className="text-indigo-600">{progress?.progress_percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress?.progress_percentage ?? 0}%` }}
              ></div>
            </div>
          </div>

          {progress?.progress_percentage === 100 && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold">
              <Trophy size={16} />
              <span>Full course completed successfully!</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
