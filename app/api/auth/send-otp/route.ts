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

    // **AKEDLY.IO CONFIGURATION**
    const AKEDLY_API_URL = process.env.OTP_PLATFORM_URL;
    const AKEDLY_API_KEY = process.env.OTP_API_KEY;

    if (!AKEDLY_API_URL || !AKEDLY_API_KEY) {
      console.error('❌ AKEDLY CREDENTIALS MISSING');
      console.error('OTP_PLATFORM_URL:', AKEDLY_API_URL);
      console.error('OTP_API_KEY:', AKEDLY_API_KEY ? 'SET' : 'NOT SET');
      return NextResponse.json(
        { error: 'OTP service not configured. Please add OTP_PLATFORM_URL and OTP_API_KEY to Vercel.' },
        { status: 500 }
      );
    }

    console.log('📱 Sending OTP via Akedly.io');
    console.log('API URL:', AKEDLY_API_URL);
    console.log('Phone:', `+${phoneWithCountryCode}`);

    try {
      // Akedly.io API call
      const response = await fetch(AKEDLY_API_URL, {
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
          country_code: '966',
          mobile: cleanPhone.slice(-9),
          channel: 'sms',
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          app_name: process.env.OTP_SENDER_ID || 'Qawafel CRM',
        }),
      });

      const responseText = await response.text();
      console.log('Akedly Response Status:', response.status);
      console.log('Akedly Response Body:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse Akedly response as JSON');
        if (!response.ok) {
          return NextResponse.json(
            { error: `OTP service error (${response.status}): ${responseText}` },
            { status: response.status }
          );
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || data?.msg || 'Failed to send OTP';
        console.error('❌ Akedly Error:', errorMessage);
        console.error('Full response:', data);
        return NextResponse.json(
          { error: `Failed to send OTP: ${errorMessage}` },
          { status: response.status }
        );
      }

      console.log('✅ OTP sent successfully via Akedly.io');
      console.log('Session ID:', data?.session_id || data?.request_id || data?.id);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        sessionId: data?.session_id || data?.request_id || data?.id || `akedly-${Date.now()}`,
      });

    } catch (fetchError: unknown) {
      console.error('❌ Akedly API Connection Error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      return NextResponse.json(
        { error: `Failed to connect to OTP service: ${errorMessage}` },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('❌ Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
