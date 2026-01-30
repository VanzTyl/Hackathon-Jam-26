'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // This immediately sends the user to /login
    router.push('/login')
  }, [router])

  return null // Returns nothing because the user is being redirected
}