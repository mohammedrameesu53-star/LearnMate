import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  Send, 
  MessageSquare, 
  Search, 
  AlertCircle, 
  Circle, 
  Loader2, 
  Plus, 
  Users, 
  X,
  User
} from 'lucide-react';

export default function ChatComponent() {
  const { user } = useAuth();
  
  // Tab control: 'direct' or 'group'
  const [chatType, setChatType] = useState('direct');
  
  // Direct Messages state
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  
  // Cohorts / Group chats state
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Shared chat content state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Real-time direct chat transient statuses
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Modal State for New Group Creation (Admins & Mentors)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('student_batch'); // 'student_batch' or 'mentor_group'
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Refs for WebSockets and UI triggers
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  // Fetch lists for Sidebar depending on selected Tab
  useEffect(() => {
    const fetchSidebarData = async () => {
      setIsLoadingSidebar(true);
      setError(null);
      try {
        if (chatType === 'direct') {
          const response = await api.get('/api/chat/rooms/');
          const roomsData = response.data || [];
          setRooms(roomsData);
          if (roomsData.length > 0) {
            setActiveRoom(roomsData[0]);
          } else {
            setActiveRoom(null);
          }
        } else {
          const response = await api.get('/api/chat/groups/');
          const groupsData = response.data || [];
          setGroups(groupsData);
          if (groupsData.length > 0) {
            setActiveGroup(groupsData[0]);
          } else {
            setActiveGroup(null);
          }
        }
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
        setError(`Failed to load ${chatType === 'direct' ? 'conversations' : 'groups'}.`);
      } finally {
        setIsLoadingSidebar(false);
      }
    };

    fetchSidebarData();
  }, [chatType]);

  // Cleanly isolate WebSocket initialization & message fetching in useEffect
  useEffect(() => {
    // Determine active parameters
    const targetId = chatType === 'direct' ? activeRoom?.id : activeGroup?.id;
    if (!targetId) {
      setMessages([]);
      return;
    }

    const token = localStorage.getItem('access_token');
    let ws = null;

    const initializeChatConnection = async () => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        // 1. Fetch historical message logs from HTTP REST endpoint
        if (chatType === 'direct') {
          const response = await api.get(`/api/chat/rooms/${targetId}/messages/`);
          setMessages(response.data || []);
          // Mark room messages as read on setup
          await api.patch(`/api/chat/rooms/${targetId}/read/`);
        } else {
          const response = await api.get(`/api/chat/groups/${targetId}/messages/`);
          setMessages(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching messages history:', err);
        setError('Failed to load message history.');
      } finally {
        setIsLoadingMessages(false);
      }

      // 2. Establish connection to WebSocket server using Native WebSockets
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      // Fallback/standard host is 127.0.0.1:8000 as per technical specs
      const wsHost = '127.0.0.1:8000';
      const wsUrl = chatType === 'direct'
        ? `${wsProtocol}://${wsHost}/ws/chat/${targetId}/?token=${token}`
        : `${wsProtocol}://${wsHost}/ws/group/${targetId}/?token=${token}`;

      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected to ${chatType} chat target ${targetId}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle incoming broadcasts
          if (data.message_data) {
            const newMsg = data.message_data;

            // Handle direct messages
            if (chatType === 'direct') {
              if (Number(newMsg.room_id) === Number(targetId)) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
                // Mark incoming message as read
                api.patch(`/api/chat/rooms/${targetId}/read/`).catch((err) => {
                  console.warn("Could not auto-mark room read on backend:", err);
                });
              }

              // Update room preview values inside Sidebar
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
            } else {
              // Handle group messages
              if (Number(newMsg.group_id) === Number(targetId)) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            }
          } else if (data.type === 'typing' && chatType === 'direct') {
            // Typing transient update
            if (data.user && data.user !== user?.email) {
              setTypingUser(data.user);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                setTypingUser(null);
              }, 3000);
            }
          } else if (data.type === 'user_online' && chatType === 'direct') {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.add(data.user);
              return next;
            });
          } else if (data.type === 'user_offline' && chatType === 'direct') {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.delete(data.user);
              return next;
            });
          }
        } catch (err) {
          console.error('Error handling WebSocket message stream data:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket connection closed for ${chatType} chat ${targetId}`, event.reason);
      };

      ws.onerror = (err) => {
        console.error(`WebSocket connection error for ${chatType} chat:`, err);
      };
    };

    initializeChatConnection();

    // Clean up completely on unmounts or active target alterations
    return () => {
      if (ws) ws.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTypingUser(null);
    };
  }, [chatType, activeRoom?.id, activeGroup?.id, user]);

  // Enforce automatic scroll layout jump to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // Handle direct typing notifications
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Send typing notice trigger (throttled to 2 seconds)
    if (chatType === 'direct' && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
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

  // Submit outbound message payload
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = chatType === 'direct'
        ? { type: 'message', message: messageInput }
        : { message: messageInput };
        
      socketRef.current.send(JSON.stringify(payload));
      setMessageInput('');
    } else {
      console.error('WebSocket connection is not active.');
      setError('Connection is offline. Please try re-selecting the chat.');
    }
  };

  // Create customized Group Cohort (Admins/Mentors Only)
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    try {
      const response = await api.post('/api/chat/groups/create/', {
        name: newGroupName,
        group_type: newGroupType,
      });
      const createdGroup = response.data;
      setGroups((prev) => [createdGroup, ...prev]);
      setActiveGroup(createdGroup);
      setNewGroupName('');
      setIsModalOpen(false);
      
      // Auto-toggle to Group chat tab to view the created group
      setChatType('group');
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError('Failed to create new cohort group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Helper: Get target user details (student/mentor/admin in direct rooms)
  const getTargetUser = (room) => {
    if (!room || !user) return { email: 'User', role: '' };
    return room.user1.email === user.email ? room.user2 : room.user1;
  };

  // Helper: Render display name of target user
  const getUserDisplayName = (target) => {
    if (!target || !target.email) return 'User';
    return target.email.split('@')[0];
  };

  // Helper: Get initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  // Filter lists inside Sidebar based on search input
  const filteredRooms = rooms.filter((room) => {
    const target = getTargetUser(room);
    return target.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{ height: 'calc(100vh - 12rem)', minHeight: '450px' }}
      className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden select-none relative"
    >
      {/* Left Column Navigation Sidebar */}
      <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/20 overflow-hidden">
        {/* Top Toggle Switch & Add Actions */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Toggle Swapper */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 w-fit">
              <button
                onClick={() => {
                  setChatType('direct');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  chatType === 'direct'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {user?.role === 'admin' ? 'Direct Chats' : 'Direct Messages'}
              </button>
              <button
                onClick={() => {
                  setChatType('group');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  chatType === 'group'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {user?.role === 'admin' ? 'Staff Cohorts' : 'Cohort Batches'}
              </button>
            </div>

            {/* Conditional creation button for Admins and Mentors */}
            {(user?.role === 'admin' || user?.role === 'mentor') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold shadow-xs transition cursor-pointer select-none"
              >
                <Plus size={12} />
                <span>{user?.role === 'admin' ? 'Create Group' : 'Create Batch'}</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder={`Search ${chatType === 'direct' ? 'chats' : 'groups'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded-xl text-[11px] outline-hidden focus:border-indigo-500 bg-white transition"
            />
          </div>
        </div>

        {/* Dynamic List Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSidebar ? (
            <div className="flex items-center justify-center p-8 gap-2">
              <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
              <span className="text-[11px] text-slate-400 font-semibold">Loading items...</span>
            </div>
          ) : chatType === 'direct' ? (
            // Direct chat lists
            filteredRooms.length === 0 ? (
              <div className="text-center p-8 space-y-1">
                <MessageSquare className="mx-auto text-slate-300" size={20} />
                <p className="text-[11px] text-slate-400 font-semibold">No direct rooms available</p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const target = getTargetUser(room);
                const isSelected = activeRoom?.id === room.id;
                const isOnline = onlineUsers.has(target.email);
                const displayName = getUserDisplayName(target);

                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-[11px] uppercase">
                        {getUserInitials(displayName)}
                      </div>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-slate-700 truncate capitalize">
                          {displayName}
                        </h4>
                        <span className="text-[8px] text-slate-400 font-medium">
                          {room.updated_at ? new Date(room.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                        {room.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            // Cohort/group chat lists
            filteredGroups.length === 0 ? (
              <div className="text-center p-8 space-y-1">
                <Users className="mx-auto text-slate-300" size={20} />
                <p className="text-[11px] text-slate-400 font-semibold">No group chats available</p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = activeGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-extrabold text-[11px] uppercase shrink-0">
                      {getUserInitials(group.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-700 truncate capitalize">
                        {group.name}
                      </h4>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        {group.group_type === 'mentor_group' ? 'Staff Room' : 'Batch Cohort'}
                      </span>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Right Column Timeline Panel */}
      <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-50/10 overflow-hidden">
        {((chatType === 'direct' && activeRoom) || (chatType === 'group' && activeGroup)) ? (
          <>
            {/* Header Area */}
            <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {chatType === 'direct' ? (
                  <>
                    <div className="relative">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-[11px] uppercase">
                        {getUserInitials(getUserDisplayName(getTargetUser(activeRoom)))}
                      </div>
                      {onlineUsers.has(getTargetUser(activeRoom).email) && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold text-slate-800 capitalize leading-tight">
                        {getUserDisplayName(getTargetUser(activeRoom))}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {getTargetUser(activeRoom).role || 'Member'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-[11px] uppercase">
                      {getUserInitials(activeGroup.name)}
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold text-slate-800 capitalize leading-tight">
                        {activeGroup.name}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {activeGroup.group_type === 'mentor_group' ? 'Staff Cohort' : 'Student Batch'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Status display element */}
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                {chatType === 'direct' ? (
                  onlineUsers.has(getTargetUser(activeRoom).email) ? (
                    <>
                      <Circle className="fill-emerald-500 text-emerald-500 animate-pulse" size={6} />
                      <span className="text-emerald-600 font-extrabold">Online</span>
                    </>
                  ) : (
                    <span>Offline</span>
                  )
                ) : (
                  <>
                    <Users size={12} />
                    <span>Cohort Chat</span>
                  </>
                )}
              </div>
            </div>

            {/* Messages box container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
                  <MessageSquare size={28} className="stroke-1 text-slate-300" />
                  <p className="text-[11px] font-bold text-slate-500">Welcome to the conversation!</p>
                  <p className="text-[10px] text-slate-400">Type a message below to start chatting.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine sender details
                  let senderEmail = '';
                  let senderRole = 'Member';
                  
                  if (typeof msg.sender === 'object' && msg.sender !== null) {
                    senderEmail = msg.sender.email || '';
                    senderRole = msg.sender.role || 'Member';
                  } else {
                    senderEmail = msg.sender_email || '';
                  }
                  
                  const isMe = senderEmail === user?.email;
                  const displayName = senderEmail ? senderEmail.split('@')[0] : 'User';

                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className="flex flex-col space-y-1 max-w-[70%]">
                        <div
                          className={`p-3.5 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-xs border ${
                            isMe
                              ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                              : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className={`text-[8px] text-slate-400 font-bold px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe ? 'You' : `${displayName} (${senderRole})`}
                          {msg.created_at ? ` • ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Transient Direct Typing indicators display */}
              {chatType === 'direct' && typingUser && (
                <div className="flex justify-start items-center gap-2">
                  <div className="flex items-center gap-1.5 p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold capitalize">{typingUser.split('@')[0]} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input action bar */}
            <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex gap-3 items-center shrink-0">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={
                  chatType === 'direct' 
                    ? `Message @${getUserDisplayName(getTargetUser(activeRoom))}...`
                    : `Message in #${activeGroup.name.toLowerCase()}...`
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-[11px] outline-hidden focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3 p-8 text-center">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <MessageSquare size={24} />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-[12px] font-bold text-slate-800">No Chat Selected</h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Choose an active direct chat room or cohort stream from the list to begin communicating.
              </p>
            </div>
          </div>
        )}

        {/* Global Connection / Error popover alerts */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg max-w-sm animate-fade-in z-40">
            <AlertCircle size={14} className="text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold flex-1 leading-snug">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 text-xs font-bold font-mono">×</button>
          </div>
        )}
      </div>

      {/* Cohort/Group Room Creation Modal (Mentors/Admins) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm border border-slate-100 mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Create Staff or Student Cohort</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewGroupName('');
                }}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Group / Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mentor Cohort A, Batch B"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[11px] outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Group Type</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] bg-white outline-hidden focus:border-indigo-500"
                >
                  <option value="student_batch">Student Batch (student_batch)</option>
                  <option value="mentor_group">Staff Mentor Group (mentor_group)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewGroupName('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-[11px] font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreatingGroup && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
