import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, Activity, Brain, Landmark, ShieldAlert, Cpu, 
  RefreshCw, CheckCircle2, AlertTriangle, PlayCircle, Plus, Trash2, ShieldAlert as Lock, UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Chart state
  const [chartRange, setChartRange] = useState("monthly");

  // User Management State
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Julianne V.", email: "julianne@student.com", role: "student", status: "Verified" },
    { id: 2, name: "Dr. Sarah Chen", email: "sarah.chen@mentor.com", role: "mentor", status: "Verified" },
    { id: 3, name: "Alex Rivera", email: "alex@admin.com", role: "admin", status: "Verified" },
    { id: 4, name: "Marcus Wright", email: "marcus@student.com", role: "student", status: "Pending Verification" }
  ]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  const handleVerifyUser = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: "Verified" } : u));
  };

  const handleDeleteUser = (id) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  // SVG Chart path parameters based on active range
  const chartPoints = chartRange === 'weekly' 
    ? "M10,80 Q30,40 50,70 T90,30 T130,50 T170,20 T210,60 T250,30"
    : "M10,90 Q50,40 100,75 T200,30 T300,60 T400,25 T500,50 T600,20 T700,45 T800,10";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
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

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Users", count: "128,432", change: "+12%", color: "text-indigo-600 bg-indigo-50", icon: Users },
                { label: "MAU", count: "84,210", change: "+8.4%", color: "text-emerald-600 bg-emerald-50", icon: Activity },
                { label: "AI Token Usage", count: "1.24B", change: "-2.1%", color: "text-rose-600 bg-rose-50", icon: Brain },
                { label: "MRR Forecast", count: "$428.5k", change: "+18.2%", color: "text-amber-600 bg-amber-50", icon: Landmark }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                  <div className="flex justify-between items-end mt-2">
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{stat.count}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'}`}>
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
                    {/* Gradient Area Fill */}
                    <path d={`${chartPoints} L800,100 L0,100 Z`} fill="url(#chartGradient)" />
                    {/* Line Stroke */}
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
        );

      case "users":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">User Management</h2>
                <p className="text-sm text-slate-500 font-medium">Verify pending user registrations and review permissions</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Plus size={14} />
                <span>Create User</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {usersList.map((usr) => (
                      <tr key={usr.id}>
                        <td className="py-4">{usr.name}</td>
                        <td className="py-4 text-xs font-medium text-slate-500">{usr.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                            ${usr.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 
                              usr.role === 'mentor' ? 'bg-purple-50 text-purple-600' : 
                              'bg-slate-50 text-slate-600'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                            ${usr.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {usr.status !== 'Verified' && (
                            <button onClick={() => handleVerifyUser(usr.id)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold" title="Verify User">
                              <UserCheck size={14} />
                              <span>Verify</span>
                            </button>
                          )}
                          <button onClick={() => handleDeleteUser(usr.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold" title="Deactivate User">
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "resources":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Platform Settings & Config</h2>
              <p className="text-sm text-slate-500 font-medium">Control global quotas and backup scripts</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Platform resource settings are active. Dynamic throttling is enabled.</p>
            </div>
          </div>
        );

      case "ai-tutor":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">AI Global Quotas</h2>
              <p className="text-sm text-slate-500 font-medium">Configure token size boundaries, model connectors, and cost metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">API Token Cost Control</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-500">Daily cost threshold</span>
                    <span className="text-slate-800">$1,500 / day</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  <p className="text-xs text-slate-400">Current cost utilization is within safe operating parameters.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Announcements & Broadcasts</h2>
              <p className="text-sm text-slate-500 font-medium">Publish system messages visible to all student and mentor workspaces</p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm max-w-xl">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Send System Broadcast</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Broadcast dispatched to all active sessions!"); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message Body</label>
                  <textarea rows="3" required placeholder="e.g. Platform maintenance scheduled for Sunday 2:00 AM..." className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"></textarea>
                </div>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer transition">
                  Dispatch Broadcast
                </button>
              </form>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="max-w-2xl bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Global Admin Settings</h2>
              <p className="text-xs text-slate-400 font-medium">Update authentication models, MFA policies, and system settings</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); alert("Configuration updated."); }} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/40">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Enforce Multi-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Mandatory for all admin and mentor logins</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/40">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Enable AI Automated Intervention flagging</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Flags struggling students based on activity metrics</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                </div>
              </div>

              <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition">
                Save Platform Configuration
              </button>
            </form>
          </div>
        );

      default:
        return <div>Invalid View</div>;
    }
  };

  return (
    <DashboardLayout role="admin" user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}