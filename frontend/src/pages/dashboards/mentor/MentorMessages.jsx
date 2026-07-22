import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import ChatComponent from "../../../components/ChatComponent";

export default function MentorMessages() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-4 h-full flex flex-col">
        {/* Page Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Messages & Cohorts</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Manage Direct Conversations & Cohort Chats
          </p>
        </div>

        {/* Content Pane containing unified Chat Workspace */}
        <div className="flex-1 min-h-0">
          <ChatComponent />
        </div>
      </div>
    </DashboardLayout>
  );
}
