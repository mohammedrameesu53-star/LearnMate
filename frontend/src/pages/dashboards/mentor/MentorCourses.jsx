import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function MentorCourses() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Assigned Classes</h2>
          <p className="text-sm text-slate-500 font-medium">Courses you supervise or moderate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: "Deep Learning Frameworks", students: 18, pending: 8 },
            { name: "Advanced Algorithm Design", students: 14, pending: 6 },
            { name: "Ethical AI Foundations", students: 10, pending: 4 }
          ].map((c, i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Supervising role • Autumn Semester</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mentees</span>
                  <p className="text-base font-extrabold text-slate-700">{c.students} Students</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Review</span>
                  <p className="text-base font-extrabold text-rose-500">{c.pending} Tasks</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
