import React from 'react'

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

export default function ForumCard({ forum }: { forum: Forum }) {
  // Fallbacks prevent the component from crashing or hiding if Join fails
  const avatar = forum.users?.image_url || 'https://via.placeholder.com/40';
  const name = forum.users?.masked_name || 'Unknown User';

  return (
    <div style={{ 
      border: "1px solid #333", 
      borderRadius: "12px", 
      padding: "20px", 
      backgroundColor: "#111", 
      marginBottom: "15px",
      color: "white" 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={avatar} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: "1px solid #00eeff" }} 
            alt="avatar" 
          />
          <span style={{ color: '#00eeff', fontWeight: 'bold' }}>{name}</span>
        </div>
        {forum.tag && (
          <span style={{ backgroundColor: '#00eeff', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
            {forum.tag}
          </span>
        )}
      </div>
      <h2 style={{ fontSize: "20px", margin: "10px 0" }}>{forum.title}</h2> 
      <p style={{ color: "#ccc" }}>{forum.forum_text}</p>
    </div>
  )
}