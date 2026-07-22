import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import ChatComponent from "../../../components/ChatComponent";

export default function AdminMessages() {

  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-4 h-full flex flex-col">

        <div>
          <h2 className="text-xl font-extrabold">
            Messages
          </h2>
        </div>

        <div className="flex-1 min-h-0">
          <ChatComponent />
        </div>

      </div>
    </DashboardLayout>
  );
}