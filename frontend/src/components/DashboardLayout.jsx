// src/components/DashboardLayout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ role, user, children }) {
  return (
    <div className="flex">
      <Sidebar role={role} user={user} />
      <div className="flex-1 flex flex-col">
        <Topbar role={role} name={user?.name} avatarUrl={user?.avatarUrl} />
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}