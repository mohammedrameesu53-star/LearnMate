import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Mail, Star } from "lucide-react";

export default function MentorSettings() {
  const { user, refreshUser } = useAuth();
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (user) {
      setSpecialization(user.specialization || "");
      setExperience(user.experience || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.put("/api/profiles/mentor/", {
        specialization,
        experience
      });
      setProfileSuccess("Mentor profile updated successfully!");
      refreshUser();
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="max-w-2xl bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Mentor Profile Settings</h2>
          <p className="text-xs text-slate-400 font-medium">Update your bio details stored in the database</p>
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center gap-2">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Level</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center gap-2">
                <Star size={16} />
                <span>{user?.label || "Mentor"}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Machine Learning, Deep Learning, AI Engineering"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Years of Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. 10"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isSavingProfile ? "Saving profile..." : "Save Changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
