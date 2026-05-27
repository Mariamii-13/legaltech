import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            SmartDocs<span className="text-gray-400">.ge</span>
          </Link>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join Georgia&apos;s legal document platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegisterForm />
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
