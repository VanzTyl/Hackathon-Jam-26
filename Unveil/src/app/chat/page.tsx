"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { getCurrentMode, getSignals, getSignalChat, getSignalMessages } from "@/lib/database";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student');
  const [userId, setUserId] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadActiveSessions();
      setupRealtimeSubscriptions();
    }

    return () => {
      supabase.channel('chat-sessions').unsubscribe();
    };
  }, [userId, maskMode]);

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
      const active = allSignals.filter(s => 
        s.status === 'helping' && 
        (s.user_id === userId || s.assigned_mentor_user_id === userId)
      );

      const sessionsWithChat = await Promise.all(
        active.map(async (signal: any) => {
          try {
            const chatData = await getSignalChat(signal.signal_id);
            if (chatData) {
              const msgs = await getSignalMessages(chatData.signalchatid);
              const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;

              const otherUserId = signal.user_id === userId 
                ? signal.assigned_mentor_user_id 
                : signal.user_id;

              const targetTable = signal.user_id === otherUserId ? 'mentees' : 'mentors';
              const { data: userData } = await supabase
                .from(targetTable)
                .select('masked_name')
                .eq('user_id', otherUserId)
                .maybeSingle();

              return {
                id: signal.signal_id,
                chatId: chatData.signalchatid,
                name: userData?.masked_name || 'Anonymous',
                snippet: lastMessage?.content || signal.description,
                signal,
                lastMessageTime: lastMessage?.created_at || signal.created_at
              };
            }
            return null;
          } catch (err) {
            return null;
          }
        })
      );

      const validSessions = sessionsWithChat.filter(s => s !== null);
      setActiveSessions(validSessions.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ));
    } catch (error: any) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase.channel('chat-sessions');

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalmessages',
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          const { data: chatData } = await getSignalChat(newMessage.signalchatid);
          if (!chatData) return;

          const { data: signalData } = await supabase
            .from('signals')
            .select('user_id, assigned_mentor_user_id')
            .eq('signal_id', chatData.signal_id)
            .maybeSingle();

          if (!signalData) return;

          const isUserInvolved = signalData.user_id === userId || signalData.assigned_mentor_user_id === userId;
          if (!isUserInvolved) return;

          const otherUserId = signalData.user_id === userId 
            ? signalData.assigned_mentor_user_id 
            : signalData.user_id;

          const targetTable = signalData.user_id === otherUserId ? 'mentees' : 'mentors';
          const { data: userData } = await supabase
            .from(targetTable)
            .select('masked_name')
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (!userData) return;

          setActiveSessions(prev => {
            const existingIndex = prev.findIndex(s => s.chatId === newMessage.signalchatid);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                snippet: newMessage.content,
                lastMessageTime: newMessage.created_at
              };
              return updated.sort((a, b) => 
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
              );
            }
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signals',
          filter: `user_id=eq.${userId},assigned_mentor_user_id=eq.${userId}`
        },
        async (payload) => {
          const updatedSignal = payload.new as any;
          if (updatedSignal.status === 'helping') {
            const { data: chatData } = await getSignalChat(updatedSignal.signal_id);
            if (!chatData) return;

            const msgs = await getSignalMessages(chatData.signalchatid);
            const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            const otherUserId = updatedSignal.user_id === userId 
              ? updatedSignal.assigned_mentor_user_id 
              : updatedSignal.user_id;

            const targetTable = updatedSignal.user_id === otherUserId ? 'mentees' : 'mentors';
            const { data: userData } = await supabase
              .from(targetTable)
              .select('masked_name')
              .eq('user_id', otherUserId)
              .maybeSingle();

            if (!userData) return;

            const newSession = {
              id: updatedSignal.signal_id,
              chatId: chatData.signalchatid,
              name: userData?.masked_name || 'Anonymous',
              snippet: lastMessage?.content || updatedSignal.description,
              online: true,
              signal: updatedSignal,
              lastMessageTime: lastMessage?.created_at || updatedSignal.created_at
            };

            setActiveSessions(prev => {
              const exists = prev.some(s => s.id === newSession.id);
              if (!exists) {
                return [...prev, newSession].sort((a, b) => 
                  new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                );
              }
              return prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signals',
          filter: `user_id=eq.${userId},status=eq.closed`
        },
        (payload) => {
          const closedSignal = payload.new as any;
          setActiveSessions(prev => 
            prev.filter(s => s.id !== closedSignal.signal_id)
          );
        }
      )
      .subscribe();
  };

  const filteredSessions = activeSessions.filter(session => 
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSwapComplete = async () => {
    window.location.reload();
  };

  const formatTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <AuthGuard>
      <div className="h-screen bg-[#F8F9FB] text-gray-800">
        <div className="h-full flex gap-0">
          {/* Left sidebar */}
          <Sidebar 
            maskMode={maskMode} 
            setMaskMode={setMaskMode} 
            userId={userId} 
            onSwapComplete={handleSwapComplete} 
          />

          {/* Center content: conversations list */}
          <div className="flex-1 overflow-auto h-full">
            <div className="h-full lg:grid lg:grid-cols-12 gap-0 items-stretch">
              {/* Conversation List */}
              <div className="col-span-12 lg:col-span-12 bg-white rounded-0 p-6 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative flex-1">
                    <input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-100 rounded-full py-2 px-3 pl-10 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/20"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                  <MoreHorizontal className="text-gray-400" />
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0084FF] mb-4" />
                    <p>Loading conversations...</p>
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No active chats</h3>
                    <p className="text-gray-500 mt-2">Active help signals you've joined will appear here.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto space-y-3">
                    {filteredSessions.map((session) => (
                      <div 
                        key={session.id} 
                        onClick={() => router.push(`/chat/${session.chatId}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-[#E9F3FF] flex items-center justify-center text-sm font-semibold text-[#0084FF] shrink-0">
                          {session.name.split(" ")[0].charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{session.name}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-gray-400 truncate flex-1">
                              {session.snippet}
                            </div>
                            <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(session.lastMessageTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right profile panel */}
          <div className="hidden lg:flex lg:w-72 h-full bg-card/80 p-2 backdrop-blur-sm flex-col">
            <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-2xl font-black mb-3">
                U
              </div>
              <h3 className="font-bold text-gray-900">CIIT Unveil</h3>
              <p className="text-xs text-gray-500 mt-1">Anonymous Mentoring Platform</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}