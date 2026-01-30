'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../supabase-client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mask, setMask] = useState<'student' | 'tutor'>('student')
  const [message, setMessage] = useState('')

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('Processing...')

    // 1. Domain Validation
    if (!email.endsWith('@ciit.edu.ph')) {
      setMessage('Error: Only @ciit.edu.ph emails are allowed.')
      return
    }

    // 2. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setMessage(`Auth Error: ${authError.message}`)
      return
    }

    // 3. Insert the extra details into your 'users' table
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            user_id: authData.user.id, // Linking Auth ID to your table
            email_address: email,
            first_name: firstName,
            last_name: lastName,
            mask: mask,
          },
        ])

      if (dbError) {
        setMessage(`Database Error: ${dbError.message}`)
      } else {
        setMessage('Registration successful! Check your email for verification.')
      }
    }
  }

  return (
    <div>
      <h1>CIIT Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div>
          <label>Email (@ciit.edu.ph):</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role (Mask):</label>
          <select value={mask} onChange={(e) => setMask(e.target.value as 'student' | 'tutor')}>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}