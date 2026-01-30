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
    <div className='forum-card' style={{border: "2px solid white", margin: "5px"}}>
      <h1 style={{fontSize: "25px"}}>{forum.title}</h1> 
      <p style={{fontSize: "15px"}}>{forum.forum_text}</p>
    </div>
  )
}

export default ForumCard