import { NextRequest, NextResponse } from 'next/server';

// Backend callback URL that your OTP platform will call
// Vercel URL: https://yourdomain.vercel.app/api/auth/callback

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('OTP Platform Callback received:', data);

    // **CONFIGURE BASED ON YOUR OTP PLATFORM'S RESPONSE**
    // Different platforms send different data structures
    // Common fields: status, phone, session_id, message, etc.
    
    const {
      status,
      phone,
      session_id,
      verified,
      // Add other fields your platform sends
    } = data;

    // Log callback data for debugging
    console.log('Callback data:', {
      status,
      phone,
      session_id,
      verified,
    });

    // Store callback data in database or cache if needed
    // For example, you might want to update a verification status
    // await updateVerificationStatus(session_id, status);

    // Respond to the OTP platform
    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

// Some platforms might use GET for callbacks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  console.log('OTP Platform Callback (GET):', {
    status: searchParams.get('status'),
    phone: searchParams.get('phone'),
    session_id: searchParams.get('session_id'),
  });

  return NextResponse.json({
    success: true,
    message: 'Callback received',
  });
}
