import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

// Flexible OTP verification configuration
const OTP_CONFIG = {
  // API Endpoints
  verifyUrl: process.env.OTP_VERIFY_URL || process.env.OTP_PLATFORM_VERIFY_URL,
  
  // Authentication
  apiKey: process.env.OTP_API_KEY,
  authHeader: process.env.OTP_AUTH_HEADER || 'Authorization',
  authPrefix: process.env.OTP_AUTH_PREFIX || 'Bearer',
  
  // Request field names (customize for your OTP provider)
  phoneField: process.env.OTP_PHONE_FIELD || 'phone',
  otpField: process.env.OTP_OTP_FIELD || 'otp',
  sessionIdField: process.env.OTP_SESSION_ID_FIELD || 'session_id',
  
  // Response field names (comma-separated fallbacks)
  successFields: (process.env.OTP_SUCCESS_FIELDS || 'verified,success,valid').split(','),
};

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

    // Check if OTP verification service is configured
    if (!OTP_CONFIG.verifyUrl || !OTP_CONFIG.apiKey) {
      console.error('❌ OTP VERIFICATION SERVICE NOT CONFIGURED');
      console.error('Missing:', {
        OTP_VERIFY_URL: !OTP_CONFIG.verifyUrl,
        OTP_API_KEY: !OTP_CONFIG.apiKey,
      });
      return NextResponse.json(
        { error: 'OTP verification service not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Verifying OTP');
    console.log('Phone:', `+${phoneWithCountryCode}`);
    console.log('Session ID:', sessionId);

    try {
      // Build flexible request body based on configuration
      const requestBody: Record<string, string> = {};
      
      // Add phone using configured field name
      requestBody[OTP_CONFIG.phoneField] = `+${phoneWithCountryCode}`;
      
      // Also add common alternative field names for compatibility
      if (OTP_CONFIG.phoneField !== 'phoneNumber') {
        requestBody['phoneNumber'] = `+${phoneWithCountryCode}`;
      }
      if (OTP_CONFIG.phoneField !== 'to') {
        requestBody['to'] = `+${phoneWithCountryCode}`;
      }
      
      // Add OTP code using configured field name
      requestBody[OTP_CONFIG.otpField] = otp;
      
      // Also add common alternative field names
      if (OTP_CONFIG.otpField !== 'code') {
        requestBody['code'] = otp;
      }
      if (OTP_CONFIG.otpField !== 'verification_code') {
        requestBody['verification_code'] = otp;
      }
      
      // Add session ID using configured field name
      if (sessionId && OTP_CONFIG.sessionIdField) {
        requestBody[OTP_CONFIG.sessionIdField] = sessionId;
        
        // Also add common alternative field names
        if (OTP_CONFIG.sessionIdField !== 'request_id') {
          requestBody['request_id'] = sessionId;
        }
      }

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

      console.log('Request URL:', OTP_CONFIG.verifyUrl);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(OTP_CONFIG.verifyUrl, {
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
            { error: 'Invalid OTP' },
            { status: 401 }
          );
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || 'Invalid OTP';
        console.error('❌ OTP Verification Failed:', errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: 401 }
        );
      }

      // Check if verification was successful (check multiple possible fields)
      let isVerified = false;
      
      for (const field of OTP_CONFIG.successFields) {
        const trimmedField = field.trim();
        if (data?.[trimmedField] === true || data?.[trimmedField] === 'true' || data?.[trimmedField] === 1) {
          isVerified = true;
          console.log(`Verification success found in field: ${trimmedField}`);
          break;
        }
      }
      
      // If status is 200 and no explicit success field found, assume success
      if (!isVerified && response.status === 200) {
        isVerified = true;
        console.log('Assuming success based on HTTP 200 status');
      }
      
      if (!isVerified) {
        console.error('❌ OTP verification failed');
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 401 }
        );
      }

      console.log('✅ OTP verified successfully');

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
      console.error('❌ OTP Verification API Error:', fetchError);
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
