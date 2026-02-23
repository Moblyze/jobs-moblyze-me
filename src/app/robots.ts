import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/apply/',
    },
    sitemap: 'https://jobs.moblyze.me/sitemap.xml',
  };
}
