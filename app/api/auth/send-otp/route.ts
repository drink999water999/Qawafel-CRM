import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

    // Validate phone number length
    // Should be either 12 digits (with 966) or 9 digits (without country code)
    if (cleanPhone.length !== 12 && cleanPhone.length !== 9) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Ensure phone has country code
    const phoneWithCountryCode = cleanPhone.startsWith('966') 
      ? cleanPhone 
      : `966${cleanPhone}`;

    // Validate Saudi number (should start with 966 5)
    if (!phoneWithCountryCode.startsWith('9665')) {
      return NextResponse.json(
        { error: 'Please enter a valid Saudi phone number starting with 5' },
        { status: 400 }
      );
    }

    // **CONFIGURE YOUR OTP PLATFORM HERE**
    // Replace with your actual OTP platform API
    const OTP_PLATFORM_URL = process.env.OTP_PLATFORM_URL || 'https://your-otp-platform.com/api/send';
    const OTP_API_KEY = process.env.OTP_API_KEY || '';

    // Example: Send OTP via your platform
    const response = await fetch(OTP_PLATFORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        phone: `+${phoneWithCountryCode}`, // Send with + prefix
        // Callback URLs for your OTP platform
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        // Some platforms might need additional fields
        channel: 'sms', // or 'whatsapp'
        sender_id: process.env.OTP_SENDER_ID || 'YourApp',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Return session ID if your OTP platform provides one
      sessionId: data.session_id || data.request_id,
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
