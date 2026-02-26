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

    // **AKEDLY.IO VERIFICATION**
    const AKEDLY_VERIFY_URL = process.env.OTP_PLATFORM_VERIFY_URL;
    const AKEDLY_API_KEY = process.env.OTP_API_KEY;

    if (!AKEDLY_VERIFY_URL || !AKEDLY_API_KEY) {
      console.error('❌ AKEDLY VERIFICATION CREDENTIALS MISSING');
      return NextResponse.json(
        { error: 'OTP verification service not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Verifying OTP via Akedly.io');
    console.log('Phone:', `+${phoneWithCountryCode}`);
    console.log('Session ID:', sessionId);

    try {
      const response = await fetch(AKEDLY_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AKEDLY_API_KEY}`,
          'x-api-key': AKEDLY_API_KEY,
        },
        body: JSON.stringify({
          phone: `+${phoneWithCountryCode}`,
          phoneNumber: `+${phoneWithCountryCode}`,
          to: `+${phoneWithCountryCode}`,
          otp: otp,
          code: otp,
          verification_code: otp,
          session_id: sessionId,
          request_id: sessionId,
        }),
      });

      const responseText = await response.text();
      console.log('Akedly Verify Response Status:', response.status);
      console.log('Akedly Verify Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse Akedly verify response');
        if (!response.ok) {
          return NextResponse.json(
            { error: 'Invalid OTP' },
            { status: 401 }
          );
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || 'Invalid OTP';
        console.error('❌ Akedly Verification Failed:', errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: 401 }
        );
      }

      // Check if verification was successful
      const isVerified = data?.verified || data?.success || data?.valid || response.ok;
      
      if (!isVerified) {
        console.error('❌ OTP verification failed');
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 401 }
        );
      }

      console.log('✅ OTP verified successfully via Akedly.io');

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

    } catch (fetchError: unknown) {
      console.error('❌ Akedly Verification API Error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Verification failed: ${errorMessage}` },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('❌ Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
