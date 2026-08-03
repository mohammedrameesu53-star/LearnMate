import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import {
  BookOpen, AlertCircle, X, CheckCircle2, XCircle, Trash2,
  ChevronDown, ChevronRight, FileText, Download, User as UserIcon,
  Eye, Clock, Unlock
} from "lucide-react";

const TABS = [
  { key: "all", label: "All Courses", endpoint: "/api/adminpanel/courses/" },
  { key: "pending", label: "Pending", endpoint: "/api/adminpanel/courses/pending/" },
  { key: "published", label: "Published", endpoint: "/api/adminpanel/courses/published/" },
];

export default function AdminCourses() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  const [actionError, setActionError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async (tabKey) => {
    setIsLoading(true);
    setError("");
    try {
      const tab = TABS.find((t) => t.key === tabKey);
      const response = await api.get(tab.endpoint);
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses for admin catalog:", err);
      setError("Failed to fetch platform course catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/adminpanel/courses/statistics/");
      setStats(response.data || {});
    } catch (err) {
      console.error("Error fetching course statistics:", err);
    }
  };

  useEffect(() => {
    fetchCourses(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchStats();
  }, []);

  const openCourseDetail = async (courseId) => {
    setSelectedCourseId(courseId);
    setIsDetailLoading(true);
    setCourseDetail(null);
    setExpandedModules({});
    setExpandedLessons({});
    try {
      const response = await api.get(`/api/adminpanel/courses/${courseId}/`);
      setCourseDetail(response.data);
    } catch (err) {
      console.error("Error fetching course detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeCourseDetail = () => {
    setSelectedCourseId(null);
    setCourseDetail(null);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Converts a YouTube URL (watch, youtu.be, embed) into an embeddable URL.
  // Returns null if the URL isn't a recognized YouTube link (i.e. it's a direct file).
  const getYoutubeEmbedUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const refreshAfterAction = () => {
    fetchCourses(activeTab);
    fetchStats();
  };

  const handlePublish = async (courseId) => {
    setActionLoadingId(courseId);
    setActionError("");
    try {
      await api.patch(`/api/adminpanel/courses/${courseId}/publish/`);
      refreshAfterAction();
      if (courseDetail?.id === courseId) {
        setCourseDetail((prev) => ({ ...prev, status: "published" }));
      }
    } catch (err) {
      console.error("Error publishing course:", err);
      setActionError(err.response?.data?.message || "Failed to publish course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnpublish = async (courseId) => {
    setActionLoadingId(courseId);
    setActionError("");
    try {
      await api.patch(`/api/adminpanel/courses/${courseId}/unpublish/`);
      refreshAfterAction();
      if (courseDetail?.id === courseId) {
        setCourseDetail((prev) => ({ ...prev, status: "draft" }));
      }
    } catch (err) {
      console.error("Error unpublishing course:", err);
      setActionError(err.response?.data?.message || "Failed to unpublish course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/adminpanel/courses/${deletingCourse.id}/delete/`);
      setDeletingCourse(null);
      if (selectedCourseId === deletingCourse.id) closeCourseDetail();
      refreshAfterAction();
    } catch (err) {
      console.error("Error deleting course:", err);
      setActionError("Failed to delete course.");
      setDeletingCourse(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase
      ${status === "published"
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-amber-50 text-amber-600 border-amber-100"}`}>
      {status}
    </span>
  );

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={() => fetchCourses(activeTab)} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Course Moderation</h2>
          <p className="text-sm text-slate-500 font-medium">Review, publish, and audit every course on the platform</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", val: stats.total_courses },
            { label: "Published", val: stats.published_courses },
            { label: "Draft", val: stats.draft_courses },
            { label: "Beginner", val: stats.beginner_courses },
            { label: "Intermediate", val: stats.intermediate_courses },
            { label: "Advanced", val: stats.advanced_courses },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-4">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{s.label}</span>
              <span className="text-xl font-black text-slate-800">{s.val ?? 0}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition
                ${activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Courses Found</h3>
            <p className="text-xs text-slate-400 mt-1">Nothing matches this filter right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold tracking-wider bg-slate-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
                      {c.level || "beginner"}
                    </span>
                    {statusBadge(c.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <UserIcon size={12} />
                    {c.mentor?.username || "Unassigned"}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{c.module_count ?? 0} Modules · {c.lesson_count ?? 0} Lessons</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                {/* View Details button - explicit entry point into the modal */}
                <button
                  onClick={() => openCourseDetail(c.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold cursor-pointer transition"
                >
                  <Eye size={14} /> View Details
                </button>

                <div className="mt-2 flex gap-2">
                  {c.status === "published" ? (
                    <button
                      onClick={() => handleUnpublish(c.id)}
                      disabled={actionLoadingId === c.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={13} /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublish(c.id)}
                      disabled={actionLoadingId === c.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingCourse(c)}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-[11px] font-bold cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal - enlarged */}
      {selectedCourseId && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-slate-800">Course Detail</h3>
              <button onClick={closeCourseDetail} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="p-8 space-y-7">
              {actionError && (
                <div className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-2 rounded-xl text-xs font-semibold">
                  {actionError}
                </div>
              )}

              {isDetailLoading ? (
                <div className="flex items-center justify-center p-16">
                  <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : courseDetail ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">{courseDetail.title}</h2>
                      <p className="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
                        <UserIcon size={13} /> {courseDetail.mentor?.username || "Unassigned"}
                      </p>
                    </div>
                    {statusBadge(courseDetail.status)}
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed bg-slate-50/60 p-4 rounded-2xl">
                    {courseDetail.description || "No description provided."}
                  </p>

                  <div className="flex gap-2">
                    {courseDetail.status === "published" ? (
                      <button
                        onClick={() => handleUnpublish(courseDetail.id)}
                        disabled={actionLoadingId === courseDetail.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={14} /> Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(courseDetail.id)}
                        disabled={actionLoadingId === courseDetail.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingCourse(courseDetail)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete Course
                    </button>
                  </div>

                  {/* Syllabus tree: Module -> Lesson -> Resource, each level labeled */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700">Syllabus</h4>

                    {(courseDetail.modules || []).length === 0 ? (
                      <p className="text-xs text-slate-400">No modules added yet.</p>
                    ) : (
                      courseDetail.modules.map((mod, modIdx) => (
                        <div key={mod.id} className="border border-slate-200/60 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                Module {modIdx + 1}
                              </span>
                              <span className="text-sm font-bold text-slate-700">{mod.title}</span>
                            </span>
                            {expandedModules[mod.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          {expandedModules[mod.id] && (
                            <div className="p-5 space-y-3 bg-white">
                              {(mod.lessons || []).length === 0 ? (
                                <p className="text-xs text-slate-400">No lessons in this module.</p>
                              ) : (
                                mod.lessons.map((lesson, lessonIdx) => (
                                  <div key={lesson.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                    <button
                                      onClick={() => toggleLesson(lesson.id)}
                                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-[8px] font-black text-purple-500 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                                          Lesson {lessonIdx + 1}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700 truncate">{lesson.title}</span>
                                        {lesson.is_free_preview && (
                                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 shrink-0">
                                            <Unlock size={10} /> Preview
                                          </span>
                                        )}
                                      </span>
                                      {expandedLessons[lesson.id] ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                                    </button>

                                    {expandedLessons[lesson.id] && (
                                      <div className="px-4 pb-4 space-y-3 border-t border-slate-50">
                                        {/* Lesson video player - embedded, not an outbound link */}
                                        <div className="pt-3 space-y-2">
                                          {lesson.video_url && (
                                            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                                              {getYoutubeEmbedUrl(lesson.video_url) ? (
                                                <iframe
                                                  src={getYoutubeEmbedUrl(lesson.video_url)}
                                                  title={lesson.title}
                                                  className="w-full h-full"
                                                  frameBorder="0"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                  allowFullScreen
                                                />
                                              ) : (
                                                <video
                                                  src={
                                                    lesson.video_url.startsWith("http")
                                                      ? lesson.video_url
                                                      : `http://127.0.0.1:8000${lesson.video_url}`
                                                  }
                                                  controls
                                                  className="w-full h-full"
                                                />
                                              )}
                                            </div>
                                          )}
                                          {lesson.duration && (
                                            <p className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                              <Clock size={12} /> {lesson.duration}
                                            </p>
                                          )}
                                          {lesson.content && (
                                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/60 p-3 rounded-lg">
                                              {lesson.content}
                                            </p>
                                          )}
                                        </div>

                                        {/* Resources under this lesson */}
                                        <div>
                                          <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                            Resources
                                          </span>
                                          {(lesson.resources || []).length === 0 ? (
                                            <p className="text-[11px] text-slate-400 mt-2">No resources attached.</p>
                                          ) : (
                                            <div className="mt-2 space-y-1.5">
                                              {lesson.resources.map((res) => {
                                                const downloadUrl = res.file
                                                  ? `http://127.0.0.1:8000${res.file}`
                                                  : res.external_url;
                                                return (
                                                  <a
                                                    key={res.id}
                                                    href={downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition"
                                                  >
                                                    <FileText size={12} />
                                                    {res.title}
                                                    <Download size={11} className="ml-auto" />
                                                  </a>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">Failed to load course details.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Delete Course?</h3>
            <p className="text-xs text-slate-500">
              This will permanently remove <span className="font-bold text-slate-700">"{deletingCourse.title}"</span> along with all its modules, lessons, and resources. This cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingCourse(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
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

// dashboard/admin/AdminCourses.jsx