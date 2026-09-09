import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My CVs — Professional CV Workspace',
  description: 'Manage multiple professional CVs, switch templates and continue editing with AI CV Builder.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
