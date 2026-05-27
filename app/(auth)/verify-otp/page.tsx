import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OTPForm } from '@/components/auth/OTPForm';
import Link from 'next/link';

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            SmartDocs<span className="text-gray-400">.ge</span>
          </Link>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Verify your phone</CardTitle>
            <CardDescription>Enter the 6-digit code we sent you</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>}>
              <OTPForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
