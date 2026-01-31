'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/supabase-client' 

// --- TYPES (Matched to your DB Schema) ---
type UserProfile = {
  first_name: string
  last_name: string
  masked_name: string
  mask: string 
}

type MessageData = {
  message_id: string
  chat_room_id: string
  user_id: string
  message: string     // Verified: matches your schema
  created_at: string
  users: UserProfile 
}

type ChatProps = {
  roomId: string      // This passes the chat_room_id
  currentUserId: string
}

export default function UnveilChat({ roomId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [roomStatus, setRoomStatus] = useState<'active' | 'unmasked' | 'completed'>('active')
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. FETCH HISTORY
    const initData = async () => {
      // Get Messages
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select(`
          message_id,
          chat_room_id,
          user_id,
          message,
          created_at,
          users (first_name, last_name, masked_name, mask)
        `)
        .eq('chat_room_id', roomId) // Verified column name
        .order('created_at', { ascending: true })
      
      if (msgData) setMessages(msgData as any)
      if (msgError) console.error("Error fetching messages:", msgError)

      // Get Room Status
      const { data: roomData } = await supabase
        .from('chatroom') // Verified table name
        .select('status')
        .eq('chat_room_id', roomId) // Verified column name
        .single()
      
      if (roomData) setRoomStatus(roomData.status)
    }

    initData()

    // 2. REALTIME LISTENERS
    // Listener A: New Messages
    const messageChannel = supabase
      .channel(`room-msg:${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `chat_room_id=eq.${roomId}` 
        },
        async (payload) => {
           // Fetch sender details immediately
           const { data: userData } = await supabase
             .from('users')
             .select('first_name, last_name, masked_name, mask')
             .eq('user_id', payload.new.user_id)
             .single()

           const newMsg = { ...payload.new, users: userData } as MessageData
           setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    // Listener B: Unmasking Event
    const statusChannel = supabase
      .channel(`room-status:${roomId}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chatroom', 
          filter: `chat_room_id=eq.${roomId}` 
        },
        (payload) => {
          if (payload.new.status) {
            setRoomStatus(payload.new.status)
          }
        }
      )
      .subscribe()

    return () => { 
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(statusChannel)
    }
  }, [roomId])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({ 
        chat_room_id: roomId, 
        user_id: currentUserId, 
        message: inputText 
      })

    if (!error) setInputText('')
    else console.error("Error sending:", error)
  }

  const isUnmasked = roomStatus === 'unmasked'

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-700 rounded-lg">
      
      {/* HEADER */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg">
             {isUnmasked ? "Unmasked Session" : "Anonymous Mode"}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${isUnmasked ? 'bg-green-500/20 text-green-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
            {isUnmasked ? 'IDENTITIES VISIBLE' : 'MASKS ON'}
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId
          
          // Unveil Logic: Real Name vs Masked Name
          const displayName = isUnmasked 
            ? `${msg.users.first_name} ${msg.users.last_name}`
            : msg.users.masked_name

          return (
            <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'bg-indigo-600' : 'bg-slate-700'} rounded-2xl px-4 py-2 text-white`}>
                <div className="text-xs opacity-75 mb-1 font-bold flex gap-1 items-center">
                   {!isUnmasked && <span>🎭</span>}
                   {displayName}
                </div>
                <p>{msg.message}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input
          className="flex-1 bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" disabled={!inputText} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Send</button>
      </form>
    </div>
  )
}