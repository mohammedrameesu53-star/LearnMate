import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { FileText, Download, AlertCircle, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";

export default function StudentResources() {
  const { user } = useAuth();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseContent, setCourseContent] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState("");

  const fetchEnrolledCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/courses/student/my-courses/");
      const data = response.data || [];
      setEnrolledCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].course.toString());
      }
    } catch (err) {
      console.error("Error loading enrolled courses for resources:", err);
      setError("Failed to fetch enrolled courses.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResourcesForCourse = async (courseId) => {
    if (!courseId) return;
    setIsLoadingContent(true);
    try {
      // 1. Fetch modules list for course
      const modulesRes = await api.get(`/api/courses/student/${courseId}/modules/`);
      const modules = modulesRes.data || [];

      // 2. Fetch lessons and their resources in parallel
      const contentList = await Promise.all(
        modules.map(async (mod) => {
          try {
            const lessonsRes = await api.get(`/api/courses/student/modules/${mod.id}/lessons/`);
            const lessons = lessonsRes.data || [];

            const lessonsWithResources = await Promise.all(
              lessons.map(async (les) => {
                try {
                  const resourcesRes = await api.get(`/api/courses/lessons/${les.id}/resources/`);
                  return {
                    ...les,
                    resources: resourcesRes.data || []
                  };
                } catch {
                  return { ...les, resources: [] };
                }
              })
            );

            return {
              ...mod,
              lessons: lessonsWithResources
            };
          } catch {
            return { ...mod, lessons: [] };
          }
        })
      );
      setCourseContent(contentList);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchResourcesForCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

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

  // Count all resources in loaded content
  const allResources = [];
  courseContent.forEach(mod => {
    mod.lessons.forEach(les => {
      les.resources.forEach(res => {
        allResources.push({
          ...res,
          lessonTitle: les.title,
          moduleTitle: mod.title
        });
      });
    });
  });

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Learning Resources</h2>
            <p className="text-sm text-slate-500 font-medium">Download textbooks, slides, and cheat sheets</p>
          </div>

          {/* Select Course dropdown */}
          {enrolledCourses.length > 0 && (
            <div className="w-full sm:w-72">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {enrolledCourses.map((c) => (
                  <option key={c.course} value={c.course}>
                    {c.course_title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Resources Content list */}
        {isLoadingContent ? (
          <div className="flex items-center justify-center p-12 min-h-[200px]">
            <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Courses Active</h3>
            <p className="text-xs text-slate-400 mt-1">Enroll in a course to view and download study resources.</p>
          </div>
        ) : allResources.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Shared Resources</h3>
            <p className="text-xs text-slate-400 mt-1">The mentor has not shared any files for this course yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allResources.map((res) => {
              // Construct direct file URL or external URL
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
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                        {res.lessonTitle} • {res.resource_type?.toUpperCase() || "FILE"}
                      </p>
                    </div>
                  </div>
                  {downloadUrl ? (
                    <a 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Download size={16} />
                    </a>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300 bg-slate-50 border px-2 py-1 rounded-md uppercase shrink-0">
                      Unavailable
                    </span>
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
