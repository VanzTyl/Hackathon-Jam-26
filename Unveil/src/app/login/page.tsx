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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="unveil-card rounded-[45px] w-full max-w-md p-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Login</h1>
          <p className="text-slate-500 mt-2">Welcome back to Unveil</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="you@ciit.edu.ph"
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

          {message && (
            <div className={`p-3 rounded-[16px] text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-cyan-500 text-white rounded-[20px] font-semibold hover:bg-cyan-600 transition">
            Login
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-cyan-600 font-semibold hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}