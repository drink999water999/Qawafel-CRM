import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

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
        phone: cleanPhone,
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
