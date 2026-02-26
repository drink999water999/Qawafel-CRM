import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, sessionId } = await request.json();

    // Validate inputs
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Ensure phone has country code
    const phoneWithCountryCode = cleanPhone.startsWith('966') 
      ? cleanPhone 
      : `966${cleanPhone}`;

    // **CONFIGURE YOUR OTP PLATFORM HERE**
    // Replace with your actual OTP platform verification endpoint
    const OTP_PLATFORM_URL = process.env.OTP_PLATFORM_VERIFY_URL || 'https://your-otp-platform.com/api/verify';
    const OTP_API_KEY = process.env.OTP_API_KEY || '';

    // Verify OTP with your platform
    const response = await fetch(OTP_PLATFORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        phone: `+${phoneWithCountryCode}`, // Send with + prefix
        otp: otp,
        session_id: sessionId, // If your platform uses session IDs
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    const verificationData = await response.json();

    // Check if verification was successful
    if (!verificationData.verified && !verificationData.success) {
      return NextResponse.json(
        { error: 'OTP verification failed' },
        { status: 401 }
      );
    }

    // Create session token using JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    );

    const token = await new SignJWT({ phone: phoneWithCountryCode })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully',
      phone: phoneWithCountryCode,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
