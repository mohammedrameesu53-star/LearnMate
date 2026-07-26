import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, FolderOpen, FileText, AlertCircle, Download } from "lucide-react";

export default function AdminResources() {
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

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/api/courses/");
      const data = res.data || [];
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading admin courses roster:", err);
      setError("Failed to fetch course listing.");
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

  if (isLoading) {
    return (
      <DashboardLayout role="admin" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading resources audit explorer...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Resources Header Panel */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Resource File Explorer</h2>
            <p className="text-sm text-slate-500 font-medium">Browse and audit uploaded course lesson files across the platform</p>
          </div>

          {/* Filtering Dropdown roster */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course Catalog</label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                {courses.length === 0 ? (
                  <option value="">No courses published</option>
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

        {/* Resources list rendering */}
        {isLoadingContent ? (
          <div className="flex items-center justify-center p-12 min-h-[150px]">
            <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !selectedLessonId ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 font-medium">Select a Lesson</h3>
            <p className="text-xs text-slate-400 mt-1">Navigate to a specific lecture above to audit files.</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-semibold">No resource files attached to this lesson.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((res) => {
              const downloadUrl = res.file 
                ? `http://127.0.0.1:8000${res.file}` 
                : res.external_url;

              return (
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
                  
                  {downloadUrl && (
                    <a 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
