'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 1. Lists for random name generation
const adjectives = ['Secret', 'Hidden', 'Mighty', 'Swift', 'Silent', 'Golden', 'Neon', 'Brave', 'Scaredy', 'Cute', 'Evil', 'Global', 'Social', 'Silly', 'Giving', 'Elden'];
const animals = ['Panda', 'Eagle', 'Fox', 'Lion', 'Cat', 'Wolf', 'Tiger', 'Owl', 'Kitty', 'Coffee', 'Bear', 'Jam', 'Hacker', 'Whale', 'Shark', 'Seal', 'Goober'];

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mask, setMask] = useState<'student' | 'tutor'>('student')
  const [message, setMessage] = useState('')
  
  const router = useRouter()

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('Processing...')

    if (!email.endsWith('@ciit.edu.ph')) {
      setMessage('Error: Only @ciit.edu.ph emails are allowed.')
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setMessage(`Auth Error: ${authError.message}`)
      return
    }

    if (authData.user) {
      // 2. Generate the Random Masked Name
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      const randomNumber = Math.floor(100 + Math.random() * 900); // e.g., 482
      const randomMaskedName = `${randomAdjective}${randomAnimal}${randomNumber}`;

      const defaultImage = mask === 'student' ? 'student.png' : 'tutor.png'
      const fullImageUrl = `https://ymjiaznhhzkxbskuqmra.supabase.co/storage/v1/object/public/images/${defaultImage}`

      // 3. Insert into 'users' table including 'masked_name'
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            user_id: authData.user.id,
            email_address: email,
            first_name: firstName,
            last_name: lastName,
            mask: mask,
            image_url: fullImageUrl,
            masked_name: randomMaskedName, // New column from your schema
          },
        ])

      if (dbError) {
        setMessage(`Database Error: ${dbError.message}`)
      } else {
        setMessage(`Success! Your masked identity is: ${randomMaskedName}. Redirecting...`)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }
  }

  // ... (rest of your return JSX stays the same)

  return (
    <div>
      <h1>CIIT Register</h1>
      <form onSubmit={handleRegister} className='register-form'>
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
        <button type="submit" className='form-button'>Register</button>
      </form>

      {message && <p>{message}</p>}

      <hr />
      <p>Already have an account?</p>
      {/* Option to go to login page */}
      <Link href="/login">
        <button type="button">Go to Login</button>
      </Link>
    </div>
  )
}