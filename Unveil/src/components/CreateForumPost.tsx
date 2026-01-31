'use client'

import { useState } from 'react'
import { supabase } from '@/supabase-client'

interface CreateForumPostProps {
  onPostCreated: (newPost: any) => void
}

// Changed to UPPERCASE to match what your DB likely expects based on the error
const COURSE_TAGS = ["BSIS", "BSEMC", "BSA", "BSE", "BMMA", "BSCS"]

export default function CreateForumPost({ onPostCreated }: CreateForumPostProps) {
  const [title, setTitle] = useState('')
  const [forumText, setForumText] = useState('')
  const [selectedTag, setSelectedTag] = useState('BSIS')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !forumText.trim()) return

    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please log in first")
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('forum')
      .insert([
        { 
          title: title, 
          forum_text: forumText, 
          tag: selectedTag, // Sending uppercase e.g., "BSIS"
          user_id: user.id 
        }
      ])
      .select(`*, users!fk_forum_user (masked_name, image_url)`)
      .single()

    if (error) {
      console.error("DB Error:", error.message)
      alert("Error: " + error.message)
    } else {
      onPostCreated(data)
      setTitle('')
      setForumText('')
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input 
        type="text"
        placeholder="Forum Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
        required
      />
      
      <textarea 
        placeholder="What would you like to say?"
        value={forumText}
        onChange={(e) => setForumText(e.target.value)}
        style={textAreaStyle}
        required
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#ccc', fontSize: '14px' }}>Course Tag:</label>
        <select 
          value={selectedTag} 
          onChange={(e) => setSelectedTag(e.target.value)}
          style={selectStyle}
        >
          {COURSE_TAGS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isSubmitting} style={buttonStyle}>
        {isSubmitting ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  )
}

// Styling to match your screenshot
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' }
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff', outline: 'none' }
const textAreaStyle = { ...inputStyle, minHeight: '120px', resize: 'none' as any }
const selectStyle = { padding: '8px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer' }
const buttonStyle = { padding: '12px', background: '#00d1ff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }