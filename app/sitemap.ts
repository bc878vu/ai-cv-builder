import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ai-cv-builder-six.vercel.app';
  const pages = ['', '/about', '/projects', '/profile', '/contact', '/terms', '/privacy'];
  return pages.map((path, index) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.7,
  }));
}
