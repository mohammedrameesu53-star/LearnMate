import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { ArrowLeft, Users, ChevronRight, AlertCircle, Calendar } from "lucide-react";

export default function CourseStudents() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/courses/mentor/courses/${courseId}/students/`);
      setStudents(res.data || []);
    } catch (err) {
      console.error("Error loading course students roster:", err);
      setError("Failed to fetch students roster.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <DashboardLayout role="mentor" user={user}>
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading student roster...</p>
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

        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Enrolled Students</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Audit student learning profiles, timelines, and task submissions</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0 shadow-sm">
            <Users size={18} />
          </div>
        </div>

        {/* Student list */}
        {students.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Mentees Enrolled</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No student has registered for this course yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Enrolled Date</th>
                    <th className="px-6 py-4 text-center">Progress Percentage</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                  {students.map((enrollment) => (
                    <tr key={enrollment.student_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{enrollment.student_name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{enrollment.email}</td>
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{enrollment.progress}%</span>
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mx-auto mt-1">
                          <div className="bg-indigo-600 dark:bg-indigo-500 h-full" style={{ width: `${enrollment.progress}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border
                          ${enrollment.completed 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' 
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60'}`}>
                          {enrollment.completed ? "COMPLETED" : "IN PROGRESS"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(`/mentor/courses/${courseId}/students/${enrollment.student_id}`)}
                          className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 rounded-lg transition text-[10px] font-bold cursor-pointer"
                        >
                          View Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
