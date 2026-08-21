import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../api";
import { Mail, User, Sun, Moon, Monitor } from "lucide-react";

export default function StudentSettings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

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
      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8 animate-fade-in transition-colors duration-200">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Student Settings & Preferences</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Manage your theme preferences and profile details</p>
        </div>

        {/* Theme Selection Section */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Appearance Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose how LearnMate looks to you</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                theme === "light"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Sun size={20} className={theme === "light" ? "text-amber-500" : ""} />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                theme === "dark"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Moon size={20} className={theme === "dark" ? "text-indigo-400" : ""} />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                theme === "system"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Monitor size={20} />
              <span>System</span>
            </button>
          </div>
        </div>

        {profileSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-4 py-3 rounded-xl text-xs font-semibold">
            {profileSuccess}
          </div>
        )}

        {profileError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-4 py-3 rounded-xl text-xs font-semibold">
            {profileError}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Username / Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role Permissions</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm">
                <User size={16} />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Share a short summary about yourself..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Academic Grade / Level</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Advanced Physics II"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Learning Goal</label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Master Relativity Calculations"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSavingProfile ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
