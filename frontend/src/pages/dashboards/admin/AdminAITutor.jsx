import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Bot, Send, ShieldAlert, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AdminAITutor() {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom of chat window
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatMessages]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("learnmate_admin_ai_chat_history");
    if (savedHistory) {
      try {
        setChatMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing admin chat history:", e);
        setChatMessages([
          {
            sender: "ai",
            text: "👋 Hello! I'm your LearnMate Admin Assistant. I can assist you with system metrics, token budgets, account management queries, or model configuration analysis.",
          },
        ]);
      }
    } else {
      setChatMessages([
        {
          sender: "ai",
          text: "👋 Hello! I'm your LearnMate Admin Assistant. I can assist you with system metrics, token budgets, account management queries, or model configuration analysis.",
        },
      ]);
    }
  }, []);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const message = chatInput;
    setChatInput("");

    const updatedMessages = [
      ...chatMessages,
      {
        sender: "user",
        text: message,
      },
    ];

    setChatMessages([
      ...updatedMessages,
      {
        sender: "ai",
        text: "Thinking...",
        loading: true,
      },
    ]);
    setChatLoading(true);

    try {
      const response = await api.post("/api/ai/chat/", {
        message,
      });

      const aiReply = response.data.response;
      const finalMessages = [
        ...updatedMessages,
        {
          sender: "ai",
          text: aiReply,
        },
      ];

      setChatMessages(finalMessages);
      localStorage.setItem("learnmate_admin_ai_chat_history", JSON.stringify(finalMessages));
    } catch (error) {
      console.error("Error in Admin chatbot call:", error);
      const finalMessages = [
        ...updatedMessages,
        {
          sender: "ai",
          text: "Sorry, I ran into an error connecting to the system admin chatbot. Please try again.",
        },
      ];
      setChatMessages(finalMessages);
      localStorage.setItem("learnmate_admin_ai_chat_history", JSON.stringify(finalMessages));
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const defaultChat = [
        {
          sender: "ai",
          text: "👋 Hello! I'm your LearnMate Admin Assistant. I can assist you with system metrics, token budgets, account management queries, or model configuration analysis.",
        },
      ];
      setChatMessages(defaultChat);
      localStorage.setItem("learnmate_admin_ai_chat_history", JSON.stringify(defaultChat));
    }
  };

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">AI Admin Assistant</h3>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                <Sparkles size={10} className="animate-pulse" />
                Groq Engine Connected
              </span>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
          >
            Clear History
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100' : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm'}`}>
                {msg.loading ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-5 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-5 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      code: ({ children }) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>,
                      pre: ({ children }) => <pre className="bg-slate-100 p-3 rounded-lg overflow-x-auto my-2 font-mono text-xs">{children}</pre>
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Chat form */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Admin Assistant about token usage, system configurations, limits..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            disabled={chatLoading}
          />
          <button 
            type="submit" 
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition cursor-pointer flex items-center gap-2 disabled:bg-indigo-400"
            disabled={chatLoading}
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
