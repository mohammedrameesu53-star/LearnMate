// src/pages/dashboards/MentorDashboard.jsx
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function MentorDashboard() {
  const { user } = useAuth(); // { name: "Dr. Sarah Chen" }

  return (
    <DashboardLayout role="mentor" user={user}>
      <h2 className="text-2xl font-bold">Mentor Overview</h2>
      <p className="text-gray-500 mb-6">
        Welcome back, {user.name.split(" ")[0]}. You have 12 urgent reviews today.
      </p>
      {/* stat cards, urgent reviews list, insights panel */}
    </DashboardLayout>
  );
}