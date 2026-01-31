import React from 'react'

export interface Forum {
  id: number;
  title: string;      
  forum_text: string;
  created_at: string;
  user_id: string;
} //THIS DEFINES WHAT ARE THE COLUMNS INSIDE OF FORUM TABLE SO THIS PROGRAM KNOWS WHAT IT NEEDS TO USE!!!!!!!!!!!!!!

interface ForumCardProps {
  forum: Forum;
} //IDK WHAT THIS DOES

//PASSES IT AS A PROP. THIS FRAMEWORK IS SO WEIRD
function ForumCard({ forum }: ForumCardProps) {
  return (
    <div className='bg-white rounded-[45px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-0'>
      <div className='flex items-start gap-4 mb-4'>
        <div className='w-14 h-14 rounded-full bg-slate-300 flex-shrink-0'></div>
        <div className='flex-1'>
          <h1 className='text-xl font-semibold text-slate-900'>{forum.title}</h1> 
          <p className='text-sm text-slate-500'>{forum.user_id} · {forum.created_at}</p>
        </div>
      </div>
      <p className='text-slate-700 mb-4 leading-relaxed'>{forum.forum_text}</p>
      <button className='px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50'>Add Response</button>
    </div>
  )
}

export default ForumCard