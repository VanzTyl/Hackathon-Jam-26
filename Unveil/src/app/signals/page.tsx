"use client";

import React, { useState, useEffect, useMemo } from "react"
import { Clock, MoreVertical, Edit2, Trash2, Plus, X, MessageSquare } from "lucide-react"
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
  const [isRequestingHelp, setIsRequestingHelp] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('All')
  const [reviewingSignal, setReviewingSignal] = useState<Signal | null>(null)
  const [reviewingMentor, setReviewingMentor] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [newSignal, setNewSignal] = useState({ title: '', description: '', tags: '' })
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null)
  const [editData, setEditData] = useState({ title: '', description: '', tags: '' })

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
    } catch (error: any) {
      console.error('Error loading signals:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMentorHelpRequests = async () => {
    if (!userId) return
    const { data } = await supabase.from('signals').select('signal_id').eq('assigned_mentor_user_id', userId)
    setHelpingSignalIds(new Set(data?.map(s => s.signal_id) || []))
  }

  // --- Actions ---

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
    if (maskMode === 'student') {
      if (filter === 'By You') return signals.filter(s => s.user_id === userId)
      if (filter === 'Pending Request') return signals.filter(s => s.status === 'waiting_for_approval' || s.status === 'helping')
    } else {
      if (filter === 'Pending Request') return signals.filter(s => s.assigned_mentor_user_id === userId)
    }
    return signals
  }, [signals, filter, maskMode, userId])

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
          <div className="flex gap-2 mb-6">
            {(maskMode === 'student' ? ['All', 'By You', 'Pending Request'] : ['All', 'Pending Request']).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${filter === f ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Signals List */}
          <div className="flex-1 overflow-auto space-y-4">
            {filteredSignals.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No signals found.</p>
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
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {signal.tags.map(t => <span key={t} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">{t}</span>)}
                    </div>

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
                      
                      {maskMode === 'mentor' && signal.status === 'open' && !helpingSignalIds.has(signal.signal_id) && (
                        <button
                          onClick={() => handleRequestToHelp(signal)}
                          disabled={isRequestingHelp === signal.signal_id}
                          className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-600 disabled:opacity-50"
                        >
                          {isRequestingHelp === signal.signal_id ? 'Requesting...' : 'Help'}
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
                    placeholder="Description" 
                    className="w-full p-3 border rounded-lg h-32" 
                    value={newSignal.description} 
                    onChange={e => setNewSignal({...newSignal, description: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Tags (comma separated)" 
                    className="w-full p-3 border rounded-lg" 
                    value={newSignal.tags} 
                    onChange={e => setNewSignal({...newSignal, tags: e.target.value})}
                  />
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
      </div>
    </AuthGuard>
  )
}