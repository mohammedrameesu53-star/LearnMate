// src/pages/dashboards/AdminDashboard.jsx
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth(); // { name: "Alex Rivera" }

  return (
    <DashboardLayout role="admin" user={user}>
      <h2 className="text-2xl font-bold">Platform Health</h2>
      <p className="text-gray-500 mb-6">
        Real-time overview of EduNexus performance and growth.
      </p>
      {/* total users, MAU, token usage, MRR cards, platform activity chart */}
    </DashboardLayout>
  );
}