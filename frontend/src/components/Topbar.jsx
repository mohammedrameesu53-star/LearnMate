import { Bell, Moon, Search } from "lucide-react";
import { roleConfig } from "../config/roleConfig";

export default function Topbar({ role, name, avatarUrl }) {
  const label = roleConfig[role]?.label || role;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-white">
      <div className="flex items-center gap-2 w-96 px-3 py-2 bg-gray-50 rounded-lg">
        <Search size={16} className="text-gray-400" />
        <input
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-5">
        <Bell size={20} />
        <Moon size={20} />

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs text-gray-400 leading-tight">{label}</p>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} className="h-9 w-9 rounded-full" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
              {name?.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}