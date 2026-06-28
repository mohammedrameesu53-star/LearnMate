import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function AdminCourses() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Admin Courses Management</h2>
          <p className="text-sm text-slate-500 font-medium">Create, edit, and assign platform courses</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Courses configuration dashboard is active. Course creation features are coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
