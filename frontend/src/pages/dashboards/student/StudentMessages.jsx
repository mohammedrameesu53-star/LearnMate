import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import ChatComponent from "../../../components/ChatComponent";

export default function StudentMessages() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="student" user={user}>
      <ChatComponent />
    </DashboardLayout>
  );
}

