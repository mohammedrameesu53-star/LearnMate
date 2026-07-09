import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Send, MessageSquare, Search, AlertCircle, Circle, Loader2 } from 'lucide-react';

export default function ChatComponent() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Real-time statuses
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Refs for WebSockets and timeouts
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  // Fetch all chat rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const response = await api.get('/api/chat/rooms/');
        setRooms(response.data || []);
        // Automatically set the first room as active if available
        if (response.data && response.data.length > 0) {
          setActiveRoom(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load conversations.');
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch message history and initialize WebSocket when activeRoom changes
  useEffect(() => {
    if (!activeRoom) return;

    const roomId = activeRoom.id;

    // 1. Fetch message history from REST API
    const fetchHistory = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await api.get(`/api/chat/rooms/${roomId}/messages/`);
        setMessages(response.data || []);
        // Mark messages in the room as read
        await api.patch(`/api/chat/rooms/${roomId}/read/`);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchHistory();

    // 2. Initialize WebSocket Connection
    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to room ${roomId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.message_data) {
          const newMsg = data.message_data;
          
          // Append new message if it belongs to the active room
          if (Number(newMsg.room_id) === Number(roomId)) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Mark message read locally & on backend
            api.patch(`/api/chat/rooms/${roomId}/read/`).catch(err => {
              console.warn("Could not mark message read on backend", err);
            });
          }

          // Update room list's last message and sorting
          setRooms((prevRooms) => {
            return prevRooms
              .map((r) => {
                if (Number(r.id) === Number(newMsg.room_id)) {
                  return {
                    ...r,
                    last_message: newMsg.message,
                    updated_at: newMsg.created_at,
                  };
                }
                return r;
              })
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
          });

        } else if (data.type === 'typing') {
          // Verify typing user is not ourselves
          if (data.user && data.user !== user?.email) {
            setTypingUser(data.user);
            
            // Auto-clear typing indicator after 3 seconds of inactivity
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
            }, 3000);
          }
        } else if (data.type === 'user_online') {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.add(data.user);
            return next;
          });
        } else if (data.type === 'user_offline') {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.user);
            return next;
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message payload:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket connection closed for room ${roomId}`, event.reason);
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };

    // Cleanup on unmount or activeRoom change
    return () => {
      if (ws) ws.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTypingUser(null);
    };
  }, [activeRoom, user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // Handle typing key presses
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Send outbound typing indicator to WS server (throttled to every 2 seconds)
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const now = Date.now();
      if (now - lastTypingSentRef.current > 2000) {
        socketRef.current.send(
          JSON.stringify({
            type: 'typing',
          })
        );
        lastTypingSentRef.current = now;
      }
    }
  };

  // Submit outbound message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'message',
          message: messageInput,
        })
      );
      setMessageInput('');
    } else {
      console.error('WebSocket is closed. Cannot send message.');
      setError('Connection is offline. Please select a chat or refresh.');
    }
  };

  // Helper: Get target user details (student vs mentor in room)
  const getTargetUser = (room) => {
    if (!room || !user) return { email: 'User', role: '' };
    return user.role === 'student' ? room.mentor : room.student;
  };

  // Helper: Render display name of target user
  const getUserDisplayName = (target) => {
    if (!target || !target.email) return 'User';
    return target.email.split('@')[0];
  };

  // Helper: Get initials for avatar fallback
  const getUserInitials = (target) => {
    const name = getUserDisplayName(target);
    return name.slice(0, 2).toUpperCase();
  };

  // Filtered rooms list by search query
  const filteredRooms = rooms.filter((room) => {
    const target = getTargetUser(room);
    return target.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div 
      style={{ height: 'calc(100vh - 12rem)', minHeight: '450px' }} 
      className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden select-none"
    >
      {/* Rooms Sidebar */}
      <div className="border-r border-slate-100 flex flex-col h-full bg-slate-50/10 overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Direct Messages</h3>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white transition"
            />
          </div>
        </div>

        {/* List of rooms */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center p-8 gap-2">
              <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Loading chats...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center p-8 space-y-2">
              <MessageSquare className="mx-auto text-slate-300" size={24} />
              <p className="text-xs text-slate-400 font-medium">No conversations found</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const target = getTargetUser(room);
              const isSelected = activeRoom?.id === room.id;
              const isOnline = onlineUsers.has(target.email);

              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/60 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  {/* Avatar wrapper with status badge */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100/60 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {getUserInitials(target)}
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 truncate capitalize">
                        {getUserDisplayName(target)}
                      </h4>
                      <span className="text-[9px] text-slate-400">
                        {room.updated_at ? new Date(room.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                      {room.last_message || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-50/20 overflow-hidden">
        {activeRoom ? (
          <>
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100/60 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {getUserInitials(getTargetUser(activeRoom))}
                  </div>
                  {onlineUsers.has(getTargetUser(activeRoom).email) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 capitalize">
                    {getUserDisplayName(getTargetUser(activeRoom))}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {getTargetUser(activeRoom).role}
                  </p>
                </div>
              </div>

              {/* Status display */}
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                {onlineUsers.has(getTargetUser(activeRoom).email) ? (
                  <>
                    <Circle className="fill-emerald-500 text-emerald-500" size={6} />
                    <span className="text-emerald-600 font-bold">Online</span>
                  </>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <MessageSquare size={32} className="stroke-1" />
                  <p className="text-xs font-semibold">Say hello! No messages yet.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const msgSenderEmail = typeof msg.sender === 'object' ? msg.sender?.email : msg.sender_email;
                  const isMe = msgSenderEmail === user?.email;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className="flex flex-col space-y-1 max-w-[70%]">
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-normal font-medium shadow-sm border ${
                            isMe
                              ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                              : 'bg-white text-slate-800 border-slate-200/80 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className={`text-[9px] text-slate-400 font-semibold px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe 
                            ? `You` 
                            : `${getUserDisplayName(getTargetUser(activeRoom))} (${getTargetUser(activeRoom).role})`
                          }
                          {msg.created_at ? ` • ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {typingUser && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex items-center gap-2 max-w-[70%] p-3.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-none text-slate-500 text-xs shadow-sm">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-3 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={`Message @${getUserDisplayName(getTargetUser(activeRoom))}...`}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 p-8 text-center">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
              <MessageSquare size={28} />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No Chat Selected</h3>
              <p className="text-xs text-slate-400 font-medium">Choose a connection from the left pane to begin messaging in real-time.</p>
            </div>
          </div>
        )}

        {/* Global connection status / error popover */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg max-w-sm animate-fade-in">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span className="text-[11px] font-semibold flex-1 leading-snug">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 text-xs font-bold font-mono">×</button>
          </div>
        )}
      </div>
    </div>
  );
}
