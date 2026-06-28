import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function MentorAITutor() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">AI Diagnostic Console</h2>
          <p className="text-sm text-slate-500 font-medium">AI monitoring of student learning hurdles and progression</p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Intervention Indicators</h3>
          <div className="space-y-4">
            {[
              { name: "Marcus Wright", reason: "Weakness in neural net math calculations, repeatedly fails backprop test quiz.", priority: "High" },
              { name: "Leila Jahani", reason: "Inactivity block for 5 days. Suggested action: Check-in sync.", priority: "Medium" }
            ].map((ind, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 flex items-start gap-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${ind.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {ind.priority[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">{ind.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ind.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
