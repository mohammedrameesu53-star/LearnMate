import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function AdminAITutor() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
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
    </DashboardLayout>
  );
}
