import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Bot, Send } from "lucide-react";

export default function StudentAITutor() {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/dashboard/student/");
      if (response.data.ai_chat_messages) {
        setChatMessages(response.data.ai_chat_messages);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const input = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: input }]);

    try {
      const response = await api.post("/api/dashboard/student/ai-chat/", { text: input });
      setChatMessages(response.data);
    } catch (err) {
      console.error("Error sending AI chat:", err);
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
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        {/* AI Tutor Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">LearnMate AI Tutor</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Active & Listening
            </span>
          </div>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100' : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Console */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your AI Tutor about relativity, quantum mechanics..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button type="submit" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition cursor-pointer flex items-center gap-2">
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
