'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className='welcome-page-container'>
      <h1>welcome yo</h1>
      
      
      <div className='buttons-container'>
        <nav className='navigation-bar'>
          <Link href="/dashboard">
            <button className='welcome-button' style={{margin:"20px"}}>
              Login
            </button>
          </Link>
        </nav>
        

        <Link href="/register">
          <button className='welcome-button'>
            Register
          </button>
        </Link>
      </div>
    </div>
  )
}