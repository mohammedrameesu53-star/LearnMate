import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import { Bot, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LessonAIChat({ courseId, lessonId, lessonTitle }) {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: `👋 Ask me anything about **${lessonTitle || "this lesson"}** — I'll answer using the actual course content.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const question = input;
        setInput("");

        const updated = [...messages, { sender: "user", text: question }];
        setMessages([...updated, { sender: "ai", text: "Thinking...", loading: true }]);
        setIsLoading(true);

        try {
            const response = await api.post("/api/ai/chat/", {
                message: question,
                course_id: courseId,
                lesson_id: lessonId,
            });

            setMessages([...updated, { sender: "ai", text: response.data.response }]);
        } catch (err) {
            console.error("Error asking lesson AI:", err);
            setMessages([
                ...updated,
                { sender: "ai", text: "Sorry, I couldn't reach the AI Tutor right now. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[420px]">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Bot size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">Ask AI About This Lesson</h4>
                    <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                        <Sparkles size={9} /> Grounded in course content
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === "user"
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none"
                                }`}
                        >
                            {msg.loading ? (
                                <div className="flex items-center gap-1.5 py-0.5">
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-1.5">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-1.5">{children}</ol>,
                                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
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

            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this lesson..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer disabled:bg-indigo-400 flex items-center gap-1.5"
                >
                    <Send size={13} />
                </button>
            </form>
        </div>
    );
}
