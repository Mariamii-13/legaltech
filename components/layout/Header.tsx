'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-700">
          SmartDocs<span className="text-gray-400">.ge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/#templates" className="text-gray-600 hover:text-gray-900 transition-colors">Templates</Link>
          <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get Started</Link></Button>
        </div>
      </div>
    </header>
  );
}
