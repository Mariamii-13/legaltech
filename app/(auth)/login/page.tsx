import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your SmartDocs.ge account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                No account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Create one free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
