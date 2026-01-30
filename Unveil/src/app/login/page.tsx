'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('Logging in...')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setMessage(`Login Error: ${authError.message}`)
      return
    }

    if (authData.user) {
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('mask')
        .eq('user_id', authData.user.id)
        .maybeSingle() // Safer than .single()

      if (dbError) {
        setMessage(`Error fetching profile: ${dbError.message}`)
      } else if (!userData) {
        // If they exist in Auth but not in your 'users' table
        setMessage("No profile found. Redirecting to setup...")
        router.push('/register') 
      } else {
        setMessage(`Success! Redirecting...`)
        
        // This takes them to src/app/dashboard/page.tsx
        router.push('/dashboard')
      }
    }
  }
  return (
    <div>
      <h1>CIIT Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
      
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  )
}