import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import ExportInterceptor from './export-interceptor';
import SiteChrome from './site-chrome';
import './globals.css';
import './public.css';
import './print.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-cv-builder-six.vercel.app'),
  title: { default: 'AI CV Builder — Professional ATS-Friendly Resume Builder', template: '%s | AI CV Builder' },
  description: 'Create professional, ATS-friendly CVs and resumes with AI writing, live A4 preview, professional templates, profile photos, PDF and Word export, and local CV import.',
  keywords: ['AI CV Builder', 'AI resume builder', 'CV maker', 'resume builder', 'ATS resume', 'professional CV', 'resume templates', 'CV PDF', 'CV DOCX', 'free CV builder'],
  applicationName: 'AI CV Builder',
  authors: [{ name: 'Asad Amanat Ali' }],
  creator: 'Asad Amanat Ali',
  publisher: 'AI CV Builder',
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { type: 'website', url: '/', title: 'AI CV Builder — Build a Professional CV with AI', description: 'Create ATS-friendly CVs with professional templates, AI writing, photo controls and PDF/DOCX export.', siteName: 'AI CV Builder' },
  twitter: { card: 'summary_large_image', title: 'AI CV Builder', description: 'Build professional ATS-friendly CVs with AI.' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#111827' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ExportInterceptor />
        <SiteChrome />
        <Suspense fallback={<div className="global-loading-fallback"><div className="loading-logo">CV</div><strong>AI CV Builder</strong><span>Preparing your workspace…</span></div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
