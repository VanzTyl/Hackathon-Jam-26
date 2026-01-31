import React from 'react'

export interface Chatroom{
    chat_room_id: string;   // Changed the name and data type to match the column DB name
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
