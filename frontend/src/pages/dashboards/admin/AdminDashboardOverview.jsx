import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Users, Activity, Brain, Landmark, Cpu } from "lucide-react";

export default function AdminDashboardOverview() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartRange, setChartRange] = useState("monthly");

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/dashboard/admin/");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin stats from server.");
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

  const chartPoints = chartRange === 'weekly' 
    ? "M10,80 Q30,40 50,70 T90,30 T130,50 T170,20 T210,60 T250,30"
    : "M10,90 Q50,40 100,75 T200,30 T300,60 T400,25 T500,50 T600,20 T700,45 T800,10";

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-8 animate-fade-in">
        {/* Header section with Operational Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Platform Health</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Real-time overview of EduNexus performance and growth.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-emerald-700">AI Systems Operational</span>
            <span className="text-[10px] text-slate-400 font-medium ml-1">Updated 2m ago</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Users", count: dashboardData?.statistics?.total_users ?? 0, change: "+100%", isPositive: true, color: "text-indigo-600 bg-indigo-50", icon: Users },
            { label: "Active Mentors", count: dashboardData?.statistics?.total_mentors ?? 0, change: "Mentors", isPositive: true, color: "text-purple-600 bg-purple-50", icon: Users },
            { label: "Active Students", count: dashboardData?.statistics?.total_students ?? 0, change: "Students", isPositive: true, color: "text-emerald-600 bg-emerald-50", icon: Activity },
            { label: "MFA Protected", count: dashboardData?.statistics?.mfa_enabled_users ?? 0, change: "MFA Enabled", isPositive: true, color: "text-amber-600 bg-amber-50", icon: Landmark }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-black text-slate-800 leading-none">{stat.count}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.isPositive ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4 flex gap-1 items-center text-xs font-semibold text-slate-400">
                <stat.icon size={14} className="text-slate-400" />
                <span>Calculated hourly</span>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Column: Activity Chart & AI Node Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SVG Activity Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Platform Activity</h3>
                <p className="text-xs text-slate-400">User engagement across last 14 days</p>
              </div>
              <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                <button onClick={() => setChartRange("weekly")} className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${chartRange === 'weekly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Weekly</button>
                <button onClick={() => setChartRange("monthly")} className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${chartRange === 'monthly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Monthly</button>
              </div>
            </div>

            {/* SVG Graph line path details */}
            <div className="w-full h-44 overflow-hidden relative">
              <svg viewBox="0 0 800 100" className="w-full h-full text-indigo-500">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={`${chartPoints} L800,100 L0,100 Z`} fill="url(#chartGradient)" />
                <path d={chartPoints} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-2">
                <span>14 Days Ago</span>
                <span>7 Days Ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* AI Nodes Health statuses */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">AI Node Status</h3>
              <Cpu size={16} className="text-slate-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div className="space-y-3.5">
              {[
                { name: "Nexus-Turbo-01", val: "99.8%", status: "Active" },
                { name: "DeepMind-Connector", val: "95.2%", status: "Active" },
                { name: "Knowledge-Graph-V4", val: "87.5%", status: "Degraded" }
              ].map((node, i) => (
                <div key={i} className="flex justify-between items-center border border-slate-50 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${node.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="text-xs font-bold text-slate-700">{node.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{node.val}</span>
                </div>
              ))}
            </div>

            <button className="w-full text-center text-xs font-bold text-indigo-600 hover:underline mt-4 cursor-pointer">
              View Network Detail &gt;
            </button>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Logs</h3>
              <p className="text-xs text-slate-400 font-medium">Global API and access audit trails</p>
            </div>
            <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer">
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Entity</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                <tr>
                  <td className="py-4 font-mono text-slate-700">API_KEY_ROTATION</td>
                  <td className="py-4 text-slate-500">system/Auth</td>
                  <td className="py-4 text-slate-400">12:45:02</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">
                      COMPLETED
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-mono text-slate-700">TOKEN_LIMIT_EXCEEDED</td>
                  <td className="py-4 text-slate-500">user/JulianneV</td>
                  <td className="py-4 text-slate-400">12:40:15</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded">
                      WARNING
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-mono text-slate-700">USER_REGISTRATION</td>
                  <td className="py-4 text-slate-500">auth/MentorSarah</td>
                  <td className="py-4 text-slate-400">12:35:10</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
