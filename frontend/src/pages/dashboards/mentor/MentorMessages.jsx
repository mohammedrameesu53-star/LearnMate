import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function MentorMessages() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        {/* Conversations list */}
        <div className="border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Student Chats</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[
              { name: "Marcus Wright", snippet: "Yes, I will submit the DL lab shortly.", initials: "MW" },
              { name: "Julianne V.", snippet: "Thanks, the time dilation guide helped!", initials: "JV" }
            ].map((chat, i) => (
              <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition ${i === 0 ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {chat.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-700 truncate">{chat.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation detail */}
        <div className="md:col-span-2 flex flex-col justify-between bg-slate-50/10">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-bold text-slate-800">Marcus Wright</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-800 text-xs shadow-sm">
                Hi Sarah, I ran into some issues installing PyTorch on my local machine, which is why Module 4 is late.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[70%] p-3.5 rounded-2xl bg-indigo-600 text-white text-xs shadow-md leading-normal">
                Hi Marcus, please use Google Colab for this lab to avoid machine dependency problems! Let me know if you need assistance.
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none" />
            <button className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer">Send</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
