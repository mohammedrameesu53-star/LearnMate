import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
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
    </DashboardLayout>
  );
}
