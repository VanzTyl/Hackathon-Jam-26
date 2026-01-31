'use client'

import { useEffect, useState } from 'react'
import ForumCard, { Forum } from "@/components/ForumCard"
import { supabase } from "@/supabase-client"
import AuthGuard from '@/components/AuthGuard'

export default function ForumsPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForums = async () => {
      // If nothing shows, try changing this to .select('*') first 
      // just to see if raw data appears without the user join.
     const { data, error } = await supabase
  .from('forum')
  .select(`
    *,
    users!fk_forum_user (
      masked_name,
      image_url
    )
  `) 
  .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase Error:', error.message);
      } else {
        console.log('Fetched Data:', data); // Check your browser console (F12) for this!
        setForums((data as any) || []);
      }
      setLoading(false);
    }

    fetchForums();
  }, [])

  if (loading) return <div style={{ color: 'white', padding: '50px' }}>Loading Forums...</div>

  return (
    <AuthGuard>
      <main style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', marginBottom: '20px' }}>Community Feed</h1>
          
          {forums.length > 0 ? (
            forums.map((f) => <ForumCard key={f.id} forum={f} />)
          ) : (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
              <p>No posts found.</p>
              <p style={{ fontSize: '12px' }}>Check F12 console for "Fetched Data"</p>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}