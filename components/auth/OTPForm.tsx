'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';

export function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function verify() {
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    // Mock: any 6-digit code works in Phase 1
    if (otp.length === 6) {
      router.push('/login?verified=true');
    } else {
      setError('Invalid or expired code');
    }
    setLoading(false);
  }

  async function resend() {
    setResendLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setResendLoading(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Verification code sent to
        </p>
        <p className="font-semibold text-blue-700 mt-1">{phone}</p>
      </div>
      <Input
        placeholder="000000"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
        className="text-center text-3xl tracking-[0.5em] font-mono h-14"
      />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      {resent && <p className="text-sm text-green-600 text-center">Code resent!</p>}
      <Button className="w-full" onClick={verify} disabled={loading || otp.length < 6}>
        {loading ? 'Verifying...' : 'Verify Phone Number'}
      </Button>
      <Button variant="ghost" className="w-full text-sm text-gray-500" onClick={resend} disabled={resendLoading}>
        {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
      </Button>
    </div>
  );
}
