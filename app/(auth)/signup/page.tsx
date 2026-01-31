'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Left Section - Dark Background */}
      <div className="w-1/2 bg-slate-950 text-white flex flex-col justify-between p-12">
        {/* Back Button */}
        <Link href="/welcome" className="text-slate-300 hover:text-white flex items-center gap-2 w-fit">
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>

        {/* Logo and Welcome Message */}
        <div>
          <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center mb-8">
            <Eye className="w-7 h-7 text-slate-950" />
          </div>

          <h1 className="text-5xl font-bold mb-6">
            Join the<br />
            <span className="text-cyan-400">CIIT Community</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed">
            Create your account and start connecting with fellow students and faculty. Your voice matters here.
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-slate-300">Access all course forums instantly</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-slate-300">Post anonymously with Mask Mode</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-slate-300">Connect directly with classmates</span>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-cyan-400 border-2 border-slate-950"></div>
            <div className="w-10 h-10 rounded-full bg-cyan-500 border-2 border-slate-950"></div>
            <div className="w-10 h-10 rounded-full bg-cyan-600 border-2 border-slate-950"></div>
            <div className="w-10 h-10 rounded-full bg-cyan-700 border-2 border-slate-950"></div>
          </div>
          <p className="text-slate-300">Join your fellow CIITzens today!</p>
        </div>
      </div>

      {/* Right Section - Light Background */}
      <div className="w-1/2 bg-slate-50 flex items-center justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-500 font-medium">
                Log in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Juan"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Dela Cruz"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                CIIT Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="your.name@ciit.edu.ph"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Student ID
              </label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="2024-00001"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Role (Mask)
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none bg-white text-slate-600">
                  <option>Select your role</option>
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>Alumni</option>
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Must be at least 8 characters</p>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 border border-slate-300 rounded cursor-pointer mt-1 flex-shrink-0"
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <Link href="/terms" className="text-cyan-400 hover:text-cyan-500">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-500">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-500 text-white font-bold rounded-lg transition"
            >
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Icons
function ArrowLeft({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function Eye({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function User({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function Mail({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IdCard({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m4-16h5a2 2 0 012 2v10a2 2 0 01-2 2h-5m-4-4v4m0-11v3m0 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function Users({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 5h4m-4 0a4 4 0 110-8 4 4 0 010 8z" />
    </svg>
  );
}

function Lock({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
    </svg>
  );
}