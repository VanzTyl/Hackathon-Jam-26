'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../supabase-client'
import { useRouter } from 'next/navigation' // For redirecting
import Link from 'next/link' // For the login link

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mask, setMask] = useState<'student' | 'tutor'>('student')
  const [message, setMessage] = useState('')
  
  const router = useRouter() // Initialize router

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
            user_id: authData.user.id,
            email_address: email,
            first_name: firstName,
            last_name: lastName,
            mask: mask,
          },
        ])

      if (dbError) {
        setMessage(`Database Error: ${dbError.message}`)
      } else {
        setMessage('Registration successful! Redirecting...')
        
        // 4. Redirect to home page after a short delay so they can see the success message
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="unveil-card rounded-[45px] w-full max-w-md p-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Sign Up</h1>
          <p className="text-slate-500 mt-2">Join the Unveil community</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email (@ciit.edu.ph)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="john.doe@ciit.edu.ph"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">I am a...</label>
            <select
              value={mask}
              onChange={(e) => setMask(e.target.value as 'student' | 'tutor')}
              className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white"
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded-[16px] text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-cyan-500 text-white rounded-[20px] font-semibold hover:bg-cyan-600 transition">
            Create Account
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-cyan-600 font-semibold hover:underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}