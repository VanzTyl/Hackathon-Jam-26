"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, Search, RefreshCw, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { 
  getCurrentMode, 
  Signal, 
  getSignals,
  getSignalChat,
  getSignalMessages,
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
      setLoading(true);
      const allSignals = await getSignals();
      // Filter for sessions where user is either the seeker or the helper and status is 'helping'
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
      // 1. Get the chat room (uses lowercase 'signalchat' table internally)
      let chatData = await getSignalChat(selectedSession.signal_id);
      
      // 2. If it doesn't exist, create it (matching lowercase schema)
      if (!chatData) {
        const { data: newChatData, error: createError } = await supabase
          .from('signalchat')
          .insert([{ signal_id: selectedSession.signal_id }])
          .select('*')
          .single();
        
        if (createError) throw createError;
        chatData = newChatData;
      }
      
      if (chatData) {
        // 3. Fetch messages using the lowercase ID property
        const msgs = await getSignalMessages(chatData.signalchatid);
        setMessages(msgs);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOtherUser = async () => {
    if (!selectedSession || !userId) return;

    try {
      // Identify the ID of the person we are talking to
      const otherUserId = selectedSession.user_id === userId 
        ? selectedSession.assigned_mentor_user_id 
        : selectedSession.user_id;
      
      if (!otherUserId) return;

      // Determine if we need to look at the Mentor or Mentee table for their name
      const targetTable = selectedSession.user_id === otherUserId ? 'mentees' : 'mentors';
      
      const { data } = await supabase
        .from(targetTable)
        .select('masked_name')
        .eq('user_id', otherUserId)
        .maybeSingle();

      setOtherUser(data);
    } catch (error: any) {
      console.error('Error loading other user:', error);
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selectedSession || !userId) return;

    try {
      const chatData = await getSignalChat(selectedSession.signal_id);
      if (chatData) {
        const { error: insertError } = await supabase
          .from('signalmessages')
          .insert([{
            signalchatid: chatData.signalchatid,
            sender_id: userId,
            content: trimmed
          }]);
        
        if (insertError) throw insertError;
        
        setInput("");
        inputRef.current?.focus();
        loadMessages();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession || !confirm('Are you sure you want to end this help session?')) return;

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

  const handleSwapComplete = async () => {
    window.location.reload();
  };

  if (selectedSession) {
    return (
      <AuthGuard>
        <div className="h-screen bg-[#F8F9FB] flex overflow-hidden">
          <Sidebar maskMode={maskMode} setMaskMode={setMaskMode} userId={userId} onSwapComplete={handleSwapComplete} />
          
          <main className="flex-1 flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                  {otherUser?.masked_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{otherUser?.masked_name || 'Anonymous User'}</h2>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active Now
                  </p>
                </div>
              </div>
              <button
                onClick={handleEndSession}
                disabled={isEndingSession}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                {isEndingSession ? 'Closing...' : 'End Session'}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <p>No messages yet.</p>
                  <p className="text-sm">Introduce yourself and start the conversation!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.message_id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      m.sender_id === userId 
                        ? "bg-cyan-500 text-white rounded-tr-none" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-cyan-500 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-[#F8F9FB] flex overflow-hidden">
        <Sidebar maskMode={maskMode} setMaskMode={setMaskMode} userId={userId} onSwapComplete={handleSwapComplete} />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Chat Sessions</h1>
                <p className="text-gray-500">Pick up where you left off with your mentors or mentees.</p>
              </div>
              <button 
                onClick={loadActiveSessions}
                className="p-2 text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No active chats</h3>
                <p className="text-gray-500 mt-2">Active help signals you've joined or created will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSessions.map((session) => (
                  <div 
                    key={session.signal_id} 
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          session.user_id === userId ? "bg-purple-50 text-purple-600" : "bg-cyan-50 text-cyan-600"
                        }`}>
                          {session.user_id === userId ? "Seeking Help" : "Providing Help"}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">{session.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{session.description}</p>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedSession(session)}
                      className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                      Enter Chat Room
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}