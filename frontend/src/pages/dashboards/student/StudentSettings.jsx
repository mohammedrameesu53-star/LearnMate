import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Mail, User } from "lucide-react";

export default function StudentSettings() {
  const { user, refreshUser } = useAuth();
  const [bio, setBio] = useState("");
  const [grade, setGrade] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setGrade(user.grade || "");
      setLearningGoal(user.learning_goal || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.put("/api/profile/student/", {
        bio,
        grade,
        learning_goal: learningGoal
      });
      setProfileSuccess("Profile updated successfully!");
      refreshUser();
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <DashboardLayout role="student" user={user}>
      <div className="max-w-2xl bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Student Profile Settings</h2>
          <p className="text-xs text-slate-400 font-medium">Update your bio, grade, and learning goal stored in the backend</p>
        </div>

        {profileSuccess && (
          <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {profileSuccess}
          </div>
        )}

        {profileError && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {profileError}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username / Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Permissions</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                <User size={16} />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Share a short summary about yourself..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Grade / Level</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Advanced Physics II"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Learning Goal</label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Master Relativity Calculations"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSavingProfile ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
