'use client'

import { useEffect, useState } from 'react'
import ForumCard, { Forum } from "@/components/ForumCard" // Note the default and named import
import { supabase } from "@/supabase-client"

function Forums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForums = async () => {
      const { data, error } = await supabase
        .from('forum')
        .select(`
          *,
          users (
            image_url,
            masked_name
          )
        `) 
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching forums:', error)
      } else {
        // We cast to 'any' then to 'Forum[]' because Supabase's joined 
        // return types are complex for TS to guess automatically
        setForums((data as any) || [])
      }
      setLoading(false)
    }

    fetchForums()
  }, [])

  if (loading) return <p style={{ color: 'white' }}>Loading forums...</p>

  return (
    <div className="forums-container" style={{ padding: '20px' }}>
      {forums.length > 0 ? (
        forums.map((forum) => (
          <ForumCard key={forum.id} forum={forum} />
        ))
      ) : (
        <p style={{ color: 'white' }}>No forums found. Be the first to post!</p>
      )}
    </div>
  )
}

export default Forums