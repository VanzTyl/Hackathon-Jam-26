'use client'

import { useEffect, useState } from 'react'
import ForumCard from "@/components/ForumCard"
import { supabase } from "@/supabase-client"

interface Forum {
  id: number;
  title: string; 
  forum_text: string;
  created_at: string;
  user_id: string;
}

function Forums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForums = async () => {
     
      const { data, error } = await supabase
  .from('forum')
  .select('*') 
  .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Error fetching forums:', error)
      } else {
        setForums(data || [])
      }
      setLoading(false)
    }

    fetchForums()
  }, [])

  if (loading) return <p>Loading forums...</p>

  return (
    <div className="forums-container">
      {forums.length > 0 ? (
        forums.map((forum) => (
          <ForumCard key={forum.id} forum={forum} />
        ))
      ) : (
        <p>No forums found. Be the first to post!</p>
      )}
    </div>
  )
}

export default Forums