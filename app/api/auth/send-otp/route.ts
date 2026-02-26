import { NextRequest, NextResponse } from 'next/server';

// Flexible OTP configuration - customize via environment variables
const OTP_CONFIG = {
  // API Endpoints
  sendUrl: process.env.OTP_SEND_URL || process.env.OTP_PLATFORM_URL,
  
  // Authentication
  apiKey: process.env.OTP_API_KEY,
  authHeader: process.env.OTP_AUTH_HEADER || 'Authorization', // or 'x-api-key'
  authPrefix: process.env.OTP_AUTH_PREFIX || 'Bearer', // or '' for no prefix
  
  // Request field names (customize for your OTP provider)
  phoneField: process.env.OTP_PHONE_FIELD || 'phone',
  countryCodeField: process.env.OTP_COUNTRY_CODE_FIELD || 'country_code',
  channelField: process.env.OTP_CHANNEL_FIELD || 'channel',
  
  // Response field names (comma-separated fallbacks)
  sessionIdFields: (process.env.OTP_SESSION_ID_FIELDS || 'session_id,request_id,id').split(','),
  
  // Default values
  channel: process.env.OTP_CHANNEL || 'sms',
  appName: process.env.OTP_SENDER_ID || 'Qawafel CRM',
};

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

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');

    // Validate phone number length (9 or 12 digits)
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

    // Validate Saudi number
    if (!phoneWithCountryCode.startsWith('9665')) {
      return NextResponse.json(
        { error: 'Please enter a valid Saudi phone number starting with 5' },
        { status: 400 }
      );
    }

    // Check if OTP service is configured
    if (!OTP_CONFIG.sendUrl || !OTP_CONFIG.apiKey) {
      console.error('❌ OTP SERVICE NOT CONFIGURED');
      console.error('Missing:', {
        OTP_SEND_URL: !OTP_CONFIG.sendUrl,
        OTP_API_KEY: !OTP_CONFIG.apiKey,
      });
      return NextResponse.json(
        { error: 'OTP service not configured. Add OTP_SEND_URL and OTP_API_KEY to Vercel.' },
        { status: 500 }
      );
    }

    console.log('📱 Sending OTP');
    console.log('Provider:', OTP_CONFIG.sendUrl);
    console.log('Phone:', `+${phoneWithCountryCode}`);

    try {
      // Build flexible request body based on configuration
      const requestBody: Record<string, string | number> = {};
      
      // Add phone using configured field name
      requestBody[OTP_CONFIG.phoneField] = `+${phoneWithCountryCode}`;
      
      // Also add common alternative field names for compatibility
      if (OTP_CONFIG.phoneField !== 'phoneNumber') {
        requestBody['phoneNumber'] = `+${phoneWithCountryCode}`;
      }
      if (OTP_CONFIG.phoneField !== 'to') {
        requestBody['to'] = `+${phoneWithCountryCode}`;
      }
      if (OTP_CONFIG.phoneField !== 'mobile') {
        requestBody['mobile'] = cleanPhone.slice(-9);
      }
      
      // Add country code using configured field name
      if (OTP_CONFIG.countryCodeField) {
        requestBody[OTP_CONFIG.countryCodeField] = '966';
      }
      
      // Add channel using configured field name
      if (OTP_CONFIG.channelField) {
        requestBody[OTP_CONFIG.channelField] = OTP_CONFIG.channel;
      }
      
      // Add app identifier
      requestBody['app_name'] = OTP_CONFIG.appName;
      requestBody['sender_id'] = OTP_CONFIG.appName;
      
      // Add callback URL
      requestBody['callback_url'] = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication header
      const authValue = OTP_CONFIG.authPrefix 
        ? `${OTP_CONFIG.authPrefix} ${OTP_CONFIG.apiKey}`
        : OTP_CONFIG.apiKey!;
      
      headers[OTP_CONFIG.authHeader!] = authValue;
      
      // Also add as x-api-key for compatibility
      if (OTP_CONFIG.authHeader !== 'x-api-key') {
        headers['x-api-key'] = OTP_CONFIG.apiKey!;
      }

      console.log('Request URL:', OTP_CONFIG.sendUrl);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      // Send request
      const response = await fetch(OTP_CONFIG.sendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Response Status:', response.status);
      console.log('Response Body:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse response as JSON');
        if (!response.ok) {
          return NextResponse.json(
            { error: `OTP service error (${response.status}): ${responseText}` },
            { status: response.status }
          );
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || data?.msg || 'Failed to send OTP';
        console.error('❌ OTP Provider Error:', errorMessage);
        console.error('Full response:', data);
        return NextResponse.json(
          { error: `Failed to send OTP: ${errorMessage}` },
          { status: response.status }
        );
      }

      // Extract session ID from response (check multiple possible fields)
      let sessionId = `session-${Date.now()}`;
      
      for (const field of OTP_CONFIG.sessionIdFields) {
        const trimmedField = field.trim();
        if (data?.[trimmedField]) {
          sessionId = data[trimmedField];
          console.log(`Session ID found in field: ${trimmedField}`);
          break;
        }
      }

      console.log('✅ OTP sent successfully');
      console.log('Session ID:', sessionId);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        sessionId,
      });

    } catch (fetchError: unknown) {
      console.error('❌ OTP API Connection Error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
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
