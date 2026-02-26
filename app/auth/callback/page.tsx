'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Frontend callback URL: https://yourdomain.vercel.app/auth/callback
// Your OTP platform will redirect users here after verification

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');
    const error = searchParams.get('error');

    if (error) {
      // Handle error - redirect to login with error message
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (status === 'success' || status === 'verified') {
      // Verification successful - redirect to dashboard
      console.log('Phone verified:', phone);
      router.push('/');
    } else {
      // Unknown status - redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your phone number...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
