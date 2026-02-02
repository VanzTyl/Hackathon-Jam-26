"use client";

import React, { useState, useEffect, useMemo } from "react"
import { Clock, MoreVertical, Edit2, Trash2, Plus, X, MessageSquare, Hash } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import AuthGuard from "@/components/AuthGuard"
import { supabase } from "@/supabase-client"
import { 
  getSignals, 
  createSignal, 
  deleteSignal, 
  updateSignal, 
  Signal, 
  getCurrentMode, 
  createMentorHelpRequest, 
  joinSignalChat, 
  acceptMentorHelpRequest, 
  rejectMentorHelpRequest 
} from "@/lib/database"
import { useRouter } from "next/navigation"

export default function SignalsPage() {
  const router = useRouter()
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student')
  const [userId, setUserId] = useState<string>('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentMaskedName, setCurrentMaskedName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [helpingSignalIds, setHelpingSignalIds] = useState<Set<string>>(new Set())
  const [helpingMenteeIds, setHelpingMenteeIds] = useState<Set<string>>(new Set())
  const [isRequestingHelp, setIsRequestingHelp] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('All')
  const [reviewingSignal, setReviewingSignal] = useState<Signal | null>(null)
  const [reviewingMentor, setReviewingMentor] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [newSignal, setNewSignal] = useState({ title: '', description: '', tags: '' })
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null)
  const [editData, setEditData] = useState({ title: '', description: '', tags: '' })

  // Tag Filter State
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    loadSignals()
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (maskMode === 'mentor' && userId) loadMentorHelpRequests()
  }, [maskMode, userId])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      setUserId(user.id)
      const currentMode = await getCurrentMode(user.id)
      setMaskMode(currentMode)

      const tableName = currentMode === 'mentor' ? 'mentors' : 'mentees';
      const { data: maskedData } = await supabase
        .from(tableName)
        .select('masked_name')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentMaskedName(maskedData?.masked_name || 'Anonymous');
    }
  }

  const handleSwapComplete = async (newMode: 'student' | 'mentor') => {
    if (!userId) return;

    const tableName = newMode === 'mentor' ? 'mentors' : 'mentees';
    const { data: maskedData } = await supabase
      .from(tableName)
      .select('masked_name')
      .eq('user_id', userId)
      .maybeSingle();

    setCurrentMaskedName(maskedData?.masked_name || 'Anonymous');

    await loadSignals();
  };

  const loadSignals = async () => {
    try {
      const data = await getSignals()
      setSignals(data)
      extractAndSetTags(data)
    } catch (error: any) {
      console.error('Error loading signals:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const extractAndSetTags = (signals: Signal[]) => {
    const tagMap = new Map<string, number>();
    signals.forEach(signal => {
      if (signal.tags && Array.isArray(signal.tags)) {
        signal.tags.forEach((tag: string) => {
          const normalizedTag = tag.trim().toLowerCase();
          if (normalizedTag) {
            tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1);
          }
        });
      }
    });

    const sortedTags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setAllTags(sortedTags);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const loadMentorHelpRequests = async () => {
    if (!userId) return
    const { data } = await supabase.from('signals').select('signal_id, user_id').eq('assigned_mentor_user_id', userId)
    setHelpingSignalIds(new Set(data?.map(s => s.signal_id) || []))
    setHelpingMenteeIds(new Set(data?.map(s => s.user_id) || []))
  }

  // --- Actions ---

  const isAlreadyHelpingMentee = (signal: Signal) => {
    return helpingMenteeIds.has(signal.user_id);
  };

  const isOwnSignal = (signal: Signal) => {
    return signal.user_id === userId;
  };

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const tagsArray = newSignal.tags.split(',').map(t => t.trim()).filter(t => t)
      await createSignal({
        user_id: userId,
        title: newSignal.title,
        description: newSignal.description,
        tags: tagsArray,
        status: 'open'
      }, currentMaskedName)
      setNewSignal({ title: '', description: '', tags: '' })
      setShowCreateModal(false)
      loadSignals()
    } catch (error: any) {
      alert("Failed to create signal: " + error.message)
    }
  }

  const handleRequestToHelp = async (signal: Signal) => {
    if (!userId) return
    
    if (isAlreadyHelpingMentee(signal)) {
      alert('You are already helping this mentee. Please complete your current session with them before taking on another request from the same mentee.');
      return;
    }
    
    setIsRequestingHelp(signal.signal_id)
    try {
      await createMentorHelpRequest(signal.signal_id, userId, signal.user_id)
      
      const { data: chatData } = await supabase
        .from('signalChat')
        .select('*')
        .eq('signal_id', signal.signal_id)
        .maybeSingle()
      
      if (chatData) {
        await supabase
          .from('signalChatUsers')
          .insert([{
            signalChatID: chatData.signalChatID,
            user_id: userId,
            role: 'mentor'
          }])
      }
      
      await loadMentorHelpRequests()
      await loadSignals()
    } catch (error: any) {
      console.error(error.message)
    } finally {
      setIsRequestingHelp(null)
    }
  }

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteSignal(signalId)
      loadSignals()
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const handleReviewRequest = async (signal: Signal) => {
    if (!signal.assigned_mentor_user_id) return
    
    try {
      const { data: mentorData } = await supabase
        .from('mentors')
        .select('masked_name')
        .eq('user_id', signal.assigned_mentor_user_id)
        .maybeSingle()
      
      setReviewingMentor(mentorData)
      setReviewingSignal(signal)
    } catch (error: any) {
      console.error('Error loading mentor data:', error)
    }
  }

  const handleAcceptRequest = async () => {
    if (!reviewingSignal) return
    
    setIsProcessing(true)
    try {
      await acceptMentorHelpRequest(reviewingSignal.signal_id, reviewingSignal.assigned_mentor_user_id!)
      setReviewingSignal(null)
      setReviewingMentor(null)
      loadSignals()
    } catch (error: any) {
      console.error('Error accepting request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeclineRequest = async () => {
    if (!reviewingSignal) return
    
    setIsProcessing(true)
    try {
      await rejectMentorHelpRequest(reviewingSignal.signal_id)
      setReviewingSignal(null)
      setReviewingMentor(null)
      loadSignals()
      if (userId) loadMentorHelpRequests()
    } catch (error: any) {
      console.error('Error declining request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSignal) return
    try {
      const tagsArray = editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      await updateSignal(editingSignal.signal_id, {
        title: editData.title,
        description: editData.description,
        tags: tagsArray
      })
      setEditingSignal(null)
      loadSignals()
    } catch (error: any) {
      console.error(error.message)
    }
  }

  // --- Helpers ---

  const filteredSignals = useMemo(() => {
    let filtered = signals;

    if (maskMode === 'student') {
      if (filter === 'By You') filtered = filtered.filter(s => s.user_id === userId)
      if (filter === 'Pending Request') filtered = filtered.filter(s => s.status === 'waiting_for_approval' || s.status === 'helping')
    } else {
      if (filter === 'Pending Request') filtered = filtered.filter(s => s.assigned_mentor_user_id === userId)
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(signal => {
        if (!signal.tags || !Array.isArray(signal.tags)) return false;
        const signalTags = signal.tags.map((t: string) => t.trim().toLowerCase());
        return selectedTags.every(selectedTag => signalTags.includes(selectedTag));
      });
    }

    return filtered
  }, [signals, filter, maskMode, userId, selectedTags])

  const getTimeRemaining = (createdAt: string) => {
    const diffHours = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
    const hoursLeft = Math.max(0, 24 - diffHours)
    return `${Math.floor(hoursLeft)}h ${Math.floor((hoursLeft % 1) * 60)}m left`
  }

  const getProgress = (createdAt: string) => {
    const diffHours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    return Math.min(100, (diffHours / 24) * 100)
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-[#F8F9FB] text-gray-800 flex overflow-hidden">
        <Sidebar maskMode={maskMode} setMaskMode={setMaskMode} userId={userId} onSwapComplete={handleSwapComplete} />

        <div className="flex-1 flex flex-col overflow-hidden px-8 py-6">
          {/* Create Signal Trigger */}
          <div
            className={`flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100 ${maskMode === 'mentor' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
            onClick={() => maskMode !== 'mentor' && setShowCreateModal(true)}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Send a help signal...</p>
              {maskMode === 'mentor' && <p className="text-xs text-gray-500">Mentors cannot send signals</p>}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(maskMode === 'student' ? ['All', 'By You', 'Pending Request'] : ['All', 'Pending Request']).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${filter === f ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setShowTagFilterModal(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${selectedTags.length > 0 ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              <Hash size={14} /> {selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'Filter Tags'}
            </button>
          </div>

          {selectedTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Filters:</span>
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                >
                  <Hash size={12} /> {tag}
                  <X size={12} />
                </button>
              ))}
              <button
                onClick={clearTagFilters}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Signals List */}
          <div className="flex-1 overflow-auto space-y-4">
            {filteredSignals.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No signals found matching your filters.</p>
            ) : (
              filteredSignals.map((signal, index) => (
                <div key={signal.signal_id} className="bg-white rounded-xl p-5 border border-gray-100 flex gap-6">
                  <div className="h-14 w-14 rounded-full bg-cyan-500 text-white flex items-center justify-center text-lg font-bold">
                    {signal.user?.masked_name?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{signal.user?.masked_name || 'Anonymous'}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100">
                        {signal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900">{signal.title}</h4>
                    <p className="text-sm text-gray-600 my-2">{signal.description}</p>

                    {signal.tags && signal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {signal.tags.map(t => (
                          <span key={t} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgress(signal.created_at) > 80 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${getProgress(signal.created_at)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={14} /> {getTimeRemaining(signal.created_at)}
                    </div>

                    {/* Conditional Action Buttons */}
                    <div className="flex gap-2">
                      {signal.status === 'helping' && (signal.user_id === userId || signal.assigned_mentor_user_id === userId) && (
                        <button
                          onClick={() => router.push('/chat')}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Enter Session
                        </button>
                      )}

                      {maskMode === 'mentor' && signal.status === 'open' && !helpingSignalIds.has(signal.signal_id) && !isOwnSignal(signal) && (
                        <button
                          onClick={() => handleRequestToHelp(signal)}
                          disabled={isRequestingHelp === signal.signal_id || isAlreadyHelpingMentee(signal)}
                          className={`px-4 py-2 rounded-lg text-sm disabled:opacity-50 ${
                            isAlreadyHelpingMentee(signal) || isOwnSignal(signal)
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-cyan-500 text-white hover:bg-cyan-600'
                          }`}
                          title={isAlreadyHelpingMentee(signal) ? 'You are already helping this mentee' : (isOwnSignal(signal) ? 'You cannot help your own signal' : '')}
                        >
                          {isAlreadyHelpingMentee(signal) ? 'Already Helping' : (isRequestingHelp === signal.signal_id ? 'Requesting...' : 'Help')}
                        </button>
                      )}

                      {maskMode === 'student' && signal.status === 'waiting_for_approval' && signal.user_id === userId && (
                        <button
                          onClick={() => handleReviewRequest(signal)}
                          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600"
                        >
                          Review Request
                        </button>
                      )}

                      {maskMode === 'student' && signal.user_id === userId && signal.status !== 'waiting_for_approval' && signal.status !== 'helping' && (
                        <button onClick={() => handleDeleteSignal(signal.signal_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Logic (Create/Edit) follows similar pattern... */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
               <h2 className="text-xl font-bold mb-4">New Signal</h2>
               <form onSubmit={handleCreateSignal} className="space-y-4">
                  <input
                    placeholder="Title"
                    className="w-full p-3 border rounded-lg"
                    value={newSignal.title}
                    onChange={e => setNewSignal({...newSignal, title: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Describe your problem..."
                    className="w-full p-3 border rounded-lg h-32"
                    value={newSignal.description}
                    onChange={e => setNewSignal({...newSignal, description: e.target.value})}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      placeholder="e.g., coding, help, javascript"
                      className="w-full p-3 border rounded-lg"
                      value={newSignal.tags}
                      onChange={e => setNewSignal({...newSignal, tags: e.target.value})}
                    />
                    {newSignal.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newSignal.tags.split(',').filter(t => t.trim()).map((tag, idx) => (
                          <span key={idx} className="text-xs font-bold bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button>
                    <button type="submit" className="flex-1 p-3 bg-cyan-500 text-white rounded-lg">Broadcast</button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Review Request Modal */}
        {reviewingSignal && reviewingMentor && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-center">Review Mentor Request</h2>

              <div className="flex flex-col items-center mb-8">
                <div className="h-20 w-20 rounded-full bg-cyan-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {reviewingMentor.masked_name?.charAt(0) || '?'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{reviewingMentor.masked_name}</h3>
                <p className="text-sm text-gray-500 mt-1">Mentor</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAcceptRequest}
                  disabled={isProcessing}
                  className="w-full py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Accept Request'}
                </button>
                <button
                  onClick={handleDeclineRequest}
                  disabled={isProcessing}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Decline Request'}
                </button>
                <button
                  onClick={() => { setReviewingSignal(null); setReviewingMentor(null); }}
                  disabled={isProcessing}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAG FILTER MODAL */}
        {showTagFilterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Filter by Tags</h2>
                  <p className="text-sm text-gray-500 mt-1">Select multiple tags to filter signals</p>
                </div>
                <button onClick={() => setShowTagFilterModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-auto pr-2">
                {allTags.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Hash size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No tags available yet.</p>
                    <p className="text-sm">Create signals with tags to see them here!</p>
                  </div>
                ) : (
                  <>
                    {allTags.slice(0, 8).length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Hash size={14} /> Popular
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {allTags.slice(0, 8).map((tag) => (
                            <button
                              key={tag.name}
                              onClick={() => handleToggleTag(tag.name)}
                              className={`
                                px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95
                                ${selectedTags.includes(tag.name)
                                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                              `}
                            >
                              #{tag.name}
                              <span className="ml-1 text-xs opacity-75">({tag.count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {allTags.slice(8).length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Hash size={14} /> More
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {allTags.slice(8).map((tag) => (
                            <button
                              key={tag.name}
                              onClick={() => handleToggleTag(tag.name)}
                              className={`
                                px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95
                                ${selectedTags.includes(tag.name)
                                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                              `}
                            >
                              #{tag.name}
                              <span className="ml-1 text-xs opacity-75">({tag.count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {selectedTags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{selectedTags.length} tags selected:</span>
                      <button
                        onClick={clearTagFilters}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTagFilterModal(false)}
                      className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                      >
                        #{tag}
                        <X size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}