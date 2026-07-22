import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function StudentCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    setDashboardError("");
    try {
      const response = await api.get("/api/dashboard/student/");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setDashboardError("Failed to fetch courses from database.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoadingDashboard) {
    return (
      <DashboardLayout role="student" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading learning workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const enrolledCourses = dashboardData?.enrolled_courses ?? [];

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-6 animate-fade-in">
        {dashboardError && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {dashboardError}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Your Enrolled Courses</h2>
          <p className="text-sm text-slate-500 font-medium">Select a course to view chapters, lessons, and learning material</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Courses Enrolled Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Check the course catalog to enroll in a subject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrolledCourses.map((c) => (
              <div
                key={c.id || c.code}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
                      {c.code || "COURSE"}
                    </span>
                    {c.difficulty && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {c.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {c.description || "No course description provided."}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Progress Indicator */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Course Progress
                      </span>
                      <span className="text-indigo-600 font-bold">{c.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.progress ?? 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Route Button to Course Viewer Workspace */}
                  <button
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="w-full py-2.5 px-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                  >
                    <span>Enter Course Room</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}