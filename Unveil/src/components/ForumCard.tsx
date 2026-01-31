'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/supabase-client'
import CommentItem, { CommentData } from './CommentItem'

// Ensure this matches your ForumPage interface
export interface Forum {
  id: number;
  title: string;       
  forum_text: string;
  created_at: string;
  user_id: string;
  tag: 'BSCS' | 'BMMA' | 'BSEMC' | 'BSIS' | 'BSA' | 'BSE' | null; 
  users: {
    image_url: string;
    masked_name: string;
  } | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLVED';
}

export default function ForumCard({ forum }: { forum: Forum }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // 1. Fetch logic
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`*, users (masked_name, image_url)`)
      .eq('forum_id', forum.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error.message);
    } else {
      setComments(data || []);
    }
  };

  // 2. Trigger fetch when user toggles the section
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to comment.");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        content: newComment,
        forum_id: forum.id,
        user_id: user.id
      }])
      .select(`*, users (masked_name, image_url)`)
      .single();

    if (error) {
      alert(error.message);
    } else {
      setComments([...comments, data]); // Add new comment to UI immediately
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={cardStyle}>
      {/* Forum Content Section */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={forum.users?.image_url || 'https://via.placeholder.com/40'} style={avatarStyle} alt="avatar" />
          <div>
             <div style={{ color: '#00eeff', fontWeight: 'bold' }}>{forum.users?.masked_name || 'Anonymous'}</div>
             <div style={statusBadgeStyle(forum.status)}>{forum.status}</div>
          </div>
        </div>
        <span style={tagStyle}>{forum.tag}</span>
      </div>

      <h2 style={{ fontSize: "20px", margin: "10px 0" }}>{forum.title}</h2> 
      <p style={{ color: "#ccc", marginBottom: '20px' }}>{forum.forum_text}</p>

      {/* COMMENT TOGGLE */}
      <button onClick={() => setShowComments(!showComments)} style={commentToggleStyle}>
        {showComments ? '▲ Hide Comments' : `▼ View Comments (${comments.length || 0})`}
      </button>

      {/* 3. THE COMMENT AREA */}
      {showComments && (
        <div style={commentSectionStyle}>
          {/* LIST OF COMMENTS */}
          <div style={commentListStyle}>
            {comments.length > 0 ? (
              comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))
            ) : (
              <p style={{ color: '#555', fontSize: '12px', padding: '10px 0' }}>No comments yet.</p>
            )}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input 
              style={commentInputStyle}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" disabled={isSubmitting} style={sendBtnStyle}>
              {isSubmitting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// --- ALL STYLES DEFINED HERE ---
const cardStyle: React.CSSProperties = { border: "1px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#111", marginBottom: "15px", color: "white" };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: "10px" };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', border: "1px solid #444" };
const tagStyle = { backgroundColor: '#00eeff', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
const commentToggleStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', padding: 0 };
const commentSectionStyle: React.CSSProperties = { marginTop: '15px', borderTop: '1px solid #333', paddingTop: '15px' };
const commentListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' };
const commentInputStyle = { flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px', outline: 'none' };
const sendBtnStyle = { background: '#00eeff', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const statusBadgeStyle = (status: string) => ({ fontSize: '9px', fontWeight: 'bold' as const, marginTop: '2px', padding: '1px 4px', borderRadius: '3px', width: 'fit-content', border: `1px solid ${status === 'SOLVED' ? '#00ff88' : '#00eeff'}`, color: status === 'SOLVED' ? '#00ff88' : '#00eeff' });