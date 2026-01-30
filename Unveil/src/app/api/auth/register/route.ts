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
    if (error instanceof Error) {
      console.error('Email error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Check if user already exists
    if (db.userExists(email)) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store user data (not verified yet)
    db.createUser({
      firstName,
      lastName,
      email,
      password, // In production, hash this password!
    });

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
        message: 'Registration successful. Please check your email for verification code.',
        // For demo purposes, include the code in development
        // In production, remove this!
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}