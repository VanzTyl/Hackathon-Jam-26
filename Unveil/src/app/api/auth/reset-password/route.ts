import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    // Validation
    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, token, and password are required' },
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

    // Get stored password reset token
    const storedToken = db.getPasswordResetToken(email);
    
    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (Date.now() > storedToken.expires) {
      db.deletePasswordResetToken(email);
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Check if token matches
    if (storedToken.token !== token) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Get user and update password
    const user = db.getUser(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Update user password
    db.updateUser(email, { password });

    // Clean up reset token
    db.deletePasswordResetToken(email);

    return NextResponse.json(
      { message: 'Password reset successful! You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}