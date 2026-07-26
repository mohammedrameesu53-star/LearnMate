import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, Award, CheckCircle2, ChevronRight, AlertCircle, Play, FileText, ArrowLeft, Trophy } from "lucide-react";

export default function StudentCourseViewer() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [lessonsMap, setLessonsMap] = useState({}); // moduleId -> array of lessons
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState({});
  const [error, setError] = useState("");
  const [completeMsg, setCompleteMsg] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchCourseData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch Course details
      const courseRes = await api.get(`/api/courses/student/${courseId}/`);
      setCourse(courseRes.data);

      // 2. Fetch Progress
      const progressRes = await api.get(`/api/courses/student/courses/${courseId}/progress/`);
      setProgress(progressRes.data);

      // 3. Fetch Modules
      const modulesRes = await api.get(`/api/courses/student/${courseId}/modules/`);
      const modulesData = modulesRes.data || [];
      setModules(modulesData);

      // 4. Fetch lessons for the first few modules automatically
      const initialLessons = {};
      const initialLoading = {};
      
      await Promise.all(
        modulesData.map(async (mod) => {
          initialLoading[mod.id] = true;
          try {
            const lessonsRes = await api.get(`/api/courses/student/modules/${mod.id}/lessons/`);
            initialLessons[mod.id] = lessonsRes.data || [];
          } catch (e) {
            console.error(`Error loading lessons for module ${mod.id}:`, e);
            initialLessons[mod.id] = [];
          } finally {
            initialLoading[mod.id] = false;
          }
        })
      );
      
      setLessonsMap(initialLessons);

    } catch (err) {
      console.error("Error loading course details:", err);
      setError("Failed to load course workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleCompleteCourse = async () => {
    setIsCompleting(true);
    setCompleteMsg("");
    try {
      const res = await api.post(`/api/courses/student/courses/${courseId}/complete/`);
      setCompleteMsg(res.data.message || "Congratulations! Course marked as completed.");
      // Refresh progress
      const progressRes = await api.get(`/api/courses/student/courses/${courseId}/progress/`);
      setProgress(progressRes.data);
    } catch (err) {
      console.error("Error marking course complete:", err);
      setCompleteMsg("Failed to mark course complete. Try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading course outline...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isCourseComplete = progress?.progress_percentage === 100;

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Back Link */}
        <button 
          onClick={() => navigate("/student/courses")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to My Courses</span>
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Course Header Banner */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Course Outline
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 mt-4">{course?.title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed mt-2">{course?.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-6 border-t border-slate-100 pt-6">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
              <p className="text-xs font-bold text-slate-700">{course?.duration || "N/A"}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Skill Level</span>
              <p className="text-xs font-bold text-indigo-600 capitalize">{course?.level || "N/A"}</p>
            </div>
            {progress && (
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Course Progress ({progress.completed_lessons}/{progress.total_lessons} lessons)</span>
                  <span className="text-indigo-600 font-bold">{progress.progress_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progress.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Nudge / Certificate banner */}
        {isCourseComplete && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-100 shrink-0">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">100% Completed!</h3>
                <p className="text-xs text-slate-500 font-medium">You have completed all lessons in this course outline.</p>
              </div>
            </div>
            <button 
              disabled={isCompleting}
              onClick={handleCompleteCourse}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isCompleting ? "Processing..." : "Complete & Send Email"}
            </button>
          </div>
        )}

        {completeMsg && (
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-xs font-bold">
            {completeMsg}
          </div>
        )}

        {/* Modules & Lessons List */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Course Syllabus</h2>
          {modules.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">No learning modules defined for this course syllabus yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, index) => {
                const lessons = lessonsMap[mod.id] || [];
                return (
                  <div key={mod.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                    {/* Module Header */}
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Module {index + 1}</span>
                        <h4 className="text-sm font-bold text-slate-700 mt-0.5">{mod.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        {lessons.length} Lessons
                      </span>
                    </div>

                    {/* Lessons Grid list */}
                    <div className="divide-y divide-slate-100">
                      {lessons.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No lessons available in this module.</div>
                      ) : (
                        lessons.map((les) => (
                          <div 
                            key={les.id} 
                            onClick={() => navigate(`/student/courses/${courseId}/lessons/${les.id}`)}
                            className="px-6 py-4 flex justify-between items-center hover:bg-slate-50/50 transition cursor-pointer group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Play size={14} className="fill-indigo-600" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition">{les.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{les.duration || "N/A"} • {les.lesson_type?.toUpperCase() || "VIDEO"}</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
