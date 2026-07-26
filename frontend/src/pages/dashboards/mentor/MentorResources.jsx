import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Upload, BookOpen, Trash2, AlertCircle, FolderOpen, FileText } from "lucide-react";

export default function MentorResources() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");

  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [resources, setResources] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState("");

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState("pdf");
  const [resFile, setResFile] = useState(null);
  const [resUrl, setResUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/api/courses/my-courses/");
      const data = res.data || [];
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading mentor courses:", err);
      setError("Failed to fetch supervised courses.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await api.get(`/api/courses/${courseId}/modules/`);
      const data = res.data || [];
      setModules(data);
      if (data.length > 0) {
        setSelectedModuleId(data[0].id.toString());
      } else {
        setModules([]);
        setSelectedModuleId("");
        setLessons([]);
        setSelectedLessonId("");
        setResources([]);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  const fetchLessons = async (moduleId) => {
    if (!moduleId) return;
    try {
      const res = await api.get(`/api/courses/modules/${moduleId}/lessons/`);
      const data = res.data || [];
      setLessons(data);
      if (data.length > 0) {
        setSelectedLessonId(data[0].id.toString());
      } else {
        setLessons([]);
        setSelectedLessonId("");
        setResources([]);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const fetchResources = async (lessonId) => {
    if (!lessonId) return;
    setIsLoadingContent(true);
    try {
      const res = await api.get(`/api/courses/lessons/${lessonId}/resources/`);
      setResources(res.data || []);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedModuleId) {
      fetchLessons(selectedModuleId);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedLessonId) {
      fetchResources(selectedLessonId);
    }
  }, [selectedLessonId]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      setActionError("Title is required.");
      return;
    }
    if (!resFile && !resUrl) {
      setActionError("Provide either a local file or external URL.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    const formData = new FormData();
    formData.append("title", resTitle);
    formData.append("resource_type", resType);
    if (resFile) {
      formData.append("file", resFile);
    }
    if (resUrl) {
      formData.append("external_url", resUrl);
    }

    try {
      await api.post(`/api/courses/lessons/${selectedLessonId}/resources/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setShowUploadModal(false);
      setResTitle("");
      setResFile(null);
      setResUrl("");
      await fetchResources(selectedLessonId);
    } catch (err) {
      console.error("Error uploading resource:", err);
      setActionError(err.response?.data?.error || "Failed to upload resource attachment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/api/courses/resources/${resId}/`);
      await fetchResources(selectedLessonId);
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading resources panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Resources Header Panel */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Shared Resource Files</h2>
              <p className="text-sm text-slate-500 font-medium">Attach slides, homework rubrics, and references to course lessons</p>
            </div>
            
            {selectedLessonId && (
              <button 
                onClick={() => { setActionError(""); setShowUploadModal(true); }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Upload size={14} />
                <span>Upload File</span>
              </button>
            )}
          </div>

          {/* Filtering Dropdown roster */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course</label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                {courses.length === 0 ? (
                  <option value="">No courses coordinated</option>
                ) : (
                  courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Module</label>
              <select
                value={selectedModuleId}
                onChange={e => setSelectedModuleId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                disabled={modules.length === 0}
              >
                {modules.length === 0 ? (
                  <option value="">No modules defined</option>
                ) : (
                  modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lesson</label>
              <select
                value={selectedLessonId}
                onChange={e => setSelectedLessonId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                disabled={lessons.length === 0}
              >
                {lessons.length === 0 ? (
                  <option value="">No lessons defined</option>
                ) : (
                  lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Upload Resource Overlay Form Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-md animate-scale-up">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Lesson Attachment</h3>
              {actionError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-semibold mb-4">
                  {actionError}
                </div>
              )}
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resource Title</label>
                  <input 
                    type="text" 
                    required 
                    value={resTitle} 
                    onChange={e => setResTitle(e.target.value)} 
                    placeholder="e.g. Lab Guide Chapter 3" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resource Type</label>
                    <select 
                      value={resType} 
                      onChange={e => setResType(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="pdf">PDF File</option>
                      <option value="document">Word/Document</option>
                      <option value="image">Image Asset</option>
                      <option value="zip">ZIP Package</option>
                      <option value="link">External URL Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attachment File</label>
                    <input 
                      type="file" 
                      onChange={e => setResFile(e.target.files[0])} 
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">External Link URL (Optional)</label>
                  <input 
                    type="url" 
                    value={resUrl} 
                    onChange={e => setResUrl(e.target.value)} 
                    placeholder="e.g. https://example.com/slide-deck" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold">{isSubmitting ? "Uploading..." : "Upload"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resources list rendering */}
        {isLoadingContent ? (
          <div className="flex items-center justify-center p-12 min-h-[150px]">
            <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !selectedLessonId ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 font-medium">Select a Lesson</h3>
            <p className="text-xs text-slate-400 mt-1">Navigate to a specific lecture above to audit and manage shared resource attachments.</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-semibold">No resource files attached to this lesson yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((res) => (
              <div 
                key={res.id} 
                className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 truncate">{res.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">
                      {res.resource_type || "File attachment"}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(res.id)}
                  className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
