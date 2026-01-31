"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Search, MoreHorizontal, LogOut, RefreshCw, Eye, Home, Signal, MessageSquare, Users, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { 
  getCurrentMode, 
  Signal, 
  getSignals,
  getSignalChat,
  getSignalMessages,
  createSignalMessage,
  getSignalChatUsers,
  updateSignal 
} from "@/lib/database";

export default function ChatPage() {
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student');
  const [userId, setUserId] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<Signal[]>([]);
  const [selectedSession, setSelectedSession] = useState<Signal | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadActiveSessions();
    }
  }, [userId, maskMode]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages();
      loadOtherUser();
    }
  }, [selectedSession]);

  const loadCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUserId(authUser.id);
      const currentMode = await getCurrentMode(authUser.id);
      setMaskMode(currentMode);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const allSignals = await getSignals(userId);
      const active = allSignals.filter(s => 
        s.status === 'helping' && 
        (s.user_id === userId || s.assigned_mentor_user_id === userId)
      );
      setActiveSessions(active);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;
    
    try {
      let chatData = await getSignalChat(selectedSession.signal_id);
      
      if (!chatData) {
        console.log('Chat room not found, creating one...');
        const { data: newChatData, error: createError } = await supabase
          .from('signalChat')
          .insert([{ signal_id: selectedSession.signal_id }])
          .select('*')
          .maybeSingle();
        
        if (createError) {
          console.error('Error creating chat:', createError);
          alert('Failed to create chat room: ' + (createError.message || 'Unknown error'));
          return;
        }
        console.log('Chat room created:', newChatData);
        chatData = newChatData;
      }
      
      if (chatData) {
        console.log('Loading messages for chat:', chatData.signalChatID);
        const msgs = await getSignalMessages(chatData.signalChatID);
        console.log('Loaded messages:', msgs);
        setMessages(msgs);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      alert('Failed to load messages: ' + (error.message || 'Unknown error'));
    }
  };

  const loadOtherUser = async () => {
    if (!selectedSession || !userId) return;

    try {
      const otherUserId = selectedSession.user_id === userId 
        ? selectedSession.assigned_mentor_user_id 
        : selectedSession.user_id;
      
      if (!otherUserId) return;

      const tableName = maskMode === 'student' ? 'mentors' : 'mentees';
      const { data } = await supabase
        .from(tableName)
        .select('masked_name')
        .eq('user_id', otherUserId)
        .maybeSingle();

      setOtherUser(data);
    } catch (error: any) {
      console.error('Error loading other user:', error);
    }
  };

  const handleEnterSession = (session: Signal) => {
    setSelectedSession(session);
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selectedSession || !userId) return;

    try {
      let chatData = await getSignalChat(selectedSession.signal_id);
      
      if (!chatData) {
        const { data: newChatData, error: createError } = await supabase
          .from('signalChat')
          .insert([{ signal_id: selectedSession.signal_id }])
          .select('*')
          .maybeSingle();
        
        if (createError) {
          console.error('Error creating chat:', createError);
          alert('Failed to create chat room: ' + createError.message);
          return;
        }
        chatData = newChatData;
      }
      
      if (chatData) {
        const { error: insertError } = await supabase
          .from('signalMessages')
          .insert([{
            signalChatID: chatData.signalChatID,
            sender_id: userId,
            content: trimmed
          }]);
        
        if (insertError) {
          console.error('Error inserting message:', insertError);
          alert('Failed to send message: ' + insertError.message);
          return;
        }
        
        setInput("");
        inputRef.current?.focus();
        loadMessages();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession || !confirm('Are you sure you want to end this session?')) return;

    setIsEndingSession(true);
    try {
      await updateSignal(selectedSession.signal_id, { status: 'closed' });
      setSelectedSession(null);
      loadActiveSessions();
    } catch (error: any) {
      console.error('Error ending session:', error);
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleSwapComplete = async (newMode: 'student' | 'mentor') => {
    if (!userId) return;

    window.location.reload();
  };

  if (selectedSession) {
    return (
      <AuthGuard>
        <div className="h-screen bg-[#F8F9FB] text-gray-800">
          <div className="h-full flex gap-0">
            {/* Left dashboard sidebar */}
            <Sidebar maskMode={maskMode} setMaskMode={setMaskMode} userId={userId} onSwapComplete={handleSwapComplete} />

            {/* Center content: chat */}
            <div className="flex-1 overflow-auto h-full">
              <div className="h-full grid grid-cols-12 gap-0 items-stretch">
                {/* Chat Window */}
                <div className="col-span-12 bg-white rounded-0 shadow-sm h-full flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedSession(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                      <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center font-semibold">
                        {otherUser?.masked_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-md font-semibold">{otherUser?.masked_name || 'Unknown'}</div>
                        <div className="flex items-center gap-2 text-xs text-green-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                          Online
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">Session Active</div>
                      {maskMode === 'student' && (
                        <button
                          onClick={handleEndSession}
                          disabled={isEndingSession}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          {isEndingSession ? 'Ending...' : 'End Session'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-auto bg-transparent">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((m) => (
                          <div key={m.message_id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`px-4 py-2 text-sm leading-snug max-w-[78%] ${
                                m.sender_id === userId
                                  ? "bg-[#0084FF] text-white rounded-[18px] rounded-br-[6px]"
                                  : "bg-[#F0F2F5] text-gray-800 rounded-[18px] rounded-bl-[6px]"
                              }`}
                            >
                              {m.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="border-t border-gray-100 px-6 py-4 bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-full py-3 px-4 text-sm focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Send message"
                        className="w-12 h-12 bg-[#0084FF] rounded-full inline-flex items-center justify-center text-white hover:brightness-90 shadow"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-[#F8F9FB] text-gray-800">
        <div className="h-full flex gap-0">
          {/* Left dashboard sidebar */}
          <Sidebar maskMode={maskMode} setMaskMode={setMaskMode} userId={userId} onSwapComplete={handleSwapComplete} />

          {/* Center content: sessions list */}
          <div className="flex-1 overflow-auto h-full">
            <div className="h-full">
              <div className="bg-white rounded-0 p-6 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative flex-1">
                    <input
                      placeholder="Search sessions..."
                      className="w-full border border-gray-100 rounded-full py-2 px-3 text-sm bg-gray-50"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                  </div>
                  <button
                    onClick={loadActiveSessions}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <RefreshCw size={20} className="text-gray-400" />
                  </button>
                </div>

                <h2 className="text-xl font-bold mb-4">Active Sessions</h2>

                <div className="flex-1 overflow-auto">
                  {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading sessions...</div>
                  ) : activeSessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                      No active sessions. Go to Signals to help or request help!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSessions.map((session) => {
                        const otherUserId = session.user_id === userId 
                          ? session.assigned_mentor_user_id 
                          : session.user_id;
                        
                        const isMentee = session.user_id === userId;
                        
                        return (
                          <div key={session.signal_id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50">
                            <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center font-semibold">
                              {isMentee ? 'M' : 'S'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium">{isMentee ? 'Mentor' : 'Mentee'}</div>
                                  <div className="text-xs text-gray-400 mt-1">{session.title}</div>
                                </div>
                                <button
                                  onClick={() => handleEnterSession(session)}
                                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600"
                                >
                                  Enter Session
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
