import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { AlertCircle, Edit, Trash2, X, Check, ShieldCheck } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", is_verified: false, is_active: false });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/adminpanel/users/");
      setUsersList(response.data || []);
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

  const openEditModal = (usr) => {
    setEditingUser(usr);
    setEditForm({
      role: usr.role,
      is_verified: usr.is_verified,
      is_active: usr.is_active,
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditError("");
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setEditError("");
    try {
      const response = await api.patch(`/api/adminpanel/users/${editingUser.id}/`, editForm);
      setUsersList((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...response.data } : u))
      );
      closeEditModal();
    } catch (err) {
      console.error("Error updating user:", err);
      setEditError("Failed to save changes. Check the values and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/adminpanel/users/${deletingUser.id}/`);
      setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
      setDeletingUser(null);
    } finally {
      setIsDeleting(false);
    }
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
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={fetchUsers} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">View, edit roles/status, or remove any platform account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Verified</th>
                  <th className="pb-3">Active</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400 dark:text-slate-500 font-medium">No users found.</td>
                  </tr>
                ) : (
                  usersList.map((usr) => {
                    const isSelf = usr.id === user?.id;
                    return (
                      <tr key={usr.id}>
                        <td className="py-4 text-slate-800 dark:text-slate-200">
                          <span className="inline-flex items-center gap-1.5">
                            {usr.username}
                            {isSelf && (
                              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                You
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{usr.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                            ${usr.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' :
                              usr.role === 'mentor' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' :
                                'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                            ${usr.is_verified ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60'}`}>
                            {usr.is_verified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                            ${usr.is_active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'}`}>
                            {usr.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {isSelf ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              <ShieldCheck size={13} />
                              Locked
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(usr)}
                                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingUser(usr)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 dark:text-rose-400 rounded-xl transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Edit Account Properties</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 px-3 py-2 rounded-xl text-xs font-semibold">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Assigned Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Email Verified Status</span>
                <input
                  type="checkbox"
                  checked={editForm.is_verified}
                  onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                  className="h-4.5 w-4.5 text-indigo-600 rounded"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Active (not suspended)</span>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="h-4.5 w-4.5 text-indigo-600 rounded"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:bg-indigo-400 flex items-center justify-center gap-1.5"
              >
                {isSaving ? "Saving..." : (<><Check size={14} /> Save Changes</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Delete User?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will permanently remove <span className="font-bold text-slate-700 dark:text-slate-200">{deletingUser.email}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:bg-rose-400"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// dashboard/admin/AdminUsers.jsx