import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";

export default function StudentCourses() {
  const { user } = useAuth();
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
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading student workspace...</p>
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
          <p className="text-sm text-slate-500 font-medium">Overview of learning paths and materials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {enrolledCourses.map((c) => (
            <div key={c.code} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{c.code}</span>
                <h3 className="text-base font-bold text-slate-800 mt-2.5 h-12 leading-tight">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed h-12 overflow-hidden">{c.description}</p>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Course Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-600 text-xs font-bold transition cursor-pointer">
                  Enter Course Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
