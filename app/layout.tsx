import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CV Builder',
  description: 'Build professional, ATS-friendly CVs with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
