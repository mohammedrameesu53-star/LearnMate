import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ role, user, activeTab, onTabChange, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Nav */}
      <Sidebar role={role} activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar role={role} user={user} />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}