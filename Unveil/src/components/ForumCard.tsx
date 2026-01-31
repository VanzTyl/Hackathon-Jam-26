import React from 'react'

// Define the data structure clearly
export interface Forum {
  id: number;
  title: string;      
  forum_text: string;
  created_at: string;
  user_id: string;
  tag: 'CS' | 'BMMA' | 'BSEMC' | 'BSIS' | 'BSA' | 'BSE' | null;
  users: {
    image_url: string;
    masked_name: string;
  } | null;
}

interface ForumCardProps {
  forum: Forum;
}

export default function ForumCard({ forum }: ForumCardProps) {
  return (
    <div className='forum-card' style={{ border: "2px solid white", margin: "10px", padding: "15px", backgroundColor: "#000" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={forum.users?.image_url || 'https://via.placeholder.com/40'} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
            alt="profile" 
          />
          <span style={{ color: '#00eeff', fontWeight: 'bold' }}>{forum.users?.masked_name || 'Anonymous'}</span>
        </div>
        
        {/* Simple Tag Style */}
        {forum.tag && (
          <span style={{ 
            backgroundColor: '#00eeff', 
            color: '#000', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            fontWeight: 'bold' 
          }}>
            {forum.tag}
          </span>
        )}
      </div>
      
      <h2 style={{ fontSize: "22px", marginTop: "15px", color: "#fff" }}>{forum.title}</h2> 
      <p style={{ color: "#ccc" }}>{forum.forum_text}</p>
    </div>
  )
}