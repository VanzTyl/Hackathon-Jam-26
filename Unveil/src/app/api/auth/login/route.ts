import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email is @ciit.edu.ph
    if (!email.endsWith('@ciit.edu.ph')) {
      return NextResponse.json(
        { error: 'Only @ciit.edu.ph email addresses are allowed' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = db.getUser(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Check password (in production, use proper password hashing!)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Login successful
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id || email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}