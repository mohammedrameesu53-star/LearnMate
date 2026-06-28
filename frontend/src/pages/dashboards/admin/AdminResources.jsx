import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function AdminResources() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Platform Settings & Config</h2>
          <p className="text-sm text-slate-500 font-medium">Control global quotas and backup scripts</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Platform resource settings are active. Dynamic throttling is enabled.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
