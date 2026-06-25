// src/pages/dashboards/StudentDashboard.jsx
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext"; // wherever you store logged-in user

export default function StudentDashboard() {
  const { user } = useAuth(); // { name: "Julianne V.", ... }

  return (
    <DashboardLayout role="student" user={user}>
      <h2 className="text-2xl font-bold">Hello, {user.name}</h2>
      <p className="text-gray-500 mb-6">
        Ready to dive back into Einstein's Relativity today?
      </p>
      {/* progress card, AI tutor chat card, recent activity table, etc */}
    </DashboardLayout>
  );
}