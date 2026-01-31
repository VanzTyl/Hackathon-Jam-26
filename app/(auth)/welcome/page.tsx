'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Unveil</h1>
            <p className="text-xs text-slate-600">CIIT College</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-900 font-medium">Log in</button>
          <button className="px-6 py-2 bg-cyan-400 text-white font-medium rounded-full hover:bg-cyan-500">
            Sign up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-20">
        <div className="grid grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex items-center gap-2 bg-cyan-100 text-cyan-600 px-4 py-2 rounded-full w-fit">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Anonymous Mode Available</span>
            </div>
            
            <h2 className="text-6xl font-bold text-slate-900 mb-6">
              Connect<br />with your<br />
              <span className="text-cyan-400">CIIT Community</span>
            </h2>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Unveil brings students and faculty together in a safe, engaging space. Share ideas, ask questions, and collaborate — with the freedom to stay anonymous when you need it.
            </p>

            <div className="flex gap-4">
              <button className="px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border-2 border-slate-900 text-slate-900 font-medium rounded-full hover:bg-slate-50">
                I have an account
              </button>
            </div>
          </div>

          {/* Right Section - Feature Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Forums Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <MessageSquare className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Forums</h3>
              <p className="text-slate-600 text-sm">
                Engage in course-specific discussions and share knowledge with classmates.
              </p>
            </div>

            {/* Chat Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <Users className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Chat</h3>
              <p className="text-slate-600 text-sm">
                Direct messaging with students and faculty. Stay connected anytime.
              </p>
            </div>

            {/* Mask Mode Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <Bookmark className="w-10 h-10 text-slate-900 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mask Mode</h3>
              <p className="text-slate-600 text-sm">
                Post anonymously as a CIITzen. Your identity stays hidden until you choose to reveal it.
              </p>
            </div>

            {/* Safe Space Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <Shield className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Safe Space</h3>
              <p className="text-slate-600 text-sm">
                A moderated community where respectful dialogue is encouraged.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-8 py-6 mt-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <p className="text-slate-600 text-sm">Unveil - CIIT College</p>
          </div>
          <p className="text-slate-600 text-sm">2026 Unveil. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Icon components (use lucide-react or your preferred icon library)
function Eye({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function Lock({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function ArrowRight({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MessageSquare({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

function Bookmark({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z" />
    </svg>
  );
}

function Shield({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}