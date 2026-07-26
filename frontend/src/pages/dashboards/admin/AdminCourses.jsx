import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { BookOpen, AlertCircle, Calendar } from "lucide-react";

export default function AdminCourses() {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/api/courses/");
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses for admin catalog:", err);
      setError("Failed to fetch platform course catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="admin" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading course catalog...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" user={user}>
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

        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Platform Catalog Courses</h2>
          <p className="text-sm text-slate-500 font-medium">Audit all active courses published across the platform</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Courses Published</h3>
            <p className="text-xs text-slate-400 mt-1">There are no published courses currently active on the platform.</p>
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
                      {c.level || "Beginner"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {c.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {c.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Class Active
                  </span>
                  <span className="text-emerald-600">Published</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
