import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback & Reviews',
  description: 'Read public AI CV Builder reviews or leave your own rating and feedback.',
};

export default function FeedbackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
