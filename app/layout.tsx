import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'SmartDocs.ge — Legal Documents Made Simple',
  description: 'Create legally-binding Georgian contracts in minutes. Labor contracts, NDAs, lease agreements and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={geist.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
