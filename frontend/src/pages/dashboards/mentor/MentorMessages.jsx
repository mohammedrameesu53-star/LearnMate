import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import ChatComponent from "../../../components/ChatComponent";

export default function MentorMessages() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <ChatComponent />
    </DashboardLayout>
  );
}

