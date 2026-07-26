import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { AlertCircle } from "lucide-react";

export default function StudentContinueLearning() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNextLesson = async () => {
      try {
        const response = await api.get(`/api/courses/student/courses/${courseId}/continue/`);
        if (response.data.id) {
          navigate(`/student/courses/${courseId}/lessons/${response.data.id}`, { replace: true });
        } else {
          // No next lesson, course is fully completed
          navigate(`/student/courses/${courseId}`, { replace: true });
        }
      } catch (err) {
        console.error("Error finding next lesson:", err);
        setError("Failed to determine the next uncompleted lesson in this course.");
      }
    };

    if (courseId) {
      fetchNextLesson();
    }
  }, [courseId, navigate]);

  return (
    <DashboardLayout role="student" user={user}>
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        {error ? (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Finding where you left off...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
