'use client'

import { useEffect, useState } from 'react'
import ForumCard, { Forum } from "@/components/ForumCard"
import CreateForumPost from "@/components/CreateForumPost"
import { supabase } from "@/supabase-client"
import AuthGuard from '@/components/AuthGuard'

export default function ForumsPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false) // Toggle state

  useEffect(() => {
    const fetchForums = async () => {
      const { data, error } = await supabase
        .from('forum')
        .select(`*, users!fk_forum_user (masked_name, image_url)`) 
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching:', error.message);
      else setForums((data as any) || []);
      setLoading(false);
    }
    fetchForums();
  }, [])

  const handleNewPost = (newPost: Forum) => {
    setForums([newPost, ...forums]) // Add to top of list
    setIsFormOpen(false) // Hide the popup
  }

  if (loading) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>

  return (
    <AuthGuard>
      <main style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ color: 'white' }}>Community Feed</h1>
            <button onClick={() => setIsFormOpen(true)} style={openBtnStyle}>
              + Create Forum Post
            </button>
          </div>

          {/* THE MODAL OVERLAY */}
          {isFormOpen && (
            <div style={overlayStyle} onClick={() => setIsFormOpen(false)}>
              <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ color: 'white', margin: 0 }}>New Post</h2>
                  <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                </div>
                <CreateForumPost onPostCreated={handleNewPost} />
              </div>
            </div>
          )}

          {/* FEED */}
          {forums.map((f) => <ForumCard key={f.id} forum={f} />)}
        </div>
      </main>
    </AuthGuard>
  )
}

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }
const modalStyle: React.CSSProperties = { background: '#111', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '500px', border: '1px solid #333' }
const openBtnStyle = { padding: '10px 20px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }