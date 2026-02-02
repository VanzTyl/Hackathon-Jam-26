"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Send, ArrowLeft, UserPlus, ShieldCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ProfilePanel } from "@/components/profile-panel";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { getCurrentMode, Signal, getSignalChat, getSignalMessages, updateSignal } from "@/lib/database";
import { useParams, useRouter } from "next/navigation";

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const chatSessionId = params?.chat_session_id as string;
  
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student');
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  
  // User Data State
  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherUserRealName, setOtherUserRealName] = useState<any>(null);
  const [currentUserRealName, setCurrentUserRealName] = useState<any>(null);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingOtherUser, setLoadingOtherUser] = useState(false);
  const [signal, setSignal] = useState<any>(null); // Changed to any to support new columns
  
  // Flow States
  // 'resolution' -> 'unveil-ask' -> 'waiting' -> 'unveiled' | 'closed-anonymous'
  const [flowState, setFlowState] = useState<'none' | 'resolution' | 'unveil-ask' | 'waiting' | 'unveiled' | 'closed-anonymous'>('none');
  const [isEnding, setIsEnding] = useState(false);
  
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (chatSessionId) {
      loadSignalData();
    }
  }, [chatSessionId]);

  useEffect(() => {
    if (signal && userId) {
      loadMessages();
      const channel = setupRealtimeSubscription();
      loadOtherUser();

      // Check current unveil status on load
      checkUnveilStatus(signal);

      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [signal?.signal_id, userId]);

  const checkUnveilStatus = (currentSignal: any) => {
    if (!currentSignal) return;

    // Check if both agreed
    if (currentSignal.mentee_wants_unveil && currentSignal.mentor_wants_unveil) {
      setFlowState('unveiled');
      return;
    }

    // Determine my role
    const isMentee = currentSignal.user_id === userId;
    const myUnveilStatus = isMentee ? currentSignal.mentee_wants_unveil : currentSignal.mentor_wants_unveil;

    // If I have already said yes, but not both -> I am waiting
    if (myUnveilStatus) {
      setFlowState('waiting');
    }
  };

  const loadCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUserId(authUser.id);
      const currentMode = await getCurrentMode(authUser.id);
      setMaskMode(currentMode);

      const { data: realNameData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (realNameData) {
        setCurrentUserRealName(realNameData);
      }
    }
  };

  const loadSignalData = async () => {
    if (!chatSessionId) return;
    try {
      const { data: chatData } = await supabase
        .from('signalchat')
        .select('*, signals(*)')
        .eq('signalchatid', chatSessionId)
        .maybeSingle();
      
      if (chatData?.signals) {
        setSignal(chatData.signals);
      }
    } catch (error) {
      console.error('Error loading signal data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await getSignalMessages(chatSessionId);
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat-${chatSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalmessages',
          filter: `signalchatid=eq.${chatSessionId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      // Listen for Signal updates (Unveil status changes)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signals',
          filter: `signal_id=eq.${signal?.signal_id}`
        },
        (payload) => {
          const updatedSignal = payload.new;
          setSignal(updatedSignal); // Update local signal state
          
          // Logic: Check if we should transition states based on the update
          if (updatedSignal.mentee_wants_unveil && updatedSignal.mentor_wants_unveil) {
             setFlowState('unveiled');
          } else if (updatedSignal.status === 'closed' && 
                    (!updatedSignal.mentee_wants_unveil || !updatedSignal.mentor_wants_unveil)) {
             // If closed and not both unveiled, it's a standard close
             // But if I am 'waiting', and the other person closed without unveiling -> 'closed-anonymous'
             if (flowState === 'waiting') {
               setFlowState('closed-anonymous');
             }
          }
        }
      )
      .subscribe();
      
    return channel;
  };

  const loadOtherUser = async () => {
    if (!chatSessionId || !userId || !signal) return;

    setLoadingOtherUser(true);
    try {
      const otherUserId = signal.user_id === userId 
        ? signal.assigned_mentor_user_id 
        : signal.user_id;
      
      if (!otherUserId) return;

      const targetMaskedTable = otherUserId === signal.user_id ? 'mentees' : 'mentors';
      
      // 1. Get Masked Name
      const { data: maskedData } = await supabase
        .from(targetMaskedTable)
        .select('masked_name')
        .eq('user_id', otherUserId)
        .maybeSingle();

      if (maskedData) setOtherUser(maskedData);

      // 2. Get Real Name (pre-fetch for unveil)
      const { data: realNameData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', otherUserId)
        .maybeSingle();

      if (realNameData) setOtherUserRealName(realNameData);

    } catch (error) {
      console.error('Error loading other user:', error);
    } finally {
      setLoadingOtherUser(false);
    }
  };

  // --- FLOW HANDLERS ---

  const startEndSessionFlow = () => {
    setFlowState('resolution');
  };

  const handleResolutionSubmit = async (resolved: boolean) => {
    if (!signal) return;
    try {
      // Just update the resolution status, keep signal 'helping' or 'open' for now
      // so the other user isn't kicked out yet.
      await updateSignal(signal.signal_id, { is_resolved: resolved });
      setFlowState('unveil-ask');
    } catch (error) {
      console.error('Error updating resolution:', error);
    }
  };

  const handleUnveilDecision = async (wantsUnveil: boolean) => {
    if (!signal) return;
    setIsEnding(true);
    
    try {
      const isMentee = signal.user_id === userId;
      const updateData: any = {};
      
      if (isMentee) updateData.mentee_wants_unveil = wantsUnveil;
      else updateData.mentor_wants_unveil = wantsUnveil;

      // If choosing NO, we close immediately.
      if (!wantsUnveil) {
        updateData.status = 'closed';
        setFlowState('closed-anonymous');
      } else {
        // If choosing YES, check if the other person already said YES
        const otherPersonSaidYes = isMentee ? signal.mentor_wants_unveil : signal.mentee_wants_unveil;
        
        if (otherPersonSaidYes) {
           // It's a match! Close and Unveil
           updateData.status = 'closed';
           setFlowState('unveiled');
        } else {
           // Waiting for partner
           setFlowState('waiting');
        }
      }

      await updateSignal(signal.signal_id, updateData);
      
    } catch (error) {
      console.error("Error submitting unveil decision", error);
    } finally {
      setIsEnding(false);
    }
  };

  const handleAddConnection = async () => {
    if (!otherUser) return;
    const otherUserId = signal.user_id === userId ? signal.assigned_mentor_user_id : signal.user_id;

    try {
      const { error } = await supabase
        .from('connections')
        .insert([{
          user_id: userId,
          connected_user_id: otherUserId,
          status: 'pending'
        }]);
      
      if (error) {
        if (error.code === '23505') alert('Connection request already sent!'); // unique violation
        else throw error;
      } else {
        alert('Connection request sent!');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to send request');
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !chatSessionId || !userId) return;

    try {
      const { error } = await supabase
        .from('signalmessages')
        .insert([{
          signalchatid: chatSessionId,
          sender_id: userId,
          content: trimmed
        }]);
      
      if (error) throw error;
      setInput("");
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSwapComplete = () => {
    router.push('/chat');
  };

  return (
    <AuthGuard>
      <div className="h-screen bg-[#F8F9FB] text-gray-800">
        <div className="h-full flex">
          <Sidebar 
            maskMode={maskMode} 
            setMaskMode={setMaskMode} 
            userId={userId} 
            onSwapComplete={handleSwapComplete} 
          />

          <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/chat')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-12 h-12 rounded-full bg-[#E9F3FF] flex items-center justify-center text-[#0084FF] font-semibold">
                  {loadingOtherUser ? (
                    <div className="animate-spin h-4 w-4 border-2 border-[#0084FF] border-t-transparent rounded-full" />
                  ) : (
                    <span>{otherUser?.masked_name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-md font-semibold">
                    {loadingOtherUser ? "Loading..." : (otherUser?.masked_name || 'Anonymous')}
                  </h2>
                  <p className="text-xs text-green-500 font-medium">Active now</p>
                </div>
              </div>
              
              {/* Only show End Session if not already unveiling or closed */}
              {flowState === 'none' && (
                <button
                  onClick={startEndSessionFlow}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  End Session
                </button>
              )}
            </header>

            <main className="flex-1 p-6 overflow-y-auto bg-[#F8F9FB]">
              {!signal || loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0084FF] mb-4" />
                  <p>Loading conversation...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No messages yet.</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.message_id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`px-4 py-2 text-sm leading-snug max-w-[75%] break-words ${
                          m.sender_id === userId
                            ? "bg-[#0084FF] text-white rounded-[18px] rounded-br-[4px]"
                            : "bg-white border border-gray-100 text-gray-800 rounded-[18px] rounded-bl-[4px] shadow-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            <footer className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084FF]/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-[#0084FF] rounded-full flex items-center justify-center text-white hover:bg-[#0073e6] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
                {/* Note: Add Connection button removed from footer as requested */}
              </form>
            </footer>

            {/* --- MODALS --- */}

            {/* 1. Resolution Check */}
            {flowState === 'resolution' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                  <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">End Session?</h2>
                  <p className="text-center text-gray-600 mb-8">
                    Before we wrap up, was this session helpful? Did you resolve the issue?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResolutionSubmit(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Not really
                    </button>
                    <button
                      onClick={() => handleResolutionSubmit(true)}
                      className="flex-1 py-3 bg-[#0084FF] text-white rounded-xl font-medium hover:bg-[#0073e6] transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Yes, resolved!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Unveil Request */}
            {flowState === 'unveil-ask' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                   <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Unveil Identity?</h2>
                  <p className="text-center text-gray-600 mb-8 text-sm">
                    Would you like to reveal your real identity to <strong>{otherUser?.masked_name}</strong>?<br/>
                    This only happens if <strong>both</strong> of you agree.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUnveilDecision(false)}
                      disabled={isEnding}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      No, stay anonymous
                    </button>
                    <button
                      onClick={() => handleUnveilDecision(true)}
                      disabled={isEnding}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                    >
                      {isEnding ? 'Waiting...' : 'Yes, Unveil Me'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Waiting for Partner */}
            {flowState === 'waiting' && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                 <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse">
                   <Clock className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Waiting for Response</h2>
                 <p className="text-gray-600 mb-8">
                   You agreed to unveil! We are waiting for <strong>{otherUser?.masked_name}</strong> to respond.
                 </p>
                 <button
                   onClick={() => router.push('/chat')}
                   className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                 >
                   Leave page (Action will continue in background)
                 </button>
               </div>
             </div>
            )}

            {/* 4. SUCCESS: Unveiled Card */}
            {flowState === 'unveiled' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                  {/* Confetti / Decoration Background */}
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10"></div>
                  
                  <div className="text-center mb-8 relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                      <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-900">It's a Match!</h2>
                    <p className="text-gray-600">
                      You both agreed to unveil your identities.
                    </p>
                  </div>

                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      {/* Current User Info */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                          {currentUserRealName?.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg text-gray-900">{currentUserRealName?.first_name} {currentUserRealName?.last_name}</p>
                          <p className="text-sm text-gray-500 font-medium">You</p>
                        </div>
                      </div>
                      
                      {/* Other User Info (Real Name Revealed!) */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                          {otherUserRealName?.first_name?.charAt(0) || '?'}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg text-gray-900">{otherUserRealName?.first_name || 'Loading...'} {otherUserRealName?.last_name || ''}</p>
                          <p className="text-sm text-gray-500 font-medium">was {otherUser?.masked_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <button
                      onClick={handleAddConnection}
                      className="w-full py-4 bg-[#0084FF] text-white rounded-xl font-bold hover:bg-[#0073e6] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <UserPlus className="inline-flex items-center justify-center mr-2" size={20} />
                      Add Connection
                    </button>
                    
                    <button
                      onClick={() => router.push('/chat')}
                      className="w-full py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      Return to Chat List
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Closed Anonymous */}
            {flowState === 'closed-anonymous' && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                 <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                   <ShieldCheck className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
                 <p className="text-gray-600 mb-8">
                   The session has been closed anonymously. Identities remain masked.
                 </p>
                 <button
                   onClick={() => router.push('/chat')}
                   className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                 >
                   Return to Chat
                 </button>
               </div>
             </div>
            )}

          </div>

          <ProfilePanel 
            user={{ 
              user_id: userId, 
              first_name: '', last_name: '', email_address: '',
              masked_name: '', current_mask: maskMode, 
              created_at: '', updated_at: '' 
            }} 
            maskMode={maskMode} 
            setMaskMode={setMaskMode} 
            userId={userId} 
          />
        </div>
      </div>
    </AuthGuard>
  );
}