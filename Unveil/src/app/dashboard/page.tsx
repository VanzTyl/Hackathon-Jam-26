<<<<<<< Updated upstream
'use client';
=======
function Dashboard(){
  return(
    <div className='min-h-screen bg-[#f8fafc] flex gap-6'>
      {/* Left Sidebar */}
      <aside className='w-56 bg-[#071033] text-white p-6 rounded-[32px] overflow-auto'>
        <div className='text-sm font-bold mb-8'>
          <div>CIIT</div>
          <div className='text-xs text-white/60'>University</div>
        </div>
        <nav className='space-y-2 mb-8'>
          <button className='w-full text-left px-4 py-3 rounded-full hover:bg-white/10'>🏠 Home</button>
          <button className='w-full text-left px-4 py-3 rounded-full bg-cyan-500/20 ring-1 ring-cyan-500'>💬 Your Forums</button>
          <button className='w-full text-left px-4 py-3 rounded-full hover:bg-white/10'>🔔 Signals</button>
        </nav>
        
        <div className='border-t border-white/10 pt-6 mb-8'>
          <div className='text-xs font-bold text-white/60 mb-3'>Courses 0</div>
          <div className='space-y-2 text-sm'>
            <button className='w-full text-left px-3 py-2 rounded hover:bg-white/5'>Public Finance</button>
            <button className='w-full text-left px-3 py-2 rounded hover:bg-white/5 bg-white/10'>Accounting</button>
            <button className='w-full text-left px-3 py-2 rounded hover:bg-white/5'>Corporate law</button>
          </div>
        </div>
        
        <button className='w-full py-2 bg-pink-500 text-white rounded-full font-semibold'>Join a new forum</button>
      </aside>

      {/* Center Feed */}
      <main className='flex-1 p-6 overflow-auto'>
        <div className='max-w-5xl mx-auto space-y-6'>
          <div className='flex gap-4 items-center'>
            <input type='text' placeholder='Type to search' className='flex-1 bg-white rounded-[32px] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.05)]' />
            <div className='flex gap-2'>
              <button className='px-4 py-2 bg-white rounded-full text-sm shadow-[0_20px_50px_rgba(0,0,0,0.05)]'>Mask Mode: On</button>
              <button className='w-10 h-10 bg-cyan-500 text-white rounded-full'>+</button>
            </div>
          </div>
          
          <div className='bg-slate-200/40 px-4 py-2 rounded-[24px] text-sm text-slate-600'>🔒 Mask Mode Active - Posts will be anonymous</div>
          
          <div className='space-y-6'>
            <p>rahh im the dashboard rawr</p>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className='w-72 p-6 overflow-auto'>
        <div className='bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-6'>
          <div className='flex gap-4 items-start'>
            <div className='w-16 h-16 rounded-full bg-slate-300'></div>
            <div>
              <h3 className='font-semibold text-slate-900'>Dr Ronald Jackson</h3>
              <p className='text-xs text-cyan-600'>Tutor</p>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            <button className='w-full py-2 border border-cyan-300 rounded-full text-cyan-600 text-sm'>Student Number</button>
            <button className='w-full py-2 border border-cyan-300 rounded-full text-cyan-600 text-sm'>CIIT Email</button>
          </div>
        </div>
        
        <div className='bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'>
          <h3 className='font-semibold text-slate-900 mb-4'>Connections</h3>
          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-3'><div className='w-10 h-10 rounded-full bg-pink-300'></div><span>Leslie Alexander</span></div>
            <div className='flex items-center gap-3'><div className='w-10 h-10 rounded-full bg-amber-300'></div><span>Darlene Robertson</span></div>
            <div className='flex items-center gap-3'><div className='w-10 h-10 rounded-full bg-blue-300'></div><span>Albert Flores</span></div>
          </div>
        </div>
      </aside>
    </div>
  )
}
>>>>>>> Stashed changes

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you would clear the session/token here
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome back!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h2>
              <p className="text-gray-600">
                You have successfully logged in. This is your protected dashboard page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}