import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Plus, UserCheck, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/dashboard/admin/");
      if (response.data.recent_users) {
        const mappedUsers = response.data.recent_users.map((u, index) => ({
          id: index + 1,
          name: u.email.split("@")[0],
          email: u.email,
          role: u.role,
          status: "Verified",
        }));
        setUsersList(mappedUsers);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
      setError("Failed to load users from backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerifyUser = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: "Verified" } : u));
  };

  const handleDeleteUser = (id) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading user management workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">User Management</h2>
            <p className="text-sm text-slate-500 font-medium">Verify pending user registrations and review permissions</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Plus size={14} />
            <span>Create User</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {usersList.map((usr) => (
                  <tr key={usr.id}>
                    <td className="py-4">{usr.name}</td>
                    <td className="py-4 text-xs font-medium text-slate-500">{usr.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                        ${usr.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 
                          usr.role === 'mentor' ? 'bg-purple-50 text-purple-600' : 
                          'bg-slate-50 text-slate-600'}`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                        ${usr.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {usr.status !== 'Verified' && (
                        <button onClick={() => handleVerifyUser(usr.id)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold" title="Verify User">
                          <UserCheck size={14} />
                          <span>Verify</span>
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(usr.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold" title="Deactivate User">
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
