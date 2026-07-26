import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, Clock, ChevronRight, Send, Bot, AlertCircle } from "lucide-react";

export default function StudentDashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentCourseProgress, setCurrentCourseProgress] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Quick Chat Widget state
  const [quickQuestion, setQuickQuestion] = useState("");
  const [quickReplies, setQuickReplies] = useState([
    { type: "ai", text: "Hello! I am your AI Tutor. Ask me any questions about your courses!" }
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch Enrolled Courses
      const enrolledRes = await api.get("/api/courses/student/my-courses/");
      const enrolledData = enrolledRes.data || [];
      setEnrolledCourses(enrolledData);

      // 2. Fetch all Published Courses to find recommendations
      const publishedRes = await api.get("/api/courses/");
      const publishedData = publishedRes.data || [];
      
      // Filter out courses that the student is already enrolled in
      const enrolledIds = enrolledData.map(e => e.course);
      const recommendedFiltered = publishedData.filter(c => !enrolledIds.includes(c.id));
      setRecommendations(recommendedFiltered);

      // 3. If there is at least one enrolled course, get its detailed progress
      if (enrolledData.length > 0) {
        const firstCourseId = enrolledData[0].course;
        const progressRes = await api.get(`/api/courses/student/courses/${firstCourseId}/progress/`);
        setCurrentCourseProgress({
          id: firstCourseId,
          title: progressRes.data.course_title,
          progress: progressRes.data.progress_percentage || 0,
          completedLessons: progressRes.data.completed_lessons || 0,
          totalLessons: progressRes.data.total_lessons || 0,
          description: enrolledData[0].description || "Dive into this course to continue your learning journey."
        });
      } else {
        setCurrentCourseProgress(null);
      }

    } catch (err) {
      console.error("Error fetching student dashboard data:", err);
      setError("Failed to fetch dashboard data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendQuickQuestion = (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    const userQ = quickQuestion;
    setQuickQuestion("");
    setQuickReplies(prev => [...prev, { type: "user", text: userQ }]);

    // Simulated local smart AI response without hitting a backend API
    setTimeout(() => {
      let replyText = "That's a fascinating topic! In physics and computer science, building modular structures helps simplify complex abstractions. Feel free to explore your modules to learn more!";
      const lowerQ = userQ.toLowerCase();
      if (lowerQ.includes("relativity")) {
        replyText = "Special relativity shows that time and space are linked, and observers moving relative to each other measure different times and distances (time dilation and length contraction).";
      } else if (lowerQ.includes("quantum")) {
        replyText = "Quantum mechanics studies the physical properties of nature at the scale of atoms and subatomic particles, where objects exhibit both wave-like and particle-like behaviors.";
      } else if (lowerQ.includes("celery") || lowerQ.includes("task")) {
        replyText = "Celery is an asynchronous task queue that helps execute time-consuming operations in the background (like sending emails) so the main web application remains fast.";
      }
      setQuickReplies(prev => [...prev, { type: "ai", text: replyText }]);
    }, 600);
  };

  if (isLoading) {
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

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-8 animate-fade-in">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button 
              onClick={fetchData} 
              className="underline hover:text-red-800 text-[10px] uppercase font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Greeting Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Hello, {user?.name || "Student"}</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Welcome back to your workspace. Continue studying your enrolled courses or browse recommended topics below.
          </p>
        </div>

        {/* Course Progress & AI Tutor Quick Chat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Card */}
          {currentCourseProgress ? (
            <div className="lg:col-span-2 bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/40 rounded-full blur-3xl -z-10"></div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                  Primary Course
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-4">{currentCourseProgress.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 max-w-lg">
                  {currentCourseProgress.description}
                </p>
              </div>

              {/* Progress Wheel and Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
                {/* Circular SVG Progress */}
                <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="#4f46e5" strokeWidth="10" fill="transparent"
                      strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - (currentCourseProgress.progress ?? 0) / 100)} strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-slate-800 leading-none">{currentCourseProgress.progress}%</p>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Complete</span>
                  </div>
                </div>

                <div className="space-y-3 w-full">
                  <button 
                    onClick={() => navigate(`/student/courses/${currentCourseProgress.id}/continue`)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
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
                Ask a complex question about physics or request a study summary.
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

        {/* Enrolled Courses Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Your Enrolled Courses</h3>
          {enrolledCourses.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 text-center">
              <p className="text-slate-500 text-xs font-semibold">You are not enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((c) => (
                <div key={c.id} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                      {c.course_title?.substring(0,2).toUpperCase() || "CR"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">{c.course_title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Enrolled on: {new Date(c.enrolled_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/courses/${c.course}`)}
                    className="p-2 bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 rounded-xl transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended for You Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Recommended for You</h3>
          {recommendations.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 text-center">
              <p className="text-slate-500 text-xs font-semibold">You have enrolled in all available courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group cursor-pointer"
                  onClick={() => navigate("/student/courses")}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                      {rec.level?.substring(0,3).toUpperCase() || "EDU"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition">{rec.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{rec.level} • {rec.duration}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
