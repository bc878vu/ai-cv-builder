import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import ExportInterceptor from './export-interceptor';
import SiteChrome from './site-chrome';
import './globals.css';
import './public.css';
import './version.css';
import './editor-polish.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-cv-builder-six.vercel.app'),
  title: { default: 'AI CV Builder — Professional ATS-Friendly Resume Builder', template: '%s | AI CV Builder' },
  description: 'Create a professional CV with a live A4 editor, flexible templates, grounded AI writing, ATS analysis, local import and PDF or Word export.',
  keywords: ['AI CV Builder', 'resume builder', 'CV maker', 'ATS resume', 'professional CV', 'resume templates', 'CV PDF', 'CV DOCX'],
  applicationName: 'AI CV Builder',
  authors: [{ name: 'Asad Amanat Ali' }],
  creator: 'Asad Amanat Ali',
  publisher: 'AI CV Builder',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { type: 'website', url: '/', title: 'AI CV Builder — Build a Professional CV', description: 'Create, edit, tailor and export a professional CV with a live A4 workspace and practical AI assistance.', siteName: 'AI CV Builder', images: [{ url: '/icon.svg', width: 128, height: 128, alt: 'AI CV Builder' }] },
  twitter: { card: 'summary', title: 'AI CV Builder', description: 'Build a professional CV with templates, AI writing and live A4 editing.', images: ['/icon.svg'] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#111827' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ExportInterceptor /><SiteChrome /><Suspense fallback={<div className="global-loading-fallback"><div className="loading-logo">CV</div><strong>AI CV Builder</strong><span>Preparing your workspace…</span></div>}>{children}</Suspense></body></html>;
}
