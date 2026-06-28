import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import { Upload, BookOpen, Download } from "lucide-react";

export default function MentorResources() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Shared Resource Files</h2>
            <p className="text-sm text-slate-500 font-medium">Upload slides, code frameworks, and manuals for students</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Upload size={14} />
            <span>Upload File</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: "Deep Learning Lab 4 Template", size: "1.2 MB", course: "Deep Learning Frameworks" },
            { name: "Algorithm Capstone Rubric", size: "450 KB", course: "Advanced Algorithm Design" }
          ].map((res, i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">{res.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{res.course} • {res.size}</p>
                </div>
              </div>
              <button className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition cursor-pointer">
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
