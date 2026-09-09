import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CV Builder',
  description: 'Build professional, ATS-friendly CVs with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Suspense fallback={<div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>Loading CV Builder…</div>}>{children}</Suspense></body></html>;
}
