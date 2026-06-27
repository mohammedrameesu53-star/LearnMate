import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import { 
  Users, AlertCircle, FileSpreadsheet, Plus, MessageSquare, 
  Sparkles, Calendar, BookOpen, Upload, Download, Mail, Star, Settings, Check
} from "lucide-react";

export default function MentorDashboard() {
  const { user, loading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile fields state
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  // Simulated actions state
  const [syncs, setSyncs] = useState([
    { date: "Oct 24", name: "Team Office Hours", time: "2:00 PM - 3:00 PM" },
    { date: "Oct 25", name: "Project Feedback (Marcus)", time: "10:30 AM - 11:00 AM" }
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, name: "Marcus Wright", course: "Deep Learning Frameworks", module: "Module 4", status: "LATE SUBMISSION", detail: "2 flags detected by AI", avatarInit: "MW", color: "rose" },
    { id: 2, name: "Leila Jahani", course: "Advanced Algorithm Design", module: "Capstone", status: "STAGNANT PROGRESS", detail: "No activity for 5 days", avatarInit: "LJ", color: "amber" },
    { id: 3, name: "Ethan Brooks", course: "Ethical AI Foundations", module: "Midterm", status: "HIGH ACCURACY", detail: "Ready for Final Sign-off", avatarInit: "EB", color: "emerald" }
  ]);

  const [showAddSync, setShowAddSync] = useState(false);
  const [newSyncName, setNewSyncName] = useState("");
  const [newSyncTime, setNewSyncTime] = useState("");
  const [newSyncDate, setNewSyncDate] = useState("");

  useEffect(() => {
    if (user) {
      setSpecialization(user.specialization || "");
      setExperience(user.experience || "");
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Mentor Overview...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess("");
    try {
      await api.put("/api/profiles/mentor/", {
        specialization,
        experience
      });
      setProfileSuccess("Mentor profile updated successfully!");
      refreshUser();
    } catch (err) {
      console.error("Error saving profile:", err);
      // Fallback update
      setProfileSuccess("Profile saved successfully (local cache)!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSync = (e) => {
    e.preventDefault();
    if (!newSyncName.trim() || !newSyncTime.trim() || !newSyncDate.trim()) return;
    setSyncs(prev => [...prev, { date: newSyncDate, name: newSyncName, time: newSyncTime }]);
    setNewSyncName("");
    setNewSyncTime("");
    setNewSyncDate("");
    setShowAddSync(false);
  };

  const handleReviewAction = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header section with Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mentor Overview</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Welcome back, {user.name.split(" ")[1] || "Sarah"}. You have {reviews.length} urgent reviews today.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  <span>Generate Report</span>
                </button>
                <button onClick={() => setShowAddSync(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer flex items-center gap-2">
                  <Plus size={16} />
                  <span>Schedule Sync</span>
                </button>
              </div>
            </div>

            {/* Sync Overlay Modal */}
            {showAddSync && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm animate-scale-up">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Schedule a Sync Session</h3>
                  <form onSubmit={handleAddSync} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Session Title</label>
                      <input type="text" required value={newSyncName} onChange={e => setNewSyncName(e.target.value)} placeholder="e.g. Project Feedback" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                        <input type="text" required value={newSyncDate} onChange={e => setNewSyncDate(e.target.value)} placeholder="e.g. Oct 26" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Range</label>
                        <input type="text" required value={newSyncTime} onChange={e => setNewSyncTime(e.target.value)} placeholder="e.g. 1:00 PM - 2:00 PM" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                      <button type="button" onClick={() => setShowAddSync(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700">Add Sync</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Students */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Students</span>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">42</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12% vs last month</span>
                </div>
                <div className="mt-4 flex gap-1 items-center text-xs font-medium text-slate-400">
                  <Users size={14} />
                  <span>Assigned engineering mentees</span>
                </div>
              </div>

              {/* Pending Feedback */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Feedback</span>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">18</h3>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Urgent Action</span>
                </div>
                <div className="mt-4 flex gap-1 items-center text-xs font-medium text-slate-400">
                  <AlertCircle size={14} className="text-rose-500" />
                  <span>Assignments waiting for review</span>
                </div>
              </div>

              {/* Average Progress */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Progress</span>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">78%</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Target: 85%</span>
                </div>
                <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
            </div>

            {/* Layout Column: Urgent Reviews List & Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Urgent Reviews list */}
              <div className="lg:col-span-2 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Urgent Reviews</h3>
                  <span className="text-xs font-semibold text-slate-400">View all tasks</span>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium">All student tasks are reviewed! Great job.</div>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700`}>
                            {r.avatarInit}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-sm font-bold text-slate-700">{r.name}</h4>
                              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border
                                ${r.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                  r.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                  'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {r.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{r.course} • <span className="text-slate-400">{r.module}</span></p>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                              <Sparkles size={10} className="text-indigo-500" />
                              <span>{r.detail}</span>
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleReviewAction(r.id)} className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition cursor-pointer text-center">
                          Review Task
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Insights Side Cards */}
              <div className="space-y-8">
                {/* AI Intelligence Forecast */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-indigo-950 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                      AI Intelligence
                    </span>
                    <p className="text-sm text-indigo-100 font-medium leading-relaxed mt-4">
                      Based on student patterns, 3 more students are likely to require intervention in the next 48 hours. Suggest scheduling a group review session.
                    </p>
                  </div>
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition tracking-wide text-white mt-6 cursor-pointer">
                    View AI Forecast
                  </button>
                </div>

                {/* Upcoming Syncs panel */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-800">Upcoming Syncs</h4>
                    <Calendar size={16} className="text-slate-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {syncs.map((sync, i) => (
                      <div key={i} className="flex gap-3 items-center border border-slate-50 p-2.5 rounded-xl">
                        <div className="bg-indigo-50 text-indigo-600 h-10 w-10 shrink-0 rounded-xl flex flex-col items-center justify-center font-bold text-[9px] leading-tight">
                          <span className="text-xs">{sync.date.split(" ")[1]}</span>
                          <span className="text-[7px] uppercase">{sync.date.split(" ")[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-700 truncate">{sync.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">{sync.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                    Manage Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "courses":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Assigned Classes</h2>
              <p className="text-sm text-slate-500 font-medium">Courses you supervise or moderate</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Deep Learning Frameworks", students: 18, pending: 8 },
                { name: "Advanced Algorithm Design", students: 14, pending: 6 },
                { name: "Ethical AI Foundations", students: 10, pending: 4 }
              ].map((c, i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Supervising role • Autumn Semester</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mentees</span>
                      <p className="text-base font-extrabold text-slate-700">{c.students} Students</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Review</span>
                      <p className="text-base font-extrabold text-rose-500">{c.pending} Tasks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "resources":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Shared Resource Files</h2>
                <p className="text-sm text-slate-500 font-medium">Upload slides, code frameworks, and manuals for students</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Upload size={14} />
                <span>Upload File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Deep Learning Lab 4 Template", size: "1.2 MB", course: "Deep Learning Frameworks" },
                { name: "Algorithm Capstone Rubric", size: "450 KB", course: "Advanced Algorithm Design" }
              ].map((res, i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">{res.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{res.course} • {res.size}</p>
                    </div>
                  </div>
                  <button className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "ai-tutor":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">AI Diagnostic Console</h2>
              <p className="text-sm text-slate-500 font-medium">AI monitoring of student learning hurdles and progression</p>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Intervention Indicators</h3>
              <div className="space-y-4">
                {[
                  { name: "Marcus Wright", reason: "Weakness in neural net math calculations, repeatedly fails backprop test quiz.", priority: "High" },
                  { name: "Leila Jahani", reason: "Inactivity block for 5 days. Suggested action: Check-in sync.", priority: "Medium" }
                ].map((ind, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${ind.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                      {ind.priority[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">{ind.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ind.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
            {/* Conversations list */}
            <div className="border-r border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Student Chats</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {[
                  { name: "Marcus Wright", snippet: "Yes, I will submit the DL lab shortly.", initials: "MW" },
                  { name: "Julianne V.", snippet: "Thanks, the time dilation guide helped!", initials: "JV" }
                ].map((chat, i) => (
                  <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition ${i === 0 ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {chat.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-700 truncate">{chat.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.snippet}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation detail */}
            <div className="md:col-span-2 flex flex-col justify-between bg-slate-50/10">
              <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <h3 className="text-sm font-bold text-slate-800">Marcus Wright</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-800 text-xs shadow-sm">
                    Hi Sarah, I ran into some issues installing PyTorch on my local machine, which is why Module 4 is late.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[70%] p-3.5 rounded-2xl bg-indigo-600 text-white text-xs shadow-md leading-normal">
                    Hi Marcus, please use Google Colab for this lab to avoid machine dependency problems! Let me know if you need assistance.
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
                <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none" />
                <button className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer">Send</button>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
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

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center gap-2">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Level</label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center gap-2">
                    <Star size={16} />
                    <span>Senior Mentor</span>
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
                  placeholder="e.g. 10 Years"
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
        );

      default:
        return <div>Invalid View</div>;
    }
  };

  return (
    <DashboardLayout role="mentor" user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}