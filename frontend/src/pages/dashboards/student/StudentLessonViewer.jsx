import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import LessonAIChat from "../../../components/LessonAIChat";
import { Play, CheckCircle2, AlertCircle, FileText, Download, ArrowLeft, ArrowRight, Video } from "lucide-react";

export default function StudentLessonViewer() {
  const { user } = useAuth();
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchLessonData = async () => {
    setIsLoading(true);
    setError("");
    setActionSuccess("");
    try {
      // 1. Fetch Lesson details
      const lessonRes = await api.get(`/api/courses/student/lessons/${lessonId}/`);
      const lessonData = lessonRes.data;
      setLesson(lessonData);

      // Check progress status
      const progressRes = await api.get(`/api/courses/student/courses/${courseId}/progress/`);
      const completedList = progressRes.data || {};

      // 2. Fetch Resources
      const resourcesRes = await api.get(`/api/courses/lessons/${lessonId}/resources/`);
      setResources(resourcesRes.data || []);

    } catch (err) {
      console.error("Error loading lesson page:", err);
      setError("Failed to load lesson workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setError("");
    setActionSuccess("");
    try {
      await api.post(`/api/courses/lessons/${lessonId}/complete/`);
      setIsCompleted(true);
      setActionSuccess("Lesson marked complete!");
    } catch (err) {
      console.error("Error completing lesson:", err);
      setError("Could not register lesson completion status.");
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
            <p className="text-xs font-semibold text-slate-500">Loading learning session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Simple check to extract video ID from YouTube if relevant, or use direct player
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    return url;
  };

  const embedVideoUrl = getEmbedUrl(lesson?.video_url);

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Syllabus</span>
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {actionSuccess && (
          <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {actionSuccess}
          </div>
        )}

        {/* Video Player / Presentation Block */}
        {embedVideoUrl ? (
          <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200/50">
            <iframe
              src={embedVideoUrl}
              title={lesson?.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-3xl bg-indigo-950 flex flex-col items-center justify-center text-white border border-indigo-900 p-8 text-center shadow-sm">
            <Video size={48} className="text-indigo-300 mb-3 animate-pulse" />
            <h4 className="text-lg font-bold">PDF / Text-Based Lesson Materials</h4>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-sm">No streaming video attached. Read the detailed study description and download resources below.</p>
          </div>
        )}

        {/* Lesson Information Block */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-2 min-w-0">
            <span className="text-[9px] font-extrabold tracking-wider bg-slate-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
              {lesson?.lesson_type || "Video lecture"}
            </span>
            <h1 className="text-xl font-extrabold text-slate-800">{lesson?.title}</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {lesson?.description || "Read through the attached resources to complete this syllabus item."}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              disabled={isCompleted || isCompleting}
              onClick={handleMarkComplete}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer 
                ${isCompleted
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'}`}
            >
              <CheckCircle2 size={16} />
              <span>{isCompleted ? "Completed" : isCompleting ? "Recording..." : "Mark Complete"}</span>
            </button>
          </div>
        </div>

        {/* Resources & Attachments Section */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Attachments & Lecture Resources</h3>
          {resources.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">No resource files attached to this lesson.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((res) => {
                const downloadUrl = res.file
                  ? `http://127.0.0.1:8000${res.file}`
                  : res.external_url;

                return (
                  <div key={res.id} className="border border-slate-100 rounded-xl p-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 truncate">{res.title}</span>
                    </div>
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Tutor - scoped to this lesson's course content */}
        <LessonAIChat
          courseId={courseId}
          lessonId={lessonId}
          lessonTitle={lesson?.title}
        />
      </div>
    </DashboardLayout>
  );
}
