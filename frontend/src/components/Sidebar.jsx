import React from "react";
import { roleConfig } from "../config/roleConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";


export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const config = roleConfig[role] || { navItems: [] };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-white border-r border-gray-200/80 select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
            L
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">LearnMate AI</h1>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Future of Learning
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {config.navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer border
                ${isActive
                  ? "bg-indigo-50/80 text-indigo-600 border-indigo-100 font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"}`}
            >
              <item.icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>


      {/* Sidebar Footer */}
      <div className="px-4 py-4 border-t border-gray-100 bg-slate-50/50 space-y-1">

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer text-left"
        >
          <LogOut size={16} className="text-red-400" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}