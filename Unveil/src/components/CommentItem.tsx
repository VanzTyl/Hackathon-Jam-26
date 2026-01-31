import React from 'react'

export interface CommentData {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  forum_id: number;
  // If you join with profiles/users table:
  users?: {
    masked_name: string;
    image_url: string;
  }
}

export default function CommentItem({ comment }: { comment: CommentData }) {
  const name = comment.users?.masked_name || 'Anonymous';
  
  return (
    <div style={{ 
      padding: '10px 0', 
      borderBottom: '1px solid #222', 
      fontSize: '14px' 
    }}>
      <div style={{ color: '#00eeff', fontWeight: 'bold', fontSize: '12px' }}>
        {name}
      </div>
      <div style={{ color: '#ddd', marginTop: '4px' }}>
        {comment.content}
      </div>
    </div>
  )
}

