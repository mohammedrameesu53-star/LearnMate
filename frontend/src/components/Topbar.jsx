import React from "react";
import { Bell, Moon, Sun, Search } from "lucide-react";
import { roleConfig } from "../config/roleConfig";

export default function Topbar({ role, user }) {
  const label = roleConfig[role]?.label || role;
  const [darkMode, setDarkMode] = React.useState(false);

  const getSearchPlaceholder = () => {
    switch (role) {
      case "student":
        return "Search courses, notes, AI chats...";
      case "mentor":
        return "Search student names, files...";
      case "admin":
        return "Search analytics, users, or reports...";
      default:
        return "Search...";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200/80 bg-white select-none">
      {/* Search Input bar */}
      <div className="flex items-center gap-3 w-96 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all duration-200">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          className="bg-transparent outline-none text-sm w-full text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Action Controls & User Info */}
      <div className="flex items-center gap-6">
        {/* Quick controls */}
        <div className="flex items-center gap-2 text-slate-500">
          <button 
            className="p-2 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-none mb-0.5">{user?.name || 'LearnMate User'}</p>
            <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase leading-none">{user?.label || label}</p>
          </div>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-50" 
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-100 select-none">
              {getInitials(user?.name)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}