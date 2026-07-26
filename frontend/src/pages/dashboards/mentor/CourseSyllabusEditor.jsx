import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, AlertCircle, Play, FileText, ChevronRight } from "lucide-react";

export default function CourseSyllabusEditor() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({}); // moduleId -> array of lessons
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Modals & Forms State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleModalType, setModuleModalType] = useState("create"); // "create" or "edit"
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModalType, setLessonModalType] = useState("create"); // "create" or "edit"
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonModuleId, setLessonModuleId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonPreview, setLessonPreview] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson Preview State
  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewResources, setPreviewResources] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleOpenPreview = async (les) => {
    setPreviewLesson(les);
    setIsLoadingPreview(true);
    setPreviewResources([]);
    try {
      const res = await api.get(`/api/courses/lessons/${les.id}/resources/`);
      setPreviewResources(res.data || []);
    } catch (e) {
      console.error("Error loading preview resources:", e);
    } finally {
      setIsLoadingPreview(false);
    }
  };

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

  const fetchCourseAndSyllabus = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch course details
      const courseRes = await api.get(`/api/courses/${courseId}/`);
      setCourse(courseRes.data);

      // 2. Fetch Modules
      const modulesRes = await api.get(`/api/courses/${courseId}/modules/`);
      const modulesData = modulesRes.data || [];
      setModules(modulesData);

      // 3. Fetch lessons for each module in parallel
      const lessonsData = {};
      await Promise.all(
        modulesData.map(async (mod) => {
          try {
            const lessonsRes = await api.get(`/api/courses/modules/${mod.id}/lessons/`);
            lessonsData[mod.id] = lessonsRes.data || [];
          } catch (e) {
            console.error(`Error fetching lessons for module ${mod.id}:`, e);
            lessonsData[mod.id] = [];
          }
        })
      );
      setLessonsMap(lessonsData);

    } catch (err) {
      console.error("Error loading syllabus editor:", err);
      setError("Failed to load course syllabus records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndSyllabus();
    }
  }, [courseId]);

  // MODULE CRUD handlers
  const openModuleCreate = () => {
    setModuleModalType("create");
    setSelectedModuleId(null);
    setModuleTitle("");
    setModuleDesc("");
    setModuleOrder(modules.length + 1);
    setActionError("");
    setShowModuleModal(true);
  };

  const openModuleEdit = (mod) => {
    setModuleModalType("edit");
    setSelectedModuleId(mod.id);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || "");
    setModuleOrder(mod.order || 1);
    setActionError("");
    setShowModuleModal(true);
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) {
      setActionError("Title is required.");
      return;
    }
    setIsSubmitting(true);
    setActionError("");

    const payload = {
      course: parseInt(courseId),
      title: moduleTitle,
      description: moduleDesc,
      order: parseInt(moduleOrder)
    };

    try {
      if (moduleModalType === "create") {
        await api.post("/api/courses/modules/create/", payload);
      } else {
        await api.patch(`/api/courses/modules/${selectedModuleId}/update/`, payload);
      }
      setShowModuleModal(false);
      await fetchCourseAndSyllabus();
    } catch (err) {
      console.error("Error submitting module:", err);
      setActionError(err.response?.data?.error || "Failed to save module.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModuleDelete = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) return;
    try {
      await api.delete(`/api/courses/modules/${moduleId}/delete/`);
      await fetchCourseAndSyllabus();
    } catch (err) {
      console.error("Error deleting module:", err);
      alert("Failed to delete module.");
    }
  };

  // LESSON CRUD handlers
  const openLessonCreate = (moduleId) => {
    setLessonModalType("create");
    setSelectedLessonId(null);
    setLessonModuleId(moduleId);
    setLessonTitle("");
    setLessonDesc("");
    setLessonType("video");
    setLessonVideoUrl("");
    setLessonDuration("");
    setLessonOrder((lessonsMap[moduleId]?.length || 0) + 1);
    setLessonPreview(false);
    setActionError("");
    setShowLessonModal(true);
  };

  const openLessonEdit = (les, moduleId) => {
    setLessonModalType("edit");
    setSelectedLessonId(les.id);
    setLessonModuleId(moduleId);
    setLessonTitle(les.title);
    setLessonDesc(les.description || "");
    setLessonType(les.lesson_type || "video");
    setLessonVideoUrl(les.video_url || "");
    setLessonDuration(les.duration || "");
    setLessonOrder(les.order || 1);
    setLessonPreview(les.is_preview || false);
    setActionError("");
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonDuration.trim()) {
      setActionError("Title and Duration are required.");
      return;
    }
    setIsSubmitting(true);
    setActionError("");

    const payload = {
      module: lessonModuleId,
      title: lessonTitle,
      description: lessonDesc,
      lesson_type: lessonType,
      video_url: lessonVideoUrl,
      duration: lessonDuration,
      order: parseInt(lessonOrder),
      is_preview: lessonPreview
    };

    try {
      if (lessonModalType === "create") {
        await api.post("/api/courses/lessons/create/", payload);
      } else {
        await api.patch(`/api/courses/lessons/${selectedLessonId}/update/`, payload);
      }
      setShowLessonModal(false);
      await fetchCourseAndSyllabus();
    } catch (err) {
      console.error("Error submitting lesson:", err);
      setActionError(err.response?.data?.error || "Failed to save lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/api/courses/lessons/${lessonId}/delete/`);
      await fetchCourseAndSyllabus();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading syllabus blueprint...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Back Link */}
        <button 
          onClick={() => navigate("/mentor/courses")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Classes</span>
        </button>

        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Syllabus Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">{course?.title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage syllabus modules, lectures, and content orders</p>
          </div>
          <button 
            onClick={openModuleCreate}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <Plus size={14} />
            <span>Add Module</span>
          </button>
        </div>

        {/* Modules Modal Form */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-md animate-scale-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{moduleModalType === 'create' ? 'Add Syllabus Module' : 'Edit Module Blueprint'}</h3>
              {actionError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-semibold mb-4">
                  {actionError}
                </div>
              )}
              <form onSubmit={handleModuleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Module Title</label>
                  <input 
                    type="text" 
                    required 
                    value={moduleTitle} 
                    onChange={e => setModuleTitle(e.target.value)} 
                    placeholder="e.g. Chapter 1: Introduction to Mechanics" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea 
                    value={moduleDesc} 
                    onChange={e => setModuleDesc(e.target.value)} 
                    placeholder="Overview of syllabus subjects..." 
                    rows="3" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Module Order</label>
                  <input 
                    type="number" 
                    required 
                    value={moduleOrder} 
                    onChange={e => setModuleOrder(e.target.value)} 
                    placeholder="e.g. 1" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold">{isSubmitting ? "Submitting..." : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lessons Modal Form */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-md animate-scale-up overflow-y-auto max-h-[90vh]">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{lessonModalType === 'create' ? 'Add Lecture Lesson' : 'Edit Lesson Materials'}</h3>
              {actionError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-semibold mb-4">
                  {actionError}
                </div>
              )}
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lesson Title</label>
                  <input 
                    type="text" 
                    required 
                    value={lessonTitle} 
                    onChange={e => setLessonTitle(e.target.value)} 
                    placeholder="e.g. 1.1 Newtonian Motion" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea 
                    value={lessonDesc} 
                    onChange={e => setLessonDesc(e.target.value)} 
                    placeholder="Overview of lecture topics..." 
                    rows="3" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lesson Type</label>
                    <select 
                      value={lessonType} 
                      onChange={e => setLessonType(e.target.value)} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="video">Video Lecture</option>
                      <option value="pdf">Document / PDF</option>
                      <option value="quiz">Interactive Quiz</option>
                      <option value="assignment">Homework Assignment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                    <input 
                      type="text" 
                      required 
                      value={lessonDuration} 
                      onChange={e => setLessonDuration(e.target.value)} 
                      placeholder="e.g. 15 mins" 
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Video Streaming URL (Optional)</label>
                  <input 
                    type="url" 
                    value={lessonVideoUrl} 
                    onChange={e => setLessonVideoUrl(e.target.value)} 
                    placeholder="e.g. https://youtube.com/watch?v=..." 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Order Index</label>
                    <input 
                      type="number" 
                      required 
                      value={lessonOrder} 
                      onChange={e => setLessonOrder(e.target.value)} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox" 
                      id="isPreview" 
                      checked={lessonPreview} 
                      onChange={e => setLessonPreview(e.target.checked)} 
                      className="rounded text-indigo-600 focus:ring-indigo-500" 
                    />
                    <label htmlFor="isPreview" className="text-xs font-bold text-slate-600 cursor-pointer">Preview Lesson</label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" onClick={() => setShowLessonModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold">{isSubmitting ? "Submitting..." : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modules & Lessons List rendering */}
        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Syllabus Modules</h3>
              <p className="text-xs text-slate-400 mt-1">Get started by creating your first course modules above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, index) => {
                const lessons = lessonsMap[mod.id] || [];
                return (
                  <div key={mod.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                    {/* Module header */}
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Module {mod.order}</span>
                        <h4 className="text-sm font-bold text-slate-700 mt-0.5">{mod.title}</h4>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => openLessonCreate(mod.id)} 
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          Add Lesson
                        </button>
                        <button 
                          onClick={() => openModuleEdit(mod)} 
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition"
                          title="Edit module settings"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleModuleDelete(mod.id)} 
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition"
                          title="Delete module"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Module lessons */}
                    <div className="divide-y divide-slate-100">
                      {lessons.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">No lessons added to this module.</div>
                      ) : (
                        lessons.map((les) => (
                          <div 
                            key={les.id} 
                            className="px-6 py-4 flex justify-between items-center hover:bg-slate-50/40 transition group"
                          >
                            <div 
                              onClick={() => handleOpenPreview(les)}
                              className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                            >
                              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Play size={14} className="fill-indigo-600" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition">{les.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                                  {les.duration} • {les.lesson_type} {les.is_preview && <span className="text-indigo-600 bg-indigo-50 border px-1 rounded font-bold lowercase">preview</span>}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openLessonEdit(les, mod.id)} 
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition"
                                title="Edit lesson"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleLessonDelete(les.id)} 
                                className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition"
                                title="Delete lesson"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
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

      {/* Lesson Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-2xl animate-scale-up overflow-y-auto max-h-[90vh] space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] font-extrabold tracking-wider bg-slate-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
                  Preview: {previewLesson.lesson_type || "Video lecture"}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{previewLesson.title}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Duration: {previewLesson.duration || "N/A"}</p>
              </div>
              <button 
                onClick={() => setPreviewLesson(null)} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {/* Video Player */}
            {previewLesson.video_url && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200/50">
                {getEmbedUrl(previewLesson.video_url) ? (
                  <iframe 
                    src={getEmbedUrl(previewLesson.video_url)} 
                    title={previewLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">Invalid Video URL</div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
                {previewLesson.description || "No description provided for this lesson."}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments & Shared Files</h4>
              {isLoadingPreview ? (
                <div className="flex items-center justify-center p-6">
                  <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : previewResources.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">No resource files attached to this lesson.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previewResources.map((res) => {
                    const downloadUrl = res.file 
                      ? `http://127.0.0.1:8000${res.file}` 
                      : res.external_url;

                    return (
                      <div key={res.id} className="border border-slate-100 rounded-xl p-3 flex justify-between items-center gap-4 bg-white hover:border-slate-200 transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 truncate">{res.title}</span>
                        </div>
                        {downloadUrl && (
                          <a 
                            href={downloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-slate-50 hover:bg-indigo-50 text-[10px] font-bold text-indigo-600 transition"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
