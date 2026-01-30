import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db, generateVerificationCode } from '@/lib/database';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification email
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // You can change this later
      to: [email],
      subject: 'Verify your CIIT Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verify Your CIIT Account</h2>
          <p>Thank you for registering with CIIT Portal. Please use the verification code below to activate your account:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #1f2937;">${code}</span>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
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

    // Get stored verification code
    const storedVerification = db.getVerificationCode(email);
    
    if (!storedVerification) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      );
    }

    // Check if code has expired
    if (Date.now() > storedVerification.expires) {
      db.deleteVerificationCode(email);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Check if code matches
    if (storedVerification.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Get user and mark as verified
    const user = db.getUser(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Mark user as verified
    db.updateUser(email, { isVerified: true });

    // Clean up verification code
    db.deleteVerificationCode(email);

    return NextResponse.json(
      { 
        message: 'Email verified successfully! You can now log in.',
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json();

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

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code with 15 minute expiry
    db.setVerificationCode(email, verificationCode);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'New verification code sent to your email',
        // For demo purposes, include the code in development
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}