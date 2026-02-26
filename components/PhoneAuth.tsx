'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PhoneAuth() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Saudi format: 50 123 4567 (2-3-4 digits = 9 total)
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    // Limit to 9 digits max
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleSendOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Saudi numbers are exactly 9 digits (5XXXXXXXX)
    if (!phone || cleanPhone.length !== 9) {
      setError('Please enter a valid 9-digit Saudi phone number');
      return;
    }

    // Must start with 5
    if (!cleanPhone.startsWith('5')) {
      setError('Saudi mobile numbers must start with 5');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add country code if not present
      const phoneWithCountryCode = cleanPhone.startsWith('966') 
        ? cleanPhone 
        : `966${cleanPhone}`;

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneWithCountryCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSessionId(data.sessionId || '');
      setStep('otp');
      
      // Start 60 second countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      // Add country code if not present
      const phoneWithCountryCode = cleanPhone.startsWith('966') 
        ? cleanPhone 
        : `966${cleanPhone}`;

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneWithCountryCode,
          otp,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Success - redirect to dashboard
      router.push('/');
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div>
          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError('');
            }}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            ← Change number
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-4">
            Enter the OTP sent to <strong>{phone}</strong>
          </p>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OTP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.length < 4}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Verifying...
            </span>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-sm text-primary hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            +966
          </span>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="5X XXX XXXX"
            className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          We&apos;ll send you an OTP to verify your number
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSendOTP}
        disabled={loading || !phone}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Sending OTP...
          </span>
        ) : (
          'Send OTP'
        )}
      </button>
    </div>
  );
}
