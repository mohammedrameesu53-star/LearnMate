import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { FileText, Download } from "lucide-react";

export default function StudentResources() {
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
      setDashboardError("Failed to fetch resources from database.");
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

  const resourcesList = dashboardData?.resources ?? [];

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-6 animate-fade-in">
        {dashboardError && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {dashboardError}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Learning Resources</h2>
          <p className="text-sm text-slate-500 font-medium">Download textbooks, slides, and cheat sheets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resourcesList.map((res, i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">{res.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{res.file_type || "PDF Document"} • {res.size}</p>
                </div>
              </div>
              <button className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer">
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
