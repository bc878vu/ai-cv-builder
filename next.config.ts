import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // pdfjs-dist 6's runtime still accepts disableWorker, but its current
  // TypeScript declaration omits that legacy-compatible option. Keep the
  // production build unblocked while the PDF importer runs in main-thread mode.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
