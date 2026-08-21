import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import { Bot, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MentorAITutor() {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatMessages]);

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("learnmate_mentor_ai_chat_history");
    if (savedHistory) {
      try {
        setChatMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing mentor chat history:", e);
        setChatMessages([
          {
            sender: "ai",
            text: "👋 Hello! I'm your LearnMate Mentor Assistant. I can help you draft course modules, design quizzes, review syllabus progress, or suggest interventions for struggling students.",
          },
        ]);
      }
    } else {
      setChatMessages([
        {
          sender: "ai",
          text: "👋 Hello! I'm your LearnMate Mentor Assistant. I can help you draft course modules, design quizzes, review syllabus progress, or suggest interventions for struggling students.",
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
      localStorage.setItem("learnmate_mentor_ai_chat_history", JSON.stringify(finalMessages));
    } catch (error) {
      console.error("Error from AI chatbot API:", error);
      const finalMessages = [
        ...updatedMessages,
        {
          sender: "ai",
          text: "Sorry, I encountered an error while trying to process your request. Please try again.",
        },
      ];
      setChatMessages(finalMessages);
      localStorage.setItem("learnmate_mentor_ai_chat_history", JSON.stringify(finalMessages));
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const defaultChat = [
        {
          sender: "ai",
          text: "👋 Hello! I'm your LearnMate Mentor Assistant. I can help you draft course modules, design quizzes, review syllabus progress, or suggest interventions for struggling students.",
        },
      ];
      setChatMessages(defaultChat);
      localStorage.setItem("learnmate_mentor_ai_chat_history", JSON.stringify(defaultChat));
    }
  };

  return (
    <DashboardLayout role="mentor" user={user}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">AI Teaching Assistant</h2>
          <p className="text-sm text-slate-500 font-medium">Interact with your AI assistant to generate class activities, draft syllabi, or prepare quizzes</p>
        </div>

        {/* Chatbot container */}
        <div className="h-[calc(100vh-16rem)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden min-h-[500px] transition-colors duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Mentor Assistant</h3>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  Groq Engine Connected
                </span>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              Clear History
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/30">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm'}`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-5 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-5 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ children }) => <code className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>,
                        pre: ({ children }) => <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg overflow-x-auto my-2 font-mono text-xs">{children}</pre>
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

          {/* Input form */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Mentor Assistant to draft course curriculum, design exercises..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

      </div>
    </DashboardLayout>
  );
}
