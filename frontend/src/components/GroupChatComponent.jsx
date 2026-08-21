import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Send, MessageSquare, Search, AlertCircle, Loader2, Plus, Users, X } from 'lucide-react';

export default function GroupChatComponent() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Modal State for New Group Creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Refs for WebSockets and scrolling
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch group chats on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await api.get('/api/chat/groups/');
        setGroups(response.data || []);
        if (response.data && response.data.length > 0) {
          setActiveGroup(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching group chats:', err);
        setError('Failed to load group conversations.');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // Handle group switching & WebSockets logic
  useEffect(() => {
    if (!activeGroup) return;

    const groupId = activeGroup.id;

    // 1. Fetch message history
    const fetchHistory = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await api.get(`/api/chat/groups/${groupId}/messages/`);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Error fetching group message history:', err);
        setError('Failed to load chat history.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchHistory();

    // 2. Setup WebSocket connection
    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://localhost:8000/ws/group/${groupId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to group chat ${groupId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message_data) {
          const newMsg = data.message_data;
          // Verify that this message belongs to the current group
          if (Number(newMsg.group_id) === Number(groupId)) {
            setMessages((prev) => {
              // Avoid duplicate additions
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      } catch (err) {
        console.error('Error handling websocket message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket connection closed for group chat ${groupId}`, event.reason);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // Cleanup: close connection on route/room change or unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [activeGroup]);

  // Smooth scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send outbound WebSocket message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: messageInput,
        })
      );
      setMessageInput('');
    } else {
      console.error('WebSocket connection is not active.');
      setError('Connection is offline. Please try re-selecting the group chat.');
    }
  };

  // Create new Group Chat (Mentors only)
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    try {
      const response = await api.post('/api/chat/groups/create/', {
        name: newGroupName,
      });
      const createdGroup = response.data;
      setGroups((prev) => [createdGroup, ...prev]);
      setActiveGroup(createdGroup);
      setNewGroupName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError('Failed to create new cohort group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Filter groups according to search input
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to format initials for Group Avatars
  const getGroupInitials = (name) => {
    if (!name) return 'GP';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      style={{ height: 'calc(100vh - 12rem)', minHeight: '450px' }}
      className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden select-none relative transition-colors duration-200"
    >
      {/* Groups Sidebar */}
      <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/10 dark:bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Cohort Groups</h3>
            {user?.role === 'mentor' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition cursor-pointer"
              >
                <Plus size={10} />
                <span>New Batch</span>
              </button>
            )}
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
            />
          </div>
        </div>

        {/* List of groups */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingGroups ? (
            <div className="flex items-center justify-center p-8 gap-2">
              <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading groups...</span>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center p-8 space-y-2">
              <Users className="mx-auto text-slate-300 dark:text-slate-600" size={24} />
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No cohort groups found</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isSelected = activeGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-800/60 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs select-none">
                    {getGroupInitials(group.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate capitalize">
                      {group.name}
                    </h4>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider block mt-0.5">
                      {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Timeline Area */}
      <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-50/20 dark:bg-slate-950/40 overflow-hidden">
        {activeGroup ? (
          <>
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100/60 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {getGroupInitials(activeGroup.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {activeGroup.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    Group Room Chat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                <Users size={12} />
                <span>Cohort View</span>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2">
                  <MessageSquare size={32} className="stroke-1 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Welcome to the Cohort! Send a message to start.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?.email === user?.email;
                  const senderName = msg.sender?.email ? msg.sender.email.split('@')[0] : 'User';
                  const senderRole = msg.sender?.role || 'student';

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
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className={`text-[9px] text-slate-400 dark:text-slate-500 font-semibold px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe ? 'You' : `${senderName} (${senderRole})`}
                          {msg.created_at ? ` • ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message in #${activeGroup.name.toLowerCase()}...`}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 p-8 text-center">
            <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center shadow-inner">
              <Users size={28} />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Cohort Selected</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Select one of your cohort channels from the sidebar list to see the timeline.</p>
            </div>
          </div>
        )}

        {/* Global Connection / Error Popover */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg max-w-sm animate-fade-in">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span className="text-[11px] font-semibold flex-1 leading-snug">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 text-xs font-bold font-mono">×</button>
          </div>
        )}
      </div>

      {/* Modal View for Creating a Cohort Group */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800 mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Create New Cohort Group</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewGroupName('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Group Name / Batch Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch A, Physics 101 Cohort"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewGroupName('');
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreatingGroup && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
