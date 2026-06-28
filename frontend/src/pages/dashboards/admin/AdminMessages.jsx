import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function AdminMessages() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
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
    </DashboardLayout>
  );
}
