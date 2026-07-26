import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Plus, Edit2, Trash2, Check, Globe, EyeOff, AlertCircle, BookOpen } from "lucide-react";

export default function MentorCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals / Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState("create"); // "create" or "edit"
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [courseDuration, setCourseDuration] = useState("");

  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/api/courses/my-courses/");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error loading mentor courses:", err);
      setError("Failed to fetch supervised courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setFormType("create");
    setSelectedCourseId(null);
    setCourseTitle("");
    setCourseDesc("");
    setCourseLevel("beginner");
    setCourseDuration("");
    setActionError("");
    setShowFormModal(true);
  };

  const openEditModal = (course) => {
    setFormType("edit");
    setSelectedCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseLevel(course.level || "beginner");
    setCourseDuration(course.duration || "");
    setActionError("");
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDuration.trim()) {
      setActionError("Title and Duration are required.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    const payload = {
      title: courseTitle,
      description: courseDesc,
      level: courseLevel,
      duration: courseDuration
    };

    try {
      if (formType === "create") {
        await api.post("/api/courses/create/", payload);
      } else {
        await api.put(`/api/courses/${selectedCourseId}/update/`, payload);
      }
      setShowFormModal(false);
      await fetchCourses();
    } catch (err) {
      console.error("Error submitting course form:", err);
      setActionError(err.response?.data?.error || "Failed to submit course data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course and all its modules?")) return;
    try {
      await api.delete(`/api/courses/${courseId}/delete/`);
      await fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. You might need to clean up modules first.");
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      if (currentStatus === "published") {
        await api.patch(`/api/courses/${courseId}/unpublish/`);
      } else {
        await api.patch(`/api/courses/${courseId}/publish/`);
      }
      await fetchCourses();
    } catch (err) {
      console.error("Error toggling publish state:", err);
      alert(err.response?.data?.error || "Failed to toggle publish status.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading course manager...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
            <button onClick={fetchCourses} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Your Coordinated Courses</h2>
            <p className="text-sm text-slate-500 font-medium">Create, edit, coordinate, and publish syllabus files</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Create Course</span>
          </button>
        </div>

        {/* Modal form */}
        {showFormModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-md animate-scale-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{formType === 'create' ? 'Create New Course' : 'Edit Course Settings'}</h3>
              {actionError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-semibold mb-4">
                  {actionError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Course Title</label>
                  <input 
                    type="text" 
                    required 
                    value={courseTitle} 
                    onChange={e => setCourseTitle(e.target.value)} 
                    placeholder="e.g. Introduction to Quantum Physics" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea 
                    value={courseDesc} 
                    onChange={e => setCourseDesc(e.target.value)} 
                    placeholder="Provide a detailed syllabus overview..." 
                    rows="3" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Level</label>
                    <select 
                      value={courseLevel} 
                      onChange={e => setCourseLevel(e.target.value)} 
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                    <input 
                      type="text" 
                      required 
                      value={courseDuration} 
                      onChange={e => setCourseDuration(e.target.value)} 
                      placeholder="e.g. 8 weeks" 
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold">{isSubmitting ? "Submitting..." : formType === 'create' ? "Create" : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses list */}
        {courses.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Coordinated Courses</h3>
            <p className="text-xs text-slate-400 mt-1">Click the button above to launch your first class catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => (
              <div 
                key={c.id} 
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-extrabold tracking-wider bg-slate-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-md uppercase">
                      {c.level || "Beginner"}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => openEditModal(c)} 
                        className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                        title="Edit course settings"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {c.description || "No description provided."}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Estimated Duration: {c.duration}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handlePublishToggle(c.id, c.status)}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer 
                      ${c.status === 'published' 
                        ? 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-600' 
                        : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-600'}`}
                  >
                    {c.status === 'published' ? (
                      <>
                        <EyeOff size={14} />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Globe size={14} />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => navigate(`/mentor/courses/${c.id}/students`)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40 text-xs font-bold transition cursor-pointer text-center"
                  >
                    Mentees
                  </button>

                  <button 
                    onClick={() => navigate(`/mentor/courses/${c.id}/syllabus`)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-indigo-55 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold transition cursor-pointer text-center"
                  >
                    Syllabus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
