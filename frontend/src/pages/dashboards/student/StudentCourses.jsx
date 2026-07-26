import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, ArrowRight, Clock, Plus, AlertCircle, BookCheck } from "lucide-react";

export default function StudentCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch Student Enrollments
      const enrolledRes = await api.get("/api/courses/student/my-courses/");
      const enrolledData = enrolledRes.data || [];

      // 2. Fetch Progress for each enrolled course in parallel
      const progressPromises = enrolledData.map(async (item) => {
        try {
          const progressRes = await api.get(`/api/courses/student/courses/${item.course}/progress/`);
          return {
            ...item,
            progress: progressRes.data.progress_percentage || 0,
            completedLessons: progressRes.data.completed_lessons || 0,
            totalLessons: progressRes.data.total_lessons || 0
          };
        } catch (e) {
          console.warn(`Could not load progress for course ${item.course}:`, e);
          return { ...item, progress: 0 };
        }
      });
      const enrolledWithProgress = await Promise.all(progressPromises);
      setEnrolledCourses(enrolledWithProgress);

      // 3. Fetch all Published Courses
      const publishedRes = await api.get("/api/courses/");
      const publishedData = publishedRes.data || [];

      // Filter published courses that the student is NOT enrolled in yet
      const enrolledIds = enrolledData.map(e => e.course);
      const remainingAvailable = publishedData.filter(c => !enrolledIds.includes(c.id));
      setAvailableCourses(remainingAvailable);

    } catch (err) {
      console.error("Error loading student courses:", err);
      setError("Failed to fetch course data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setIsEnrolling(true);
    setActionError("");
    try {
      await api.post(`/api/courses/student/${courseId}/enroll/`);
      // Refresh rosters
      await fetchCourses();
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setActionError("Failed to enroll in course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading learning workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-10 animate-fade-in">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={fetchCourses} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        {actionError && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {actionError}
          </div>
        )}

        {/* 1. Enrolled Courses Section */}
        <div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Your Enrolled Courses</h2>
            <p className="text-sm text-slate-500 font-medium">Select a course to view chapters, lessons, and learning material</p>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center mt-6">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Courses Enrolled Yet</h3>
              <p className="text-xs text-slate-400 mt-1">Select an option from the catalog below to start learning.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {enrolledCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
                        Active
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug line-clamp-2">
                      {c.course_title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Enrolled: {new Date(c.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Progress Indicator */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Course Progress
                        </span>
                        <span className="text-indigo-600 font-bold">{c.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Route Button to Course Viewer Workspace */}
                    <button
                      onClick={() => navigate(`/student/courses/${c.course}`)}
                      className="w-full py-2.5 px-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                    >
                      <span>Enter Course Room</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Available Catalog Section */}
        <div className="border-t border-slate-200/60 pt-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Course Catalog</h2>
            <p className="text-sm text-slate-500 font-medium">Browse published courses and expand your learning horizons</p>
          </div>

          {availableCourses.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 text-center mt-6">
              <BookCheck className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">You have enrolled in all available courses on the platform!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {availableCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold tracking-wider bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md uppercase">
                        {c.level || "Beginner"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {c.duration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {c.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      disabled={isEnrolling}
                      onClick={() => handleEnroll(c.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isEnrolling ? "Enrolling..." : "Enroll in Course"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}