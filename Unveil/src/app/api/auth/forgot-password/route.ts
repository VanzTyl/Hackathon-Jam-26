import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db, generatePasswordResetToken } from '@/lib/database';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Send password reset email
async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${email}`;
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // You can change this later
      to: [email],
      subject: 'Reset your CIIT Account Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reset Your CIIT Account Password</h2>
          <p>You requested to reset your password for your CIIT Portal account. Click the link below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 15 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Password reset email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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
    if (!db.userExists(email)) {
      // Don't reveal that the user doesn't exist for security
      return NextResponse.json(
        { message: 'If an account with this email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    
    // Store reset token with 15 minute expiry
    db.setPasswordResetToken(email, resetToken);

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account with this email exists, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}