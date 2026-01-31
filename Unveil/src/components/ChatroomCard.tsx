import React from 'react'

export interface Chatroom{
    id: number;
    name: string;
    created_at: string;
}

interface ChatroomsProps{
    chatroom: Chatroom;
}

function ChatroomCard({chatroom}: ChatroomsProps) {
  return (
    <div className='chatroom-card'>
      <p>{chatroom.name}</p>
    </div>
  )
}

export default ChatroomCard
