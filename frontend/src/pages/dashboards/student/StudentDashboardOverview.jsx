import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Flame, BookOpen, Clock, AlertCircle, ChevronRight, Send, Bot } from "lucide-react";

export default function StudentDashboardOverview() {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // Quick Chat Widget state
  const [quickQuestion, setQuickQuestion] = useState("");
  const [quickReplies, setQuickReplies] = useState([]);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    setDashboardError("");
    try {
      const response = await api.get("/api/dashboard/student/");
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setDashboardError("Failed to fetch dashboard data from database.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSendQuickQuestion = async (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    const userQ = quickQuestion;
    setQuickQuestion("");
    setQuickReplies(prev => [...prev, { type: "user", text: userQ }]);

    try {
      const response = await api.post("/api/dashboard/student/ai-chat/", { text: userQ });
      const updatedMessages = response.data;
      if (updatedMessages.length > 0) {
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        setQuickReplies(prev => [...prev, { type: "ai", text: lastMsg.text }]);
      }
    } catch (err) {
      console.error("Error sending quick chat:", err);
      setQuickReplies(prev => [...prev, { type: "ai", text: "I'm having trouble connecting to the database, but Lorentz transformations form the core basis of relativity!" }]);
    }
  };

  if (isLoadingDashboard) {
    return (
      <DashboardLayout role="student" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading student workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const streakDays = dashboardData?.streak ?? 0;
  const currentCourse = dashboardData?.current_course ?? null;
  const recentActivity = dashboardData?.recent_activity ?? [];
  const recommendations = dashboardData?.recommendations ?? [];

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-8 animate-fade-in">
        {dashboardError && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {dashboardError}
          </div>
        )}

        {/* Greeting Header & Streak Widget */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Hello, {user?.name}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Ready to dive back into Einstein's Relativity today?
            </p>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-4 bg-amber-50 border border-amber-200/60 px-5 py-3 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-200 animate-pulse">
              <Flame size={20} fill="white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Streak Status</span>
              <div className="flex items-center gap-2">
                <p className="text-lg font-extrabold text-slate-800 leading-none">{streakDays} Days</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(streakDays, 7) }).map((_, idx) => (
                    <span key={idx} className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress & AI Tutor Quick Chat Column/Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Card */}
          {currentCourse ? (
            <div className="lg:col-span-2 bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/40 rounded-full blur-3xl -z-10"></div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                  Current Course
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-4">{currentCourse.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 max-w-lg">
                  {currentCourse.description}
                </p>
              </div>

              {/* Progress Wheel and Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
                {/* Circular SVG Progress */}
                <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="#4f46e5" strokeWidth="10" fill="transparent"
                      strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - (currentCourse.progress ?? 0) / 100)} strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-slate-800 leading-none">{currentCourse.progress}%</p>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Complete</span>
                  </div>
                </div>

                <div className="space-y-3 w-full">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition duration-200 cursor-pointer flex items-center justify-center gap-2">
                    <span>Resume Lesson</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[250px]">
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/40 rounded-full blur-3xl -z-10"></div>
              <BookOpen size={40} className="text-indigo-600 mb-4 bg-indigo-50 p-2.5 rounded-2xl h-14 w-14 border border-indigo-100" />
              <h3 className="text-lg font-bold text-slate-800">No Active Course</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                You are not currently enrolled in any active course. Browse our recommendations below to get started!
              </p>
            </div>
          )}

          {/* Quick Chat Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-indigo-950 flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                  <Bot size={16} className="text-indigo-300 animate-bounce" />
                </div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                  Always Online
                </span>
              </div>
              <h4 className="text-lg font-bold mt-3">Quick Chat with AI Tutor</h4>
              <p className="text-xs text-indigo-200/80 leading-normal mt-1">
                Ask a complex question about physics or request a study summary for tomorrow's exam.
              </p>
            </div>

            {/* Question Log and Form */}
            <div className="mt-4 flex-1 overflow-y-auto max-h-[100px] space-y-2 pr-1 custom-scrollbar">
              {quickReplies.map((reply, i) => (
                <div key={i} className={`p-2 rounded-xl text-xs leading-normal ${reply.type === 'user' ? 'bg-indigo-800 text-indigo-100 self-end ml-4' : 'bg-indigo-950/50 text-indigo-200 mr-4 border border-indigo-800/40'}`}>
                  {reply.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendQuickQuestion} className="flex gap-2 bg-indigo-950/60 border border-indigo-800/60 p-1.5 rounded-xl mt-3 focus-within:ring-2 focus-within:ring-indigo-500/50">
              <input
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                placeholder="Type a question..."
                className="bg-transparent text-xs w-full outline-none px-2 text-white placeholder-indigo-300/60"
              />
              <button type="submit" className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition cursor-pointer shrink-0">
                <Send size={14} className="text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
              <p className="text-xs text-slate-400 font-medium">Your progress records over the last few days</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivity.map((act, idx) => (
                  <tr key={idx}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center 
                          ${act.category === 'Assignment' ? 'bg-indigo-50 text-indigo-600' :
                            act.category === 'Lesson' ? 'bg-purple-50 text-purple-600' :
                              'bg-rose-50 text-rose-600'}`}>
                          {act.category === 'Assignment' ? <BookOpen size={16} /> :
                            act.category === 'Lesson' ? <Clock size={16} /> :
                              <AlertCircle size={16} />}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{act.activity_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500">{act.category}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                        ${act.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-400">{act.timestamp}</td>
                    <td className="py-4 text-sm font-bold text-slate-700">{act.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended for You Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                    {rec.code}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition">{rec.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{rec.difficulty} • {rec.lessons_count} Lessons</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
