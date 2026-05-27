'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, CreditCard, Settings, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'My Documents', icon: FileText },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="font-bold text-lg">
          SmartDocs<span className="text-gray-400">.ge</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Legal Documents Platform</p>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Document
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            G
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Giorgi Beridze</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white w-full rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
