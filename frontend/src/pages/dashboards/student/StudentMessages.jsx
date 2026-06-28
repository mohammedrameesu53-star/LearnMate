import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";

export default function StudentMessages() {
  const { user } = useAuth();
  const [messagesList, setMessagesList] = useState([]);
  const [activeMessageText, setActiveMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/dashboard/student/");
      if (response.data.messages) {
        setMessagesList(response.data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeMessageText.trim()) return;
    const text = activeMessageText;
    setActiveMessageText("");

    try {
      const response = await api.post("/api/dashboard/student/messages/", { text });
      setMessagesList(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

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

  return (
    <DashboardLayout role="student" user={user}>
      <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        {/* Active Chats Sidebar */}
        <div className="border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/20">
            <h3 className="text-sm font-bold text-slate-800">Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[
              { name: "Dr. Sarah Chen", desc: messagesList.length > 0 ? messagesList[messagesList.length - 1].text : "No messages", unread: true, initials: "SC" }
            ].map((chat, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition bg-indigo-50/50">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {chat.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 truncate">{chat.name}</h4>
                    {chat.unread && <span className="h-2 w-2 bg-rose-500 rounded-full shrink-0"></span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Board Area */}
        <div className="md:col-span-2 flex flex-col justify-between bg-slate-50/10">
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">SC</div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Dr. Sarah Chen</h3>
              <p className="text-[10px] text-slate-400 font-medium">Active 12m ago</p>
            </div>
          </div>

          {/* Msg Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messagesList.map((msg, idx) => (
              <div key={idx} className="flex justify-start">
                <div className="max-w-[70%] p-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-800 text-xs shadow-sm leading-normal">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Msg Input console */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <input
              type="text"
              value={activeMessageText}
              onChange={(e) => setActiveMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
            />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer">
              Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
