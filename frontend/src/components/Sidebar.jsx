import { Link, useLocation } from "react-router-dom";
import { roleConfig } from "../config/roleConfig";

export default function Sidebar({ role, user }) {
  const location = useLocation();
  const config = roleConfig[role];

  return (
    <aside className="w-64 h-screen flex flex-col bg-white border-r">
      <div className="px-6 py-5">
        <h1 className="text-xl font-bold text-indigo-600">EduNexus AI</h1>
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          Future of Learning
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {config.navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                ${isActive
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  : "text-gray-600 hover:bg-gray-100"}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {config.upgrade && (
        <div className="px-4 mb-4">
          <button className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold">
            Upgrade to Pro
          </button>
        </div>
      )}

      <div className="px-4 pb-5 space-y-2 text-sm text-gray-500">
        <button className="block">Help Center</button>
        <button className="block text-red-500">Log Out</button>
      </div>
    </aside>
  );
}